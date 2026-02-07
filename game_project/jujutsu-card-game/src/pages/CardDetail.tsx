// ========================================
// 카드 상세 화면 - 정보/시즌 성적/기록 탭
// ========================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useShallow } from 'zustand/shallow';
import { usePlayerStore } from '../stores/playerStore';
import { useSeasonStore } from '../stores/seasonStore';
import { useCardRecordStore } from '../stores/cardRecordStore';
import { CHARACTERS_BY_ID } from '../data/characters';
import { ITEMS_BY_ID, ALL_ITEMS } from '../data/items';
import { ARENAS_BY_ID } from '../data/arenas';
import { EXP_TABLE, STAT_ICONS } from '../data/constants';
import { getLevelProgress, getExpToNextLevel } from '../utils/battleCalculator';
import { Button } from '../components/UI/Button';
import { GradeBadge, AttributeBadge, RarityBadge } from '../components/UI/Badge';
import { StatBar } from '../components/UI/StatBar';
import { RadarChart } from '../components/UI/RadarChart';
import { getCharacterImage, getPlaceholderImage } from '../utils/imageHelper';
import { ATTRIBUTES } from '../data/constants';
import type { Item, Award, CharacterCard, PlayerCard, CardSeasonRecord, CardRecord, FormState } from '../types';
import { AWARD_CONFIG } from '../types';
import { FORM_CONFIG } from '../data/growthSystem';
import { IndividualLeagueRecordTab } from '../components/Card/IndividualLeagueRecordTab';

interface CardDetailProps {
  cardId: string;
  onBack: () => void;
}

type MainTab = 'info' | 'seasonStats' | 'individualLeague' | 'record';
type RecordTab = 'career' | number; // 'career' for 통산, number for season

export function CardDetail({ cardId, onBack }: CardDetailProps) {
  const { player, equipItem, unequipItem } = usePlayerStore(useShallow(state => ({
    player: state.player,
    equipItem: state.equipItem,
    unequipItem: state.unequipItem
  })));
  const { seasonHistory, currentSeason } = useSeasonStore(useShallow(state => ({
    seasonHistory: state.seasonHistory,
    currentSeason: state.currentSeason
  })));
  const { getCardRecord, getCareerStats, getSeasonStats, getCardAwards } = useCardRecordStore(useShallow(state => ({
    getCardRecord: state.getCardRecord,
    getCareerStats: state.getCareerStats,
    getSeasonStats: state.getSeasonStats,
    getCardAwards: state.getCardAwards
  })));

  const [mainTab, setMainTab] = useState<MainTab>('info');
  const [recordTab, setRecordTab] = useState<RecordTab>('career');
  const [selectedSlot, setSelectedSlot] = useState<0 | 1 | null>(null);

  const playerCard = player.ownedCards[cardId];
  const character = CHARACTERS_BY_ID[cardId];
  const cardRecord = getCardRecord(cardId);
  const awards = getCardAwards(cardId);

  // 시즌 탭 목록
  const seasonTabs = useMemo(() => {
    const tabs: { id: RecordTab; label: string }[] = [
      { id: 'career', label: '통산 기록' }
    ];

    // 현재 시즌
    if (currentSeason) {
      tabs.push({ id: currentSeason.number, label: `시즌${currentSeason.number}` });
    }

    // 지난 시즌들
    for (const history of [...seasonHistory].reverse()) {
      if (!tabs.find(t => t.id === history.seasonNumber)) {
        tabs.push({ id: history.seasonNumber, label: `시즌${history.seasonNumber}` });
      }
    }

    return tabs;
  }, [currentSeason, seasonHistory]);

  if (!playerCard || !character) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="text-text-secondary">카드를 찾을 수 없습니다</div>
      </div>
    );
  }

  const levelProgress = getLevelProgress(playerCard.exp, playerCard.level);
  const expToNext = getExpToNextLevel(playerCard.exp, playerCard.level);
  const maxExp = playerCard.level < 10 ? EXP_TABLE[playerCard.level] : playerCard.exp;

  // 레벨업 보너스가 적용된 스탯
  const levelBonus = (playerCard.level - 1) * 2;
  const enhancedStats = {
    ...character.baseStats,
    [character.growthStats.primary]: character.baseStats[character.growthStats.primary] + levelBonus,
    [character.growthStats.secondary]: character.baseStats[character.growthStats.secondary] + levelBonus
  };

  // 장비 보너스 계산 (8스탯 지원)
  const equipmentBonus = { atk: 0, def: 0, spd: 0, ce: 0, hp: 0, crt: 0, tec: 0, mnt: 0 };
  for (const equipId of playerCard.equipment) {
    if (equipId) {
      const item = ITEMS_BY_ID[equipId];
      if (item) {
        for (const [stat, value] of Object.entries(item.statBonus)) {
          if (stat in equipmentBonus && value !== undefined) {
            equipmentBonus[stat as keyof typeof equipmentBonus] += value;
          }
        }
      }
    }
  }

  // 폼/컨디션 정보
  const formState = playerCard.currentForm || 'STABLE';
  const currentCondition = typeof playerCard.condition === 'object'
    ? playerCard.condition.value
    : (playerCard.condition ?? 75);
  const formConfig = FORM_CONFIG[formState as FormState];

  // 장착 가능한 아이템 필터링
  const availableItems = ALL_ITEMS.filter(item => {
    if (playerCard.equipment.includes(item.id)) return false;
    return player.unlockedItems.includes(item.id);
  });

  const handleEquip = (item: Item) => {
    if (selectedSlot !== null) {
      equipItem(cardId, item.id, selectedSlot);
      setSelectedSlot(null);
    }
  };

  const handleUnequip = (slot: 0 | 1) => {
    unequipItem(cardId, slot);
  };

  // 현재 선택된 탭의 기록 가져오기
  const currentStats = recordTab === 'career'
    ? getCareerStats(cardId)
    : getSeasonStats(cardId, recordTab);

  const currentSeasonRecord = recordTab !== 'career'
    ? cardRecord?.seasonRecords[recordTab] ?? null
    : null;

  return (
    <div className="min-h-screen p-4">
      {/* 헤더 */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← 뒤로
          </Button>
          <h1 className="text-xl font-bold text-text-primary">{character.name.ko}</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* 수상 이력 */}
      {awards.length > 0 && (
        <div className="max-w-4xl mx-auto mb-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {awards.map((award, idx) => (
              <div
                key={idx}
                className="px-3 py-1 bg-yellow-500/20 rounded-full text-sm flex items-center gap-1"
              >
                <span>{AWARD_CONFIG[award.type].icon}</span>
                <span>시즌{award.seasonNumber} {AWARD_CONFIG[award.type].name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 메인 탭 */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setMainTab('info')}
            className={`flex-1 py-3 text-center font-bold transition-colors ${
              mainTab === 'info'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            📋 정보
          </button>
          <button
            onClick={() => setMainTab('seasonStats')}
            className={`flex-1 py-3 text-center font-bold transition-colors ${
              mainTab === 'seasonStats'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            🏆 팀리그 성적
          </button>
          <button
            onClick={() => setMainTab('individualLeague')}
            className={`flex-1 py-3 text-center font-bold transition-colors ${
              mainTab === 'individualLeague'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            👤 개인리그 성적
          </button>
          <button
            onClick={() => setMainTab('record')}
            className={`flex-1 py-3 text-center font-bold transition-colors ${
              mainTab === 'record'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            📜 기록
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mainTab === 'info' && (
          <motion.div
            key="info"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <InfoTab
              character={character}
              playerCard={playerCard}
              enhancedStats={enhancedStats}
              equipmentBonus={equipmentBonus}
              levelProgress={levelProgress}
              expToNext={expToNext}
              maxExp={maxExp}
              selectedSlot={selectedSlot}
              setSelectedSlot={setSelectedSlot}
              availableItems={availableItems}
              handleEquip={handleEquip}
              handleUnequip={handleUnequip}
              currentForm={formState}
              currentCondition={currentCondition}
              formConfig={formConfig}
            />
          </motion.div>
        )}
        {mainTab === 'seasonStats' && (
          <motion.div
            key="seasonStats"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <SeasonStatsTab
              character={character}
              playerCard={playerCard}
              cardRecord={cardRecord}
              currentSeason={currentSeason}
              seasonHistory={seasonHistory}
              awards={awards}
            />
          </motion.div>
        )}
        {mainTab === 'individualLeague' && (
          <motion.div
            key="individualLeague"
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <IndividualLeagueRecordTab cardId={cardId} />
          </motion.div>
        )}
        {mainTab === 'record' && (
          <motion.div
            key="record"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <RecordTab
              cardId={cardId}
              seasonTabs={seasonTabs}
              recordTab={recordTab}
              setRecordTab={setRecordTab}
              currentStats={currentStats}
              currentSeasonRecord={currentSeasonRecord}
              awards={awards}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// 정보 탭 컴포넌트
function InfoTab({
  character,
  playerCard,
  enhancedStats,
  equipmentBonus,
  levelProgress,
  expToNext,
  maxExp,
  selectedSlot,
  setSelectedSlot,
  availableItems,
  handleEquip,
  handleUnequip,
  currentForm: _currentForm,
  currentCondition,
  formConfig
}: {
  character: CharacterCard;
  playerCard: PlayerCard;
  enhancedStats: Record<string, number>;
  equipmentBonus: Record<string, number>;
  levelProgress: number;
  expToNext: number;
  maxExp: number;
  selectedSlot: 0 | 1 | null;
  setSelectedSlot: (slot: 0 | 1 | null) => void;
  availableItems: Item[];
  handleEquip: (item: Item) => void;
  handleUnequip: (slot: 0 | 1) => void;
  currentForm: string;
  currentCondition: number;
  formConfig: { statBonus: number; expBonus: number; icon: string; name: string; color: string };
}) {
  const [imageError, setImageError] = useState(false);

  if (!character || !playerCard) return null;

  const attrInfo = ATTRIBUTES[character.attribute];
  const imageUrl = imageError
    ? getPlaceholderImage(character.name.ko, character.attribute)
    : getCharacterImage(character.id, character.name.ko, character.attribute);

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 카드 이미지 & 기본 정보 */}
      <div className="bg-bg-card rounded-xl p-6 border border-white/10">
        <div className={`
          relative w-full aspect-[3/4] rounded-xl overflow-hidden mb-4
          bg-gradient-to-br
          ${character.grade === '특급' ? 'from-grade-s/30 to-grade-s/10' : ''}
          ${character.grade === '1급' ? 'from-grade-a/30 to-grade-a/10' : ''}
          ${character.grade === '준1급' ? 'from-grade-b/30 to-grade-b/10' : ''}
          ${character.grade === '2급' ? 'from-grade-c/30 to-grade-c/10' : ''}
        `}>
          {/* 캐릭터 이미지 */}
          {imageError ? (
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{ backgroundColor: `${attrInfo.color}30` }}
            >
              <span className="text-8xl">{attrInfo.icon}</span>
            </div>
          ) : (
            <img
              src={imageUrl}
              alt={character.name.ko}
              className="absolute inset-0 w-full h-full object-cover object-top"
              onError={() => setImageError(true)}
            />
          )}
          <div className="absolute top-4 left-4 flex gap-2 z-10">
            <GradeBadge grade={character.grade} />
            <AttributeBadge attribute={character.attribute} />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-10">
            <div className="text-lg font-bold">{character.name.ko}</div>
            <div className="text-sm text-text-secondary">{character.name.en}</div>
          </div>
          <div className="absolute top-4 right-4 bg-accent px-3 py-1 rounded-full text-sm font-bold z-10">
            Lv.{playerCard.level}
          </div>
        </div>

        {/* 경험치 바 */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-text-secondary">경험치</span>
            <span>
              {playerCard.exp} / {maxExp}
              {expToNext > 0 && <span className="text-text-secondary"> (다음 레벨까지 {expToNext})</span>}
            </span>
          </div>
          <div className="h-3 bg-bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${levelProgress}%` }}
              className="h-full bg-gradient-to-r from-accent to-accent/70"
            />
          </div>
        </div>

        {/* 패시브 스킬 정보 */}
        <div className="bg-bg-secondary/50 rounded-lg p-4 mb-4">
          <div className="text-sm text-text-secondary mb-1">💫 패시브 스킬</div>
          <div className="font-bold text-accent">{character.skill.name}</div>
          <div className="text-sm text-text-secondary mt-1">{character.skill.description}</div>
        </div>

        {/* 필살기 (영역전개) 정보 */}
        {character.ultimateSkill && (
          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xl">⚡</span>
              <span className="text-sm text-purple-400 font-bold">필살기</span>
            </div>
            <div className="font-bold text-lg text-text-primary mb-1">
              {character.ultimateSkill.name}
            </div>
            <div className="text-sm text-text-secondary mb-3">
              {character.ultimateSkill.description}
            </div>

            {/* 필살기 스탯 */}
            <div className="grid grid-cols-2 gap-3">
              {character.ultimateSkill.damage !== undefined && (
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-xl mb-1">💥</div>
                  <div className="font-bold text-lose">{character.ultimateSkill.damage}</div>
                  <div className="text-xs text-text-secondary">데미지</div>
                </div>
              )}
              {character.ultimateSkill.ceCost !== undefined && (
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-xl mb-1">🔮</div>
                  <div className="font-bold text-purple-400">{character.ultimateSkill.ceCost}</div>
                  <div className="text-xs text-text-secondary">CE 소모</div>
                </div>
              )}
              <div className="bg-black/30 rounded-lg p-3 text-center">
                <div className="text-xl mb-1">⚡</div>
                <div className="font-bold text-yellow-400">{character.ultimateSkill.gaugeRequired}</div>
                <div className="text-xs text-text-secondary">필요 게이지</div>
              </div>
              {character.ultimateSkill.effects && character.ultimateSkill.effects.length > 0 && (
                <div className="bg-black/30 rounded-lg p-3 text-center">
                  <div className="text-xl mb-1">✨</div>
                  <div className="font-bold text-accent">{character.ultimateSkill.effects.length}개</div>
                  <div className="text-xs text-text-secondary">추가 효과</div>
                </div>
              )}
            </div>

            {/* 추가 효과 목록 */}
            {character.ultimateSkill.effects && character.ultimateSkill.effects.length > 0 && (
              <div className="mt-3 pt-3 border-t border-purple-500/20">
                <div className="text-xs text-text-secondary mb-2">추가 효과</div>
                <div className="flex flex-wrap gap-2">
                  {character.ultimateSkill.effects.map((effect, idx) => {
                    const effectLabel = (() => {
                      const val = typeof effect.value === 'number' ? effect.value : effect.value?.min;
                      switch (effect.type) {
                        case 'STATUS': return `상태이상 부여`;
                        case 'LIFESTEAL': return `HP ${val}% 흡수`;
                        case 'IGNORE_DEF': return `방어력 ${val}% 무시`;
                        case 'CE_DRAIN': return `CE ${val} 흡수`;
                        case 'CRITICAL_GUARANTEED': return '크리티컬 확정';
                        case 'MULTI_HIT': return `${val}회 다중 공격`;
                        case 'RANDOM_DAMAGE': return '랜덤 데미지';
                        case 'SELF_DAMAGE': return `자해 ${val} 데미지`;
                        case 'HEAL_SELF': return `HP ${val} 회복`;
                        case 'REMOVE_DEBUFF': return '디버프 제거';
                        default: return effect.type;
                      }
                    })();
                    return (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                      >
                        {effectLabel}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 폼 & 컨디션 & 스탯 & 장비 */}
      <div className="space-y-4">
        {/* 폼 & 컨디션 */}
        <div className="bg-bg-card rounded-xl p-4 border border-white/10">
          <div className="grid grid-cols-2 gap-4">
            {/* 폼 */}
            <div className="text-center p-3 rounded-lg" style={{ backgroundColor: `${formConfig.color}20` }}>
              <div className="text-2xl mb-1">{formConfig.icon}</div>
              <div className="font-bold" style={{ color: formConfig.color }}>{formConfig.name}</div>
              <div className="text-xs text-text-secondary mt-1">
                {formConfig.statBonus > 0 ? `스탯 +${Math.round(formConfig.statBonus * 100)}%` :
                 formConfig.statBonus < 0 ? `스탯 ${Math.round(formConfig.statBonus * 100)}%` : '스탯 보정 없음'}
              </div>
            </div>
            {/* 컨디션 */}
            <div className="text-center p-3 rounded-lg bg-bg-secondary/50">
              <div className="text-2xl mb-1">💪</div>
              <div className="font-bold text-text-primary">{currentCondition}%</div>
              <div className="text-xs text-text-secondary mt-1">컨디션</div>
              <div className="mt-2 h-2 bg-bg-primary rounded-full overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${currentCondition}%`,
                    backgroundColor: currentCondition >= 80 ? '#22C55E' :
                                    currentCondition >= 60 ? '#EAB308' :
                                    currentCondition >= 40 ? '#F97316' : '#EF4444'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 스탯 (8스탯 전체) */}
        <div className="bg-bg-card rounded-xl p-6 border border-white/10">
          <h3 className="font-bold mb-4">스탯</h3>

          {/* RadarChart로 8스탯 시각화 (한글 라벨 + 총합) */}
          <div className="flex justify-center mb-6">
            <RadarChart
              stats={character.baseStats}
              size="lg"
              showLabels={true}
              showValues={true}
              showTotal={true}
              fillColor={`${attrInfo.color}40`}
              strokeColor={attrInfo.color}
            />
          </div>

          {/* 스탯 상세 리스트 (한글) */}
          <div className="space-y-3">
            {([
              { key: 'atk', name: '공격' },
              { key: 'def', name: '방어' },
              { key: 'spd', name: '속도' },
              { key: 'ce', name: '주력' },
              { key: 'hp', name: '체력' },
              { key: 'crt', name: '치명' },
              { key: 'tec', name: '기술' },
              { key: 'mnt', name: '정신' }
            ] as const).map(({ key: stat, name }) => {
              const base = (character.baseStats as unknown as Record<string, number>)[stat] ?? 0;
              const enhanced = (enhancedStats as unknown as Record<string, number>)[stat] ?? base;
              const bonus = (equipmentBonus as unknown as Record<string, number>)[stat] ?? 0;
              const total = enhanced + bonus;
              const isPrimary = character.growthStats.primary === stat;
              const isSecondary = character.growthStats.secondary === stat;

              return (
                <div key={stat} className="flex items-center gap-3">
                  <span className="w-8 text-lg">{STAT_ICONS[stat]}</span>
                  <span className="w-12 text-sm text-text-secondary">{name}</span>
                  <div className="flex-1">
                    <StatBar stat={stat} value={total} maxValue={50} showLabel={false} showIcon={false} />
                  </div>
                  <div className="w-24 text-right text-sm">
                    <span className="font-bold">{total}</span>
                    {(enhanced > base || bonus > 0) && (
                      <span className="text-win ml-1">
                        (+{enhanced - base + bonus})
                      </span>
                    )}
                  </div>
                  {(isPrimary || isSecondary) && (
                    <span className="text-xs text-accent">
                      {isPrimary ? '★' : '☆'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 장비 슬롯 */}
        <div className="bg-bg-card rounded-xl p-6 border border-white/10">
          <h3 className="font-bold mb-4">장비</h3>
          <div className="grid grid-cols-2 gap-4">
            {[0, 1].map(slot => {
              const equipId = playerCard.equipment[slot as 0 | 1];
              const item = equipId ? ITEMS_BY_ID[equipId] : null;

              return (
                <div
                  key={slot}
                  className={`
                    p-4 rounded-lg border-2 border-dashed cursor-pointer transition-all
                    ${selectedSlot === slot
                      ? 'border-accent bg-accent/10'
                      : item
                        ? 'border-white/20 bg-bg-secondary/50'
                        : 'border-white/10 hover:border-white/30'
                    }
                  `}
                  onClick={() => setSelectedSlot(selectedSlot === slot ? null : slot as 0 | 1)}
                >
                  {item ? (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <RarityBadge rarity={item.rarity} size="sm" />
                        <span className="font-bold text-sm">{item.name.ko}</span>
                      </div>
                      <div className="text-xs text-text-secondary mb-2">
                        {Object.entries(item.statBonus).map(([stat, val]) => (
                          <span key={stat} className="mr-2">{stat.toUpperCase()} +{val}</span>
                        ))}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnequip(slot as 0 | 1);
                        }}
                        className="mt-2 text-xs text-lose hover:underline"
                      >
                        해제
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-2xl text-text-secondary mb-1">+</div>
                      <div className="text-xs text-text-secondary">슬롯 {slot + 1}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <AnimatePresence>
            {selectedSlot !== null && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 overflow-hidden"
              >
                <div className="text-sm text-text-secondary mb-2">
                  장착 가능한 아이템 ({availableItems.length}개)
                </div>
                {availableItems.length === 0 ? (
                  <div className="text-center py-4 text-text-secondary text-sm">
                    해금된 아이템이 없습니다
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {availableItems.map(item => (
                      <button
                        key={item.id}
                        onClick={() => handleEquip(item)}
                        className="w-full p-3 bg-bg-secondary/50 rounded-lg text-left hover:bg-bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <RarityBadge rarity={item.rarity} size="sm" />
                          <span className="font-bold text-sm">{item.name.ko}</span>
                        </div>
                        <div className="text-xs text-text-secondary mt-1">
                          {Object.entries(item.statBonus).map(([stat, val]) => (
                            <span key={stat} className="mr-2">{stat.toUpperCase()} +{val}</span>
                          ))}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// 시즌 성적 탭 컴포넌트
function SeasonStatsTab({
  character,
  playerCard,
  cardRecord,
  currentSeason,
  seasonHistory,
  awards
}: {
  character: CharacterCard;
  playerCard: PlayerCard;
  cardRecord: CardRecord | null;
  currentSeason: { number: number } | null;
  seasonHistory: { seasonNumber: number }[];
  awards: Award[];
}) {
  const [imageError, setImageError] = useState(false);
  const attrInfo = ATTRIBUTES[character.attribute];
  const imageUrl = imageError
    ? getPlaceholderImage(character.name.ko, character.attribute)
    : getCharacterImage(character.id, character.name.ko, character.attribute);

  // 시즌 목록 (현재 + 과거 시즌 역순)
  const seasonNumbers = useMemo(() => {
    const numbers: number[] = [];
    if (currentSeason) numbers.push(currentSeason.number);
    for (const history of [...seasonHistory].reverse()) {
      if (!numbers.includes(history.seasonNumber)) {
        numbers.push(history.seasonNumber);
      }
    }
    return numbers;
  }, [currentSeason, seasonHistory]);

  // 통산 합계 계산
  const careerTotals = useMemo(() => {
    if (!cardRecord) {
      return {
        wins: 0,
        losses: 0,
        totalGames: 0,
        winRate: 0,
        maxWinStreak: 0,
        totalDamageDealt: 0,
        totalDamageReceived: 0,
        mvpCount: 0,
        ultimateHits: 0
      };
    }

    let wins = 0;
    let losses = 0;
    let maxWinStreak = 0;
    let totalDamageDealt = 0;
    let totalDamageReceived = 0;
    let mvpCount = 0;
    let ultimateHits = 0;

    for (const sr of Object.values(cardRecord.seasonRecords)) {
      wins += sr.wins;
      losses += sr.losses;
      if (sr.maxWinStreak > maxWinStreak) {
        maxWinStreak = sr.maxWinStreak;
      }
      totalDamageDealt += sr.totalDamageDealt;
      totalDamageReceived += sr.totalDamageReceived;
      mvpCount += sr.mvpCount;
      ultimateHits += sr.ultimateHits;
    }

    const totalGames = wins + losses;
    return {
      wins,
      losses,
      totalGames,
      winRate: totalGames > 0 ? (wins / totalGames) * 100 : 0,
      maxWinStreak,
      totalDamageDealt,
      totalDamageReceived,
      mvpCount,
      ultimateHits
    };
  }, [cardRecord]);

  // 데이터가 없을 때
  const hasNoData = careerTotals.totalGames === 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 미니 카드 정보 */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/10">
        <div className="flex items-center gap-4">
          {/* 미니 이미지 */}
          <div className={`
            relative w-20 h-24 rounded-lg overflow-hidden flex-shrink-0
            bg-gradient-to-br
            ${character.grade === '특급' ? 'from-grade-s/30 to-grade-s/10' : ''}
            ${character.grade === '1급' ? 'from-grade-a/30 to-grade-a/10' : ''}
            ${character.grade === '준1급' ? 'from-grade-b/30 to-grade-b/10' : ''}
            ${character.grade === '2급' ? 'from-grade-c/30 to-grade-c/10' : ''}
          `}>
            {imageError ? (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ backgroundColor: `${attrInfo.color}30` }}
              >
                <span className="text-3xl">{attrInfo.icon}</span>
              </div>
            ) : (
              <img
                src={imageUrl}
                alt={character.name.ko}
                className="absolute inset-0 w-full h-full object-cover object-top"
                onError={() => setImageError(true)}
              />
            )}
          </div>

          {/* 카드 정보 */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-text-primary">{character.name.ko}</h3>
              <span className="text-sm text-accent font-bold">Lv.{playerCard.level}</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <GradeBadge grade={character.grade} size="sm" />
              <AttributeBadge attribute={character.attribute} size="sm" />
            </div>
            {/* 수상 뱃지 */}
            {awards.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {awards.slice(0, 3).map((award, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-2 py-0.5 bg-yellow-500/20 rounded-full"
                  >
                    {AWARD_CONFIG[award.type].icon} 시즌{award.seasonNumber}
                  </span>
                ))}
                {awards.length > 3 && (
                  <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full">
                    +{awards.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 기록 없음 상태 */}
      {hasNoData ? (
        <div className="bg-bg-card rounded-xl p-8 border border-white/10 text-center">
          <div className="text-4xl mb-4">📊</div>
          <div className="text-text-secondary">
            아직 시즌 성적이 없습니다.
          </div>
          <div className="text-sm text-text-secondary mt-2">
            대전을 통해 기록을 쌓아보세요!
          </div>
        </div>
      ) : (
        <>
          {/* 시즌별 성적 카드 */}
          <div className="space-y-4">
            <h3 className="font-bold text-text-primary px-2">시즌별 성적</h3>
            {seasonNumbers.map(seasonNum => {
              const seasonRecord = cardRecord?.seasonRecords[seasonNum];
              if (!seasonRecord || (seasonRecord.wins === 0 && seasonRecord.losses === 0)) {
                return null;
              }

              const total = seasonRecord.wins + seasonRecord.losses;
              const winRate = total > 0 ? (seasonRecord.wins / total) * 100 : 0;

              return (
                <motion.div
                  key={seasonNum}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-bg-card rounded-xl p-5 border border-white/10"
                >
                  {/* 시즌 헤더 */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-accent">시즌 {seasonNum}</span>
                      {currentSeason?.number === seasonNum && (
                        <span className="text-xs px-2 py-0.5 bg-win/20 text-win rounded-full">
                          진행 중
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {total}전{' '}
                        <span className="text-win">{seasonRecord.wins}승</span>{' '}
                        <span className="text-lose">{seasonRecord.losses}패</span>
                      </div>
                      <div className="text-sm text-text-secondary">승률 {winRate.toFixed(1)}%</div>
                    </div>
                  </div>

                  {/* 확장 스탯 그리드 */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {/* 최대 연승 */}
                    <div className="bg-bg-secondary/50 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">🔥</div>
                      <div className="text-lg font-bold text-text-primary">
                        {seasonRecord.maxWinStreak}연승
                      </div>
                      <div className="text-xs text-text-secondary">최대 연승</div>
                    </div>

                    {/* 입힌 데미지 */}
                    <div className="bg-bg-secondary/50 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">⚔️</div>
                      <div className="text-lg font-bold text-win">
                        {seasonRecord.totalDamageDealt.toLocaleString()}
                      </div>
                      <div className="text-xs text-text-secondary">입힌 데미지</div>
                    </div>

                    {/* 받은 데미지 */}
                    <div className="bg-bg-secondary/50 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">🛡️</div>
                      <div className="text-lg font-bold text-lose">
                        {seasonRecord.totalDamageReceived.toLocaleString()}
                      </div>
                      <div className="text-xs text-text-secondary">받은 데미지</div>
                    </div>

                    {/* MVP 횟수 */}
                    <div className="bg-bg-secondary/50 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">🏆</div>
                      <div className="text-lg font-bold text-yellow-400">
                        {seasonRecord.mvpCount}회
                      </div>
                      <div className="text-xs text-text-secondary">라운드 MVP</div>
                    </div>

                    {/* 스킬 적중 */}
                    <div className="bg-bg-secondary/50 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">💥</div>
                      <div className="text-lg font-bold text-accent">
                        {seasonRecord.ultimateHits}회
                      </div>
                      <div className="text-xs text-text-secondary">스킬 발동</div>
                    </div>

                    {/* 데미지 효율 */}
                    <div className="bg-bg-secondary/50 rounded-lg p-3 text-center">
                      <div className="text-2xl mb-1">📈</div>
                      <div className="text-lg font-bold text-text-primary">
                        {seasonRecord.totalDamageReceived > 0
                          ? (seasonRecord.totalDamageDealt / seasonRecord.totalDamageReceived).toFixed(2)
                          : '-'}
                      </div>
                      <div className="text-xs text-text-secondary">데미지 효율</div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* 통산 합계 */}
          <div className="bg-gradient-to-r from-accent/20 to-purple-500/20 rounded-xl p-5 border border-accent/30">
            <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
              <span className="text-xl">📊</span>
              통산 기록
            </h3>

            {/* 전적 요약 */}
            <div className="text-center mb-4 p-4 bg-black/20 rounded-lg">
              <div className="text-2xl font-bold mb-1">
                {careerTotals.totalGames}전{' '}
                <span className="text-win">{careerTotals.wins}승</span>{' '}
                <span className="text-lose">{careerTotals.losses}패</span>
              </div>
              <div className="text-lg text-text-secondary">
                승률 {careerTotals.winRate.toFixed(1)}%
              </div>
            </div>

            {/* 통산 스탯 그리드 */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-xl mb-1">🔥</div>
                <div className="text-lg font-bold">{careerTotals.maxWinStreak}연승</div>
                <div className="text-xs text-text-secondary">역대 최다 연승</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-xl mb-1">⚔️</div>
                <div className="text-lg font-bold text-win">
                  {careerTotals.totalDamageDealt.toLocaleString()}
                </div>
                <div className="text-xs text-text-secondary">총 입힌 데미지</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-xl mb-1">🛡️</div>
                <div className="text-lg font-bold text-lose">
                  {careerTotals.totalDamageReceived.toLocaleString()}
                </div>
                <div className="text-xs text-text-secondary">총 받은 데미지</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-xl mb-1">🏆</div>
                <div className="text-lg font-bold text-yellow-400">{careerTotals.mvpCount}회</div>
                <div className="text-xs text-text-secondary">총 라운드 MVP</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-xl mb-1">💥</div>
                <div className="text-lg font-bold text-accent">{careerTotals.ultimateHits}회</div>
                <div className="text-xs text-text-secondary">총 스킬 발동</div>
              </div>
              <div className="bg-black/20 rounded-lg p-3 text-center">
                <div className="text-xl mb-1">📈</div>
                <div className="text-lg font-bold">
                  {careerTotals.totalDamageReceived > 0
                    ? (careerTotals.totalDamageDealt / careerTotals.totalDamageReceived).toFixed(2)
                    : '-'}
                </div>
                <div className="text-xs text-text-secondary">통산 데미지 효율</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// 기록 탭 컴포넌트
function RecordTab({
  cardId,
  seasonTabs,
  recordTab,
  setRecordTab,
  currentStats,
  currentSeasonRecord,
  awards
}: {
  cardId: string;
  seasonTabs: { id: 'career' | number; label: string }[];
  recordTab: 'career' | number;
  setRecordTab: (tab: 'career' | number) => void;
  currentStats: { wins: number; losses: number; totalGames: number; winRate: number };
  currentSeasonRecord: CardSeasonRecord | null;
  awards: Award[];
}) {
  // 통산 기록일 때 모든 시즌의 경기장/상대 기록 합산
  const getCardRecord = useCardRecordStore(state => state.getCardRecord);
  const cardRecord = getCardRecord(cardId);

  const aggregatedRecords = useMemo(() => {
    if (recordTab !== 'career' || !cardRecord) {
      return currentSeasonRecord ? {
        arenaRecords: currentSeasonRecord.arenaRecords,
        vsRecords: currentSeasonRecord.vsRecords
      } : null;
    }

    // 통산 기록 - 모든 시즌 합산
    const arenaRecords: Record<string, { wins: number; losses: number }> = {};
    const vsRecords: Record<string, { wins: number; losses: number }> = {};

    for (const seasonRecord of Object.values(cardRecord.seasonRecords)) {
      // 경기장별
      for (const [arenaId, record] of Object.entries(seasonRecord.arenaRecords)) {
        if (!arenaRecords[arenaId]) arenaRecords[arenaId] = { wins: 0, losses: 0 };
        arenaRecords[arenaId].wins += record.wins;
        arenaRecords[arenaId].losses += record.losses;
      }
      // 상대 카드별
      for (const [opponentId, record] of Object.entries(seasonRecord.vsRecords)) {
        if (!vsRecords[opponentId]) vsRecords[opponentId] = { wins: 0, losses: 0 };
        vsRecords[opponentId].wins += record.wins;
        vsRecords[opponentId].losses += record.losses;
      }
    }

    return { arenaRecords, vsRecords };
  }, [recordTab, cardRecord, currentSeasonRecord]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 시즌 서브탭 */}
      <div className="bg-bg-card rounded-xl p-4 border border-white/10">
        <div className="flex flex-wrap gap-2">
          {seasonTabs.map(tab => (
            <button
              key={String(tab.id)}
              onClick={() => setRecordTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                recordTab === tab.id
                  ? 'bg-accent text-white'
                  : 'bg-bg-secondary text-text-secondary hover:text-text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 총 전적 */}
      <div className="bg-bg-card rounded-xl p-6 border border-white/10">
        <h3 className="font-bold mb-4">
          {recordTab === 'career' ? '통산 전적' : `시즌${recordTab} 전적`}
        </h3>

        {currentStats.totalGames === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            기록이 없습니다
          </div>
        ) : (
          <div className="text-center">
            <div className="text-3xl font-bold mb-2">
              {currentStats.totalGames}전{' '}
              <span className="text-win">{currentStats.wins}승</span>{' '}
              <span className="text-lose">{currentStats.losses}패</span>
            </div>
            <div className="text-xl text-text-secondary">
              승률 {currentStats.winRate.toFixed(1)}%
            </div>
          </div>
        )}
      </div>

      {/* 수상 이력 (통산 탭에서만) */}
      {recordTab === 'career' && awards.length > 0 && (
        <div className="bg-bg-card rounded-xl p-6 border border-white/10">
          <h3 className="font-bold mb-4">수상 이력</h3>
          <div className="space-y-2">
            {awards.map((award, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-yellow-500/10 rounded-lg">
                <span className="text-2xl">{AWARD_CONFIG[award.type].icon}</span>
                <div>
                  <div className="font-bold">시즌{award.seasonNumber} {AWARD_CONFIG[award.type].name}</div>
                  <div className="text-sm text-text-secondary">{AWARD_CONFIG[award.type].description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 경기장별 전적 */}
      {aggregatedRecords && Object.keys(aggregatedRecords.arenaRecords).length > 0 && (
        <div className="bg-bg-card rounded-xl p-6 border border-white/10">
          <h3 className="font-bold mb-4">경기장별 전적</h3>
          <div className="space-y-2">
            {Object.entries(aggregatedRecords.arenaRecords)
              .sort((a, b) => (b[1].wins + b[1].losses) - (a[1].wins + a[1].losses))
              .map(([arenaId, record]) => {
                const arena = ARENAS_BY_ID[arenaId];
                const total = record.wins + record.losses;
                const winRate = total > 0 ? (record.wins / total) * 100 : 0;

                return (
                  <div key={arenaId} className="flex items-center justify-between p-3 bg-bg-secondary/50 rounded-lg">
                    <div>
                      <div className="font-medium">{arena?.name.ko || arenaId}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {total}전 <span className="text-win">{record.wins}승</span> <span className="text-lose">{record.losses}패</span>
                      </div>
                      <div className="text-xs text-text-secondary">승률 {winRate.toFixed(0)}%</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* 상대 카드별 전적 */}
      {aggregatedRecords && Object.keys(aggregatedRecords.vsRecords).length > 0 && (
        <div className="bg-bg-card rounded-xl p-6 border border-white/10">
          <h3 className="font-bold mb-4">상대 카드별 전적</h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {Object.entries(aggregatedRecords.vsRecords)
              .sort((a, b) => (b[1].wins + b[1].losses) - (a[1].wins + a[1].losses))
              .map(([opponentId, record]) => {
                const opponent = CHARACTERS_BY_ID[opponentId];
                const total = record.wins + record.losses;
                const winRate = total > 0 ? (record.wins / total) * 100 : 0;

                return (
                  <div key={opponentId} className="flex items-center justify-between p-3 bg-bg-secondary/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <GradeBadge grade={opponent?.grade || '3급'} size="sm" />
                      <div className="font-medium">{opponent?.name.ko || opponentId}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">
                        {total}전 <span className="text-win">{record.wins}승</span> <span className="text-lose">{record.losses}패</span>
                      </div>
                      <div className="text-xs text-text-secondary">승률 {winRate.toFixed(0)}%</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
