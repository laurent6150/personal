// ========================================
// 시즌 허브 - 메인 화면 (크루 선택 + 시즌 진행)
// Phase 5.3: 등급 제한 제거 → CP 샐러리캡 기반
// ========================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { useSeasonStore } from '../stores/seasonStore';
import { usePlayerStore } from '../stores/playerStore';
import { PLAYER_CREW_ID } from '../data/aiCrews';
import { ALL_CHARACTERS, CHARACTERS_BY_ID } from '../data/characters';
import { CardDisplay } from '../components/Card/CardDisplay';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { NewsFeed } from '../components/NewsFeed';
import { ActivityPanel, APIndicator } from '../components/Phase5/ActivityPanel';
import { SalaryCapMini } from '../components/Phase5/SalaryCapDisplay';
import { CPMini } from '../components/Phase5/CPDisplay';
import { CoachingPanel } from '../components/Phase5/CoachingPanel';
import { CREW_SIZE, ATTRIBUTES, SALARY_CAP } from '../data/constants';
import { BASE_SALARY } from '../utils/salarySystem';
import { getCharacterImage } from '../utils/imageHelper';
import type { LeagueStanding, CharacterCard, LegacyGrade, PlayerCard } from '../types';

interface SeasonHubProps {
  onStartMatch: (opponentCrewId: string) => void;
  onCrewManagement: () => void;
  onCollection: () => void;
  onCatalog: () => void;
  onItems?: () => void;
  onRanking: () => void;
  onTrade: () => void;
  onProfile?: () => void;
  onSettings: () => void;
  onIndividualLeague?: () => void;
  onCardSelect?: (cardId: string) => void;
  onDraft?: () => void;
}

export function SeasonHub({
  onStartMatch,
  onCrewManagement,
  onCollection,
  onCatalog,
  onItems,
  onRanking,
  onTrade,
  onProfile,
  onSettings,
  onIndividualLeague,
  onCardSelect,
  onDraft
}: SeasonHubProps) {
  const {
    isInitialized,
    playerCrew,
    currentSeason,
    seasonHistory,
    initializeGame,
    startNewSeason,
    getNextMatch,
    getCurrentStandings,
    getPlayerRank,
    endRegularSeason,
    startPlayoff,
    getPlayoffOpponent,
    resetGame,
    getAICrewById,
    getHeadToHead,
    // Phase 4: 시즌 동기화
    teamLeagueCompleted,
    individualLeagueCompleted,
    isSeasonComplete,
    finalizeSeason
  } = useSeasonStore(useShallow(state => ({
    isInitialized: state.isInitialized,
    playerCrew: state.playerCrew,
    currentSeason: state.currentSeason,
    seasonHistory: state.seasonHistory,
    initializeGame: state.initializeGame,
    startNewSeason: state.startNewSeason,
    getNextMatch: state.getNextMatch,
    getCurrentStandings: state.getCurrentStandings,
    getPlayerRank: state.getPlayerRank,
    endRegularSeason: state.endRegularSeason,
    startPlayoff: state.startPlayoff,
    getPlayoffOpponent: state.getPlayoffOpponent,
    resetGame: state.resetGame,
    getAICrewById: state.getAICrewById,
    getHeadToHead: state.getHeadToHead,
    // Phase 4: 시즌 동기화
    teamLeagueCompleted: state.teamLeagueCompleted,
    individualLeagueCompleted: state.individualLeagueCompleted,
    isSeasonComplete: state.isSeasonComplete,
    finalizeSeason: state.finalizeSeason
  })));

  const { player, getTotalCrewSalary, getPlayerCard } = usePlayerStore(useShallow(state => ({
    player: state.player,
    getTotalCrewSalary: state.getTotalCrewSalary,
    getPlayerCard: state.getPlayerCard
  })));
  // Phase 5: Activity Store (APIndicator에서 직접 사용)
  const standings = getCurrentStandings();
  const nextMatch = getNextMatch();
  const playerRank = getPlayerRank();
  const playoffOpponent = getPlayoffOpponent();

  // 플레이어 크루 카드 정보 (ActivityPanel용)
  const playerCrewCards: PlayerCard[] = useMemo(() => {
    return playerCrew
      .map(cardId => getPlayerCard(cardId))
      .filter((card): card is PlayerCard => card !== undefined);
  }, [playerCrew, getPlayerCard]);

  // 크루 선택 상태
  const [selectedCards, setSelectedCards] = useState<string[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // 크루 상세 모달 상태
  const [viewingCrew, setViewingCrew] = useState<{ name: string; cards: CharacterCard[] } | null>(null);

  // 현재 선택된 카드들의 등급별 개수
  const selectedGradeCounts = useMemo(() => {
    const counts: Record<LegacyGrade, number> = { '특급': 0, '1급': 0, '준1급': 0, '2급': 0, '준2급': 0, '3급': 0 };
    for (const cardId of selectedCards) {
      const char = CHARACTERS_BY_ID[cardId];
      if (char) {
        counts[char.grade as LegacyGrade]++;
      }
    }
    return counts;
  }, [selectedCards]);

  // 선택된 카드들의 총 연봉 계산
  const selectedTotalSalary = useMemo(() => {
    return selectedCards.reduce((sum, cardId) => {
      const char = CHARACTERS_BY_ID[cardId];
      if (!char) return sum;
      // 초기 선택이므로 레벨 1 기준 기본 연봉
      return sum + (BASE_SALARY[char.grade as LegacyGrade] || 0);
    }, 0);
  }, [selectedCards]);

  // 특정 카드를 선택할 수 있는지 확인 (Phase 5.3: 샐러리캡 기반)
  const canSelectCard = (cardId: string): { canSelect: boolean; reason?: string } => {
    if (selectedCards.includes(cardId)) {
      return { canSelect: true }; // 이미 선택된 카드는 해제 가능
    }
    if (selectedCards.length >= CREW_SIZE) {
      return { canSelect: false, reason: `${CREW_SIZE}장 선택 완료` };
    }

    const char = CHARACTERS_BY_ID[cardId];
    if (!char) return { canSelect: false, reason: '카드를 찾을 수 없음' };

    // Phase 5.3: 샐러리캡 검증
    const cardSalary = BASE_SALARY[char.grade as LegacyGrade] || 0;
    if (selectedTotalSalary + cardSalary > SALARY_CAP) {
      return {
        canSelect: false,
        reason: `샐러리캡 초과 (${(selectedTotalSalary + cardSalary).toLocaleString()} > ${SALARY_CAP.toLocaleString()} CP)`
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
    if (selectedCards.length !== CREW_SIZE) return;

    // 선택한 카드들 중 아직 소유하지 않은 카드를 ownedCards에 추가
    const playerStore = usePlayerStore.getState();
    for (const cardId of selectedCards) {
      if (!playerStore.isCardOwned(cardId)) {
        playerStore.addOwnedCard(cardId);
      }
    }

    // playerStore 크루도 동기화
    playerStore.setCurrentCrew(selectedCards);
    initializeGame(selectedCards);
    startNewSeason();
  };

  // 크루 클릭 - 크루 카드 모달 표시
  const handleCrewClick = (crewId: string) => {
    if (crewId === PLAYER_CREW_ID) {
      // 플레이어 크루
      const cards = playerCrew
        .map(id => CHARACTERS_BY_ID[id])
        .filter(Boolean) as CharacterCard[];
      setViewingCrew({ name: player.name, cards });
    } else {
      // AI 크루
      const aiCrew = getAICrewById(crewId);
      if (aiCrew) {
        const cards = aiCrew.crew
          .map(id => CHARACTERS_BY_ID[id])
          .filter(Boolean) as CharacterCard[];
        setViewingCrew({ name: aiCrew.name, cards });
      }
    }
  };

  // 새로 시작 확인
  const handleResetGame = () => {
    resetGame();
    setSelectedCards([]);
    setShowResetConfirm(false);
  };

  // 배경 이미지 스타일
  const bgStyle = {
    backgroundImage: 'url(/images/backgrounds/home_bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  // ================================
  // 1. 첫 게임 - 크루 선택 화면
  // ================================
  if (!isInitialized) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center p-4 md:p-8" style={bgStyle}>
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
              시즌에서 사용할 {CREW_SIZE}장의 카드를 선택하세요. ({selectedCards.length}/{CREW_SIZE})
            </p>

            {/* Phase 5.3: 샐러리캡 안내 */}
            <div className="flex flex-wrap gap-2 mb-4 text-xs">
              <span className={`px-2 py-1 rounded border ${
                selectedTotalSalary > SALARY_CAP
                  ? 'bg-lose/20 text-lose border-lose/30'
                  : 'bg-accent/20 text-accent border-accent/30'
              }`}>
                총 연봉: {selectedTotalSalary.toLocaleString()} / {SALARY_CAP.toLocaleString()} CP
              </span>
              <span className="px-2 py-1 rounded bg-white/10 text-text-secondary border border-white/20">
                등급별: 특급 {selectedGradeCounts['특급'] || 0}명, 1급 {selectedGradeCounts['1급'] || 0}명
              </span>
            </div>

            {/* 선택된 카드 미리보기 */}
            <div className="flex gap-2 mb-6 p-3 bg-black/20 rounded-lg overflow-x-auto">
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
                    <CardDisplay character={char} size="xs" isSelected statsDisplayMode="gradeTotal" showSkill={false} />
                  </motion.div>
                ) : null;
              })}
              {Array.from({ length: CREW_SIZE - selectedCards.length }).map((_, i) => (
                <div
                  key={`empty-${i}`}
                  className="w-28 h-auto min-h-[140px] rounded-lg border-2 border-dashed border-white/20 flex items-center justify-center flex-shrink-0"
                >
                  <span className="text-text-secondary text-xs">?</span>
                </div>
              ))}
            </div>

            {/* 전체 카드 목록 */}
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2 max-h-[500px] overflow-y-auto p-2">
              {ALL_CHARACTERS.map(char => {
                const isSelected = selectedCards.includes(char.id);
                const { canSelect, reason } = canSelectCard(char.id);
                const isDisabled = !canSelect && !isSelected;

                return (
                  <motion.div
                    key={char.id}
                    whileHover={!isDisabled ? { scale: 1.02 } : undefined}
                    whileTap={!isDisabled ? { scale: 0.98 } : undefined}
                    className={`relative cursor-pointer transition-all ${
                      isSelected ? 'ring-2 ring-accent ring-offset-1 ring-offset-bg-primary' : ''
                    } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    onClick={() => !isDisabled && toggleCardSelection(char.id)}
                    title={reason}
                  >
                    <CardDisplay
                      character={char}
                      size="xs"
                      isSelected={isSelected}
                      statsDisplayMode="gradeTotal"
                      showSkill={false}
                    />
                    {isDisabled && reason && (
                      <div className="absolute inset-0 flex items-end justify-center pb-1 bg-black/30">
                        <span className="text-[9px] bg-black/80 px-1 rounded text-red-400">
                          {reason.includes('샐러리캡') ? '연봉초과' : reason}
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
              disabled={selectedCards.length !== CREW_SIZE}
              variant="primary"
              size="lg"
            >
              시즌 1 시작! ({selectedCards.length}/{CREW_SIZE})
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4" style={bgStyle}>
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
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4" style={bgStyle}>
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

          {/* Phase 4: 시즌 완료 상태에 따른 분기 */}
          {isSeasonComplete() ? (
            <>
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                <div className="text-sm text-green-400 mb-1">✅ 양쪽 리그 모두 완료!</div>
                <div className="text-xs text-text-secondary">
                  시즌을 종료하고 경험치를 수령하세요.
                </div>
              </div>
              <Button
                onClick={() => {
                  finalizeSeason();
                  if (onDraft) {
                    onDraft();
                  } else {
                    startNewSeason();
                  }
                }}
                variant="primary"
                size="lg"
                className="w-full mb-3"
              >
                🎯 시즌 종료 & 드래프트
              </Button>
            </>
          ) : teamLeagueCompleted && !individualLeagueCompleted ? (
            <>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
                <div className="text-sm text-yellow-400 mb-1">⏳ 개인 리그 미완료</div>
                <div className="text-xs text-text-secondary">
                  개인 리그를 완료하면 시즌을 종료할 수 있습니다.
                </div>
              </div>
              {onIndividualLeague && (
                <Button onClick={onIndividualLeague} variant="primary" size="lg" className="w-full mb-3">
                  🏆 개인 리그로 이동
                </Button>
              )}
            </>
          ) : (
            <Button onClick={startNewSeason} variant="primary" size="lg" className="w-full mb-3">
              다음 시즌 시작
            </Button>
          )}

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
  // 4. 플레이오프 진행 중 화면
  // ================================
  if (currentSeason.status === 'PLAYOFF_SEMI' || currentSeason.status === 'PLAYOFF_FINAL') {
    const isSeimiFinal = currentSeason.status === 'PLAYOFF_SEMI';
    const stageTitle = isSeimiFinal ? '준결승' : '결승';
    const playoffMatch = isSeimiFinal
      ? currentSeason.playoff?.semiFinals.find(sf =>
          (sf.homeCrewId === PLAYER_CREW_ID || sf.awayCrewId === PLAYER_CREW_ID) && !sf.result
        )
      : currentSeason.playoff?.final;

    const isPlayerHome = playoffMatch?.homeCrewId === PLAYER_CREW_ID;
    const playerWins = isPlayerHome ? playoffMatch?.homeWins || 0 : playoffMatch?.awayWins || 0;
    const opponentWins = isPlayerHome ? playoffMatch?.awayWins || 0 : playoffMatch?.homeWins || 0;

    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center p-4" style={bgStyle}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="text-sm text-accent mb-2">시즌 {currentSeason.number} 플레이오프</div>
          <h1 className="text-4xl md:text-5xl font-bold text-accent mb-2">{stageTitle}</h1>
          <p className="text-text-secondary">5전 3선승제</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-bg-card rounded-xl p-8 max-w-lg w-full border border-white/10"
        >
          {playoffOpponent ? (
            <>
              {/* 점수 표시 */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="text-center">
                  <div className="text-sm text-text-secondary mb-1">{player.name}</div>
                  <div className="text-5xl font-bold text-win">{playerWins}</div>
                </div>
                <div className="text-2xl text-text-secondary">:</div>
                <div className="text-center">
                  <div className="text-sm text-text-secondary mb-1">{playoffOpponent.name}</div>
                  <div className="text-5xl font-bold text-lose">{opponentWins}</div>
                </div>
              </div>

              {/* 통산 전적 */}
              <HeadToHeadDisplay opponentId={playoffOpponent.id} getHeadToHead={getHeadToHead} />

              {/* 상대 크루 */}
              <div className="bg-black/30 rounded-lg p-4 mb-6">
                <div className="text-sm text-text-secondary mb-2 text-center">상대 크루</div>
                <div className="flex justify-center gap-1 flex-wrap">
                  {playoffOpponent.crew.map(cardId => {
                    const char = CHARACTERS_BY_ID[cardId];
                    return char ? (
                      <div key={cardId} className="text-xs bg-black/40 px-2 py-1 rounded">
                        {char.name.ko}
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              <Button
                onClick={() => onStartMatch(playoffOpponent.id)}
                variant="primary"
                size="lg"
                className="w-full"
              >
                {playerWins + opponentWins + 1}차전 시작
              </Button>
            </>
          ) : (
            <div className="text-center text-text-secondary">
              플레이오프 정보를 불러오는 중...
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // ================================
  // 5. 시즌 진행 중 화면 (정규시즌)
  // ================================
  return (
    <div className="min-h-screen w-full p-4 md:p-8" style={bgStyle}>
      {/* 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto mb-6"
      >
        <div className="flex items-center justify-between bg-black/40 rounded-xl p-4 backdrop-blur-sm">
          <div>
            <h1 className="text-3xl font-bold text-accent text-shadow-strong">시즌 {currentSeason.number}</h1>
            <p className="text-text-secondary text-shadow">
              {currentSeason.matches.filter(m => m.played && (m.homeCrewId === PLAYER_CREW_ID || m.awayCrewId === PLAYER_CREW_ID)).length} / 14 경기 완료
            </p>
          </div>
          {/* Phase 5: CP, AP, 샐러리캡 인디케이터 */}
          <div className="flex items-center gap-3">
            <CPMini />
            <APIndicator />
            <SalaryCapMini currentTotal={getTotalCrewSalary()} />
          </div>
          <div className="text-right">
            <div className="text-sm text-text-secondary text-shadow">내 순위</div>
            <div className="text-3xl font-bold text-accent text-shadow-strong">{playerRank}위</div>
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
          <h2 className="text-lg font-bold text-text-primary mb-4 text-shadow">📅 다음 경기</h2>

          {nextMatch ? (() => {
            // 홈/어웨이에 따라 상대 팀 ID 결정
            const isPlayerHome = nextMatch.homeCrewId === PLAYER_CREW_ID;
            const opponentId = isPlayerHome ? nextMatch.awayCrewId : nextMatch.homeCrewId;
            const opponent = getAICrewById(opponentId);
            return (
              <div>
                <div className="bg-black/30 rounded-lg p-4 mb-4">
                  <div className="text-center">
                    <div className="text-sm text-text-secondary mb-2">
                      VS {isPlayerHome ? '(홈)' : '(어웨이)'}
                    </div>
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

                    {/* 통산 전적 */}
                    {opponent && <HeadToHeadDisplay opponentId={opponent.id} getHeadToHead={getHeadToHead} />}

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
                  onClick={() => onStartMatch(opponentId)}
                  variant="primary"
                  size="lg"
                  className="w-full"
                >
                  대전 시작
                </Button>
              </div>
            );
          })() : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">✅</div>
              <div className="text-text-secondary mb-4">정규시즌 완료!</div>
              {playerRank <= 4 ? (
                <>
                  <div className="text-win font-bold mb-2">플레이오프 진출!</div>
                  <div className="text-xs text-text-secondary mb-4">
                    상위 4팀이 플레이오프에 진출합니다
                  </div>
                  <Button onClick={() => { endRegularSeason(); startPlayoff(); }} variant="primary" className="w-full">
                    플레이오프 시작
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-lose font-bold mb-2">플레이오프 진출 실패</div>
                  <div className="text-xs text-text-secondary mb-4">
                    {playerRank}위로 정규시즌 종료
                  </div>
                  <Button onClick={() => { endRegularSeason(); startPlayoff(); }} variant="primary" className="w-full">
                    시즌 종료
                  </Button>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* 순위표 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-bg-card rounded-xl p-6 border border-white/10"
        >
          <h2 className="text-lg font-bold text-text-primary mb-4 text-shadow">🏆 순위표</h2>

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
                onClick={() => handleCrewClick(standing.crewId)}
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Phase 5: 활동 패널 */}
      {nextMatch && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="max-w-4xl mx-auto mt-6"
        >
          <ActivityPanel
            cards={playerCrewCards}
            season={currentSeason.number}
            currentMatch={currentSeason.matches.filter(m => m.played && (m.homeCrewId === PLAYER_CREW_ID || m.awayCrewId === PLAYER_CREW_ID)).length + 1}
          />
        </motion.div>
      )}

      {/* Phase 5: 코칭 패널 */}
      {nextMatch && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="max-w-4xl mx-auto mt-6"
        >
          <CoachingPanel
            cards={playerCrewCards}
            season={currentSeason.number}
            compact
          />
        </motion.div>
      )}

      {/* 뉴스 피드 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-4xl mx-auto mt-6"
      >
        <NewsFeed maxItems={5} compact />
      </motion.div>

      {/* 하단 메뉴 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="max-w-4xl mx-auto mt-6 bg-black/40 rounded-xl p-4 backdrop-blur-sm"
      >
        <div className="flex justify-center gap-3 flex-wrap">
          <Button onClick={onCrewManagement} variant="secondary">크루 관리</Button>
          <Button onClick={onCollection} variant="ghost">내 크루</Button>
          <Button onClick={onCatalog} variant="ghost">술사 명부</Button>
          {onItems && <Button onClick={onItems} variant="ghost">아이템</Button>}
          <Button onClick={onRanking} variant="ghost">개인 순위</Button>
          <Button onClick={onTrade} variant="ghost">트레이드</Button>
          {onIndividualLeague && <Button onClick={onIndividualLeague} variant="ghost">🏆 개인 리그</Button>}
          {onProfile && <Button onClick={onProfile} variant="ghost">프로필</Button>}
          <Button onClick={onSettings} variant="ghost">설정</Button>
        </div>
      </motion.div>

      {/* 크루 카드 상세 모달 */}
      <AnimatePresence>
        {viewingCrew && (
          <Modal
            isOpen={!!viewingCrew}
            onClose={() => setViewingCrew(null)}
            title={`${viewingCrew.name} 크루`}
          >
            <div className="space-y-4">
              {/* 5장 카드 균등 배치 */}
              <div className="flex gap-2 justify-center">
                {viewingCrew.cards.map(card => (
                  <div
                    key={card.id}
                    className={`flex-1 min-w-0 max-w-[100px] ${onCardSelect ? 'cursor-pointer hover:scale-105 transition-transform' : ''}`}
                    onClick={() => {
                      if (onCardSelect) {
                        setViewingCrew(null);
                        onCardSelect(card.id);
                      }
                    }}
                  >
                    {/* 카드 이미지 */}
                    <div className={`
                      aspect-[3/4] rounded-lg overflow-hidden relative
                      bg-gradient-to-br
                      ${card.grade === '특급' ? 'from-yellow-500/30 to-yellow-600/10 border border-yellow-500/30' : ''}
                      ${card.grade === '1급' ? 'from-purple-500/30 to-purple-600/10 border border-purple-500/30' : ''}
                      ${card.grade === '준1급' ? 'from-blue-500/30 to-blue-600/10 border border-blue-500/30' : ''}
                      ${card.grade === '2급' ? 'from-green-500/30 to-green-600/10 border border-green-500/30' : ''}
                      ${card.grade === '준2급' ? 'from-gray-500/30 to-gray-600/10 border border-gray-500/30' : ''}
                      ${card.grade === '3급' ? 'from-gray-600/30 to-gray-700/10 border border-gray-600/30' : ''}
                    `}>
                      <img
                        src={getCharacterImage(card.id, card.name.ko, card.attribute)}
                        alt={card.name.ko}
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            parent.classList.add('flex', 'items-center', 'justify-center');
                            const fallback = document.createElement('span');
                            fallback.className = 'text-2xl';
                            fallback.textContent = ATTRIBUTES[card.attribute]?.icon || '👤';
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                    {/* 카드 정보 */}
                    <div className="mt-2 text-center">
                      <div className={`text-[10px] font-bold px-1 py-0.5 rounded inline-block mb-1 ${
                        card.grade === '특급' ? 'bg-yellow-500/30 text-yellow-400' :
                        card.grade === '1급' ? 'bg-purple-500/30 text-purple-400' :
                        card.grade === '준1급' ? 'bg-blue-500/30 text-blue-400' :
                        card.grade === '2급' ? 'bg-green-500/30 text-green-400' :
                        'bg-gray-500/30 text-gray-400'
                      }`}>{card.grade}</div>
                      <div className="text-xs font-bold text-text-primary truncate">{card.name.ko}</div>
                      <div className="text-[10px] text-text-secondary truncate mt-0.5">
                        {card.ultimateSkill.name}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {onCardSelect && (
                <div className="text-xs text-text-secondary text-center">
                  카드를 클릭하면 상세 기록을 볼 수 있습니다
                </div>
              )}

              <Button onClick={() => setViewingCrew(null)} variant="ghost" className="w-full">
                닫기
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// 통산 전적 표시 컴포넌트
interface HeadToHeadDisplayProps {
  opponentId: string;
  getHeadToHead: (id: string) => { wins: number; draws: number; losses: number } | null;
}

function HeadToHeadDisplay({ opponentId, getHeadToHead }: HeadToHeadDisplayProps) {
  const record = getHeadToHead(opponentId);

  if (!record || (record.wins === 0 && record.draws === 0 && record.losses === 0)) {
    return (
      <div className="mt-3 text-xs text-text-secondary">
        첫 대결
      </div>
    );
  }

  return (
    <div className="mt-3 bg-black/20 rounded-lg p-2">
      <div className="text-xs text-text-secondary mb-1">통산 전적</div>
      <div className="flex justify-center gap-3 text-sm">
        <span className="text-win font-bold">{record.wins}승</span>
        <span className="text-text-secondary">{record.draws}무</span>
        <span className="text-lose font-bold">{record.losses}패</span>
      </div>
    </div>
  );
}

// 순위표 행 컴포넌트
interface StandingRowProps {
  standing: LeagueStanding;
  rank: number;
  isPlayer: boolean;
  crewName: string;
  onClick?: () => void;
}

function StandingRow({ standing, rank, isPlayer, crewName, onClick }: StandingRowProps) {
  const rankBadge = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-lg transition-all cursor-pointer ${
        isPlayer
          ? 'bg-accent/20 border border-accent/50 hover:bg-accent/30'
          : 'bg-black/20 hover:bg-black/40'
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
      <div className="text-xs text-text-secondary">▶</div>
    </div>
  );
}
