// ========================================
// 듀얼토너먼트 흐름도 컴포넌트 (Phase 3)
// ========================================

import { CHARACTERS_BY_ID } from '../../data/characters';
import type { DualTournamentGroup, IndividualMatch } from '../../types';

interface DualTournamentFlowProps {
  group: DualTournamentGroup;
  matches: IndividualMatch[];
  playerCardIds: string[];
}

export function DualTournamentFlow({ matches, playerCardIds }: DualTournamentFlowProps) {
  const getParticipantName = (odId: string | null | undefined) => {
    if (!odId) return '??';
    const card = CHARACTERS_BY_ID[odId];
    return card?.name.ko?.slice(0, 4) || '??';
  };

  const isPlayerCard = (odId: string | null | undefined) => {
    if (!odId) return false;
    return playerCardIds.includes(odId);
  };

  // 경기 인덱스별 매치 (0: 1경기, 1: 2경기, 2: 승자전, 3: 패자전, 4: 최종전)
  const match1 = matches[0]; // 1경기: 1 vs 2
  const match2 = matches[1]; // 2경기: 3 vs 4
  const match3 = matches[2]; // 승자전: 1경기 승자 vs 2경기 승자
  const match4 = matches[3]; // 패자전: 1경기 패자 vs 2경기 패자
  const match5 = matches[4]; // 최종전: 승자전 패자 vs 패자전 승자
  // match6 = matches[5] available if needed

  // 승자/패자 추출
  const winner1 = match1?.winner;
  const loser1 = match1?.winner
    ? (match1.winner === match1.participant1 ? match1.participant2 : match1.participant1)
    : null;

  const winner2 = match2?.winner;
  const loser2 = match2?.winner
    ? (match2.winner === match2.participant1 ? match2.participant2 : match2.participant1)
    : null;

  const winner3 = match3?.winner; // 승자전 승자 = 1위 확정
  const loser3 = match3?.winner
    ? (match3.winner === match3.participant1 ? match3.participant2 : match3.participant1)
    : null;

  const winner4 = match4?.winner; // 패자전 승자 = 최종전 진출

  const winner5 = match5?.winner; // 최종전 승자 = 2위 확정

  // 진행 상태
  const getCurrentMatch = () => {
    if (!match1?.played) return '1경기';
    if (!match2?.played) return '2경기';
    if (!match3?.played) return '승자전';
    if (!match4?.played) return '패자전';
    if (!match5?.played) return '최종전';
    return '완료';
  };

  const currentMatch = getCurrentMatch();

  // 스타일링 헬퍼
  const getNameStyle = (odId: string | null | undefined, isComplete: boolean) => {
    if (!odId) return 'text-text-secondary';
    if (isPlayerCard(odId)) return 'text-yellow-400 font-bold';
    if (isComplete) return 'text-green-400';
    return 'text-text-primary';
  };

  const getLineStyle = (isComplete: boolean, isCurrent: boolean) => {
    if (isComplete) return 'border-green-500';
    if (isCurrent) return 'border-yellow-500 border-dashed animate-pulse';
    return 'border-gray-600 border-dashed';
  };

  return (
    <div className="mt-2 p-3 bg-bg-primary/50 rounded-lg text-xs">
      {/* 흐름도 */}
      <div className="space-y-2">
        {/* 상단: 1경기 → 승자전 → 1위 */}
        <div className="flex items-center gap-1">
          {/* 1경기 */}
          <div className={`
            flex-shrink-0 w-20 text-center p-1 rounded
            ${!match1?.played && currentMatch === '1경기' ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-bg-secondary'}
          `}>
            <div className="text-text-secondary mb-0.5">1경기</div>
            <div className={getNameStyle(match1?.participant1, !!match1?.played)}>
              {getParticipantName(match1?.participant1)}
            </div>
            <div className="text-text-secondary">vs</div>
            <div className={getNameStyle(match1?.participant2, !!match1?.played)}>
              {getParticipantName(match1?.participant2)}
            </div>
            {match1?.played && (
              <div className="text-green-400 mt-0.5">→ {getParticipantName(winner1)}</div>
            )}
          </div>

          {/* 화살표 */}
          <div className={`w-4 border-t-2 ${getLineStyle(!!match1?.played, currentMatch === '1경기')}`}>
            <div className="text-text-secondary text-center text-[10px]">승</div>
          </div>

          {/* 승자전 */}
          <div className={`
            flex-shrink-0 w-24 text-center p-1 rounded
            ${currentMatch === '승자전' ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-bg-secondary'}
          `}>
            <div className="text-accent mb-0.5">승자전</div>
            <div className={getNameStyle(winner1, !!match3?.played)}>
              {winner1 ? getParticipantName(winner1) : '(1경기 승자)'}
            </div>
            <div className="text-text-secondary">vs</div>
            <div className={getNameStyle(winner2, !!match3?.played)}>
              {winner2 ? getParticipantName(winner2) : '(2경기 승자)'}
            </div>
            {match3?.played && (
              <div className="text-green-400 mt-0.5">→ {getParticipantName(winner3)}</div>
            )}
          </div>

          {/* 화살표 */}
          <div className={`w-4 border-t-2 ${getLineStyle(!!match3?.played, currentMatch === '승자전')}`}>
            <div className="text-text-secondary text-center text-[10px]">승</div>
          </div>

          {/* 1위 확정 */}
          <div className={`
            flex-shrink-0 w-16 text-center p-1 rounded
            ${match3?.played ? 'bg-green-500/20 border border-green-500/50' : 'bg-bg-secondary'}
          `}>
            <div className="text-yellow-400 mb-0.5">🥇 1위</div>
            <div className={match3?.played ? 'text-green-400 font-bold' : 'text-text-secondary'}>
              {winner3 ? getParticipantName(winner3) : '??'}
            </div>
          </div>
        </div>

        {/* 중단: 2경기 → 패자전 화살표 & 승자전 패자 내려감 */}
        <div className="flex items-center gap-1 ml-24">
          <div className={`h-4 border-l-2 ${getLineStyle(!!match3?.played, currentMatch === '승자전')}`} />
          <span className="text-text-secondary text-[10px] ml-1">패</span>
        </div>

        {/* 하단: 2경기 → 패자전 → 최종전 → 2위 */}
        <div className="flex items-center gap-1">
          {/* 2경기 */}
          <div className={`
            flex-shrink-0 w-20 text-center p-1 rounded
            ${currentMatch === '2경기' ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-bg-secondary'}
          `}>
            <div className="text-text-secondary mb-0.5">2경기</div>
            <div className={getNameStyle(match2?.participant1, !!match2?.played)}>
              {getParticipantName(match2?.participant1)}
            </div>
            <div className="text-text-secondary">vs</div>
            <div className={getNameStyle(match2?.participant2, !!match2?.played)}>
              {getParticipantName(match2?.participant2)}
            </div>
            {match2?.played && (
              <div className="text-green-400 mt-0.5">→ {getParticipantName(winner2)}</div>
            )}
          </div>

          {/* 화살표 (패자) */}
          <div className={`w-4 border-t-2 ${getLineStyle(!!match2?.played, currentMatch === '2경기')}`}>
            <div className="text-text-secondary text-center text-[10px]">패</div>
          </div>

          {/* 패자전 */}
          <div className={`
            flex-shrink-0 w-24 text-center p-1 rounded
            ${currentMatch === '패자전' ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-bg-secondary'}
          `}>
            <div className="text-red-400 mb-0.5">패자전</div>
            <div className={getNameStyle(loser1, !!match4?.played)}>
              {loser1 ? getParticipantName(loser1) : '(1경기 패자)'}
            </div>
            <div className="text-text-secondary">vs</div>
            <div className={getNameStyle(loser2, !!match4?.played)}>
              {loser2 ? getParticipantName(loser2) : '(2경기 패자)'}
            </div>
            {match4?.played && (
              <div className="text-green-400 mt-0.5">→ {getParticipantName(winner4)}</div>
            )}
          </div>

          {/* 화살표 (승자) */}
          <div className={`w-4 border-t-2 ${getLineStyle(!!match4?.played, currentMatch === '패자전')}`}>
            <div className="text-text-secondary text-center text-[10px]">승</div>
          </div>

          {/* 최종전 */}
          <div className={`
            flex-shrink-0 w-24 text-center p-1 rounded
            ${currentMatch === '최종전' ? 'bg-yellow-500/20 border border-yellow-500/50' : 'bg-bg-secondary'}
          `}>
            <div className="text-purple-400 mb-0.5">최종전</div>
            <div className={getNameStyle(loser3, !!match5?.played)}>
              {loser3 ? getParticipantName(loser3) : '(승자전 패)'}
            </div>
            <div className="text-text-secondary">vs</div>
            <div className={getNameStyle(winner4, !!match5?.played)}>
              {winner4 ? getParticipantName(winner4) : '(패자전 승)'}
            </div>
            {match5?.played && (
              <div className="text-green-400 mt-0.5">→ {getParticipantName(winner5)}</div>
            )}
          </div>

          {/* 화살표 */}
          <div className={`w-4 border-t-2 ${getLineStyle(!!match5?.played, currentMatch === '최종전')}`}>
            <div className="text-text-secondary text-center text-[10px]">승</div>
          </div>

          {/* 2위 확정 */}
          <div className={`
            flex-shrink-0 w-16 text-center p-1 rounded
            ${match5?.played ? 'bg-green-500/20 border border-green-500/50' : 'bg-bg-secondary'}
          `}>
            <div className="text-gray-300 mb-0.5">🥈 2위</div>
            <div className={match5?.played ? 'text-green-400 font-bold' : 'text-text-secondary'}>
              {winner5 ? getParticipantName(winner5) : '??'}
            </div>
          </div>
        </div>

        {/* 현재 진행 상태 */}
        <div className="text-center pt-2 border-t border-white/5">
          <span className="text-text-secondary">● 현재 진행: </span>
          <span className={currentMatch === '완료' ? 'text-green-400' : 'text-yellow-400'}>
            {currentMatch}
          </span>
        </div>
      </div>
    </div>
  );
}

export default DualTournamentFlow;
