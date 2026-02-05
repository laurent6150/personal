import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { SeasonHub } from './pages/SeasonHub';
import { CrewManager } from './pages/CrewManager';
import { Collection } from './pages/Collection';
import { CardDetail } from './pages/CardDetail';
import { CardCatalog } from './pages/CardCatalog';
import { PersonalRanking } from './pages/PersonalRanking';
import { Trade } from './pages/Trade';
import { Profile } from './pages/Profile';
import { Items } from './pages/Items';
import { Settings } from './pages/Settings';
import { BattleScreen } from './components/Battle/BattleScreen';
import { IndividualLeagueScreen } from './components/IndividualLeague/IndividualLeagueScreen';
import { IndividualBattleScreen } from './components/IndividualLeague/IndividualBattleScreen';
import { LevelUpModal } from './components/UI/LevelUpModal';
import { AchievementToast } from './components/UI/AchievementToast';
import { useBattle } from './hooks/useBattle';
import { useSeasonStore } from './stores/seasonStore';
import { useNewsFeedStore } from './stores/newsFeedStore';
import { usePlayerStore } from './stores/playerStore';
import { useIndividualLeagueStore } from './stores/individualLeagueStore';
import { CHARACTERS_BY_ID } from './data/characters';

type Page = 'seasonHub' | 'crew' | 'collection' | 'cardDetail' | 'catalog' | 'items' | 'ranking' | 'trade' | 'profile' | 'settings' | 'battle' | 'individualLeague' | 'individualBattle';

interface LevelUpInfo {
  cardId: string;
  newLevel: number;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('seasonHub');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [cardDetailReturnPage, setCardDetailReturnPage] = useState<Page>('collection');
  const [levelUps, setLevelUps] = useState<LevelUpInfo[]>([]);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [achievementToast, setAchievementToast] = useState<string | null>(null);
  const [currentOpponent, setCurrentOpponent] = useState<string | null>(null);

  // 카드 상세로 이동 (반환 페이지 지정)
  const goToCardDetail = useCallback((cardId: string, returnPage: Page = 'collection') => {
    setSelectedCardId(cardId);
    setCardDetailReturnPage(returnPage);
    setCurrentPage('cardDetail');
  }, []);

  const { startGameWithBanPick } = useBattle();
  const { currentSeason, playMatch, playPlayoffMatch, getAICrewById } = useSeasonStore(useShallow(state => ({
    currentSeason: state.currentSeason,
    playMatch: state.playMatch,
    playPlayoffMatch: state.playPlayoffMatch,
    getAICrewById: state.getAICrewById
  })));
  const addMatchResultNews = useNewsFeedStore(state => state.addMatchResultNews);
  const player = usePlayerStore(state => state.player);

  // 개인 리그 스토어
  const { startBattle: startIndividualBattle } = useIndividualLeagueStore(useShallow(state => ({
    startBattle: state.startBattle,
  })));

  // 리그 매치 시작 (시즌 시스템용) - 밴/픽 모드 활성화
  const handleStartMatch = useCallback((opponentCrewId: string) => {
    const opponent = getAICrewById(opponentCrewId);
    if (!opponent) return;

    // 밴/픽 모드로 게임 시작 (시즌에서 배정된 AI 크루 사용)
    const success = startGameWithBanPick(opponent.crew, opponent.difficulty);
    if (success) {
      setCurrentOpponent(opponentCrewId);
      setCurrentPage('battle');
    }
  }, [startGameWithBanPick, getAICrewById]);

  // 개인 리그 매치 시작 (새로운 1:1 배틀 시스템 사용)
  const handleStartIndividualLeagueMatch = useCallback((playerCardId: string, opponentId: string, matchId: string) => {
    const playerCard = CHARACTERS_BY_ID[playerCardId];
    const opponentCard = CHARACTERS_BY_ID[opponentId];

    if (!playerCard || !opponentCard) {
      console.error('[IndividualLeague] 카드를 찾을 수 없음:', playerCardId, opponentId);
      return;
    }

    console.log('[IndividualLeague] 1:1 배틀 시작:', playerCard.name.ko, 'vs', opponentCard.name.ko);

    // 새로운 1:1 배틀 시스템 시작
    startIndividualBattle(matchId, playerCardId, opponentId);
    setCurrentPage('individualBattle');
  }, [startIndividualBattle]);

  const handleReturnToSeasonHub = useCallback(() => {
    setCurrentPage('seasonHub');
    setSelectedCardId(null);
    setCurrentOpponent(null);
  }, []);

  const handleShowLevelUps = useCallback((levelUpData: LevelUpInfo[]) => {
    if (levelUpData.length > 0) {
      setLevelUps(levelUpData);
      setShowLevelUpModal(true);
    }
  }, []);

  const handleShowAchievement = useCallback((achievementId: string) => {
    setAchievementToast(achievementId);
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-bg-primary to-bg-secondary flex flex-col">
      <AnimatePresence mode="wait">
        {currentPage === 'seasonHub' && (
          <motion.div
            key="seasonHub"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full"
          >
            <SeasonHub
              onStartMatch={handleStartMatch}
              onCrewManagement={() => setCurrentPage('crew')}
              onCollection={() => setCurrentPage('collection')}
              onCatalog={() => setCurrentPage('catalog')}
              onItems={() => setCurrentPage('items')}
              onRanking={() => setCurrentPage('ranking')}
              onTrade={() => setCurrentPage('trade')}
              onProfile={() => setCurrentPage('profile')}
              onSettings={() => setCurrentPage('settings')}
              onIndividualLeague={() => setCurrentPage('individualLeague')}
              onCardSelect={(cardId) => goToCardDetail(cardId, 'seasonHub')}
            />
          </motion.div>
        )}

        {currentPage === 'crew' && (
          <motion.div
            key="crew"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 w-full"
          >
            <CrewManager onBack={handleReturnToSeasonHub} />
          </motion.div>
        )}

        {currentPage === 'collection' && (
          <motion.div
            key="collection"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 w-full"
          >
            <Collection
              onBack={handleReturnToSeasonHub}
            />
          </motion.div>
        )}

        {currentPage === 'cardDetail' && selectedCardId && (
          <motion.div
            key="cardDetail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 w-full"
          >
            <CardDetail
              cardId={selectedCardId}
              onBack={() => setCurrentPage(cardDetailReturnPage)}
            />
          </motion.div>
        )}

        {currentPage === 'catalog' && (
          <motion.div
            key="catalog"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 w-full"
          >
            <CardCatalog
              onBack={handleReturnToSeasonHub}
              onCardSelect={(cardId) => goToCardDetail(cardId, 'catalog')}
            />
          </motion.div>
        )}

        {currentPage === 'items' && (
          <motion.div
            key="items"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 w-full"
          >
            <Items onBack={handleReturnToSeasonHub} />
          </motion.div>
        )}

        {currentPage === 'ranking' && (
          <motion.div
            key="ranking"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 w-full"
          >
            <PersonalRanking
              onBack={handleReturnToSeasonHub}
              onCardSelect={(cardId) => goToCardDetail(cardId, 'ranking')}
            />
          </motion.div>
        )}

        {currentPage === 'trade' && (
          <motion.div
            key="trade"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 w-full"
          >
            <Trade onBack={handleReturnToSeasonHub} />
          </motion.div>
        )}

        {currentPage === 'profile' && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 w-full"
          >
            <Profile onBack={handleReturnToSeasonHub} />
          </motion.div>
        )}

        {currentPage === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 w-full"
          >
            <Settings onBack={handleReturnToSeasonHub} />
          </motion.div>
        )}

        {currentPage === 'individualLeague' && (
          <motion.div
            key="individualLeague"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex-1 w-full"
          >
            <IndividualLeagueScreen
              onBack={handleReturnToSeasonHub}
              onStartMatch={handleStartIndividualLeagueMatch}
            />
          </motion.div>
        )}

        {currentPage === 'individualBattle' && (
          <motion.div
            key="individualBattle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 w-full"
          >
            <IndividualBattleScreen
              onBattleEnd={() => {
                setCurrentPage('individualLeague');
              }}
            />
          </motion.div>
        )}

        {currentPage === 'battle' && (
          <motion.div
            key="battle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 w-full"
          >
            <BattleScreen
              onReturnToMenu={handleReturnToSeasonHub}
              opponentName={currentOpponent ? getAICrewById(currentOpponent)?.name : undefined}
              onBattleEnd={(result) => {
                // 시즌 시스템 배틀 (개인 리그는 IndividualBattleScreen에서 처리)
                if (currentOpponent) {
                  const playerScore = result.playerScore;
                  const opponentScore = result.aiScore;

                  const isPlayoff = currentSeason?.status === 'PLAYOFF_SEMI' ||
                    currentSeason?.status === 'PLAYOFF_FINAL';

                  if (isPlayoff) {
                    playPlayoffMatch(playerScore, opponentScore);
                  } else {
                    playMatch(currentOpponent, playerScore, opponentScore);
                  }

                  // 뉴스 추가
                  const opponentCrew = getAICrewById(currentOpponent);
                  if (opponentCrew && currentSeason) {
                    addMatchResultNews({
                      seasonNumber: currentSeason.number,
                      homeCrewName: player.name,
                      awayCrewName: opponentCrew.name,
                      homeScore: playerScore,
                      awayScore: opponentScore,
                      isPlayer: true,
                      isPlayoff
                    });
                  }
                }

                if (result.levelUps && result.levelUps.length > 0) {
                  handleShowLevelUps(result.levelUps.map(cardId => ({
                    cardId,
                    newLevel: 2
                  })));
                }
                if (result.newAchievements && result.newAchievements.length > 0) {
                  result.newAchievements.forEach((achievementId, index) => {
                    setTimeout(() => handleShowAchievement(achievementId), index * 5500);
                  });
                }
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Level Up Modal */}
      <LevelUpModal
        isOpen={showLevelUpModal}
        onClose={() => setShowLevelUpModal(false)}
        levelUps={levelUps}
      />

      {/* Achievement Toast */}
      <AchievementToast
        achievementId={achievementToast}
        onClose={() => setAchievementToast(null)}
      />
    </div>
  );
}

export default App;
