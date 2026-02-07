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
import { GroupStageMainView } from './GroupStageMainView';
import { TournamentMainView } from './TournamentMainView';
import { PlayerCardStatus } from './PlayerCardStatus';
import { Round16Bracket } from './Round16Bracket';
import { KnockoutBracket } from './KnockoutBracket';
import { LeagueFinishedScreen } from './LeagueFinishedScreen';
import { MatchPreviewModal } from './MatchPreviewModal';
import { BattleAnimationScreen } from './BattleAnimationScreen';
// BattleResultModal, AwardsDisplay, RewardClaimScreen imported but not yet used in current flow
// import { BattleResultModal } from './BattleResultModal';
// import { AwardsDisplay } from './AwardsDisplay';
// import { RewardClaimScreen } from './RewardClaimScreen';
// import { calculateFinalRankings, calculateAwards } from '../../utils/individualLeagueSystem';
import { getRandomArenas } from '../../data/arenaEffects';
import { getBestOfForRound } from '../../utils/individualBattleSimulator';
import type { IndividualMatch } from '../../types';

interface IndividualLeagueScreenProps {
  onStartMatch?: (playerCardId: string, opponentId: string, matchId: string, format: import('../../types').LeagueMatchFormat) => void;
  onBack?: () => void;
}

export function IndividualLeagueScreen({
  onStartMatch: _onStartMatch,
  onBack
}: IndividualLeagueScreenProps) {
  // _onStartMatch reserved for future integration with parent component
  const {
    currentLeague,
    currentSeason,
    hallOfFame,
    startNewLeague,
    advanceRound,
    getNextPlayerMatch: _getNextPlayerMatch,
    getPlayerCardStatuses,
    // Step 2: 시뮬레이션 기반 배틀
    simulateIndividualMatch,
    skipToNextPlayerMatch: _skipToNextPlayerMatch,
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
  const [showMatchPreview, setShowMatchPreview] = useState(false);
  const [showBattleAnimation, setShowBattleAnimation] = useState(false);
  // showBattleResult and showRewardClaim will be used in future flow integration
  const [pendingMatch, setPendingMatch] = useState<{
    match: IndividualMatch;
    roundName: string;
    formatText: string;
    matchContext?: string;
    matchImplication?: string;
    arenaIds?: string[];
  } | null>(null);

  // 리그 시작
  const handleStartLeague = () => {
    if (playerCrew.length >= 5) {
      startNewLeague(playerCrew, '내 크루');
    }
  };

  // 포맷 텍스트 가져오기
  const getFormatText = (status?: string) => {
    switch (status) {
      case 'ROUND_32': return '단판 승부';
      case 'ROUND_16': return '3판 2선승';
      case 'QUARTER': return '3판 2선승';
      case 'SEMI': return '5판 3선승';
      case 'FINAL': return '5판 3선승';
      default: return '단판';
    }
  };

  // Step 2: 다음 경기 진행 (시뮬레이션 기반)
  // Reserved for alternative match navigation flow - commented out temporarily
  // const handleNextMatch = () => {
  //   console.log('[handleNextMatch] 클릭');
  //   const nextPlayerMatch = skipToNextPlayerMatch();
  //   if (!nextPlayerMatch) {
  //     console.log('[handleNextMatch] 내 카드 경기 없음');
  //     return;
  //   }
  //   console.log('[handleNextMatch] 내 카드 경기 시작:', nextPlayerMatch.id);
  //   const roundName = getRoundName(currentLeague?.status || '');
  //   const formatText = getFormatText(currentLeague?.status);
  //   setPendingMatch({ match: nextPlayerMatch, roundName, formatText });
  //   setShowMatchPreview(true);
  // };

  // 경기 시작 (애니메이션 모드)
  const handleStartMatchWithAnimation = () => {
    if (!pendingMatch) return;

    setShowMatchPreview(false);

    // 시뮬레이션 실행 (사전 배정된 경기장 전달)
    const result = simulateIndividualMatch(pendingMatch.match.id, pendingMatch.arenaIds);

    if (result) {
      // 애니메이션 화면 표시
      setShowBattleAnimation(true);
    }
  };

  // 경기 스킵 (결과만)
  const handleSkipMatch = () => {
    if (!pendingMatch) return;

    setShowMatchPreview(false);

    // 시뮬레이션 실행 (사전 배정된 경기장 전달)
    simulateIndividualMatch(pendingMatch.match.id, pendingMatch.arenaIds);

    setPendingMatch(null);
  };

  // 애니메이션 완료
  const handleBattleAnimationComplete = () => {
    setShowBattleAnimation(false);
    setPendingMatch(null);
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

  // 32강 조별리그 경기 컨텍스트 가져오기
  const getMatchContext = (matchId: string, groupId?: string): { context: string; implication: string } => {
    if (!groupId) return { context: '', implication: '' };

    // 경기 ID에서 인덱스 추출 (r32_A_1 -> 1)
    const matchIndex = parseInt(matchId.split('_').pop() || '1', 10) - 1;

    const contextMap: Record<number, string> = {
      0: '1경기',
      1: '2경기',
      2: '승자전',
      3: '패자전',
      4: '최종전',
      5: '6경기'
    };

    const implicationMap: Record<number, string> = {
      0: '',
      1: '',
      2: '승자는 16강 진출 확정!',
      3: '패자는 탈락!',
      4: '승자는 16강 진출!',
      5: ''
    };

    return {
      context: contextMap[matchIndex] || '',
      implication: implicationMap[matchIndex] || ''
    };
  };

  // 32강 GroupStageMainView에서 경기 시작
  const handleGroupStageStartMatch = (matchId: string) => {
    const match = currentLeague?.brackets.round32.find(m => m.id === matchId);
    if (!match) return;

    const { context, implication } = getMatchContext(matchId, match.groupId);

    // 32강은 단판이므로 경기장 미리보기 불필요 (bestOf = 1)
    const bestOf = getBestOfForRound('ROUND_32');
    const arenaIds = bestOf > 1 ? getRandomArenas(bestOf) : [];

    setPendingMatch({
      match,
      roundName: `${match.groupId}조`,
      formatText: getFormatText('ROUND_32'),
      matchContext: context,
      matchImplication: implication,
      arenaIds
    });
    setShowMatchPreview(true);
  };

  // 16강~결승 TournamentMainView에서 경기 시작
  const handleTournamentStartMatch = (matchId: string) => {
    if (!currentLeague) return;

    let match: IndividualMatch | undefined;
    let roundName = '';
    let roundStatus: string = currentLeague.status;

    if (currentLeague.status === 'ROUND_16') {
      match = currentLeague.brackets.round16Matches?.find(m => m.id === matchId);
      roundName = '16강';
    } else if (currentLeague.status === 'QUARTER') {
      match = currentLeague.brackets.quarter.find(m => m.id === matchId);
      roundName = '8강';
    } else if (currentLeague.status === 'SEMI') {
      match = currentLeague.brackets.semi.find(m => m.id === matchId);
      roundName = '4강';
    } else if (currentLeague.status === 'FINAL') {
      if (currentLeague.brackets.final?.id === matchId) {
        match = currentLeague.brackets.final;
        roundName = '결승';
      } else if (currentLeague.brackets.thirdPlace?.id === matchId) {
        match = currentLeague.brackets.thirdPlace;
        roundName = '3/4위전';
        roundStatus = 'THIRD_PLACE';
      }
    }

    if (!match) return;

    // 다전제 경기장 사전 배정
    const bestOf = getBestOfForRound(roundStatus);
    const arenaIds = bestOf > 1 ? getRandomArenas(bestOf) : [];

    setPendingMatch({
      match,
      roundName,
      formatText: getFormatText(currentLeague.status),
      arenaIds
    });
    setShowMatchPreview(true);
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

        {/* 32강 조별리그: 새로운 GroupStageMainView 사용 */}
        {currentLeague.status === 'ROUND_32' && currentLeague.brackets.round32Groups && (
          <GroupStageMainView
            groups={currentLeague.brackets.round32Groups}
            matches={currentLeague.brackets.round32}
            playerCardIds={playerCrew}
            onStartMatch={handleGroupStageStartMatch}
            onSkipAll={handleSkipAll}
            onNextRound={handleAdvanceRound}
            isRoundComplete={roundComplete}
          />
        )}

        {/* 16강 이후: 카드형 UI 적용 */}
        {currentLeague.status !== 'FINISHED' && currentLeague.status !== 'ROUND_32' && (
          <>
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

            {/* 토너먼트 메인 뷰 (카드형 UI) */}
            <TournamentMainView
              stage={currentLeague.status as 'ROUND_16' | 'QUARTER' | 'SEMI' | 'FINAL'}
              matches={
                currentLeague.status === 'ROUND_16'
                  ? currentLeague.brackets.round16Matches || []
                  : currentLeague.status === 'QUARTER'
                  ? currentLeague.brackets.quarter
                  : currentLeague.status === 'SEMI'
                  ? currentLeague.brackets.semi
                  : currentLeague.status === 'FINAL'
                  ? [
                      ...(currentLeague.brackets.final ? [currentLeague.brackets.final] : []),
                      ...(currentLeague.brackets.thirdPlace ? [currentLeague.brackets.thirdPlace] : [])
                    ]
                  : []
              }
              participants={currentLeague.participants}
              playerCardIds={playerCrew}
              onStartMatch={handleTournamentStartMatch}
              onSkipAll={handleSkipAll}
              onNextRound={handleAdvanceRound}
              onViewBracket={() => {
                if (currentLeague.status === 'ROUND_16') {
                  setShowRound16Bracket(true);
                } else {
                  setShowKnockoutBracket(true);
                }
              }}
              isRoundComplete={roundComplete}
            />
          </>
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

        {/* 경기 예고 모달 */}
        {showMatchPreview && pendingMatch && currentLeague && (
          <MatchPreviewModal
            match={pendingMatch.match}
            participants={currentLeague.participants}
            roundName={pendingMatch.roundName}
            formatText={pendingMatch.formatText}
            matchContext={pendingMatch.matchContext}
            matchImplication={pendingMatch.matchImplication}
            arenaIds={pendingMatch.arenaIds}
            onStartMatch={handleStartMatchWithAnimation}
            onSkip={handleSkipMatch}
            onClose={() => {
              setShowMatchPreview(false);
              setPendingMatch(null);
            }}
          />
        )}

        {/* 전투 애니메이션 화면 */}
        {showBattleAnimation && lastSimMatchResult && (
          <BattleAnimationScreen
            matchResult={lastSimMatchResult}
            onComplete={handleBattleAnimationComplete}
          />
        )}
      </div>
    </div>
  );
}

export default IndividualLeagueScreen;
