// ========================================
// 16강 지명 화면 컴포넌트 (비교 분석 포함)
// ========================================

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useIndividualLeagueStore } from '../../stores/individualLeagueStore';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { ATTRIBUTE_ADVANTAGE } from '../../data/constants';
import { Button } from '../UI/Button';
import { NominationAlert } from './NominationAlert';
import type { LeagueParticipant, Attribute } from '../../types';

interface NominationScreenProps {
  onComplete?: () => void;
}

// 속성 상성 분석
interface AttributeAnalysis {
  hasAdvantage: boolean;
  hasDisadvantage: boolean;
  description: string;
}

function analyzeAttribute(myAttr: string, oppAttr: string): AttributeAnalysis {
  const myAdvantages = ATTRIBUTE_ADVANTAGE[myAttr as Attribute] || [];
  const oppAdvantages = ATTRIBUTE_ADVANTAGE[oppAttr as Attribute] || [];

  const hasAdvantage = myAdvantages.includes(oppAttr as Attribute);
  const hasDisadvantage = oppAdvantages.includes(myAttr as Attribute);

  let description = '';
  if (hasAdvantage && !hasDisadvantage) {
    description = `✅ [${myAttr}]이(가) [${oppAttr}]에 상성 우위!`;
  } else if (hasDisadvantage && !hasAdvantage) {
    description = `⚠️ [${oppAttr}]이(가) [${myAttr}]에 상성 우위`;
  } else if (hasAdvantage && hasDisadvantage) {
    description = `⚔️ 상호 상성 관계`;
  } else {
    description = `➖ 상성 관계 없음 (동등)`;
  }

  return { hasAdvantage, hasDisadvantage, description };
}

// 추천도 계산
interface RecommendationResult {
  score: number;
  level: 'high' | 'medium' | 'low';
  label: string;
  reasons: string[];
}

function calculateRecommendation(
  seedParticipant: LeagueParticipant,
  opponent: LeagueParticipant
): RecommendationResult {
  const seedChar = CHARACTERS_BY_ID[seedParticipant.odId];
  const oppChar = CHARACTERS_BY_ID[opponent.odId];

  let score = 50;
  const reasons: string[] = [];

  // 총합 비교
  const statsDiff = (seedParticipant.totalStats || 0) - (opponent.totalStats || 0);
  if (statsDiff > 40) {
    score += 30;
    reasons.push(`총합 +${statsDiff} 압도적`);
  } else if (statsDiff > 20) {
    score += 20;
    reasons.push(`총합 +${statsDiff} 우위`);
  } else if (statsDiff > 0) {
    score += 10;
    reasons.push(`총합 +${statsDiff}`);
  } else if (statsDiff > -20) {
    score -= 10;
    reasons.push(`총합 ${statsDiff}`);
  } else {
    score -= 25;
    reasons.push(`총합 ${statsDiff} 열세`);
  }

  // 속성 상성
  if (seedChar && oppChar) {
    const attrAnalysis = analyzeAttribute(seedChar.attribute || '', oppChar.attribute || '');
    if (attrAnalysis.hasAdvantage && !attrAnalysis.hasDisadvantage) {
      score += 20;
      reasons.push('속성 유리');
    } else if (attrAnalysis.hasDisadvantage && !attrAnalysis.hasAdvantage) {
      score -= 20;
      reasons.push('속성 불리');
    }
  }

  // 등급 결정
  let level: 'high' | 'medium' | 'low';
  let label: string;

  if (score >= 70) {
    level = 'high';
    label = '⭐ 강력 추천!';
  } else if (score >= 50) {
    level = 'medium';
    label = '👍 추천';
  } else if (score >= 35) {
    level = 'low';
    label = '⚠️ 주의';
  } else {
    level = 'low';
    label = '❌ 비추천';
  }

  return { score, level, label, reasons };
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

  // 시드 카드 정보 (비교 기준)
  const seedId = currentGroup?.seedId || currentGroup?.participants[0];
  const seedParticipant = currentLeague?.participants.find(p => p.odId === seedId);
  const seedCharacter = seedId ? CHARACTERS_BY_ID[seedId] : null;

  // 선택된 상대 정보
  const selectedParticipant = selectedId
    ? currentLeague?.participants.find(p => p.odId === selectedId)
    : null;
  const selectedCharacter = selectedId ? CHARACTERS_BY_ID[selectedId] : null;

  // 비교 분석
  const comparison = useMemo(() => {
    if (!selectedParticipant || !selectedCharacter || !seedParticipant || !seedCharacter) {
      return null;
    }

    const seedStats = seedCharacter.baseStats as unknown as Record<string, number>;
    const oppStats = selectedCharacter.baseStats as unknown as Record<string, number>;

    return {
      attribute: analyzeAttribute(seedCharacter.attribute || '', selectedCharacter.attribute || ''),
      recommendation: calculateRecommendation(seedParticipant, selectedParticipant),
      statsDiff: {
        atk: (seedStats.atk || 0) - (oppStats.atk || 0),
        def: (seedStats.def || 0) - (oppStats.def || 0),
        spd: (seedStats.spd || 0) - (oppStats.spd || 0),
        ce: (seedStats.ce || 0) - (oppStats.ce || 0),
        hp: (seedStats.hp || 0) - (oppStats.hp || 0),
        crt: (seedStats.crt || 0) - (oppStats.crt || 0),
        tec: (seedStats.tec || 0) - (oppStats.tec || 0),
        mnt: (seedStats.mnt || 0) - (oppStats.mnt || 0),
      },
    };
  }, [selectedId, seedId, currentLeague?.participants]);

  // AI 자동 지명 (의존성 배열 수정)
  useEffect(() => {
    // 현재 스텝이 없거나 이미 완료된 경우 무시
    if (!currentStep) {
      console.log('[useEffect] 현재 스텝 없음 - 지명 완료');
      return;
    }

    if (currentStep.isCompleted) {
      console.log('[useEffect] 현재 스텝 이미 완료됨');
      return;
    }

    // 지명자가 없으면 무시
    if (!currentStep.nominatorId) {
      console.log('[useEffect] 지명자 없음');
      return;
    }

    // 내 차례면 무시 (유저가 선택해야 함)
    if (isMyTurn) {
      console.log('[useEffect] 내 차례 - 유저 선택 대기');
      return;
    }

    // AI 지명 시작
    console.log(`[useEffect] AI 지명 시작: ${currentStep.nominatorId}`);
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
    }, 1000);

    return () => clearTimeout(timer);
  }, [currentIndex, currentLeague?.nominationSteps?.length]);

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

  const handleCancelSelection = () => {
    setSelectedId(null);
  };

  const handleCloseAlert = () => {
    setAlertInfo(null);
  };

  // 스탯 라벨
  const statLabels: Record<string, { label: string; color: string }> = {
    atk: { label: '공격', color: 'text-red-400' },
    def: { label: '방어', color: 'text-blue-400' },
    spd: { label: '속도', color: 'text-yellow-400' },
    ce: { label: '주력', color: 'text-purple-400' },
    hp: { label: '체력', color: 'text-pink-400' },
    crt: { label: '치명', color: 'text-rose-400' },
    tec: { label: '기술', color: 'text-teal-400' },
    mnt: { label: '정신', color: 'text-indigo-400' },
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

      {/* 선택 가능한 카드 목록 또는 비교 분석 */}
      {isMyTurn ? (
        <>
          {/* 비교 분석 패널 (카드 선택 시) */}
          {selectedId && comparison && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-bg-secondary/80 rounded-xl border border-accent/30 p-4"
            >
              <div className="text-center font-bold text-accent mb-4">🔍 상대 분석</div>

              {/* 카드 비교 */}
              <div className="flex justify-center items-center gap-4 mb-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-green-500/50 bg-green-500/10">
                  <div className="w-12 h-12 rounded-lg bg-bg-primary overflow-hidden">
                    {seedCharacter?.imageUrl && (
                      <img src={seedCharacter.imageUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-green-400">⭐ {seedCharacter?.name.ko}</div>
                    <div className="text-xs text-text-secondary">{seedCharacter?.grade} / {seedCharacter?.attribute}</div>
                    <div className="text-xs text-green-400">총합: {seedParticipant?.totalStats || 0}</div>
                  </div>
                </div>

                <div className="text-lg font-bold text-text-secondary">VS</div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-red-500/50 bg-red-500/10">
                  <div className="w-12 h-12 rounded-lg bg-bg-primary overflow-hidden">
                    {selectedCharacter?.imageUrl && (
                      <img src={selectedCharacter.imageUrl} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-red-400">{selectedCharacter?.name.ko}</div>
                    <div className="text-xs text-text-secondary">{selectedCharacter?.grade} / {selectedCharacter?.attribute}</div>
                    <div className="text-xs text-red-400">총합: {selectedParticipant?.totalStats || 0}</div>
                  </div>
                </div>
              </div>

              {/* 능력치 비교 */}
              <div className="bg-black/30 rounded-lg p-3 mb-3">
                <div className="text-xs text-text-secondary mb-2 border-b border-white/10 pb-1">📊 능력치 비교</div>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(statLabels).map(([key, { label, color }]) => {
                    const seedStats = seedCharacter?.baseStats as unknown as Record<string, number>;
                    const oppStats = selectedCharacter?.baseStats as unknown as Record<string, number>;
                    const myVal = seedStats?.[key] || 0;
                    const oppVal = oppStats?.[key] || 0;
                    const diff = myVal - oppVal;

                    return (
                      <div key={key} className="text-center bg-white/5 rounded p-1">
                        <div className={`text-[10px] ${color}`}>{label}</div>
                        <div className="flex items-center justify-center gap-1 text-xs">
                          <span className={diff > 0 ? 'text-green-400' : 'text-text-primary'}>{myVal}</span>
                          <span className="text-text-secondary">vs</span>
                          <span className={diff < 0 ? 'text-red-400' : 'text-text-primary'}>{oppVal}</span>
                        </div>
                        <div className={`text-[10px] font-bold ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-text-secondary'}`}>
                          {diff > 0 ? `+${diff}` : diff === 0 ? '-' : diff}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 속성 상성 */}
              <div className="bg-black/30 rounded-lg p-3 mb-3">
                <div className="text-xs text-text-secondary mb-2 border-b border-white/10 pb-1">🎯 속성 상성</div>
                <div className={`text-center text-sm py-2 rounded ${
                  comparison.attribute.hasAdvantage && !comparison.attribute.hasDisadvantage
                    ? 'bg-green-500/20 text-green-400'
                    : comparison.attribute.hasDisadvantage && !comparison.attribute.hasAdvantage
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-white/10 text-text-secondary'
                }`}>
                  {comparison.attribute.description}
                </div>
              </div>

              {/* 추천도 */}
              <div className={`rounded-lg p-3 text-center ${
                comparison.recommendation.level === 'high'
                  ? 'bg-green-500/20 border border-green-500/30'
                  : comparison.recommendation.level === 'medium'
                    ? 'bg-yellow-500/20 border border-yellow-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
              }`}>
                <div className="text-lg font-bold mb-1">{comparison.recommendation.label}</div>
                <div className="flex justify-center gap-2 flex-wrap mb-2">
                  {comparison.recommendation.reasons.map((r, i) => (
                    <span key={i} className="text-xs bg-white/10 px-2 py-0.5 rounded">{r}</span>
                  ))}
                </div>
                <div className="text-xs text-text-secondary">
                  8강 진출 확률:
                  <span className={`font-bold ml-1 ${
                    comparison.recommendation.level === 'high' ? 'text-green-400' :
                    comparison.recommendation.level === 'medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {comparison.recommendation.level === 'high' ? '높음' :
                     comparison.recommendation.level === 'medium' ? '보통' : '낮음'}
                  </span>
                </div>
              </div>

              {/* 버튼 */}
              <div className="flex justify-center gap-3 mt-4">
                <Button variant="ghost" onClick={handleCancelSelection}>
                  ❌ 취소
                </Button>
                <Button variant="primary" onClick={handleConfirmNomination}>
                  ✅ 지명 확정
                </Button>
              </div>
            </motion.div>
          )}

          {/* 카드 목록 (선택 전) */}
          {!selectedId && (
            <>
              <div className="text-center text-sm text-text-secondary mb-2">
                ── 지명 가능 ({availableCards.length}명) ──
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-1">
                {availableCards.map(p => {
                  const char = CHARACTERS_BY_ID[p.odId];
                  const isPlayerCard = playerCardIds.includes(p.odId);

                  return (
                    <motion.div
                      key={p.odId}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedId(p.odId)}
                      className={`
                        bg-bg-secondary rounded-lg p-3 cursor-pointer border-2 transition-colors
                        border-transparent hover:border-accent/50
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
              <p className="text-xs text-text-secondary text-center">
                💡 카드를 클릭하면 비교 분석을 확인할 수 있습니다
              </p>
            </>
          )}
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
