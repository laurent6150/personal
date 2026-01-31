import { motion } from 'framer-motion';
import { usePlayerStore } from '../stores/playerStore';
import { CHARACTERS_BY_ID } from '../data/characters';
import { CardDisplay } from '../components/Card/CardDisplay';
import { Button } from '../components/UI/Button';
import type { Difficulty } from '../types';

interface MainMenuProps {
  onStartGame: (difficulty: Difficulty) => void;
  onCrewManagement: () => void;
  onCollection: () => void;
  onProfile?: () => void;
}

export function MainMenu({ onStartGame, onCrewManagement, onCollection, onProfile }: MainMenuProps) {
  const { player } = usePlayerStore();

  const crewCards = player.currentCrew
    .map(id => CHARACTERS_BY_ID[id])
    .filter(Boolean);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* 타이틀 */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-2">
          <span className="text-accent">영역전개</span>
        </h1>
        <p className="text-text-secondary">주술회전 카드 배틀</p>
      </motion.div>

      {/* 현재 크루 미리보기 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-center text-sm text-text-secondary mb-3">현재 크루</h2>
        <div className="flex gap-2 justify-center flex-wrap">
          {crewCards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <CardDisplay
                character={card}
                playerCard={player.ownedCards[card.id]}
                size="sm"
                showStats={false}
                showSkill={false}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* 메뉴 버튼 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-xs space-y-3"
      >
        {/* 난이도 선택 */}
        <div className="bg-bg-card rounded-xl p-4 border border-white/10">
          <h3 className="text-sm text-text-secondary mb-3 text-center">대전 시작</h3>
          <div className="space-y-2">
            <Button
              onClick={() => onStartGame('EASY')}
              variant="secondary"
              className="w-full"
            >
              <span className="text-green-400">쉬움</span>
              <span className="text-xs text-text-secondary ml-2">랜덤 AI</span>
            </Button>
            <Button
              onClick={() => onStartGame('NORMAL')}
              variant="secondary"
              className="w-full"
            >
              <span className="text-yellow-400">보통</span>
              <span className="text-xs text-text-secondary ml-2">경기장 활용</span>
            </Button>
            <Button
              onClick={() => onStartGame('HARD')}
              variant="secondary"
              className="w-full"
            >
              <span className="text-red-400">어려움</span>
              <span className="text-xs text-text-secondary ml-2">전략적 AI</span>
            </Button>
          </div>
        </div>

        {/* 다른 메뉴 */}
        <Button onClick={onCrewManagement} variant="primary" className="w-full">
          크루 관리
        </Button>

        <Button onClick={onCollection} variant="ghost" className="w-full">
          컬렉션
        </Button>

        {onProfile && (
          <Button onClick={onProfile} variant="ghost" className="w-full">
            프로필
          </Button>
        )}
      </motion.div>

      {/* 전적 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-center text-sm text-text-secondary"
      >
        <div>
          전적: {player.totalStats.totalWins}승 {player.totalStats.totalLosses}패
        </div>
        {player.totalStats.maxWinStreak > 0 && (
          <div>최대 연승: {player.totalStats.maxWinStreak}</div>
        )}
      </motion.div>
    </div>
  );
}
