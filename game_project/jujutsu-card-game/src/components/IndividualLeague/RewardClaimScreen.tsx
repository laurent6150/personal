// ========================================
// 보상 수령 화면 컴포넌트 (Phase 3)
// 능력치 변화 + 레벨업 이펙트 표시
// ========================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import { Button } from '../UI/Button';

interface RewardCardData {
  odId: string;
  odName: string;
  rank: number;
  exp: number;
  levelBefore: number;
  levelAfter: number;
  statIncrease?: number;
}

interface RewardClaimScreenProps {
  season: number;
  myCardRewards: RewardCardData[];
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

// 개별 보상 카드
function RewardCard({ card, index }: { card: RewardCardData; index: number }) {
  const character = CHARACTERS_BY_ID[card.odId];
  const isLevelUp = card.levelAfter > card.levelBefore;

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
              ✨ LEVEL UP! ✨
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

        {/* 레벨 변화 */}
        <div className="mt-3 pt-3 border-t border-white/10 text-center text-sm">
          <div className="flex items-center justify-center gap-2">
            <span className="text-text-secondary">Lv.{card.levelBefore}</span>
            <span className={isLevelUp ? 'text-yellow-400' : 'text-text-secondary'}>→</span>
            <span className={isLevelUp ? 'text-yellow-400 font-bold' : 'text-text-primary'}>
              Lv.{card.levelAfter}
            </span>
          </div>

          {/* 스탯 증가 */}
          {isLevelUp && card.statIncrease && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.15 + 0.5 }}
              className="text-blue-400 font-bold mt-1"
            >
              총 스탯 +{card.statIncrease} 증가!
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function RewardClaimScreen({ season, myCardRewards, onConfirm }: RewardClaimScreenProps) {
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
          <div className="text-sm text-text-secondary mt-2">
            총 {totalExp} EXP 획득 | {levelUpCount > 0 && `${levelUpCount}장 레벨업!`}
          </div>
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
