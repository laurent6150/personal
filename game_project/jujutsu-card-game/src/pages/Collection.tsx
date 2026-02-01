import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../stores/playerStore';
import { useSeasonStore } from '../stores/seasonStore';
import { CHARACTERS_BY_ID } from '../data/characters';
import { CardDisplay } from '../components/Card/CardDisplay';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { GradeBadge, AttributeBadge } from '../components/UI/Badge';
import { CREW_SIZE } from '../data/constants';
import type { CharacterCard } from '../types';

interface CollectionProps {
  onBack: () => void;
}

export function Collection({ onBack }: CollectionProps) {
  const { player } = usePlayerStore();
  const { playerCrew } = useSeasonStore();
  const [selectedCard, setSelectedCard] = useState<CharacterCard | null>(null);

  // 내 크루 카드만 표시 (시즌에서 선택한 크루)
  const myCrewCards = playerCrew
    .map(cardId => CHARACTERS_BY_ID[cardId])
    .filter(Boolean) as CharacterCard[];

  const handleCardClick = (card: CharacterCard) => {
    setSelectedCard(card);
  };

  return (
    <div className="min-h-screen p-4">
      {/* 헤더 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← 뒤로
          </Button>
          <h1 className="text-2xl font-bold text-text-primary">내 크루</h1>
          <div className="text-sm text-text-secondary">
            {myCrewCards.length}/{CREW_SIZE} 카드
          </div>
        </div>
      </div>

      {/* 크루 카드가 없는 경우 */}
      {myCrewCards.length === 0 && (
        <div className="max-w-4xl mx-auto text-center py-20">
          <div className="text-6xl mb-4">🎴</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            크루가 없습니다
          </h2>
          <p className="text-text-secondary">
            시즌을 시작하고 크루를 선택해주세요!
          </p>
        </div>
      )}

      {/* 크루 카드 그리드 */}
      {myCrewCards.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4"
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
            {myCrewCards.map(card => {
              const playerCard = player.ownedCards[card.id];

              return (
                <motion.div
                  key={card.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative cursor-pointer"
                  onClick={() => handleCardClick(card)}
                >
                  <CardDisplay
                    character={card}
                    size="md"
                    showStats={false}
                    showSkill={false}
                  />
                  {/* 레벨 표시 */}
                  {playerCard && (
                    <div className="absolute top-2 right-2 bg-accent/80 text-white text-xs font-bold px-2 py-1 rounded">
                      Lv.{playerCard.level}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>

          {/* 크루 스탯 요약 */}
          <div className="mt-8 bg-bg-card rounded-xl p-4 border border-white/10">
            <h3 className="text-sm text-text-secondary mb-3">크루 전적</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-win">{player.totalStats.totalWins}</div>
                <div className="text-xs text-text-secondary">승리</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-lose">{player.totalStats.totalLosses}</div>
                <div className="text-xs text-text-secondary">패배</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-accent">{player.totalStats.maxWinStreak}</div>
                <div className="text-xs text-text-secondary">최대 연승</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 카드 상세 모달 */}
      <AnimatePresence>
        {selectedCard && (
          <Modal
            isOpen={!!selectedCard}
            onClose={() => setSelectedCard(null)}
            title={selectedCard.name.ko}
          >
            <div className="flex flex-col items-center gap-4">
              <CardDisplay
                character={selectedCard}
                size="lg"
                showStats={true}
                showSkill={true}
              />

              {/* 기술 정보 */}
              <div className="w-full bg-black/30 rounded-lg p-4">
                <h4 className="text-sm text-accent mb-2">기본기</h4>
                <div className="space-y-2">
                  {selectedCard.basicSkills.map(skill => (
                    <div key={skill.id} className="text-xs">
                      <span className={`font-bold ${
                        skill.type === 'ATTACK' ? 'text-red-400' :
                        skill.type === 'DEFENSE' ? 'text-blue-400' :
                        'text-yellow-400'
                      }`}>
                        [{skill.type === 'ATTACK' ? '공격' : skill.type === 'DEFENSE' ? '방어' : '유틸'}]
                      </span>
                      <span className="text-text-primary ml-1">{skill.name}</span>
                      <p className="text-text-secondary mt-0.5">{skill.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full bg-accent/20 rounded-lg p-4 border border-accent/30">
                <h4 className="text-sm text-accent mb-2">⚡ 필살기</h4>
                <div className="text-sm font-bold text-text-primary">
                  {selectedCard.ultimateSkill.name}
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  {selectedCard.ultimateSkill.description}
                </p>
              </div>

              <div className="flex gap-2 w-full">
                <GradeBadge grade={selectedCard.grade} size="md" />
                <AttributeBadge attribute={selectedCard.attribute} size="md" />
              </div>

              <Button onClick={() => setSelectedCard(null)} variant="ghost" className="w-full">
                닫기
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}
