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
import { Round16Bracket } from './Round16Bracket';
import { KnockoutBracket } from './KnockoutBracket';
import { LeagueFinishedScreen } from './LeagueFinishedScreen';

interface IndividualLeagueScreenProps {
  onStartMatch?: (playerCardId: string, opponentId: string, matchId: string, format: import('../../types').LeagueMatchFormat) => void;
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
    advanceRound,
    getNextPlayerMatch,
    getPlayerCardStatuses,
    // Step 2: 시뮬레이션 기반 배틀
    simulateIndividualMatch,
    skipToNextPlayerMatch,
    findNextMatch,
    lastSimMatchResult
  } = useIndividualLeagueStore(useShallow(state => ({
    currentLeague: state.currentLeague,
    currentSeason: state.currentSeason,
    hallOfFame: state.hallOfFame,
    startNewLeague: state.startNewLeague,
    advanceRound: state.advanceRound,
    getNextPlayerMatch: state.getNextPlayerMatch,
    getPlayerCardStatuses: state.getPlayerCardStatuses,
    // Step 2: 시뮬레이션 기반 배틀
    simulateIndividualMatch: state.simulateIndividualMatch,
    skipToNextPlayerMatch: state.skipToNextPlayerMatch,
    findNextMatch: state.findNextMatch,
    lastSimMatchResult: state.lastSimMatchResult
  })));

  const playerCrew = useSeasonStore(state => state.playerCrew);

  const [showBracket, setShowBracket] = useState(false);
  const [showGroups, setShowGroups] = useState(false);
  const [showRound16Bracket, setShowRound16Bracket] = useState(false);
  const [showKnockoutBracket, setShowKnockoutBracket] = useState(false);
  const [showMatchResult, setShowMatchResult] = useState(false);

  // 리그 시작
  const handleStartLeague = () => {
    if (playerCrew.length >= 5) {
      startNewLeague(playerCrew, '내 크루');
    }
  };

  // Step 2: 다음 경기 진행 (시뮬레이션 기반)
  const handleNextMatch = () => {
    console.log('[handleNextMatch] 클릭');

    // 내 카드 경기까지 자동 스킵
    const nextPlayerMatch = skipToNextPlayerMatch();

    if (!nextPlayerMatch) {
      console.log('[handleNextMatch] 내 카드 경기 없음');
      // 현재 라운드 완료 체크
      return;
    }

    console.log('[handleNextMatch] 내 카드 경기 시작:', nextPlayerMatch.id);

    // 시뮬레이션 실행
    const result = simulateIndividualMatch(nextPlayerMatch.id);

    if (result) {
      // 결과 화면 표시 (Step 3에서 구현)
      setShowMatchResult(true);
    }
  };

  // Step 2: 모든 경기 스킵 (시뮬레이션)
  const handleSkipAll = () => {
    console.log('[handleSkipAll] 모든 경기 스킵');

    let safetyCounter = 0;
    while (safetyCounter < 100) {
      safetyCounter++;
      const nextMatch = findNextMatch();
      if (!nextMatch) break;
      simulateIndividualMatch(nextMatch.id);
    }
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
      // 16강 토너먼트 (1:1 녹아웃)
      const round16Matches = currentLeague.brackets.round16Matches || [];
      return round16Matches.length > 0 && round16Matches.every(m => m.played);
    }
    if (status === 'QUARTER') {
      return currentLeague.brackets.quarter.every(m => m.played);
    }
    if (status === 'SEMI') {
      return currentLeague.brackets.semi.every(m => m.played);
    }
    if (status === 'FINAL') {
      // 결승과 3/4위전 모두 완료되어야 함
      const finalDone = currentLeague.brackets.final?.played ?? false;
      const thirdPlaceDone = currentLeague.brackets.thirdPlace?.played ?? true; // 3/4위전 없으면 true
      return finalDone && thirdPlaceDone;
    }
    return false;
  };

  // 라운드 이름 가져오기
  const getRoundName = (status: string) => {
    const names: Record<string, string> = {
      'NOT_STARTED': '시작 전',
      'ROUND_32': '32강 조별리그',
      'ROUND_16': '16강 토너먼트',
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
              등급순 상위 32명의 술사가 참가하는 개인 토너먼트입니다.<br />
              내 크루 카드도 등급에 따라 참가할 수 있습니다.
            </p>

            <div className="bg-bg-primary/50 rounded-lg p-4 mb-6 text-left">
              <div className="text-sm font-bold text-accent mb-2">📋 토너먼트 형식</div>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• 32강: 8조 × 4명 조별 풀 리그전 (각 조 상위 2명 진출, 단판)</li>
                <li>• 16강: 3판 2선승 (교차 대진)</li>
                <li>• 8강: 3판 2선승</li>
                <li>• 4강/결승/3,4위전: 5판 3선승</li>
              </ul>
            </div>

            <div className="bg-bg-primary/50 rounded-lg p-4 mb-6 text-left">
              <div className="text-sm font-bold text-accent mb-2">🎁 보상 (최종 순위 기준)</div>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• 32강 탈락 (17~32위): 경험치 +50</li>
                <li>• 16강 탈락 (9~16위): 경험치 +100</li>
                <li>• 8강 탈락 (5~8위): 경험치 +150</li>
                <li>• 4위: 경험치 +200, 다음 시즌 시드</li>
                <li>• 3위: 경험치 +250, 🥉 + 다음 시즌 시드</li>
                <li>• 2위: 경험치 +300, 🥈 + 다음 시즌 시드</li>
                <li>• <span className="text-yellow-400">1위: 경험치 +350, 🏆 챔피언 + 다음 시즌 시드</span></li>
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
                matchPlayed={card.matchPlayed}
                matchWon={card.matchWon}
                lastOpponentName={card.lastOpponentName}
              />
            ))}
          </div>
        </div>

        {/* 액션 버튼 */}
        {currentLeague.status !== 'FINISHED' && (
          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <Button
              variant="ghost"
              onClick={() => setShowBracket(true)}
            >
              📋 대진표 보기
            </Button>

            {currentLeague.status === 'ROUND_32' && currentLeague.brackets.round32Groups && (
              <Button
                variant="ghost"
                onClick={() => setShowGroups(true)}
              >
                📊 조별 현황
              </Button>
            )}

            {currentLeague.status === 'ROUND_16' && (
              <Button
                variant="ghost"
                onClick={() => setShowRound16Bracket(true)}
              >
                📊 16강 대진표
              </Button>
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
                  console.log('=== 버튼 클릭됨 ===');
                  const match = getNextPlayerMatch();
                  console.log('찾은 경기:', match);
                  console.log('onStartMatch 존재:', !!onStartMatch);

                  if (match?.playerCardId && match?.opponentId && match?.match && onStartMatch) {
                    console.log('전투 화면으로 이동 시도:', {
                      playerCardId: match.playerCardId,
                      opponentId: match.opponentId,
                      matchId: match.match.id,
                      format: match.match.format
                    });
                    onStartMatch(match.playerCardId, match.opponentId, match.match.id, match.match.format);
                    console.log('onStartMatch 호출 완료');
                  } else {
                    // Step 2: 시뮬레이션 기반 배틀로 대체
                    console.log('[Step 2] 시뮬레이션 기반 배틀 실행');
                    handleNextMatch();
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
                onClick={handleSkipAll}
              >
                ⏩ 모든 경기 스킵
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

        {/* 32강 조별 현황 모달 */}
        {showGroups && currentLeague.status === 'ROUND_32' && currentLeague.brackets.round32Groups && (
          <GroupStageView
            groups={currentLeague.brackets.round32Groups}
            participants={currentLeague.participants}
            matches={currentLeague.brackets.round32}
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

        {/* Step 2: 경기 결과 모달 (임시 - Step 3에서 애니메이션 UI로 대체) */}
        {showMatchResult && lastSimMatchResult && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-bg-secondary rounded-xl border border-white/20 p-6 max-w-md w-full"
            >
              <div className="text-center mb-4">
                <div className="text-2xl font-bold text-yellow-400 mb-2">
                  {lastSimMatchResult.isPlayerMatch
                    ? (lastSimMatchResult.winnerId === lastSimMatchResult.participant1.odId && lastSimMatchResult.participant1.isPlayerCrew) ||
                      (lastSimMatchResult.winnerId === lastSimMatchResult.participant2.odId && lastSimMatchResult.participant2.isPlayerCrew)
                      ? '🎉 승리!'
                      : '😢 패배'
                    : '⚔️ 경기 종료'}
                </div>
              </div>

              <div className="flex justify-between items-center mb-4">
                <div className={`text-center flex-1 ${lastSimMatchResult.winnerId === lastSimMatchResult.participant1.odId ? 'text-green-400' : 'text-text-secondary'}`}>
                  <div className="text-lg font-bold">{lastSimMatchResult.participant1.odName}</div>
                  <div className="text-sm">{lastSimMatchResult.participant1.crewName}</div>
                </div>
                <div className="text-2xl font-bold text-white mx-4">
                  {lastSimMatchResult.score[0]} : {lastSimMatchResult.score[1]}
                </div>
                <div className={`text-center flex-1 ${lastSimMatchResult.winnerId === lastSimMatchResult.participant2.odId ? 'text-green-400' : 'text-text-secondary'}`}>
                  <div className="text-lg font-bold">{lastSimMatchResult.participant2.odName}</div>
                  <div className="text-sm">{lastSimMatchResult.participant2.crewName}</div>
                </div>
              </div>

              {/* 세트별 결과 */}
              <div className="bg-bg-primary/50 rounded-lg p-3 mb-4">
                <div className="text-sm font-bold text-text-primary mb-2">세트별 결과</div>
                <div className="space-y-1">
                  {lastSimMatchResult.sets.map((set, idx) => {
                    // 플레이어 카드가 이긴 세트인지 확인
                    const isPlayerSetWin = (lastSimMatchResult.participant1.isPlayerCrew && set.winnerId === lastSimMatchResult.participant1.odId) ||
                                           (lastSimMatchResult.participant2.isPlayerCrew && set.winnerId === lastSimMatchResult.participant2.odId);
                    return (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-text-secondary">세트 {set.setNumber} ({set.arenaName})</span>
                        <span className={isPlayerSetWin ? 'text-green-400' : 'text-red-400'}>
                          {set.winnerName} 승 (HP: {set.winnerHpPercent}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Button
                variant="primary"
                onClick={() => setShowMatchResult(false)}
                className="w-full"
              >
                확인
              </Button>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

export default IndividualLeagueScreen;
