import { motion } from 'framer-motion';
import type { RoundResult as RoundResultType, CharacterCard } from '../../types';
import { CardDisplay } from '../Card/CardDisplay';
import { WinnerBadge } from '../UI/Badge';
import { Button } from '../UI/Button';

interface RoundResultProps {
  result: RoundResultType;
  playerCard: CharacterCard;
  aiCard: CharacterCard;
  onContinue: () => void;
}

export function RoundResult({
  result,
  playerCard,
  aiCard,
  onContinue
}: RoundResultProps) {
  const { calculation, winner } = result;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <div className="bg-bg-secondary rounded-xl p-6 max-w-2xl w-full border border-white/10">
        {/* 라운드 번호 */}
        <h2 className="text-xl font-bold text-center text-text-primary mb-4">
          라운드 {result.roundNumber} 결과
        </h2>

        {/* 카드 대결 */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {/* 플레이어 카드 */}
          <div className="text-center">
            <div className="text-sm text-text-secondary mb-2">당신</div>
            <CardDisplay character={playerCard} size="sm" showStats={false} showSkill={false} />
            <div className="mt-2 text-lg font-mono">
              <span className="text-win">DMG {calculation.playerDamage}</span>
            </div>
            <div className="text-sm text-text-secondary">
              HP {calculation.playerFinalHp}
            </div>
          </div>

          {/* VS */}
          <div className="flex flex-col items-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="text-3xl font-bold text-accent"
            >
              VS
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-4"
            >
              <WinnerBadge winner={winner} />
            </motion.div>
          </div>

          {/* AI 카드 */}
          <div className="text-center">
            <div className="text-sm text-text-secondary mb-2">AI</div>
            <CardDisplay character={aiCard} size="sm" showStats={false} showSkill={false} />
            <div className="mt-2 text-lg font-mono">
              <span className="text-lose">DMG {calculation.aiDamage}</span>
            </div>
            <div className="text-sm text-text-secondary">
              HP {calculation.aiFinalHp}
            </div>
          </div>
        </div>

        {/* 계산 상세 */}
        <div className="bg-black/30 rounded-lg p-4 mb-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-text-secondary mb-1">당신의 계산</div>
              <div className="space-y-1 text-text-primary">
                <div>속성 배율: ×{calculation.attributeMultiplier.player.toFixed(1)}</div>
                <div>CE 배율: ×{calculation.ceMultiplier.player.toFixed(2)}</div>
                <div>경기장 보너스: ×{calculation.arenaBonus.player.toFixed(2)}</div>
                {calculation.skillActivated.player && (
                  <div className="text-accent">스킬 발동!</div>
                )}
              </div>
            </div>
            <div>
              <div className="text-text-secondary mb-1">AI의 계산</div>
              <div className="space-y-1 text-text-primary">
                <div>속성 배율: ×{calculation.attributeMultiplier.ai.toFixed(1)}</div>
                <div>CE 배율: ×{calculation.ceMultiplier.ai.toFixed(2)}</div>
                <div>경기장 보너스: ×{calculation.arenaBonus.ai.toFixed(2)}</div>
                {calculation.skillActivated.ai && (
                  <div className="text-accent">스킬 발동!</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-white/10 text-center">
            {calculation.playerFirst ? (
              <span className="text-win">당신이 선공!</span>
            ) : (
              <span className="text-lose">AI가 선공</span>
            )}
          </div>
        </div>

        {/* 계속 버튼 */}
        <div className="text-center">
          <Button onClick={onContinue} size="lg">
            계속하기
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
