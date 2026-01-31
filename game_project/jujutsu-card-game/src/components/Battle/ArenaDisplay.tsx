import { motion } from 'framer-motion';
import type { Arena } from '../../types';

interface ArenaDisplayProps {
  arena: Arena;
  size?: 'sm' | 'md' | 'lg';
}

export function ArenaDisplay({ arena, size = 'md' }: ArenaDisplayProps) {
  const sizes = {
    sm: { padding: 'p-2', title: 'text-sm', desc: 'text-xs' },
    md: { padding: 'p-4', title: 'text-lg', desc: 'text-sm' },
    lg: { padding: 'p-6', title: 'text-xl', desc: 'text-base' }
  };

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
