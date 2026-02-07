// ========================================
// 개인리그 성적 탭 컴포넌트
// ========================================

import { useCardRecordStore } from '../../stores/cardRecordStore';
import { CHARACTERS_BY_ID } from '../../data/characters';

interface IndividualLeagueRecordTabProps {
  cardId: string;
}

export function IndividualLeagueRecordTab({ cardId }: IndividualLeagueRecordTabProps) {
  const { records } = useCardRecordStore();
  const cardRecord = records[cardId];

  if (!cardRecord?.individualLeague?.seasons?.length) {
    return (
      <div className="p-4 text-center text-text-secondary">
        개인리그 참가 기록이 없습니다.
      </div>
    );
  }

  const { individualLeague } = cardRecord;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `${rank}위`;
  };

  const getAwardLabel = (award: string) => {
    switch (award) {
      case 'MVP': return '🏅 MVP';
      case 'MOST_WINS': return '⚔️ 최다승';
      case 'DARK_HORSE': return '🌟 다크호스';
      default: return award;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* 통산 기록 */}
      <div className="bg-bg-secondary rounded-lg p-4">
        <h3 className="font-bold text-text-primary mb-2">📊 통산 기록</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-text-secondary">총 전적</div>
            <div className="text-lg font-bold text-text-primary">
              {individualLeague.totalWins}승 {individualLeague.totalLosses}패
            </div>
          </div>
          <div>
            <div className="text-text-secondary">최고 순위</div>
            <div className="text-lg font-bold text-yellow-400">
              {individualLeague.bestRank}위
            </div>
          </div>
          <div>
            <div className="text-text-secondary">우승 횟수</div>
            <div className="text-lg font-bold text-yellow-400">
              {individualLeague.championships}회 🏆
            </div>
          </div>
          <div>
            <div className="text-text-secondary">참가 시즌</div>
            <div className="text-lg font-bold text-text-primary">
              {individualLeague.seasons.length}회
            </div>
          </div>
        </div>
      </div>

      {/* 시즌별 기록 */}
      {individualLeague.seasons.map(season => (
        <div key={season.season} className="bg-bg-secondary rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-text-primary">
              시즌 {season.season}
            </h3>
            <div className="flex items-center gap-2">
              <span className={`font-bold ${season.finalRank <= 3 ? 'text-yellow-400' : 'text-text-primary'}`}>
                {getRankIcon(season.finalRank)}
              </span>
              <span className="text-text-secondary">
                ({season.wins}승 {season.losses}패)
              </span>
              <span className="text-green-400">
                +{season.expEarned} EXP
              </span>
            </div>
          </div>

          {/* 개인상 */}
          {season.awards.length > 0 && (
            <div className="flex gap-2 mb-3">
              {season.awards.map(award => (
                <span
                  key={award}
                  className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded"
                >
                  {getAwardLabel(award)}
                </span>
              ))}
            </div>
          )}

          {/* 경기 기록 */}
          {season.matchHistory && season.matchHistory.length > 0 && (
            <div className="space-y-1">
              {season.matchHistory.map((match, idx) => {
                const opponent = CHARACTERS_BY_ID[match.opponentId];
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm py-1 px-2 rounded bg-bg-primary/50"
                  >
                    <span className="text-text-secondary w-16">{match.round}</span>
                    <span className="text-text-primary flex-1">
                      vs {opponent?.name.ko || match.opponentName}
                    </span>
                    <span className={match.result === 'WIN' ? 'text-green-400' : 'text-red-400'}>
                      {match.result === 'WIN' ? '✓ 승' : '✗ 패'}
                      <span className="text-text-secondary ml-1">
                        ({match.score.my}:{match.score.opponent})
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default IndividualLeagueRecordTab;
