import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import { City, PlayerShip } from '../types/game';
import {
  Anchor,
  Ship,
  Navigation,
  Warehouse,
  Building2,
  TrendingUp,
  Percent,
  Search,
  Filter,
  Play,
  ArrowRight,
  Info,
  Clock,
  Layers,
  BookOpen,
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const WorldMapView: React.FC = () => {
  const {
    cities,
    ships,
    commodities,
    marketPrices,
    selectedCityId,
    setSelectedCityId,
    selectedShipId,
    setSelectedShipId,
    dispatchShip,
    settings,
    openBranch,
    upgradeWarehouse,
    setIsHowToPlayOpen,
  } = useGame();

  const isAr = settings.language === 'ar';
  const [regionFilter, setRegionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCity, setHoveredCity] = useState<City | null>(null);

  // Filter cities
  const cityList: City[] = (Object.values(cities) as City[]).filter((c) => {
    const matchesRegion = regionFilter === 'all' || c.region.toLowerCase() === regionFilter.toLowerCase();
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.nameAr.includes(searchQuery) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.countryAr.includes(searchQuery);
    return matchesRegion && matchesSearch;
  });

  const activeShip = ships.find((s) => s.id === selectedShipId) || ships[0];

  // Helper to compute ship current interpolated position in %
  const getShipCoords = (ship: PlayerShip) => {
    const srcCity = cities[ship.currentCityId];
    if (ship.status !== 'transit' || !ship.destinationCityId || !ship.voyageStartTime) {
      return srcCity ? { x: srcCity.coords.x, y: srcCity.coords.y } : { x: 50, y: 50 };
    }
    const destCity = cities[ship.destinationCityId];
    if (!srcCity || !destCity) return { x: 50, y: 50 };

    const elapsed = Date.now() - ship.voyageStartTime;
    const progress = Math.min(1, Math.max(0, elapsed / ship.voyageDurationMs));

    return {
      x: srcCity.coords.x + (destCity.coords.x - srcCity.coords.x) * progress,
      y: srcCity.coords.y + (destCity.coords.y - srcCity.coords.y) * progress,
      progress,
    };
  };

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Search & Region Filters */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={isAr ? 'بحث عن ميناء أو دولة...' : 'Search port or country...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 w-48 sm:w-60"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            {['all', 'MiddleEast', 'Asia', 'Europe', 'Americas', 'Africa'].map((r) => (
              <button
                key={r}
                onClick={() => {
                  soundFx.playClick();
                  setRegionFilter(r);
                }}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  regionFilter === r
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {r === 'all'
                  ? isAr
                    ? 'الكل'
                    : 'All'
                  : r === 'MiddleEast'
                    ? isAr
                      ? 'الشرق الأوسط'
                      : 'Middle East'
                    : r === 'Asia'
                      ? isAr
                        ? 'آسيا'
                        : 'Asia'
                      : r === 'Europe'
                        ? isAr
                          ? 'أوروبا'
                          : 'Europe'
                        : r === 'Americas'
                          ? isAr
                            ? 'الأمريكتان'
                            : 'Americas'
                          : isAr
                            ? 'أفريقيا'
                            : 'Africa'}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Fleet Quick Action & Guide Launcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => {
              soundFx.playClick();
              setIsHowToPlayOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all border border-amber-300 animate-pulse"
          >
            <BookOpen className="w-4 h-4 stroke-[2.5]" />
            <span>{isAr ? '📘 دليل كيف تلعب' : '📘 How to Play Guide'}</span>
          </button>

          <div className="text-xs text-slate-300 flex items-center gap-2">
            <span className="text-slate-400 hidden sm:inline">{isAr ? 'السفينة المحددة:' : 'Selected Vessel:'}</span>
            <select
              value={selectedShipId || activeShip?.id}
              onChange={(e) => {
                soundFx.playClick();
                setSelectedShipId(e.target.value);
              }}
              className="bg-slate-950 border border-slate-800 text-amber-300 font-semibold rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
            >
              {ships.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.customName} ({s.status === 'transit' ? (isAr ? 'في البحر' : 'In Transit') : isAr ? 'راسي' : 'Docked'})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* The Global Interactive SVG Map Canvas */}
      <div className="relative bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl min-h-[460px] sm:min-h-[580px] select-none">
        {/* Ocean Grid Background */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* SVG World Map Vector Art with Continents & Trade Lines */}
        <svg
          viewBox="0 0 1000 600"
          className="w-full h-full min-h-[460px] sm:min-h-[580px] object-cover"
          style={{ background: 'linear-gradient(180deg, #020617 0%, #082f49 50%, #020617 100%)' }}
        >
          {/* Latitude & Longitude Guidelines */}
          <line x1="0" y1="300" x2="1000" y2="300" stroke="#0369a1" strokeWidth="1" strokeDasharray="4 8" opacity="0.3" />
          <line x1="0" y1="150" x2="1000" y2="150" stroke="#0369a1" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.2" />
          <line x1="0" y1="450" x2="1000" y2="450" stroke="#0369a1" strokeWidth="0.5" strokeDasharray="2 6" opacity="0.2" />
          <line x1="500" y1="0" x2="500" y2="600" stroke="#0369a1" strokeWidth="1" strokeDasharray="4 8" opacity="0.3" />

          {/* Stylized Continents Outlines */}
          {/* North America */}
          <path
            d="M 120 120 Q 220 80 320 140 Q 300 240 280 280 Q 230 320 180 320 Q 140 280 120 200 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.5"
            opacity="0.8"
          />
          {/* South America */}
          <path
            d="M 270 320 Q 380 350 370 480 Q 350 560 300 560 Q 260 480 250 380 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.5"
            opacity="0.8"
          />
          {/* Europe */}
          <path
            d="M 460 140 Q 560 120 580 190 Q 530 250 480 240 Q 450 200 460 140 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.5"
            opacity="0.8"
          />
          {/* Africa */}
          <path
            d="M 460 250 Q 600 240 610 380 Q 580 520 530 520 Q 440 380 460 250 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.5"
            opacity="0.8"
          />
          {/* Asia */}
          <path
            d="M 580 140 Q 880 110 920 260 Q 840 380 720 360 Q 640 300 580 190 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.5"
            opacity="0.8"
          />
          {/* Australia & Oceania */}
          <path
            d="M 800 420 Q 920 420 900 520 Q 820 540 800 460 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.5"
            opacity="0.8"
          />

          {/* Active Maritime Shipping Routes (Drawn between Connected Ports) */}
          {/* Alexandria to Rotterdam via Med/Atlantic */}
          <path d="M 575 231 Q 500 220 505 171" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" fill="none" />
          {/* Alexandria to Dubai / Asia via Suez Canal & Red Sea */}
          <path d="M 575 231 Q 610 270 645 261" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" fill="none" />
          {/* Dubai to Singapore / Shanghai */}
          <path d="M 645 261 Q 720 320 795 342" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" fill="none" />
          <path d="M 795 342 Q 820 280 835 243" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" fill="none" />
          {/* Trans-Atlantic Route: Rotterdam to New York */}
          <path d="M 505 171 Q 400 150 285 201" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" fill="none" />
          {/* South America to Europe / Middle East: Santos to Alexandria */}
          <path d="M 370 408 Q 460 350 575 231" stroke="#f59e0b" strokeWidth="1.2" strokeDasharray="4 4" opacity="0.4" fill="none" />

          {/* Active Ship Travel Paths */}
          {ships.map((ship) => {
            if (ship.status !== 'transit' || !ship.destinationCityId) return null;
            const src = cities[ship.currentCityId];
            const dst = cities[ship.destinationCityId];
            if (!src || !dst) return null;

            const x1 = src.coords.x * 10;
            const y1 = src.coords.y * 6;
            const x2 = dst.coords.x * 10;
            const y2 = dst.coords.y * 6;

            return (
              <g key={ship.id}>
                {/* Glowing trajectory line */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#fbbf24"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
              </g>
            );
          })}

          {/* Render Active Animated Ships on Map */}
          {ships.map((ship) => {
            const coords = getShipCoords(ship);
            const posX = coords.x * 10;
            const posY = coords.y * 6;
            const isTransit = ship.status === 'transit';

            return (
              <g
                key={ship.id}
                transform={`translate(${posX}, ${posY})`}
                className="cursor-pointer transition-all duration-300"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedShipId(ship.id);
                }}
              >
                {/* Pulsing beacon if in transit */}
                {isTransit && (
                  <circle r="16" fill="rgba(245, 158, 11, 0.25)" className="animate-ping" />
                )}

                {/* Ship Icon Node */}
                <circle
                  r={isTransit ? '9' : '7'}
                  fill={isTransit ? '#f59e0b' : '#38bdf8'}
                  stroke="#020617"
                  strokeWidth="2"
                />
                <text
                  y="-12"
                  textAnchor="middle"
                  fill={isTransit ? '#fbbf24' : '#7dd3fc'}
                  fontSize="10"
                  fontWeight="bold"
                  className="drop-shadow"
                >
                  🚢 {ship.customName}
                </text>
              </g>
            );
          })}

          {/* Render Port Nodes */}
          {cityList.map((city) => {
            const posX = city.coords.x * 10;
            const posY = city.coords.y * 6;
            const isSelected = selectedCityId === city.id;
            const isHq = city.id === 'alexandria';
            const hasBranch = city.hasBranch;

            return (
              <g
                key={city.id}
                transform={`translate(${posX}, ${posY})`}
                className="cursor-pointer group"
                onClick={() => {
                  soundFx.playClick();
                  setSelectedCityId(city.id);
                }}
                onMouseEnter={() => setHoveredCity(city)}
                onMouseLeave={() => setHoveredCity(null)}
              >
                {/* Port Aura */}
                <circle
                  r={isSelected ? '14' : isHq ? '12' : hasBranch ? '10' : '7'}
                  fill={
                    isHq
                      ? 'rgba(234, 179, 8, 0.4)'
                      : hasBranch
                        ? 'rgba(56, 189, 248, 0.35)'
                        : isSelected
                          ? 'rgba(245, 158, 11, 0.5)'
                          : 'rgba(148, 163, 184, 0.2)'
                  }
                  className={isSelected || isHq ? 'animate-pulse' : ''}
                />

                {/* Core Port Node */}
                <circle
                  r={isHq ? '6' : hasBranch ? '5' : '4'}
                  fill={isHq ? '#eab308' : hasBranch ? '#38bdf8' : '#cbd5e1'}
                  stroke="#020617"
                  strokeWidth="1.5"
                />

                {/* Port Label */}
                <text
                  y="14"
                  textAnchor="middle"
                  fill={isHq ? '#fde047' : hasBranch ? '#7dd3fc' : '#94a3b8'}
                  fontSize="10"
                  fontWeight={isSelected || isHq || hasBranch ? 'bold' : 'normal'}
                  className="pointer-events-none drop-shadow-md select-none"
                >
                  {isAr ? city.nameAr : city.name}
                  {isHq ? ' (HQ)' : ''}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Quick Info Card on Hover or Selection */}
        {hoveredCity && (
          <div
            className={`absolute bottom-4 ${
              isAr ? 'left-4' : 'right-4'
            } bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md max-w-sm w-full z-20 animate-fade-in`}
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2.5 mb-3">
              <div>
                <div className="flex items-center gap-1.5">
                  <Anchor className="w-4 h-4 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">{isAr ? hoveredCity.nameAr : hoveredCity.name}</h3>
                </div>
                <p className="text-xs text-slate-400">
                  {isAr ? hoveredCity.countryAr : hoveredCity.country} • {isAr ? hoveredCity.regionAr : hoveredCity.region}
                </p>
              </div>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  hoveredCity.hasBranch
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {hoveredCity.hasBranch ? (isAr ? 'فرع معتمد' : 'Branch Active') : isAr ? 'ميناء عام' : 'Public Port'}
              </span>
            </div>

            <p className="text-xs text-slate-300 mb-3 italic leading-relaxed">
              {isAr ? hoveredCity.specialtyDescriptionAr : hoveredCity.specialtyDescription}
            </p>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Warehouse className="w-3 h-3 text-amber-400" />
                  {isAr ? 'سعة المستودع' : 'Warehouse'}
                </div>
                <div className="font-bold text-slate-200 mt-0.5">
                  {hoveredCity.warehouseUsed} / {hoveredCity.warehouseCapacity} tons
                </div>
              </div>
              <div className="bg-slate-950 p-2 rounded-xl border border-slate-800">
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Percent className="w-3 h-3 text-indigo-400" />
                  {isAr ? 'ضريبة الميناء' : 'Port Tax'}
                </div>
                <div className="font-bold text-slate-200 mt-0.5">{Math.round(hoveredCity.taxRate * 100)}%</div>
              </div>
            </div>

            {/* Quick Action Button to Open Port Details */}
            <button
              onClick={() => {
                soundFx.playClick();
                setSelectedCityId(hoveredCity.id);
              }}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <span>{isAr ? 'فتح سوق ومستودع الميناء' : 'Open Port Trade Terminal'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Active Fleet Quick Voyage Dispatcher Deck */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Ship className="w-5 h-5 text-amber-400" />
            <h2 className="font-bold text-sm text-white">
              {isAr ? 'لوحة إبحار وتوجيه الأسطول' : 'Fleet Voyage Command & Dispatch'}
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            {ships.filter((s) => s.status === 'transit').length} {isAr ? 'سفن في البحر' : 'ships sailing'} / {ships.length}{' '}
            {isAr ? 'إجمالي الأسطول' : 'total'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {ships.map((ship) => {
            const currentCity = cities[ship.currentCityId];
            const destCity = ship.destinationCityId ? cities[ship.destinationCityId] : null;
            const isTransit = ship.status === 'transit';
            const elapsed = ship.voyageStartTime ? Date.now() - ship.voyageStartTime : 0;
            const progress = isTransit ? Math.min(100, Math.round((elapsed / ship.voyageDurationMs) * 100)) : 0;
            const remainingSec = isTransit ? Math.max(0, Math.round((ship.voyageDurationMs - elapsed) / 1000)) : 0;

            return (
              <div
                key={ship.id}
                className={`p-3 rounded-2xl border transition-all ${
                  selectedShipId === ship.id
                    ? 'bg-slate-800/80 border-amber-500/60 shadow-lg shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
                      <span>🚢</span>
                      {ship.customName}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {isAr ? 'الحمولة:' : 'Cargo:'} {ship.cargoUsed} / {ship.capacity} tons
                    </p>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isTransit
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {isTransit ? (isAr ? 'في عرض البحر' : 'Sailing') : isAr ? 'راسي بالميناء' : 'Docked'}
                  </span>
                </div>

                {/* Status / Destination */}
                <div className="text-xs text-slate-300 mb-2.5">
                  {isTransit && destCity ? (
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                        <span>{isAr ? currentCity?.nameAr : currentCity?.name}</span>
                        <span className="text-amber-400 font-bold">{remainingSec}s ETA</span>
                        <span>{isAr ? destCity.nameAr : destCity.name}</span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Anchor className="w-3.5 h-3.5 text-blue-400" />
                      <span>
                        {isAr ? 'الموقع الحالي:' : 'Current Port:'}{' '}
                        <strong className="text-slate-200">{isAr ? currentCity?.nameAr : currentCity?.name}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Dispatch Selector if Docked */}
                {!isTransit && (
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
                    <select
                      id={`dispatch-select-${ship.id}`}
                      defaultValue=""
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      <option value="" disabled>
                        {isAr ? 'اختر وجهة الإبحار...' : 'Select Destination...'}
                      </option>
                      {(Object.values(cities) as City[])
                        .filter((c) => c.id !== ship.currentCityId)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {isAr ? c.nameAr : c.name} ({isAr ? c.countryAr : c.country})
                          </option>
                        ))}
                    </select>

                    <button
                      onClick={() => {
                        const selectEl = document.getElementById(`dispatch-select-${ship.id}`) as HTMLSelectElement;
                        if (selectEl && selectEl.value) {
                          dispatchShip(ship.id, selectEl.value);
                        }
                      }}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-colors flex items-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isAr ? 'إبحار' : 'Sail'}</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
