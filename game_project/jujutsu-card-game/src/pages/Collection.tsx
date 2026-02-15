import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePlayerStore } from '../stores/playerStore';
import { CHARACTERS_BY_ID } from '../data/characters';
import { CardDisplay } from '../components/Card/CardDisplay';
import { Button } from '../components/UI/Button';
import { Modal } from '../components/UI/Modal';
import { GradeBadge, AttributeBadge } from '../components/UI/Badge';
import { RadarChart } from '../components/UI/RadarChart';
import { ATTRIBUTES, ATTRIBUTE_ADVANTAGE } from '../data/constants';
import { getCharacterImage, getPlaceholderImage } from '../utils/imageHelper';
import { FORM_CONFIG, getConditionIcon } from '../data/growthSystem';
import type { CharacterCard, Attribute } from '../types';

interface CollectionProps {
  onBack: () => void;
}

export function Collection({ onBack }: CollectionProps) {
  const player = usePlayerStore(state => state.player);
  const [selectedCard, setSelectedCard] = useState<CharacterCard | null>(null);

  // 내 크루 = 내가 보유한 모든 카드 (ownedCards)
  const myCrewCards = Object.keys(player.ownedCards)
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
            {myCrewCards.length}장 보유
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
                    <div className="absolute bottom-1 right-1 bg-black/70 text-accent text-xs font-bold px-1.5 py-0.5 rounded">
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

      {/* 카드 상세 모달 - 8각형 레이더 차트 적용 */}
      <AnimatePresence>
        {selectedCard && (() => {
          const playerCard = player.ownedCards[selectedCard.id];
          const attrInfo = ATTRIBUTES[selectedCard.attribute];
          const level = playerCard?.level ?? 1;

          // 컨디션 및 폼 정보
          const conditionValue = playerCard?.condition
            ? (typeof playerCard.condition === 'object' ? playerCard.condition.value : playerCard.condition)
            : 100;
          const currentForm = playerCard?.currentForm ?? 'STABLE';
          const formConfig = FORM_CONFIG[currentForm];

          // 상성 계산
          const strongAgainst = ATTRIBUTE_ADVANTAGE[selectedCard.attribute] || [];
          const weakAgainst = (Object.keys(ATTRIBUTE_ADVANTAGE) as Attribute[]).filter(
            attr => (ATTRIBUTE_ADVANTAGE[attr] || []).includes(selectedCard.attribute)
          );

          // 총합 계산 (8스탯 대응 - 레거시 5스탯도 지원)
          const stats = selectedCard.baseStats as unknown as Record<string, number>;
          const totalStats = (stats.atk || 0) + (stats.def || 0) + (stats.spd || 0) + (stats.ce || 0) +
                             (stats.hp || 0) + (stats.crt || 0) + (stats.tec || 0) + (stats.mnt || 0);

          // 이미지 URL
          const imageUrl = getCharacterImage(selectedCard.id, selectedCard.name.ko, selectedCard.attribute);

          return (
            <Modal
              isOpen={!!selectedCard}
              onClose={() => setSelectedCard(null)}
              title={selectedCard.name.ko}
            >
              <div className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto">
                {/* 상단: 이미지 + 레이더 차트 */}
                <div className="flex justify-center items-center gap-4">
                  {/* 카드 이미지 */}
                  <div className="relative w-[140px] h-[140px] flex-shrink-0">
                    <div className="absolute top-2 left-2 z-10">
                      <GradeBadge grade={selectedCard.grade} size="sm" />
                    </div>
                    <div className="absolute top-2 right-2 z-10">
                      <span className="text-lg">{formConfig.icon}</span>
                    </div>
                    <img
                      src={imageUrl}
                      alt={selectedCard.name.ko}
                      className="w-full h-full object-cover object-top rounded-xl border-2 border-white/20"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = getPlaceholderImage(selectedCard.name.ko, selectedCard.attribute);
                      }}
                      style={{ backgroundColor: `${attrInfo.color}40` }}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-xs font-bold text-accent">
                      Lv.{level}
                    </div>
                  </div>

                  {/* 8각형 레이더 차트 */}
                  <div className="flex-shrink-0">
                    <RadarChart
                      stats={selectedCard.baseStats}
                      size="md"
                      showLabels={true}
                      showTotal={true}
                      fillColor={`${attrInfo.color}40`}
                      strokeColor={attrInfo.color}
                    />
                  </div>
                </div>

                {/* 기본 정보 */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-xl font-bold text-text-primary">{selectedCard.name.ko}</span>
                    <span className="text-sm text-text-secondary">{selectedCard.name.ja}</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <AttributeBadge attribute={selectedCard.attribute} size="md" />
                    {strongAgainst.length > 0 && (
                      <span className="text-xs text-text-secondary">
                        (강: {strongAgainst.map(a => ATTRIBUTES[a]?.icon).join('')})
                      </span>
                    )}
                    {weakAgainst.length > 0 && (
                      <span className="text-xs text-text-secondary">
                        (약: {weakAgainst.map(a => ATTRIBUTES[a]?.icon).join('')})
                      </span>
                    )}
                  </div>
                </div>

                {/* 컨디션 */}
                <div className="flex items-center gap-3 bg-black/30 rounded-lg p-3">
                  <span className="text-2xl">{getConditionIcon(conditionValue)}</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-text-secondary">컨디션</span>
                      <span className="text-sm font-bold">{conditionValue}%</span>
                    </div>
                    <div className="h-2 bg-black/30 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${conditionValue}%`,
                          backgroundColor: conditionValue >= 90 ? '#22C55E' : conditionValue >= 70 ? '#EAB308' : '#F97316'
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ backgroundColor: `${formConfig.color}20` }}>
                    <span className="text-sm">{formConfig.icon}</span>
                    <span className="text-xs font-bold" style={{ color: formConfig.color }}>{formConfig.name}</span>
                  </div>
                </div>

                {/* 능력치 상세 */}
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-sm text-accent mb-3 border-b border-white/10 pb-2">📊 능력치 상세</div>
                  <div className="grid grid-cols-4 gap-2">
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-[10px] text-red-400">공격</div>
                      <div className="text-lg font-bold text-text-primary">{stats.atk || 0}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-[10px] text-blue-400">방어</div>
                      <div className="text-lg font-bold text-text-primary">{stats.def || 0}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-[10px] text-yellow-400">속도</div>
                      <div className="text-lg font-bold text-text-primary">{stats.spd || 0}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-[10px] text-purple-400">주력</div>
                      <div className="text-lg font-bold text-text-primary">{stats.ce || 0}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-[10px] text-pink-400">체력</div>
                      <div className="text-lg font-bold text-text-primary">{stats.hp || 0}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-[10px] text-rose-400">치명</div>
                      <div className="text-lg font-bold text-text-primary">{stats.crt || 0}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-[10px] text-teal-400">기술</div>
                      <div className="text-lg font-bold text-text-primary">{stats.tec || 0}</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="text-[10px] text-indigo-400">정신</div>
                      <div className="text-lg font-bold text-text-primary">{stats.mnt || 0}</div>
                    </div>
                  </div>
                  <div className="flex justify-between mt-3 pt-3 border-t border-white/10">
                    <span className="text-sm text-text-secondary">총합</span>
                    <span className="text-lg font-bold text-accent">{totalStats}</span>
                  </div>
                </div>

                {/* 기본기 */}
                <div className="bg-black/30 rounded-lg p-4">
                  <div className="text-sm text-accent mb-3 border-b border-white/10 pb-2">⚔️ 기본기</div>
                  <div className="space-y-3">
                    {selectedCard.basicSkills.map(skill => (
                      <div key={skill.id} className="text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold px-2 py-0.5 rounded ${
                            skill.type === 'ATTACK' ? 'bg-red-500/20 text-red-400' :
                            skill.type === 'DEFENSE' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {skill.type === 'ATTACK' ? '공격' : skill.type === 'DEFENSE' ? '방어' : '유틸'}
                          </span>
                          <span className="font-bold text-text-primary">{skill.name}</span>
                        </div>
                        <p className="text-text-secondary mt-1 ml-1">{skill.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 필살기 */}
                <div className="bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-lg p-4 border border-accent/30">
                  <div className="text-sm text-accent mb-2 border-b border-accent/30 pb-2">⚡ 필살기</div>
                  <div className="text-lg font-bold text-accent mb-2">
                    【{selectedCard.ultimateSkill.name}】
                  </div>
                  <p className="text-sm text-text-secondary mb-3">
                    {selectedCard.ultimateSkill.description}
                  </p>
                  <div className="flex gap-4 text-sm">
                    <span className="text-red-400">DMG: {selectedCard.ultimateSkill.damage}</span>
                    <span className="text-purple-400">CE: {selectedCard.ultimateSkill.ceCost}</span>
                  </div>
                  {selectedCard.ultimateSkill.effects && selectedCard.ultimateSkill.effects.length > 0 && (
                    <div className="mt-2 text-xs text-pink-400">
                      효과: {selectedCard.ultimateSkill.effects.map(e => e.type).join(', ')}
                    </div>
                  )}
                </div>

                {/* 닫기 버튼 */}
                <Button onClick={() => setSelectedCard(null)} variant="ghost" className="w-full">
                  닫기
                </Button>
              </div>
            </Modal>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
