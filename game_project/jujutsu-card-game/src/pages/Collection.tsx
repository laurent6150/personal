import { useState } from 'react';
import { motion } from 'framer-motion';
import { usePlayerStore } from '../stores/playerStore';
import { ALL_CHARACTERS, CHARACTERS_BY_GRADE } from '../data/characters';
import { CardDisplay } from '../components/Card/CardDisplay';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { StatsDisplay } from '../components/UI/StatBar';
import { GradeBadge, AttributeBadge } from '../components/UI/Badge';
import type { CharacterCard } from '../types';

type FilterGrade = '특급' | '1급' | '준1급' | '2급' | 'ALL';

interface CollectionProps {
  onBack: () => void;
  onViewCard?: (cardId: string) => void;
}

export function Collection({ onBack, onViewCard }: CollectionProps) {
  const { player } = usePlayerStore();
  const [selectedGrade, setSelectedGrade] = useState<FilterGrade>('ALL');
  const [selectedCard, setSelectedCard] = useState<CharacterCard | null>(null);

  const grades: FilterGrade[] = ['ALL', '특급', '1급', '준1급', '2급'];

  const filteredCards: CharacterCard[] = selectedGrade === 'ALL'
    ? ALL_CHARACTERS
    : (CHARACTERS_BY_GRADE as Record<string, CharacterCard[]>)[selectedGrade] || [];

  return (
    <div className="min-h-screen p-4">
      {/* 헤더 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← 뒤로
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">컬렉션</h1>
          <div className="text-sm text-text-secondary">
            {Object.keys(player.ownedCards).length}/{ALL_CHARACTERS.length} 수집
          </div>
        </div>
      </div>

      {/* 등급 필터 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex gap-2 justify-center flex-wrap">
          {grades.map(grade => (
            <Button
              key={grade}
              onClick={() => setSelectedGrade(grade)}
              variant={selectedGrade === grade ? 'primary' : 'ghost'}
              size="sm"
            >
              {grade === 'ALL' ? '전체' : grade}
            </Button>
          ))}
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
        >
          {filteredCards.map(card => {
            const playerCard = player.ownedCards[card.id];

            return (
              <motion.div
                key={card.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
              >
                <CardDisplay
                  character={card}
                  playerCard={playerCard}
                  size="sm"
                  onClick={() => setSelectedCard(card)}
                />
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* 카드 상세 모달 */}
      <Modal
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        title={selectedCard?.name.ko}
        size="lg"
      >
        {selectedCard && (
          <div className="space-y-4">
            {/* 기본 정보 */}
            <div className="flex gap-4 items-start">
              <div className="flex-shrink-0">
                <CardDisplay
                  character={selectedCard}
                  playerCard={player.ownedCards[selectedCard.id]}
                  size="md"
                  showSkill={false}
                />
              </div>

              <div className="flex-1 space-y-3">
                {/* 이름 및 등급 */}
                <div className="flex items-center gap-2">
                  <GradeBadge grade={selectedCard.grade} size="md" />
                  <AttributeBadge attribute={selectedCard.attribute} showLabel />
                </div>

                {/* 이름들 */}
                <div className="text-sm text-text-secondary">
                  <div>{selectedCard.name.ja}</div>
                  <div>{selectedCard.name.en}</div>
                </div>

                {/* 레벨 */}
                {player.ownedCards[selectedCard.id] && (
                  <div className="text-sm">
                    <span className="text-text-secondary">레벨: </span>
                    <span className="text-accent font-bold">
                      {player.ownedCards[selectedCard.id].level}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* 스탯 */}
            <div className="bg-black/30 rounded-lg p-3">
              <h4 className="text-sm font-bold text-text-primary mb-2">스탯</h4>
              <StatsDisplay stats={selectedCard.baseStats} />
            </div>

            {/* 스킬 */}
            <div className="bg-black/30 rounded-lg p-3">
              <h4 className="text-sm font-bold text-accent mb-1">
                【{selectedCard.skill.name}】
              </h4>
              <p className="text-sm text-text-secondary">
                {selectedCard.skill.description}
              </p>
            </div>

            {/* 전적 */}
            {player.ownedCards[selectedCard.id] && (
              <div className="bg-black/30 rounded-lg p-3">
                <h4 className="text-sm font-bold text-text-primary mb-2">전적</h4>
                <div className="text-sm text-text-secondary">
                  승: {player.ownedCards[selectedCard.id].stats.totalWins} /
                  패: {player.ownedCards[selectedCard.id].stats.totalLosses}
                </div>
              </div>
            )}

            {/* 상세 보기 버튼 */}
            {onViewCard && player.ownedCards[selectedCard.id] && (
              <Button
                onClick={() => {
                  setSelectedCard(null);
                  onViewCard(selectedCard.id);
                }}
                variant="primary"
                className="w-full"
              >
                상세 보기 / 장비 관리
              </Button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
