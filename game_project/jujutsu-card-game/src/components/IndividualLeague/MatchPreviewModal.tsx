// ========================================
// 경기 예고 모달 컴포넌트
// ========================================

import { motion } from 'framer-motion';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import type { IndividualMatch, LeagueParticipant } from '../../types';
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

  const getTotalStats = (card: typeof card1) => {
    if (!card) return 0;
    const stats = card.baseStats;
    return (stats.atk || 0) + (stats.def || 0) + (stats.spd || 0) +
           (stats.hp || 0) + (stats.ce || 0);
  };

  // 스탯 비교 함수
  const compareStats = (stat1: number, stat2: number) => {
    if (stat1 > stat2) return { p1: '⬆', p2: '' };
    if (stat2 > stat1) return { p1: '', p2: '⬆' };
    return { p1: '', p2: '' };
  };

  const atkComparison = compareStats(card1?.baseStats.atk || 0, card2?.baseStats.atk || 0);
  const defComparison = compareStats(card1?.baseStats.def || 0, card2?.baseStats.def || 0);
  const spdComparison = compareStats(card1?.baseStats.spd || 0, card2?.baseStats.spd || 0);
  const hpComparison = compareStats(card1?.baseStats.hp || 0, card2?.baseStats.hp || 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-bg-primary rounded-xl border border-white/20 max-w-4xl w-full overflow-hidden"
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
        <div className="p-6">
          <div className="flex items-stretch justify-between gap-4">

            {/* 왼쪽 선수 (P1) */}
            <div className="flex-1 text-center">
              {/* 이미지 */}
              <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden bg-bg-secondary mb-3 border-2 border-red-500/50">
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

              {/* 스탯 */}
              <div className="bg-bg-secondary rounded-lg p-3 text-left text-sm">
                <div className="grid grid-cols-2 gap-1">
                  <div>ATK: <span className="text-red-400">{card1?.baseStats.atk || 0}</span> <span className="text-yellow-400">{atkComparison.p1}</span></div>
                  <div>DEF: <span className="text-blue-400">{card1?.baseStats.def || 0}</span> <span className="text-yellow-400">{defComparison.p1}</span></div>
                  <div>SPD: <span className="text-yellow-400">{card1?.baseStats.spd || 0}</span> <span className="text-yellow-400">{spdComparison.p1}</span></div>
                  <div>HP: <span className="text-green-400">{card1?.baseStats.hp || 0}</span> <span className="text-yellow-400">{hpComparison.p1}</span></div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/10 text-center">
                  <span className="text-text-secondary">총합: </span>
                  <span className="text-white font-bold">{getTotalStats(card1)}</span>
                </div>
              </div>
            </div>

            {/* 중앙 VS */}
            <div className="flex flex-col items-center justify-center px-4">
              <div className="text-4xl font-bold text-white mb-2">VS</div>
              <div className="text-lg text-text-secondary">0 : 0</div>

              {arenaName && (
                <div className="mt-4 bg-bg-secondary rounded-lg px-4 py-2 text-center">
                  <div className="text-xs text-text-secondary">경기장</div>
                  <div className="text-sm text-accent font-bold">{arenaName}</div>
                </div>
              )}
            </div>

            {/* 오른쪽 선수 (P2) */}
            <div className="flex-1 text-center">
              {/* 이미지 */}
              <div className="w-32 h-32 mx-auto rounded-xl overflow-hidden bg-bg-secondary mb-3 border-2 border-blue-500/50">
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

              {/* 스탯 */}
              <div className="bg-bg-secondary rounded-lg p-3 text-left text-sm">
                <div className="grid grid-cols-2 gap-1">
                  <div>ATK: <span className="text-red-400">{card2?.baseStats.atk || 0}</span> <span className="text-yellow-400">{atkComparison.p2}</span></div>
                  <div>DEF: <span className="text-blue-400">{card2?.baseStats.def || 0}</span> <span className="text-yellow-400">{defComparison.p2}</span></div>
                  <div>SPD: <span className="text-yellow-400">{card2?.baseStats.spd || 0}</span> <span className="text-yellow-400">{spdComparison.p2}</span></div>
                  <div>HP: <span className="text-green-400">{card2?.baseStats.hp || 0}</span> <span className="text-yellow-400">{hpComparison.p2}</span></div>
                </div>
                <div className="mt-2 pt-2 border-t border-white/10 text-center">
                  <span className="text-text-secondary">총합: </span>
                  <span className="text-white font-bold">{getTotalStats(card2)}</span>
                </div>
              </div>
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
