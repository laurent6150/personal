// ========================================
// 지명 알림 컴포넌트 (내 카드가 지명당했을 때)
// ========================================

import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { Button } from '../UI/Button';

interface NominationAlertProps {
  nominatorId: string;
  nomineeId: string;
  groupId: string;
  onClose: () => void;
}

export function NominationAlert({
  nominatorId,
  nomineeId,
  groupId,
  onClose,
}: NominationAlertProps) {
  const nominator = CHARACTERS_BY_ID[nominatorId];
  const nominee = CHARACTERS_BY_ID[nomineeId];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-gradient-to-b from-bg-secondary to-bg-primary rounded-2xl p-6 max-w-md w-full text-center border border-white/10"
      >
        {/* 아이콘 */}
        <div className="text-5xl mb-4">📢</div>

        {/* 타이틀 */}
        <h3 className="text-xl font-bold text-text-primary mb-6">
          내 카드가 지명되었습니다!
        </h3>

        {/* 지명 정보 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {/* 지명자 */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-xl bg-bg-primary overflow-hidden mx-auto mb-2">
              {nominator?.imageUrl && (
                <img
                  src={nominator.imageUrl}
                  alt={nominator.name.ko}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="text-sm text-text-primary font-bold">
              {nominator?.name.ko || '???'}
            </div>
          </div>

          {/* 화살표 */}
          <div className="text-2xl text-text-secondary">→</div>

          {/* 지명된 카드 (내 카드) */}
          <div className="text-center">
            <div className="w-20 h-20 rounded-xl bg-bg-primary overflow-hidden mx-auto mb-2 ring-2 ring-yellow-500">
              {nominee?.imageUrl && (
                <img
                  src={nominee.imageUrl}
                  alt={nominee.name.ko}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="text-sm text-yellow-400 font-bold">
              ⭐ {nominee?.name.ko || '???'}
            </div>
          </div>
        </div>

        {/* 조 정보 */}
        <div className="mb-6 text-text-primary">
          <span className="inline-block bg-accent/30 text-accent font-bold px-3 py-1 rounded-lg mr-2">
            {groupId}조
          </span>
          로 배정되었습니다
        </div>

        {/* 확인 버튼 */}
        <Button variant="primary" onClick={onClose} className="px-8">
          확인
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default NominationAlert;
