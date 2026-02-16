// ========================================
// 드래프트 화면 - 스네이크 드래프트
// 10팀 × 6라운드 = 60픽, 나머지 비계약(FA)
// ========================================

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  rounds?: number;
}

export function DraftScreen({ onComplete, standings, seasonNumber, rounds = 6 }: DraftScreenProps) {
  const {
    draftPool,
    isDraftInProgress,
    currentPickIndex,
    draftOrder,
    draftRounds,
    teamsPerRound,
    crewDraftResults,
    startDraft,
    makePlayerPick,
    makeAIPick,
  } = useDraftStore(useShallow(state => ({
    draftPool: state.draftPool,
    isDraftInProgress: state.isDraftInProgress,
    currentPickIndex: state.currentPickIndex,
    draftOrder: state.draftOrder,
    draftRounds: state.draftRounds,
    teamsPerRound: state.teamsPerRound,
    crewDraftResults: state.crewDraftResults,
    startDraft: state.startDraft,
    makePlayerPick: state.makePlayerPick,
    makeAIPick: state.makeAIPick,
  })));

  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [aiPickingAnimation, setAiPickingAnimation] = useState(false);
  const [lastPickedCard, setLastPickedCard] = useState<{ crewId: string; cardId: string } | null>(null);
  const [draftComplete, setDraftComplete] = useState(false);
  const [fastMode, setFastMode] = useState(false);
  const draftStartedRef = useRef(false);
  const aiPickingRef = useRef(false);

  // 현재 픽하는 크루
  const currentCrewId = draftOrder[currentPickIndex] || null;
  const isPlayerTurn = currentCrewId === PLAYER_CREW_ID;

  // 현재 라운드 & 방향 계산
  const currentRound = teamsPerRound > 0 ? Math.floor(currentPickIndex / teamsPerRound) + 1 : 1;
  const isReverseRound = currentRound % 2 === 0;
  const pickInRound = teamsPerRound > 0 ? (currentPickIndex % teamsPerRound) + 1 : currentPickIndex + 1;

  // 드래프트 풀 카드 정보 (등급순 정렬)
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

  // 내 크루 카드 (드래프트 중 실시간 표시)
  const myDraftedCards = useMemo(() => {
    return (crewDraftResults[PLAYER_CREW_ID] || [])
      .map(id => CHARACTERS_BY_ID[id])
      .filter(Boolean) as CharacterCard[];
  }, [crewDraftResults]);

  // 드래프트 시작 (마운트 시 1회, persist된 이전 상태와 무관하게 항상 새로 시작)
  useEffect(() => {
    if (!draftStartedRef.current) {
      draftStartedRef.current = true;
      startDraft(seasonNumber, standings, rounds);
    }
  }, [seasonNumber, standings, startDraft, rounds]);

  // AI 턴 자동 처리
  // aiPickingRef로 재진입 방지 (state인 aiPickingAnimation을 deps에 넣으면
  // setAiPickingAnimation(true) → 리렌더 → cleanup(clearTimeout) → 타이머 취소 버그 발생)
  useEffect(() => {
    if (!isDraftInProgress || isPlayerTurn || aiPickingRef.current || draftComplete) return;
    if (currentPickIndex >= draftOrder.length) {
      setDraftComplete(true);
      return;
    }

    aiPickingRef.current = true;
    setAiPickingAnimation(true);
    const delay = fastMode ? 150 : 500;
    const timer = setTimeout(() => {
      const pickedCardId = makeAIPick(currentCrewId!);
      if (pickedCardId) {
        setLastPickedCard({ crewId: currentCrewId!, cardId: pickedCardId });
      }
      aiPickingRef.current = false;
      setAiPickingAnimation(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [isDraftInProgress, isPlayerTurn, currentPickIndex, draftOrder, currentCrewId, draftComplete, makeAIPick, fastMode]);

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
    onComplete();
  }, [onComplete]);

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
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h1 className="text-2xl font-bold text-accent">
              🎯 시즌 {seasonNumber} 스네이크 드래프트
            </h1>
            <div className="flex items-center gap-3 text-sm">
              <span className="px-3 py-1 bg-accent/20 text-accent rounded-full border border-accent/30">
                라운드 {Math.min(currentRound, draftRounds)}/{draftRounds}
                {isReverseRound ? ' ↩️' : ' ➡️'}
              </span>
              <span className="text-text-secondary">
                가용: {poolCards.length}장
              </span>
              <span className="text-text-secondary">
                픽: {currentPickIndex}/{draftOrder.length}
              </span>
              {/* 빨리감기 토글 */}
              {!draftComplete && (
                <button
                  onClick={() => setFastMode(!fastMode)}
                  className={`px-3 py-1 rounded-full text-xs border transition-all ${
                    fastMode
                      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      : 'bg-white/10 text-text-secondary border-white/20'
                  }`}
                >
                  {fastMode ? '⚡ 빨리감기' : '▶ 보통속도'}
                </button>
              )}
            </div>
          </div>

          {/* 진행 바 */}
          <div className="mt-3">
            <div className="h-2 bg-black/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-blue-500 rounded-full"
                animate={{ width: `${(currentPickIndex / Math.max(draftOrder.length, 1)) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 내 크루 현황 */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="bg-bg-card rounded-xl p-3 border border-accent/30">
          <h3 className="text-xs text-accent mb-2">내 크루 ({myDraftedCards.length}/{rounds})</h3>
          <div className="flex gap-2 overflow-x-auto">
            {myDraftedCards.map(card => (
              <div key={card.id} className="flex-shrink-0 text-center">
                <div className="w-12 h-16 rounded overflow-hidden border border-accent/30">
                  <img
                    src={getCharacterImage(card.id, card.name.ko, card.attribute)}
                    alt={card.name.ko}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getPlaceholderImage(card.name.ko, card.attribute);
                    }}
                  />
                </div>
                <div className="text-[9px] text-text-primary mt-0.5 truncate w-12">{card.name.ko}</div>
              </div>
            ))}
            {Array.from({ length: rounds - myDraftedCards.length }).map((_, i) => (
              <div key={`empty-${i}`} className="flex-shrink-0 w-12 h-16 rounded border-2 border-dashed border-white/20 flex items-center justify-center">
                <span className="text-text-secondary text-[10px]">?</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 드래프트 순서 표시 (현재 라운드) */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="bg-bg-card rounded-xl p-3 border border-white/10">
          <h3 className="text-xs text-text-secondary mb-2">
            라운드 {Math.min(currentRound, draftRounds)} 순서 {isReverseRound ? '(역방향 🔄)' : '(정방향 ➡️)'}
          </h3>
          <div className="flex flex-wrap gap-1.5">
            {(() => {
              const roundStart = (Math.min(currentRound, draftRounds) - 1) * teamsPerRound;
              const roundEnd = Math.min(roundStart + teamsPerRound, draftOrder.length);
              const roundTeams = draftOrder.slice(roundStart, roundEnd);

              return roundTeams.map((crewId, index) => {
                const globalIndex = roundStart + index;
                return (
                  <div
                    key={`${currentRound}-${index}`}
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
              <div className="text-text-secondary mb-2">
                {draftRounds}라운드 스네이크 드래프트가 완료되었습니다.
              </div>
              <div className="text-sm text-text-secondary mb-4">
                비계약(FA) 카드: {poolCards.length}장
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
        {lastPickedCard && !fastMode && (
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
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2 max-h-[50vh] overflow-y-auto">
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

      {/* 드래프트 완료 시 비계약 카드 표시 */}
      {draftComplete && poolCards.length > 0 && (
        <div className="max-w-6xl mx-auto mt-4">
          <div className="bg-bg-card rounded-xl p-4 border border-yellow-500/20">
            <h3 className="text-sm font-bold text-yellow-400 mb-3">
              비계약(FA) 카드 ({poolCards.length}장) - 추후 구매/교환 가능
            </h3>
            <div className="flex flex-wrap gap-2">
              {poolCards.map(({ cardId, character }) => (
                <div key={cardId} className="text-xs bg-black/30 px-2 py-1 rounded flex items-center gap-1">
                  <GradeBadge grade={character!.grade as LegacyGrade} size="sm" />
                  <span>{character!.name.ko}</span>
                </div>
              ))}
            </div>
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
      <div className="h-1/3 p-1.5 bg-black/60 flex flex-col justify-center">
        <div className="flex items-center justify-center gap-0.5">
          <GradeBadge grade={character.grade as LegacyGrade} size="sm" />
          <span
            className="text-[9px] px-1 rounded font-medium"
            style={{ backgroundColor: attrInfo.color + '33', color: attrInfo.color }}
          >
            {attrInfo.ko}
          </span>
        </div>
        <div className="text-[10px] font-bold mt-0.5 truncate text-center">
          {character.name.ko}
        </div>
      </div>
    </motion.div>
  );
}
