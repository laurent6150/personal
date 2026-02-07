// ========================================
// 플레이어 카드 상태 표시 컴포넌트
// ========================================

import type { IndividualLeagueStatus } from '../../types';

interface PlayerCardStatusProps {
  odId: string;
  odName: string;
  status: 'ACTIVE' | 'ELIMINATED';
  currentStage: IndividualLeagueStatus;
  nextMatchInfo: string | null;
  wins: number;
  matchPlayed?: boolean;         // 현재 라운드에서 경기 진행 여부
  matchWon?: boolean | null;     // 현재 라운드 경기 승패 (null = 미진행)
  lastOpponentName?: string | null;  // 마지막 경기 상대 이름
}

export function PlayerCardStatus({
  odName,
  status,
  currentStage,
  nextMatchInfo,
  wins,
  matchPlayed = false,
  matchWon = null,
  lastOpponentName = null,
}: PlayerCardStatusProps) {
  // 단계별 한글명
  const stageNames: Record<IndividualLeagueStatus, string> = {
    'NOT_STARTED': '대기',
    'ROUND_32': '32강 조별리그',
    'ROUND_16': '16강',
    'QUARTER': '8강',
    'SEMI': '4강',
    'FINAL': '결승',
    'FINISHED': '우승'
  };

  // 상태별 스타일
  const getStatusIcon = () => {
    if (status === 'ELIMINATED') return '❌';
    if (currentStage === 'FINISHED') return '🏆';
    if (matchPlayed && matchWon) return '🎉';
    return '✅';
  };

  const getStatusText = () => {
    // 탈락한 경우
    if (status === 'ELIMINATED') {
      if (lastOpponentName) {
        return `${stageNames[currentStage]} 탈락 (vs ${lastOpponentName})`;
      }
      return `${stageNames[currentStage]} 탈락`;
    }

    // 우승한 경우
    if (currentStage === 'FINISHED') {
      return '🏆 우승!';
    }

    // 현재 라운드 경기 결과 반영
    if (matchPlayed) {
      if (matchWon) {
        // 승리한 경우
        const opponentText = lastOpponentName ? ` (vs ${lastOpponentName})` : '';
        return `${stageNames[currentStage]} ${wins}승${opponentText}`;
      } else {
        // 패배했지만 아직 ELIMINATED가 아닌 경우 (16강 조별 등)
        const opponentText = lastOpponentName ? ` (vs ${lastOpponentName})` : '';
        return `${stageNames[currentStage]} 패배${opponentText}`;
      }
    }

    // 아직 경기 안 한 경우
    if (nextMatchInfo) {
      return `${stageNames[currentStage]} 진출 (${nextMatchInfo})`;
    }
    return `${stageNames[currentStage]} 진출 (대기 중)`;
  };

  // 상태에 따른 배경색
  const getBgColor = () => {
    if (status === 'ELIMINATED') return 'bg-red-500/10';
    if (matchPlayed && matchWon) return 'bg-green-500/20';
    if (matchPlayed && !matchWon) return 'bg-yellow-500/10';
    return 'bg-green-500/10';
  };

  // 상태에 따른 텍스트 색상
  const getTextColor = () => {
    if (status === 'ELIMINATED') return 'text-red-400';
    if (matchPlayed && matchWon) return 'text-green-400';
    if (matchPlayed && !matchWon) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg
        ${getBgColor()}
      `}
    >
      <span className="text-lg">{getStatusIcon()}</span>
      <span className={`font-bold flex-1 ${status === 'ELIMINATED' ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
        {odName}
      </span>
      <span className={`text-sm ${getTextColor()}`}>
        - {getStatusText()}
      </span>
      {wins > 0 && !matchPlayed && (
        <span className="text-xs text-yellow-400 ml-2">
          {wins}승
        </span>
      )}
    </div>
  );
}

export default PlayerCardStatus;
