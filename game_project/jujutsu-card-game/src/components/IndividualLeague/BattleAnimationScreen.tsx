// ========================================
// 전투 애니메이션 화면 컴포넌트 (Phase 4.2)
// TurnBattleModal 스타일 통합 + 필살기 게이지 + 상태이상 표시
// ========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import { getStatusEffect } from '../../data/statusEffects';
import { Button } from '../UI/Button';
import type { SimMatchResult, SimBattleTurn } from '../../types/individualLeague';
import type { AppliedStatusEffect } from '../../types';
import {
  getAttackComment,
  getUltimateComment,
  getHpStatusComment,
  getReversalComment,
} from '../../utils/battleCommentarySystem';

// 게이지 충전 상수
const GAUGE_PER_TURN = { min: 25, max: 35 };

interface BattleAnimationScreenProps {
  matchResult: SimMatchResult;
  onComplete: () => void;
}

type BattleSpeed = 1 | 2 | 4;
type BattlePhase = 'INTRO' | 'SET_START' | 'BATTLE' | 'SET_END' | 'MATCH_END';

// 스킬 이펙트 타입별 색상
const ACTION_COLORS: Record<string, string> = {
  basic: 'text-white',
  skill: 'text-blue-400',
  ultimate: 'text-purple-500'
};

// 게이지 충전 함수
const chargeGauge = (currentGauge: number): number => {
  const charge = GAUGE_PER_TURN.min + Math.random() * (GAUGE_PER_TURN.max - GAUGE_PER_TURN.min);
  return Math.min(currentGauge + charge, 100);
};

// 상태이상 표시 컴포넌트
function StatusEffectDisplay({ effects }: { effects: AppliedStatusEffect[] }) {
  if (effects.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 justify-center mt-2">
      {effects.map((effect, idx) => {
        const statusDef = getStatusEffect(effect.statusId);
        if (!statusDef) return null;
        const isBuff = statusDef.type === 'BUFF';
        return (
          <motion.div
            key={`${effect.statusId}-${idx}`}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`text-xs px-1.5 py-0.5 rounded ${
              isBuff ? 'bg-green-500/30 text-green-300' : 'bg-red-500/30 text-red-300'
            }`}
            title={`${statusDef.name} (${effect.remainingDuration}턴)`}
          >
            {statusDef.icon} {effect.stacks > 1 && `x${effect.stacks}`}
          </motion.div>
        );
      })}
    </div>
  );
}

// 스킬 이펙트 컴포넌트
function SkillEffectDisplay({
  actionName,
  actionType,
  damage,
  isCritical
}: {
  actionName: string;
  actionType: 'basic' | 'skill' | 'ultimate';
  damage: number;
  isCritical: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.5 }}
      className="text-center"
    >
      {actionType === 'ultimate' && (
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="text-3xl mb-1"
        >
          ✨
        </motion.div>
      )}
      <div className={`text-2xl font-bold ${isCritical ? 'text-yellow-400' : 'text-red-500'}`}>
        -{damage}
      </div>
      {isCritical && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.3 }}
          className="text-yellow-400 text-sm font-bold"
        >
          CRITICAL!
        </motion.div>
      )}
      <div className={`text-lg ${ACTION_COLORS[actionType]}`}>
        「{actionName}」
      </div>
    </motion.div>
  );
}

// 턴별 해설 생성 함수
function generateCommentary(
  turn: SimBattleTurn,
  defenderHpPercent: number,
  previousHpPercent: number
): string | null {
  // 필살기 발동
  if (turn.actionType === 'ultimate') {
    return getUltimateComment(turn.attackerName, turn.actionName, turn.damage);
  }

  // 크리티컬 히트
  if (turn.isCritical) {
    return getAttackComment(turn.attackerName, turn.defenderName, turn.damage, true);
  }

  // HP 위험 (50% 이상에서 25% 이하로 떨어진 경우)
  if (previousHpPercent > 25 && defenderHpPercent <= 25 && defenderHpPercent > 0) {
    return getHpStatusComment(turn.defenderName, defenderHpPercent);
  }

  // 역전 상황 (상대 HP가 높았는데 반격)
  if (previousHpPercent <= 30 && turn.damage >= 20) {
    return getReversalComment(turn.attackerName);
  }

  // 일반 공격 (50% 확률로 해설)
  if (turn.damage >= 40 && Math.random() < 0.5) {
    return getAttackComment(turn.attackerName, turn.defenderName, turn.damage, false);
  }

  return null;
}

// 전투 로그 컴포넌트 (Phase 4.2: TurnBattleModal 스타일)
function BattleLog({
  logs,
  p1Hp,
  p2Hp,
  p1Id,
}: {
  logs: SimBattleTurn[];
  p1Hp: number;
  p2Hp: number;
  p1Id: string;
}) {
  return (
    <div className="bg-bg-card/50 rounded-xl p-4 h-48 overflow-y-auto border border-white/10">
      <div className="space-y-2">
        <AnimatePresence>
          {logs.map((log, idx) => {
            // 방어자 HP 계산
            const isP1Attacker = log.attackerId === p1Id;
            const defenderHp = isP1Attacker ? p2Hp : p1Hp;
            const previousHp = defenderHp + log.damage;

            // 해설 생성
            const commentary = generateCommentary(log, defenderHp, previousHp);

            return (
              <motion.div
                key={`${log.turnNumber}-${idx}`}
                initial={{ opacity: 0, x: isP1Attacker ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`text-sm p-2 rounded ${
                  log.actionType === 'ultimate'
                    ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-500/50'
                    : isP1Attacker
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-red-500/20 text-red-300'
                } ${log.isCritical ? 'font-bold' : ''}`}
              >
                <span className="text-xs text-text-secondary mr-2">[턴 {log.turnNumber}]</span>
                {log.attackerName}의 【{log.actionName}】!
                {log.isCritical && <span className="text-yellow-400"> 크리티컬!</span>}
                {' '}<span className="text-red-400">{log.damage}</span> 데미지!

                {/* 해설 메시지 */}
                {commentary && (
                  <div className="text-xs text-accent/80 mt-1 italic">
                    💬 {commentary}
                  </div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function BattleAnimationScreen({ matchResult, onComplete }: BattleAnimationScreenProps) {
  const [speed, setSpeed] = useState<BattleSpeed>(1);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [phase, setPhase] = useState<BattlePhase>('INTRO');
  const [p1Hp, setP1Hp] = useState(100);
  const [p2Hp, setP2Hp] = useState(100);
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [attackingPlayer, setAttackingPlayer] = useState<'p1' | 'p2' | null>(null);
  const [showDamage, setShowDamage] = useState<{ player: 'p1' | 'p2'; amount: number } | null>(null);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [battleLogs, setBattleLogs] = useState<SimBattleTurn[]>([]);
  const [currentSkillEffect, setCurrentSkillEffect] = useState<{
    actionName: string;
    actionType: 'basic' | 'skill' | 'ultimate';
    damage: number;
    isCritical: boolean;
    target: 'p1' | 'p2';
  } | null>(null);

  // Phase 4.2: 필살기 게이지 및 상태이상
  const [p1Gauge, setP1Gauge] = useState(0);
  const [p2Gauge, setP2Gauge] = useState(0);
  const [p1Effects, setP1Effects] = useState<AppliedStatusEffect[]>([]);
  const [p2Effects, setP2Effects] = useState<AppliedStatusEffect[]>([]);

  // Phase 4.3: 세트 종료 시 사용자 입력 대기
  const [waitingForContinue, setWaitingForContinue] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Phase 4.3: 배틀 애니메이션 중단 플래그
  const shouldStopRef = useRef(false);

  const p1 = matchResult.participant1;
  const p2 = matchResult.participant2;
  const card1 = CHARACTERS_BY_ID[p1.odId];
  const card2 = CHARACTERS_BY_ID[p2.odId];
  const currentSet = matchResult.sets[currentSetIndex];

  // 타이밍 계산 (배속 적용)
  const getDelay = useCallback((baseDelay: number) => baseDelay / speed, [speed]);

  // 인트로 → 세트 시작
  useEffect(() => {
    if (phase === 'INTRO') {
      timerRef.current = setTimeout(() => {
        setPhase('SET_START');
      }, getDelay(1500));
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, getDelay]);

  // 세트 시작 → 배틀
  useEffect(() => {
    if (phase === 'SET_START') {
      timerRef.current = setTimeout(() => {
        setPhase('BATTLE');
      }, getDelay(1000));
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, getDelay]);

  // 배틀 페이즈 시작시 애니메이션 실행
  useEffect(() => {
    if (phase === 'BATTLE' && !isAnimating) {
      startBattleAnimation();
    }
  }, [phase, isAnimating]);

  // 배틀 애니메이션 (턴별 실제 데이터 사용)
  const startBattleAnimation = useCallback(() => {
    if (!currentSet) return;

    // Phase 4.3: 애니메이션 시작 시 중단 플래그 초기화
    shouldStopRef.current = false;

    setIsAnimating(true);
    setBattleLogs([]);
    setCurrentTurnIndex(0);
    // 게이지 초기화
    setP1Gauge(0);
    setP2Gauge(0);
    setP1Effects([]);
    setP2Effects([]);

    const turns = currentSet.turns;
    const winnerId = currentSet.winnerId;
    const isP1Winner = winnerId === p1.odId;
    const winnerHp = currentSet.winnerHpPercent;

    // 턴별 애니메이션 시퀀스
    const animateTurns = async () => {
      // HP 초기화
      let currentP1Hp = 100;
      let currentP2Hp = 100;
      let currentP1Gauge = 0;
      let currentP2Gauge = 0;

      for (let i = 0; i < turns.length; i++) {
        // Phase 4.3: 중단 플래그 확인 (스킵/세트 종료 시 루프 중단)
        if (shouldStopRef.current) {
          break;
        }

        const turn = turns[i];
        const isP1Attacking = turn.attackerId === p1.odId;
        const attacker = isP1Attacking ? 'p1' : 'p2';
        const defender = isP1Attacking ? 'p2' : 'p1';

        // 공격자 애니메이션
        setAttackingPlayer(attacker);
        await new Promise(r => setTimeout(r, getDelay(200)));

        // Phase 4.3: 중단 플래그 재확인
        if (shouldStopRef.current) break;

        // 스킬 이펙트 표시
        setCurrentSkillEffect({
          actionName: turn.actionName,
          actionType: turn.actionType,
          damage: turn.damage,
          isCritical: turn.isCritical,
          target: defender
        });

        // 데미지 적용
        if (defender === 'p1') {
          currentP1Hp = Math.max(0, currentP1Hp - turn.damage);
          setP1Hp(currentP1Hp);
          setShowDamage({ player: 'p1', amount: turn.damage });
        } else {
          currentP2Hp = Math.max(0, currentP2Hp - turn.damage);
          setP2Hp(currentP2Hp);
          setShowDamage({ player: 'p2', amount: turn.damage });
        }

        // Phase 4.2: 게이지 충전/리셋 로직
        if (turn.actionType === 'ultimate') {
          // 필살기 사용 시 게이지 리셋
          if (isP1Attacking) {
            currentP1Gauge = 0;
            setP1Gauge(0);
          } else {
            currentP2Gauge = 0;
            setP2Gauge(0);
          }
        } else {
          // 일반 공격/스킬 시 양측 게이지 충전
          currentP1Gauge = chargeGauge(currentP1Gauge);
          currentP2Gauge = chargeGauge(currentP2Gauge);
          setP1Gauge(currentP1Gauge);
          setP2Gauge(currentP2Gauge);
        }

        // 로그 추가
        setBattleLogs(prev => [...prev, turn]);
        setCurrentTurnIndex(i + 1);

        await new Promise(r => setTimeout(r, getDelay(400)));

        // Phase 4.3: 중단 플래그 재확인
        if (shouldStopRef.current) break;

        // 이펙트 제거
        setAttackingPlayer(null);
        setShowDamage(null);
        setCurrentSkillEffect(null);

        await new Promise(r => setTimeout(r, getDelay(200)));
      }

      // Phase 4.3: 중단된 경우 이펙트 정리
      if (shouldStopRef.current) {
        setAttackingPlayer(null);
        setShowDamage(null);
        setCurrentSkillEffect(null);
        setIsAnimating(false);
        return;
      }

      // 최종 HP 설정 (시뮬레이션 결과와 맞춤)
      if (isP1Winner) {
        setP1Hp(winnerHp);
        setP2Hp(0);
      } else {
        setP1Hp(0);
        setP2Hp(winnerHp);
      }

      // Phase 4.3 버그 수정: phase를 먼저 SET_END로 변경하여
      // useEffect에서 전투가 재시작되는 것을 방지
      // (기존: isAnimating=false 후 500ms 대기 중 phase가 BATTLE이어서 재시작됨)
      if (!shouldStopRef.current) {
        setPhase('SET_END');
      }

      // phase 변경 후에 isAnimating을 false로 설정
      setIsAnimating(false);
    };

    animateTurns();
  }, [currentSet, p1.odId, getDelay]);

  // 세트 종료 처리 (Phase 4.3: 사용자 입력 대기로 변경)
  useEffect(() => {
    if (phase === 'SET_END' && !waitingForContinue) {
      // 스코어 업데이트
      const winnerId = currentSet?.winnerId;
      if (winnerId === p1.odId) {
        setP1Score(prev => prev + 1);
      } else {
        setP2Score(prev => prev + 1);
      }

      // Phase 4.3: 자동 진행 대신 사용자 입력 대기
      timerRef.current = setTimeout(() => {
        setWaitingForContinue(true);
      }, getDelay(1000));
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, waitingForContinue, currentSet, p1.odId, getDelay]);

  // Phase 4.3: 다음 세트로 진행 핸들러
  const handleContinueToNextSet = useCallback(() => {
    setWaitingForContinue(false);

    // 경기 종료 체크 (마지막 세트 여부)
    if (currentSetIndex < matchResult.sets.length - 1) {
      // 다음 세트로 진행
      setCurrentSetIndex(prev => prev + 1);
      setP1Hp(100);
      setP2Hp(100);
      setP1Gauge(0);
      setP2Gauge(0);
      setBattleLogs([]);
      setCurrentTurnIndex(0);
      setPhase('SET_START');
    } else {
      // 경기 종료
      setPhase('MATCH_END');
    }
  }, [currentSetIndex, matchResult.sets.length]);

  // 배속 변경
  const handleSpeedChange = () => {
    setSpeed(prev => {
      if (prev === 1) return 2;
      if (prev === 2) return 4;
      return 1;
    });
  };

  // 스킵
  const handleSkip = () => {
    // Phase 4.3: 진행 중인 애니메이션 중단
    shouldStopRef.current = true;
    setIsAnimating(false);
    setAttackingPlayer(null);
    setShowDamage(null);
    setCurrentSkillEffect(null);

    // 최종 결과로 바로 이동
    setP1Score(matchResult.score[0]);
    setP2Score(matchResult.score[1]);
    setCurrentSetIndex(matchResult.sets.length - 1);
    setPhase('MATCH_END');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* 상단: 스코어보드 */}
      <div className="bg-gradient-to-b from-bg-secondary to-transparent p-4">
        <div className="max-w-4xl mx-auto">
          {/* 경기장 정보 + 턴 카운터 */}
          <div className="text-center mb-2 flex items-center justify-center gap-4">
            <span className="text-sm text-purple-400">
              {currentSet?.arenaName || '경기장'}
            </span>
            {phase === 'BATTLE' && currentSet && (
              <span className="text-sm text-yellow-400">
                Turn {currentTurnIndex}
              </span>
            )}
          </div>

          {/* 스코어 */}
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className={`text-3xl font-bold ${p1.isPlayerCrew ? 'text-yellow-400' : 'text-white'}`}>
                {p1Score}
              </div>
            </div>
            <div className="text-xl text-text-secondary">:</div>
            <div className="text-center">
              <div className={`text-3xl font-bold ${p2.isPlayerCrew ? 'text-yellow-400' : 'text-white'}`}>
                {p2Score}
              </div>
            </div>
          </div>

          {/* 세트 표시 */}
          <div className="flex justify-center gap-2 mt-2">
            {matchResult.sets.map((set, idx) => (
              <div
                key={idx}
                className={`w-3 h-3 rounded-full ${
                  idx < currentSetIndex
                    ? set.winnerId === p1.odId
                      ? 'bg-accent'
                      : 'bg-red-500'
                    : idx === currentSetIndex
                    ? 'bg-yellow-400 animate-pulse'
                    : 'bg-white/20'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 중앙: 배틀 필드 */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        <div className="max-w-4xl w-full">
          <div className="flex items-center justify-between gap-8">

            {/* P1 (왼쪽) - Phase 4.3: 카드 고정 (움직임 애니메이션 제거) */}
            <div className="flex-1 text-center relative">
              {/* 캐릭터 이미지 */}
              <div className={`
                w-40 h-40 mx-auto rounded-xl overflow-hidden mb-4
                border-4 ${p1.isPlayerCrew ? 'border-yellow-400' : 'border-accent/50'}
                ${attackingPlayer === 'p2' ? 'animate-shake' : ''}
              `}>
                {card1 && (
                  <img
                    src={getCharacterImage(card1.id, card1.name.ko, card1.attribute)}
                    alt={card1.name.ko}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* 이름 */}
              <div className="text-lg font-bold text-white mb-2">
                {p1.isPlayerCrew && '⭐ '}
                {p1.odName}
              </div>

              {/* HP 바 (TurnBattleModal 스타일) */}
              <div className="mb-2">
                <div className="text-xs text-text-secondary mb-1">HP</div>
                <div className="w-36 h-4 bg-black/50 rounded-full overflow-hidden border border-white/20 mx-auto">
                  <motion.div
                    className="h-full"
                    style={{
                      background: p1Hp > 50
                        ? 'linear-gradient(to right, #22c55e, #4ade80)'
                        : p1Hp > 25
                          ? 'linear-gradient(to right, #eab308, #facc15)'
                          : 'linear-gradient(to right, #ef4444, #f87171)'
                    }}
                    animate={{ width: `${p1Hp}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="text-xs mt-1 text-text-secondary">{p1Hp}/100</div>
              </div>

              {/* 필살기 게이지 바 */}
              <div className="mb-2">
                <div className="text-xs text-accent mb-1">
                  ⚡ 필살기 {p1Gauge >= 100 ? '준비완료!' : `${Math.round(p1Gauge)}%`}
                </div>
                <div className="w-32 h-2 bg-black/50 rounded-full overflow-hidden border border-white/20 mx-auto">
                  <motion.div
                    className={`h-full ${
                      p1Gauge >= 100
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse'
                        : 'bg-gradient-to-r from-purple-500 to-purple-400'
                    }`}
                    animate={{ width: `${Math.min(p1Gauge, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* 상태이상 표시 */}
              <StatusEffectDisplay effects={p1Effects} />

              {/* 데미지 표시 */}
              <AnimatePresence>
                {showDamage?.player === 'p1' && (
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -30 }}
                    exit={{ opacity: 0 }}
                    className="text-2xl font-bold text-red-500 mt-2"
                  >
                    -{showDamage.amount}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* VS + 턴 카운터 + 스킬 이펙트 */}
            <div className="relative flex flex-col items-center">
              <div className="flex flex-col items-center">
                <div className="text-3xl font-bold text-accent mb-2">VS</div>
                {phase === 'BATTLE' && currentSet && (
                  <div className="text-sm text-text-secondary">
                    턴 {currentTurnIndex}
                  </div>
                )}
              </div>

              {/* 스킬 이펙트 표시 */}
              <AnimatePresence>
                {currentSkillEffect && (
                  <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
                    <SkillEffectDisplay
                      actionName={currentSkillEffect.actionName}
                      actionType={currentSkillEffect.actionType}
                      damage={currentSkillEffect.damage}
                      isCritical={currentSkillEffect.isCritical}
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* P2 (오른쪽) - Phase 4.3: 카드 고정 (움직임 애니메이션 제거) */}
            <div className="flex-1 text-center relative">
              {/* 캐릭터 이미지 */}
              <div className={`
                w-40 h-40 mx-auto rounded-xl overflow-hidden mb-4
                border-4 ${p2.isPlayerCrew ? 'border-yellow-400' : 'border-red-500/50'}
                ${attackingPlayer === 'p1' ? 'animate-shake' : ''}
              `}>
                {card2 && (
                  <img
                    src={getCharacterImage(card2.id, card2.name.ko, card2.attribute)}
                    alt={card2.name.ko}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* 이름 */}
              <div className="text-lg font-bold text-white mb-2">
                {p2.isPlayerCrew && '⭐ '}
                {p2.odName}
              </div>

              {/* HP 바 (TurnBattleModal 스타일) */}
              <div className="mb-2">
                <div className="text-xs text-text-secondary mb-1">HP</div>
                <div className="w-36 h-4 bg-black/50 rounded-full overflow-hidden border border-white/20 mx-auto">
                  <motion.div
                    className="h-full"
                    style={{
                      background: p2Hp > 50
                        ? 'linear-gradient(to right, #22c55e, #4ade80)'
                        : p2Hp > 25
                          ? 'linear-gradient(to right, #eab308, #facc15)'
                          : 'linear-gradient(to right, #ef4444, #f87171)'
                    }}
                    animate={{ width: `${p2Hp}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="text-xs mt-1 text-text-secondary">{p2Hp}/100</div>
              </div>

              {/* 필살기 게이지 바 */}
              <div className="mb-2">
                <div className="text-xs text-accent mb-1">
                  ⚡ 필살기 {p2Gauge >= 100 ? '준비완료!' : `${Math.round(p2Gauge)}%`}
                </div>
                <div className="w-32 h-2 bg-black/50 rounded-full overflow-hidden border border-white/20 mx-auto">
                  <motion.div
                    className={`h-full ${
                      p2Gauge >= 100
                        ? 'bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse'
                        : 'bg-gradient-to-r from-purple-500 to-purple-400'
                    }`}
                    animate={{ width: `${Math.min(p2Gauge, 100)}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              {/* 상태이상 표시 */}
              <StatusEffectDisplay effects={p2Effects} />

              {/* 데미지 표시 */}
              <AnimatePresence>
                {showDamage?.player === 'p2' && (
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -30 }}
                    exit={{ opacity: 0 }}
                    className="text-2xl font-bold text-red-500 mt-2"
                  >
                    -{showDamage.amount}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* 전투 로그 (Phase 4.2: TurnBattleModal 스타일) */}
          {phase === 'BATTLE' && battleLogs.length > 0 && (
            <div className="mt-4">
              <BattleLog
                logs={battleLogs}
                p1Hp={p1Hp}
                p2Hp={p2Hp}
                p1Id={p1.odId}
              />
            </div>
          )}

          {/* 세트 결과 표시 (Phase 4.3: 계속하기 버튼 추가) */}
          <AnimatePresence>
            {phase === 'SET_END' && currentSet && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute inset-0 flex items-center justify-center bg-black/50"
              >
                <div className="bg-bg-secondary rounded-xl border border-white/20 p-8 text-center">
                  <div className="text-2xl font-bold mb-2">
                    세트 {currentSet.setNumber} 종료
                  </div>
                  <div className={`text-3xl font-bold ${
                    currentSet.winnerId === p1.odId
                      ? (p1.isPlayerCrew ? 'text-yellow-400' : 'text-accent')
                      : (p2.isPlayerCrew ? 'text-yellow-400' : 'text-red-400')
                  }`}>
                    {currentSet.winnerName} 승리!
                  </div>
                  <div className="text-sm text-text-secondary mt-2">
                    HP {currentSet.winnerHpPercent}% 남음
                  </div>

                  {/* 현재 스코어 표시 */}
                  <div className="mt-4 flex justify-center items-center gap-4 text-xl">
                    <span className={p1.isPlayerCrew ? 'text-yellow-400' : 'text-accent'}>{p1Score}</span>
                    <span className="text-text-secondary">:</span>
                    <span className={p2.isPlayerCrew ? 'text-yellow-400' : 'text-red-400'}>{p2Score}</span>
                  </div>

                  {/* Phase 4.3: 계속하기 버튼 */}
                  {waitingForContinue && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6"
                    >
                      <Button
                        variant="primary"
                        onClick={handleContinueToNextSet}
                        className="px-8 py-3 text-lg"
                      >
                        {currentSetIndex < matchResult.sets.length - 1
                          ? '다음 세트 시작'
                          : '경기 결과 보기'}
                      </Button>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 하단: 컨트롤 */}
      <div className="bg-gradient-to-t from-bg-secondary to-transparent p-4">
        <div className="max-w-4xl mx-auto flex justify-center gap-4">
          {phase !== 'MATCH_END' ? (
            <>
              <Button
                variant="secondary"
                onClick={handleSpeedChange}
                className="min-w-[80px]"
              >
                {speed}x 속도
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkip}
              >
                {'>>'} 스킵
              </Button>
            </>
          ) : (
            <Button
              variant="primary"
              onClick={onComplete}
              className="px-8"
            >
              확인
            </Button>
          )}
        </div>
      </div>

      {/* 경기 종료 결과 */}
      <AnimatePresence>
        {phase === 'MATCH_END' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/80"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-bg-secondary rounded-xl border border-white/20 p-8 max-w-lg w-full mx-4"
            >
              <div className="text-center mb-6">
                <div className="text-4xl mb-2">
                  {(matchResult.winnerId === p1.odId && p1.isPlayerCrew) ||
                   (matchResult.winnerId === p2.odId && p2.isPlayerCrew)
                    ? '(*)'
                    : '(-)'}
                </div>
                <div className="text-2xl font-bold text-yellow-400">
                  {(matchResult.winnerId === p1.odId && p1.isPlayerCrew) ||
                   (matchResult.winnerId === p2.odId && p2.isPlayerCrew)
                    ? '승리!'
                    : '패배'}
                </div>
              </div>

              {/* 최종 스코어 */}
              <div className="flex justify-center items-center gap-8 mb-6">
                <div className="text-center">
                  <div className={`text-lg font-bold ${p1.isPlayerCrew ? 'text-yellow-400' : 'text-white'}`}>
                    {p1.odName}
                  </div>
                  <div className="text-3xl font-bold text-accent">{matchResult.score[0]}</div>
                </div>
                <div className="text-2xl text-text-secondary">:</div>
                <div className="text-center">
                  <div className={`text-lg font-bold ${p2.isPlayerCrew ? 'text-yellow-400' : 'text-white'}`}>
                    {p2.odName}
                  </div>
                  <div className="text-3xl font-bold text-red-400">{matchResult.score[1]}</div>
                </div>
              </div>

              {/* 세트별 결과 */}
              <div className="bg-bg-primary/50 rounded-lg p-4 mb-6">
                <div className="text-sm font-bold text-text-primary mb-2">세트별 결과</div>
                <div className="space-y-2">
                  {matchResult.sets.map((set, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-text-secondary">
                        세트 {set.setNumber} ({set.arenaName})
                      </span>
                      <span className={
                        (set.winnerId === p1.odId && p1.isPlayerCrew) ||
                        (set.winnerId === p2.odId && p2.isPlayerCrew)
                          ? 'text-green-400'
                          : 'text-red-400'
                      }>
                        {set.winnerName} 승 (HP: {set.winnerHpPercent}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="primary"
                onClick={onComplete}
                className="w-full"
              >
                확인
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default BattleAnimationScreen;
