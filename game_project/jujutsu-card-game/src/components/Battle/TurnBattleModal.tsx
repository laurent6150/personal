// ========================================
// 턴제 전투 모달 - MVP v5: 필살기 효과 시스템
// 상태이상 표시 + 필살기 효과 표시
// ========================================

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CardDisplay } from '../Card/CardDisplay';
import { Button } from '../UI/Button';
import type { CharacterCard, Arena, RoundResult, BasicSkill, UltimateSkill, AppliedStatusEffect } from '../../types';
import { getStatusEffect } from '../../data/statusEffects';

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
  skillName: string;
  skillType: 'basic' | 'ultimate';
  damage: number;
  message: string;
  isCritical?: boolean;
  isUltimate?: boolean;
  statusEffect?: string;
  statusEffects?: string[];  // 부여된 상태이상들
  healAmount?: number;       // 회복량
  selfDamage?: number;       // 자해 데미지
}

interface BattleState {
  hp: number;
  gauge: number;
  effects: AppliedStatusEffect[];  // 적용된 상태이상
}

const MAX_TURNS = 5;
const LOG_INTERVAL = 700; // 0.7초 간격
const GAUGE_PER_TURN = { min: 25, max: 35 }; // 턴당 게이지 충전량

// 상태이상 아이콘 표시 컴포넌트
function StatusEffectDisplay({ effects }: { effects: AppliedStatusEffect[] }) {
  if (effects.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1 justify-center mt-1">
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
            title={`${statusDef.name} (${effect.remainingDuration}턴)${effect.stacks > 1 ? ` x${effect.stacks}` : ''}`}
          >
            {statusDef.icon} {effect.stacks > 1 && `x${effect.stacks}`}
          </motion.div>
        );
      })}
    </div>
  );
}

export function TurnBattleModal({
  playerCard,
  aiCard,
  result,
  arena,
  onComplete
}: TurnBattleModalProps) {
  const [currentTurn, setCurrentTurn] = useState(0);
  const [playerState, setPlayerState] = useState<BattleState>({
    hp: 100,
    gauge: 0,
    effects: []
  });
  const [aiState, setAiState] = useState<BattleState>({
    hp: 100,
    gauge: 0,
    effects: []
  });
  const [battleLogs, setBattleLogs] = useState<BattleLog[]>([]);
  const [battleEnded, setBattleEnded] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);

  // AI 기본기 선택 로직
  const selectAISkill = useCallback((
    attacker: CharacterCard,
    defender: CharacterCard,
    attackerState: BattleState,
    defenderState: BattleState
  ): BasicSkill | UltimateSkill => {
    // 필살기 게이지가 100 이상이면 필살기 사용
    if (attackerState.gauge >= 100) {
      return attacker.ultimateSkill;
    }

    // 기본기 중 선택
    const basicSkills = attacker.basicSkills;

    // HP가 낮으면 방어/유틸 우선
    if (attackerState.hp < 30) {
      const defenseSkill = basicSkills.find(s => s.type === 'DEFENSE');
      if (defenseSkill) return defenseSkill;
    }

    // 상대 HP가 낮으면 공격 스킬 우선
    if (defenderState.hp < 40) {
      const attackSkill = basicSkills.find(s => s.type === 'ATTACK');
      if (attackSkill) return attackSkill;
    }

    // 속성 유리할 때 공격 우선
    if (getAttributeAdvantage(attacker.attribute, defender.attribute)) {
      const attackSkills = basicSkills.filter(s => s.type === 'ATTACK');
      if (attackSkills.length > 0) {
        return attackSkills[Math.floor(Math.random() * attackSkills.length)];
      }
    }

    // 랜덤 선택 (공격 스킬 가중치 높게)
    const weights = basicSkills.map(s => s.type === 'ATTACK' ? 3 : s.type === 'DEFENSE' ? 2 : 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < basicSkills.length; i++) {
      random -= weights[i];
      if (random <= 0) return basicSkills[i];
    }

    return basicSkills[0];
  }, []);

  // 데미지 계산
  const calculateDamage = useCallback((
    attacker: CharacterCard,
    defender: CharacterCard,
    skill: BasicSkill | UltimateSkill,
    _attackerState: BattleState,
    isPlayerAttacking: boolean
  ): { damage: number; isCritical: boolean; statusEffect?: string } => {
    const baseAtk = attacker.baseStats.atk;
    const baseDef = defender.baseStats.def;
    const baseSpd = attacker.baseStats.spd;
    const effect = skill.effect;

    // 기본 데미지 계산
    let damage = 0;
    let statusEffect: string | undefined;

    // 스킬 효과에 따른 데미지 계산
    switch (effect.type) {
      case 'DAMAGE':
      case 'INSTANT_DAMAGE':
        damage = Math.round((effect.value as number || 100) * (baseAtk / 100));
        break;
      case 'MULTI_HIT':
        const hits = effect.hits || 3;
        damage = Math.round(((effect.value as number || 50) / hits) * hits * (baseAtk / 100));
        break;
      case 'TRUE_DAMAGE':
        damage = Math.round(effect.value as number || 80);
        break;
      case 'DAMAGE_REDUCE':
      case 'DODGE':
        damage = Math.round(5 + Math.random() * 5); // 방어 스킬은 낮은 데미지
        break;
      case 'DRAIN':
        damage = Math.round((effect.value as number || 60) * (baseAtk / 100));
        break;
      case 'STUN':
        damage = Math.round((effect.damage || 80) * (baseAtk / 100));
        statusEffect = '기절';
        break;
      case 'BURN':
        damage = Math.round((effect.value as number || 50) * (baseAtk / 100));
        statusEffect = '화상';
        break;
      case 'DOMAIN':
        damage = Math.round((effect.damage || 200) * (baseAtk / 100));
        statusEffect = effect.extra || '영역전개';
        break;
      case 'RATIO_DAMAGE':
        damage = Math.round((effect.multiplier || 1.5) * baseAtk);
        break;
      case 'CRITICAL_GUARANTEED':
        damage = Math.round((effect.value as number || 120) * (baseAtk / 100) * 1.5);
        break;
      default:
        damage = Math.round(10 + (baseAtk - baseDef + 10) * 0.3);
    }

    // 방어력 적용 (TRUE_DAMAGE 제외)
    if (effect.type !== 'TRUE_DAMAGE' && !effect.ignoreDefense) {
      damage = Math.round(damage * (100 / (100 + baseDef)));
    }

    // 속성 보너스
    const attributeAdvantage = getAttributeAdvantage(attacker.attribute, defender.attribute);
    if (attributeAdvantage) {
      damage = Math.round(damage * 1.3);
    } else if (getAttributeAdvantage(defender.attribute, attacker.attribute)) {
      damage = Math.round(damage * 0.7);
    }

    // 경기장 보너스
    if (arena) {
      const arenaBonus = arena.effects.find(
        e => (e.target === attacker.attribute || e.target === 'ALL') && e.value > 0
      );
      if (arenaBonus) {
        damage = Math.round(damage * (1 + arenaBonus.value));
      }
    }

    // 크리티컬 (필살기는 크리 보정, 기본기는 확률)
    const isUltimate = 'gaugeRequired' in skill;
    const critChance = effect.critRate || (isUltimate ? 0.3 : Math.min(0.15, 0.05 + baseSpd * 0.005));
    const isCritical = effect.type === 'CRITICAL_GUARANTEED' || Math.random() < critChance;
    if (isCritical && effect.type !== 'CRITICAL_GUARANTEED') {
      damage = Math.round(damage * 1.5);
    }

    // 최종 결과에 맞게 데미지 조정 (승패가 정해진 경우)
    const isWinning = (isPlayerAttacking && result.winner === 'PLAYER') ||
                      (!isPlayerAttacking && result.winner === 'AI');
    if (isWinning) {
      damage = Math.round(damage * 1.15);
    }

    // 최소/최대 데미지 보정
    damage = Math.max(5, Math.min(isUltimate ? 50 : 35, damage));

    return { damage, isCritical, statusEffect };
  }, [arena, result]);

  // 전투 진행
  useEffect(() => {
    if (battleEnded) return;

    const timer = setTimeout(() => {
      if (currentTurn >= MAX_TURNS * 2) {
        endBattle();
        return;
      }

      const isPlayerTurn = currentTurn % 2 === 0;
      const attacker = isPlayerTurn ? playerCard : aiCard;
      const defender = isPlayerTurn ? aiCard : playerCard;
      const attackerState = isPlayerTurn ? playerState : aiState;
      const defenderState = isPlayerTurn ? aiState : playerState;

      // 스킬 선택
      const selectedSkill = selectAISkill(attacker, defender, attackerState, defenderState);
      const isUltimate = 'gaugeRequired' in selectedSkill;

      // 데미지 계산
      const { damage, isCritical, statusEffect } = calculateDamage(
        attacker, defender, selectedSkill, attackerState, isPlayerTurn
      );

      // 게이지 충전량 계산
      const gaugeCharge = isUltimate ? -100 : Math.floor(
        GAUGE_PER_TURN.min + Math.random() * (GAUGE_PER_TURN.max - GAUGE_PER_TURN.min)
      );

      // 상태 업데이트
      if (isPlayerTurn) {
        setAiState(prev => {
          const newHp = Math.max(0, prev.hp - damage);
          if (newHp <= 0) {
            setBattleEnded(true);
            setWinner('player');
          }
          return { ...prev, hp: newHp };
        });
        setPlayerState(prev => ({
          ...prev,
          gauge: Math.min(100, Math.max(0, prev.gauge + gaugeCharge))
        }));
      } else {
        setPlayerState(prev => {
          const newHp = Math.max(0, prev.hp - damage);
          if (newHp <= 0) {
            setBattleEnded(true);
            setWinner('ai');
          }
          return { ...prev, hp: newHp };
        });
        setAiState(prev => ({
          ...prev,
          gauge: Math.min(100, Math.max(0, prev.gauge + gaugeCharge))
        }));
      }

      // 전투 로그 추가
      const message = generateBattleMessage(
        attacker, selectedSkill, damage, isCritical, isUltimate, statusEffect
      );
      setBattleLogs(prev => [...prev, {
        turn: Math.floor(currentTurn / 2) + 1,
        attacker: isPlayerTurn ? 'player' : 'ai',
        skillName: selectedSkill.name,
        skillType: isUltimate ? 'ultimate' : 'basic',
        damage,
        message,
        isCritical,
        isUltimate,
        statusEffect
      }]);

      setCurrentTurn(prev => prev + 1);
    }, LOG_INTERVAL);

    return () => clearTimeout(timer);
  }, [currentTurn, battleEnded, playerCard, aiCard, playerState, aiState, calculateDamage, selectAISkill]);

  const endBattle = () => {
    setBattleEnded(true);
    setWinner(result.winner === 'PLAYER' ? 'player' : result.winner === 'AI' ? 'ai' : null);
  };

  // 전투 종료 후 결과 표시 지연
  useEffect(() => {
    if (battleEnded && !showResult) {
      const timer = setTimeout(() => {
        setShowResult(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [battleEnded, showResult]);

  const generateBattleMessage = (
    attacker: CharacterCard,
    skill: BasicSkill | UltimateSkill,
    damage: number,
    isCritical: boolean,
    isUltimate: boolean,
    statusEffect?: string
  ): string => {
    const attackerName = attacker.name.ko;
    const critText = isCritical ? '크리티컬! ' : '';
    const ultimateText = isUltimate ? '⚡필살기⚡ ' : '';
    const statusText = statusEffect ? ` [${statusEffect}]` : '';

    return `${ultimateText}${attackerName}의 【${skill.name}】! ${critText}${damage} 데미지!${statusText}`;
  };

  // 게이지 바 컴포넌트
  const GaugeBar = ({ value, color }: { value: number; color: string }) => (
    <div className="w-32 h-2 bg-black/50 rounded-full overflow-hidden border border-white/20">
      <motion.div
        className={`h-full ${color}`}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );

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
            <div className="mt-3 space-y-2">
              {/* HP 바 */}
              <div>
                <div className="text-xs text-text-secondary mb-1">HP</div>
                <div className="w-32 h-4 bg-black/50 rounded-full overflow-hidden border border-white/20">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400"
                    initial={{ width: '100%' }}
                    animate={{ width: `${playerState.hp}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="text-xs mt-1 text-text-secondary">{playerState.hp}/100</div>
              </div>
              {/* 필살기 게이지 */}
              <div>
                <div className="text-xs text-accent mb-1">
                  ⚡ 필살기 {playerState.gauge >= 100 ? '준비완료!' : `${playerState.gauge}%`}
                </div>
                <GaugeBar
                  value={playerState.gauge}
                  color={playerState.gauge >= 100
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse'
                    : 'bg-gradient-to-r from-purple-500 to-purple-400'
                  }
                />
              </div>
              {/* 상태이상 표시 */}
              <StatusEffectDisplay effects={playerState.effects} />
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
            <div className="mt-3 space-y-2">
              {/* HP 바 */}
              <div>
                <div className="text-xs text-text-secondary mb-1">HP</div>
                <div className="w-32 h-4 bg-black/50 rounded-full overflow-hidden border border-white/20">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400"
                    initial={{ width: '100%' }}
                    animate={{ width: `${aiState.hp}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="text-xs mt-1 text-text-secondary">{aiState.hp}/100</div>
              </div>
              {/* 필살기 게이지 */}
              <div>
                <div className="text-xs text-red-400 mb-1">
                  ⚡ 필살기 {aiState.gauge >= 100 ? '준비완료!' : `${aiState.gauge}%`}
                </div>
                <GaugeBar
                  value={aiState.gauge}
                  color={aiState.gauge >= 100
                    ? 'bg-gradient-to-r from-yellow-500 to-orange-500 animate-pulse'
                    : 'bg-gradient-to-r from-red-500 to-red-400'
                  }
                />
              </div>
              {/* 상태이상 표시 */}
              <StatusEffectDisplay effects={aiState.effects} />
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
                    log.isUltimate
                      ? 'bg-yellow-500/30 text-yellow-200 border border-yellow-500/50'
                      : log.attacker === 'player'
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

        {/* 결과 및 버튼 */}
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
                {playerCard.name.ko} (HP: {playerState.hp}) vs {aiCard.name.ko} (HP: {aiState.hp})
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
    'BODY': ['CURSE'],
    'CURSE': ['SOUL'],
    'SOUL': ['BARRIER'],
    'BARRIER': ['BODY'],
    // 레거시 호환
    'PHYSICAL': ['CURSE'],
  };
  return advantages[attacker]?.includes(defender) || false;
}
