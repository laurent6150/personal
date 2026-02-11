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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        ${sizes[size].padding} rounded-xl
        bg-gradient-to-r from-bg-card to-bg-secondary
        border border-white/10 text-center
      `}
    >
      {/* 카테고리 뱃지 */}
      {showCategory && categoryInfo && (
        <div className="flex justify-center mb-2">
          <span className={`
            ${sizes[size].badge} px-2 py-0.5 rounded-full
            ${arena.category === 'DOMAIN' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' :
              arena.category === 'SPECIAL' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
              'bg-blue-500/20 text-blue-400 border border-blue-500/30'}
          `}>
            {categoryInfo.icon} {categoryInfo.name}
          </span>
        </div>
      )}

      <h3 className={`${sizes[size].title} font-bold text-text-primary mb-1`}>
        {arena.name.ko}
      </h3>
      <p className={`${sizes[size].desc} text-text-secondary mb-2`}>
        {arena.description}
      </p>

      {/* 효과 목록 */}
      <div className="flex flex-wrap gap-2 justify-center">
        {arena.effects.map((effect, index) => (
          <span
            key={index}
            className={`
              ${sizes[size].desc} px-2 py-1 rounded-full
              ${effect.type === 'ATTRIBUTE_BOOST' ? 'bg-win/20 text-win' :
                effect.type === 'ATTRIBUTE_WEAKEN' ? 'bg-lose/20 text-lose' :
                effect.type === 'SPECIAL_RULE' ? 'bg-accent/20 text-accent' :
                'bg-white/10 text-text-secondary'}
            `}
          >
            {effect.description}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
