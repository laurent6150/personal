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
}

export function PlayerCardStatus({
  odName,
  status,
  currentStage,
  nextMatchInfo,
  wins
}: PlayerCardStatusProps) {
  // 단계별 한글명
  const stageNames: Record<IndividualLeagueStatus, string> = {
    'NOT_STARTED': '대기',
    'ROUND_32': '32강',
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
    return '✅';
  };

  const getStatusText = () => {
    if (status === 'ELIMINATED') {
      return `${stageNames[currentStage]} 탈락`;
    }
    if (currentStage === 'FINISHED') {
      return '우승!';
    }
    if (nextMatchInfo) {
      return `${stageNames[currentStage]} 진출 (${nextMatchInfo})`;
    }
    return `${stageNames[currentStage]} 진출 (대기 중)`;
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-3 py-2 rounded-lg
        ${status === 'ELIMINATED'
          ? 'bg-red-500/10 text-text-secondary'
          : 'bg-green-500/10'
        }
      `}
    >
      <span className="text-lg">{getStatusIcon()}</span>
      <span className={`font-bold flex-1 ${status === 'ELIMINATED' ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
        {odName}
      </span>
      <span className={`text-sm ${status === 'ELIMINATED' ? 'text-red-400' : 'text-green-400'}`}>
        - {getStatusText()}
      </span>
      {wins > 0 && (
        <span className="text-xs text-yellow-400 ml-2">
          {wins}승
        </span>
      )}
    </div>
  );
}

export default PlayerCardStatus;
