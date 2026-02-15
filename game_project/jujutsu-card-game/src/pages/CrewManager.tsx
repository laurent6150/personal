import { useState } from 'react';
import { motion } from 'framer-motion';
import { useCrewManagement } from '../hooks/useBattle';
import { usePlayerStore } from '../stores/playerStore';
import { CardDisplayLarge } from '../components/Card/CardDisplayLarge';
import { CardMini } from '../components/Card/CardDisplay';
import { Button } from '../components/UI/Button';
import { GradeBadge } from '../components/UI/Badge';
import { SalaryCapDisplay } from '../components/Phase5/SalaryCapDisplay';

interface CrewManagerProps {
  onBack: () => void;
}

export function CrewManager({ onBack }: CrewManagerProps) {
  const {
    crewCards,
    availableCards,
    gradeCount,
    crewSize,
    maxCrewSize,
    addCardToCrew,
    removeCardFromCrew
  } = useCrewManagement();

  const getTotalCrewSalary = usePlayerStore(state => state.getTotalCrewSalary);

  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);

  const handleAddCard = (cardId: string) => {
    if (addCardToCrew(cardId)) {
      setSelectedSlot(null);
    }
  };

  const handleRemoveCard = (cardId: string) => {
    removeCardFromCrew(cardId);
  };

  // 배경 이미지 스타일
  const bgStyle = {
    backgroundImage: 'url(/images/backgrounds/menu_bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  return (
    <div className="min-h-screen p-4" style={bgStyle}>
      {/* 헤더 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex items-center justify-between bg-black/40 rounded-xl p-4 backdrop-blur-sm">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← 뒤로
          </Button>
          <h1 className="text-2xl font-bold text-text-primary text-shadow-strong">크루 관리</h1>
          <div className="w-20" /> {/* 균형을 위한 빈 공간 */}
        </div>
      </div>

      {/* Phase 5.3: 등급별 현황 (등급 제한 제거, 정보 표시용) */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="bg-bg-card rounded-xl p-4 border border-white/10">
          <h3 className="text-sm text-text-secondary mb-2">등급별 현황</h3>
          <div className="flex gap-4 flex-wrap">
            {(['특급', '1급', '준1급', '2급'] as const).map(grade => (
              <div key={grade} className="flex items-center gap-2">
                <GradeBadge grade={grade} size="sm" />
                <span className="text-sm text-text-primary">
                  {gradeCount[grade]}명
                </span>
              </div>
            ))}
          </div>
          <p className="text-xs text-text-secondary mt-2">
            ※ 샐러리캡 내에서 자유롭게 구성 가능
          </p>
        </div>
      </div>

      {/* Phase 5: 샐러리캡 표시 */}
      <div className="max-w-4xl mx-auto mb-6">
        <SalaryCapDisplay currentTotal={getTotalCrewSalary()} />
      </div>

      {/* 현재 크루 */}
      <div className="max-w-6xl mx-auto mb-8">
        <h2 className="text-lg font-bold text-text-primary mb-3 text-shadow bg-black/30 inline-block px-3 py-1 rounded-lg">
          현재 크루 ({crewSize}/{maxCrewSize})
        </h2>

        <div className="flex gap-4 justify-center flex-wrap">
          {crewCards.map(({ character, playerCard }, index) => (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <CardDisplayLarge
                character={character}
                playerCard={playerCard}
                showRadarChart={true}
              />
              <button
                onClick={() => handleRemoveCard(character.id)}
                className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-lose text-white text-lg font-bold hover:bg-red-600 transition-colors shadow-lg"
              >
                ×
              </button>
            </motion.div>
          ))}

          {/* 빈 슬롯 */}
          {Array.from({ length: maxCrewSize - crewSize }).map((_, i) => (
            <button
              key={`empty-${i}`}
              onClick={() => setSelectedSlot(crewSize + i)}
              className={`
                w-[250px] h-[350px] rounded-xl border-2 border-dashed transition-all
                flex items-center justify-center bg-black/20
                ${selectedSlot === crewSize + i
                  ? 'border-accent bg-accent/10'
                  : 'border-white/20 hover:border-accent/50'}
              `}
            >
              <div className="text-center">
                <span className="text-5xl text-text-secondary block mb-2">+</span>
                <span className="text-sm text-text-secondary">카드 추가</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 사용 가능한 카드 */}
      <div className="max-w-4xl mx-auto">
        <h2 className="text-lg font-bold text-text-primary mb-3 text-shadow bg-black/30 inline-block px-3 py-1 rounded-lg">
          사용 가능한 카드
        </h2>

        {availableCards.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            모든 카드가 크루에 편성되어 있습니다
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {availableCards.map(({ character, playerCard, canAdd }) => (
              <CardMini
                key={character.id}
                character={character}
                playerCard={playerCard}
                onClick={canAdd && crewSize < maxCrewSize ? () => handleAddCard(character.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
