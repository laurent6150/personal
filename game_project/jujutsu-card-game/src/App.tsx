import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SeasonHub } from './pages/SeasonHub';
import { CrewManager } from './pages/CrewManager';
import { Collection } from './pages/Collection';
import { CardDetail } from './pages/CardDetail';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { BattleScreen } from './components/Battle/BattleScreen';
import { LevelUpModal } from './components/UI/LevelUpModal';
import { AchievementToast } from './components/UI/AchievementToast';
import { useBattle } from './hooks/useBattle';
import { useSeasonStore } from './stores/seasonStore';
import { AI_CREWS_BY_ID } from './data/aiCrews';

type Page = 'seasonHub' | 'crew' | 'collection' | 'cardDetail' | 'profile' | 'settings' | 'battle';

interface LevelUpInfo {
  cardId: string;
  newLevel: number;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('seasonHub');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [levelUps, setLevelUps] = useState<LevelUpInfo[]>([]);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [achievementToast, setAchievementToast] = useState<string | null>(null);
  const [currentOpponent, setCurrentOpponent] = useState<string | null>(null);

  const { startGame } = useBattle();
  const { playMatch } = useSeasonStore();

  // 리그 매치 시작 (시즌 시스템용)
  const handleStartMatch = useCallback((opponentCrewId: string) => {
    const opponent = AI_CREWS_BY_ID[opponentCrewId];
    if (!opponent) return;

    const success = startGame(opponent.difficulty);
    if (success) {
      setCurrentOpponent(opponentCrewId);
      setCurrentPage('battle');
    }
  }, [startGame]);

  const handleReturnToSeasonHub = useCallback(() => {
    setCurrentPage('seasonHub');
    setSelectedCardId(null);
    setCurrentOpponent(null);
  }, []);

  const handleViewCard = useCallback((cardId: string) => {
    setSelectedCardId(cardId);
    setCurrentPage('cardDetail');
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
              onProfile={() => setCurrentPage('profile')}
              onSettings={() => setCurrentPage('settings')}
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
              onViewCard={handleViewCard}
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
              onBack={() => setCurrentPage('collection')}
            />
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
              opponentName={currentOpponent ? AI_CREWS_BY_ID[currentOpponent]?.name : undefined}
              onBattleEnd={(result) => {
                // 리그 결과 기록
                if (currentOpponent) {
                  const playerScore = result.won ? 3 : 0;
                  const opponentScore = result.won ? 0 : 3;
                  playMatch(currentOpponent, playerScore, opponentScore);
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
