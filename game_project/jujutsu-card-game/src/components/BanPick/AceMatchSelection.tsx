// ========================================
// 에이스 결정전 선택 화면
// 2:2 동점 시 에이스 카드를 선택
// 모든 크루 카드 선택 가능 (1~4경기 출전 카드 포함)
// ========================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CharacterCard, Arena, RoundResult } from '../../types';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { ATTRIBUTES } from '../../data/constants';
import { RadarChart } from '../UI/RadarChart';
import { GradeBadge, AttributeBadge } from '../UI/Badge';
import { Button } from '../UI/Button';
import { getCharacterImage, getPlaceholderImage } from '../../utils/imageHelper';
import { analyzeArenaEffects, generateAceTip, getRecommendationBadge } from '../../utils/arenaEffectAnalyzer';

interface AceMatchSelectionProps {
  crewCardIds: string[];
  arena: Arena;
  roundResults: RoundResult[];
  onSelectAce: (cardId: string) => void;
  onCancel?: () => void;
}

export function AceMatchSelection({
  crewCardIds,
  arena,
  roundResults,
  onSelectAce,
  onCancel
}: AceMatchSelectionProps) {
  const [selectedAceId, setSelectedAceId] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const crewCards = crewCardIds
    .map(id => CHARACTERS_BY_ID[id])
    .filter(Boolean) as CharacterCard[];

  // 카드별 이번 시리즈 전적 계산
  const getCardStatus = (cardId: string) => {
    const cardResults = roundResults.filter(r => r.playerCardId === cardId);
    if (cardResults.length === 0) return { text: '미출전', wins: 0, losses: 0 };

    const wins = cardResults.filter(r => r.winner === 'PLAYER').length;
    const losses = cardResults.filter(r => r.winner === 'AI').length;

    return {
      text: `${wins}승 ${losses}패`,
      wins,
      losses
    };
  };

  const selectedCard = selectedAceId ? CHARACTERS_BY_ID[selectedAceId] : null;
  const selectedAnalysis = selectedCard ? analyzeArenaEffects(selectedCard, arena) : null;

  const handleImageError = (cardId: string) => {
    setImageErrors(prev => ({ ...prev, [cardId]: true }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-bg-secondary rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-accent/30"
      >
        {/* 헤더 */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-5xl mb-3"
          >
            ⚔️
          </motion.div>
          <h2 className="text-2xl font-bold text-accent mb-2">에이스 결정전!</h2>
          <div className="text-xl font-bold">
            <span className="text-win">2</span>
            <span className="text-text-secondary"> : </span>
            <span className="text-lose">2</span>
            <span className="text-text-secondary ml-2">동점</span>
          </div>
        </div>

        {/* 경기장 정보 */}
        <div className="bg-black/30 rounded-lg p-4 mb-6">
          <div className="text-center">
            <div className="text-sm text-text-secondary mb-1">5경기 경기장</div>
            <div className="text-lg font-bold text-text-primary">{arena.name.ko}</div>
            <div className="text-sm text-text-secondary mt-1">
              {arena.effects.map((e, i) => (
                <span key={i} className="mr-2">
                  {e.value > 0 ? '📈' : '📉'} {e.stat} {e.value > 0 ? '+' : ''}{e.value}%
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 안내 문구 */}
        <div className="text-center mb-6 text-text-secondary">
          <div className="text-lg mb-1">시리즈의 운명을 결정할 에이스를 선택하세요!</div>
          <div className="text-sm text-yellow-400">
            ※ 1~4경기 출전 카드도 다시 선택 가능합니다
          </div>
        </div>

        {/* 카드 목록 */}
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-6">
          {crewCards.map(card => {
            const status = getCardStatus(card.id);
            const isSelected = selectedAceId === card.id;
            const attrInfo = ATTRIBUTES[card.attribute];
            const analysis = analyzeArenaEffects(card, arena);
            const badge = getRecommendationBadge(analysis.recommendation);
            const hasPlayed = roundResults.some(r => r.playerCardId === card.id);

            const imageUrl = imageErrors[card.id]
              ? getPlaceholderImage(card.name.ko, card.attribute)
              : getCharacterImage(card.id, card.name.ko, card.attribute);

            return (
              <motion.button
                key={card.id}
                onClick={() => setSelectedAceId(card.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  relative rounded-lg overflow-hidden border-2 transition-all
                  ${isSelected
                    ? 'border-accent ring-2 ring-accent/50'
                    : 'border-white/20 hover:border-white/40'
                  }
                `}
              >
                {/* 카드 이미지 */}
                <div
                  className="aspect-[3/4] relative"
                  style={{ backgroundColor: `${attrInfo.color}20` }}
                >
                  {imageErrors[card.id] ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl">{attrInfo.icon}</span>
                    </div>
                  ) : (
                    <img
                      src={imageUrl}
                      alt={card.name.ko}
                      className="w-full h-full object-cover object-top"
                      onError={() => handleImageError(card.id)}
                    />
                  )}

                  {/* 오버레이 정보 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  {/* 상단 배지 */}
                  <div className="absolute top-1 left-1">
                    <GradeBadge grade={card.grade} size="sm" />
                  </div>

                  {/* 추천 배지 */}
                  <div className="absolute top-1 right-1">
                    <span className={`text-xs px-1 py-0.5 rounded ${
                      analysis.recommendation === 'good' ? 'bg-green-500/80 text-white' :
                      analysis.recommendation === 'bad' ? 'bg-red-500/80 text-white' :
                      'bg-gray-500/80 text-white'
                    }`}>
                      {badge.icon}
                    </span>
                  </div>

                  {/* 출전 표시 */}
                  {hasPlayed && (
                    <div className="absolute top-6 right-1 text-[8px] bg-yellow-500/80 text-black px-1 rounded">
                      출전
                    </div>
                  )}

                  {/* 하단 정보 */}
                  <div className="absolute bottom-0 left-0 right-0 p-2">
                    <div className="text-xs font-bold text-white truncate">
                      {card.name.ko}
                    </div>
                    <div className={`text-[10px] ${
                      status.wins > status.losses ? 'text-green-400' :
                      status.losses > status.wins ? 'text-red-400' :
                      'text-text-secondary'
                    }`}>
                      {status.text}
                    </div>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* 선택된 카드 상세 */}
        <AnimatePresence>
          {selectedCard && selectedAnalysis && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-accent/10 border border-accent/30 rounded-lg p-4 mb-6"
            >
              <div className="flex items-center gap-4">
                {/* 레이더 차트 */}
                <div className="flex-shrink-0">
                  <RadarChart
                    stats={selectedCard.baseStats}
                    size="sm"
                    showLabels={true}
                    fillColor={`${ATTRIBUTES[selectedCard.attribute].color}40`}
                    strokeColor={ATTRIBUTES[selectedCard.attribute].color}
                  />
                </div>

                {/* 정보 */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-bold text-lg text-accent">{selectedCard.name.ko}</span>
                    <AttributeBadge attribute={selectedCard.attribute} size="sm" />
                  </div>

                  {/* 경기장 적합도 */}
                  <div className={`text-sm mb-2 ${
                    selectedAnalysis.recommendation === 'good' ? 'text-green-400' :
                    selectedAnalysis.recommendation === 'bad' ? 'text-red-400' :
                    'text-text-secondary'
                  }`}>
                    {selectedAnalysis.recommendation === 'good' && '⭐ 이 경기장에 유리합니다!'}
                    {selectedAnalysis.recommendation === 'bad' && '⚠️ 이 경기장에 불리합니다'}
                    {selectedAnalysis.recommendation === 'neutral' && '➖ 특별한 유불리가 없습니다'}
                  </div>

                  {/* 효과 목록 */}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {selectedAnalysis.positive.map((e, i) => (
                      <span key={`p${i}`} className="bg-green-500/20 text-green-400 px-2 py-0.5 rounded">
                        ✅ {e}
                      </span>
                    ))}
                    {selectedAnalysis.negative.map((e, i) => (
                      <span key={`n${i}`} className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded">
                        ❌ {e}
                      </span>
                    ))}
                  </div>

                  {/* 팁 */}
                  <div className="text-sm text-text-secondary mt-2">
                    💡 {generateAceTip(selectedCard, arena)}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 버튼 */}
        <div className="flex gap-4">
          {onCancel && (
            <Button onClick={onCancel} variant="ghost" className="flex-1">
              취소
            </Button>
          )}
          <Button
            onClick={() => selectedAceId && onSelectAce(selectedAceId)}
            variant="primary"
            disabled={!selectedAceId}
            className="flex-1"
          >
            {selectedCard ? `${selectedCard.name.ko} 에이스 확정` : '에이스를 선택하세요'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default AceMatchSelection;
