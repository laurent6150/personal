// ========================================
// 보상 수령 화면 컴포넌트 (Phase 3 개선)
// 능력치 Before/After 상세 표시 + 레벨업 이펙트
// ========================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import { Button } from '../UI/Button';
import type { Stats } from '../../types';

interface StatChange {
  name: string;
  before: number;
  after: number;
  diff: number;
}

interface RewardCardData {
  odId: string;
  odName: string;
  rank: number;
  exp: number;
  levelBefore: number;
  levelAfter: number;
  expBefore?: number;
  expAfter?: number;
  statsBefore?: Partial<Stats>;
  statsAfter?: Partial<Stats>;
  statIncrease?: number;
}

// AP 보상 정보
interface APRewardInfo {
  wins: number;
  losses: number;
  draws: number;
  winAP: number;
  loseAP: number;
  drawAP: number;
  totalAP: number;
}

interface RewardClaimScreenProps {
  season: number;
  myCardRewards: RewardCardData[];
  apReward?: APRewardInfo;
  cpReward?: number;
  onConfirm: () => void;
}

// 순위별 타이틀
const getRankTitle = (rank: number): string => {
  if (rank === 1) return '우승';
  if (rank === 2) return '준우승';
  if (rank === 3) return '3위';
  if (rank === 4) return '4위';
  if (rank <= 8) return '8강';
  if (rank <= 16) return '16강';
  return '참가상';
};

// 순위별 아이콘
const getRankIcon = (rank: number): string => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  if (rank === 4) return '🏅';
  if (rank <= 8) return '🎖️';
  if (rank <= 16) return '🎗️';
  return '📜';
};

// 레벨별 필요 경험치
const getExpRequired = (level: number): number => {
  return 100 + (level - 1) * 50; // 레벨 1: 100, 레벨 2: 150, 레벨 3: 200 ...
};

// 스탯 변화 계산
const calculateStatChanges = (before?: Partial<Stats>, after?: Partial<Stats>): StatChange[] => {
  if (!before || !after) return [];

  const statNames: (keyof Stats)[] = ['atk', 'def', 'spd', 'hp', 'ce', 'crt', 'tec', 'mnt'];
  const statLabels: Record<string, string> = {
    atk: 'ATK', def: 'DEF', spd: 'SPD', hp: 'HP',
    ce: 'CE', crt: 'CRT', tec: 'TEC', mnt: 'MNT'
  };

  return statNames.map(name => ({
    name: statLabels[name] || name.toUpperCase(),
    before: before[name] || 0,
    after: after[name] || 0,
    diff: (after[name] || 0) - (before[name] || 0)
  })).filter(change => change.diff !== 0 || change.before > 0 || change.after > 0);
};

// 레벨업 파티클 컴포넌트
function LevelUpParticles() {
  const particles = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(i => (
        <motion.div
          key={i}
          initial={{
            x: '50%',
            y: '50%',
            scale: 0,
            opacity: 1
          }}
          animate={{
            x: `${50 + Math.cos((i / 12) * Math.PI * 2) * 100}%`,
            y: `${50 + Math.sin((i / 12) * Math.PI * 2) * 100}%`,
            scale: [0, 1, 0],
            opacity: [1, 1, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1
          }}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full"
          style={{ left: '-4px', top: '-4px' }}
        />
      ))}
    </div>
  );
}

// 개별 보상 카드 (상세 버전)
function RewardCard({ card, index }: { card: RewardCardData; index: number }) {
  const character = CHARACTERS_BY_ID[card.odId];
  const isLevelUp = card.levelAfter > card.levelBefore;
  const levelUps = card.levelAfter - card.levelBefore;

  // 스탯 변화 계산
  const statChanges = calculateStatChanges(card.statsBefore, card.statsAfter);
  const totalStatIncrease = statChanges.reduce((sum, change) => sum + change.diff, 0);

  // 경험치 진행률
  const expRequired = getExpRequired(card.levelAfter);
  const expPercent = card.expAfter ? (card.expAfter / expRequired) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15 }}
      className={`
        relative rounded-xl overflow-hidden
        ${isLevelUp
          ? 'bg-gradient-to-br from-yellow-500/30 to-amber-600/30 border-2 border-yellow-400'
          : 'bg-bg-secondary border border-white/10'}
      `}
    >
      {/* 레벨업 파티클 이펙트 */}
      {isLevelUp && <LevelUpParticles />}

      <div className="p-4 relative z-10">
        {/* 레벨업 배너 */}
        {isLevelUp && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.15 + 0.3, type: 'spring', stiffness: 200 }}
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 z-20"
          >
            <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold animate-pulse">
              ✨ LEVEL UP! {levelUps > 1 ? `x${levelUps}` : ''} ✨
            </div>
          </motion.div>
        )}

        {/* 캐릭터 이미지 */}
        <div className={`
          w-24 h-24 mx-auto rounded-xl overflow-hidden mb-3 mt-2
          ${isLevelUp ? 'border-2 border-yellow-400 shadow-lg shadow-yellow-400/30' : 'border border-white/20'}
        `}>
          {character && (
            <img
              src={getCharacterImage(character.id, character.name.ko, character.attribute)}
              alt={character.name.ko}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* 이름 */}
        <div className="text-center font-bold text-white mb-2">
          {card.odName}
        </div>

        {/* 순위 & EXP */}
        <div className="text-center space-y-1">
          <div className="text-sm">
            <span className="text-2xl">{getRankIcon(card.rank)}</span>
            <span className="text-text-secondary ml-1">
              {card.rank}위 ({getRankTitle(card.rank)})
            </span>
          </div>

          <div className="text-green-400 font-bold">
            +{card.exp} EXP
          </div>
        </div>

        {/* 능력치 변화 상세 */}
        <div className="mt-3 pt-3 border-t border-white/10">
          {/* 레벨 변화 */}
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-sm text-text-secondary">레벨:</span>
            <span className="text-text-secondary">Lv.{card.levelBefore}</span>
            <span className={isLevelUp ? 'text-yellow-400' : 'text-text-secondary'}>→</span>
            <span className={isLevelUp ? 'text-yellow-400 font-bold' : 'text-text-primary'}>
              Lv.{card.levelAfter}
              {isLevelUp && <span className="ml-1">⬆</span>}
            </span>
          </div>

          {/* EXP 진행률 바 */}
          <div className="mb-3">
            <div className="flex justify-between text-xs text-text-secondary mb-1">
              <span>EXP</span>
              <span>{card.expAfter || 0}/{expRequired}</span>
            </div>
            <div className="w-full h-2 bg-bg-primary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${expPercent}%` }}
                transition={{ delay: index * 0.15 + 0.5, duration: 0.5 }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
              />
            </div>
          </div>

          {/* 스탯 변화 상세 */}
          {isLevelUp && totalStatIncrease > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 + 0.6 }}
              className="bg-bg-primary/50 rounded-lg p-2"
            >
              <div className="text-center text-xs text-yellow-400 font-bold mb-2">
                ─── 스탯 증가! (+{totalStatIncrease}) ───
              </div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                {statChanges.filter(s => s.diff > 0).map(stat => (
                  <div key={stat.name} className="flex justify-between">
                    <span className="text-text-secondary">{stat.name}:</span>
                    <span>
                      <span className="text-text-secondary">{stat.before}</span>
                      <span className="text-yellow-400"> → </span>
                      <span className="text-green-400">{stat.after}</span>
                      <span className="text-green-400 ml-1">(+{stat.diff})</span>
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : !isLevelUp ? (
            <div className="text-center text-xs text-text-secondary">
              ─── 스탯 변화 없음 ───
            </div>
          ) : card.statIncrease ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15 + 0.5 }}
              className="text-center text-blue-400 font-bold text-sm"
            >
              총 스탯 +{card.statIncrease} 증가!
            </motion.div>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

export function RewardClaimScreen({ season, myCardRewards, apReward, cpReward, onConfirm }: RewardClaimScreenProps) {
  // showConfetti used for future confetti animation feature
  const [, setShowConfetti] = useState(false);

  // 레벨업 카드가 있으면 축하 효과
  useEffect(() => {
    const hasLevelUp = myCardRewards.some(card => card.levelAfter > card.levelBefore);
    if (hasLevelUp) {
      setShowConfetti(true);
    }
  }, [myCardRewards]);

  // 총 획득 EXP 계산
  const totalExp = myCardRewards.reduce((sum, card) => sum + card.exp, 0);
  const levelUpCount = myCardRewards.filter(card => card.levelAfter > card.levelBefore).length;
  const totalStatIncrease = myCardRewards.reduce((sum, card) => {
    if (card.statsAfter && card.statsBefore) {
      const changes = calculateStatChanges(card.statsBefore, card.statsAfter);
      return sum + changes.reduce((s, c) => s + c.diff, 0);
    }
    return sum + (card.statIncrease || 0);
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 overflow-auto"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-bg-primary rounded-xl border border-white/20 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-green-500/30 via-accent/30 to-green-500/30 p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-4xl mb-2"
          >
            🎉
          </motion.div>
          <div className="text-2xl font-bold text-green-400">
            시즌 {season} 보상 수령 완료!
          </div>
          <div className="text-sm text-text-secondary mt-2 space-x-3">
            <span>총 {totalExp} EXP 획득</span>
            {levelUpCount > 0 && <span className="text-yellow-400">| {levelUpCount}장 레벨업!</span>}
            {totalStatIncrease > 0 && <span className="text-blue-400">| 총 +{totalStatIncrease} 스탯</span>}
          </div>

          {/* AP & CP 보상 표시 */}
          {(apReward || cpReward) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 flex justify-center gap-4"
            >
              {apReward && (
                <div className="bg-orange-500/20 border border-orange-500/40 rounded-lg px-4 py-2">
                  <div className="text-xs text-orange-300 mb-1">활동 포인트</div>
                  <div className="text-lg font-bold text-orange-400">+{apReward.totalAP} AP</div>
                  <div className="text-[10px] text-text-secondary mt-1">
                    승리 {apReward.wins}회 (+{apReward.winAP}) |
                    패배 {apReward.losses}회 (+{apReward.loseAP})
                    {apReward.draws > 0 && ` | 무승부 ${apReward.draws}회 (+${apReward.drawAP})`}
                  </div>
                </div>
              )}
              {cpReward !== undefined && cpReward > 0 && (
                <div className="bg-blue-500/20 border border-blue-500/40 rounded-lg px-4 py-2">
                  <div className="text-xs text-blue-300 mb-1">크루 포인트</div>
                  <div className="text-lg font-bold text-blue-400">+{cpReward} CP</div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* 보상 카드 그리드 */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCardRewards.map((card, index) => (
              <RewardCard key={card.odId} card={card} index={index} />
            ))}
          </div>

          {/* 추가 보상 정보 */}
          <div className="mt-6 bg-bg-secondary rounded-lg p-4 text-center">
            <div className="text-sm text-text-secondary mb-2">
              🎁 시즌 보상 요약
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              {myCardRewards.map(card => (
                <div key={card.odId} className="flex items-center gap-1">
                  <span className="text-text-primary">{card.odName}:</span>
                  <span className="text-green-400">+{card.exp} EXP</span>
                  {card.levelAfter > card.levelBefore && (
                    <span className="text-yellow-400">(Lv.UP!)</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 확인 버튼 */}
        <div className="p-4 border-t border-white/10">
          <Button
            variant="primary"
            onClick={onConfirm}
            className="w-full py-3 text-lg"
          >
            확인 및 리그 종료
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default RewardClaimScreen;
