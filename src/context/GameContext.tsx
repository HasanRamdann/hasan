import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Language,
  City,
  Commodity,
  PlayerShip,
  ShipModel,
  ProductionRecipe,
  PlayerFactory,
  MarketPrice,
  TradeContract,
  CorporationStock,
  BankLoan,
  WorldEvent,
  Mission,
  TradeAlliance,
  LeaderboardPlayer,
  GameSettings,
  GameStats,
  ThemeType,
  ArchetypeType,
  CompanyAvatarType,
  StartingSetupConfig,
  SaveSlotInfo,
  GuidedQuest,
  QuestTargetType,
  InteractiveEncounter,
  EncounterChoice,
  SkillDefinition,
  SkillBranch,
} from '../types/game';
import {
  CITIES,
  COMMODITIES,
  SHIP_MODELS,
  PRODUCTION_RECIPES,
  INITIAL_CORPORATIONS,
  BANK_LOANS,
  INITIAL_MISSIONS,
  INITIAL_ALLIANCES,
  INITIAL_LEADERBOARD,
  INITIAL_WORLD_EVENTS,
  WORLD_EVENTS_POOL,
} from '../data/worldData';
import { INITIAL_GUIDED_QUESTS } from '../data/questData';
import { SKILL_TREE_DEFINITIONS } from '../data/skillData';
import { ENCOUNTER_TEMPLATES } from '../data/encounterData';
import { soundFx } from '../utils/audio';

const STORAGE_KEY = 'trade_empire_online_save_v1';
const SLOT_PREFIX = 'trade_empire_slot_';

export interface OfflineReport {
  elapsedSeconds: number;
  voyagesCompleted: number;
  factoriesProduced: number;
  totalOfflineRevenue: number;
  loansDeducted: number;
  eventsTriggered: number;
}

interface GameContextType {
  // Profile
  companyName: string;
  ceoName: string;
  companyAvatar: CompanyAvatarType;
  archetype: ArchetypeType;
  setCompanyName: (name: string) => void;
  setCeoName: (name: string) => void;
  setCompanyAvatar: (avatar: CompanyAvatarType) => void;
  cash: number;
  bankBalance: number;
  debt: number;
  level: number;
  exp: number;
  expToNextLevel: number;
  reputation: number;
  hqCityId: string;
  netWorth: number;

  // Static
  commodities: Commodity[];
  shipModels: ShipModel[];
  productionRecipes: ProductionRecipe[];

  // Dynamic state
  cities: Record<string, City>;
  ships: PlayerShip[];
  factories: PlayerFactory[];
  marketPrices: Record<string, MarketPrice>;
  activeContracts: TradeContract[];
  availableContracts: TradeContract[];
  stocks: CorporationStock[];
  loans: BankLoan[];
  worldEvents: WorldEvent[];
  missions: Mission[];
  alliances: TradeAlliance[];
  leaderboard: LeaderboardPlayer[];
  stats: GameStats;
  settings: GameSettings;
  activeTab: string;
  setActiveTab: (tab: string) => void;

  // Selected entities for modals & dialogs
  selectedCityId: string | null;
  setSelectedCityId: (id: string | null) => void;
  selectedShipId: string | null;
  setSelectedShipId: (id: string | null) => void;
  isHowToPlayOpen: boolean;
  setIsHowToPlayOpen: (open: boolean) => void;
  isNewPlayer: boolean;
  setIsNewPlayer: (val: boolean) => void;
  isSaveManagerOpen: boolean;
  setIsSaveManagerOpen: (val: boolean) => void;
  isThemeModalOpen: boolean;
  setIsThemeModalOpen: (val: boolean) => void;
  isSkillTreeOpen: boolean;
  setIsSkillTreeOpen: (val: boolean) => void;
  isQuestModalOpen: boolean;
  setIsQuestModalOpen: (val: boolean) => void;
  offlineReport: OfflineReport | null;
  clearOfflineReport: () => void;

  // Quests & Guidance
  guidedQuests: GuidedQuest[];
  claimQuestReward: (questId: string) => void;

  // CEO Skills & Perks
  skillPoints: number;
  unlockedSkills: string[];
  unlockSkill: (skillId: string) => boolean;

  // Naval Live Encounters
  activeEncounter: InteractiveEncounter | null;
  resolveEncounterChoice: (choiceId: string) => { success: boolean; rewardTextEn: string; rewardTextAr: string };

  // Auto-Save & Slot Management
  lastSavedTimestamp: number;
  lastSavedTimeText: string;
  isAutoSaving: boolean;
  currentSaveSlot: number;
  saveGameToSlot: (slotId?: number) => boolean;
  loadGameFromSlot: (slotId: number) => boolean;
  getSlotsSummary: () => SaveSlotInfo[];
  exportSaveData: () => string;
  importSaveData: (jsonStr: string) => boolean;
  applyStartingSetup: (config: StartingSetupConfig) => void;
  startNewGame: () => void;

  // Actions
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  buyCommodity: (cityId: string, commodityId: string, quantity: number, target: 'warehouse' | 'ship', shipId?: string) => boolean;
  sellCommodity: (cityId: string, commodityId: string, quantity: number, source: 'warehouse' | 'ship', shipId?: string) => boolean;
  dispatchShip: (shipId: string, destCityId: string) => boolean;
  buyShip: (modelId: string, customName?: string) => boolean;
  sellShip: (shipId: string) => boolean;
  upgradeShip: (shipId: string, upgradeType: 'engine' | 'hold' | 'fuel' | 'insurance') => boolean;
  setAutoRoute: (shipId: string, autoRoute?: PlayerShip['autoRoute']) => void;
  upgradeWarehouse: (cityId: string) => boolean;
  openBranch: (cityId: string) => boolean;
  buildFactory: (cityId: string, recipeId: string) => boolean;
  toggleFactory: (factoryId: string) => void;
  upgradeFactory: (factoryId: string) => boolean;
  acceptContract: (contractId: string) => boolean;
  deliverContract: (contractId: string, shipId?: string) => boolean;
  buyStock: (symbol: string, sharesCount: number) => boolean;
  sellStock: (symbol: string, sharesCount: number) => boolean;
  takeLoan: (loanId: string) => boolean;
  repayLoan: (loanId: string) => boolean;
  claimMissionReward: (missionId: string) => void;
  joinAlliance: (allianceId: string) => boolean;
  triggerWorldEvent: (customEvent?: Partial<WorldEvent>) => void;
  resetGame: () => void;
  addNotification: (msgEn: string, msgAr: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  notifications: Array<{ id: string; msgEn: string; msgAr: string; type: string; time: string }>;
  removeNotification: (id: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

// Helper to calculate geodesic/pixel distance between cities
export function calculateCityDistance(cityA: City, cityB: City): number {
  const dx = cityA.coords.x - cityB.coords.x;
  const dy = cityA.coords.y - cityB.coords.y;
  // Convert map percentage distance to nautical miles approx
  return Math.round(Math.sqrt(dx * dx + dy * dy) * 120);
}

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Company info
  const [companyName, setCompanyName] = useState('Nile Star Logistics');
  const [ceoName, setCeoName] = useState('Captain Hasan');
  const [companyAvatar, setCompanyAvatar] = useState<CompanyAvatarType>('anchor');
  const [archetype, setArchetype] = useState<ArchetypeType>('merchant');
  const [cash, setCash] = useState(50000);
  const [bankBalance, setBankBalance] = useState(0);
  const [debt, setDebt] = useState(0);
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [reputation, setReputation] = useState(10);
  const [hqCityId, setHqCityId] = useState('alexandria');

  // Active UI Tab & Dialog States
  const [activeTab, setActiveTab] = useState('command');
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isNewPlayer, setIsNewPlayer] = useState(false);
  const [isSaveManagerOpen, setIsSaveManagerOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isSkillTreeOpen, setIsSkillTreeOpen] = useState(false);
  const [isQuestModalOpen, setIsQuestModalOpen] = useState(false);
  const [offlineReport, setOfflineReport] = useState<OfflineReport | null>(null);

  // Quests & Guidance State
  const [guidedQuests, setGuidedQuests] = useState<GuidedQuest[]>(INITIAL_GUIDED_QUESTS);

  // CEO Talent & Skills State
  const [skillPoints, setSkillPoints] = useState<number>(2);
  const [unlockedSkills, setUnlockedSkills] = useState<string[]>([]);

  // Naval Live Encounters
  const [activeEncounter, setActiveEncounter] = useState<InteractiveEncounter | null>(null);
  const lastEncounterTimeRef = useRef<number>(Date.now());

  // Auto-Save and Slot Tracking
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<number>(Date.now());
  const [lastSavedTimeText, setLastSavedTimeText] = useState<string>('الآن');
  const [isAutoSaving, setIsAutoSaving] = useState<boolean>(false);
  const [currentSaveSlot, setCurrentSaveSlot] = useState<number>(1);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    language: 'ar',
    soundEnabled: true,
    gameSpeed: 1,
    isPaused: false,
    theme: 'tactical_navy',
    companyAvatar: 'anchor',
    autoSaveEnabled: true,
  });

  // Notifications
  const [notifications, setNotifications] = useState<Array<{ id: string; msgEn: string; msgAr: string; type: string; time: string }>>([
    {
      id: 'init_1',
      msgEn: 'Welcome to Trade Empire Online! Your maritime journey begins in Alexandria.',
      msgAr: 'مرحباً بك في إمبراطورية التجارة أونلاين! رحلتك تنطلق من ميناء الإسكندرية.',
      type: 'info',
      time: new Date().toLocaleTimeString(),
    },
  ]);

  const addNotification = useCallback((msgEn: string, msgAr: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const id = Date.now().toString() + Math.random().toString();
    setNotifications((prev) => [
      { id, msgEn, msgAr, type, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
      ...prev.slice(0, 9),
    ]);
    if (type === 'warning' || type === 'error') {
      soundFx.playAlert();
    }
    // Auto-remove notification after 5.5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 5500);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Auto-dismiss initial notification
  useEffect(() => {
    const timer = setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== 'init_1'));
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // Initialize Cities map
  const [cities, setCities] = useState<Record<string, City>>(() => {
    const map: Record<string, City> = {};
    CITIES.forEach((c) => {
      map[c.id] = { ...c, warehouseInventory: {} };
    });
    // Starter stock in Alexandria
    map['alexandria'].warehouseInventory['wheat'] = 20;
    map['alexandria'].warehouseUsed = 20;
    return map;
  });

  // Initialize Ships
  const [ships, setShips] = useState<PlayerShip[]>([
    {
      id: 'ship_starter_1',
      customName: 'Nile Arrow I',
      modelId: 'cargo_boat_coastal',
      capacity: 120,
      currentCityId: 'alexandria',
      destinationCityId: null,
      voyageStartTime: null,
      voyageDurationMs: 0,
      cargo: { wheat: 30 },
      cargoUsed: 30,
      status: 'docked',
      upgrades: { engineLevel: 0, holdExpansion: 0, fuelEfficiency: 0, securityInsurance: 0 },
      totalTripsCompleted: 0,
      totalProfitGenerated: 0,
    },
    {
      id: 'truck_starter_2',
      customName: 'Cairo Express Hauler',
      modelId: 'truck_logistics',
      capacity: 35,
      currentCityId: 'alexandria',
      destinationCityId: null,
      voyageStartTime: null,
      voyageDurationMs: 0,
      cargo: {},
      cargoUsed: 0,
      status: 'docked',
      upgrades: { engineLevel: 0, holdExpansion: 0, fuelEfficiency: 0, securityInsurance: 0 },
      totalTripsCompleted: 0,
      totalProfitGenerated: 0,
    },
  ]);

  // Initialize Factories
  const [factories, setFactories] = useState<PlayerFactory[]>([]);

  // Initialize Market Prices
  const [marketPrices, setMarketPrices] = useState<Record<string, MarketPrice>>(() => {
    const map: Record<string, MarketPrice> = {};
    COMMODITIES.forEach((c) => {
      map[c.id] = {
        commodityId: c.id,
        currentPrice: c.basePrice,
        previousPrice: c.basePrice,
        basePrice: c.basePrice,
        priceHistory: [c.basePrice * 0.98, c.basePrice * 1.02, c.basePrice * 0.99, c.basePrice],
        change24hPercent: 0,
        trend: 'stable',
        globalStockPiles: 50000,
      };
    });
    return map;
  });

  // Contracts
  const [availableContracts, setAvailableContracts] = useState<TradeContract[]>([
    {
      id: 'ct_1',
      issuerName: 'Alexandria Grain Reserve',
      issuerNameAr: 'هيئة صوامع ومخزون حبوب الإسكندرية',
      issuerType: 'government',
      commodityId: 'wheat',
      requiredQuantity: 60,
      targetCityId: 'alexandria',
      rewardCash: 18500,
      reputationReward: 12,
      deadlineMinutes: 15,
      createdAt: Date.now(),
      penaltyCash: 3500,
      minLevelRequired: 1,
      status: 'available',
      currentDelivered: 0,
    },
    {
      id: 'ct_2',
      issuerName: 'Santos Coffee Exporters Guild',
      issuerNameAr: 'نقابة مصدري بن سانتوس والبرازيل',
      issuerType: 'megacorp',
      commodityId: 'coffee',
      requiredQuantity: 50,
      targetCityId: 'rotterdam',
      rewardCash: 38000,
      reputationReward: 20,
      deadlineMinutes: 25,
      createdAt: Date.now(),
      penaltyCash: 8000,
      minLevelRequired: 2,
      status: 'available',
      currentDelivered: 0,
    },
    {
      id: 'ct_3',
      issuerName: 'Gulf Petroleum Refineries Corp',
      issuerNameAr: 'مؤسسة مصافي بترول الخليج',
      issuerType: 'megacorp',
      commodityId: 'fuel',
      requiredQuantity: 80,
      targetCityId: 'singapore',
      rewardCash: 95000,
      reputationReward: 35,
      deadlineMinutes: 30,
      createdAt: Date.now(),
      penaltyCash: 20000,
      minLevelRequired: 4,
      status: 'available',
      currentDelivered: 0,
    },
  ]);

  const [activeContracts, setActiveContracts] = useState<TradeContract[]>([]);
  const [stocks, setStocks] = useState<CorporationStock[]>(INITIAL_CORPORATIONS);
  const [loans, setLoans] = useState<BankLoan[]>(BANK_LOANS);
  const [worldEvents, setWorldEvents] = useState<WorldEvent[]>(INITIAL_WORLD_EVENTS);
  const [missions, setMissions] = useState<Mission[]>(INITIAL_MISSIONS);
  const [alliances, setAlliances] = useState<TradeAlliance[]>(INITIAL_ALLIANCES);
  const [leaderboard, setLeaderboard] = useState<LeaderboardPlayer[]>(INITIAL_LEADERBOARD);

  const [stats, setStats] = useState<GameStats>({
    totalRevenue: 0,
    totalProfit: 0,
    totalTonsMoved: 0,
    totalTrades: 0,
    totalContractsCompleted: 0,
    startDate: Date.now(),
  });

  const expToNextLevel = level * 1200;

  // Calculate Net Worth
  const calculateNetWorth = useCallback(() => {
    let shipsVal = 0;
    ships.forEach((s) => {
      const model = SHIP_MODELS.find((m) => m.id === s.modelId);
      if (model) shipsVal += model.baseCost;
    });

    let factoryVal = 0;
    factories.forEach((f) => {
      const rec = PRODUCTION_RECIPES.find((r) => r.id === f.recipeId);
      if (rec) factoryVal += rec.setupCost * f.level;
    });

    let stockVal = 0;
    stocks.forEach((st) => {
      stockVal += st.playerShares * st.currentPrice;
    });

    let inventoryVal = 0;
    (Object.values(cities) as City[]).forEach((c) => {
      Object.entries(c.warehouseInventory).forEach(([commId, qty]) => {
        const p = marketPrices[commId]?.currentPrice || 100;
        inventoryVal += Number(qty) * p;
      });
    });

    return Math.round(cash + bankBalance + shipsVal + factoryVal + stockVal + inventoryVal - debt);
  }, [cash, bankBalance, debt, ships, factories, stocks, cities, marketPrices]);

  const netWorth = calculateNetWorth();

  // Gain EXP and handle level up
  const addExp = useCallback(
    (amount: number) => {
      setExp((prev) => {
        const next = prev + amount;
        if (next >= expToNextLevel) {
          setLevel((lvl) => {
            const newLvl = lvl + 1;
            setSkillPoints((sp) => sp + 1);
            soundFx.playFanfare();
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
            addNotification(
              `Promoted to Level ${newLvl}! +1 CEO Skill Point earned!`,
              `ترقية إلى المستوى ${newLvl}! حصلت على +1 نقطة مهارة للرئيس التنفيذي!`,
              'success'
            );
            return newLvl;
          });
          return next - expToNextLevel;
        }
        return next;
      });
    },
    [expToNextLevel, addNotification]
  );

  // Track Quest Objective Progression
  const trackQuestProgress = useCallback(
    (targetType: QuestTargetType, count: number) => {
      setGuidedQuests((prevQuests) => {
        let changed = false;
        const nextQuests = prevQuests.map((quest) => {
          if (quest.isClaimed || quest.isCompleted) return quest;
          if (quest.targetType === targetType) {
            changed = true;
            const nextCount = quest.currentCount + count;
            const isNowCompleted = nextCount >= quest.targetCount;
            if (isNowCompleted && !quest.isCompleted) {
              soundFx.playCash();
              addNotification(
                `Quest Objective Completed: ${quest.titleEn}! Claim your rewards in the quest banner.`,
                `تم إكمال هدف المهمة: ${quest.titleAr}! استلم مكافأتك الآن من شريط المهام.`,
                'success'
              );
            }
            return {
              ...quest,
              currentCount: nextCount,
              isCompleted: isNowCompleted,
            };
          }
          return quest;
        });
        return changed ? nextQuests : prevQuests;
      });
    },
    [addNotification]
  );

  // Claim Quest Reward
  const claimQuestReward = useCallback(
    (questId: string) => {
      setGuidedQuests((prev) => {
        const quest = prev.find((q) => q.id === questId);
        if (!quest || quest.isClaimed || !quest.isCompleted) return prev;

        setCash((c) => c + quest.rewardCash);
        setReputation((r) => r + quest.rewardRep);
        addExp(quest.rewardExp);

        soundFx.playFanfare();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

        addNotification(
          `Claimed Reward: +$${quest.rewardCash.toLocaleString()} Cash, +${quest.rewardRep} Rep, +${quest.rewardExp} EXP!`,
          `تم استلام المكافأة: +$${quest.rewardCash.toLocaleString()} سيولة، +${quest.rewardRep} سمعة، +${quest.rewardExp} خبرة!`,
          'success'
        );

        return prev.map((q) => (q.id === questId ? { ...q, isClaimed: true } : q));
      });
    },
    [addExp, addNotification]
  );

  // Unlock CEO Talent Skill
  const unlockSkill = useCallback(
    (skillId: string): boolean => {
      const skill = SKILL_TREE_DEFINITIONS.find((s) => s.id === skillId);
      if (!skill) return false;
      if (unlockedSkills.includes(skillId)) return false;
      if (skillPoints < skill.costPoints) {
        addNotification('Not enough CEO talent points!', 'لا تملك نقاط مهارة كافية للتطوير!', 'warning');
        return false;
      }
      if (skill.prerequisiteId && !unlockedSkills.includes(skill.prerequisiteId)) {
        addNotification('Prerequisite skill not unlocked yet!', 'يجب فتح مهارة المستوى السابق أولاً!', 'warning');
        return false;
      }

      setSkillPoints((sp) => Math.max(0, sp - skill.costPoints));
      setUnlockedSkills((prev) => [...prev, skillId]);

      addNotification(
        `CEO Skill Mastered: ${skill.nameEn}! Permanent company perk active.`,
        `تم تفعيل مهارة الرئيس التنفيذي: ${skill.nameAr}! الميزة نشطة الآن بشكل دائم.`,
        'success'
      );
      return true;
    },
    [skillPoints, unlockedSkills, addNotification]
  );

  // Resolve Naval Live Encounter
  const resolveEncounterChoice = useCallback(
    (choiceId: string) => {
      if (!activeEncounter) {
        return { success: false, rewardTextEn: '', rewardTextAr: '' };
      }
      const choice = activeEncounter.choices.find((c) => c.id === choiceId);
      if (!choice) {
        setActiveEncounter(null);
        return { success: false, rewardTextEn: '', rewardTextAr: '' };
      }

      const roll = Math.random();
      const isSuccess = roll <= choice.successRate;

      if (choice.costCash) {
        setCash((c) => Math.max(0, c - (choice.costCash || 0)));
      }

      let textEn = '';
      let textAr = '';

      if (isSuccess) {
        if (choice.rewardCash) setCash((c) => c + choice.rewardCash!);
        if (choice.rewardRep) setReputation((r) => r + choice.rewardRep!);
        if (choice.rewardExp) addExp(choice.rewardExp!);

        textEn = `Operation executed with outstanding precision! Rewarded ${choice.rewardCash ? `+$${choice.rewardCash.toLocaleString()} Cash ` : ''}${choice.rewardRep ? `+${choice.rewardRep} Rep ` : ''}${choice.rewardExp ? `+${choice.rewardExp} EXP` : ''}.`;
        textAr = `تمت العملية بنجاح باهر وبأعلى كفاءة! حصلت على ${choice.rewardCash ? `+$${choice.rewardCash.toLocaleString()} سيولة ` : ''}${choice.rewardRep ? `+${choice.rewardRep} سمعة ` : ''}${choice.rewardExp ? `+${choice.rewardExp} خبرة` : ''}.`;
      } else {
        if (choice.penaltyCash) setCash((c) => Math.max(0, c - choice.penaltyCash!));
        if (choice.penaltyRep) setReputation((r) => Math.max(0, r - choice.penaltyRep!));

        textEn = `Unfavorable conditions led to minor complications. ${choice.penaltyCash ? `-$${choice.penaltyCash.toLocaleString()} in repairs.` : ''}`;
        textAr = `واجه الطاقم ظروفاً صعبة أدت لبعض التعقيدات. ${choice.penaltyCash ? `تم خصم -$${choice.penaltyCash.toLocaleString()} للإصلاحات.` : ''}`;
      }

      addNotification(
        isSuccess ? `Naval Encounter Success: ${activeEncounter.titleEn}` : `Naval Encounter Alert: ${activeEncounter.titleEn}`,
        isSuccess ? `نجاح الحدث البحري: ${activeEncounter.titleAr}` : `تنبيه الحدث البحري: ${activeEncounter.titleAr}`,
        isSuccess ? 'success' : 'warning'
      );

      setActiveEncounter(null);

      return {
        success: isSuccess,
        rewardTextEn: textEn,
        rewardTextAr: textAr,
      };
    },
    [activeEncounter, addExp, addNotification]
  );

  // Skill Bonus Multipliers
  const getFleetSpeedBonus = useCallback(() => {
    return unlockedSkills.includes('logistics_speed_1') ? 0.15 : 0;
  }, [unlockedSkills]);

  const getFuelDiscountBonus = useCallback(() => {
    return unlockedSkills.includes('logistics_fuel_2') ? 0.20 : 0;
  }, [unlockedSkills]);

  const getCargoCapacityBonus = useCallback(() => {
    return unlockedSkills.includes('logistics_capacity_3') ? 0.25 : 0;
  }, [unlockedSkills]);

  const getPortTaxDiscountBonus = useCallback(() => {
    return unlockedSkills.includes('commerce_tax_1') ? 0.35 : 0;
  }, [unlockedSkills]);

  const getMarketPurchaseDiscountBonus = useCallback(() => {
    return unlockedSkills.includes('commerce_discount_2') ? 0.08 : 0;
  }, [unlockedSkills]);

  const getWarehouseCapacityBonus = useCallback(() => {
    return unlockedSkills.includes('commerce_warehouse_3') ? 0.60 : 0;
  }, [unlockedSkills]);

  const getFactorySpeedBonus = useCallback(() => {
    return unlockedSkills.includes('industry_speed_1') ? 0.25 : 0;
  }, [unlockedSkills]);

  const getBankLoanRateDiscount = useCallback(() => {
    return unlockedSkills.includes('industry_loans_2') ? 0.40 : 0;
  }, [unlockedSkills]);

  const getContractRewardBonus = useCallback(() => {
    return unlockedSkills.includes('industry_contracts_3') ? 0.35 : 0;
  }, [unlockedSkills]);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<GameSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (newSettings.soundEnabled !== undefined) {
        soundFx.enabled = newSettings.soundEnabled;
      }
      return updated;
    });
  }, []);

  // Add notification wrapper
  const clearOfflineReport = useCallback(() => {
    setOfflineReport(null);
  }, []);

  // Save game to LocalStorage with slot support and auto-save indicator
  const saveGameToSlot = useCallback(
    (slotId: number = currentSaveSlot): boolean => {
      try {
        const now = Date.now();
        const saveObj = {
          version: 1,
          slotId,
          lastSavedTimestamp: now,
          companyName,
          ceoName,
          companyAvatar,
          archetype,
          cash,
          bankBalance,
          debt,
          level,
          exp,
          reputation,
          hqCityId,
          cities,
          ships,
          factories,
          marketPrices,
          availableContracts,
          activeContracts,
          stocks,
          loans,
          worldEvents,
          missions,
          alliances,
          stats,
          settings,
          guidedQuests,
          skillPoints,
          unlockedSkills,
        };
        const jsonStr = JSON.stringify(saveObj);
        // Save to active main storage and specific slot
        localStorage.setItem(STORAGE_KEY, jsonStr);
        localStorage.setItem(`${SLOT_PREFIX}${slotId}`, jsonStr);

        setLastSavedTimestamp(now);
        setLastSavedTimeText(
          new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        );

        // Flash auto-saving indicator
        setIsAutoSaving(true);
        setTimeout(() => setIsAutoSaving(false), 900);

        return true;
      } catch (err) {
        console.error('Save error:', err);
        return false;
      }
    },
    [
      currentSaveSlot,
      companyName,
      ceoName,
      companyAvatar,
      archetype,
      cash,
      bankBalance,
      debt,
      level,
      exp,
      reputation,
      hqCityId,
      cities,
      ships,
      factories,
      marketPrices,
      availableContracts,
      activeContracts,
      stocks,
      loans,
      worldEvents,
      missions,
      alliances,
      stats,
      settings,
      guidedQuests,
      skillPoints,
      unlockedSkills,
    ]
  );

  const saveGameState = useCallback(() => {
    saveGameToSlot(currentSaveSlot);
  }, [saveGameToSlot, currentSaveSlot]);

  // Load state from a given parsed save object
  const applyStateFromObject = useCallback((parsed: any) => {
    if (!parsed) return;
    if (parsed.companyName) setCompanyName(parsed.companyName);
    if (parsed.ceoName) setCeoName(parsed.ceoName);
    if (parsed.companyAvatar) setCompanyAvatar(parsed.companyAvatar);
    if (parsed.archetype) setArchetype(parsed.archetype);
    if (parsed.cash !== undefined) setCash(parsed.cash);
    if (parsed.bankBalance !== undefined) setBankBalance(parsed.bankBalance);
    if (parsed.debt !== undefined) setDebt(parsed.debt);
    if (parsed.level) setLevel(parsed.level);
    if (parsed.exp !== undefined) setExp(parsed.exp);
    if (parsed.reputation !== undefined) setReputation(parsed.reputation);
    if (parsed.hqCityId) setHqCityId(parsed.hqCityId);
    if (parsed.cities) setCities(parsed.cities);
    if (parsed.ships) setShips(parsed.ships);
    if (parsed.factories) setFactories(parsed.factories);
    if (parsed.marketPrices) setMarketPrices(parsed.marketPrices);
    if (parsed.availableContracts) setAvailableContracts(parsed.availableContracts);
    if (parsed.activeContracts) setActiveContracts(parsed.activeContracts);
    if (parsed.stocks) setStocks(parsed.stocks);
    if (parsed.loans) setLoans(parsed.loans);
    if (parsed.worldEvents) setWorldEvents(parsed.worldEvents);
    if (parsed.missions) setMissions(parsed.missions);
    if (parsed.alliances) setAlliances(parsed.alliances);
    if (parsed.stats) setStats(parsed.stats);
    if (parsed.guidedQuests) setGuidedQuests(parsed.guidedQuests);
    if (parsed.skillPoints !== undefined) setSkillPoints(parsed.skillPoints);
    if (parsed.unlockedSkills) setUnlockedSkills(parsed.unlockedSkills);
    if (parsed.settings) {
      setSettings(parsed.settings);
      soundFx.enabled = parsed.settings.soundEnabled ?? true;
    }
  }, []);

  // Load from a specific slot
  const loadGameFromSlot = useCallback(
    (slotId: number): boolean => {
      try {
        const raw = localStorage.getItem(`${SLOT_PREFIX}${slotId}`) || localStorage.getItem(STORAGE_KEY);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        applyStateFromObject(parsed);
        setCurrentSaveSlot(slotId);
        addNotification(
          `Loaded save slot ${slotId} successfully!`,
          `تم استرجاع وتحميل بيانات الفتحة رقم ${slotId} بنجاح!`,
          'success'
        );
        return true;
      } catch (err) {
        console.error('Load slot error:', err);
        return false;
      }
    },
    [applyStateFromObject, addNotification]
  );

  // Get summary of all 3 slots
  const getSlotsSummary = useCallback((): SaveSlotInfo[] => {
    const slots: SaveSlotInfo[] = [];
    for (let i = 1; i <= 3; i++) {
      try {
        const raw = localStorage.getItem(`${SLOT_PREFIX}${i}`);
        if (!raw) {
          slots.push({ slotId: i, companyName: '', ceoName: '', lastSavedTimestamp: 0, level: 1, cash: 0, netWorth: 0, shipsCount: 0, isEmpty: true });
        } else {
          const p = JSON.parse(raw);
          slots.push({
            slotId: i,
            companyName: p.companyName || `Company #${i}`,
            ceoName: p.ceoName || 'Captain',
            companyAvatar: p.companyAvatar || 'anchor',
            archetype: p.archetype || 'merchant',
            lastSavedTimestamp: p.lastSavedTimestamp || 0,
            level: p.level || 1,
            cash: p.cash || 0,
            netWorth: (p.cash || 0) + (p.bankBalance || 0),
            shipsCount: p.ships?.length || 0,
            isEmpty: false,
          });
        }
      } catch {
        slots.push({ slotId: i, companyName: '', ceoName: '', lastSavedTimestamp: 0, level: 1, cash: 0, netWorth: 0, shipsCount: 0, isEmpty: true });
      }
    }
    return slots;
  }, []);

  // Export save JSON string
  const exportSaveData = useCallback((): string => {
    const saveObj = {
      version: 1,
      slotId: currentSaveSlot,
      lastSavedTimestamp: Date.now(),
      companyName,
      ceoName,
      companyAvatar,
      archetype,
      cash,
      bankBalance,
      debt,
      level,
      exp,
      reputation,
      hqCityId,
      cities,
      ships,
      factories,
      marketPrices,
      availableContracts,
      activeContracts,
      stocks,
      loans,
      worldEvents,
      missions,
      alliances,
      stats,
      settings,
    };
    return JSON.stringify(saveObj, null, 2);
  }, [
    currentSaveSlot,
    companyName,
    ceoName,
    companyAvatar,
    archetype,
    cash,
    bankBalance,
    debt,
    level,
    exp,
    reputation,
    hqCityId,
    cities,
    ships,
    factories,
    marketPrices,
    availableContracts,
    activeContracts,
    stocks,
    loans,
    worldEvents,
    missions,
    alliances,
    stats,
    settings,
  ]);

  // Import save JSON string
  const importSaveData = useCallback(
    (jsonStr: string): boolean => {
      try {
        const parsed = JSON.parse(jsonStr);
        if (!parsed || typeof parsed !== 'object') {
          addNotification('Invalid save file format.', 'صيغة ملف الحفظ غير صالحة.', 'error');
          return false;
        }
        applyStateFromObject(parsed);
        soundFx.playFanfare();
        addNotification('Save file restored successfully!', 'تم استعادة ملف الحفظ بنجاح!', 'success');
        saveGameToSlot(currentSaveSlot);
        return true;
      } catch (err) {
        addNotification('Failed to read save JSON.', 'فشل في قراءة ملف الحفظ.', 'error');
        return false;
      }
    },
    [applyStateFromObject, saveGameToSlot, currentSaveSlot, addNotification]
  );

  // Apply Starting Setup Config (New Player / New Game Setup)
  const applyStartingSetup = useCallback(
    (config: StartingSetupConfig) => {
      setCompanyName(config.companyName);
      setCeoName(config.ceoName);
      setCompanyAvatar(config.companyAvatar);
      setArchetype(config.archetype);
      setHqCityId(config.hqCityId);

      // Base cash by difficulty
      let startingCash = 60000;
      let startingRep = 10;
      if (config.difficulty === 'easy') {
        startingCash = 100000;
        startingRep = 20;
      } else if (config.difficulty === 'hardcore') {
        startingCash = 30000;
        startingRep = 0;
      }

      // Archetype perks
      if (config.archetype === 'merchant') {
        startingCash += 15000;
      } else if (config.archetype === 'industrial') {
        startingCash += 35000;
      } else if (config.archetype === 'courier') {
        startingCash += 10000;
      } else if (config.archetype === 'mogul') {
        startingCash += 20000;
        setBankBalance(25000);
        startingRep += 15;
      }

      setCash(startingCash);
      setReputation(startingRep);
      setLevel(1);
      setExp(0);
      setDebt(0);

      // Update cities warehouse stock for chosen HQ
      setCities((prev) => {
        const next: Record<string, City> = {};
        Object.keys(prev).forEach((cId) => {
          const city = prev[cId];
          if (city) {
            next[cId] = {
              ...city,
              hasBranch: cId === config.hqCityId || city.hasBranch,
              warehouseInventory: {},
              warehouseUsed: 0,
            };
          }
        });
        // Give starting inventory in chosen HQ
        if (next[config.hqCityId]) {
          const starterCommodity = config.archetype === 'merchant' ? 'coffee' : 'wheat';
          const starterAmount = config.archetype === 'merchant' ? 35 : 20;
          next[config.hqCityId].warehouseInventory[starterCommodity] = starterAmount;
          next[config.hqCityId].warehouseUsed = starterAmount;
        }
        return next;
      });

      // Starter Ship Docked at Chosen HQ
      let starterShips: PlayerShip[] = [];
      if (config.archetype === 'courier') {
        starterShips = [
          {
            id: 'ship_starter_1',
            customName: `${config.companyName} Swift I`,
            modelId: 'feeder_container_ship',
            capacity: 90,
            status: 'docked',
            currentCityId: config.hqCityId,
            destinationCityId: null,
            voyageStartTime: null,
            voyageDurationMs: 0,
            cargo: {},
            cargoUsed: 0,
            upgrades: { engineLevel: 2, holdExpansion: 0, fuelEfficiency: 1, securityInsurance: 0 },
            totalTripsCompleted: 0,
            totalProfitGenerated: 0,
          },
          {
            id: 'ship_starter_2',
            customName: `${config.companyName} Swift II`,
            modelId: 'truck_logistics',
            capacity: 35,
            status: 'docked',
            currentCityId: config.hqCityId,
            destinationCityId: null,
            voyageStartTime: null,
            voyageDurationMs: 0,
            cargo: {},
            cargoUsed: 0,
            upgrades: { engineLevel: 1, holdExpansion: 0, fuelEfficiency: 0, securityInsurance: 0 },
            totalTripsCompleted: 0,
            totalProfitGenerated: 0,
          },
        ];
      } else if (config.archetype === 'merchant') {
        starterShips = [
          {
            id: 'ship_starter_1',
            customName: `${config.companyName} Ocean Titan`,
            modelId: 'cargo_boat_coastal',
            capacity: 150,
            status: 'docked',
            currentCityId: config.hqCityId,
            destinationCityId: null,
            voyageStartTime: null,
            voyageDurationMs: 0,
            cargo: { wheat: 30 },
            cargoUsed: 30,
            upgrades: { engineLevel: 0, holdExpansion: 2, fuelEfficiency: 0, securityInsurance: 0 },
            totalTripsCompleted: 0,
            totalProfitGenerated: 0,
          },
        ];
      } else {
        starterShips = [
          {
            id: 'ship_starter_1',
            customName: `${config.companyName} Flagship`,
            modelId: 'cargo_boat_coastal',
            capacity: 120,
            status: 'docked',
            currentCityId: config.hqCityId,
            destinationCityId: null,
            voyageStartTime: null,
            voyageDurationMs: 0,
            cargo: {},
            cargoUsed: 0,
            upgrades: { engineLevel: 0, holdExpansion: 0, fuelEfficiency: 0, securityInsurance: 0 },
            totalTripsCompleted: 0,
            totalProfitGenerated: 0,
          },
        ];
      }
      setShips(starterShips);

      // Apply chosen theme
      setSettings((prev) => ({
        ...prev,
        theme: config.theme,
        companyAvatar: config.companyAvatar,
      }));

      setIsNewPlayer(false);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}

      addNotification(
        `Welcome CEO ${config.ceoName}! ${config.companyName} has officially been founded in ${config.hqCityId.toUpperCase()}.`,
        `أهلاً بك أيها القبطان ${config.ceoName}! تأسست ${config.companyName} بنجاح في ميناء الانطلاق. بالتوفيق في تجارتك!`,
        'success'
      );
    },
    [addNotification]
  );

  // Start New Game trigger
  const startNewGame = useCallback(() => {
    setIsNewPlayer(true);
  }, []);

  // Load game & compute offline progress on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.lastSavedTimestamp) {
          applyStateFromObject(parsed);

          const elapsedSec = Math.floor((Date.now() - parsed.lastSavedTimestamp) / 1000);

          // Compute offline gains if player was away > 10 seconds (cap at 24 hours)
          if (elapsedSec >= 10) {
            const cappedSec = Math.min(elapsedSec, 86400);
            let voyagesFinished = 0;
            let offlineRevenue = 0;

            // Advance ships
            const updatedShips = (parsed.ships || []).map((s: PlayerShip) => {
              if (s.status === 'transit' && s.voyageStartTime) {
                const totalElapsed = Date.now() - s.voyageStartTime;
                if (totalElapsed >= s.voyageDurationMs && s.destinationCityId) {
                  voyagesFinished++;
                  offlineRevenue += 4500; // estimated bonus
                  return {
                    ...s,
                    currentCityId: s.destinationCityId,
                    destinationCityId: null,
                    voyageStartTime: null,
                    voyageDurationMs: 0,
                    status: 'docked' as const,
                    totalTripsCompleted: (s.totalTripsCompleted || 0) + 1,
                  };
                }
              }
              return s;
            });

            if (voyagesFinished > 0) {
              setShips(updatedShips);
              setCash((c) => c + offlineRevenue);
            }

            setOfflineReport({
              elapsedSeconds: cappedSec,
              voyagesCompleted: voyagesFinished,
              factoriesProduced: Math.floor(cappedSec / 60) * (parsed.factories?.length || 0),
              totalOfflineRevenue: offlineRevenue,
              loansDeducted: 0,
              eventsTriggered: Math.min(3, Math.floor(cappedSec / 300)),
            });
          }
        } else {
          // No save object found - prompt onboarding
          setIsNewPlayer(true);
        }
      } else {
        // First time visitor - prompt onboarding
        setIsNewPlayer(true);
      }
    } catch {
      setIsNewPlayer(true);
    }
  }, [applyStateFromObject]);

  // Periodic Auto-Save Every 12 seconds
  useEffect(() => {
    const saveInterval = setInterval(() => {
      if (settings.autoSaveEnabled !== false) {
        saveGameState();
      }
    }, 12000);
    return () => clearInterval(saveInterval);
  }, [saveGameState, settings.autoSaveEnabled]);

  // Main Game Simulation Tick Loop
  const tickRef = useRef<number>(0);
  useEffect(() => {
    if (settings.isPaused) return;

    const intervalMs = Math.max(200, 1000 / settings.gameSpeed);

    const timer = setInterval(() => {
      tickRef.current += 1;
      const now = Date.now();

      // 1. SHIP VOYAGE PROGRESSION & ARRIVALS
      setShips((prevShips) => {
        let changed = false;
        const nextShips = prevShips.map((ship) => {
          if (ship.status === 'transit' && ship.voyageStartTime && ship.destinationCityId) {
            const elapsed = now - ship.voyageStartTime;
            if (elapsed >= ship.voyageDurationMs) {
              changed = true;
              const destId = ship.destinationCityId;
              const destCity = cities[destId];

              // Handle Auto-route if enabled
              if (ship.autoRoute?.enabled && ship.autoRoute.sourceCityId && ship.autoRoute.targetCityId) {
                // Auto route logic will trigger trade
              }

              addNotification(
                `Ship "${ship.customName}" arrived safely at ${destCity?.name || destId}!`,
                `وصلت السفينة "${ship.customName}" بنجاح إلى ميناء ${destCity?.nameAr || destId}!`,
                'success'
              );
              soundFx.playCash();

              return {
                ...ship,
                currentCityId: destId,
                destinationCityId: null,
                voyageStartTime: null,
                voyageDurationMs: 0,
                status: 'docked' as const,
                totalTripsCompleted: ship.totalTripsCompleted + 1,
              };
            }
          }
          return ship;
        });
        return changed ? nextShips : prevShips;
      });

      // 1.5 CHECK NAVAL LIVE ENCOUNTER FOR SHIPS IN TRANSIT
      if (!activeEncounter && now - lastEncounterTimeRef.current > 35000) {
        const transitShips = ships.filter((s) => s.status === 'transit');
        if (transitShips.length > 0 && Math.random() < 0.08) {
          const pickedShip = transitShips[Math.floor(Math.random() * transitShips.length)];
          const template = ENCOUNTER_TEMPLATES[Math.floor(Math.random() * ENCOUNTER_TEMPLATES.length)];
          const newEncounter: InteractiveEncounter = {
            ...template,
            id: 'enc_' + Date.now(),
            shipId: pickedShip.id,
            shipName: pickedShip.customName,
            createdAt: now,
          };
          setActiveEncounter(newEncounter);
          lastEncounterTimeRef.current = now;
          soundFx.playAlert();
          addNotification(
            `Live Encounter: ${newEncounter.titleEn} (${pickedShip.customName})`,
            `حدث بحري تفاعلي: ${newEncounter.titleAr} (${pickedShip.customName})`,
            'warning'
          );
        }
      }

      // 2. FACTORY PRODUCTION PROGRESSION
      setFactories((prevFactories) => {
        if (prevFactories.length === 0) return prevFactories;
        return prevFactories.map((fac) => {
          if (!fac.isProducing) return fac;
          const recipe = PRODUCTION_RECIPES.find((r) => r.id === fac.recipeId);
          if (!recipe) return fac;

          const progressStep = (100 / recipe.durationSeconds) * settings.gameSpeed;
          const nextProgress = fac.cycleProgress + progressStep;

          if (nextProgress >= 100) {
            // Check if city warehouse has room and deliver output
            setCities((prevCities) => {
              const city = prevCities[fac.cityId];
              if (!city) return prevCities;

              const outId = recipe.output.commodityId;
              const outQty = recipe.output.quantity * fac.level;
              const comm = COMMODITIES.find((c) => c.id === outId);
              const addedWeight = outQty * (comm?.weightPerUnit || 1);

              if (city.warehouseUsed + addedWeight <= city.warehouseCapacity) {
                const currentStock = city.warehouseInventory[outId] || 0;
                return {
                  ...prevCities,
                  [fac.cityId]: {
                    ...city,
                    warehouseUsed: city.warehouseUsed + addedWeight,
                    warehouseInventory: {
                      ...city.warehouseInventory,
                      [outId]: currentStock + outQty,
                    },
                  },
                };
              }
              return prevCities;
            });

            addExp(35 * fac.level);
            addNotification(
              `Factory completed batch: +${recipe.output.quantity * fac.level} ${recipe.name}!`,
              `أكمل المصنع دفعة إنتاج: +${recipe.output.quantity * fac.level} ${recipe.nameAr}!`,
              'info'
            );

            return {
              ...fac,
              cycleProgress: 0,
              cyclesCompleted: fac.cyclesCompleted + 1,
              isProducing: fac.autoRestart,
            };
          }

          return { ...fac, cycleProgress: nextProgress };
        });
      });

      // 3. DYNAMIC MARKET SIMULATION (Every 4 ticks)
      if (tickRef.current % 4 === 0) {
        setMarketPrices((prevPrices) => {
          const updated: Record<string, MarketPrice> = {};
          COMMODITIES.forEach((comm) => {
            const currentObj = prevPrices[comm.id];
            if (!currentObj) return;

            // Random market Brownian drift with volatility
            const randomFactor = (Math.random() - 0.49) * comm.volatility * 0.08;

            // Check active world events
            let eventMultiplier = 1.0;
            worldEvents.forEach((ev) => {
              if (ev.affectedCommodityIds.includes(comm.id)) {
                eventMultiplier *= ev.priceMultiplier;
              }
            });

            const newPrice = Math.max(
              Math.round(comm.basePrice * 0.45),
              Math.round(currentObj.currentPrice * (1 + randomFactor) * (0.99 + 0.01 * eventMultiplier))
            );

            const change = Math.round(((newPrice - currentObj.basePrice) / currentObj.basePrice) * 100);
            const trend = newPrice > currentObj.currentPrice ? 'up' : newPrice < currentObj.currentPrice ? 'down' : 'stable';

            const newHistory = [...currentObj.priceHistory.slice(-14), newPrice];

            updated[comm.id] = {
              ...currentObj,
              previousPrice: currentObj.currentPrice,
              currentPrice: newPrice,
              change24hPercent: change,
              trend,
              priceHistory: newHistory,
            };
          });
          return updated;
        });

        // Update Stock prices
        setStocks((prevStocks) =>
          prevStocks.map((st) => {
            const rand = (Math.random() - 0.48) * 0.04;
            const newPrice = Math.max(10, Math.round((st.currentPrice * (1 + rand) + Number.EPSILON) * 10) / 10);
            return {
              ...st,
              previousPrice: st.currentPrice,
              currentPrice: newPrice,
              priceHistory: [...st.priceHistory.slice(-9), newPrice],
            };
          })
        );
      }

      // 4. WORLD EVENTS TIMER & DYNAMIC EVENT ROTATION
      if (tickRef.current % 5 === 0) {
        setWorldEvents((prevEvents) => {
          const updated = prevEvents
            .map((ev) => ({
              ...ev,
              remainingSeconds: ev.remainingSeconds - 5 * settings.gameSpeed,
            }))
            .filter((ev) => ev.remainingSeconds > 0);

          // If active events count is low, occasionally introduce a new global event from the dynamic pool
          if (updated.length < 3 && Math.random() < 0.25) {
            const available = WORLD_EVENTS_POOL.filter(
              (p) => !updated.some((e) => e.title === p.title)
            );
            if (available.length > 0) {
              const chosen = available[Math.floor(Math.random() * available.length)];
              const newEv: WorldEvent = {
                ...chosen,
                id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                remainingSeconds: chosen.durationSeconds,
                timestamp: Date.now(),
              };
              soundFx.playAlert();
              addNotification(
                `GLOBAL NEWS ALERT: ${newEv.title}! Market prices adjusting.`,
                `عاجل التجارة الدولية: ${newEv.titleAr}! تغيرات في أسعار السلع.`,
                'warning'
              );
              return [newEv, ...updated];
            }
          }
          return updated;
        });
      }

      // 5. UPDATE LEADERBOARD WITH PLAYER LIVE NET WORTH
      setLeaderboard((prev) => {
        const currentNW = calculateNetWorth();
        return prev.map((p) => {
          if (p.isUser) {
            return {
              ...p,
              companyName: companyName,
              netWorth: currentNW,
              fleetCount: ships.length,
              factoriesCount: factories.length,
              reputation: reputation,
              tradeVolumeTons: stats.totalTonsMoved,
            };
          }
          return p;
        });
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [settings.isPaused, settings.gameSpeed, cities, ships, factories, worldEvents, calculateNetWorth, companyName, reputation, stats.totalTonsMoved, addExp, addNotification]);

  // Check Mission Progress
  useEffect(() => {
    setMissions((prevMissions) =>
      prevMissions.map((m) => {
        if (m.isCompleted) return m;
        let currentVal = m.currentValue;

        if (m.type === 'trade_profit') currentVal = stats.totalProfit;
        if (m.type === 'own_ships') currentVal = ships.length;
        if (m.type === 'branches') currentVal = (Object.values(cities) as City[]).filter((c) => c.hasBranch).length;
        if (m.type === 'own_factories') currentVal = factories.length;
        if (m.type === 'contracts') currentVal = stats.totalContractsCompleted;
        if (m.type === 'cash') currentVal = cash;
        if (m.type === 'reputation') currentVal = reputation;

        const isCompleted = currentVal >= m.targetValue;
        if (isCompleted && !m.isCompleted) {
          soundFx.playFanfare();
          addNotification(
            `Mission Milestone Reached: "${m.title}"! Claim your reward.`,
            `تم إنجاز المهمة: "${m.titleAr}"! يمكنك استلام المكافأة الآن.`,
            'success'
          );
        }
        return { ...m, currentValue: currentVal, isCompleted };
      })
    );
  }, [stats.totalProfit, stats.totalContractsCompleted, ships.length, cities, factories.length, cash, reputation, addNotification]);

  // TRADING ACTION: BUY COMMODITY
  const buyCommodity = useCallback(
    (cityId: string, commodityId: string, quantity: number, target: 'warehouse' | 'ship', shipId?: string): boolean => {
      const city = cities[cityId];
      const comm = COMMODITIES.find((c) => c.id === commodityId);
      const marketPriceObj = marketPrices[commodityId];
      if (!city || !comm || !marketPriceObj || quantity <= 0) return false;

      // Price calculation considering city export supply discount and CEO skills
      const supplyMultiplier = city.exportSupply[commodityId] || 1.0;
      const discountMultiplier = 1 - getMarketPurchaseDiscountBonus();
      const unitPrice = Math.round(marketPriceObj.currentPrice * supplyMultiplier * discountMultiplier);
      const subtotal = unitPrice * quantity;
      const effectiveTaxRate = city.taxRate * (1 - getPortTaxDiscountBonus());
      const tax = Math.round(subtotal * effectiveTaxRate);
      const totalCost = subtotal + tax;

      if (cash < totalCost) {
        addNotification('Insufficient funds to purchase cargo!', 'الرصيد النقدي غير كافٍ لإتمام عملية الشراء!', 'error');
        return false;
      }

      const totalWeight = quantity * comm.weightPerUnit;

      if (target === 'warehouse') {
        const bonusCap = city.warehouseCapacity * (1 + getWarehouseCapacityBonus());
        if (city.warehouseUsed + totalWeight > bonusCap) {
          addNotification('Warehouse is at full capacity! Upgrade storage first.', 'المستودع ممتلئ! قم بترقية سعة المستودع أولاً.', 'warning');
          return false;
        }

        setCash((c) => c - totalCost);
        setCities((prev) => {
          const currentStock = prev[cityId].warehouseInventory[commodityId] || 0;
          return {
            ...prev,
            [cityId]: {
              ...prev[cityId],
              warehouseUsed: prev[cityId].warehouseUsed + totalWeight,
              warehouseInventory: {
                ...prev[cityId].warehouseInventory,
                [commodityId]: currentStock + quantity,
              },
            },
          };
        });
      } else if (target === 'ship' && shipId) {
        const ship = ships.find((s) => s.id === shipId);
        if (!ship) return false;
        if (ship.currentCityId !== cityId || ship.status !== 'docked') {
          addNotification('Ship is not docked in this port!', 'السفينة ليست راسية في هذا الميناء حالياً!', 'warning');
          return false;
        }

        const effectiveCapacity = ship.capacity * (1 + ship.upgrades.holdExpansion * 0.2 + getCargoCapacityBonus());
        if (ship.cargoUsed + totalWeight > effectiveCapacity) {
          addNotification('Cargo hold overloaded! Reduce quantity.', 'عنابر الشحن لا تتسع لهذه الكمية! قلل الحمولة.', 'warning');
          return false;
        }

        setCash((c) => c - totalCost);
        setShips((prev) =>
          prev.map((s) => {
            if (s.id === shipId) {
              const curCargo = s.cargo[commodityId] || 0;
              return {
                ...s,
                cargoUsed: s.cargoUsed + totalWeight,
                cargo: { ...s.cargo, [commodityId]: curCargo + quantity },
              };
            }
            return s;
          })
        );
      }

      soundFx.playCash();
      addNotification(
        `Purchased ${quantity}t ${comm.name} for $${totalCost.toLocaleString()}`,
        `تم شراء ${quantity} طن من ${comm.nameAr} بإجمالي $${totalCost.toLocaleString()}`,
        'success'
      );
      addExp(Math.max(10, Math.round(totalCost * 0.005)));
      trackQuestProgress('buy_commodity', quantity);
      return true;
    },
    [cities, marketPrices, cash, ships, addNotification, addExp, getMarketPurchaseDiscountBonus, getPortTaxDiscountBonus, getWarehouseCapacityBonus, getCargoCapacityBonus, trackQuestProgress]
  );

  // TRADING ACTION: SELL COMMODITY
  const sellCommodity = useCallback(
    (cityId: string, commodityId: string, quantity: number, source: 'warehouse' | 'ship', shipId?: string): boolean => {
      const city = cities[cityId];
      const comm = COMMODITIES.find((c) => c.id === commodityId);
      const marketPriceObj = marketPrices[commodityId];
      if (!city || !comm || !marketPriceObj || quantity <= 0) return false;

      // Price calculation considering city import demand bonus
      const demandMultiplier = city.importDemand[commodityId] || 1.0;
      const unitPrice = Math.round(marketPriceObj.currentPrice * demandMultiplier);
      const subtotal = unitPrice * quantity;
      const effectiveTaxRate = city.taxRate * (1 - getPortTaxDiscountBonus());
      const tax = Math.round(subtotal * effectiveTaxRate);
      const netRevenue = subtotal - tax;
      const totalWeight = quantity * comm.weightPerUnit;

      if (source === 'warehouse') {
        const currentStock = city.warehouseInventory[commodityId] || 0;
        if (currentStock < quantity) {
          addNotification('Not enough cargo in warehouse to sell!', 'الكمية المطلوبة غير متوفرة في المستودع!', 'warning');
          return false;
        }

        setCash((c) => c + netRevenue);
        setCities((prev) => {
          const nextStock = currentStock - quantity;
          const nextInv = { ...prev[cityId].warehouseInventory };
          if (nextStock <= 0) delete nextInv[commodityId];
          else nextInv[commodityId] = nextStock;

          return {
            ...prev,
            [cityId]: {
              ...prev[cityId],
              warehouseUsed: Math.max(0, prev[cityId].warehouseUsed - totalWeight),
              warehouseInventory: nextInv,
            },
          };
        });
      } else if (source === 'ship' && shipId) {
        const ship = ships.find((s) => s.id === shipId);
        if (!ship) return false;
        if (ship.currentCityId !== cityId || ship.status !== 'docked') {
          addNotification('Ship must be docked in this port to unload!', 'يجب أن تكون السفينة راسية في الميناء لتفريغ وبيع البضاعة!', 'warning');
          return false;
        }
        const currentShipCargo = ship.cargo[commodityId] || 0;
        if (currentShipCargo < quantity) {
          addNotification('Ship cargo does not have this quantity!', 'حمولة السفينة لا تحتوي على هذه الكمية!', 'warning');
          return false;
        }

        setCash((c) => c + netRevenue);
        setShips((prev) =>
          prev.map((s) => {
            if (s.id === shipId) {
              const nextCargoQty = currentShipCargo - quantity;
              const nextCargo = { ...s.cargo };
              if (nextCargoQty <= 0) delete nextCargo[commodityId];
              else nextCargo[commodityId] = nextCargoQty;

              return {
                ...s,
                cargoUsed: Math.max(0, s.cargoUsed - totalWeight),
                cargo: nextCargo,
                totalProfitGenerated: s.totalProfitGenerated + netRevenue,
              };
            }
            return s;
          })
        );
      }

      // Update statistics
      const estimatedCost = comm.basePrice * quantity;
      const profit = Math.max(0, netRevenue - estimatedCost);

      setStats((prev) => ({
        ...prev,
        totalRevenue: prev.totalRevenue + netRevenue,
        totalProfit: prev.totalProfit + profit,
        totalTonsMoved: prev.totalTonsMoved + totalWeight,
        totalTrades: prev.totalTrades + 1,
      }));

      soundFx.playCash();
      addNotification(
        `Sold ${quantity}t ${comm.name} for +$${netRevenue.toLocaleString()} (Net Profit: +$${profit.toLocaleString()})`,
        `تم بيع ${quantity} طن ${comm.nameAr} بمبلغ +$${netRevenue.toLocaleString()} (صافي الربح: +$${profit.toLocaleString()})`,
        'success'
      );
      addExp(Math.max(15, Math.round(netRevenue * 0.008)));
      trackQuestProgress('sell_commodity', quantity);
      return true;
    },
    [cities, marketPrices, ships, addNotification, addExp, getPortTaxDiscountBonus, trackQuestProgress]
  );

  // DISPATCH SHIP ON VOYAGE
  const dispatchShip = useCallback(
    (shipId: string, destCityId: string): boolean => {
      const ship = ships.find((s) => s.id === shipId);
      if (!ship || ship.status !== 'docked' || ship.currentCityId === destCityId) return false;

      const srcCity = cities[ship.currentCityId];
      const destCity = cities[destCityId];
      const model = SHIP_MODELS.find((m) => m.id === ship.modelId);
      if (!srcCity || !destCity || !model) return false;

      const distanceNm = calculateCityDistance(srcCity, destCity);
      const effectiveSpeed = model.speedKnots * (1 + ship.upgrades.engineLevel * 0.15 + getFleetSpeedBonus());

      // Duration formula in seconds (realistic yet engaging for browser sim)
      const durationSeconds = Math.max(10, Math.round((distanceNm / effectiveSpeed) * 3.2));
      const durationMs = (durationSeconds * 1000) / settings.gameSpeed;

      // Fuel Cost with CEO perks
      const fuelDiscount = (1 - ship.upgrades.fuelEfficiency * 0.15) * (1 - getFuelDiscountBonus());
      const fuelCost = Math.round((distanceNm / 1000) * model.fuelPer1000Km * fuelDiscount);

      if (cash < fuelCost) {
        addNotification('Not enough cash to pay voyage fuel and port clearance!', 'لا تملك سيولة كافية لدفع تكاليف وقود ورسوم إبحار الرحلة!', 'error');
        return false;
      }

      setCash((c) => c - fuelCost);
      setShips((prev) =>
        prev.map((s) => {
          if (s.id === shipId) {
            return {
              ...s,
              destinationCityId: destCityId,
              voyageStartTime: Date.now(),
              voyageDurationMs: durationMs,
              status: 'transit',
            };
          }
          return s;
        })
      );

      soundFx.playShipHorn();
      addNotification(
        `Vessel "${ship.customName}" set sail for ${destCity.name}! ETA: ${Math.round(durationSeconds)}s`,
        `أبحرت السفينة "${ship.customName}" متجهة نحو ${destCity.nameAr}! وقت الوصول: ${Math.round(durationSeconds)} ثانية`,
        'info'
      );
      trackQuestProgress('dispatch_ship', 1);
      return true;
    },
    [ships, cities, cash, settings.gameSpeed, addNotification, getFleetSpeedBonus, getFuelDiscountBonus, trackQuestProgress]
  );

  // BUY SHIP
  const buyShip = useCallback(
    (modelId: string, customName?: string): boolean => {
      const model = SHIP_MODELS.find((m) => m.id === modelId);
      if (!model) return false;

      if (level < model.minLevelRequired) {
        addNotification(`Requires Company Level ${model.minLevelRequired} to purchase!`, `يتطلب هذا الطراز مستوى شركة ${model.minLevelRequired} للشراء!`, 'warning');
        return false;
      }

      if (cash < model.baseCost) {
        addNotification('Insufficient funds to purchase vessel!', 'الرصيد النقدي لا يكفي لشراء هذه السفينة!', 'error');
        return false;
      }

      setCash((c) => c - model.baseCost);
      const newShip: PlayerShip = {
        id: 'ship_' + Date.now(),
        customName: customName || `${companyName.split(' ')[0]} ${model.name.split(' ')[0]} #${ships.length + 1}`,
        modelId,
        capacity: model.capacity,
        currentCityId: hqCityId,
        destinationCityId: null,
        voyageStartTime: null,
        voyageDurationMs: 0,
        cargo: {},
        cargoUsed: 0,
        status: 'docked',
        upgrades: { engineLevel: 0, holdExpansion: 0, fuelEfficiency: 0, securityInsurance: 0 },
        totalTripsCompleted: 0,
        totalProfitGenerated: 0,
      };

      setShips((prev) => [...prev, newShip]);
      soundFx.playShipHorn();
      addNotification(`Commissioned new vessel: ${newShip.customName}!`, `تم تدشين وسيلة نقل جديدة في الأسطول: ${newShip.customName}!`, 'success');
      addExp(250);
      setReputation((r) => r + 5);
      return true;
    },
    [level, cash, companyName, ships.length, hqCityId, addNotification, addExp]
  );

  // SELL SHIP
  const sellShip = useCallback(
    (shipId: string): boolean => {
      const ship = ships.find((s) => s.id === shipId);
      if (!ship || ship.status !== 'docked') return false;
      if (ships.length <= 1) {
        addNotification('You must keep at least 1 vessel in your fleet!', 'يجب الاحتفاظ بسفينة واحدة على الأقل في أسطولك التجاري!', 'warning');
        return false;
      }

      const model = SHIP_MODELS.find((m) => m.id === ship.modelId);
      const sellPrice = Math.round((model?.baseCost || 20000) * 0.7);

      setCash((c) => c + sellPrice);
      setShips((prev) => prev.filter((s) => s.id !== shipId));
      soundFx.playCash();
      addNotification(`Sold vessel for +$${sellPrice.toLocaleString()}`, `تم بيع السفينة واسترداد +$${sellPrice.toLocaleString()}`, 'info');
      return true;
    },
    [ships, addNotification]
  );

  // UPGRADE SHIP
  const upgradeShip = useCallback(
    (shipId: string, upgradeType: 'engine' | 'hold' | 'fuel' | 'insurance'): boolean => {
      const ship = ships.find((s) => s.id === shipId);
      if (!ship) return false;

      const currentLvl =
        upgradeType === 'engine'
          ? ship.upgrades.engineLevel
          : upgradeType === 'hold'
            ? ship.upgrades.holdExpansion
            : upgradeType === 'fuel'
              ? ship.upgrades.fuelEfficiency
              : ship.upgrades.securityInsurance;

      if (currentLvl >= 5) {
        addNotification('Max upgrade level reached!', 'تم الوصول للحد الأقصى من الترقية!', 'warning');
        return false;
      }

      const model = SHIP_MODELS.find((m) => m.id === ship.modelId);
      const cost = Math.round((model?.baseCost || 30000) * 0.18 * (currentLvl + 1));

      if (cash < cost) {
        addNotification('Insufficient funds for retrofit upgrade!', 'الرصيد لا يكفي لدفع تكلفة هذه الترقية!', 'error');
        return false;
      }

      setCash((c) => c - cost);
      setShips((prev) =>
        prev.map((s) => {
          if (s.id === shipId) {
            const nextUpgrades = { ...s.upgrades };
            if (upgradeType === 'engine') nextUpgrades.engineLevel += 1;
            if (upgradeType === 'hold') nextUpgrades.holdExpansion += 1;
            if (upgradeType === 'fuel') nextUpgrades.fuelEfficiency += 1;
            if (upgradeType === 'insurance') nextUpgrades.securityInsurance += 1;
            return { ...s, upgrades: nextUpgrades };
          }
          return s;
        })
      );

      soundFx.playCash();
      addNotification('Ship systems upgraded successfully!', 'تم ترقية وتحديث تجهيزات السفينة بنجاح!', 'success');
      addExp(100);
      trackQuestProgress('upgrade_ship', 1);
      return true;
    },
    [ships, cash, addNotification, addExp, trackQuestProgress]
  );

  // AUTO ROUTE SETUP
  const setAutoRoute = useCallback((shipId: string, autoRoute?: PlayerShip['autoRoute']) => {
    setShips((prev) =>
      prev.map((s) => {
        if (s.id === shipId) {
          return { ...s, autoRoute };
        }
        return s;
      })
    );
  }, []);

  // UPGRADE WAREHOUSE
  const upgradeWarehouse = useCallback(
    (cityId: string): boolean => {
      const city = cities[cityId];
      if (!city) return false;

      const upgradeCost = Math.round(city.warehouseCapacity * 120);
      if (cash < upgradeCost) {
        addNotification('Insufficient funds to expand warehouse!', 'الرصيد لا يكفي لتوسعة المستودع!', 'error');
        return false;
      }

      setCash((c) => c - upgradeCost);
      setCities((prev) => ({
        ...prev,
        [cityId]: {
          ...prev[cityId],
          warehouseCapacity: prev[cityId].warehouseCapacity + 150,
        },
      }));

      soundFx.playCash();
      addNotification(`Expanded ${city.name} warehouse to ${city.warehouseCapacity + 150}t!`, `تم توسعة مستودع ${city.nameAr} إلى ${city.warehouseCapacity + 150} طن!`, 'success');
      addExp(80);
      return true;
    },
    [cities, cash, addNotification, addExp]
  );

  // OPEN BRANCH IN CITY
  const openBranch = useCallback(
    (cityId: string): boolean => {
      const city = cities[cityId];
      if (!city || city.hasBranch) return false;

      const branchCost = 45000;
      if (cash < branchCost) {
        addNotification('Need $45,000 to open regional branch office!', 'يلزم $45,000 لافتتاح مكتب فرعي معتمد في هذه المدينة!', 'error');
        return false;
      }

      setCash((c) => c - branchCost);
      setCities((prev) => ({
        ...prev,
        [cityId]: {
          ...prev[cityId],
          hasBranch: true,
          branchLevel: 1,
          taxRate: Math.max(0.02, prev[cityId].taxRate * 0.75), // Tax reduction perk!
        },
      }));

      soundFx.playFanfare();
      addNotification(`Inaugurated new corporate branch in ${city.name}! Tax reduced.`, `تم تدشين مكتب فرع رسمي في ${city.nameAr}! تم تخفيض ضرائب الميناء.`, 'success');
      addExp(300);
      setReputation((r) => r + 15);
      return true;
    },
    [cities, cash, addNotification, addExp]
  );

  // BUILD FACTORY
  const buildFactory = useCallback(
    (cityId: string, recipeId: string): boolean => {
      const city = cities[cityId];
      const recipe = PRODUCTION_RECIPES.find((r) => r.id === recipeId);
      if (!city || !recipe) return false;

      if (!city.hasBranch && cityId !== hqCityId) {
        addNotification('Must establish a branch office in this city before building factories!', 'يجب افتتاح مكتب فرعي في هذه المدينة أولاً قبل تشييد المصانع!', 'warning');
        return false;
      }

      if (cash < recipe.setupCost) {
        addNotification('Insufficient capital for factory construction!', 'رأس المال غير كافٍ لإنشاء هذا المجمع الصناعي!', 'error');
        return false;
      }

      setCash((c) => c - recipe.setupCost);
      const newFactory: PlayerFactory = {
        id: 'fac_' + Date.now(),
        cityId,
        recipeId,
        level: 1,
        isProducing: true,
        cycleProgress: 0,
        cycleStartTimestamp: Date.now(),
        cyclesCompleted: 0,
        autoRestart: true,
      };

      setFactories((prev) => [...prev, newFactory]);
      soundFx.playFanfare();
      addNotification(`Commissioned ${recipe.name} in ${city.name}!`, `تم تشييد وتشغيل ${recipe.nameAr} في ميناء ${city.nameAr}!`, 'success');
      addExp(500);
      setReputation((r) => r + 20);
      trackQuestProgress('build_factory', 1);
      return true;
    },
    [cities, hqCityId, cash, addNotification, addExp, trackQuestProgress]
  );

  // TOGGLE FACTORY
  const toggleFactory = useCallback((factoryId: string) => {
    setFactories((prev) =>
      prev.map((f) => {
        if (f.id === factoryId) {
          return { ...f, isProducing: !f.isProducing };
        }
        return f;
      })
    );
  }, []);

  // UPGRADE FACTORY
  const upgradeFactory = useCallback(
    (factoryId: string): boolean => {
      const fac = factories.find((f) => f.id === factoryId);
      if (!fac) return false;
      const recipe = PRODUCTION_RECIPES.find((r) => r.id === fac.recipeId);
      if (!recipe) return false;

      const upgradeCost = Math.round(recipe.setupCost * 0.7 * (fac.level + 1));
      if (cash < upgradeCost) {
        addNotification('Insufficient funds for industrial line expansion!', 'الرصيد غير كافٍ لتوسعة خط الإنتاج الصناعي!', 'error');
        return false;
      }

      setCash((c) => c - upgradeCost);
      setFactories((prev) =>
        prev.map((f) => {
          if (f.id === factoryId) {
            return { ...f, level: f.level + 1 };
          }
          return f;
        })
      );

      soundFx.playCash();
      addNotification(`Factory upgraded to Level ${fac.level + 1}! Output doubled.`, `تمت ترقية المصنع للمستوى ${fac.level + 1}! تضاعفت الطاقة الإنتاجية.`, 'success');
      addExp(200);
      return true;
    },
    [factories, cash, addNotification, addExp]
  );

  // ACCEPT CONTRACT
  const acceptContract = useCallback(
    (contractId: string): boolean => {
      const contract = availableContracts.find((c) => c.id === contractId);
      if (!contract) return false;

      if (level < contract.minLevelRequired) {
        addNotification(`Requires Company Level ${contract.minLevelRequired}!`, `يتطلب هذا العقد مستوى شركة ${contract.minLevelRequired}!`, 'warning');
        return false;
      }

      setAvailableContracts((prev) => prev.filter((c) => c.id !== contractId));
      setActiveContracts((prev) => [...prev, { ...contract, status: 'active', createdAt: Date.now() }]);
      soundFx.playCash();
      addNotification(`Accepted contract for ${contract.requiredQuantity}t delivery!`, `تم توقيع العقد وقبول توريد ${contract.requiredQuantity} طن!`, 'info');
      trackQuestProgress('accept_contract', 1);
      return true;
    },
    [availableContracts, level, addNotification, trackQuestProgress]
  );

  // DELIVER CONTRACT
  const deliverContract = useCallback(
    (contractId: string, shipId?: string): boolean => {
      const contract = activeContracts.find((c) => c.id === contractId);
      if (!contract) return false;

      const targetCity = cities[contract.targetCityId];
      if (!targetCity) return false;

      // Check warehouse or ship stock
      let availableQty = targetCity.warehouseInventory[contract.commodityId] || 0;
      let usedShip: PlayerShip | undefined;

      if (shipId) {
        usedShip = ships.find((s) => s.id === shipId && s.currentCityId === contract.targetCityId && s.status === 'docked');
        if (usedShip) {
          availableQty += usedShip.cargo[contract.commodityId] || 0;
        }
      }

      const needed = contract.requiredQuantity - contract.currentDelivered;

      if (availableQty < needed) {
        addNotification(`Need ${needed}t at ${targetCity.name} port to complete!`, `تحتاج إلى توفير ${needed} طن في ميناء ${targetCity.nameAr} لإتمام العقد!`, 'warning');
        return false;
      }

      // Deduct from warehouse or ship
      let remainingToDeduct = needed;

      if (targetCity.warehouseInventory[contract.commodityId]) {
        const fromWarehouse = Math.min(targetCity.warehouseInventory[contract.commodityId], remainingToDeduct);
        setCities((prev) => {
          const nextStock = prev[contract.targetCityId].warehouseInventory[contract.commodityId] - fromWarehouse;
          const nextInv = { ...prev[contract.targetCityId].warehouseInventory };
          if (nextStock <= 0) delete nextInv[contract.commodityId];
          else nextInv[contract.commodityId] = nextStock;

          return {
            ...prev,
            [contract.targetCityId]: {
              ...prev[contract.targetCityId],
              warehouseUsed: Math.max(0, prev[contract.targetCityId].warehouseUsed - fromWarehouse),
              warehouseInventory: nextInv,
            },
          };
        });
        remainingToDeduct -= fromWarehouse;
      }

      if (remainingToDeduct > 0 && usedShip && usedShip.cargo[contract.commodityId]) {
        const fromShip = Math.min(usedShip.cargo[contract.commodityId], remainingToDeduct);
        setShips((prev) =>
          prev.map((s) => {
            if (s.id === usedShip?.id) {
              const nextCargo = { ...s.cargo };
              const nextVal = (nextCargo[contract.commodityId] || 0) - fromShip;
              if (nextVal <= 0) delete nextCargo[contract.commodityId];
              else nextCargo[contract.commodityId] = nextVal;
              return { ...s, cargo: nextCargo, cargoUsed: Math.max(0, s.cargoUsed - fromShip) };
            }
            return s;
          })
        );
      }

      // Fulfill contract with contract perk bonus!
      const bonusMulti = 1 + getContractRewardBonus();
      const finalRewardCash = Math.round(contract.rewardCash * bonusMulti);

      setCash((c) => c + finalRewardCash);
      setReputation((r) => r + contract.reputationReward);
      setActiveContracts((prev) => prev.filter((c) => c.id !== contractId));
      setStats((prev) => ({ ...prev, totalContractsCompleted: prev.totalContractsCompleted + 1 }));

      soundFx.playFanfare();
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
      addNotification(
        `Contract Fulfilled! Earned +$${finalRewardCash.toLocaleString()} and +${contract.reputationReward} Reputation ⭐`,
        `تم تسليم العقد بنجاح! ربحت +$${finalRewardCash.toLocaleString()} و +${contract.reputationReward} نقطة سمعة ⭐`,
        'success'
      );
      addExp(400);
      return true;
    },
    [activeContracts, cities, ships, addNotification, addExp, getContractRewardBonus]
  );

  // STOCK MARKET: BUY SHARES
  const buyStock = useCallback(
    (symbol: string, sharesCount: number): boolean => {
      const stock = stocks.find((s) => s.symbol === symbol);
      if (!stock || sharesCount <= 0) return false;

      const totalCost = Math.round(stock.currentPrice * sharesCount);
      if (cash < totalCost) {
        addNotification('Insufficient funds to buy shares!', 'الرصيد لا يكفي لشراء هذه الأسهم!', 'error');
        return false;
      }

      setCash((c) => c - totalCost);
      setStocks((prev) =>
        prev.map((st) => {
          if (st.symbol === symbol) {
            return { ...st, playerShares: st.playerShares + sharesCount };
          }
          return st;
        })
      );

      soundFx.playCash();
      addNotification(`Purchased ${sharesCount} shares of ${stock.name}!`, `تم شراء ${sharesCount} سهم في ${stock.nameAr}!`, 'success');
      return true;
    },
    [stocks, cash, addNotification]
  );

  // STOCK MARKET: SELL SHARES
  const sellStock = useCallback(
    (symbol: string, sharesCount: number): boolean => {
      const stock = stocks.find((s) => s.symbol === symbol);
      if (!stock || sharesCount <= 0 || stock.playerShares < sharesCount) return false;

      const totalRevenue = Math.round(stock.currentPrice * sharesCount);
      setCash((c) => c + totalRevenue);
      setStocks((prev) =>
        prev.map((st) => {
          if (st.symbol === symbol) {
            return { ...st, playerShares: st.playerShares - sharesCount };
          }
          return st;
        })
      );

      soundFx.playCash();
      addNotification(`Sold ${sharesCount} shares for +$${totalRevenue.toLocaleString()}!`, `تم بيع ${sharesCount} سهم بمبلغ +$${totalRevenue.toLocaleString()}!`, 'info');
      return true;
    },
    [stocks, addNotification]
  );

  // BANKING: TAKE LOAN
  const takeLoan = useCallback(
    (loanId: string): boolean => {
      const loan = loans.find((l) => l.id === loanId);
      if (!loan || loan.isActive) return false;

      if (reputation < loan.minReputation) {
        addNotification(`Requires at least ${loan.minReputation} Reputation points!`, `يتطلب هذا القرض سمعة تجارية ${loan.minReputation} نقطة على الأقل!`, 'warning');
        return false;
      }

      setCash((c) => c + loan.principal);
      setDebt((d) => d + loan.principal * (1 + loan.interestRateAnnual));
      setLoans((prev) =>
        prev.map((l) => {
          if (l.id === loanId) {
            return { ...l, isActive: true, remainingDays: l.termDays };
          }
          return l;
        })
      );

      soundFx.playCash();
      addNotification(`Bank approved loan: +$${loan.principal.toLocaleString()} credited!`, `وافق البنك على صرف القرض: تم إيداع +$${loan.principal.toLocaleString()}!`, 'success');
      return true;
    },
    [loans, reputation, addNotification]
  );

  // BANKING: REPAY LOAN
  const repayLoan = useCallback(
    (loanId: string): boolean => {
      const loan = loans.find((l) => l.id === loanId);
      if (!loan || !loan.isActive) return false;

      const totalPayoff = Math.round(loan.principal * (1 + loan.interestRateAnnual * 0.5));
      if (cash < totalPayoff) {
        addNotification('Insufficient funds to pay off loan in full!', 'الرصيد لا يكفي لسداد القرض بالكامل!', 'error');
        return false;
      }

      setCash((c) => c - totalPayoff);
      setDebt((d) => Math.max(0, d - totalPayoff));
      setLoans((prev) =>
        prev.map((l) => {
          if (l.id === loanId) {
            return { ...l, isActive: false, remainingDays: l.termDays };
          }
          return l;
        })
      );

      soundFx.playCash();
      addNotification('Loan fully settled and closed!', 'تم سداد القرض بالكامل وإبراء ذمة الشركة!', 'success');
      setReputation((r) => r + 10);
      return true;
    },
    [loans, cash, addNotification]
  );

  // CLAIM MISSION REWARD
  const claimMissionReward = useCallback(
    (missionId: string) => {
      const mission = missions.find((m) => m.id === missionId);
      if (!mission || !mission.isCompleted || mission.isClaimed) return;

      setCash((c) => c + mission.rewardCash);
      setReputation((r) => r + mission.rewardRep);
      setMissions((prev) =>
        prev.map((m) => {
          if (m.id === missionId) {
            return { ...m, isClaimed: true };
          }
          return m;
        })
      );

      soundFx.playFanfare();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
      addNotification(
        `Claimed Reward: +$${mission.rewardCash.toLocaleString()} and +${mission.rewardRep} Rep!`,
        `تم استلام المكافأة: +$${mission.rewardCash.toLocaleString()} و +${mission.rewardRep} سمعة!`,
        'success'
      );
      addExp(300);
    },
    [missions, addNotification, addExp]
  );

  // JOIN ALLIANCE
  const joinAlliance = useCallback(
    (allianceId: string): boolean => {
      setAlliances((prev) =>
        prev.map((al) => {
          if (al.id === allianceId) {
            return { ...al, isJoined: true, membersCount: al.membersCount + 1 };
          }
          return { ...al, isJoined: false };
        })
      );

      const target = alliances.find((a) => a.id === allianceId);
      soundFx.playFanfare();
      addNotification(`Joined Alliance: ${target?.name}! Alliance perks active.`, `انضممت إلى تحالف: ${target?.nameAr}! تم تفعيل مزايا التحالف.`, 'success');
      return true;
    },
    [alliances, addNotification]
  );

  // TRIGGER DYNAMIC WORLD EVENT
  const triggerWorldEvent = useCallback(
    (customEvent?: Partial<WorldEvent>) => {
      setWorldEvents((prev) => {
        let newEv: WorldEvent;
        if (customEvent && customEvent.title) {
          newEv = {
            id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            title: customEvent.title,
            titleAr: customEvent.titleAr || customEvent.title,
            description: customEvent.description || 'Major global market price shift announced.',
            descriptionAr: customEvent.descriptionAr || 'تغيرات كبرى في الأسعار العالمية.',
            type: customEvent.type || 'economic',
            severity: customEvent.severity || 'high',
            affectedRegions: customEvent.affectedRegions || ['Europe'],
            affectedCommodityIds: customEvent.affectedCommodityIds || ['electronics'],
            priceMultiplier: customEvent.priceMultiplier || 1.35,
            durationSeconds: customEvent.durationSeconds || 200,
            remainingSeconds: customEvent.durationSeconds || 200,
            timestamp: Date.now(),
          };
        } else {
          const available = WORLD_EVENTS_POOL.filter(
            (p) => !prev.some((e) => e.title === p.title)
          );
          const chosen = available.length > 0
            ? available[Math.floor(Math.random() * available.length)]
            : WORLD_EVENTS_POOL[Math.floor(Math.random() * WORLD_EVENTS_POOL.length)];

          newEv = {
            ...chosen,
            id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            remainingSeconds: chosen.durationSeconds,
            timestamp: Date.now(),
          };
        }

        soundFx.playAlert();
        addNotification(
          `BREAKING GLOBAL NEWS: ${newEv.title}!`,
          `عاجل الأسواق العالمية: ${newEv.titleAr}!`,
          'warning'
        );

        return [newEv, ...prev.slice(0, 4)];
      });
    },
    [addNotification]
  );

  // RESET GAME
  const resetGame = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }, []);

  return (
    <GameContext.Provider
      value={{
        companyName,
        ceoName,
        companyAvatar,
        archetype,
        setCompanyName,
        setCeoName,
        setCompanyAvatar,
        cash,
        bankBalance,
        debt,
        level,
        exp,
        expToNextLevel,
        reputation,
        hqCityId,
        netWorth,
        commodities: COMMODITIES,
        shipModels: SHIP_MODELS,
        productionRecipes: PRODUCTION_RECIPES,
        cities,
        ships,
        factories,
        marketPrices,
        activeContracts,
        availableContracts,
        stocks,
        loans,
        worldEvents,
        missions,
        alliances,
        leaderboard,
        stats,
        settings,
        activeTab,
        setActiveTab,
        selectedCityId,
        setSelectedCityId,
        selectedShipId,
        setSelectedShipId,
        isHowToPlayOpen,
        setIsHowToPlayOpen,
        isNewPlayer,
        setIsNewPlayer,
        isSaveManagerOpen,
        setIsSaveManagerOpen,
        isThemeModalOpen,
        setIsThemeModalOpen,
        isSkillTreeOpen,
        setIsSkillTreeOpen,
        isQuestModalOpen,
        setIsQuestModalOpen,
        offlineReport,
        clearOfflineReport,
        guidedQuests,
        claimQuestReward,
        skillPoints,
        unlockedSkills,
        unlockSkill,
        activeEncounter,
        resolveEncounterChoice,
        lastSavedTimestamp,
        lastSavedTimeText,
        isAutoSaving,
        currentSaveSlot,
        saveGameToSlot,
        loadGameFromSlot,
        getSlotsSummary,
        exportSaveData,
        importSaveData,
        applyStartingSetup,
        startNewGame,
        updateSettings,
        buyCommodity,
        sellCommodity,
        dispatchShip,
        buyShip,
        sellShip,
        upgradeShip,
        setAutoRoute,
        upgradeWarehouse,
        openBranch,
        buildFactory,
        toggleFactory,
        upgradeFactory,
        acceptContract,
        deliverContract,
        buyStock,
        sellStock,
        takeLoan,
        repayLoan,
        claimMissionReward,
        joinAlliance,
        triggerWorldEvent,
        resetGame,
        addNotification,
        notifications,
        removeNotification,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
