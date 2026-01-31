import { useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MainMenu } from './pages/MainMenu';
import { CrewManager } from './pages/CrewManager';
import { Collection } from './pages/Collection';
import { CardDetail } from './pages/CardDetail';
import { Profile } from './pages/Profile';
import { BattleScreen } from './components/Battle/BattleScreen';
import { LevelUpModal } from './components/UI/LevelUpModal';
import { AchievementToast } from './components/UI/AchievementToast';
import { useBattle } from './hooks/useBattle';
import type { Difficulty } from './types';

type Page = 'menu' | 'crew' | 'collection' | 'cardDetail' | 'profile' | 'battle';

interface LevelUpInfo {
  cardId: string;
  newLevel: number;
}

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('menu');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [levelUps, setLevelUps] = useState<LevelUpInfo[]>([]);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [achievementToast, setAchievementToast] = useState<string | null>(null);

  const { startGame, session } = useBattle();

  const handleStartGame = (difficulty: Difficulty) => {
    const success = startGame(difficulty);
    if (success) {
      setCurrentPage('battle');
    }
  };

  const handleReturnToMenu = () => {
    setCurrentPage('menu');
    setSelectedCardId(null);
  };

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
    <div className="min-h-screen bg-gradient-to-br from-bg-primary to-bg-secondary">
      <AnimatePresence mode="wait">
        {currentPage === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <MainMenu
              onStartGame={handleStartGame}
              onCrewManagement={() => setCurrentPage('crew')}
              onCollection={() => setCurrentPage('collection')}
              onProfile={() => setCurrentPage('profile')}
            />
          </motion.div>
        )}

        {currentPage === 'crew' && (
          <motion.div
            key="crew"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <CrewManager onBack={handleReturnToMenu} />
          </motion.div>
        )}

        {currentPage === 'collection' && (
          <motion.div
            key="collection"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
          >
            <Collection
              onBack={handleReturnToMenu}
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
          >
            <Profile onBack={handleReturnToMenu} />
          </motion.div>
        )}

        {currentPage === 'battle' && session && (
          <motion.div
            key="battle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <BattleScreen
              onBattleEnd={(result) => {
                if (result.levelUps && result.levelUps.length > 0) {
                  handleShowLevelUps(result.levelUps.map(cardId => ({
                    cardId,
                    newLevel: 2 // Will be updated with actual level from store
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
