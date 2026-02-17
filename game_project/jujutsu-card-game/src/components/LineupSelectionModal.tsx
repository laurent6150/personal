// ========================================
// 라인업 선택 모달 - 7장 중 6장 출전 선택
// ========================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../data/characters';
import { ATTRIBUTES, ATTRIBUTE_ADVANTAGE, BATTLE_SIZE } from '../data/constants';
import { GradeBadge } from './UI/Badge';
import type { Attribute } from '../types';
import { Button } from './UI/Button';
import { getCharacterImage, getPlaceholderImage } from '../utils/imageHelper';
import type { LegacyGrade } from '../types';

interface LineupSelectionModalProps {
  roster: string[];  // 7장 로스터
  onConfirm: (lineup: string[]) => void;
  onCancel: () => void;
}

export function LineupSelectionModal({ roster, onConfirm, onCancel }: LineupSelectionModalProps) {
  const [benchedCardId, setBenchedCardId] = useState<string | null>(null);
  const [selectedInfoId, setSelectedInfoId] = useState<string | null>(null);

  const rosterCards = useMemo(() =>
    roster
      .map(id => ({ id, char: CHARACTERS_BY_ID[id] }))
      .filter(item => item.char),
    [roster]
  );

  // 선택된 카드의 속성 상성 정보
  const selectedAttrInfo = useMemo(() => {
    if (!selectedInfoId) return null;
    const char = CHARACTERS_BY_ID[selectedInfoId];
    if (!char) return null;
    const attr = char.attribute;
    const strongAgainst = ATTRIBUTE_ADVANTAGE[attr] || [];
    const weakAgainst = (Object.keys(ATTRIBUTE_ADVANTAGE) as Attribute[]).filter(
      a => ATTRIBUTE_ADVANTAGE[a].includes(attr)
    );
    return { char, attr, strongAgainst, weakAgainst };
  }, [selectedInfoId]);

  const handleConfirm = () => {
    if (!benchedCardId) return;
    const lineup = roster.filter(id => id !== benchedCardId);
    if (lineup.length === BATTLE_SIZE) {
      onConfirm(lineup);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-bg-card rounded-xl p-6 max-w-2xl w-full border border-accent/30 max-h-[90vh] overflow-y-auto"
      >
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-accent mb-1">라인업 선택</h2>
          <p className="text-text-secondary text-sm">
            벤치에 앉힐 카드 1장을 선택하세요 (나머지 {BATTLE_SIZE}장이 출전)
          </p>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2 mb-4">
          {rosterCards.map(({ id, char }) => {
            if (!char) return null;
            const isBenched = benchedCardId === id;
            const isSelected = selectedInfoId === id;
            const attrInfo = ATTRIBUTES[char.attribute];

            return (
              <LineupCard
                key={id}
                cardId={id}
                name={char.name.ko}
                grade={char.grade as LegacyGrade}
                attribute={char.attribute}
                attrIcon={attrInfo.icon}
                isBenched={isBenched}
                isSelected={isSelected}
                onClick={() => setBenchedCardId(isBenched ? null : id)}
                onInfoClick={() => setSelectedInfoId(isSelected ? null : id)}
              />
            );
          })}
        </div>

        {/* 선택한 카드의 속성 상성 정보 */}
        {selectedAttrInfo && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-bg-secondary/80 border border-accent/20 rounded-lg p-3 mb-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-bold" style={{ color: ATTRIBUTES[selectedAttrInfo.attr].color }}>
                {ATTRIBUTES[selectedAttrInfo.attr].icon} {selectedAttrInfo.char.name.ko}
              </span>
              <span className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: ATTRIBUTES[selectedAttrInfo.attr].color + '30', color: ATTRIBUTES[selectedAttrInfo.attr].color }}>
                {ATTRIBUTES[selectedAttrInfo.attr].ko}
              </span>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <span className="text-[10px] text-green-400 font-semibold block mb-1">유리 (x1.5)</span>
                <div className="flex flex-wrap gap-1">
                  {selectedAttrInfo.strongAgainst.map(a => (
                    <span key={a} className="text-[11px] px-1.5 py-0.5 rounded bg-green-500/15 text-green-300 border border-green-500/30">
                      {ATTRIBUTES[a].icon} {ATTRIBUTES[a].ko}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <span className="text-[10px] text-red-400 font-semibold block mb-1">불리 (x0.7)</span>
                <div className="flex flex-wrap gap-1">
                  {selectedAttrInfo.weakAgainst.map(a => (
                    <span key={a} className="text-[11px] px-1.5 py-0.5 rounded bg-red-500/15 text-red-300 border border-red-500/30">
                      {ATTRIBUTES[a].icon} {ATTRIBUTES[a].ko}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {benchedCardId && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-center"
          >
            <span className="text-red-400 text-sm">
              🪑 <strong>{CHARACTERS_BY_ID[benchedCardId]?.name.ko}</strong> 벤치
            </span>
          </motion.div>
        )}

        <div className="flex gap-3 justify-center">
          <Button onClick={onCancel} variant="ghost">
            취소
          </Button>
          <Button
            onClick={handleConfirm}
            variant="primary"
            disabled={!benchedCardId}
          >
            출전 확정 ({benchedCardId ? BATTLE_SIZE : 0}/{BATTLE_SIZE})
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// 라인업 카드 개별 컴포넌트
interface LineupCardProps {
  cardId: string;
  name: string;
  grade: LegacyGrade;
  attribute: string;
  attrIcon: string;
  isBenched: boolean;
  isSelected: boolean;
  onClick: () => void;
  onInfoClick: () => void;
}

function LineupCard({ cardId, name, grade, attribute, attrIcon, isBenched, isSelected, onClick, onInfoClick }: LineupCardProps) {
  const [imageError, setImageError] = useState(false);
  const attrColor = ATTRIBUTES[attribute as Attribute]?.color;

  const imageUrl = imageError
    ? getPlaceholderImage(name, attribute as Attribute)
    : getCharacterImage(cardId, name, attribute as Attribute);

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        aspect-[3/4] rounded-lg overflow-hidden cursor-pointer transition-all relative
        ${isBenched
          ? 'ring-2 ring-red-500 opacity-40 grayscale'
          : isSelected
            ? 'ring-2 ring-accent border border-accent/50'
            : 'border border-white/20 hover:border-accent/50'
        }
      `}
    >
      <div className="relative h-2/3 bg-black/20" onClick={onClick}>
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-white/5 to-black/20">
            <span className="text-2xl">{attrIcon}</span>
          </div>
        ) : (
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover object-top"
            onError={() => setImageError(true)}
          />
        )}
        {isBenched && (
          <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">
            <span className="text-2xl">🪑</span>
          </div>
        )}
      </div>
      <div className="h-1/3 p-1.5 bg-black/60 flex flex-col justify-center" onClick={onInfoClick}>
        <GradeBadge grade={grade} size="sm" />
        <div className="flex items-center justify-center gap-0.5 mt-0.5">
          <span className="text-[9px]" style={{ color: attrColor }}>{attrIcon}</span>
          <span className="text-[10px] font-bold truncate">{name}</span>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * AI 라인업 자동 선택 (7장 중 6장)
 * 가장 약한 카드를 벤치에 앉힘
 */
export function aiSelectLineup(roster: string[]): string[] {
  if (roster.length <= BATTLE_SIZE) return roster;

  // 카드별 간단한 전투력 계산
  const cardPowers = roster.map(id => {
    const char = CHARACTERS_BY_ID[id];
    if (!char) return { id, power: 0 };
    const power = char.baseStats.atk + char.baseStats.def + char.baseStats.spd +
      char.baseStats.ce + char.baseStats.hp;
    return { id, power };
  });

  // 전투력 오름차순 정렬 → 가장 약한 카드를 벤치
  cardPowers.sort((a, b) => a.power - b.power);
  const benchedId = cardPowers[0].id;

  return roster.filter(id => id !== benchedId);
}
