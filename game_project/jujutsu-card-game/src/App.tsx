import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MainMenu } from './pages/MainMenu';
import { CrewManager } from './pages/CrewManager';
import { Collection } from './pages/Collection';
import { BattleScreen } from './components/Battle/BattleScreen';
import { useBattle } from './hooks/useBattle';
import type { Difficulty } from './types';

type Page = 'menu' | 'crew' | 'collection' | 'battle';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('menu');
  const { startGame, session } = useBattle();

  const handleStartGame = (difficulty: Difficulty) => {
    const success = startGame(difficulty);
    if (success) {
      setCurrentPage('battle');
    }
  };

  const handleReturnToMenu = () => {
    setCurrentPage('menu');
  };

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
            <Collection onBack={handleReturnToMenu} />
          </motion.div>
        )}

        {currentPage === 'battle' && session && (
          <motion.div
            key="battle"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <BattleScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
