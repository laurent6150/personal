// ========================================
// 카드 공개 상세 패널
// 대결 전 카드 정보를 상세히 표시
// ========================================

import { RadarChart } from '../UI/RadarChart';
import type { CharacterCard, PlayerCard, Arena, Attribute, BaseStats } from '../../types';
import { getEffectiveStats } from '../../utils/battleCalculator';

interface CardRevealPanelProps {
  character: CharacterCard;
  playerOwnedCard?: PlayerCard;  // 플레이어 카드의 레벨/장비 정보
  arena?: Arena | null;
  isPlayer: boolean;
  seasonRecord?: { wins: number; losses: number };
  h2hRecord?: { wins: number; losses: number };
}

// 속성별 색상 및 한글 이름
const ATTRIBUTE_INFO: Record<Attribute, { label: string; color: string; strongAgainst: string; weakAgainst: string }> = {
  'BARRIER': { label: '결계', color: '#3B82F6', strongAgainst: '신체', weakAgainst: '혼백' },
  'BODY': { label: '신체', color: '#F97316', strongAgainst: '저주', weakAgainst: '결계' },
  'CURSE': { label: '저주', color: '#9333EA', strongAgainst: '혼백', weakAgainst: '신체' },
  'SOUL': { label: '혼백', color: '#06B6D4', strongAgainst: '결계', weakAgainst: '저주' },
  'CONVERT': { label: '변환', color: '#14B8A6', strongAgainst: '-', weakAgainst: '-' },
  'RANGE': { label: '원거리', color: '#EC4899', strongAgainst: '-', weakAgainst: '-' },
};

// 총합 계산
function calculateTotalStats(stats: BaseStats): number {
  const s = stats as unknown as Record<string, number>;
  return ['atk', 'def', 'spd', 'ce', 'hp', 'crt', 'tec', 'mnt']
    .reduce((sum, key) => sum + (s[key] ?? 0), 0);
}

// 경기장 적합도 계산 (1~5)
function calculateArenaFit(
  char: CharacterCard,
  arena?: Arena | null
): { stars: number; label: string; reasons: string[] } {
  if (!arena) return { stars: 3, label: '정보 없음', reasons: [] };

  let score = 3; // 기본 보통
  const reasons: string[] = [];

  // 속성 보너스/패널티 체크
  arena.effects.forEach(effect => {
    if (effect.target === char.attribute) {
      if (effect.value > 0) {
        score += 1;
        reasons.push(`✅ ${ATTRIBUTE_INFO[char.attribute]?.label || char.attribute} 속성 버프`);
      } else if (effect.value < 0) {
        score -= 1;
        reasons.push(`❌ ${ATTRIBUTE_INFO[char.attribute]?.label || char.attribute} 속성 너프`);
      }
    }
    if (effect.target === 'ALL') {
      if (effect.value > 0) {
        score += 0.5;
        reasons.push(`⬆️ 전체 ${effect.stat || '스탯'} 상승`);
      } else if (effect.value < 0) {
        score -= 0.5;
        reasons.push(`⬇️ 전체 ${effect.stat || '스탯'} 하락`);
      }
    }
  });

  score = Math.max(1, Math.min(5, Math.round(score)));

  const labels = ['매우 불리', '불리', '보통', '유리', '매우 유리'];

  return {
    stars: score,
    label: labels[score - 1],
    reasons
  };
}

export function CardRevealPanel({
  character,
  playerOwnedCard,
  arena,
  isPlayer,
  seasonRecord = { wins: 0, losses: 0 },
  h2hRecord = { wins: 0, losses: 0 }
}: CardRevealPanelProps) {
  const effectiveStats = getEffectiveStats(character, playerOwnedCard);
  const totalStats = calculateTotalStats(effectiveStats as unknown as BaseStats);
  const arenaFit = calculateArenaFit(character, arena);
  const attrInfo = ATTRIBUTE_INFO[character.attribute];
  const stats = effectiveStats;

  return (
    <div
      className={`w-full max-w-xs bg-black/85 rounded-xl p-4 border-2 ${
        isPlayer ? 'border-green-500/50' : 'border-red-500/50'
      }`}
    >
      {/* 헤더 */}
      <div className="text-center mb-3">
        <span className={`text-sm font-bold ${isPlayer ? 'text-green-400' : 'text-red-400'}`}>
          {isPlayer ? '👤 당신' : '👹 상대'}
        </span>
      </div>

      {/* 카드 이미지 영역 */}
      <div className="relative text-center mb-3">
        <div
          className="w-24 h-24 mx-auto rounded-lg overflow-hidden border-2"
          style={{ borderColor: attrInfo?.color || '#666' }}
        >
          {character.imageUrl ? (
            <img
              src={character.imageUrl}
              alt={character.name.ko}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-4xl"
              style={{ backgroundColor: `${attrInfo?.color || '#666'}30` }}
            >
              {character.attribute === 'BODY' ? '💪' :
               character.attribute === 'CURSE' ? '👁️' :
               character.attribute === 'SOUL' ? '👻' :
               character.attribute === 'BARRIER' ? '🛡️' :
               character.attribute === 'CONVERT' ? '🔄' : '🎯'}
            </div>
          )}
        </div>
        {/* 등급 뱃지 */}
        <div
          className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded text-xs font-bold"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff'
          }}
        >
          {character.grade}
        </div>
      </div>

      {/* 기본 정보 */}
      <div className="text-center mb-3">
        <div className="text-lg font-bold text-white">{character.name.ko}</div>
        <div className="flex justify-center items-center gap-3 text-xs text-gray-400">
          <span>{character.grade}</span>
          <span>총합: <span className="text-white font-bold">{totalStats}</span></span>
        </div>
      </div>

      {/* 8각형 레이더 차트 */}
      <div className="flex justify-center mb-3">
        <RadarChart
          stats={effectiveStats as unknown as BaseStats}
          size="sm"
          showLabels={true}
          showTotal={true}
        />
      </div>

      {/* 스탯 상세 */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1 border-b border-white/10 pb-1">📊 스탯</div>
        <div className="grid grid-cols-4 gap-1 text-[10px]">
          <span className="text-red-400">공격 {stats.atk}</span>
          <span className="text-blue-400">방어 {stats.def}</span>
          <span className="text-yellow-400">속도 {stats.spd}</span>
          <span className="text-purple-400">주력 {stats.ce}</span>
          <span className="text-pink-400">체력 {stats.hp}</span>
          <span className="text-pink-300">치명 {stats.crt ?? 0}</span>
          <span className="text-teal-400">기술 {stats.tec ?? 0}</span>
          <span className="text-indigo-400">정신 {stats.mnt ?? 0}</span>
        </div>
      </div>

      {/* 필살기 */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1 border-b border-white/10 pb-1">⚔️ 필살기</div>
        <div className="text-sm font-bold text-yellow-400 mb-1">
          [{character.ultimateSkill.name}]
        </div>
        <div className="text-[10px] text-gray-400 mb-1 line-clamp-2">
          {character.ultimateSkill.description}
        </div>
        <div className="flex gap-3 text-[10px] text-green-400">
          <span>DMG: {character.ultimateSkill.damage ?? '-'}</span>
          <span>CE: {character.ultimateSkill.ceCost ?? character.ultimateSkill.gaugeRequired}</span>
        </div>
        {character.ultimateSkill.effects && character.ultimateSkill.effects.length > 0 && (
          <div className="text-[10px] text-pink-400 mt-1">
            효과: {character.ultimateSkill.effects.map(e => e.type).join(', ')}
          </div>
        )}
      </div>

      {/* 속성 */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1 border-b border-white/10 pb-1">🎯 속성</div>
        <div className="flex items-center gap-2">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
            style={{ backgroundColor: attrInfo?.color || '#666' }}
          >
            {attrInfo?.label || character.attribute}
          </span>
          <span className="text-[10px] text-gray-400">
            강: <span className="text-green-400">{attrInfo?.strongAgainst}</span>
            {' / '}
            약: <span className="text-red-400">{attrInfo?.weakAgainst}</span>
          </span>
        </div>
      </div>

      {/* 전적 */}
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1 border-b border-white/10 pb-1">📈 전적</div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-400">시즌:</span>
          <span className="font-bold">
            <span className="text-green-400">{seasonRecord.wins}승</span>
            {' '}
            <span className="text-red-400">{seasonRecord.losses}패</span>
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-400">상대전적:</span>
          <span className="font-bold">
            <span className="text-green-400">{h2hRecord.wins}승</span>
            {' '}
            <span className="text-red-400">{h2hRecord.losses}패</span>
          </span>
        </div>
      </div>

      {/* 경기장 적합도 */}
      {arena && (
        <div>
          <div className="text-xs text-gray-500 mb-1 border-b border-white/10 pb-1">🏟️ 경기장 적합도</div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">
              {'⭐'.repeat(arenaFit.stars)}{'☆'.repeat(5 - arenaFit.stars)}
            </span>
            <span className={`text-[10px] ${
              arenaFit.stars >= 4 ? 'text-green-400' :
              arenaFit.stars <= 2 ? 'text-red-400' : 'text-yellow-400'
            }`}>
              ({arenaFit.label})
            </span>
          </div>
          {arenaFit.reasons.length > 0 && (
            <div className="space-y-0.5">
              {arenaFit.reasons.map((reason, idx) => (
                <div key={idx} className="text-[10px] text-green-400">
                  {reason}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CardRevealPanel;
