// ========================================
// 경기 배틀 화면 컴포넌트
// ========================================

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SimMatchResult } from '../../types/individualLeague';
import { BattleAnimation } from './BattleAnimation';
import './MatchBattle.css';

interface MatchBattleProps {
  matchResult: SimMatchResult;
  onComplete: () => void;
}

type PlayState = 'READY' | 'PLAYING' | 'SET_END' | 'MATCH_END';

export function MatchBattle({ matchResult, onComplete }: MatchBattleProps) {
  const [playState, setPlayState] = useState<PlayState>('READY');
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showResult, setShowResult] = useState(false);

  const {
    participant1,
    participant2,
    sets,
    winnerId,
    bestOf
  } = matchResult;

  const currentSet = sets[currentSetIndex] || null;
  const requiredWins = Math.ceil(bestOf / 2);

  // 내 카드가 이겼는지 확인
  const isPlayerWin = (
    (participant1.isPlayerCrew && winnerId === participant1.odId) ||
    (participant2.isPlayerCrew && winnerId === participant2.odId)
  );

  // 라운드 이름 변환
  const getRoundName = (round: string) => {
    const names: Record<string, string> = {
      'ROUND_32': '32강 조별리그',
      'ROUND_16': '16강',
      'QUARTER': '8강',
      'SEMI': '4강',
      'FINAL': '결승'
    };
    return names[round] || round;
  };

  // 세트 시작
  const handleStartSet = useCallback(() => {
    setPlayState('PLAYING');
  }, []);

  // 세트 완료
  const handleSetComplete = useCallback(() => {
    const set = sets[currentSetIndex];
    if (!set) return;

    // 스코어 업데이트
    const isP1Win = set.winnerId === participant1.odId;
    const newScore: [number, number] = [
      score[0] + (isP1Win ? 1 : 0),
      score[1] + (isP1Win ? 0 : 1)
    ];
    setScore(newScore);

    // 다음 세트 또는 경기 종료
    if (currentSetIndex + 1 >= sets.length) {
      // 경기 종료
      setPlayState('MATCH_END');
      setTimeout(() => {
        setShowResult(true);
      }, 500);
    } else {
      setPlayState('SET_END');
    }
  }, [currentSetIndex, sets, participant1.odId, score]);

  // 다음 세트로
  const handleNextSet = useCallback(() => {
    setCurrentSetIndex(prev => prev + 1);
    setPlayState('READY');
  }, []);

  // 자동 재생
  useEffect(() => {
    if (!isAutoPlay) return;

    if (playState === 'READY') {
      const timer = setTimeout(handleStartSet, 500);
      return () => clearTimeout(timer);
    }

    if (playState === 'SET_END') {
      const timer = setTimeout(handleNextSet, 1000);
      return () => clearTimeout(timer);
    }
  }, [isAutoPlay, playState, handleStartSet, handleNextSet]);

  // 전체 스킵
  const handleSkipAll = useCallback(() => {
    // 마지막 스코어로 점프
    setScore(matchResult.score);
    setCurrentSetIndex(sets.length - 1);
    setPlayState('MATCH_END');
    setShowResult(true);
  }, [matchResult.score, sets.length]);

  // 결과 확인 후 닫기
  const handleConfirm = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // 세트 결과 표시 (승/패)
  const getSetResult = (setIndex: number): 'win' | 'lose' | 'pending' | 'current' => {
    if (setIndex > currentSetIndex) return 'pending';
    if (setIndex === currentSetIndex && playState !== 'MATCH_END') return 'current';

    const set = sets[setIndex];
    if (!set) return 'pending';

    const isP1Win = set.winnerId === participant1.odId;
    if (participant1.isPlayerCrew) {
      return isP1Win ? 'win' : 'lose';
    }
    if (participant2.isPlayerCrew) {
      return isP1Win ? 'lose' : 'win';
    }
    // 둘 다 내 카드가 아니면 P1 기준
    return isP1Win ? 'win' : 'lose';
  };

  return (
    <div className="match-battle-screen">
      <div className="match-battle-container">
        {/* 헤더 */}
        <div className="match-battle-header">
          <div className="match-battle-title">개인 리그 대전</div>
          <div className="match-battle-round">{getRoundName(matchResult.round)}</div>
        </div>

        {/* 스코어보드 */}
        <div className="match-scoreboard">
          <div className="scoreboard-title">
            {bestOf === 1 ? '단판 승부' : `${requiredWins}선승제 (Best of ${bestOf})`}
          </div>
          <div className="scoreboard-content">
            <div className={`scoreboard-player ${
              playState === 'MATCH_END'
                ? (winnerId === participant1.odId ? 'winner' : 'loser')
                : ''
            }`}>
              <div className="scoreboard-player-name">
                {participant1.isPlayerCrew && '⭐ '}
                {participant1.odName}
              </div>
              <div className="scoreboard-player-crew">{participant1.crewName}</div>
            </div>

            <div className="scoreboard-score">
              <span className={`score-value ${score[0] > score[1] ? 'win' : score[0] < score[1] ? 'lose' : ''}`}>
                {score[0]}
              </span>
              <span className="score-separator">:</span>
              <span className={`score-value ${score[1] > score[0] ? 'win' : score[1] < score[0] ? 'lose' : ''}`}>
                {score[1]}
              </span>
            </div>

            <div className={`scoreboard-player ${
              playState === 'MATCH_END'
                ? (winnerId === participant2.odId ? 'winner' : 'loser')
                : ''
            }`}>
              <div className="scoreboard-player-name">
                {participant2.isPlayerCrew && '⭐ '}
                {participant2.odName}
              </div>
              <div className="scoreboard-player-crew">{participant2.crewName}</div>
            </div>
          </div>
        </div>

        {/* 경기장 정보 */}
        {currentSet && (
          <div className="arena-info">
            <div className="arena-name">{currentSet.arenaName}</div>
            {currentSet.arenaEffect && (
              <>
                <div className="arena-description">{currentSet.arenaEffect.description}</div>
                <div className="arena-effect">
                  <span className="arena-bonus">
                    {currentSet.arenaEffect.bonusAttribute} +{currentSet.arenaEffect.bonusPercent}%
                  </span>
                  <span className="arena-penalty">
                    {currentSet.arenaEffect.penaltyAttribute} -{currentSet.arenaEffect.penaltyPercent}%
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* 세트 진행 표시 */}
        {bestOf > 1 && (
          <div className="set-progress">
            <div className="set-progress-title">세트 진행</div>
            <div className="set-indicators">
              {Array.from({ length: bestOf }).map((_, idx) => {
                const result = getSetResult(idx);
                return (
                  <div
                    key={idx}
                    className={`set-indicator ${result}`}
                  >
                    <span>{idx + 1}</span>
                    {result === 'win' && <span>W</span>}
                    {result === 'lose' && <span>L</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 배틀 애니메이션 */}
        <BattleAnimation
          participant1={participant1}
          participant2={participant2}
          currentSet={currentSet}
          isPlaying={playState === 'PLAYING'}
          onSetComplete={handleSetComplete}
          playbackSpeed={playbackSpeed}
        />

        {/* 컨트롤 버튼 */}
        <div className="match-battle-actions">
          {playState === 'READY' && (
            <>
              <button
                className="battle-btn primary"
                onClick={handleStartSet}
              >
                {currentSetIndex === 0 ? '경기 시작' : `세트 ${currentSetIndex + 1} 시작`}
              </button>
              <button
                className="battle-btn secondary"
                onClick={() => setIsAutoPlay(!isAutoPlay)}
              >
                {isAutoPlay ? '자동 OFF' : '자동 ON'}
              </button>
              <button
                className="battle-btn secondary"
                onClick={handleSkipAll}
              >
                결과 보기
              </button>
            </>
          )}

          {playState === 'PLAYING' && (
            <>
              <div className="speed-control">
                <span>속도:</span>
                {[1, 2, 4].map(speed => (
                  <button
                    key={speed}
                    className={`speed-btn ${playbackSpeed === speed ? 'active' : ''}`}
                    onClick={() => setPlaybackSpeed(speed)}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
              <button
                className="battle-btn secondary"
                onClick={handleSkipAll}
              >
                스킵
              </button>
            </>
          )}

          {playState === 'SET_END' && (
            <>
              <button
                className="battle-btn primary"
                onClick={handleNextSet}
              >
                다음 세트
              </button>
              <button
                className="battle-btn secondary"
                onClick={handleSkipAll}
              >
                결과 보기
              </button>
            </>
          )}

          {playState === 'MATCH_END' && !showResult && (
            <button
              className="battle-btn success"
              onClick={() => setShowResult(true)}
            >
              결과 확인
            </button>
          )}
        </div>

        {/* 세트 결과 목록 */}
        {(playState === 'SET_END' || playState === 'MATCH_END') && currentSetIndex > 0 && (
          <div className="set-results-list">
            <div className="set-results-title">세트별 결과</div>
            {sets.slice(0, currentSetIndex + (playState === 'MATCH_END' ? 1 : 0)).map((set, idx) => {
              const isP1Win = set.winnerId === participant1.odId;
              const isPlayerSetWin = (participant1.isPlayerCrew && isP1Win) ||
                                     (participant2.isPlayerCrew && !isP1Win);
              return (
                <div key={idx} className="set-result-item">
                  <span className="set-result-label">세트 {idx + 1}</span>
                  <span className="set-result-arena">{set.arenaName}</span>
                  <span className={`set-result-winner ${
                    participant1.isPlayerCrew || participant2.isPlayerCrew
                      ? (isPlayerSetWin ? 'player-win' : 'player-lose')
                      : ''
                  }`}>
                    {set.winnerName} (HP {set.winnerHpPercent}%)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 최종 결과 모달 */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="match-result-overlay"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="match-result-content"
            >
              <div className={`match-result-title ${
                matchResult.isPlayerMatch
                  ? (isPlayerWin ? 'win' : 'lose')
                  : ''
              }`}>
                {matchResult.isPlayerMatch
                  ? (isPlayerWin ? '승리!' : '패배')
                  : '경기 종료'}
              </div>

              <div className="match-result-score">
                {matchResult.score[0]} : {matchResult.score[1]}
              </div>

              <div className="match-result-details">
                <div className="match-result-row">
                  <span className="label">승자</span>
                  <span>{winnerId === participant1.odId ? participant1.odName : participant2.odName}</span>
                </div>
                <div className="match-result-row">
                  <span className="label">라운드</span>
                  <span>{getRoundName(matchResult.round)}</span>
                </div>
                <div className="match-result-row">
                  <span className="label">형식</span>
                  <span>{bestOf === 1 ? '단판' : `${requiredWins}선승`}</span>
                </div>
              </div>

              {/* 세트별 결과 */}
              <div className="set-results-list">
                <div className="set-results-title">세트별 결과</div>
                {sets.map((set, idx) => {
                  const isP1Win = set.winnerId === participant1.odId;
                  const isPlayerSetWin = (participant1.isPlayerCrew && isP1Win) ||
                                         (participant2.isPlayerCrew && !isP1Win);
                  return (
                    <div key={idx} className="set-result-item">
                      <span className="set-result-label">세트 {idx + 1}</span>
                      <span className="set-result-arena">{set.arenaName}</span>
                      <span className={`set-result-winner ${
                        matchResult.isPlayerMatch
                          ? (isPlayerSetWin ? 'player-win' : 'player-lose')
                          : ''
                      }`}>
                        {set.winnerName} (HP {set.winnerHpPercent}%)
                      </span>
                    </div>
                  );
                })}
              </div>

              <button
                className="battle-btn success"
                onClick={handleConfirm}
                style={{ width: '100%', marginTop: '1rem' }}
              >
                확인
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MatchBattle;
