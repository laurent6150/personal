// ========================================
// 턴제 전투 모달 - MVP v3
// 최대 5턴 동안 공격/반격, HP 기반 승패 결정
// ========================================

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardDisplay } from '../Card/CardDisplay';
import { Button } from '../UI/Button';
import type { CharacterCard, Arena, RoundResult } from '../../types';

interface TurnBattleModalProps {
  playerCard: CharacterCard;
  aiCard: CharacterCard;
  result: RoundResult;
  arena: Arena | null;
  onComplete: () => void;
}

interface BattleLog {
  turn: number;
  attacker: 'player' | 'ai';
  damage: number;
  message: string;
  isCritical?: boolean;
}

const MAX_TURNS = 5;
const LOG_INTERVAL = 600; // 0.6초 간격

export function TurnBattleModal({
  playerCard,
  aiCard,
  result,
  arena,
  onComplete
}: TurnBattleModalProps) {
  const [currentTurn, setCurrentTurn] = useState(0);
  const [playerHp, setPlayerHp] = useState(100);
  const [aiHp, setAiHp] = useState(100);
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);
  const [battleEnded, setBattleEnded] = useState(false);
  const [showResult, setShowResult] = useState(false); // 결과 표시 지연용
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

  // 데미지 계산 (기존 결과의 약 40% 수준으로 분배)
  const calculateDamage = useCallback((
    attacker: CharacterCard,
    defender: CharacterCard,
    isPlayerAttacking: boolean
  ): { damage: number; isCritical: boolean } => {
    const baseAtk = attacker.baseStats.atk;
    const baseDef = defender.baseStats.def;
    const baseSpd = attacker.baseStats.spd;

    // 기본 데미지 (8~15% HP)
    let damage = Math.round(8 + (baseAtk - baseDef + 10) * 0.3 + Math.random() * 4);

    // 속성 보너스
    const attributeAdvantage = getAttributeAdvantage(attacker.attribute, defender.attribute);
    if (attributeAdvantage) {
      damage = Math.round(damage * 1.3);
    } else if (getAttributeAdvantage(defender.attribute, attacker.attribute)) {
      damage = Math.round(damage * 0.7);
    }

    // 경기장 보너스 (효과 체크)
    if (arena) {
      const arenaBonus = arena.effects.find(
        e => (e.target === attacker.attribute || e.target === 'ALL') && e.value > 0
      );
      if (arenaBonus) {
        damage = Math.round(damage * 1.2);
      }
    }

    // 크리티컬 (속도 기반, 5~15% 확률)
    const critChance = Math.min(0.15, 0.05 + baseSpd * 0.005);
    const isCritical = Math.random() < critChance;
    if (isCritical) {
      damage = Math.round(damage * 1.5);
    }

    // 최종 결과에 맞게 데미지 조정
    const isWinning = (isPlayerAttacking && result.winner === 'PLAYER') ||
                      (!isPlayerAttacking && result.winner === 'AI');
    if (isWinning) {
      damage = Math.round(damage * 1.2);
    }

    return { damage: Math.max(5, Math.min(30, damage)), isCritical };
  }, [arena, result]);

  // 전투 진행
  useEffect(() => {
    if (battleEnded) return;

    const timer = setTimeout(() => {
      if (currentTurn >= MAX_TURNS * 2) {
        // 최대 턴 도달 - 남은 HP로 승패 결정
        endBattle();
        return;
      }

      const isPlayerTurn = currentTurn % 2 === 0;
      const attacker = isPlayerTurn ? playerCard : aiCard;
      const defender = isPlayerTurn ? aiCard : playerCard;

      const { damage, isCritical } = calculateDamage(attacker, defender, isPlayerTurn);

      // HP 업데이트
      if (isPlayerTurn) {
        setAiHp(prev => {
          const newHp = Math.max(0, prev - damage);
          if (newHp <= 0) {
            setBattleEnded(true);
            setWinner('player');
          }
          return newHp;
        });
      } else {
        setPlayerHp(prev => {
          const newHp = Math.max(0, prev - damage);
          if (newHp <= 0) {
            setBattleEnded(true);
            setWinner('ai');
          }
          return newHp;
        });
      }

      // 전투 로그 추가
      const message = generateBattleMessage(attacker, defender, damage, isCritical, isPlayerTurn);
      setBattleLogs(prev => [...prev, {
        turn: Math.floor(currentTurn / 2) + 1,
        attacker: isPlayerTurn ? 'player' : 'ai',
        damage,
        message,
        isCritical
      }]);

      setCurrentTurn(prev => prev + 1);
    }, LOG_INTERVAL);

    return () => clearTimeout(timer);
  }, [currentTurn, battleEnded, playerCard, aiCard, calculateDamage]);

  const endBattle = () => {
    setBattleEnded(true);
    // 실제 결과에 맞게 승자 설정
    setWinner(result.winner === 'PLAYER' ? 'player' : result.winner === 'AI' ? 'ai' : null);
  };

  // 전투 종료 후 결과 표시 지연 (전투 로그가 먼저 보이도록)
  useEffect(() => {
    if (battleEnded && !showResult) {
      const timer = setTimeout(() => {
        setShowResult(true);
      }, 800); // 0.8초 후 결과 표시
      return () => clearTimeout(timer);
    }
  }, [battleEnded, showResult]);

  const generateBattleMessage = (
    attacker: CharacterCard,
    _defender: CharacterCard,
    damage: number,
    isCritical: boolean,
    isPlayerAttacking: boolean
  ): string => {
    const attackerName = attacker.name.ko;
    const critText = isCritical ? '크리티컬! ' : '';
    const skillName = attacker.skill?.name || '공격';

    if (isPlayerAttacking) {
      return `${attackerName}의 ${skillName}! ${critText}${damage} 데미지!`;
    } else {
      return `${attackerName}의 반격! ${critText}${damage} 데미지!`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4"
    >
      <div className="w-full max-w-4xl">
        {/* 상단: 카드 대결 */}
        <div className="flex items-start justify-between mb-6">
          {/* 플레이어 카드 */}
          <div className="text-center">
            <CardDisplay character={playerCard} size="md" />
            <div className="mt-3">
              <div className="text-sm text-text-secondary mb-1">HP</div>
              <div className="w-32 h-4 bg-black/50 rounded-full overflow-hidden border border-white/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400"
                  initial={{ width: '100%' }}
                  animate={{ width: `${playerHp}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="text-xs mt-1 text-text-secondary">{playerHp}/100</div>
            </div>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center pt-8">
            <div className="text-3xl font-bold text-accent mb-2">VS</div>
            <div className="text-sm text-text-secondary">
              턴 {Math.min(Math.floor(currentTurn / 2) + 1, MAX_TURNS)} / {MAX_TURNS}
            </div>
          </div>

          {/* AI 카드 */}
          <div className="text-center">
            <CardDisplay character={aiCard} size="md" />
            <div className="mt-3">
              <div className="text-sm text-text-secondary mb-1">HP</div>
              <div className="w-32 h-4 bg-black/50 rounded-full overflow-hidden border border-white/20">
                <motion.div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400"
                  initial={{ width: '100%' }}
                  animate={{ width: `${aiHp}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <div className="text-xs mt-1 text-text-secondary">{aiHp}/100</div>
            </div>
          </div>
        </div>

        {/* 전투 로그 */}
        <div className="bg-bg-card/50 rounded-xl p-4 mb-6 h-48 overflow-y-auto border border-white/10">
          <div className="space-y-2">
            <AnimatePresence>
              {battleLogs.map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: log.attacker === 'player' ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`text-sm p-2 rounded ${
                    log.attacker === 'player'
                      ? 'bg-blue-500/20 text-blue-300'
                      : 'bg-red-500/20 text-red-300'
                  } ${log.isCritical ? 'font-bold' : ''}`}
                >
                  <span className="text-xs text-text-secondary mr-2">[턴 {log.turn}]</span>
                  {log.message}
                </motion.div>
              ))}
            </AnimatePresence>

            {battleLogs.length === 0 && (
              <div className="text-center text-text-secondary py-8">
                전투 시작...
              </div>
            )}
          </div>
        </div>

        {/* 결과 및 버튼 (전투 로그가 먼저 보인 후 표시) */}
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className={`text-4xl font-bold mb-4 ${
                winner === 'player' ? 'text-win' : winner === 'ai' ? 'text-lose' : 'text-yellow-400'
              }`}>
                {winner === 'player' ? '🎉 승리!' : winner === 'ai' ? '😢 패배' : '🤝 무승부'}
              </div>

              <div className="text-text-secondary mb-6">
                {playerCard.name.ko} (HP: {playerHp}) vs {aiCard.name.ko} (HP: {aiHp})
              </div>

              <Button onClick={onComplete} variant="primary" size="lg">
                계속하기
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// 속성 상성 체크
function getAttributeAdvantage(attacker: string, defender: string): boolean {
  const advantages: Record<string, string[]> = {
    'PHYSICAL': ['CURSE'],
    'CURSE': ['SOUL'],
    'SOUL': ['BARRIER'],
    'BARRIER': ['PHYSICAL'],
  };
  return advantages[attacker]?.includes(defender) || false;
}
