import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { GradeBadge } from './Badge';
import { Button } from './Button';

interface LevelUpInfo {
  cardId: string;
  newLevel: number;
}

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  levelUps: LevelUpInfo[];
}

export function LevelUpModal({ isOpen, onClose, levelUps }: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-bg-card rounded-2xl p-8 max-w-md w-full mx-4 border border-accent/50"
            onClick={e => e.stopPropagation()}
          >
            {/* 레벨업 효과 */}
            <motion.div
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-center mb-6"
            >
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="text-6xl mb-4"
              >
                ⬆️
              </motion.div>
              <h2 className="text-3xl font-bold text-accent">LEVEL UP!</h2>
            </motion.div>

            {/* 레벨업 카드 목록 */}
            <div className="space-y-4 mb-6">
              {levelUps.map(({ cardId, newLevel }, index) => {
                const character = CHARACTERS_BY_ID[cardId];
                if (!character) return null;

                return (
                  <motion.div
                    key={cardId}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-center gap-4 bg-bg-secondary/50 rounded-lg p-4"
                  >
                    <div className={`
                      w-12 h-12 rounded-lg flex items-center justify-center
                      bg-gradient-to-br
                      ${character.grade === '특급' ? 'from-grade-s/30 to-grade-s/10' : ''}
                      ${character.grade === '1급' ? 'from-grade-a/30 to-grade-a/10' : ''}
                      ${character.grade === '준1급' ? 'from-grade-b/30 to-grade-b/10' : ''}
                      ${character.grade === '2급' ? 'from-grade-c/30 to-grade-c/10' : ''}
                    `}>
                      <GradeBadge grade={character.grade} size="sm" />
                    </div>

                    <div className="flex-1">
                      <div className="font-bold">{character.name.ko}</div>
                      <div className="text-sm text-text-secondary">{character.name.en}</div>
                    </div>

                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                      className="flex items-center gap-2"
                    >
                      <span className="text-text-secondary">Lv.{newLevel - 1}</span>
                      <motion.span
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                        className="text-accent"
                      >
                        →
                      </motion.span>
                      <span className="text-xl font-bold text-win">Lv.{newLevel}</span>
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>

            {/* 스탯 증가 안내 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: levelUps.length * 0.2 + 0.3 }}
              className="text-center text-sm text-text-secondary mb-6"
            >
              주성장 스탯과 부성장 스탯이 각각 +2 증가했습니다!
            </motion.div>

            <Button onClick={onClose} className="w-full">
              확인
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
