export type Language = 'ar' | 'en';

export type CommodityTier = 1 | 2 | 3 | 4;

export type CommodityCategory = 'agricultural' | 'raw' | 'industrial' | 'hightech';

export interface Commodity {
  id: string;
  name: string;
  nameAr: string;
  tier: CommodityTier;
  category: CommodityCategory;
  icon: string;
  basePrice: number;
  volatility: number;
  weightPerUnit: number; // tons per unit
  description: string;
  descriptionAr: string;
}

export interface City {
  id: string;
  name: string;
  nameAr: string;
  country: string;
  countryAr: string;
  region: 'MiddleEast' | 'Asia' | 'Europe' | 'Americas' | 'Africa';
  regionAr: string;
  coords: { x: number; y: number }; // percentage on map (0-100)
  taxRate: number; // e.g. 0.08 for 8%
  portEfficiency: number; // 0.8 - 1.5
  warehouseCapacity: number; // in tons
  warehouseUsed: number;
  warehouseInventory: Record<string, number>; // commodityId -> qty
  hasBranch: boolean;
  branchLevel: number;
  importDemand: Record<string, number>; // multiplier e.g. 1.4 = high demand (pays more)
  exportSupply: Record<string, number>; // multiplier e.g. 0.7 = high supply (cheaper)
  specialtyDescription: string;
  specialtyDescriptionAr: string;
}

export type ShipType = 'truck' | 'boat' | 'freighter' | 'container' | 'tanker' | 'plane';

export interface ShipModel {
  id: string;
  name: string;
  nameAr: string;
  type: ShipType;
  baseCost: number;
  capacity: number; // tons
  speedKnots: number; // base speed
  fuelPer1000Km: number; // in $
  maintenanceDaily: number;
  minLevelRequired: number;
  icon: string;
  description: string;
  descriptionAr: string;
}

export interface ShipUpgrade {
  engineLevel: number; // +15% speed per level
  holdExpansion: number; // +20% capacity per level
  fuelEfficiency: number; // -15% fuel cost per level
  securityInsurance: number; // reduces event risk
}

export interface AutoRoute {
  enabled: boolean;
  sourceCityId: string;
  targetCityId: string;
  buyCommodityId: string;
  sellCommodityId: string;
  minProfitMargin: number; // %
}

export interface PlayerShip {
  id: string;
  customName: string;
  modelId: string;
  capacity: number;
  currentCityId: string;
  destinationCityId: string | null;
  voyageStartTime: number | null; // timestamp ms
  voyageDurationMs: number; // total ms
  cargo: Record<string, number>; // commodityId -> quantity
  cargoUsed: number; // total weight
  status: 'docked' | 'transit' | 'maintenance';
  upgrades: ShipUpgrade;
  autoRoute?: AutoRoute;
  totalTripsCompleted: number;
  totalProfitGenerated: number;
}

export interface ProductionRecipe {
  id: string;
  name: string;
  nameAr: string;
  tier: CommodityTier;
  inputs: { commodityId: string; quantity: number }[];
  output: { commodityId: string; quantity: number };
  durationSeconds: number;
  facilityType: string;
  facilityTypeAr: string;
  setupCost: number;
  laborDailyCost: number;
  icon: string;
}

export interface PlayerFactory {
  id: string;
  cityId: string;
  recipeId: string;
  level: number;
  isProducing: boolean;
  cycleProgress: number; // 0 to 100
  cycleStartTimestamp: number;
  cyclesCompleted: number;
  autoRestart: boolean;
}

export interface MarketPrice {
  commodityId: string;
  currentPrice: number;
  previousPrice: number;
  basePrice: number;
  priceHistory: number[]; // recent 15 values
  change24hPercent: number;
  trend: 'up' | 'down' | 'stable';
  globalStockPiles: number;
}

export interface TradeContract {
  id: string;
  issuerName: string;
  issuerNameAr: string;
  issuerType: 'government' | 'megacorp' | 'alliance';
  commodityId: string;
  requiredQuantity: number;
  targetCityId: string;
  rewardCash: number;
  reputationReward: number;
  deadlineMinutes: number;
  createdAt: number;
  penaltyCash: number;
  minLevelRequired: number;
  status: 'available' | 'active' | 'completed' | 'failed';
  currentDelivered: number;
}

export interface CorporationStock {
  symbol: string;
  name: string;
  nameAr: string;
  sector: 'logistics' | 'manufacturing' | 'energy' | 'commodities' | 'tech';
  sectorAr: string;
  currentPrice: number;
  previousPrice: number;
  priceHistory: number[];
  dividendPerShare: number;
  marketCapMillions: number;
  playerShares: number;
  totalShares: number;
  growthRate: number;
}

export interface BankLoan {
  id: string;
  name: string;
  nameAr: string;
  principal: number;
  interestRateAnnual: number; // e.g. 0.07
  termDays: number;
  remainingDays: number;
  dailyInstallment: number;
  minReputation: number;
  isActive: boolean;
}

export interface WorldEvent {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  type: 'weather' | 'economic' | 'geopolitical' | 'tech';
  severity: 'low' | 'medium' | 'high';
  affectedRegions: string[];
  affectedCommodityIds: string[];
  priceMultiplier: number;
  durationSeconds: number;
  remainingSeconds: number;
  timestamp: number;
}

export interface Mission {
  id: string;
  order: number;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  rewardCash: number;
  rewardRep: number;
  type: 'cash' | 'trade_profit' | 'own_ships' | 'own_factories' | 'branches' | 'contracts' | 'reputation';
  targetValue: number;
  currentValue: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export interface LeaderboardPlayer {
  rank: number;
  name: string;
  companyName: string;
  countryFlag: string;
  netWorth: number;
  fleetCount: number;
  factoriesCount: number;
  tradeVolumeTons: number;
  reputation: number;
  isUser?: boolean;
}

export interface TradeAlliance {
  id: string;
  name: string;
  nameAr: string;
  tag: string;
  leader: string;
  membersCount: number;
  maxMembers: number;
  level: number;
  totalValuation: number;
  perksDescription: string;
  perksDescriptionAr: string;
  isJoined?: boolean;
}

export type ThemeType = 'tactical_navy' | 'golden_tycoon' | 'cyber_radar' | 'emerald_cargo';

export type ArchetypeType = 'merchant' | 'industrial' | 'courier' | 'mogul';

export type CompanyAvatarType = 'anchor' | 'ship' | 'falcon' | 'globe' | 'crown' | 'star' | 'compass' | 'shield';

export interface StartingSetupConfig {
  ceoName: string;
  companyName: string;
  companyAvatar: CompanyAvatarType;
  hqCityId: string;
  archetype: ArchetypeType;
  theme: ThemeType;
  difficulty: 'easy' | 'standard' | 'hardcore';
}

export interface SaveSlotInfo {
  slotId: number; // 1, 2, 3
  isEmpty: boolean;
  companyName?: string;
  ceoName?: string;
  companyAvatar?: CompanyAvatarType;
  archetype?: ArchetypeType;
  cash?: number;
  netWorth?: number;
  level?: number;
  hqCityId?: string;
  theme?: ThemeType;
  lastSavedTimestamp?: number;
  shipsCount?: number;
  factoriesCount?: number;
}

export interface GameSettings {
  language: Language;
  soundEnabled: boolean;
  gameSpeed: 1 | 2 | 5;
  isPaused: boolean;
  theme: ThemeType;
  companyAvatar?: CompanyAvatarType;
  autoSaveEnabled?: boolean;
}

export interface GameStats {
  totalRevenue: number;
  totalProfit: number;
  totalTonsMoved: number;
  totalTrades: number;
  totalContractsCompleted: number;
  startDate: number;
}

export type QuestTargetType =
  | 'buy_commodity'
  | 'dispatch_ship'
  | 'sell_commodity'
  | 'build_factory'
  | 'upgrade_ship'
  | 'accept_contract'
  | 'buy_shares'
  | 'open_branch';

export interface GuidedQuest {
  id: string;
  stepNumber: number;
  totalSteps: number;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  targetType: QuestTargetType;
  targetCount: number;
  currentCount: number;
  rewardCash: number;
  rewardExp: number;
  rewardRep: number;
  isCompleted: boolean;
  isClaimed: boolean;
  actionTab: 'map' | 'market' | 'fleet' | 'industry' | 'contracts' | 'finance';
  icon: string;
}

export interface EncounterChoice {
  id: string;
  labelEn: string;
  labelAr: string;
  descEn: string;
  descAr: string;
  successRate: number; // 0 to 1
  costCash?: number;
  costCargoUnits?: number;
  rewardCash?: number;
  rewardExp?: number;
  rewardRep?: number;
  rewardCommodityId?: string;
  rewardCommodityQty?: number;
  penaltyCash?: number;
  penaltyRep?: number;
  delayMinutes?: number;
  speedBoostMinutes?: number;
}

export interface InteractiveEncounter {
  id: string;
  shipId: string;
  shipName: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  type: 'distress' | 'trader' | 'pirates' | 'storm' | 'derelict' | 'customs';
  icon: string;
  choices: EncounterChoice[];
  createdAt: number;
}

export type SkillBranch = 'logistics' | 'commerce' | 'industry';

export interface SkillDefinition {
  id: string;
  branch: SkillBranch;
  tier: 1 | 2 | 3;
  nameEn: string;
  nameAr: string;
  descEn: string;
  descAr: string;
  icon: string;
  costPoints: number;
  prerequisiteId?: string;
  effects: {
    fleetSpeedBonusPercent?: number;
    fuelCostDiscountPercent?: number;
    cargoCapacityBonusPercent?: number;
    portTaxDiscountPercent?: number;
    marketPurchaseDiscountPercent?: number;
    warehouseCapacityBonusPercent?: number;
    factoryProductionSpeedBonusPercent?: number;
    contractRewardBonusPercent?: number;
    bankLoanRateDiscountPercent?: number;
  };
}


