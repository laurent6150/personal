// ========================================
// 전투 애니메이션 컴포넌트
// ========================================

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SimBattleTurn, SimSetResult, Participant } from '../../types/individualLeague';
import './BattleAnimation.css';

interface BattleAnimationProps {
  participant1: Participant;
  participant2: Participant;
  currentSet: SimSetResult | null;
  isPlaying: boolean;
  onTurnComplete?: (turnIndex: number) => void;
  onSetComplete?: () => void;
  playbackSpeed?: number; // 1 = 정상, 2 = 2배속
}

interface DamagePopup {
  id: string;
  damage: number;
  isCritical: boolean;
  side: 'left' | 'right';
  x: number;
  y: number;
}

export function BattleAnimation({
  participant1,
  participant2,
  currentSet,
  isPlaying,
  onTurnComplete,
  onSetComplete,
  playbackSpeed = 1
}: BattleAnimationProps) {
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [p1Hp, setP1Hp] = useState(100);
  const [p2Hp, setP2Hp] = useState(100);
  const [attackingSide, setAttackingSide] = useState<'left' | 'right' | null>(null);
  const [hitSide, setHitSide] = useState<'left' | 'right' | null>(null);
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [showFlash, setShowFlash] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>('');
  const [showSetResult, setShowSetResult] = useState(false);

  const baseDelay = 1000 / playbackSpeed;

  // 세트 변경 시 리셋
  useEffect(() => {
    setCurrentTurnIndex(0);
    setP1Hp(100);
    setP2Hp(100);
    setShowSetResult(false);
    setAttackingSide(null);
    setHitSide(null);
    setCurrentAction('');
  }, [currentSet?.setNumber]);

  // 턴 진행
  const playTurn = useCallback((turn: SimBattleTurn, turnIndex: number) => {
    const isP1Attacker = turn.attackerId === participant1.odId;
    const attackerSide: 'left' | 'right' = isP1Attacker ? 'left' : 'right';
    const defenderSide: 'left' | 'right' = isP1Attacker ? 'right' : 'left';

    // 액션 텍스트 표시
    setCurrentAction(`${turn.attackerName}: ${turn.actionName}`);

    // 공격 애니메이션
    setAttackingSide(attackerSide);

    setTimeout(() => {
      // 피격 효과
      setHitSide(defenderSide);
      setShowFlash(true);

      // 데미지 팝업
      const popup: DamagePopup = {
        id: `${turnIndex}-${Date.now()}`,
        damage: turn.damage,
        isCritical: turn.isCritical,
        side: defenderSide,
        x: defenderSide === 'left' ? 20 : 70,
        y: 30 + Math.random() * 20
      };
      setDamagePopups(prev => [...prev, popup]);

      // HP 업데이트
      if (isP1Attacker) {
        // P2가 피격
        const newHp = Math.max(0, Math.round(turn.defenderHpAfter));
        setP2Hp(newHp);
      } else {
        // P1이 피격
        const newHp = Math.max(0, Math.round(turn.defenderHpAfter));
        setP1Hp(newHp);
      }

      setTimeout(() => {
        setShowFlash(false);
      }, baseDelay * 0.2);

      setTimeout(() => {
        setHitSide(null);
        setAttackingSide(null);
      }, baseDelay * 0.3);

    }, baseDelay * 0.4);

    // 데미지 팝업 제거
    setTimeout(() => {
      setDamagePopups(prev => prev.filter(p => p.id !== `${turnIndex}-${Date.now()}`));
    }, baseDelay * 1.2);

  }, [participant1.odId, baseDelay]);

  // 자동 재생
  useEffect(() => {
    if (!isPlaying || !currentSet || currentTurnIndex >= currentSet.turns.length) {
      return;
    }

    const turn = currentSet.turns[currentTurnIndex];
    playTurn(turn, currentTurnIndex);

    const timer = setTimeout(() => {
      onTurnComplete?.(currentTurnIndex);

      if (currentTurnIndex + 1 >= currentSet.turns.length) {
        // 세트 완료
        setTimeout(() => {
          setShowSetResult(true);
          setCurrentAction('');
          onSetComplete?.();
        }, baseDelay * 0.5);
      } else {
        setCurrentTurnIndex(prev => prev + 1);
      }
    }, baseDelay);

    return () => clearTimeout(timer);
  }, [isPlaying, currentSet, currentTurnIndex, playTurn, onTurnComplete, onSetComplete, baseDelay]);

  // HP 바 상태 클래스
  const getHpBarClass = (hp: number) => {
    if (hp <= 20) return 'critical';
    if (hp <= 50) return 'low';
    return '';
  };

  // 현재 세트의 승자 확인
  const isP1Winner = currentSet?.winnerId === participant1.odId;

  return (
    <div className="battle-animation-container">
      {/* 경기장 배경 */}
      <div
        className="arena-background"
        style={{
          background: `linear-gradient(135deg, ${
            currentSet?.arenaEffect?.bonusAttribute === 'CURSE' ? '#7f1d1d' :
            currentSet?.arenaEffect?.bonusAttribute === 'BARRIER' ? '#1e3a5f' :
            currentSet?.arenaEffect?.bonusAttribute === 'SOUL' ? '#4a1d7a' :
            currentSet?.arenaEffect?.bonusAttribute === 'BODY' ? '#1a4d1a' :
            '#2a2a4a'
          } 0%, #1a1a2e 100%)`
        }}
      />

      {/* 액션 텍스트 */}
      <AnimatePresence>
        {currentAction && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="action-text"
          >
            {currentAction}
          </motion.div>
        )}
      </AnimatePresence>

      {/* VS 표시 */}
      <div className="vs-indicator">VS</div>

      {/* 참가자 1 (왼쪽) */}
      <motion.div
        className={`battle-card left ${
          attackingSide === 'left' ? 'attacking' : ''
        } ${
          hitSide === 'left' ? 'hit' : ''
        } ${
          showSetResult && isP1Winner ? 'winner' : ''
        }`}
      >
        <div className="card-initial">{participant1.odName.charAt(0)}</div>
        <div className="card-name">{participant1.odName}</div>
        <div className="hp-bar-container">
          <div
            className={`hp-bar ${getHpBarClass(p1Hp)}`}
            style={{ width: `${p1Hp}%` }}
          />
        </div>
      </motion.div>

      {/* 참가자 2 (오른쪽) */}
      <motion.div
        className={`battle-card right ${
          attackingSide === 'right' ? 'attacking' : ''
        } ${
          hitSide === 'right' ? 'hit' : ''
        } ${
          showSetResult && !isP1Winner ? 'winner' : ''
        }`}
      >
        <div className="card-initial">{participant2.odName.charAt(0)}</div>
        <div className="card-name">{participant2.odName}</div>
        <div className="hp-bar-container">
          <div
            className={`hp-bar ${getHpBarClass(p2Hp)}`}
            style={{ width: `${p2Hp}%` }}
          />
        </div>
      </motion.div>

      {/* 데미지 팝업 */}
      <AnimatePresence>
        {damagePopups.map(popup => (
          <motion.div
            key={popup.id}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -40 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className={`damage-text ${popup.isCritical ? 'critical' : ''}`}
            style={{
              left: `${popup.x}%`,
              top: `${popup.y}%`
            }}
          >
            {popup.isCritical && ''}
            -{popup.damage}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* 플래시 효과 */}
      {showFlash && <div className="effect-flash" />}

      {/* 세트 결과 오버레이 */}
      <AnimatePresence>
        {showSetResult && currentSet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="set-result-overlay"
          >
            <div className={`result-text ${
              participant1.isPlayerCrew
                ? (isP1Winner ? 'win' : 'lose')
                : participant2.isPlayerCrew
                  ? (!isP1Winner ? 'win' : 'lose')
                  : 'win'
            }`}>
              {currentSet.winnerName} WIN!
            </div>
            <div className="score-text">
              HP {currentSet.winnerHpPercent}% 남음
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default BattleAnimation;
