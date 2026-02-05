// ========================================
// 리그 종료 화면 컴포넌트
// ========================================

import { motion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useIndividualLeagueStore } from '../../stores/individualLeagueStore';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { Button } from '../UI/Button';
import { INDIVIDUAL_LEAGUE_REWARDS } from '../../types';

interface LeagueFinishedScreenProps {
  onFinish?: () => void;
}

export function LeagueFinishedScreen({ onFinish }: LeagueFinishedScreenProps) {
  const { currentLeague, getPlayerCrewIds, finishLeague } = useIndividualLeagueStore(
    useShallow(state => ({
      currentLeague: state.currentLeague,
      getPlayerCrewIds: state.getPlayerCrewIds,
      finishLeague: state.finishLeague,
    }))
  );

  const playerCardIds = getPlayerCrewIds();

  if (!currentLeague || currentLeague.status !== 'FINISHED') return null;

  const { champion, runnerUp, participants, brackets } = currentLeague;

  // 캐릭터 정보 가져오기
  const getCharInfo = (odId: string) => {
    const char = CHARACTERS_BY_ID[odId];
    return {
      name: char?.name.ko || '???',
      grade: char?.grade || '',
      imageUrl: char?.imageUrl || '',
    };
  };

  // 내 카드인지 확인
  const isMyCard = (odId: string): boolean => {
    return playerCardIds.includes(odId);
  };

  // 순위 계산
  const getRankings = () => {
    const rankings: { odId: string; rank: number; rankLabel: string; wins: number; losses: number }[] = [];

    // 1위: 우승자
    if (champion) {
      const p = participants.find(p => p.odId === champion);
      rankings.push({
        odId: champion,
        rank: 1,
        rankLabel: '🥇 우승',
        wins: p?.wins || 0,
        losses: p?.losses || 0
      });
    }

    // 2위: 준우승
    if (runnerUp) {
      const p = participants.find(p => p.odId === runnerUp);
      rankings.push({
        odId: runnerUp,
        rank: 2,
        rankLabel: '🥈 준우승',
        wins: p?.wins || 0,
        losses: p?.losses || 0
      });
    }

    // 3~4위: 4강 탈락
    const semiLosers = brackets.semi
      .filter(m => m.winner)
      .map(m => m.winner === m.participant1 ? m.participant2 : m.participant1);
    semiLosers.forEach(odId => {
      const p = participants.find(p => p.odId === odId);
      rankings.push({
        odId,
        rank: 3,
        rankLabel: '🥉 4강',
        wins: p?.wins || 0,
        losses: p?.losses || 0
      });
    });

    // 5~8위: 8강 탈락
    const quarterLosers = brackets.quarter
      .filter(m => m.winner)
      .map(m => m.winner === m.participant1 ? m.participant2 : m.participant1);
    quarterLosers.forEach(odId => {
      const p = participants.find(p => p.odId === odId);
      rankings.push({
        odId,
        rank: 5,
        rankLabel: '8강',
        wins: p?.wins || 0,
        losses: p?.losses || 0
      });
    });

    // 9~16위: 16강 탈락
    participants
      .filter(p => p.eliminatedAt === 'ROUND_16')
      .forEach(p => {
        rankings.push({
          odId: p.odId,
          rank: 9,
          rankLabel: '16강',
          wins: p.wins || 0,
          losses: p.losses || 0
        });
      });

    // 17~32위: 32강 탈락
    participants
      .filter(p => p.eliminatedAt === 'ROUND_32')
      .forEach(p => {
        rankings.push({
          odId: p.odId,
          rank: 17,
          rankLabel: '32강',
          wins: p.wins || 0,
          losses: p.losses || 0
        });
      });

    return rankings;
  };

  const rankings = getRankings();

  // 내 카드 순위
  const myCardRankings = rankings
    .filter(r => isMyCard(r.odId))
    .sort((a, b) => a.rank - b.rank);

  // 최고 순위
  const myBestRanking = myCardRankings[0];

  // 리그 종료 및 보상 수령
  const handleFinish = () => {
    finishLeague();
    onFinish?.();
  };

  // 챔피언 정보
  const championInfo = champion ? getCharInfo(champion) : null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* 헤더 */}
      <div className="text-center">
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5 }}
          className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent"
        >
          🎊 개인 리그 시즌 {currentLeague.season} 종료! 🎊
        </motion.h1>
      </div>

      {/* 챔피언 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-b from-yellow-500/20 to-yellow-500/5 border-2 border-yellow-500/50 rounded-2xl p-6 text-center"
      >
        <div className="text-xl text-yellow-400 mb-4">👑 챔피언 👑</div>

        {championInfo && (
          <div className="inline-block">
            <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden border-4 border-yellow-500/50 mb-4">
              {championInfo.imageUrl && (
                <img
                  src={championInfo.imageUrl}
                  alt={championInfo.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className={`text-2xl font-bold ${isMyCard(champion!) ? 'text-yellow-400' : 'text-text-primary'}`}>
              {isMyCard(champion!) && '⭐ '}
              {championInfo.name}
            </div>
            <div className="text-text-secondary">{championInfo.grade}</div>
          </div>
        )}

        {isMyCard(champion!) && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="mt-4 text-lg text-yellow-400 animate-pulse"
          >
            🎉 내 카드가 우승했습니다! 🎉
          </motion.div>
        )}
      </motion.div>

      {/* 내 카드 성적 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-bg-secondary rounded-xl border border-white/10 p-4"
      >
        <div className="text-center text-text-secondary mb-4">
          ── 내 카드 성적 ──
        </div>

        {myBestRanking && (
          <div className="text-center mb-4">
            <span className="text-text-secondary">최고 성적: </span>
            <span className="text-green-400 font-bold">{myBestRanking.rankLabel}</span>
            <span className="text-text-secondary"> ({getCharInfo(myBestRanking.odId).name})</span>
          </div>
        )}

        <div className="space-y-2">
          {myCardRankings.map(r => {
            const charInfo = getCharInfo(r.odId);
            return (
              <div
                key={r.odId}
                className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg border-l-4 border-yellow-500"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden">
                  {charInfo.imageUrl && (
                    <img
                      src={charInfo.imageUrl}
                      alt={charInfo.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-yellow-400">
                    ⭐ {charInfo.name}
                  </div>
                  <div className="text-sm text-green-400">{r.rankLabel}</div>
                </div>
                <div className="text-sm text-text-secondary">
                  {r.wins}승 {r.losses}패
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 전체 순위 (상위 16명) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-bg-secondary rounded-xl border border-white/10 p-4"
      >
        <div className="text-center text-text-secondary mb-4">
          ── 전체 순위 (상위 16명) ──
        </div>

        <div className="space-y-1">
          {/* 헤더 */}
          <div className="grid grid-cols-12 gap-2 text-xs text-text-secondary px-3 py-2 border-b border-white/10">
            <span className="col-span-2">순위</span>
            <span className="col-span-7">이름</span>
            <span className="col-span-3 text-right">전적</span>
          </div>

          {/* 순위 목록 */}
          {rankings.slice(0, 16).map((r) => {
            const charInfo = getCharInfo(r.odId);
            return (
              <div
                key={r.odId}
                className={`
                  grid grid-cols-12 gap-2 items-center px-3 py-2 rounded-lg
                  ${isMyCard(r.odId) ? 'bg-yellow-500/10 border-l-2 border-yellow-500' : ''}
                  ${r.rank === 1 ? 'bg-gradient-to-r from-yellow-500/20 to-transparent' : ''}
                `}
              >
                <span className="col-span-2 font-bold">
                  {r.rank === 1 && '🥇'}
                  {r.rank === 2 && '🥈'}
                  {r.rank === 3 && '🥉'}
                  {r.rank > 3 && `${r.rank}위`}
                </span>
                <span className={`col-span-7 ${isMyCard(r.odId) ? 'text-yellow-400 font-bold' : 'text-text-primary'}`}>
                  {isMyCard(r.odId) && '⭐ '}
                  {charInfo.name}
                </span>
                <span className="col-span-3 text-right text-text-secondary text-sm">
                  {r.wins}승 {r.losses}패
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 보상 요약 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="bg-bg-secondary rounded-xl border border-white/10 p-4"
      >
        <div className="text-center text-text-secondary mb-4">
          ── 획득 보상 ──
        </div>

        <div className="space-y-2">
          <div className="flex justify-between p-2 bg-white/5 rounded-lg">
            <span>참가 보상</span>
            <span className="text-green-400">+{INDIVIDUAL_LEAGUE_REWARDS['ROUND_32'].exp} EXP (전원)</span>
          </div>

          {myBestRanking && myBestRanking.rank <= 16 && (
            <div className="flex justify-between p-2 bg-white/5 rounded-lg">
              <span>16강 진출</span>
              <span className="text-green-400">+{INDIVIDUAL_LEAGUE_REWARDS['ROUND_16'].exp - INDIVIDUAL_LEAGUE_REWARDS['ROUND_32'].exp} EXP</span>
            </div>
          )}

          {myBestRanking && myBestRanking.rank <= 8 && (
            <div className="flex justify-between p-2 bg-white/5 rounded-lg">
              <span>8강 진출</span>
              <span className="text-green-400">+{INDIVIDUAL_LEAGUE_REWARDS['QUARTER'].exp - INDIVIDUAL_LEAGUE_REWARDS['ROUND_16'].exp} EXP</span>
            </div>
          )}

          {myBestRanking && myBestRanking.rank <= 4 && (
            <div className="flex justify-between p-2 bg-white/5 rounded-lg">
              <span>4강 진출</span>
              <span className="text-green-400">+{INDIVIDUAL_LEAGUE_REWARDS['SEMI'].exp - INDIVIDUAL_LEAGUE_REWARDS['QUARTER'].exp} EXP</span>
            </div>
          )}

          {myBestRanking && myBestRanking.rank <= 2 && (
            <div className="flex justify-between p-2 bg-white/5 rounded-lg">
              <span>결승 진출</span>
              <span className="text-green-400">+{INDIVIDUAL_LEAGUE_REWARDS['FINAL'].exp - INDIVIDUAL_LEAGUE_REWARDS['SEMI'].exp} EXP</span>
            </div>
          )}

          {myBestRanking && myBestRanking.rank === 1 && (
            <div className="flex justify-between p-2 bg-yellow-500/20 rounded-lg font-bold text-yellow-400">
              <span>🏆 우승</span>
              <span>+{INDIVIDUAL_LEAGUE_REWARDS['FINISHED'].exp - INDIVIDUAL_LEAGUE_REWARDS['FINAL'].exp} EXP</span>
            </div>
          )}
        </div>
      </motion.div>

      {/* 종료 버튼 */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        <Button variant="primary" onClick={handleFinish} className="w-full">
          🎁 보상 수령 및 리그 종료
        </Button>
      </motion.div>
    </motion.div>
  );
}

export default LeagueFinishedScreen;
