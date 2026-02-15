// ========================================
// 리그 종료 화면 컴포넌트 (개선된 UI)
// Phase 3: RewardClaimScreen 통합
// ========================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useIndividualLeagueStore } from '../../stores/individualLeagueStore';
import { calculateFinalRankings, calculateAwards } from '../../utils/individualLeagueSystem';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import { Button } from '../UI/Button';
import { RewardClaimScreen } from './RewardClaimScreen';
import { AwardsDisplay } from './AwardsDisplay';
import { HallOfFameScreen } from '../Phase4/HallOfFameScreen';
import { AP_WIN, AP_LOSE, AP_DRAW } from '../../data/constants';
import { CP_INCOME } from '../../stores/economyStore';
import type { HallOfFameData } from '../../types';

interface LeagueFinishedScreenProps {
  onFinish?: () => void;
}

export function LeagueFinishedScreen({ onFinish }: LeagueFinishedScreenProps) {
  const [showRewardScreen, setShowRewardScreen] = useState(false);
  const [showHallOfFame, setShowHallOfFame] = useState(false);

  const { currentLeague, finishLeague, hallOfFame, history } = useIndividualLeagueStore(
    useShallow(state => ({
      currentLeague: state.currentLeague,
      finishLeague: state.finishLeague,
      hallOfFame: state.hallOfFame,
      history: state.history,
    }))
  );

  // Phase 4: 명예의 전당 데이터 구성
  const hallOfFameData: HallOfFameData = useMemo(() => {
    // 개인 리그 챔피언 기록
    const individualChampions = hallOfFame.map(entry => ({
      season: entry.season,
      championId: entry.championId,
      cardId: entry.championId,
      cardName: entry.championName,
      crewName: entry.crewName,
    }));

    // 통산 기록 (히스토리에서 계산)
    const winCounts: Record<string, { cardId: string; cardName: string; wins: number }> = {};

    history.forEach(h => {
      h.rankings?.forEach(r => {
        if (!winCounts[r.odId]) {
          winCounts[r.odId] = { cardId: r.odId, cardName: r.odName, wins: 0 };
        }
        winCounts[r.odId].wins += r.wins || 0;
      });
    });

    const mostWins = Object.values(winCounts)
      .sort((a, b) => b.wins - a.wins)
      .slice(0, 10)
      .map(w => ({ cardId: w.cardId, cardName: w.cardName, value: w.wins }));

    return {
      seasonChampions: [],
      individualChampions,
      seasonMvps: [],
      allTimeRecords: {
        mostWins,
        highestWinRate: [],
        longestStreak: [],
      },
    };
  }, [hallOfFame, history]);

  if (!currentLeague || currentLeague.status !== 'FINISHED') return null;

  // 순위 및 개인상 계산
  const rankings = calculateFinalRankings(currentLeague);
  const awards = calculateAwards(currentLeague, rankings);
  const myCards = rankings.filter(r => r.isPlayerCrew);
  const top16 = rankings.slice(0, 16);

  // AP 보상 계산
  const apRewardData = useMemo(() => {
    let totalWins = 0;
    let totalLosses = 0;
    let totalDraws = 0;

    myCards.forEach(card => {
      totalWins += card.wins || 0;
      totalLosses += card.losses || 0;
      // draws가 없으면 0으로 처리
      totalDraws += (card as { draws?: number }).draws || 0;
    });

    const winAP = totalWins * AP_WIN;
    const loseAP = totalLosses * AP_LOSE;
    const drawAP = totalDraws * AP_DRAW;
    const totalAP = winAP + loseAP + drawAP;

    return {
      wins: totalWins,
      losses: totalLosses,
      draws: totalDraws,
      winAP,
      loseAP,
      drawAP,
      totalAP
    };
  }, [myCards]);

  // CP 보상 계산 (승리당 CP_INCOME.MATCH_WIN)
  const cpRewardData = useMemo(() => {
    let totalCP = 0;
    myCards.forEach(card => {
      totalCP += (card.wins || 0) * CP_INCOME.MATCH_WIN;
      totalCP += (card.losses || 0) * CP_INCOME.MATCH_LOSE;
    });
    return totalCP;
  }, [myCards]);

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
        <div className="text-sm text-text-primary space-y-2">
          {/* EXP 보상 */}
          <div>
            <div className="text-text-secondary text-xs mb-1">경험치</div>
            <div>참가 보상: <span className="text-green-400">+50 EXP (전원)</span></div>
            {myCards.map(card => (
              <div key={card.odId}>
                {card.odName} ({getRankIcon(card.rank)}):
                <span className="text-green-400 ml-1">+{card.exp} EXP</span>
                {card.rank <= 4 && <span className="text-yellow-400 ml-1">+ 다음 시즌 시드</span>}
              </div>
            ))}
          </div>

          {/* AP 보상 */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-text-secondary text-xs mb-1">활동 포인트</div>
            <div className="flex items-center gap-2">
              <span className="text-orange-400 font-bold">+{apRewardData.totalAP} AP</span>
              <span className="text-text-secondary text-xs">
                (승리 {apRewardData.wins}회 × {AP_WIN} + 패배 {apRewardData.losses}회 × {AP_LOSE})
              </span>
            </div>
          </div>

          {/* CP 보상 */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-text-secondary text-xs mb-1">크루 포인트</div>
            <div className="flex items-center gap-2">
              <span className="text-blue-400 font-bold">+{cpRewardData} CP</span>
              <span className="text-text-secondary text-xs">
                (승리 {apRewardData.wins}회 × {CP_INCOME.MATCH_WIN} + 패배 {apRewardData.losses}회 × {CP_INCOME.MATCH_LOSE})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 영역 */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="primary" onClick={handleClaimReward} className="px-8">
          🎁 보상 수령하기
        </Button>
        <Button
          variant="secondary"
          onClick={() => setShowHallOfFame(true)}
          className="px-8"
        >
          👑 명예의 전당
        </Button>
      </div>

      {/* RewardClaimScreen 모달 */}
      {showRewardScreen && (
        <RewardClaimScreen
          season={currentLeague.season}
          myCardRewards={getRewardData()}
          apReward={apRewardData}
          cpReward={cpRewardData}
          onConfirm={handleRewardConfirm}
        />
      )}

      {/* Phase 4: HallOfFameScreen 모달 */}
      {showHallOfFame && (
        <div className="fixed inset-0 z-50 bg-black/80 overflow-y-auto">
          <HallOfFameScreen
            data={hallOfFameData}
            onBack={() => setShowHallOfFame(false)}
          />
        </div>
      )}
    </motion.div>
  );
}

export default LeagueFinishedScreen;
