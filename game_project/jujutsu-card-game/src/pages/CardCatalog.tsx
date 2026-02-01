// ========================================
// 술사 명부 - 전체 카드 도감
// ========================================

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ALL_CHARACTERS } from '../data/characters';
import { useSeasonStore } from '../stores/seasonStore';
import { usePlayerStore } from '../stores/playerStore';
import { useCardRecordStore } from '../stores/cardRecordStore';
import { PLAYER_CREW_ID } from '../data/aiCrews';
import { Button } from '../components/UI/Button';
import { GradeBadge, AttributeBadge } from '../components/UI/Badge';
import type { Grade, Attribute, CharacterCard } from '../types';

interface CardCatalogProps {
  onBack: () => void;
  onCardSelect: (cardId: string) => void;
}

type SortOption = 'name' | 'grade' | 'level' | 'winRate' | 'wins' | 'atk' | 'def' | 'spd' | 'ce' | 'hp';

const GRADE_OPTIONS: (Grade | 'all')[] = ['all', '특급', '1급', '준1급', '2급', '준2급', '3급'];
const ATTRIBUTE_OPTIONS: (Attribute | 'all')[] = ['all', 'BARRIER', 'BODY', 'CURSE', 'SOUL', 'CONVERT', 'RANGE'];
const SORT_OPTIONS: { id: SortOption; label: string }[] = [
  { id: 'name', label: '이름순' },
  { id: 'grade', label: '등급순' },
  { id: 'level', label: '레벨순' },
  { id: 'winRate', label: '승률순' },
  { id: 'wins', label: '승리수순' },
  { id: 'atk', label: 'ATK순' },
  { id: 'def', label: 'DEF순' },
  { id: 'spd', label: 'SPD순' },
  { id: 'ce', label: 'CE순' },
  { id: 'hp', label: 'HP순' }
];

const ATTRIBUTE_NAMES: Record<Attribute, string> = {
  BARRIER: '결계',
  BODY: '신체',
  CURSE: '저주',
  SOUL: '혼백',
  CONVERT: '변환',
  RANGE: '원거리'
};

const GRADE_ORDER: Record<Grade, number> = {
  '특급': 0,
  '1급': 1,
  '준1급': 2,
  '2급': 3,
  '준2급': 4,
  '3급': 5
};

export function CardCatalog({ onBack, onCardSelect }: CardCatalogProps) {
  const { currentAICrews, playerCrew } = useSeasonStore();
  const { player } = usePlayerStore();
  const { getCareerStats } = useCardRecordStore();

  const [gradeFilter, setGradeFilter] = useState<Grade | 'all'>('all');
  const [attributeFilter, setAttributeFilter] = useState<Attribute | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('grade');
  const [showFilters, setShowFilters] = useState(false);

  // 카드별 소속 크루 매핑
  const cardCrewMap = useMemo(() => {
    const map: Record<string, { crewId: string; crewName: string }> = {};

    // 플레이어 크루
    for (const cardId of playerCrew) {
      map[cardId] = { crewId: PLAYER_CREW_ID, crewName: player.name };
    }

    // AI 크루들
    for (const aiCrew of currentAICrews) {
      for (const cardId of aiCrew.crew) {
        map[cardId] = { crewId: aiCrew.id, crewName: aiCrew.name };
      }
    }

    return map;
  }, [playerCrew, currentAICrews, player.name]);

  // 필터링 및 정렬된 카드 목록
  const filteredCards = useMemo(() => {
    let cards = [...ALL_CHARACTERS];

    // 등급 필터
    if (gradeFilter !== 'all') {
      cards = cards.filter(c => c.grade === gradeFilter);
    }

    // 속성 필터
    if (attributeFilter !== 'all') {
      cards = cards.filter(c => c.attribute === attributeFilter);
    }

    // 정렬
    cards.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.ko.localeCompare(b.name.ko);
        case 'grade':
          return GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade];
        case 'level': {
          const aLevel = player.ownedCards[a.id]?.level || 0;
          const bLevel = player.ownedCards[b.id]?.level || 0;
          return bLevel - aLevel;
        }
        case 'winRate': {
          const aStats = getCareerStats(a.id);
          const bStats = getCareerStats(b.id);
          return bStats.winRate - aStats.winRate;
        }
        case 'wins': {
          const aStats = getCareerStats(a.id);
          const bStats = getCareerStats(b.id);
          return bStats.wins - aStats.wins;
        }
        case 'atk':
          return b.baseStats.atk - a.baseStats.atk;
        case 'def':
          return b.baseStats.def - a.baseStats.def;
        case 'spd':
          return b.baseStats.spd - a.baseStats.spd;
        case 'ce':
          return b.baseStats.ce - a.baseStats.ce;
        case 'hp':
          return b.baseStats.hp - a.baseStats.hp;
        default:
          return 0;
      }
    });

    return cards;
  }, [gradeFilter, attributeFilter, sortBy, player.ownedCards, getCareerStats]);

  return (
    <div className="min-h-screen p-4">
      {/* 헤더 */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <Button onClick={onBack} variant="ghost" size="sm">
            ← 뒤로
          </Button>
          <h1 className="text-2xl font-bold text-accent">술사 명부</h1>
          <div className="w-20" />
        </div>
      </div>

      {/* 필터 토글 */}
      <div className="max-w-6xl mx-auto mb-4">
        <Button
          onClick={() => setShowFilters(!showFilters)}
          variant="secondary"
          size="sm"
        >
          {showFilters ? '필터 숨기기' : '필터 표시'}
        </Button>
      </div>

      {/* 필터 섹션 */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="max-w-6xl mx-auto mb-6 bg-bg-card rounded-xl p-4 border border-white/10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 등급 필터 */}
            <div>
              <div className="text-sm text-text-secondary mb-2">등급</div>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value as Grade | 'all')}
                className="w-full bg-bg-secondary text-text-primary rounded-lg p-2 border border-white/10"
              >
                <option value="all">전체</option>
                {GRADE_OPTIONS.filter(g => g !== 'all').map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>
            </div>

            {/* 속성 필터 */}
            <div>
              <div className="text-sm text-text-secondary mb-2">속성</div>
              <select
                value={attributeFilter}
                onChange={(e) => setAttributeFilter(e.target.value as Attribute | 'all')}
                className="w-full bg-bg-secondary text-text-primary rounded-lg p-2 border border-white/10"
              >
                <option value="all">전체</option>
                {ATTRIBUTE_OPTIONS.filter(a => a !== 'all').map(attr => (
                  <option key={attr} value={attr}>{ATTRIBUTE_NAMES[attr as Attribute]}</option>
                ))}
              </select>
            </div>

            {/* 정렬 */}
            <div>
              <div className="text-sm text-text-secondary mb-2">정렬</div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-bg-secondary text-text-primary rounded-lg p-2 border border-white/10"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* 카드 수 표시 */}
      <div className="max-w-6xl mx-auto mb-4">
        <div className="text-sm text-text-secondary">
          총 {filteredCards.length}명의 술사
        </div>
      </div>

      {/* 카드 그리드 */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredCards.map((card, index) => (
            <CardCatalogItem
              key={card.id}
              card={card}
              crewInfo={cardCrewMap[card.id]}
              playerCard={player.ownedCards[card.id]}
              careerStats={getCareerStats(card.id)}
              onClick={() => onCardSelect(card.id)}
              delay={index * 0.02}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// 카드 카탈로그 아이템
interface CardCatalogItemProps {
  card: CharacterCard;
  crewInfo?: { crewId: string; crewName: string };
  playerCard?: { level: number };
  careerStats: { wins: number; losses: number; winRate: number };
  onClick: () => void;
  delay: number;
}

function CardCatalogItem({ card, crewInfo, playerCard, careerStats, onClick, delay }: CardCatalogItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className="bg-bg-card rounded-xl p-3 border border-white/10 cursor-pointer hover:border-accent/50 transition-all hover:scale-105"
    >
      {/* 카드 이미지 영역 */}
      <div className={`
        relative aspect-[3/4] rounded-lg mb-2 flex items-center justify-center
        bg-gradient-to-br
        ${card.grade === '특급' ? 'from-grade-s/30 to-grade-s/10' : ''}
        ${card.grade === '1급' ? 'from-grade-a/30 to-grade-a/10' : ''}
        ${card.grade === '준1급' ? 'from-grade-b/30 to-grade-b/10' : ''}
        ${card.grade === '2급' ? 'from-grade-c/30 to-grade-c/10' : ''}
        ${card.grade === '준2급' ? 'from-gray-500/30 to-gray-500/10' : ''}
        ${card.grade === '3급' ? 'from-gray-600/30 to-gray-600/10' : ''}
      `}>
        {/* 레벨 배지 */}
        {playerCard && (
          <div className="absolute top-1 right-1 bg-accent text-white text-xs px-1.5 py-0.5 rounded-full font-bold">
            Lv.{playerCard.level}
          </div>
        )}

        {/* 등급 */}
        <div className="absolute top-1 left-1">
          <GradeBadge grade={card.grade} size="sm" />
        </div>

        {/* 캐릭터 이름 (이미지 대신) */}
        <div className="text-3xl">{card.imageUrl || '👤'}</div>
      </div>

      {/* 카드 정보 */}
      <div className="text-center">
        <div className="font-bold text-sm truncate">{card.name.ko}</div>
        <div className="flex justify-center gap-1 mt-1">
          <AttributeBadge attribute={card.attribute} size="sm" />
        </div>

        {/* 전적 (기록이 있을 때만) */}
        {careerStats.wins + careerStats.losses > 0 && (
          <div className="text-xs text-text-secondary mt-1">
            {careerStats.wins}승 {careerStats.losses}패
          </div>
        )}

        {/* 소속 크루 */}
        {crewInfo && (
          <div className="mt-2 text-xs px-2 py-1 bg-accent/20 rounded-full text-accent truncate">
            {crewInfo.crewName}
          </div>
        )}
      </div>
    </motion.div>
  );
}
