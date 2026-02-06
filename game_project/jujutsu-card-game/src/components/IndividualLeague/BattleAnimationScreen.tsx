// ========================================
// 전투 애니메이션 화면 컴포넌트 (Phase 3)
// 스킬 이펙트, 배속 조절, 전투 로그 추가
// ========================================

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import { Button } from '../UI/Button';
import type { SimMatchResult, SimBattleTurn } from '../../types/individualLeague';

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

// 전투 로그 컴포넌트
function BattleLog({ logs }: { logs: SimBattleTurn[] }) {
  const recentLogs = logs.slice(-3);

  return (
    <div className="bg-black/50 rounded-lg p-2 text-xs space-y-1 max-h-20 overflow-hidden">
      {recentLogs.map((log, idx) => (
        <motion.div
          key={`${log.turnNumber}-${idx}`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-text-secondary"
        >
          <span className="text-accent">▶</span>{' '}
          <span className={log.isCritical ? 'text-yellow-400' : 'text-text-primary'}>
            {log.attackerName}
          </span>
          {log.actionType === 'ultimate' && <span className="text-purple-400"> (필살기)</span>}
          {log.actionType === 'skill' && <span className="text-blue-400"> (스킬)</span>}
          {' → '}
          <span className="text-red-400">{log.damage}</span> 데미지
          {log.isCritical && <span className="text-yellow-400"> 크리티컬!</span>}
        </motion.div>
      ))}
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

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

    setIsAnimating(true);
    setBattleLogs([]);
    setCurrentTurnIndex(0);

    const turns = currentSet.turns;
    const winnerId = currentSet.winnerId;
    const isP1Winner = winnerId === p1.odId;
    const winnerHp = currentSet.winnerHpPercent;

    // 턴별 애니메이션 시퀀스
    const animateTurns = async () => {
      // HP 초기화
      let currentP1Hp = 100;
      let currentP2Hp = 100;

      for (let i = 0; i < turns.length; i++) {
        const turn = turns[i];
        const isP1Attacking = turn.attackerId === p1.odId;
        const attacker = isP1Attacking ? 'p1' : 'p2';
        const defender = isP1Attacking ? 'p2' : 'p1';

        // 공격자 애니메이션
        setAttackingPlayer(attacker);
        await new Promise(r => setTimeout(r, getDelay(200)));

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

        // 로그 추가
        setBattleLogs(prev => [...prev, turn]);
        setCurrentTurnIndex(i + 1);

        await new Promise(r => setTimeout(r, getDelay(400)));

        // 이펙트 제거
        setAttackingPlayer(null);
        setShowDamage(null);
        setCurrentSkillEffect(null);

        await new Promise(r => setTimeout(r, getDelay(200)));
      }

      // 최종 HP 설정 (시뮬레이션 결과와 맞춤)
      if (isP1Winner) {
        setP1Hp(winnerHp);
        setP2Hp(0);
      } else {
        setP1Hp(0);
        setP2Hp(winnerHp);
      }

      setIsAnimating(false);

      // 세트 종료로 전환
      await new Promise(r => setTimeout(r, getDelay(500)));
      setPhase('SET_END');
    };

    animateTurns();
  }, [currentSet, p1.odId, getDelay]);

  // 세트 종료 처리
  useEffect(() => {
    if (phase === 'SET_END') {
      // 스코어 업데이트
      const winnerId = currentSet?.winnerId;
      if (winnerId === p1.odId) {
        setP1Score(prev => prev + 1);
      } else {
        setP2Score(prev => prev + 1);
      }

      timerRef.current = setTimeout(() => {
        // 다음 세트 또는 경기 종료
        if (currentSetIndex < matchResult.sets.length - 1) {
          setCurrentSetIndex(prev => prev + 1);
          setP1Hp(100);
          setP2Hp(100);
          setBattleLogs([]);  // 로그 초기화
          setCurrentTurnIndex(0);  // 턴 인덱스 초기화
          setPhase('SET_START');
        } else {
          setPhase('MATCH_END');
        }
      }, getDelay(1500));
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, currentSetIndex, matchResult.sets.length, currentSet, p1.odId, getDelay]);

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
                Turn {currentTurnIndex}/{currentSet.turns.length}
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

            {/* P1 (왼쪽) */}
            <motion.div
              animate={{
                x: attackingPlayer === 'p1' ? 50 : 0,
                scale: attackingPlayer === 'p1' ? 1.1 : 1,
              }}
              transition={{ duration: 0.15 }}
              className="flex-1 text-center"
            >
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
                {p1.isPlayerCrew && '* '}
                {p1.odName}
              </div>

              {/* HP 바 */}
              <div className="relative w-full h-6 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${p1Hp}%` }}
                  transition={{ duration: 0.3 }}
                  className={`h-full ${
                    p1Hp > 50 ? 'bg-green-500' : p1Hp > 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                  {p1Hp}%
                </div>
              </div>

              {/* 데미지 표시 */}
              <AnimatePresence>
                {showDamage?.player === 'p1' && (
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -30 }}
                    exit={{ opacity: 0 }}
                    className="text-2xl font-bold text-red-500"
                  >
                    -{showDamage.amount}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* VS + 스킬 이펙트 */}
            <div className="relative flex flex-col items-center">
              <div className="text-4xl font-bold text-white/50">VS</div>

              {/* 스킬 이펙트 표시 */}
              <AnimatePresence>
                {currentSkillEffect && (
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
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

            {/* P2 (오른쪽) */}
            <motion.div
              animate={{
                x: attackingPlayer === 'p2' ? -50 : 0,
                scale: attackingPlayer === 'p2' ? 1.1 : 1,
              }}
              transition={{ duration: 0.15 }}
              className="flex-1 text-center"
            >
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
                {p2.isPlayerCrew && '* '}
                {p2.odName}
              </div>

              {/* HP 바 */}
              <div className="relative w-full h-6 bg-gray-700 rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${p2Hp}%` }}
                  transition={{ duration: 0.3 }}
                  className={`h-full ${
                    p2Hp > 50 ? 'bg-green-500' : p2Hp > 25 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                  {p2Hp}%
                </div>
              </div>

              {/* 데미지 표시 */}
              <AnimatePresence>
                {showDamage?.player === 'p2' && (
                  <motion.div
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: 1, y: -30 }}
                    exit={{ opacity: 0 }}
                    className="text-2xl font-bold text-red-500"
                  >
                    -{showDamage.amount}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* 전투 로그 */}
          {phase === 'BATTLE' && battleLogs.length > 0 && (
            <div className="mt-4">
              <BattleLog logs={battleLogs} />
            </div>
          )}

          {/* 세트 결과 표시 */}
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
