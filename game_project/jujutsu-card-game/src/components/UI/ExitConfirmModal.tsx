// ========================================
// 나가기 확인 모달
// ========================================

import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './Button';

interface ExitConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ExitConfirmModal({ isOpen, onConfirm, onCancel }: ExitConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={onCancel}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-bg-secondary rounded-xl p-6 max-w-sm w-full border border-white/10 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            {/* 아이콘 */}
            <div className="text-center mb-4">
              <span className="text-5xl">⚠️</span>
            </div>

            {/* 제목 */}
            <h2 className="text-xl font-bold text-center text-text-primary mb-2">
              대전 종료
            </h2>

            {/* 설명 */}
            <p className="text-center text-text-secondary mb-6">
              진행 중인 대전을 포기하고 나가시겠습니까?<br />
              <span className="text-lose text-sm">이 대전은 패배로 기록됩니다.</span>
            </p>

            {/* 버튼 */}
            <div className="flex gap-3">
              <Button
                onClick={onCancel}
                variant="secondary"
                className="flex-1"
              >
                계속하기
              </Button>
              <Button
                onClick={onConfirm}
                variant="primary"
                className="flex-1 !bg-lose hover:!bg-lose/80"
              >
                나가기
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
