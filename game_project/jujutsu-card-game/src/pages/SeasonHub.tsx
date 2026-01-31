// ========================================
// 시즌 허브 - 메인 화면
// ========================================

import { motion } from 'framer-motion';
import { useSeasonStore } from '../stores/seasonStore';
import { usePlayerStore } from '../stores/playerStore';
import { AI_CREWS_BY_ID, PLAYER_CREW_ID } from '../data/aiCrews';
import { Button } from '../components/UI/Button';
import type { LeagueStanding } from '../types';

interface SeasonHubProps {
  onStartMatch: (opponentCrewId: string) => void;
  onCrewManagement: () => void;
  onCollection: () => void;
  onProfile: () => void;
  onSettings: () => void;
}

export function SeasonHub({
  onStartMatch,
  onCrewManagement,
  onCollection,
  onProfile,
  onSettings
}: SeasonHubProps) {
  const {
    currentSeason,
    startNewSeason,
    getNextMatch,
    getCurrentStandings,
    getPlayerRank,
    endSeason
  } = useSeasonStore();

  const { player } = usePlayerStore();
  const standings = getCurrentStandings();
  const nextMatch = getNextMatch();
  const playerRank = getPlayerRank();

  // 시즌이 없으면 새 시즌 시작 프롬프트
  if (!currentSeason) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-accent mb-3">영역전개</h1>
          <p className="text-lg text-text-secondary">주술회전 카드 배틀 리그</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-card rounded-xl p-8 max-w-md w-full text-center border border-white/10"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">새 시즌 시작</h2>
          <p className="text-text-secondary mb-6">
            6개 크루가 참가하는 리그전!<br />
            각 팀과 1회씩 대결하여 최고의 크루를 가리세요.
          </p>
          <Button onClick={startNewSeason} variant="primary" size="lg" className="w-full">
            시즌 1 시작하기
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex gap-3"
        >
          <Button onClick={onCrewManagement} variant="ghost">크루 관리</Button>
          <Button onClick={onCollection} variant="ghost">컬렉션</Button>
          <Button onClick={onSettings} variant="ghost">설정</Button>
        </motion.div>
      </div>
    );
  }

  // 시즌 완료 화면
  if (currentSeason.status === 'COMPLETED') {
    const champion = currentSeason.champion;
    const isPlayerChampion = champion === PLAYER_CREW_ID;
    const championName = isPlayerChampion ? player.name : AI_CREWS_BY_ID[champion!]?.name || '???';

    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-card rounded-xl p-8 max-w-md w-full text-center border border-white/10"
        >
          <div className="text-6xl mb-4">{isPlayerChampion ? '👑' : '🏆'}</div>
          <h2 className="text-3xl font-bold text-accent mb-2">시즌 {currentSeason.number} 종료!</h2>

          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <div className="text-sm text-text-secondary mb-1">우승</div>
            <div className={`text-2xl font-bold ${isPlayerChampion ? 'text-win' : 'text-text-primary'}`}>
              {championName}
            </div>
          </div>

          <div className="bg-black/30 rounded-lg p-4 mb-6">
            <div className="text-sm text-text-secondary mb-1">당신의 순위</div>
            <div className="text-3xl font-bold text-accent">{playerRank}위</div>
            <div className="text-sm text-text-secondary">
              {standings.find(s => s.crewId === PLAYER_CREW_ID)?.points || 0}점
            </div>
          </div>

          <Button onClick={startNewSeason} variant="primary" size="lg" className="w-full">
            다음 시즌 시작
          </Button>
        </motion.div>
      </div>
    );
  }

  // 모든 플레이어 경기 완료 여부는 nextMatch로 확인

  return (
    <div className="min-h-screen w-full p-4 md:p-8">
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-accent">시즌 {currentSeason.number}</h1>
            <p className="text-text-secondary">
              {currentSeason.matches.filter(m => m.played).length} / {currentSeason.matches.length} 경기 완료
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-text-secondary">내 순위</div>
            <div className="text-3xl font-bold text-accent">{playerRank}위</div>
          </div>
        </div>
      </motion.div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
        {/* 다음 경기 */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-bg-card rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-lg font-bold text-text-primary mb-4">📅 다음 경기</h2>

          {nextMatch ? (
            <div>
              <div className="bg-black/30 rounded-lg p-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-text-secondary mb-2">VS</div>
                  <div className="text-2xl font-bold text-text-primary">
                    {AI_CREWS_BY_ID[nextMatch.awayCrewId]?.name || '???'}
                  </div>
                  <div className="text-sm text-text-secondary mt-1">
                    {AI_CREWS_BY_ID[nextMatch.awayCrewId]?.description}
                  </div>
                  <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                    AI_CREWS_BY_ID[nextMatch.awayCrewId]?.difficulty === 'HARD'
                      ? 'bg-red-500/20 text-red-400'
                      : AI_CREWS_BY_ID[nextMatch.awayCrewId]?.difficulty === 'NORMAL'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-green-500/20 text-green-400'
                  }`}>
                    {AI_CREWS_BY_ID[nextMatch.awayCrewId]?.difficulty === 'HARD' ? '어려움'
                      : AI_CREWS_BY_ID[nextMatch.awayCrewId]?.difficulty === 'NORMAL' ? '보통' : '쉬움'}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => onStartMatch(nextMatch.awayCrewId)}
                variant="primary"
                size="lg"
                className="w-full"
              >
                ⚔️ 대전 시작
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-text-secondary mb-4">모든 경기 완료!</div>
              <Button onClick={endSeason} variant="primary" className="w-full">
                시즌 종료
              </Button>
            </div>
          )}
        </motion.div>

        {/* 순위표 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-bg-card rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-lg font-bold text-text-primary mb-4">🏆 순위표</h2>

          <div className="space-y-2">
            {standings.map((standing, index) => (
              <StandingRow
                key={standing.crewId}
                standing={standing}
                rank={index + 1}
                isPlayer={standing.crewId === PLAYER_CREW_ID}
                playerName={player.name}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* 하단 메뉴 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto mt-6 flex justify-center gap-3 flex-wrap"
      >
        <Button onClick={onCrewManagement} variant="secondary">크루 관리</Button>
        <Button onClick={onCollection} variant="ghost">컬렉션</Button>
        <Button onClick={onProfile} variant="ghost">프로필</Button>
        <Button onClick={onSettings} variant="ghost">설정</Button>
      </motion.div>
    </div>
  );
}

// 순위표 행 컴포넌트
interface StandingRowProps {
  standing: LeagueStanding;
  rank: number;
  isPlayer: boolean;
  playerName: string;
}

function StandingRow({ standing, rank, isPlayer, playerName }: StandingRowProps) {
  const crewName = isPlayer ? playerName : AI_CREWS_BY_ID[standing.crewId]?.name || '???';

  const rankBadge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
        isPlayer
          ? 'bg-accent/20 border border-accent/50'
          : 'bg-black/20 hover:bg-black/30'
      }`}
    >
      <div className="w-8 text-center font-bold">{rankBadge}</div>
      <div className="flex-1">
        <div className={`font-medium ${isPlayer ? 'text-accent' : 'text-text-primary'}`}>
          {crewName}
        </div>
        <div className="text-xs text-text-secondary">
          {standing.played}경기 | {standing.wins}승 {standing.draws}무 {standing.losses}패
        </div>
      </div>
      <div className="text-right">
        <div className="text-lg font-bold text-accent">{standing.points}</div>
        <div className="text-xs text-text-secondary">점</div>
      </div>
    </div>
  );
}
