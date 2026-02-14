import { motion } from 'framer-motion';
import type { Arena } from '../../types';
import { ARENA_CATEGORIES } from '../../data/arenas';

interface ArenaDisplayProps {
  arena: Arena;
  size?: 'sm' | 'md' | 'lg';
  showCategory?: boolean;
}

export function ArenaDisplay({ arena, size = 'md', showCategory = true }: ArenaDisplayProps) {
  const sizes = {
    sm: { padding: 'p-2', title: 'text-sm', desc: 'text-xs', badge: 'text-xs' },
    md: { padding: 'p-4', title: 'text-lg', desc: 'text-sm', badge: 'text-sm' },
    lg: { padding: 'p-6', title: 'text-xl', desc: 'text-base', badge: 'text-base' }
  };

  const categoryInfo = ARENA_CATEGORIES[arena.category];

  return (
    <div className="w-full text-center">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`
          inline-block ${sizes[size].padding} rounded-lg
          bg-gradient-to-r from-purple-600 to-pink-600
          shadow-lg
        `}
      >
        {/* 카테고리 뱃지 */}
        {showCategory && categoryInfo && (
          <div className="flex justify-center mb-2">
            <span className={`
              ${sizes[size].badge} px-2 py-0.5 rounded-full
              bg-black/30 text-white/90 border border-white/20
            `}>
              {categoryInfo.icon} {categoryInfo.name}
            </span>
          </div>
        )}

        <h3 className={`${sizes[size].title} font-bold text-white mb-1`}>
          🏟️ {arena.name.ko}
        </h3>
        <p className={`${sizes[size].desc} text-white/80`}>
          {arena.effects.map(e => e.description).join(' / ')}
        </p>
      </motion.div>
    </div>
  );
}
