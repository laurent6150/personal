// ========================================
// 16강 지명 화면 컴포넌트
// ========================================

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useIndividualLeagueStore } from '../../stores/individualLeagueStore';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { Button } from '../UI/Button';
import { NominationAlert } from './NominationAlert';

interface NominationScreenProps {
  onComplete?: () => void;
}

export function NominationScreen({ onComplete }: NominationScreenProps) {
  const {
    currentLeague,
    getCurrentNominationStep,
    getAvailableForNomination,
    getPlayerCrewIds,
    nominateCard,
    autoNominate,
  } = useIndividualLeagueStore(useShallow(state => ({
    currentLeague: state.currentLeague,
    getCurrentNominationStep: state.getCurrentNominationStep,
    getAvailableForNomination: state.getAvailableForNomination,
    getPlayerCrewIds: state.getPlayerCrewIds,
    nominateCard: state.nominateCard,
    autoNominate: state.autoNominate,
  })));

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAutoNominating, setIsAutoNominating] = useState(false);
  const [alertInfo, setAlertInfo] = useState<{
    nominatorId: string;
    nomineeId: string;
    groupId: string;
  } | null>(null);

  const currentStep = getCurrentNominationStep();
  const availableCards = getAvailableForNomination();
  const playerCardIds = getPlayerCrewIds();

  // 현재 지명 인덱스
  const currentIndex = currentLeague?.currentNominationIndex ?? 0;
  const totalSteps = currentLeague?.nominationSteps?.length ?? 24;

  // 지명자 정보
  const nominator = currentStep?.nominatorId
    ? CHARACTERS_BY_ID[currentStep.nominatorId]
    : null;

  // 내 카드가 지명하는 차례인지
  const isMyTurn = currentStep?.nominatorId
    ? playerCardIds.includes(currentStep.nominatorId)
    : false;

  // 현재 조 정보
  const currentGroup = currentLeague?.brackets.round16.find(
    g => g.id === currentStep?.groupId
  );

  // AI 자동 지명
  useEffect(() => {
    if (currentStep && !isMyTurn && !currentStep.isCompleted && currentStep.nominatorId) {
      setIsAutoNominating(true);
      const timer = setTimeout(() => {
        // 지명 전 상태 확인 (내 카드가 지명당할 경우 알림)
        const available = getAvailableForNomination();
        const sorted = [...available].sort((a, b) =>
          (a.totalStats || 0) - (b.totalStats || 0)
        );
        const nominee = sorted[0];

        // 내 카드가 지명당하면 알림 표시
        if (nominee && playerCardIds.includes(nominee.odId)) {
          setAlertInfo({
            nominatorId: currentStep.nominatorId!,
            nomineeId: nominee.odId,
            groupId: currentStep.groupId,
          });
        }

        autoNominate();
        setIsAutoNominating(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isMyTurn, currentStep?.nominatorId]);

  // 지명 완료 체크
  useEffect(() => {
    if (currentLeague?.status === 'ROUND_16' && onComplete) {
      onComplete();
    }
  }, [currentLeague?.status]);

  // 지명 완료
  if (!currentStep || currentIndex >= totalSteps) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
      >
        <div className="text-6xl mb-4">🎊</div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">
          16강 지명 완료!
        </h2>
        <p className="text-text-secondary">
          모든 조 편성이 완료되었습니다.
        </p>
      </motion.div>
    );
  }

  const handleConfirmNomination = () => {
    if (selectedId) {
      nominateCard(selectedId);
      setSelectedId(null);
    }
  };

  const handleCloseAlert = () => {
    setAlertInfo(null);
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-xl font-bold text-text-primary mb-1">
          🎯 16강 {currentStep.groupId}조 지명
        </h2>
        <div className="text-sm text-text-secondary">
          {currentIndex + 1} / {totalSteps}
        </div>
      </div>

      {/* 프로그레스 바 */}
      <div className="w-full bg-bg-primary/50 rounded-full h-2">
        <motion.div
          className="bg-accent h-2 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* 현재 조 현황 */}
      <div className="bg-bg-secondary rounded-xl border border-white/10 p-4">
        <div className="text-sm font-bold text-text-primary mb-3 text-center">
          {currentStep.groupId}조 현재 멤버
        </div>
        <div className="flex justify-center gap-3 flex-wrap">
          {currentGroup?.participants.map((id, i) => {
            const char = CHARACTERS_BY_ID[id];
            const isMyCard = playerCardIds.includes(id);
            return (
              <div
                key={id}
                className={`
                  bg-bg-primary/50 rounded-lg px-3 py-2 text-center min-w-[80px]
                  ${isMyCard ? 'border border-yellow-500/50' : ''}
                `}
              >
                <div className="text-xs text-text-secondary">{i + 1}번</div>
                <div className={`font-bold text-sm ${isMyCard ? 'text-yellow-400' : 'text-text-primary'}`}>
                  {isMyCard && '⭐'}
                  {char?.name.ko || '???'}
                </div>
                {i === 0 && (
                  <div className="text-[10px] bg-yellow-500/20 text-yellow-400 rounded px-1 mt-1">
                    시드
                  </div>
                )}
              </div>
            );
          })}
          {/* 빈 슬롯 */}
          {Array(4 - (currentGroup?.participants.length || 0))
            .fill(null)
            .map((_, i) => (
              <div
                key={`empty-${i}`}
                className="bg-bg-primary/30 border border-dashed border-white/20 rounded-lg px-3 py-2 text-center min-w-[80px]"
              >
                <div className="text-xs text-text-secondary">
                  {(currentGroup?.participants.length || 0) + i + 1}번
                </div>
                <div className="text-text-secondary text-sm">???</div>
              </div>
            ))}
        </div>
      </div>

      {/* 지명자 정보 */}
      <div className="bg-accent/20 border border-accent/50 rounded-xl p-4">
        <div className="flex items-center gap-4">
          {/* 지명자 카드 */}
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-lg bg-bg-primary overflow-hidden">
              {nominator?.imageUrl && (
                <img
                  src={nominator.imageUrl}
                  alt={nominator.name.ko}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <div className={`font-bold ${playerCardIds.includes(currentStep.nominatorId || '') ? 'text-yellow-400' : 'text-text-primary'}`}>
                {playerCardIds.includes(currentStep.nominatorId || '') && '⭐ '}
                {nominator?.name.ko || '???'}
              </div>
              <div className="text-sm text-text-secondary">
                {nominator?.grade || ''}
              </div>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="flex-1">
            {isMyTurn ? (
              <>
                <p className="text-text-primary font-bold">
                  조에 끌어들일 상대를 선택하세요!
                </p>
                <p className="text-xs text-green-400 mt-1">
                  💡 약한 상대를 선택하면 8강 진출이 유리합니다
                </p>
              </>
            ) : (
              <p className="text-text-primary">
                {nominator?.name.ko}이(가) 상대를 지명합니다...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 선택 가능한 카드 목록 */}
      {isMyTurn ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
            {availableCards.map(p => {
              const char = CHARACTERS_BY_ID[p.odId];
              const isSelected = selectedId === p.odId;
              const isPlayerCard = playerCardIds.includes(p.odId);

              return (
                <motion.div
                  key={p.odId}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedId(p.odId)}
                  className={`
                    bg-bg-secondary rounded-lg p-3 cursor-pointer border-2 transition-colors
                    ${isSelected ? 'border-yellow-500 bg-yellow-500/10' : 'border-transparent hover:border-white/20'}
                    ${isPlayerCard ? 'border-yellow-500/30' : ''}
                  `}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-bg-primary overflow-hidden">
                      {char?.imageUrl && (
                        <img
                          src={char.imageUrl}
                          alt={char.name.ko}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-bold text-sm truncate ${isPlayerCard ? 'text-yellow-400' : 'text-text-primary'}`}>
                        {isPlayerCard && '⭐'}
                        {char?.name.ko || '???'}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {char?.grade || ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400">총합: {p.totalStats || 0}</span>
                    <span className="text-text-secondary">
                      {p.wins || 0}승 {p.losses || 0}패
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <Button
            variant="primary"
            onClick={handleConfirmNomination}
            disabled={!selectedId}
            className="w-full"
          >
            지명 확정
          </Button>
        </>
      ) : (
        <div className="text-center py-8">
          {isAutoNominating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="w-10 h-10 border-4 border-white/10 border-t-accent rounded-full animate-spin" />
              <p className="text-text-secondary">지명 중...</p>
            </motion.div>
          )}
        </div>
      )}

      {/* 내 카드가 지명당했을 때 알림 */}
      <AnimatePresence>
        {alertInfo && (
          <NominationAlert
            nominatorId={alertInfo.nominatorId}
            nomineeId={alertInfo.nomineeId}
            groupId={alertInfo.groupId}
            onClose={handleCloseAlert}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default NominationScreen;
