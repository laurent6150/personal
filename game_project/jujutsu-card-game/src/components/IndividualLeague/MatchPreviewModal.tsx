// ========================================
// 경기 예고 모달 컴포넌트 (Phase 3 개선)
// 8각형 레이더 차트 + 필살기 표시 + 이미지 확대
// ========================================

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import { ARENA_EFFECTS } from '../../data/arenaEffects';
import type { IndividualMatch, LeagueParticipant, Stats } from '../../types';
import { Button } from '../UI/Button';
import { useCardRecordStore } from '../../stores/cardRecordStore';

// Phase 4 Task 4.9: 상대전적 타입
interface HeadToHeadRecord {
  teamLeague: { wins: number; losses: number };
  individualLeague: { wins: number; losses: number };
  total: { wins: number; losses: number };
}

interface MatchPreviewModalProps {
  match: IndividualMatch;
  participants: LeagueParticipant[];
  roundName: string;           // "8강 1경기", "결승" 등
  formatText: string;          // "3판 2선승", "5판 3선승"
  arenaName?: string;
  matchContext?: string;       // "승자전", "패자전", "최종전" 등
  matchImplication?: string;   // "승자는 16강 진출 확정!" 등
  arenaIds?: string[];         // 다전제 경기장 ID 배열
  onStartMatch: () => void;
  onSkip: () => void;
  onClose: () => void;
}

// Phase 4.2: 스탯별 최대값 상수 (레이더 차트 스케일링용)
const STAT_MAX_VALUES: Record<string, number> = {
  atk: 35,   // 공격력 최대 기준
  def: 35,   // 방어력 최대 기준
  spd: 35,   // 속도 최대 기준
  hp: 120,   // 체력 최대 기준 (HP는 다른 스탯보다 높음)
  ce: 35,    // 주술력 최대 기준
  crt: 25,   // 치명타 최대 기준
  tec: 25,   // 기술 최대 기준
  mnt: 25,   // 정신 최대 기준
};

// 8각형 레이더 차트 컴포넌트 (확대 + 라벨 표시)
// Phase 4.2: 스탯별 최대값 기준으로 수정
function RadarChart({ stats, color, size = 180, showLabels = true }: { stats: Stats; color: string; size?: number; showLabels?: boolean }) {
  const statKeys: (keyof Stats)[] = ['atk', 'def', 'spd', 'hp', 'ce', 'crt', 'tec', 'mnt'];
  const statLabels: Record<string, string> = {
    atk: 'ATK', def: 'DEF', spd: 'SPD', hp: 'HP',
    ce: 'CE', crt: 'CRT', tec: 'TEC', mnt: 'MNT'
  };
  const labelOffset = showLabels ? 28 : 10; // 라벨 공간 확보
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - labelOffset;

  // 각 스탯 포인트 계산 (Phase 4.2: 스탯별 최대값 적용)
  const points = statKeys.map((key, index) => {
    const value = stats[key] || 0;
    const maxStat = STAT_MAX_VALUES[key] || 35;
    const normalizedValue = Math.min(value / maxStat, 1);
    const angle = (Math.PI * 2 * index) / statKeys.length - Math.PI / 2;
    const x = centerX + radius * normalizedValue * Math.cos(angle);
    const y = centerY + radius * normalizedValue * Math.sin(angle);
    // 라벨 위치 (바깥쪽)
    const labelX = centerX + (radius + 18) * Math.cos(angle);
    const labelY = centerY + (radius + 18) * Math.sin(angle);
    return { x, y, value, key, labelX, labelY, angle };
  });

  // 다각형 path 생성
  const polygonPath = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ') + ' Z';

  // 배경 그리드 생성
  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={size} height={size} className="mx-auto">
      {/* 배경 그리드 */}
      {gridLevels.map((level, i) => {
        const gridPoints = statKeys.map((_, index) => {
          const angle = (Math.PI * 2 * index) / statKeys.length - Math.PI / 2;
          const x = centerX + radius * level * Math.cos(angle);
          const y = centerY + radius * level * Math.sin(angle);
          return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ') + ' Z';
        return (
          <path
            key={i}
            d={gridPoints}
            fill="none"
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
        );
      })}

      {/* 축 라인 */}
      {statKeys.map((_, index) => {
        const angle = (Math.PI * 2 * index) / statKeys.length - Math.PI / 2;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return (
          <line
            key={index}
            x1={centerX}
            y1={centerY}
            x2={x}
            y2={y}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth="1"
          />
        );
      })}

      {/* 스탯 영역 */}
      <motion.path
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        d={polygonPath}
        fill={color}
        fillOpacity={0.3}
        stroke={color}
        strokeWidth="2"
      />

      {/* 스탯 포인트 */}
      {points.map((point, i) => (
        <circle
          key={i}
          cx={point.x}
          cy={point.y}
          r={4}
          fill={color}
        />
      ))}

      {/* 라벨 + 수치 표시 */}
      {showLabels && points.map((point, i) => {
        const key = point.key as keyof Stats;
        const label = statLabels[key] || key.toUpperCase();
        const value = point.value;
        // 텍스트 정렬 조정
        let textAnchor: 'start' | 'middle' | 'end' = 'middle';
        if (point.labelX < centerX - 10) textAnchor = 'end';
        else if (point.labelX > centerX + 10) textAnchor = 'start';

        return (
          <g key={i}>
            <text
              x={point.labelX}
              y={point.labelY - 5}
              fill="rgba(255,255,255,0.9)"
              fontSize="9"
              fontWeight="bold"
              textAnchor={textAnchor}
              dominantBaseline="middle"
            >
              {label}
            </text>
            <text
              x={point.labelX}
              y={point.labelY + 7}
              fill={color}
              fontSize="10"
              fontWeight="bold"
              textAnchor={textAnchor}
              dominantBaseline="middle"
            >
              {value}
            </text>
          </g>
        );
      })}

      {/* 중앙 총합 표시 */}
      <text
        x={centerX}
        y={centerY}
        fill="white"
        fontSize="14"
        fontWeight="bold"
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {Object.values(stats).reduce((a, b) => a + (b || 0), 0)}
      </text>
    </svg>
  );
}

export function MatchPreviewModal({
  match,
  participants,
  roundName,
  formatText,
  arenaName,
  matchContext,
  matchImplication,
  arenaIds,
  onStartMatch,
  onSkip,
  onClose
}: MatchPreviewModalProps) {
  const p1 = participants.find(p => p.odId === match.participant1);
  const p2 = participants.find(p => p.odId === match.participant2);
  const card1 = CHARACTERS_BY_ID[match.participant1];
  const card2 = CHARACTERS_BY_ID[match.participant2];

  // Phase 4.3: cardRecordStore에서 상대전적 조회
  const getHeadToHeadRecord = useCardRecordStore(state => state.getHeadToHeadRecord);

  // Phase 4.3: 상대전적 조회 (통합 함수 사용)
  const headToHeadRecord: HeadToHeadRecord = useMemo(() => {
    return getHeadToHeadRecord(match.participant1, match.participant2);
  }, [getHeadToHeadRecord, match.participant1, match.participant2]);

  // 8스탯 가져오기 (마이그레이션된 경우 대비)
  const getFullStats = (card: typeof card1): Stats => {
    if (!card) return { atk: 0, def: 0, spd: 0, hp: 0, ce: 0, crt: 0, tec: 0, mnt: 0 };
    const stats = card.baseStats;
    return {
      atk: stats.atk || 0,
      def: stats.def || 0,
      spd: stats.spd || 0,
      hp: stats.hp || 0,
      ce: stats.ce || 0,
      crt: (stats as Stats).crt || 50,
      tec: (stats as Stats).tec || 50,
      mnt: (stats as Stats).mnt || 50,
    };
  };

  const stats1 = getFullStats(card1);
  const stats2 = getFullStats(card2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 overflow-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-bg-primary rounded-xl border border-white/20 max-w-5xl w-full overflow-hidden max-h-[95vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-red-500/20 via-accent/20 to-blue-500/20 p-4 text-center">
          <div className="text-2xl font-bold text-white mb-1">
            ⚔️ {roundName} {matchContext && `- ${matchContext}`} ⚔️
          </div>
          <div className="text-sm text-text-secondary">
            {formatText}
          </div>
          {matchImplication && (
            <div className="mt-2 text-sm text-yellow-400 bg-yellow-500/10 rounded-lg py-1 px-3 inline-block">
              {matchImplication}
            </div>
          )}
        </div>

        {/* 메인 컨텐츠 */}
        <div className="p-4 md:p-6">
          <div className="flex flex-col lg:flex-row items-stretch justify-between gap-4">

            {/* 왼쪽 선수 (P1) */}
            <div className="flex-1 text-center">
              {/* 이미지 (확대: 120x120 이상) */}
              <div className="w-36 h-36 mx-auto rounded-xl overflow-hidden bg-bg-secondary mb-3 border-2 border-red-500/50">
                {card1 && (
                  <img
                    src={getCharacterImage(card1.id, card1.name.ko, card1.attribute)}
                    alt={card1.name.ko}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* 이름 & 크루 */}
              <div className="mb-3">
                <div className="text-lg font-bold text-white">
                  {p1?.isPlayerCrew && <span className="text-yellow-400">🌟 </span>}
                  {card1?.name.ko || '???'}
                </div>
                <div className="text-sm text-text-secondary">
                  {p1?.crewName || '???'}
                </div>
                <div className="text-xs text-accent">
                  {card1?.grade || '???'}
                </div>
              </div>

              {/* 레이더 차트 (확대 + 라벨 통합) */}
              <div className="mb-3">
                <RadarChart stats={stats1} color="#ef4444" size={200} showLabels={true} />
              </div>

              {/* 필살기 */}
              {card1?.ultimateSkill && (
                <div className="mt-3 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="text-xs text-text-secondary mb-1">필살기</div>
                  <div className="text-sm font-bold text-red-400">
                    🔥 {card1.ultimateSkill.name}
                  </div>
                  <div className="text-xs text-text-secondary mt-1 line-clamp-2">
                    "{card1.ultimateSkill.description}"
                  </div>
                </div>
              )}
            </div>

            {/* 중앙 VS */}
            <div className="flex flex-col items-center justify-center px-4 py-4">
              <div className="text-5xl font-bold text-white mb-4">VS</div>
              <div className="text-lg text-text-secondary mb-4">0 : 0</div>

              {arenaName && (
                <div className="bg-bg-secondary rounded-lg px-4 py-2 text-center mb-4">
                  <div className="text-xs text-text-secondary">경기장</div>
                  <div className="text-sm text-accent font-bold">{arenaName}</div>
                </div>
              )}

              {/* Phase 4.3: 통합 상대전적 표시 (항상 표시) */}
              <div className="bg-bg-secondary/50 rounded-lg p-3 w-full mt-2">
                <div className="text-xs text-text-secondary mb-2">통합 상대전적</div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <div className="text-text-secondary">팀 리그</div>
                    <div className="font-bold">
                      <span className="text-green-400">{headToHeadRecord.teamLeague.wins}</span>
                      <span className="text-text-secondary"> : </span>
                      <span className="text-red-400">{headToHeadRecord.teamLeague.losses}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-text-secondary">개인 리그</div>
                    <div className="font-bold">
                      <span className="text-green-400">{headToHeadRecord.individualLeague.wins}</span>
                      <span className="text-text-secondary"> : </span>
                      <span className="text-red-400">{headToHeadRecord.individualLeague.losses}</span>
                    </div>
                  </div>
                  <div className="bg-accent/20 rounded p-1">
                    <div className="text-accent">통합</div>
                    <div className="font-bold text-base">
                      <span className="text-green-400">{headToHeadRecord.total.wins}</span>
                      <span className="text-text-secondary"> : </span>
                      <span className="text-red-400">{headToHeadRecord.total.losses}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽 선수 (P2) */}
            <div className="flex-1 text-center">
              {/* 이미지 (확대: 120x120 이상) */}
              <div className="w-36 h-36 mx-auto rounded-xl overflow-hidden bg-bg-secondary mb-3 border-2 border-blue-500/50">
                {card2 && (
                  <img
                    src={getCharacterImage(card2.id, card2.name.ko, card2.attribute)}
                    alt={card2.name.ko}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* 이름 & 크루 */}
              <div className="mb-3">
                <div className="text-lg font-bold text-white">
                  {p2?.isPlayerCrew && <span className="text-yellow-400">🌟 </span>}
                  {card2?.name.ko || '???'}
                </div>
                <div className="text-sm text-text-secondary">
                  {p2?.crewName || '???'}
                </div>
                <div className="text-xs text-accent">
                  {card2?.grade || '???'}
                </div>
              </div>

              {/* 레이더 차트 (확대 + 라벨 통합) */}
              <div className="mb-3">
                <RadarChart stats={stats2} color="#3b82f6" size={200} showLabels={true} />
              </div>

              {/* 필살기 */}
              {card2?.ultimateSkill && (
                <div className="mt-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="text-xs text-text-secondary mb-1">필살기</div>
                  <div className="text-sm font-bold text-blue-400">
                    🔥 {card2.ultimateSkill.name}
                  </div>
                  <div className="text-xs text-text-secondary mt-1 line-clamp-2">
                    "{card2.ultimateSkill.description}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 다전제 경기장 미리보기 - VS 섹션 아래, 버튼 위에 배치 */}
        {arenaIds && arenaIds.length > 1 && (
          <div className="px-4 md:px-6 pb-4">
            <div className="bg-gradient-to-r from-purple-500/10 via-accent/10 to-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <h3 className="text-center text-sm font-bold text-purple-300 mb-3">
                경기장 배정
              </h3>
              <div className={`grid gap-3 ${
                arenaIds.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-5'
              }`}>
                {arenaIds.map((arenaId, index) => {
                  const arena = ARENA_EFFECTS[arenaId];
                  if (!arena) return null;

                  // 각 캐릭터에 대한 경기장 효과 계산
                  const p1Attr = card1?.attribute || '';
                  const p2Attr = card2?.attribute || '';
                  const p1Bonus = p1Attr === arena.bonusAttribute ? `+${arena.bonusPercent}%`
                                : p1Attr === arena.penaltyAttribute ? `-${arena.penaltyPercent}%`
                                : '±0%';
                  const p2Bonus = p2Attr === arena.bonusAttribute ? `+${arena.bonusPercent}%`
                                : p2Attr === arena.penaltyAttribute ? `-${arena.penaltyPercent}%`
                                : '±0%';

                  return (
                    <div key={index}
                         className="bg-bg-secondary/50 rounded-lg p-3 text-center border border-white/5">
                      {/* 세트 번호 */}
                      <div className="text-xs text-text-secondary mb-1">
                        세트 {index + 1}
                      </div>

                      {/* 경기장 이름 */}
                      <div className="text-sm font-bold text-white mb-2">
                        {arena.name}
                      </div>

                      {/* 경기장 효과 설명 */}
                      <div className="text-xs text-text-secondary mb-2 line-clamp-2">
                        {arena.description}
                      </div>

                      {/* 각 선수에 대한 효과 */}
                      <div className="flex justify-between text-xs gap-2">
                        <div className={`flex-1 rounded px-2 py-1 ${
                          p1Bonus.startsWith('+') ? 'bg-green-500/10 text-green-400'
                          : p1Bonus.startsWith('-') ? 'bg-red-500/10 text-red-400'
                          : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          <div className="truncate">{card1?.name.ko}</div>
                          <div className="font-bold">{p1Bonus}</div>
                        </div>
                        <div className={`flex-1 rounded px-2 py-1 ${
                          p2Bonus.startsWith('+') ? 'bg-green-500/10 text-green-400'
                          : p2Bonus.startsWith('-') ? 'bg-red-500/10 text-red-400'
                          : 'bg-gray-500/10 text-gray-400'
                        }`}>
                          <div className="truncate">{card2?.name.ko}</div>
                          <div className="font-bold">{p2Bonus}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* 버튼 영역 - Phase 4 Task 4.9: 뒤로가기 버튼 추가 */}
        <div className="p-4 border-t border-white/10 flex justify-center gap-4">
          <Button variant="ghost" onClick={onClose}>
            ← 뒤로가기
          </Button>
          <Button variant="primary" onClick={onStartMatch} className="px-8">
            ⚔️ 경기 시작
          </Button>
          <Button variant="secondary" onClick={onSkip}>
            ⏭️ 스킵
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default MatchPreviewModal;
