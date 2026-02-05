// ========================================
// 경기장 목록 컴포넌트 - 카테고리별 필터링
// ========================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_ARENAS, ARENA_CATEGORIES, ARENAS_BY_CATEGORY } from '../../data/arenas';
import type { Arena, ArenaCategory } from '../../types';

interface ArenaCatalogProps {
  onSelectArena?: (arena: Arena) => void;
  selectedArenaId?: string;
}

type FilterCategory = 'ALL' | ArenaCategory;

export function ArenaCatalog({ onSelectArena, selectedArenaId }: ArenaCatalogProps) {
  const [filter, setFilter] = useState<FilterCategory>('ALL');
  const [hoveredArena, setHoveredArena] = useState<Arena | null>(null);

  const filteredArenas = useMemo(() => {
    if (filter === 'ALL') return ALL_ARENAS;
    return ARENAS_BY_CATEGORY[filter];
  }, [filter]);

  const categoryTabs: { id: FilterCategory; name: string; icon: string; count: number }[] = [
    { id: 'ALL', name: '전체', icon: '🌐', count: ALL_ARENAS.length },
    { id: 'LOCATION', name: ARENA_CATEGORIES.LOCATION.name, icon: ARENA_CATEGORIES.LOCATION.icon, count: ARENAS_BY_CATEGORY.LOCATION.length },
    { id: 'DOMAIN', name: ARENA_CATEGORIES.DOMAIN.name, icon: ARENA_CATEGORIES.DOMAIN.icon, count: ARENAS_BY_CATEGORY.DOMAIN.length },
    { id: 'SPECIAL', name: ARENA_CATEGORIES.SPECIAL.name, icon: ARENA_CATEGORIES.SPECIAL.icon, count: ARENAS_BY_CATEGORY.SPECIAL.length }
  ];

  return (
    <div className="space-y-4">
      {/* 카테고리 필터 탭 */}
      <div className="flex flex-wrap gap-2 justify-center">
        {categoryTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              flex items-center gap-2
              ${filter === tab.id
                ? 'bg-accent text-white'
                : 'bg-bg-secondary text-text-secondary hover:text-text-primary hover:bg-bg-secondary/80'}
            `}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
            <span className="text-xs opacity-70">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* 경기장 그리드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto p-2">
        <AnimatePresence mode="popLayout">
          {filteredArenas.map((arena, index) => (
            <motion.div
              key={arena.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.03 }}
              onClick={() => onSelectArena?.(arena)}
              onMouseEnter={() => setHoveredArena(arena)}
              onMouseLeave={() => setHoveredArena(null)}
              className={`
                p-4 rounded-xl cursor-pointer transition-all
                ${selectedArenaId === arena.id
                  ? 'bg-accent/20 border-2 border-accent'
                  : 'bg-bg-card border border-white/10 hover:border-white/30'}
                ${hoveredArena?.id === arena.id ? 'ring-2 ring-accent/50' : ''}
              `}
            >
              {/* 카테고리 뱃지 */}
              <div className="flex items-center justify-between mb-2">
                <span className={`
                  text-xs px-2 py-0.5 rounded-full
                  ${arena.category === 'DOMAIN' ? 'bg-purple-500/20 text-purple-400' :
                    arena.category === 'SPECIAL' ? 'bg-orange-500/20 text-orange-400' :
                    'bg-blue-500/20 text-blue-400'}
                `}>
                  {ARENA_CATEGORIES[arena.category].icon} {ARENA_CATEGORIES[arena.category].name}
                </span>
              </div>

              {/* 경기장 정보 */}
              <h4 className="font-bold text-text-primary mb-1">{arena.name.ko}</h4>
              <p className="text-xs text-text-secondary mb-2 line-clamp-2">{arena.description}</p>

              {/* 효과 요약 */}
              <div className="flex flex-wrap gap-1">
                {arena.effects.slice(0, 2).map((effect, idx) => (
                  <span
                    key={idx}
                    className={`
                      text-[10px] px-1.5 py-0.5 rounded
                      ${effect.type === 'ATTRIBUTE_BOOST' ? 'bg-win/20 text-win' :
                        effect.type === 'ATTRIBUTE_WEAKEN' ? 'bg-lose/20 text-lose' :
                        effect.type === 'SPECIAL_RULE' ? 'bg-accent/20 text-accent' :
                        'bg-white/10 text-text-secondary'}
                    `}
                  >
                    {effect.description.length > 15
                      ? effect.description.substring(0, 15) + '...'
                      : effect.description}
                  </span>
                ))}
                {arena.effects.length > 2 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-text-secondary">
                    +{arena.effects.length - 2}
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* 선택된/호버된 경기장 상세 정보 */}
      <AnimatePresence>
        {hoveredArena && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 p-4 bg-bg-card rounded-xl border border-white/10 shadow-2xl z-50"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className={`
                text-sm px-2 py-0.5 rounded-full
                ${hoveredArena.category === 'DOMAIN' ? 'bg-purple-500/20 text-purple-400' :
                  hoveredArena.category === 'SPECIAL' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-blue-500/20 text-blue-400'}
              `}>
                {ARENA_CATEGORIES[hoveredArena.category].icon} {ARENA_CATEGORIES[hoveredArena.category].name}
              </span>
            </div>

            <h3 className="text-lg font-bold text-text-primary mb-1">{hoveredArena.name.ko}</h3>
            <p className="text-sm text-text-secondary mb-3">{hoveredArena.description}</p>

            <div className="space-y-2">
              <div className="text-xs text-text-secondary">경기장 효과:</div>
              {hoveredArena.effects.map((effect, idx) => (
                <div
                  key={idx}
                  className={`
                    text-sm px-3 py-2 rounded-lg
                    ${effect.type === 'ATTRIBUTE_BOOST' ? 'bg-win/10 text-win border border-win/20' :
                      effect.type === 'ATTRIBUTE_WEAKEN' ? 'bg-lose/10 text-lose border border-lose/20' :
                      effect.type === 'SPECIAL_RULE' ? 'bg-accent/10 text-accent border border-accent/20' :
                      'bg-white/5 text-text-secondary border border-white/10'}
                  `}
                >
                  {effect.description}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
