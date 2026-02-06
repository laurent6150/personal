// ========================================
// 경기 예고 모달 컴포넌트 (Phase 3 개선)
// 8각형 레이더 차트 + 필살기 표시 + 이미지 확대
// ========================================

import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import type { IndividualMatch, LeagueParticipant, Stats } from '../../types';
import { Button } from '../UI/Button';

interface MatchPreviewModalProps {
  match: IndividualMatch;
  participants: LeagueParticipant[];
  roundName: string;           // "8강 1경기", "결승" 등
  formatText: string;          // "3판 2선승", "5판 3선승"
  arenaName?: string;
  matchContext?: string;       // "승자전", "패자전", "최종전" 등
  matchImplication?: string;   // "승자는 16강 진출 확정!" 등
  onStartMatch: () => void;
  onSkip: () => void;
  onClose: () => void;
}

// 8각형 레이더 차트 컴포넌트
function RadarChart({ stats, color, size = 120 }: { stats: Stats; color: string; size?: number }) {
  const statKeys: (keyof Stats)[] = ['atk', 'def', 'spd', 'hp', 'ce', 'crt', 'tec', 'mnt'];
  const maxStat = 100; // 최대 스탯값 (스케일링용)
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 10;

  // 각 스탯 포인트 계산
  const points = statKeys.map((key, index) => {
    const value = stats[key] || 0;
    const normalizedValue = Math.min(value / maxStat, 1);
    const angle = (Math.PI * 2 * index) / statKeys.length - Math.PI / 2;
    const x = centerX + radius * normalizedValue * Math.cos(angle);
    const y = centerY + radius * normalizedValue * Math.sin(angle);
    return { x, y, value, key };
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
            stroke="rgba(255,255,255,0.1)"
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
            stroke="rgba(255,255,255,0.1)"
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
          r={3}
          fill={color}
        />
      ))}
    </svg>
  );
}

// 스탯 리스트 컴포넌트
function StatList({
  stats,
  opponentStats,
  color: _color
}: {
  stats: Stats;
  opponentStats: Stats;
  color: string;
}) {
  // _color reserved for future stat highlighting
  const statConfig: { key: keyof Stats; label: string; textColor: string }[] = [
    { key: 'atk', label: 'ATK', textColor: 'text-red-400' },
    { key: 'def', label: 'DEF', textColor: 'text-blue-400' },
    { key: 'spd', label: 'SPD', textColor: 'text-yellow-400' },
    { key: 'hp', label: 'HP', textColor: 'text-green-400' },
    { key: 'ce', label: 'CE', textColor: 'text-purple-400' },
    { key: 'crt', label: 'CRT', textColor: 'text-orange-400' },
    { key: 'tec', label: 'TEC', textColor: 'text-cyan-400' },
    { key: 'mnt', label: 'MNT', textColor: 'text-pink-400' },
  ];

  return (
    <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
      {statConfig.map(({ key, label, textColor }) => {
        const value = stats[key] || 0;
        const opponentValue = opponentStats[key] || 0;
        const isHigher = value > opponentValue;

        return (
          <div key={key} className="flex items-center justify-between">
            <span className="text-text-secondary">{label}:</span>
            <span className={textColor}>
              {value}
              {isHigher && <span className="text-yellow-400 ml-1">⬆</span>}
            </span>
          </div>
        );
      })}
    </div>
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
  onStartMatch,
  onSkip,
  onClose
}: MatchPreviewModalProps) {
  const p1 = participants.find(p => p.odId === match.participant1);
  const p2 = participants.find(p => p.odId === match.participant2);
  const card1 = CHARACTERS_BY_ID[match.participant1];
  const card2 = CHARACTERS_BY_ID[match.participant2];

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

  // 총합 계산
  const getTotalStats = (stats: Stats) => {
    return stats.atk + stats.def + stats.spd + stats.hp + stats.ce +
           stats.crt + stats.tec + stats.mnt;
  };

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

              {/* 레이더 차트 */}
              <div className="mb-3">
                <RadarChart stats={stats1} color="#ef4444" size={140} />
              </div>

              {/* 8가지 능력치 */}
              <div className="bg-bg-secondary rounded-lg p-3 text-left">
                <StatList stats={stats1} opponentStats={stats2} color="red" />
                <div className="mt-2 pt-2 border-t border-white/10 text-center">
                  <span className="text-text-secondary text-sm">총합: </span>
                  <span className="text-white font-bold">{getTotalStats(stats1)}</span>
                </div>
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
                <div className="bg-bg-secondary rounded-lg px-4 py-2 text-center">
                  <div className="text-xs text-text-secondary">경기장</div>
                  <div className="text-sm text-accent font-bold">{arenaName}</div>
                </div>
              )}
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

              {/* 레이더 차트 */}
              <div className="mb-3">
                <RadarChart stats={stats2} color="#3b82f6" size={140} />
              </div>

              {/* 8가지 능력치 */}
              <div className="bg-bg-secondary rounded-lg p-3 text-left">
                <StatList stats={stats2} opponentStats={stats1} color="blue" />
                <div className="mt-2 pt-2 border-t border-white/10 text-center">
                  <span className="text-text-secondary text-sm">총합: </span>
                  <span className="text-white font-bold">{getTotalStats(stats2)}</span>
                </div>
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

        {/* 버튼 영역 */}
        <div className="p-4 border-t border-white/10 flex justify-center gap-4">
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
