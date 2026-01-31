// ========================================
// 카드 상세 정보 패널 - 선택 시 표시
// ========================================

import { motion, AnimatePresence } from 'framer-motion';
import type { CharacterCard, Arena, Attribute } from '../../types';
import { ATTRIBUTES, ATTRIBUTE_ADVANTAGE } from '../../data';
import { GradeBadge, AttributeBadge } from '../UI/Badge';

interface CardDetailPanelProps {
  card: CharacterCard | null;
  arena?: Arena | null;
  onClose?: () => void;
  compact?: boolean;
}

export function CardDetailPanel({ card, arena, onClose, compact = false }: CardDetailPanelProps) {
  if (!card) return null;

  const attrInfo = ATTRIBUTES[card.attribute];

  // 상성 계산
  const strongAgainst = ATTRIBUTE_ADVANTAGE[card.attribute];
  const weakAgainst = (Object.keys(ATTRIBUTE_ADVANTAGE) as Attribute[]).filter(
    attr => ATTRIBUTE_ADVANTAGE[attr].includes(card.attribute)
  );

  // 현재 경기장에서 이 카드가 받는 효과
  const arenaEffectsOnCard = arena?.effects.filter(effect => {
    if (effect.target === 'ALL') return true;
    return effect.target === card.attribute;
  }) ?? [];

  // Compact 모드 (대전 화면 우측 패널용)
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-bg-card/80 rounded-lg border border-white/10 p-3"
      >
        {/* 헤더 (컴팩트) */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">{attrInfo.icon}</span>
            <div>
              <h3 className="font-bold text-sm text-text-primary">{card.name.ko}</h3>
              <p className="text-xs text-text-secondary">{card.name.ja}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <GradeBadge grade={card.grade} size="sm" />
            <AttributeBadge attribute={card.attribute} size="sm" />
          </div>
        </div>

        {/* 스탯 미니 */}
        <div className="flex gap-2 mb-2 text-xs">
          <span className="text-red-400">ATK {card.baseStats.atk}</span>
          <span className="text-blue-400">DEF {card.baseStats.def}</span>
          <span className="text-yellow-400">SPD {card.baseStats.spd}</span>
        </div>

        {/* 고유 기술 (컴팩트) */}
        <div className="bg-black/30 rounded p-2 mb-2">
          <div className="text-xs font-bold text-accent mb-1">
            【{card.skill.name}】
          </div>
          <p className="text-xs text-text-secondary line-clamp-2">
            {card.skill.description}
          </p>
        </div>

        {/* 상성 (컴팩트) */}
        <div className="flex gap-2 text-xs">
          {strongAgainst.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-win">👊</span>
              {strongAgainst.map(attr => (
                <span key={attr} className="text-win">{ATTRIBUTES[attr].icon}</span>
              ))}
            </div>
          )}
          {weakAgainst.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-lose">💀</span>
              {weakAgainst.map(attr => (
                <span key={attr} className="text-lose">{ATTRIBUTES[attr].icon}</span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-bg-card rounded-xl border border-white/10 p-4 w-full max-w-sm"
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{attrInfo.icon}</span>
            <div>
              <h3 className="font-bold text-lg text-text-primary">{card.name.ko}</h3>
              <p className="text-xs text-text-secondary">{card.name.ja}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <GradeBadge grade={card.grade} size="md" />
            <AttributeBadge attribute={card.attribute} size="md" />
          </div>
        </div>

        {/* 고유 기술 */}
        <div className="bg-black/30 rounded-lg p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-accent text-sm">⚔️ 고유 기술</span>
          </div>
          <div className="text-sm font-bold text-accent mb-1">
            【{card.skill.name}】
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            {card.skill.description}
          </p>
          <div className="mt-2 text-xs text-text-secondary">
            {card.skill.effect.trigger === 'ALWAYS' ? (
              <span className="text-win">✓ 항상 발동</span>
            ) : (
              <span className="text-accent">
                🎲 {card.skill.effect.probability}% 확률 발동
              </span>
            )}
          </div>
        </div>

        {/* 속성 상성 */}
        <div className="bg-black/30 rounded-lg p-3 mb-3">
          <div className="text-sm text-accent mb-2">🔄 속성 상성</div>

          <div className="grid grid-cols-2 gap-2">
            {/* 유리한 상대 */}
            <div className="bg-win/10 rounded-lg p-2">
              <div className="text-xs text-win mb-1">👊 유리</div>
              <div className="flex flex-wrap gap-1">
                {strongAgainst.length > 0 ? (
                  strongAgainst.map(attr => (
                    <span key={attr} className="text-xs px-2 py-0.5 bg-win/20 rounded-full flex items-center gap-1">
                      <span>{ATTRIBUTES[attr].icon}</span>
                      <span>{ATTRIBUTES[attr].ko}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-text-secondary">없음</span>
                )}
              </div>
            </div>

            {/* 불리한 상대 */}
            <div className="bg-lose/10 rounded-lg p-2">
              <div className="text-xs text-lose mb-1">💀 불리</div>
              <div className="flex flex-wrap gap-1">
                {weakAgainst.length > 0 ? (
                  weakAgainst.map(attr => (
                    <span key={attr} className="text-xs px-2 py-0.5 bg-lose/20 rounded-full flex items-center gap-1">
                      <span>{ATTRIBUTES[attr].icon}</span>
                      <span>{ATTRIBUTES[attr].ko}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-text-secondary">없음</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 경기장 효과 */}
        {arena && (
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-sm text-accent mb-2">🏟️ 경기장 효과</div>
            <div className="text-xs text-text-secondary mb-2">
              현재: <span className="text-text-primary">{arena.name.ko}</span>
            </div>

            {arenaEffectsOnCard.length > 0 ? (
              <div className="space-y-1">
                {arenaEffectsOnCard.map((effect, idx) => {
                  const isPositive = effect.value > 0;
                  return (
                    <div
                      key={idx}
                      className={`text-xs px-2 py-1 rounded ${
                        isPositive ? 'bg-win/20 text-win' : 'bg-lose/20 text-lose'
                      }`}
                    >
                      {isPositive ? '▲' : '▼'} {effect.description}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-text-secondary">
                이 카드에 적용되는 효과 없음
              </div>
            )}
          </div>
        )}

        {/* 닫기 버튼 (모바일용) */}
        {onClose && (
          <button
            onClick={onClose}
            className="mt-3 w-full py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            닫기
          </button>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
