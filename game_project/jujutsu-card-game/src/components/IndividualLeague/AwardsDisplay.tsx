// ========================================
// 개인상 표시 컴포넌트 (Phase 3)
// MVP, 최다승, 다크호스 모두 표시
// ========================================

import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import type { LeagueAward } from '../../utils/individualLeagueSystem';

interface AwardsDisplayProps {
  awards: LeagueAward[];
  playerCardIds?: string[];
}

// 상 타입별 스타일
const AWARD_STYLES: Record<string, { bgColor: string; borderColor: string; textColor: string }> = {
  MVP: {
    bgColor: 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20',
    borderColor: 'border-yellow-500/50',
    textColor: 'text-yellow-400'
  },
  MOST_WINS: {
    bgColor: 'bg-gradient-to-br from-red-500/20 to-orange-600/20',
    borderColor: 'border-red-500/50',
    textColor: 'text-red-400'
  },
  DARK_HORSE: {
    bgColor: 'bg-gradient-to-br from-purple-500/20 to-pink-600/20',
    borderColor: 'border-purple-500/50',
    textColor: 'text-purple-400'
  }
};

export function AwardsDisplay({ awards, playerCardIds = [] }: AwardsDisplayProps) {
  if (awards.length === 0) return null;

  const isPlayerCard = (odId: string) => playerCardIds.includes(odId);

  return (
    <div className="space-y-4">
      <div className="text-lg font-bold text-text-primary text-center">
        ═══ 개인상 ═══
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {awards.map((award, index) => {
          const card = CHARACTERS_BY_ID[award.odId];
          const style = AWARD_STYLES[award.type] || AWARD_STYLES.MVP;
          const isPlayer = isPlayerCard(award.odId);

          return (
            <motion.div
              key={award.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`
                ${style.bgColor}
                rounded-xl border-2 ${style.borderColor}
                p-4 text-center
                ${isPlayer ? 'ring-2 ring-yellow-400 ring-offset-2 ring-offset-bg-primary' : ''}
              `}
            >
              {/* 아이콘 */}
              <div className="text-4xl mb-2">
                {award.icon}
              </div>

              {/* 타이틀 */}
              <div className={`text-lg font-bold ${style.textColor} mb-3`}>
                {award.title}
              </div>

              {/* 캐릭터 이미지 */}
              <div className={`
                w-20 h-20 mx-auto rounded-full overflow-hidden mb-3
                border-2 ${isPlayer ? 'border-yellow-400' : 'border-white/30'}
              `}>
                {card && (
                  <img
                    src={getCharacterImage(card.id, card.name.ko, card.attribute)}
                    alt={card.name.ko}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* 이름 */}
              <div className="font-bold text-white">
                {isPlayer && <span className="text-yellow-400">⭐ </span>}
                {award.odName}
              </div>

              {/* 설명 */}
              <div className="text-sm text-text-secondary mt-1">
                {award.description}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default AwardsDisplay;
