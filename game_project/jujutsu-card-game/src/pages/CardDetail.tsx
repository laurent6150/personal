// ========================================
// 카드 상세 화면 - 정보/기록 탭
// ========================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { getCharacterImage, getPlaceholderImage } from '../utils/imageHelper';
import { ATTRIBUTES } from '../data/constants';
import type { Item, Award, CharacterCard, PlayerCard, CardSeasonRecord } from '../types';
import { AWARD_CONFIG } from '../types';

interface CardDetailProps {
  cardId: string;
  onBack: () => void;
}

type MainTab = 'info' | 'record';
type RecordTab = 'career' | number; // 'career' for 통산, number for season

export function CardDetail({ cardId, onBack }: CardDetailProps) {
  const { player, equipItem, unequipItem } = usePlayerStore();
  const { seasonHistory, currentSeason } = useSeasonStore();
  const { getCardRecord, getCareerStats, getSeasonStats, getCardAwards } = useCardRecordStore();

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

  // 장비 보너스 계산
  const equipmentBonus = { atk: 0, def: 0, spd: 0, ce: 0, hp: 0 };
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
            정보
          </button>
          <button
            onClick={() => setMainTab('record')}
            className={`flex-1 py-3 text-center font-bold transition-colors ${
              mainTab === 'record'
                ? 'text-accent border-b-2 border-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            기록
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {mainTab === 'info' ? (
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
            />
          </motion.div>
        ) : (
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
  handleUnequip
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

        {/* 스킬 정보 */}
        <div className="bg-bg-secondary/50 rounded-lg p-4">
          <div className="text-sm text-text-secondary mb-1">스킬</div>
          <div className="font-bold text-accent">{character.skill.name}</div>
          <div className="text-sm text-text-secondary mt-1">{character.skill.description}</div>
        </div>
      </div>

      {/* 스탯 & 장비 */}
      <div className="space-y-4">
        {/* 스탯 */}
        <div className="bg-bg-card rounded-xl p-6 border border-white/10">
          <h3 className="font-bold mb-4">스탯</h3>
          <div className="space-y-3">
            {(['atk', 'def', 'spd', 'ce', 'hp'] as const).map(stat => {
              const base = character.baseStats[stat];
              const enhanced = enhancedStats[stat];
              const bonus = equipmentBonus[stat];
              const total = enhanced + bonus;
              const isPrimary = character.growthStats.primary === stat;
              const isSecondary = character.growthStats.secondary === stat;

              return (
                <div key={stat} className="flex items-center gap-3">
                  <span className="w-8 text-lg">{STAT_ICONS[stat]}</span>
                  <span className="w-12 text-sm text-text-secondary uppercase">{stat}</span>
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
  const { getCardRecord } = useCardRecordStore();
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
