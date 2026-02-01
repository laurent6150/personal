import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../stores/playerStore';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';

interface SettingsProps {
  onBack: () => void;
}

export function Settings({ onBack }: SettingsProps) {
  const { player, updateSettings, resetProgress } = usePlayerStore();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showFullResetConfirm, setShowFullResetConfirm] = useState(false);

  const handleResetProgress = () => {
    resetProgress();
    setShowResetConfirm(false);
  };

  const handleFullReset = () => {
    // 모든 localStorage 삭제
    localStorage.clear();
    // 페이지 새로고침하여 처음부터 시작
    window.location.reload();
  };

  return (
    <div className="min-h-screen p-4">
      {/* 헤더 */}
      <div className="max-w-lg mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← 뒤로
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">설정</h1>
          <div className="w-20" />
        </div>
      </div>

      <div className="max-w-lg mx-auto space-y-4">
        {/* 애니메이션 속도 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-bg-card rounded-xl p-6 border border-white/10"
        >
          <h3 className="font-bold mb-4">애니메이션 속도</h3>
          <div className="flex gap-2">
            {(['SLOW', 'NORMAL', 'FAST'] as const).map(speed => (
              <button
                key={speed}
                onClick={() => updateSettings({ animationSpeed: speed })}
                className={`
                  flex-1 py-2 px-4 rounded-lg font-bold transition-all
                  ${player.settings.animationSpeed === speed
                    ? 'bg-accent text-bg-primary'
                    : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
                  }
                `}
              >
                {speed === 'SLOW' ? '느리게' : speed === 'NORMAL' ? '보통' : '빠르게'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 사운드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-bg-card rounded-xl p-6 border border-white/10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold">사운드</h3>
              <p className="text-sm text-text-secondary">효과음 및 배경음악</p>
            </div>
            <button
              onClick={() => updateSettings({ soundEnabled: !player.settings.soundEnabled })}
              className={`
                w-14 h-8 rounded-full transition-all relative
                ${player.settings.soundEnabled ? 'bg-accent' : 'bg-bg-secondary'}
              `}
            >
              <span
                className={`
                  absolute top-1 w-6 h-6 rounded-full bg-white transition-all
                  ${player.settings.soundEnabled ? 'left-7' : 'left-1'}
                `}
              />
            </button>
          </div>
        </motion.div>

        {/* 데이터 관리 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-card rounded-xl p-6 border border-white/10"
        >
          <h3 className="font-bold mb-4">데이터 관리</h3>

          <div className="space-y-3">
            {/* 저장 정보 */}
            <div className="bg-bg-secondary/50 rounded-lg p-4 text-sm">
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">플레이어 이름</span>
                <span>{player.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">총 승리</span>
                <span className="text-win">{player.totalStats.totalWins}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-text-secondary">보유 카드</span>
                <span>{Object.keys(player.ownedCards).length}장</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">해금 아이템</span>
                <span>{player.unlockedItems.length}개</span>
              </div>
            </div>

            {/* 초기화 버튼 */}
            <Button
              onClick={() => setShowResetConfirm(true)}
              variant="danger"
              className="w-full"
            >
              진행 상황 초기화
            </Button>

            {/* 전체 데이터 초기화 버튼 */}
            <Button
              onClick={() => setShowFullResetConfirm(true)}
              variant="danger"
              className="w-full"
            >
              🗑️ 전체 데이터 초기화
            </Button>
            <p className="text-xs text-text-secondary text-center">
              모든 게임 데이터를 삭제하고 처음부터 시작합니다
            </p>
          </div>
        </motion.div>

        {/* 게임 정보 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-bg-card rounded-xl p-6 border border-white/10"
        >
          <h3 className="font-bold mb-4">게임 정보</h3>
          <div className="text-sm text-text-secondary space-y-2">
            <div className="flex justify-between">
              <span>버전</span>
              <span>1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span>제작</span>
              <span>주술회전 카드 게임</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 초기화 확인 모달 */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="진행 상황 초기화"
        size="sm"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-text-secondary mb-6">
            모든 진행 상황이 초기화됩니다.<br />
            이 작업은 되돌릴 수 없습니다.
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowResetConfirm(false)}
              variant="ghost"
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleResetProgress}
              variant="danger"
              className="flex-1"
            >
              초기화
            </Button>
          </div>
        </div>
      </Modal>

      {/* 전체 데이터 초기화 확인 모달 */}
      <Modal
        isOpen={showFullResetConfirm}
        onClose={() => setShowFullResetConfirm(false)}
        title="전체 데이터 초기화"
        size="sm"
      >
        <div className="text-center">
          <div className="text-4xl mb-4">🗑️</div>
          <p className="text-text-secondary mb-4">
            <strong className="text-red-400">모든 게임 데이터가 삭제됩니다!</strong>
          </p>
          <ul className="text-sm text-text-secondary mb-6 text-left list-disc list-inside space-y-1">
            <li>플레이어 정보 및 진행 상황</li>
            <li>보유 카드 및 크루 구성</li>
            <li>시즌 기록 및 랭킹</li>
            <li>트레이드 내역</li>
            <li>모든 업적 및 아이템</li>
          </ul>
          <p className="text-xs text-red-400 mb-6">
            이 작업은 되돌릴 수 없습니다!
          </p>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowFullResetConfirm(false)}
              variant="ghost"
              className="flex-1"
            >
              취소
            </Button>
            <Button
              onClick={handleFullReset}
              variant="danger"
              className="flex-1"
            >
              전체 초기화
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
