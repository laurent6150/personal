// ========================================
// 리그 종료 화면 컴포넌트 (개선된 UI)
// Phase 3: RewardClaimScreen 통합
// ========================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useIndividualLeagueStore } from '../../stores/individualLeagueStore';
import { calculateFinalRankings, calculateAwards } from '../../utils/individualLeagueSystem';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import { Button } from '../UI/Button';
import { RewardClaimScreen } from './RewardClaimScreen';
import { AwardsDisplay } from './AwardsDisplay';

interface LeagueFinishedScreenProps {
  onFinish?: () => void;
}

export function LeagueFinishedScreen({ onFinish }: LeagueFinishedScreenProps) {
  const [showRewardScreen, setShowRewardScreen] = useState(false);
  const { currentLeague, finishLeague } = useIndividualLeagueStore(
    useShallow(state => ({
      currentLeague: state.currentLeague,
      finishLeague: state.finishLeague,
    }))
  );

  if (!currentLeague || currentLeague.status !== 'FINISHED') return null;

  // 순위 및 개인상 계산
  const rankings = calculateFinalRankings(currentLeague);
  const awards = calculateAwards(currentLeague, rankings);
  const myCards = rankings.filter(r => r.isPlayerCrew);
  const top16 = rankings.slice(0, 16);

  // 보상 수령 버튼 클릭 -> RewardClaimScreen 표시
  const handleClaimReward = () => {
    setShowRewardScreen(true);
  };

  // RewardClaimScreen에서 확인 버튼 클릭 -> 리그 종료
  const handleRewardConfirm = () => {
    setShowRewardScreen(false);
    finishLeague();
    onFinish?.();
  };

  // RewardClaimScreen용 데이터 변환
  const getRewardData = () => {
    return myCards.map(card => {
      const character = CHARACTERS_BY_ID[card.odId];
      const baseStats = character?.baseStats;

      // 레벨업 계산 (현재 레벨 + EXP 기준)
      // 여기서는 단순화: 레벨1 기준, 100EXP마다 레벨업
      const currentExp = 0; // 실제로는 저장된 EXP
      const totalExp = currentExp + card.exp;
      const levelBefore = 1;
      const expPerLevel = 100;
      const levelUps = Math.floor(totalExp / expPerLevel);
      const levelAfter = levelBefore + levelUps;
      const expAfter = totalExp % expPerLevel;

      // 레벨업 시 스탯 증가 (레벨당 총 +4)
      const statIncrease = levelUps * 4;
      const statsAfter = baseStats ? {
        atk: (baseStats.atk || 0) + Math.floor(statIncrease / 4),
        def: (baseStats.def || 0) + Math.floor(statIncrease / 4),
        spd: (baseStats.spd || 0) + Math.floor(statIncrease / 4),
        hp: (baseStats.hp || 0) + Math.floor(statIncrease / 4),
        ce: baseStats.ce || 0,
        crt: (baseStats as { crt?: number })?.crt || 50,
        tec: (baseStats as { tec?: number })?.tec || 50,
        mnt: (baseStats as { mnt?: number })?.mnt || 50,
      } : undefined;

      return {
        odId: card.odId,
        odName: card.odName,
        rank: card.rank,
        exp: card.exp,
        levelBefore,
        levelAfter,
        expBefore: currentExp,
        expAfter,
        statsBefore: baseStats,
        statsAfter,
        statIncrease: levelUps > 0 ? statIncrease : 0
      };
    });
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}위`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-amber-600';
    if (rank <= 4) return 'text-green-400';
    return 'text-text-primary';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-bg-secondary rounded-xl border border-white/10 p-6 mb-4"
    >
      {/* 타이틀 */}
      <div className="text-center mb-6">
        <div className="text-3xl mb-2">🏆</div>
        <h2 className="text-2xl font-bold text-yellow-400">
          시즌 {currentLeague.season} 개인리그 종료
        </h2>
      </div>

      {/* 내 카드 성적 */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-text-primary mb-3">
          ═══ 내 카드 성적 ═══
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {myCards.map(card => {
            const character = CHARACTERS_BY_ID[card.odId];
            return (
              <div
                key={card.odId}
                className="bg-bg-primary rounded-lg p-3 flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-bg-secondary">
                  {character && (
                    <img
                      src={getCharacterImage(character.id, character.name.ko, character.attribute)}
                      alt={card.odName}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-400">🌟</span>
                    <span className="font-bold text-text-primary">{card.odName}</span>
                  </div>
                  <div className="text-sm text-text-secondary">
                    {getRankIcon(card.rank)} | {card.wins}승 {card.losses}패
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-green-400 font-bold">+{card.exp} EXP</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 개인상 (AwardsDisplay 컴포넌트 사용) */}
      {awards.length > 0 && (
        <div className="mb-6">
          <AwardsDisplay
            awards={awards}
            playerCardIds={myCards.map(c => c.odId)}
          />
        </div>
      )}

      {/* 전체 순위 (상위 16명) */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-text-primary mb-3">
          ═══ 전체 순위 (상위 16명) ═══
        </h3>
        <div className="bg-bg-primary rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-3 py-2 text-left text-text-secondary">순위</th>
                <th className="px-3 py-2 text-left text-text-secondary">이름</th>
                <th className="px-3 py-2 text-center text-text-secondary">전적</th>
                <th className="px-3 py-2 text-center text-text-secondary">세트</th>
                <th className="px-3 py-2 text-right text-text-secondary">EXP</th>
              </tr>
            </thead>
            <tbody>
              {top16.map(r => (
                <tr
                  key={r.odId}
                  className={`border-b border-white/5 ${r.isPlayerCrew ? 'bg-accent/10' : ''}`}
                >
                  <td className={`px-3 py-2 font-bold ${getRankColor(r.rank)}`}>
                    {getRankIcon(r.rank)}
                  </td>
                  <td className="px-3 py-2">
                    {r.isPlayerCrew && <span className="text-yellow-400 mr-1">🌟</span>}
                    <span className={r.isPlayerCrew ? 'text-yellow-400 font-bold' : 'text-text-primary'}>
                      {r.odName}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center text-text-primary">
                    {r.wins}승 {r.losses}패
                  </td>
                  <td className="px-3 py-2 text-center">
                    <span className={r.setDiff >= 0 ? 'text-green-400' : 'text-red-400'}>
                      {r.setDiff >= 0 ? '+' : ''}{r.setDiff}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-right text-green-400">
                    +{r.exp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 획득 보상 요약 */}
      <div className="mb-6 bg-green-500/10 border border-green-500/30 rounded-lg p-4">
        <h3 className="font-bold text-green-400 mb-2">🎁 획득 보상</h3>
        <div className="text-sm text-text-primary">
          <div>참가 보상: <span className="text-green-400">+50 EXP (전원)</span></div>
          {myCards.map(card => (
            <div key={card.odId}>
              {card.odName} ({getRankIcon(card.rank)}):
              <span className="text-green-400 ml-1">+{card.exp} EXP</span>
              {card.rank <= 4 && <span className="text-yellow-400 ml-1">+ 다음 시즌 시드</span>}
            </div>
          ))}
        </div>
      </div>

      {/* 종료 버튼 */}
      <div className="text-center">
        <Button variant="primary" onClick={handleClaimReward} className="px-8">
          🎁 보상 수령하기
        </Button>
      </div>

      {/* RewardClaimScreen 모달 */}
      {showRewardScreen && (
        <RewardClaimScreen
          season={currentLeague.season}
          myCardRewards={getRewardData()}
          onConfirm={handleRewardConfirm}
        />
      )}
    </motion.div>
  );
}

export default LeagueFinishedScreen;
