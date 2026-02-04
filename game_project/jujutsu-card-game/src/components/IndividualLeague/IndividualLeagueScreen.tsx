// ========================================
// 개인 리그 메인 화면
// ========================================

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useIndividualLeagueStore } from '../../stores/individualLeagueStore';
import { useSeasonStore } from '../../stores/seasonStore';
import { Button } from '../UI/Button';
import { TournamentBracket } from './TournamentBracket';
import { GroupStageView } from './GroupStageView';
import { PlayerCardStatus } from './PlayerCardStatus';
import { NominationScreen } from './NominationScreen';
import { Round16Bracket } from './Round16Bracket';
import { KnockoutBracket } from './KnockoutBracket';
import { LeagueFinishedScreen } from './LeagueFinishedScreen';

interface IndividualLeagueScreenProps {
  onStartMatch?: (playerCardId: string, opponentId: string, matchId: string) => void;
  onBack?: () => void;
}

export function IndividualLeagueScreen({
  onStartMatch,
  onBack
}: IndividualLeagueScreenProps) {
  const {
    currentLeague,
    currentSeason,
    hallOfFame,
    startNewLeague,
    simulateAllRemainingMatches,
    advanceRound,
    getNextPlayerMatch,
    getPlayerCardStatuses
  } = useIndividualLeagueStore(useShallow(state => ({
    currentLeague: state.currentLeague,
    currentSeason: state.currentSeason,
    hallOfFame: state.hallOfFame,
    startNewLeague: state.startNewLeague,
    simulateAllRemainingMatches: state.simulateAllRemainingMatches,
    advanceRound: state.advanceRound,
    getNextPlayerMatch: state.getNextPlayerMatch,
    getPlayerCardStatuses: state.getPlayerCardStatuses
  })));

  const playerCrew = useSeasonStore(state => state.playerCrew);

  const [showBracket, setShowBracket] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [showRound16Bracket, setShowRound16Bracket] = useState(false);
  const [showKnockoutBracket, setShowKnockoutBracket] = useState(false);

  // 리그 시작
  const handleStartLeague = () => {
    if (playerCrew.length >= 5) {
      startNewLeague(playerCrew, '내 크루');
    }
  };

  // 경기 스킵 (모두 시뮬레이션)
  const handleSkipMatches = () => {
    simulateAllRemainingMatches();
  };

  // 다음 라운드로
  const handleAdvanceRound = () => {
    advanceRound();
  };

  // 라운드 완료 여부
  const isRoundComplete = () => {
    if (!currentLeague) return false;
    const status = currentLeague.status;

    if (status === 'ROUND_32') {
      return currentLeague.brackets.round32.every(m => m.played);
    }
    if (status === 'ROUND_16') {
      return currentLeague.brackets.round16.every(g => g.winner !== null);
    }
    if (status === 'QUARTER') {
      return currentLeague.brackets.quarter.every(m => m.played);
    }
    if (status === 'SEMI') {
      return currentLeague.brackets.semi.every(m => m.played);
    }
    if (status === 'FINAL') {
      return currentLeague.brackets.final?.played ?? false;
    }
    return false;
  };

  // 라운드 이름 가져오기
  const getRoundName = (status: string) => {
    const names: Record<string, string> = {
      'NOT_STARTED': '시작 전',
      'ROUND_32': '32강',
      'ROUND_16_NOMINATION': '16강 지명',
      'ROUND_16': '16강 (A~H조)',
      'QUARTER': '8강',
      'SEMI': '4강',
      'FINAL': '결승',
      'FINISHED': '종료'
    };
    return names[status] || status;
  };

  // 리그 없음 - 시작 화면
  if (!currentLeague) {
    return (
      <div className="min-h-screen bg-bg-primary p-4">
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-2xl font-bold text-text-primary">
              🏆 개인 리그
            </div>
            {onBack && (
              <Button variant="ghost" onClick={onBack}>
                뒤로
              </Button>
            )}
          </div>

          {/* 시작 카드 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-bg-secondary rounded-xl border border-white/10 p-6 text-center"
          >
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-xl font-bold text-text-primary mb-2">
              시즌 {currentSeason} 개인 리그
            </h2>
            <p className="text-text-secondary mb-6">
              32명의 술사가 참가하는 개인 토너먼트입니다.<br />
              내 크루 카드 {playerCrew.length}장이 자동으로 참가합니다.
            </p>

            <div className="bg-bg-primary/50 rounded-lg p-4 mb-6 text-left">
              <div className="text-sm font-bold text-accent mb-2">📋 토너먼트 형식</div>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• 32강: 단판 (1승)</li>
                <li>• 16강: A~H조 4인 토너먼트</li>
                <li>• 8강/4강/결승: 5판 3선승</li>
              </ul>
            </div>

            <div className="bg-bg-primary/50 rounded-lg p-4 mb-6 text-left">
              <div className="text-sm font-bold text-accent mb-2">🎁 보상</div>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• 32강 탈락: 경험치 +50</li>
                <li>• 16강 진출: 경험치 +100</li>
                <li>• 8강 진출: 경험치 +200</li>
                <li>• 4강 진출: 경험치 +300</li>
                <li>• 준우승: 경험치 +500</li>
                <li>• <span className="text-yellow-400">우승: 경험치 +1000, 챔피언 타이틀</span></li>
              </ul>
            </div>

            <Button
              variant="primary"
              onClick={handleStartLeague}
              disabled={playerCrew.length < 5}
              className="px-8"
            >
              🚀 리그 시작
            </Button>

            {playerCrew.length < 5 && (
              <p className="text-sm text-red-400 mt-2">
                크루에 5장 이상의 카드가 필요합니다.
              </p>
            )}
          </motion.div>

          {/* 명예의 전당 */}
          {hallOfFame.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-6 bg-bg-secondary rounded-xl border border-white/10 p-4"
            >
              <div className="text-lg font-bold text-yellow-400 mb-3">
                👑 명예의 전당
              </div>
              <div className="space-y-2">
                {hallOfFame.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-bg-primary/50 rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400">🏆</span>
                      <span className="text-text-primary font-bold">{entry.championName}</span>
                    </div>
                    <div className="text-sm text-text-secondary">
                      시즌 {entry.season} | {entry.crewName}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // 리그 진행 중
  const playerStatuses = getPlayerCardStatuses();
  const roundComplete = isRoundComplete();

  return (
    <div className="min-h-screen bg-bg-primary p-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-xl font-bold text-text-primary">
            🏆 개인 리그 시즌 {currentLeague.season} 🏆
          </div>
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              뒤로
            </Button>
          )}
        </div>

        {/* 현재 단계 */}
        <div className="bg-accent/20 border border-accent/50 rounded-lg px-4 py-2 mb-4 text-center">
          <span className="text-accent font-bold">
            현재 단계: {getRoundName(currentLeague.status)}
          </span>
        </div>

        {/* 리그 종료 시 */}
        {currentLeague.status === 'FINISHED' && (
          <LeagueFinishedScreen onFinish={onBack} />
        )}

        {/* 16강 지명 단계 */}
        {currentLeague.status === 'ROUND_16_NOMINATION' && (
          <div className="bg-bg-secondary rounded-xl border border-white/10 p-4 mb-4">
            <NominationScreen />
          </div>
        )}

        {/* 내 카드 현황 */}
        <div className="bg-bg-secondary rounded-xl border border-white/10 p-4 mb-4">
          <div className="text-sm font-bold text-text-primary mb-3">
            ═══════════ 내 카드 현황 ═══════════
          </div>
          <div className="space-y-2">
            {playerStatuses.map((card) => (
              <PlayerCardStatus
                key={card.odId}
                odId={card.odId}
                odName={card.odName}
                status={card.status}
                currentStage={card.currentStage}
                nextMatchInfo={card.nextMatchInfo}
                wins={card.wins}
              />
            ))}
          </div>
        </div>

        {/* 액션 버튼 */}
        {currentLeague.status !== 'FINISHED' && currentLeague.status !== 'ROUND_16_NOMINATION' && (
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <Button
              variant="ghost"
              onClick={() => setShowBracket(true)}
            >
              📋 대진표 보기
            </Button>

            {currentLeague.status === 'ROUND_16' && (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setShowRound16Bracket(true)}
                >
                  📊 16강 대진표
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowGroups(true)}
                >
                  📊 조별 현황
                </Button>
              </>
            )}

            {(currentLeague.status === 'QUARTER' || currentLeague.status === 'SEMI' || currentLeague.status === 'FINAL') && (
              <Button
                variant="ghost"
                onClick={() => setShowKnockoutBracket(true)}
              >
                📊 토너먼트 대진표
              </Button>
            )}

            {!roundComplete && (
              <button
                type="button"
                onClick={() => {
                  const match = getNextPlayerMatch();
                  if (match?.playerCardId && match?.opponentId && match?.match && onStartMatch) {
                    onStartMatch(match.playerCardId, match.opponentId, match.match.id);
                  } else {
                    simulateAllRemainingMatches();
                  }
                }}
                className="px-4 py-2 bg-accent hover:bg-accent/80 text-white font-bold rounded-lg transition-colors"
              >
                ⚔️ 다음 경기 진행
              </button>
            )}

            {!roundComplete && (
              <Button
                variant="secondary"
                onClick={handleSkipMatches}
              >
                ⏩ 경기 스킵
              </Button>
            )}

            {roundComplete && (
              <Button
                variant="primary"
                onClick={handleAdvanceRound}
              >
                ➡️ 다음 라운드
              </Button>
            )}
          </div>
        )}

        {/* 대진표 모달 */}
        {showBracket && (
          <TournamentBracket
            league={currentLeague}
            onClose={() => setShowBracket(false)}
          />
        )}

        {/* 조별 현황 모달 */}
        {showGroups && currentLeague.status === 'ROUND_16' && (
          <GroupStageView
            groups={currentLeague.brackets.round16}
            participants={currentLeague.participants}
            onClose={() => setShowGroups(false)}
          />
        )}

        {/* 16강 대진표 모달 */}
        {showRound16Bracket && currentLeague.status === 'ROUND_16' && (
          <Round16Bracket onClose={() => setShowRound16Bracket(false)} />
        )}

        {/* 8강/4강/결승 대진표 모달 */}
        {showKnockoutBracket && (currentLeague.status === 'QUARTER' || currentLeague.status === 'SEMI' || currentLeague.status === 'FINAL') && (
          <KnockoutBracket onClose={() => setShowKnockoutBracket(false)} />
        )}
      </div>
    </div>
  );
}

export default IndividualLeagueScreen;
