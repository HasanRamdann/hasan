import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  usernameToEmail,
  cleanUsernameKey,
  emailToUsername,
  User,
} from '../lib/firebase';
import { OnlineUserProfile, CloudSaveData, GlobalChatMessage } from '../types/game';
import { soundFx } from '../utils/audio';

interface AuthContextType {
  currentUser: User | null;
  userProfile: OnlineUserProfile | null;
  isAdmin: boolean;
  isLoadingAuth: boolean;
  isOnline: boolean;
  isSyncingCloud: boolean;
  isGuestSession: boolean;
  lastCloudSaveTime: string | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  setIsAuthModalOpen: (open: boolean) => void;
  setAuthModalMode: (mode: 'login' | 'register') => void;
  enterAsGuest: () => void;
  exitGuestSession: () => void;
  loginAsMasterAdmin: () => Promise<{ success: boolean; error?: string }>;
  registerWithUsername: (
    username: string,
    pass: string,
    company: string,
    ceo: string,
    avatar: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithUsername: (username: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logoutUser: () => Promise<void>;
  saveGameToCloud: (saveData: CloudSaveData) => Promise<{ success: boolean; error?: string }>;
  loadGameFromCloud: () => Promise<{ success: boolean; data?: CloudSaveData; error?: string }>;
  onlinePlayers: OnlineUserProfile[];
  globalChatMessages: GlobalChatMessage[];
  sendGlobalChatMessage: (text: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<OnlineUserProfile | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [lastCloudSaveTime, setLastCloudSaveTime] = useState<string | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isGuestSession, setIsGuestSession] = useState<boolean>(() => {
    return sessionStorage.getItem('trade_empire_guest_session') === 'true';
  });
  const [isAdminSession, setIsAdminSession] = useState<boolean>(() => {
    return sessionStorage.getItem('trade_empire_admin_session') === 'true';
  });

  const isAdmin = Boolean(
    isAdminSession ||
    userProfile?.isAdmin ||
    userProfile?.role === 'admin' ||
    userProfile?.username?.toLowerCase() === 'admin' ||
    currentUser?.email === 'admin@tradeempire.online' ||
    currentUser?.email === 'hasanramdan857@gmail.com'
  );

  const enterAsGuest = useCallback(() => {
    setIsGuestSession(true);
    sessionStorage.setItem('trade_empire_guest_session', 'true');
  }, []);

  const exitGuestSession = useCallback(() => {
    setIsGuestSession(false);
    setIsAdminSession(false);
    sessionStorage.removeItem('trade_empire_guest_session');
    sessionStorage.removeItem('trade_empire_admin_session');
  }, []);

  // Quick Master Admin Login
  const loginAsMasterAdmin = async (): Promise<{ success: boolean; error?: string }> => {
    const adminUsername = 'admin';
    const adminPassword = 'admin123456';
    const adminEmail = 'admin@tradeempire.online';

    try {
      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      } catch (signInErr: any) {
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/invalid-email') {
          // Auto create admin account if not existing yet
          userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        } else {
          throw signInErr;
        }
      }

      const uid = userCredential.user.uid;
      const adminProfile: OnlineUserProfile = {
        uid,
        username: 'admin',
        email: adminEmail,
        companyName: 'العاصمة الإمبراطورية العليا (Master HQ)',
        ceoName: 'القائد الأعلى (Supreme Admin)',
        avatar: 'crown',
        level: 99,
        netWorth: 9999999999,
        reputation: 1000,
        fleetCount: 25,
        isOnline: true,
        isAdmin: true,
        role: 'admin',
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(db, 'users', uid), adminProfile, { merge: true }).catch(() => {});
      setUserProfile(adminProfile);
      setIsAdminSession(true);
      sessionStorage.setItem('trade_empire_admin_session', 'true');
      soundFx.playReward();
      return { success: true };
    } catch (err: any) {
      console.warn('Firebase admin sign in notice:', err);
      // Fallback local admin god session
      const fallbackAdmin: OnlineUserProfile = {
        uid: 'master_admin_local_root',
        username: 'admin',
        email: adminEmail,
        companyName: 'العاصمة الإمبراطورية العليا (Master HQ)',
        ceoName: 'القائد الأعلى (Supreme Admin)',
        avatar: 'crown',
        level: 99,
        netWorth: 9999999999,
        reputation: 1000,
        fleetCount: 25,
        isOnline: true,
        isAdmin: true,
        role: 'admin',
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      setUserProfile(fallbackAdmin);
      setIsAdminSession(true);
      sessionStorage.setItem('trade_empire_admin_session', 'true');
      soundFx.playReward();
      return { success: true };
    }
  };

  const [onlinePlayers, setOnlinePlayers] = useState<OnlineUserProfile[]>([]);
  const [globalChatMessages, setGlobalChatMessages] = useState<GlobalChatMessage[]>([]);

  // Monitor network status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Listen to Auth State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as OnlineUserProfile;
            setUserProfile(data);
            // Update last login
            await updateDoc(userDocRef, {
              isOnline: true,
              lastLoginAt: new Date().toISOString(),
            });
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to Global Chat Messages
  useEffect(() => {
    try {
      const chatQuery = query(
        collection(db, 'global_chat'),
        orderBy('timestamp', 'desc'),
        limit(40)
      );

      const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
        const messages: GlobalChatMessage[] = [];
        snapshot.forEach((docSnap) => {
          const d = docSnap.data();
          messages.push({
            id: docSnap.id,
            senderId: d.senderId || 'unknown',
            senderUsername: d.senderUsername || 'Trader',
            senderCompany: d.senderCompany || 'Maritime Co',
            senderAvatar: d.senderAvatar || 'anchor',
            senderLevel: d.senderLevel || 1,
            text: d.text || '',
            timestamp: d.timestamp || Date.now(),
          });
        });
        setGlobalChatMessages(messages.reverse());
      }, (err) => {
        console.warn('Chat listener notice:', err);
      });

      return () => unsubscribeChat();
    } catch (err) {
      console.warn('Error setting up chat listener:', err);
    }
  }, []);

  // Register with Username & Password
  const registerWithUsername = async (
    rawUsername: string,
    pass: string,
    company: string,
    ceo: string,
    avatar: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const trimmedUsername = rawUsername.trim();
      if (trimmedUsername.length < 2) {
        return { success: false, error: 'اسم المستخدم يجب أن يتكون من حرفين على الأقل / Username must be at least 2 characters' };
      }
      if (pass.length < 6) {
        return { success: false, error: 'كلمة المرور يجب أن تكون 6 خانات على الأقل / Password must be at least 6 characters' };
      }

      const usernameKey = cleanUsernameKey(trimmedUsername);

      // Check if username already exists
      const usernameRef = doc(db, 'usernames', usernameKey);
      const usernameDoc = await getDoc(usernameRef);
      if (usernameDoc.exists()) {
        return { success: false, error: 'اسم المستخدم مسجل مسبقاً! يرجى اختيار اسم آخر أو تسجيل الدخول / Username already registered' };
      }

      const syntheticEmail = usernameToEmail(trimmedUsername);
      const userCredential = await createUserWithEmailAndPassword(auth, syntheticEmail, pass);
      const uid = userCredential.user.uid;

      const newProfile: OnlineUserProfile = {
        uid,
        username: trimmedUsername,
        email: syntheticEmail,
        companyName: company || `${trimmedUsername} Trading Co`,
        ceoName: ceo || trimmedUsername,
        avatar: avatar || 'anchor',
        level: 1,
        netWorth: 50000,
        reputation: 10,
        fleetCount: 1,
        isOnline: true,
        lastLoginAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      // Reserve username and create user document
      await setDoc(usernameRef, {
        uid,
        username: trimmedUsername,
        usernameKey,
        email: syntheticEmail,
        createdAt: new Date().toISOString(),
      });

      await setDoc(doc(db, 'users', uid), newProfile);
      setUserProfile(newProfile);

      soundFx.playReward();
      return { success: true };
    } catch (err: any) {
      console.error('Registration error:', err);
      let errMsg = err.message || 'Registration failed';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'اسم المستخدم أو البريد مسجل بالفعل، يرجى تسجيل الدخول / Username already registered. Please login.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'كلمة المرور ضعيفة، يرجى كتابة 6 خانات على الأقل / Password too weak.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'صيغة اسم المستخدم أو البريد غير صالحة / Invalid username or email format.';
      }
      return { success: false, error: errMsg };
    }
  };

  // Login with Username & Password
  const loginWithUsername = async (
    usernameOrEmail: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const trimmed = usernameOrEmail.trim();
      if (!trimmed) {
        return { success: false, error: 'يرجى إدخال اسم المستخدم أو البريد / Please enter username or email' };
      }
      if (!pass) {
        return { success: false, error: 'يرجى إدخال كلمة المرور / Please enter password' };
      }

      // Convert username or email to valid Firebase email
      const email = usernameToEmail(trimmed);

      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const uid = userCredential.user.uid;

      // Fetch user profile
      const userDocRef = doc(db, 'users', uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const profile = docSnap.data() as OnlineUserProfile;
        setUserProfile(profile);
        await updateDoc(userDocRef, {
          isOnline: true,
          lastLoginAt: new Date().toISOString(),
        });
      }

      soundFx.playSuccess();
      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      let errMsg = 'بيانات الدخول غير صحيحة، يرجى التحقق من اسم المستخدم وكلمة المرور';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        errMsg = 'اسم المستخدم أو كلمة المرور غير صحيحة / Incorrect username or password.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'صيغة اسم المستخدم أو البريد غير صالحة / Invalid email or username format.';
      } else if (err.code === 'auth/too-many-requests') {
        errMsg = 'تم حظر المحاولات مؤقتاً بسبب تكرار المحاولات الخاطئة. انتظر لحظات وحاول ثانية / Too many failed attempts. Try again later.';
      }
      return { success: false, error: errMsg };
    }
  };

  // Logout
  const logoutUser = async () => {
    try {
      if (currentUser) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, { isOnline: false }).catch(() => {});
      }
      await signOut(auth);
      setUserProfile(null);
      setCurrentUser(null);
      soundFx.playClick();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Save Game to Cloud
  const saveGameToCloud = async (saveData: CloudSaveData): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'Please login or register to save your empire to the cloud' };
    }

    try {
      setIsSyncingCloud(true);
      const saveDocRef = doc(db, 'saves', currentUser.uid);
      const timestamp = new Date().toISOString();

      const payload: CloudSaveData = {
        ...saveData,
        lastSavedAt: timestamp,
        savedByUid: currentUser.uid,
        savedByUsername: userProfile?.username || emailToUsername(currentUser.email || ''),
      };

      await setDoc(saveDocRef, payload);

      // Also update user profile level & net worth in users collection for leaderboard
      const calculatedNetWorth =
        saveData.cash +
        (saveData.bankBalance || 0) +
        saveData.ships.reduce((acc, s) => acc + (s.cargoUsed ? 50000 : 30000), 0) +
        (saveData.factories?.length || 0) * 100000;

      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        level: saveData.level,
        reputation: saveData.reputation,
        netWorth: calculatedNetWorth,
        fleetCount: saveData.ships.length,
        companyName: saveData.companyName,
        ceoName: saveData.ceoName,
        avatar: saveData.companyAvatar,
        lastLoginAt: timestamp,
      }).catch(() => {});

      setLastCloudSaveTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsSyncingCloud(false);
      return { success: true };
    } catch (err: any) {
      setIsSyncingCloud(false);
      console.error('Cloud save error:', err);
      return { success: false, error: err.message || 'Failed to save to cloud' };
    }
  };

  // Load Game from Cloud
  const loadGameFromCloud = async (): Promise<{ success: boolean; data?: CloudSaveData; error?: string }> => {
    if (!currentUser) {
      return { success: false, error: 'No user is currently logged in' };
    }

    try {
      setIsSyncingCloud(true);
      const saveDocRef = doc(db, 'saves', currentUser.uid);
      const docSnap = await getDoc(saveDocRef);

      if (!docSnap.exists()) {
        setIsSyncingCloud(false);
        return { success: false, error: 'No online save found for this account. Save your empire first!' };
      }

      const data = docSnap.data() as CloudSaveData;
      setLastCloudSaveTime(new Date(data.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsSyncingCloud(false);
      return { success: true, data };
    } catch (err: any) {
      setIsSyncingCloud(false);
      console.error('Cloud load error:', err);
      return { success: false, error: err.message || 'Failed to load cloud save' };
    }
  };

  // Send Global Live Trade Chat Message
  const sendGlobalChatMessage = async (text: string): Promise<boolean> => {
    if (!text.trim() || !currentUser) return false;

    try {
      const cleanText = text.trim().slice(0, 200);
      await addDoc(collection(db, 'global_chat'), {
        senderId: currentUser.uid,
        senderUsername: userProfile?.username || emailToUsername(currentUser.email || ''),
        senderCompany: userProfile?.companyName || 'Maritime Trading',
        senderAvatar: userProfile?.avatar || 'anchor',
        senderLevel: userProfile?.level || 1,
        text: cleanText,
        timestamp: Date.now(),
      });
      soundFx.playSend();
      return true;
    } catch (err) {
      console.error('Send chat error:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        isAdmin,
        isLoadingAuth,
        isOnline,
        isSyncingCloud,
        isGuestSession,
        lastCloudSaveTime,
        isAuthModalOpen,
        authModalMode,
        setIsAuthModalOpen,
        setAuthModalMode,
        enterAsGuest,
        exitGuestSession,
        loginAsMasterAdmin,
        registerWithUsername,
        loginWithUsername,
        logoutUser,
        saveGameToCloud,
        loadGameFromCloud,
        onlinePlayers,
        globalChatMessages,
        sendGlobalChatMessage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
