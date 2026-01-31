import { motion, AnimatePresence } from 'framer-motion';
import { ACHIEVEMENTS_BY_ID } from '../../data/achievements';
import { ITEMS_BY_ID } from '../../data/items';

interface AchievementToastProps {
  achievementId: string | null;
  onClose: () => void;
}

export function AchievementToast({ achievementId, onClose }: AchievementToastProps) {
  const achievement = achievementId ? ACHIEVEMENTS_BY_ID[achievementId] : null;

  return (
    <AnimatePresence>
      {achievement && (
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 20 }}
          className="fixed top-20 right-4 z-50"
        >
          <div className="bg-bg-card border border-accent/50 rounded-lg shadow-lg p-4 min-w-72">
            <div className="flex items-start gap-3">
              {/* 아이콘 */}
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ duration: 0.5 }}
                className="text-3xl"
              >
                🏆
              </motion.div>

              <div className="flex-1">
                <div className="text-xs text-accent font-bold mb-1">업적 달성!</div>
                <div className="font-bold text-text-primary">{achievement.name}</div>
                <div className="text-sm text-text-secondary">{achievement.description}</div>

                {/* 보상 */}
                {achievement.reward && (
                  <div className="mt-2 text-xs">
                    <span className="text-text-secondary">보상: </span>
                    {achievement.reward.type === 'ITEM' && achievement.reward.itemId && (
                      <span className="text-win">
                        {ITEMS_BY_ID[achievement.reward.itemId]?.name.ko || '아이템'}
                      </span>
                    )}
                    {achievement.reward.type === 'EXP' && (
                      <span className="text-win">경험치 +{achievement.reward.amount}</span>
                    )}
                    {achievement.reward.type === 'TITLE' && (
                      <span className="text-win">칭호: {achievement.reward.title}</span>
                    )}
                  </div>
                )}
              </div>

              {/* 닫기 버튼 */}
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary"
              >
                ×
              </button>
            </div>

            {/* 진행 바 (자동 닫힘) */}
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 5, ease: 'linear' }}
              onAnimationComplete={onClose}
              className="h-0.5 bg-accent mt-3 rounded-full"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
