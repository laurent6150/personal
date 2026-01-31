// ========================================
// 시즌 허브 - 메인 화면 (크루 선택 + 시즌 진행)
// MVP v3: 등급 제한 추가
// ========================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSeasonStore } from '../stores/seasonStore';
import { usePlayerStore } from '../stores/playerStore';
import { PLAYER_CREW_ID } from '../data/aiCrews';
import { ALL_CHARACTERS, CHARACTERS_BY_ID } from '../data/characters';
import { CardDisplay } from '../components/Card/CardDisplay';
import { Button } from '../components/UI/Button';
import type { LeagueStanding, Grade } from '../types';

// 등급별 최대 선택 가능 수
const GRADE_LIMITS: Record<Grade, number> = {
  'S': 1,
  'A': 2,
  'B': 5,
  'C': 5,
  'D': 5
};

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
    isInitialized,
    currentSeason,
    seasonHistory,
    initializeGame,
    startNewSeason,
    getNextMatch,
    getCurrentStandings,
    getPlayerRank,
    endSeason,
    resetGame,
    getAICrewById
  } = useSeasonStore();

  const { player } = usePlayerStore();
  const standings = getCurrentStandings();
  const nextMatch = getNextMatch();
  const playerRank = getPlayerRank();

  // 크루 선택 상태
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 현재 선택된 카드들의 등급별 개수
  const selectedGradeCounts = useMemo(() => {
    const counts: Record<Grade, number> = { 'S': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0 };
    for (const cardId of selectedCards) {
      const char = CHARACTERS_BY_ID[cardId];
      if (char) {
        counts[char.grade]++;
      }
    }
    return counts;
  }, [selectedCards]);

  // 특정 카드를 선택할 수 있는지 확인
  const canSelectCard = (cardId: string): { canSelect: boolean; reason?: string } => {
    if (selectedCards.includes(cardId)) {
      return { canSelect: true }; // 이미 선택된 카드는 해제 가능
    }
    if (selectedCards.length >= 5) {
      return { canSelect: false, reason: '5장 선택 완료' };
    }

    const char = CHARACTERS_BY_ID[cardId];
    if (!char) return { canSelect: false, reason: '카드를 찾을 수 없음' };

    const currentCount = selectedGradeCounts[char.grade];
    const limit = GRADE_LIMITS[char.grade];

    if (currentCount >= limit) {
      return {
        canSelect: false,
        reason: `${char.grade}등급은 최대 ${limit}장까지 선택 가능`
      };
    }

    return { canSelect: true };
  };

  // 카드 선택 토글
  const toggleCardSelection = (cardId: string) => {
    if (selectedCards.includes(cardId)) {
      setSelectedCards(prev => prev.filter(id => id !== cardId));
    } else {
      const { canSelect } = canSelectCard(cardId);
      if (canSelect) {
        setSelectedCards(prev => [...prev, cardId]);
      }
    }
  };

  // 게임 시작 (크루 선택 완료)
  const handleStartGame = () => {
    if (selectedCards.length !== 5) return;
    initializeGame(selectedCards);
    startNewSeason();
  };

  // 새로 시작 확인
  const handleResetGame = () => {
    resetGame();
    setSelectedCards([]);
    setShowResetConfirm(false);
  };

  // ================================
  // 1. 첫 게임 - 크루 선택 화면
  // ================================
  if (!isInitialized) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-accent mb-2">영역전개</h1>
          <p className="text-text-secondary">주술회전 카드 배틀 리그</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full max-w-5xl"
        >
          <div className="bg-bg-card rounded-xl p-6 border border-white/10 mb-6">
            <h2 className="text-xl font-bold text-text-primary mb-2">크루 선택</h2>
            <p className="text-text-secondary mb-2">
              시즌에서 사용할 5장의 카드를 선택하세요. ({selectedCards.length}/5)
            </p>

            {/* 등급 제한 안내 */}
            <div className="flex flex-wrap gap-2 mb-4 text-xs">
              <span className="px-2 py-1 rounded bg-grade-s/20 text-grade-s border border-grade-s/30">
                S등급: {selectedGradeCounts['S']}/{GRADE_LIMITS['S']}
              </span>
              <span className="px-2 py-1 rounded bg-grade-a/20 text-grade-a border border-grade-a/30">
                A등급: {selectedGradeCounts['A']}/{GRADE_LIMITS['A']}
              </span>
              <span className="px-2 py-1 rounded bg-white/10 text-text-secondary border border-white/20">
                B/C/D등급: 제한 없음
              </span>
            </div>

            {/* 선택된 카드 미리보기 */}
            <div className="flex gap-2 mb-6 min-h-[100px] p-4 bg-black/20 rounded-lg overflow-x-auto">
              {selectedCards.map((cardId) => {
                const char = CHARACTERS_BY_ID[cardId];
                return char ? (
                  <motion.div
                    key={cardId}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="cursor-pointer flex-shrink-0"
                    onClick={() => toggleCardSelection(cardId)}
                  >
                    <CardDisplay character={char} size="sm" isSelected />
                  </motion.div>
                ) : null;
              })}
              {Array.from({ length: 5 - selectedCards.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-20 h-28 rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-text-secondary text-xs">?</span>
                </div>
              ))}
            </div>

            {/* 전체 카드 목록 */}
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 max-h-[400px] overflow-y-auto p-2">
              {ALL_CHARACTERS.map(char => {
                const isSelected = selectedCards.includes(char.id);
                const { canSelect, reason } = canSelectCard(char.id);
                const isDisabled = !canSelect && !isSelected;

                return (
                  <motion.div
                    key={char.id}
                    whileHover={!isDisabled ? { scale: 1.05 } : undefined}
                    whileTap={!isDisabled ? { scale: 0.95 } : undefined}
                    className={`relative cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-accent' : ''
                    } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    onClick={() => !isDisabled && toggleCardSelection(char.id)}
                    title={reason}
                  >
                    <CardDisplay
                      character={char}
                      size="sm"
                      isSelected={isSelected}
                      showStats={false}
                      showSkill={false}
                    />
                    {isDisabled && reason && (
                      <div className="absolute inset-0 flex items-end justify-center pb-2">
                        <span className="text-[10px] bg-black/80 px-1 rounded text-red-400">
                          {char.grade}등급 제한
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button
              onClick={handleStartGame}
              disabled={selectedCards.length !== 5}
              variant="primary"
              size="lg"
            >
              시즌 1 시작! ({selectedCards.length}/5)
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ================================
  // 2. 시즌이 없으면 새 시즌 시작
  // ================================
  if (!currentSeason) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-accent mb-3">영역전개</h1>
          <p className="text-lg text-text-secondary">시즌 {seasonHistory.length + 1} 준비</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-card rounded-xl p-8 max-w-md w-full text-center border border-white/10"
        >
          <div className="text-6xl mb-4">🏆</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">
            시즌 {seasonHistory.length + 1}
          </h2>
          <p className="text-text-secondary mb-6">
            AI 크루가 새롭게 구성됩니다!<br />
            5팀과 대결하여 우승을 차지하세요.
          </p>

          {seasonHistory.length > 0 && (
            <div className="bg-black/30 rounded-lg p-4 mb-4 text-left">
              <h3 className="text-sm text-text-secondary mb-2">지난 시즌 기록</h3>
              <div className="text-sm space-y-1">
                {seasonHistory.slice(-3).map(h => (
                  <div key={h.seasonNumber} className="flex justify-between">
                    <span>시즌 {h.seasonNumber}</span>
                    <span className={h.playerRank === 1 ? 'text-win' : 'text-text-secondary'}>
                      {h.playerRank}위 ({h.playerPoints}점)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button onClick={startNewSeason} variant="primary" size="lg" className="w-full mb-3">
            시즌 시작하기
          </Button>

          <Button
            onClick={() => setShowResetConfirm(true)}
            variant="ghost"
            className="w-full text-sm"
          >
            처음부터 새로 시작
          </Button>
        </motion.div>

        {/* 리셋 확인 모달 */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-bg-card rounded-xl p-6 max-w-sm w-full border border-white/10"
              >
                <h3 className="text-xl font-bold text-text-primary mb-2">새로 시작하시겠습니까?</h3>
                <p className="text-text-secondary mb-6 text-sm">
                  모든 시즌 기록이 삭제되고 크루를 다시 선택합니다.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowResetConfirm(false)}
                    variant="ghost"
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleResetGame}
                    variant="primary"
                    className="flex-1 bg-red-600 hover:bg-red-500"
                  >
                    새로 시작
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ================================
  // 3. 시즌 완료 화면
  // ================================
  if (currentSeason.status === 'COMPLETED') {
    const champion = currentSeason.champion;
    const isPlayerChampion = champion === PLAYER_CREW_ID;
    const championCrew = getAICrewById(champion!);
    const championName = isPlayerChampion ? player.name : championCrew?.name || '???';

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

          <Button onClick={startNewSeason} variant="primary" size="lg" className="w-full mb-3">
            다음 시즌 시작
          </Button>

          <Button
            onClick={() => setShowResetConfirm(true)}
            variant="ghost"
            className="w-full text-sm"
          >
            처음부터 새로 시작
          </Button>
        </motion.div>

        {/* 리셋 확인 모달 */}
        <AnimatePresence>
          {showResetConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="bg-bg-card rounded-xl p-6 max-w-sm w-full border border-white/10"
              >
                <h3 className="text-xl font-bold text-text-primary mb-2">새로 시작하시겠습니까?</h3>
                <p className="text-text-secondary mb-6 text-sm">
                  모든 시즌 기록이 삭제되고 크루를 다시 선택합니다.
                </p>
                <div className="flex gap-3">
                  <Button
                    onClick={() => setShowResetConfirm(false)}
                    variant="ghost"
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleResetGame}
                    variant="primary"
                    className="flex-1 bg-red-600 hover:bg-red-500"
                  >
                    새로 시작
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ================================
  // 4. 시즌 진행 중 화면
  // ================================
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
              {currentSeason.matches.filter(m => m.played && m.homeCrewId === PLAYER_CREW_ID).length} / 5 경기 완료
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

          {nextMatch ? (() => {
            const opponent = getAICrewById(nextMatch.awayCrewId);
            return (
              <div>
                <div className="bg-black/30 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-text-secondary mb-2">VS</div>
                    <div className="text-2xl font-bold text-text-primary">
                      {opponent?.name || '???'}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                      {opponent?.description}
                    </div>
                    <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                      opponent?.difficulty === 'HARD'
                        ? 'bg-red-500/20 text-red-400'
                        : opponent?.difficulty === 'NORMAL'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-green-500/20 text-green-400'
                    }`}>
                      {opponent?.difficulty === 'HARD' ? '어려움'
                        : opponent?.difficulty === 'NORMAL' ? '보통' : '쉬움'}
                    </div>

                    {/* 상대 크루 카드 미리보기 */}
                    {opponent?.crew && opponent.crew.length > 0 && (
                      <div className="mt-4">
                        <div className="text-xs text-text-secondary mb-2">상대 크루</div>
                        <div className="flex justify-center gap-1 flex-wrap">
                          {opponent.crew.map(cardId => {
                            const char = CHARACTERS_BY_ID[cardId];
                            return char ? (
                              <div key={cardId} className="text-xs bg-black/30 px-2 py-1 rounded">
                                {char.name.ko}
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
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
            );
          })() : (
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
                crewName={
                  standing.crewId === PLAYER_CREW_ID
                    ? player.name
                    : getAICrewById(standing.crewId)?.name || '???'
                }
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
  crewName: string;
}

function StandingRow({ standing, rank, isPlayer, crewName }: StandingRowProps) {
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
