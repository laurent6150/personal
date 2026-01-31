import { motion } from 'framer-motion';
import type { CharacterCard, PlayerCard } from '../../types';
import { CardDisplay } from './CardDisplay';

interface CardSelectorProps {
  cards: CharacterCard[];
  playerCards?: Record<string, PlayerCard>;
  selectedCardId: string | null;
  usedCardIds?: string[];
  onSelect: (cardId: string) => void;
  disabled?: boolean;
}

export function CardSelector({
  cards,
  playerCards,
  selectedCardId,
  usedCardIds = [],
  onSelect,
  disabled = false
}: CardSelectorProps) {
  return (
    <div className="w-full">
      <div className="text-sm text-text-secondary mb-2">
        사용 가능한 카드를 선택하세요
      </div>

      <motion.div
        className="flex gap-3 justify-center flex-wrap"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
          }
        }}
      >
        {cards.map((card) => {
          const isUsed = usedCardIds.includes(card.id);
          const isSelected = selectedCardId === card.id;
          const playerCard = playerCards?.[card.id];

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
                isSelected={isSelected}
                isUsed={isUsed}
                onClick={!disabled && !isUsed ? () => onSelect(card.id) : undefined}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {selectedCardId && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-sm text-accent"
        >
          선택됨: {cards.find(c => c.id === selectedCardId)?.name.ko}
        </motion.div>
      )}
    </div>
  );
}

// 크루 편집용 카드 그리드
interface CardGridProps {
  cards: Array<{
    character: CharacterCard;
    playerCard?: PlayerCard;
    canAdd?: boolean;
  }>;
  selectedCardId?: string | null;
  onSelect?: (cardId: string) => void;
  emptyMessage?: string;
}

export function CardGrid({
  cards,
  selectedCardId,
  onSelect,
  emptyMessage = '카드가 없습니다'
}: CardGridProps) {
  if (cards.length === 0) {
    return (
      <div className="py-8 text-center text-text-secondary">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
      {cards.map(({ character, playerCard, canAdd }) => (
        <CardDisplay
          key={character.id}
          character={character}
          playerCard={playerCard}
          size="sm"
          isSelected={selectedCardId === character.id}
          isUsed={canAdd === false}
          onClick={onSelect ? () => onSelect(character.id) : undefined}
        />
      ))}
    </div>
  );
}
