// ========================================
// 드래프트 화면 (Phase 5D → 스네이크 드래프트)
// 멀티 라운드 스네이크 드래프트 지원
// ========================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useDraftStore } from '../stores/draftStore';
import { CHARACTERS_BY_ID } from '../data/characters';
import { PLAYER_CREW_ID, AI_CREWS_BY_ID } from '../data/aiCrews';
import { Button } from './UI/Button';
import { GradeBadge } from './UI/Badge';
import { getCharacterImage, getPlaceholderImage } from '../utils/imageHelper';
import { ATTRIBUTES } from '../data/constants';
import type { CharacterCard, LegacyGrade } from '../types';

interface DraftScreenProps {
  onComplete: () => void;
  standings: Array<{ crewId: string; points: number; goalDifference: number }>;
  seasonNumber: number;
  rounds?: number;  // 스네이크 드래프트 라운드 수 (기본 1)
}

export function DraftScreen({ onComplete, standings, seasonNumber, rounds = 1 }: DraftScreenProps) {
  const {
    draftPool,
    isDraftInProgress,
    currentPickIndex,
    draftOrder,
    draftRounds,
    teamsPerRound,
    startDraft,
    makePlayerPick,
    makeAIPick,
    finishDraft,
  } = useDraftStore(useShallow(state => ({
    draftPool: state.draftPool,
    isDraftInProgress: state.isDraftInProgress,
    currentPickIndex: state.currentPickIndex,
    draftOrder: state.draftOrder,
    draftRounds: state.draftRounds,
    teamsPerRound: state.teamsPerRound,
    startDraft: state.startDraft,
    makePlayerPick: state.makePlayerPick,
    makeAIPick: state.makeAIPick,
    finishDraft: state.finishDraft,
  })));

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [aiPickingAnimation, setAiPickingAnimation] = useState(false);
  const [lastPickedCard, setLastPickedCard] = useState<{ crewId: string; cardId: string } | null>(null);
  const [draftComplete, setDraftComplete] = useState(false);

  // 현재 픽하는 크루
  const currentCrewId = draftOrder[currentPickIndex] || null;
  const isPlayerTurn = currentCrewId === PLAYER_CREW_ID;

  // 현재 라운드 & 방향 계산
  const currentRound = teamsPerRound > 0 ? Math.floor(currentPickIndex / teamsPerRound) + 1 : 1;
  const isReverseRound = currentRound % 2 === 0;
  const pickInRound = teamsPerRound > 0 ? (currentPickIndex % teamsPerRound) + 1 : currentPickIndex + 1;

  // 드래프트 풀 카드 정보
  const poolCards = useMemo(() => {
    return draftPool
      .map(poolCard => ({
        ...poolCard,
        character: CHARACTERS_BY_ID[poolCard.cardId],
      }))
      .filter(item => item.character)
      .sort((a, b) => {
        const gradeOrder: LegacyGrade[] = ['특급', '준특급', '1급', '준1급', '2급', '준2급', '3급'];
        const aIndex = gradeOrder.indexOf(a.character!.grade as LegacyGrade);
        const bIndex = gradeOrder.indexOf(b.character!.grade as LegacyGrade);
        return aIndex - bIndex;
      });
  }, [draftPool]);

  // 드래프트 시작
  useEffect(() => {
    if (!isDraftInProgress && draftPool.length > 0) {
      startDraft(seasonNumber, standings, rounds);
    }
  }, [isDraftInProgress, draftPool.length, seasonNumber, standings, startDraft, rounds]);

  // AI 턴 자동 처리
  useEffect(() => {
    if (!isDraftInProgress || isPlayerTurn || aiPickingAnimation || draftComplete) return;
    if (currentPickIndex >= draftOrder.length) {
      setDraftComplete(true);
      return;
    }

    setAiPickingAnimation(true);
    const timer = setTimeout(() => {
      const pickedCardId = makeAIPick(currentCrewId!);
      if (pickedCardId) {
        setLastPickedCard({ crewId: currentCrewId!, cardId: pickedCardId });
      }
      setAiPickingAnimation(false);
    }, draftRounds > 1 ? 800 : 1500); // 멀티라운드는 더 빠르게

    return () => clearTimeout(timer);
  }, [isDraftInProgress, isPlayerTurn, currentPickIndex, draftOrder, currentCrewId, aiPickingAnimation, draftComplete, makeAIPick, draftRounds]);

  // 드래프트 완료 체크
  useEffect(() => {
    if (currentPickIndex >= draftOrder.length && draftOrder.length > 0 && !draftComplete) {
      setDraftComplete(true);
    }
  }, [currentPickIndex, draftOrder.length, draftComplete]);

  // 플레이어 픽 처리
  const handlePlayerPick = useCallback(() => {
    if (!selectedCard || !isPlayerTurn) return;
    makePlayerPick(selectedCard);
    setLastPickedCard({ crewId: PLAYER_CREW_ID, cardId: selectedCard });
    setSelectedCard(null);
  }, [selectedCard, isPlayerTurn, makePlayerPick]);

  // 드래프트 종료
  const handleFinishDraft = useCallback(() => {
    finishDraft();
    onComplete();
  }, [finishDraft, onComplete]);

  // 크루 이름 가져오기
  const getCrewName = (crewId: string) => {
    if (crewId === PLAYER_CREW_ID) return '내 크루';
    return AI_CREWS_BY_ID[crewId]?.name || crewId;
  };

  const bgStyle = {
    backgroundImage: 'url(/images/backgrounds/menu_bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  return (
    <div className="min-h-screen p-4" style={bgStyle}>
      {/* 헤더 */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="bg-black/60 rounded-xl p-4 backdrop-blur-sm border border-accent/30">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-accent">
              🎯 시즌 {seasonNumber} {draftRounds > 1 ? '스네이크 ' : ''}드래프트
            </h1>
            <div className="flex items-center gap-4 text-sm">
              {draftRounds > 1 && (
                <span className="px-3 py-1 bg-accent/20 text-accent rounded-full border border-accent/30">
                  라운드 {currentRound}/{draftRounds}
                  {isReverseRound ? ' ↩️' : ' ➡️'}
                </span>
              )}
              <span className="text-text-secondary">
                가용 카드: {poolCards.length}장
              </span>
              <span className="text-text-secondary">
                픽: {currentPickIndex}/{draftOrder.length}
              </span>
            </div>
          </div>

          {/* 스네이크 드래프트 진행 바 */}
          {draftRounds > 1 && (
            <div className="mt-3">
              <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-accent to-blue-500 rounded-full"
                  animate={{ width: `${(currentPickIndex / draftOrder.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 드래프트 순서 표시 (현재 라운드) */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="bg-bg-card rounded-xl p-3 border border-white/10">
          <h3 className="text-xs text-text-secondary mb-2">
            {draftRounds > 1
              ? `라운드 ${currentRound} 순서 ${isReverseRound ? '(역방향 🔄)' : '(정방향 ➡️)'}`
              : '드래프트 순서 (역순위)'
            }
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(() => {
              // 현재 라운드의 팀 순서만 표시
              const roundStart = (currentRound - 1) * teamsPerRound;
              const roundEnd = Math.min(roundStart + teamsPerRound, draftOrder.length);
              const roundTeams = draftOrder.slice(roundStart, roundEnd);

              return roundTeams.map((crewId, index) => {
                const globalIndex = roundStart + index;
                return (
                  <div
                    key={`${currentRound}-${crewId}`}
                    className={`px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                      globalIndex === currentPickIndex
                        ? 'bg-accent text-white font-bold scale-110 ring-2 ring-accent/50'
                        : globalIndex < currentPickIndex
                        ? 'bg-white/10 text-text-secondary line-through'
                        : 'bg-white/5 text-text-primary'
                    }`}
                  >
                    {index + 1}. {getCrewName(crewId)}
                    {crewId === PLAYER_CREW_ID && ' ⭐'}
                  </div>
                );
              });
            })()}
          </div>
        </div>
      </div>

      {/* 현재 턴 표시 */}
      <div className="max-w-6xl mx-auto mb-4">
        <AnimatePresence mode="wait">
          {!draftComplete && currentCrewId && (
            <motion.div
              key={currentPickIndex}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`p-4 rounded-xl text-center ${
                isPlayerTurn
                  ? 'bg-accent/20 border-2 border-accent'
                  : 'bg-blue-500/20 border border-blue-500/50'
              }`}
            >
              {isPlayerTurn ? (
                <>
                  <div className="text-xl font-bold text-accent mb-1">
                    🎯 당신의 차례입니다!
                  </div>
                  <div className="text-text-secondary text-sm">
                    카드를 선택하세요 (라운드 {currentRound}, {pickInRound}번째 픽)
                  </div>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-blue-400 mb-1">
                    {aiPickingAnimation ? '🤔' : '⏳'} {getCrewName(currentCrewId)}의 차례
                  </div>
                  {aiPickingAnimation && (
                    <div className="text-text-secondary text-sm animate-pulse">
                      카드를 선택하는 중...
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {draftComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-xl text-center bg-win/20 border-2 border-win"
            >
              <div className="text-2xl font-bold text-win mb-2">
                🎉 드래프트 완료!
              </div>
              <div className="text-text-secondary mb-4">
                {draftRounds > 1
                  ? `${draftRounds}라운드 스네이크 드래프트가 완료되었습니다.`
                  : '모든 팀이 선택을 완료했습니다.'
                }
              </div>
              <Button onClick={handleFinishDraft} variant="primary" size="lg">
                시즌 시작하기
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 마지막 픽 알림 */}
      <AnimatePresence>
        {lastPickedCard && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="max-w-6xl mx-auto mb-4"
          >
            <div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-3 flex items-center gap-3">
              <div className="text-xl">📢</div>
              <div className="text-sm">
                <span className="font-bold text-blue-400">
                  {getCrewName(lastPickedCard.crewId)}
                </span>
                <span className="text-text-secondary">이(가) </span>
                <span className="font-bold text-text-primary">
                  {CHARACTERS_BY_ID[lastPickedCard.cardId]?.name.ko}
                </span>
                <span className="text-text-secondary">을(를) 선택했습니다!</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 드래프트 풀 */}
      {!draftComplete && (
        <div className="max-w-6xl mx-auto">
          <div className="bg-bg-card rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-bold text-text-primary mb-3">
              드래프트 풀 ({poolCards.length}장)
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
              {poolCards.map(({ cardId, character }) => (
                <DraftCard
                  key={cardId}
                  cardId={cardId}
                  character={character!}
                  isSelected={selectedCard === cardId}
                  isSelectable={isPlayerTurn && !aiPickingAnimation}
                  onClick={() => isPlayerTurn && !aiPickingAnimation && setSelectedCard(cardId)}
                />
              ))}
            </div>

            {/* 플레이어 픽 버튼 */}
            {isPlayerTurn && selectedCard && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex justify-center"
              >
                <Button
                  onClick={handlePlayerPick}
                  variant="primary"
                  size="lg"
                  className="px-8"
                >
                  {CHARACTERS_BY_ID[selectedCard]?.name.ko} 선택하기
                </Button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// 드래프트 카드 컴포넌트
interface DraftCardProps {
  cardId: string;
  character: CharacterCard;
  isSelected: boolean;
  isSelectable: boolean;
  onClick: () => void;
}

function DraftCard({ cardId, character, isSelected, isSelectable, onClick }: DraftCardProps) {
  const [imageError, setImageError] = useState(false);
  const attrInfo = ATTRIBUTES[character.attribute];

  const imageUrl = imageError
    ? getPlaceholderImage(character.name.ko, character.attribute)
    : getCharacterImage(cardId, character.name.ko, character.attribute);

  return (
    <motion.div
      whileHover={isSelectable ? { scale: 1.05 } : {}}
      whileTap={isSelectable ? { scale: 0.95 } : {}}
      onClick={onClick}
      className={`
        aspect-[3/4] rounded-lg overflow-hidden transition-all
        ${isSelectable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
        ${isSelected
          ? 'ring-4 ring-accent shadow-lg shadow-accent/30 scale-105'
          : 'border border-white/20 hover:border-accent/50'
        }
      `}
    >
      <div className="relative h-2/3 bg-black/20">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white/5 to-black/20">
            <span className="text-3xl">{attrInfo.icon}</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={character.name.ko}
            className="w-full h-full object-cover object-top"
            onError={() => setImageError(true)}
          />
        )}
        {isSelected && (
          <div className="absolute inset-0 bg-accent/30 flex items-center justify-center">
            <span className="text-4xl">✓</span>
          </div>
        )}
      </div>
      <div className="h-1/3 p-2 bg-black/60 flex flex-col justify-center">
        <GradeBadge grade={character.grade as LegacyGrade} size="sm" />
        <div className="text-xs font-bold mt-1 truncate text-center">
          {character.name.ko}
        </div>
      </div>
    </motion.div>
  );
}
