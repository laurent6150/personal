// ========================================
// 대전 화면 - MVP v3: 새 레이아웃 + 턴제 전투
// ========================================

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattle } from '../../hooks/useBattle';
import { CardDisplay } from '../Card/CardDisplay';
import { ArenaDisplay } from './ArenaDisplay';
import { TurnBattleModal } from './TurnBattleModal';
import { Button } from '../UI/Button';
import { ExitConfirmModal } from '../UI/ExitConfirmModal';
import { WIN_SCORE } from '../../data/constants';
import { CHARACTERS_BY_ID } from '../../data';
import type { CharacterCard } from '../../types';

interface BattleEndResult {
  won: boolean;
  levelUps?: string[];
  newAchievements?: string[];
  expGained?: Record<string, number>;
}

interface BattleScreenProps {
  onReturnToMenu: () => void;
  onBattleEnd?: (result: BattleEndResult) => void;
  opponentName?: string;
  opponentCrew?: string[];
}

type BattlePhase = 'SELECT' | 'REVEAL' | 'BATTLE' | 'RESULT';

export function BattleScreen({ onReturnToMenu, onBattleEnd, opponentName }: BattleScreenProps) {
  const {
    session,
    isGameOver,
    isPlayerWin,
    currentScore,
    currentRound,
    currentArena,
    selectedCardId,
    selectedCard,
    isAnimating,
    roundResultInfo,
    gameEndResult,
    selectCard,
    executeRound,
    continueGame,
    returnToMenu
  } = useBattle();

  const hasCalledBattleEnd = useRef(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [battlePhase, setBattlePhase] = useState<BattlePhase>('SELECT');
  const [revealedAiCard, setRevealedAiCard] = useState<CharacterCard | null>(null);
  const [revealedPlayerCard, setRevealedPlayerCard] = useState<CharacterCard | null>(null);
  const [showTurnBattle, setShowTurnBattle] = useState(false);

  // 플레이어 전체 크루 (세션에서)
  const playerCrewCards = useMemo(() => {
    if (!session) return [];
    return session.player.crew.map(id => CHARACTERS_BY_ID[id]).filter(Boolean) as CharacterCard[];
  }, [session]);

  // AI 전체 크루 (세션에서)
  const aiCrewCards = useMemo(() => {
    if (!session) return [];
    return session.ai.crew.map(id => CHARACTERS_BY_ID[id]).filter(Boolean) as CharacterCard[];
  }, [session]);

  // 선택된 카드 정보
  const selectedCardData = selectedCardId ? CHARACTERS_BY_ID[selectedCardId] : null;

  // 게임 종료 콜백
  useEffect(() => {
    if (gameEndResult && onBattleEnd && !hasCalledBattleEnd.current) {
      hasCalledBattleEnd.current = true;
      onBattleEnd({
        won: gameEndResult.won,
        levelUps: gameEndResult.levelUps,
        newAchievements: gameEndResult.newAchievements,
        expGained: gameEndResult.expGained
      });
    }
  }, [gameEndResult, onBattleEnd]);

  useEffect(() => {
    if (!isGameOver) {
      hasCalledBattleEnd.current = false;
    }
  }, [isGameOver]);

  // 라운드 결과 처리
  useEffect(() => {
    if (roundResultInfo && battlePhase === 'BATTLE') {
      // 턴제 전투 모달 표시
      setShowTurnBattle(true);
    }
  }, [roundResultInfo, battlePhase]);

  const handleExit = () => {
    setShowExitModal(false);
    if (onBattleEnd) {
      onBattleEnd({ won: false });
    }
    returnToMenu();
    onReturnToMenu();
  };

  const handleReturnToMenuClick = () => {
    returnToMenu();
    onReturnToMenu();
  };

  // 대결 버튼 클릭 → 상대 카드 공개
  const handleRevealOpponent = async () => {
    if (!selectedCardId || !selectedCard) return;

    // 플레이어 카드 저장 (executeRound가 selectedCardId를 클리어하기 전에)
    const playerCard = selectedCard;
    setRevealedPlayerCard(playerCard);

    // 라운드 실행하여 AI 카드 선택
    const result = await executeRound();
    if (result) {
      const aiCard = CHARACTERS_BY_ID[result.aiCardId];
      setRevealedAiCard(aiCard || null);
      setBattlePhase('REVEAL');
    }
  };

  // 전투 시작 버튼 클릭
  const handleStartBattle = () => {
    setBattlePhase('BATTLE');
  };

  // 턴제 전투 완료
  const handleTurnBattleComplete = () => {
    setShowTurnBattle(false);
    setRevealedAiCard(null);
    setRevealedPlayerCard(null);
    setBattlePhase('SELECT');
    continueGame();
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-text-secondary mb-4">세션이 없습니다</div>
          <Button onClick={onReturnToMenu} variant="primary">
            메인 메뉴로
          </Button>
        </div>
      </div>
    );
  }

  // 게임 종료 화면 (전투 모달이 열려있으면 대기)
  // 마지막 라운드 전투 로그를 먼저 보여준 후 게임 종료 화면으로 이동
  if (isGameOver && !showTurnBattle && battlePhase === 'SELECT') {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="bg-bg-secondary rounded-xl p-8 max-w-md w-full text-center border border-white/10 shadow-2xl">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className={`text-6xl mb-4 ${isPlayerWin ? 'text-win' : 'text-lose'}`}
          >
            {isPlayerWin ? '🎉' : '😢'}
          </motion.div>

          <h1 className={`text-3xl font-bold mb-2 ${isPlayerWin ? 'text-win' : 'text-lose'}`}>
            {isPlayerWin ? '승리!' : '패배'}
          </h1>

          <p className="text-text-secondary mb-4">
            최종 스코어: {currentScore.player} - {currentScore.ai}
          </p>

          {gameEndResult?.expGained && Object.keys(gameEndResult.expGained).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/30 rounded-lg p-4 mb-4 text-left"
            >
              <h3 className="text-sm text-text-secondary mb-2">획득 경험치</h3>
              <div className="space-y-1">
                {Object.entries(gameEndResult.expGained).map(([cardId, exp]) => (
                  <div key={cardId} className="flex justify-between text-sm">
                    <span className="truncate">{CHARACTERS_BY_ID[cardId]?.name.ko || cardId}</span>
                    <span className="text-win">+{exp} EXP</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="space-y-3">
            <Button onClick={handleReturnToMenuClick} variant="primary" className="w-full">
              시즌 허브로
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* 모달들 */}
      <ExitConfirmModal
        isOpen={showExitModal}
        onConfirm={handleExit}
        onCancel={() => setShowExitModal(false)}
      />

      {/* 턴제 전투 모달 */}
      <AnimatePresence>
        {showTurnBattle && roundResultInfo && (
          <TurnBattleModal
            playerCard={CHARACTERS_BY_ID[roundResultInfo.playerCardId]!}
            aiCard={CHARACTERS_BY_ID[roundResultInfo.aiCardId]!}
            result={roundResultInfo}
            arena={currentArena}
            onComplete={handleTurnBattleComplete}
          />
        )}
      </AnimatePresence>

      {/* 상대 카드 공개 모달 */}
      <AnimatePresence>
        {battlePhase === 'REVEAL' && revealedAiCard && revealedPlayerCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="text-center"
            >
              <div className="text-2xl text-text-secondary mb-6">상대가 카드를 공개합니다!</div>

              <div className="flex items-center justify-center gap-8 mb-8">
                {/* 내 카드 */}
                <div className="text-center">
                  <div className="text-sm text-text-secondary mb-2">당신</div>
                  <CardDisplay character={revealedPlayerCard} size="lg" isSelected />
                  <div className="mt-2 text-sm">
                    <span className={`px-2 py-1 rounded ${
                      revealedPlayerCard.attribute === revealedAiCard.attribute ? 'bg-yellow-500/20 text-yellow-400' :
                      getAttributeAdvantage(revealedPlayerCard.attribute, revealedAiCard.attribute) ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {revealedPlayerCard.attribute}
                    </span>
                  </div>
                </div>

                <div className="text-4xl text-accent font-bold">VS</div>

                {/* 상대 카드 */}
                <motion.div
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="text-center"
                >
                  <div className="text-sm text-text-secondary mb-2">상대</div>
                  <CardDisplay character={revealedAiCard} size="lg" />
                  <div className="mt-2 text-sm">
                    <span className={`px-2 py-1 rounded ${
                      revealedPlayerCard.attribute === revealedAiCard.attribute ? 'bg-yellow-500/20 text-yellow-400' :
                      getAttributeAdvantage(revealedAiCard.attribute, revealedPlayerCard.attribute) ? 'bg-green-500/20 text-green-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {revealedAiCard.attribute}
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* 속성 상성 표시 */}
              <div className="mb-6 text-sm">
                {getAttributeAdvantage(revealedPlayerCard.attribute, revealedAiCard.attribute) && (
                  <span className="text-green-400">속성 유리!</span>
                )}
                {getAttributeAdvantage(revealedAiCard.attribute, revealedPlayerCard.attribute) && (
                  <span className="text-red-400">속성 불리!</span>
                )}
                {revealedPlayerCard.attribute === revealedAiCard.attribute && (
                  <span className="text-yellow-400">속성 동일</span>
                )}
              </div>

              <div className="flex justify-center">
                <Button onClick={handleStartBattle} variant="primary" size="lg">
                  ⚔️ 전투 시작!
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 나가기 버튼 */}
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => setShowExitModal(true)}
        className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3 py-2 bg-bg-card/80 backdrop-blur-sm rounded-lg border border-white/10 text-text-secondary hover:text-text-primary hover:border-white/30 transition-all"
      >
        <span>←</span>
        <span className="text-sm">나가기</span>
      </motion.button>

      {/* 스코어 헤더 */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full px-4 pt-4"
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between bg-bg-card rounded-xl p-3 border border-white/10">
          <div className="text-center flex-1">
            <div className="text-sm text-text-secondary">당신</div>
            <div className="text-3xl font-bold text-win">{currentScore.player}</div>
          </div>

          <div className="text-center px-4">
            <div className="text-sm text-text-secondary">라운드</div>
            <div className="text-xl font-bold text-accent">{currentRound} / 5</div>
            <div className="text-xs text-text-secondary">{WIN_SCORE}점 선승</div>
          </div>

          <div className="text-center flex-1">
            <div className="text-sm text-text-secondary">{opponentName || 'AI'}</div>
            <div className="text-3xl font-bold text-lose">{currentScore.ai}</div>
          </div>
        </div>
      </motion.div>

      {/* 메인 3열 레이아웃 */}
      <div className="flex-1 flex p-4 gap-4 max-w-7xl mx-auto w-full">
        {/* 좌측: 내 크루 */}
        <div className="w-32 flex-shrink-0">
          <div className="text-sm text-text-secondary mb-2 text-center">내 크루</div>
          <div className="space-y-2">
            {playerCrewCards.map(card => {
              const isUsed = session.player.usedCards.includes(card.id);
              const isSelected = selectedCardId === card.id;
              const isAvailable = !isUsed && battlePhase === 'SELECT';

              return (
                <motion.div
                  key={card.id}
                  whileHover={isAvailable ? { scale: 1.05 } : undefined}
                  whileTap={isAvailable ? { scale: 0.95 } : undefined}
                  className={`cursor-pointer transition-all ${
                    isUsed ? 'opacity-30 grayscale' : ''
                  } ${isSelected ? 'ring-2 ring-accent' : ''} ${
                    !isAvailable && !isUsed ? 'pointer-events-none' : ''
                  }`}
                  onClick={() => isAvailable && selectCard(card.id)}
                >
                  <CardDisplay
                    character={card}
                    size="sm"
                    isSelected={isSelected}
                    showStats={false}
                    showSkill={false}
                  />
                  {isUsed && (
                    <div className="text-[10px] text-center text-text-secondary mt-1">사용됨</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* 중앙: 경기장 + VS + 카드 상세 */}
        <div className="flex-1 flex flex-col items-center justify-center">
          {/* 경기장 */}
          {currentArena && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full max-w-lg mb-4"
            >
              <ArenaDisplay arena={currentArena} size="md" />
            </motion.div>
          )}

          {/* 대결 영역 */}
          <div className="flex items-center justify-center gap-6 mb-4">
            {/* 플레이어 선택 카드 */}
            <div className="text-center">
              <div className="text-sm text-text-secondary mb-2">당신의 카드</div>
              {selectedCard ? (
                <motion.div
                  key={selectedCard.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <CardDisplay character={selectedCard} size="md" isSelected />
                </motion.div>
              ) : (
                <div className="w-32 h-44 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center">
                  <span className="text-text-secondary text-xs text-center px-2">
                    좌측에서<br />카드 선택
                  </span>
                </div>
              )}
            </div>

            {/* VS + 대결 버튼 */}
            <div className="flex flex-col items-center gap-3">
              <div className="text-3xl font-bold text-accent">VS</div>
              <Button
                onClick={handleRevealOpponent}
                disabled={!selectedCardId || isAnimating || battlePhase !== 'SELECT'}
                size="lg"
                isLoading={isAnimating}
              >
                {isAnimating ? '...' : '⚔️ 대결!'}
              </Button>
            </div>

            {/* AI 카드 (뒷면) */}
            <div className="text-center">
              <div className="text-sm text-text-secondary mb-2">상대 카드</div>
              <div className="w-32 h-44 rounded-xl bg-gradient-to-br from-purple-900 to-purple-700 border-2 border-purple-500/50 flex items-center justify-center shadow-lg">
                <span className="text-4xl">🎴</span>
              </div>
            </div>
          </div>

          {/* 카드 상세 정보 (중앙 하단) */}
          <AnimatePresence mode="wait">
            {selectedCardData && (
              <motion.div
                key={selectedCardData.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full max-w-xl"
              >
                <div className="bg-bg-card/90 backdrop-blur rounded-xl border border-white/10 p-4">
                  {/* 카드 헤더 */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{selectedCardData.attribute === 'BODY' ? '💪' : selectedCardData.attribute === 'CURSE' ? '👁️' : selectedCardData.attribute === 'SOUL' ? '👻' : selectedCardData.attribute === 'BARRIER' ? '🛡️' : '🎯'}</span>
                      <div>
                        <h3 className="font-bold text-lg text-text-primary">{selectedCardData.name.ko}</h3>
                        <p className="text-xs text-text-secondary">{selectedCardData.name.ja}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        selectedCardData.grade === '특급' ? 'bg-yellow-500/20 text-yellow-400' :
                        selectedCardData.grade === '1급' ? 'bg-purple-500/20 text-purple-400' :
                        selectedCardData.grade === '준1급' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>{selectedCardData.grade}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* 고유 기술 */}
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="text-xs text-accent mb-1">⚔️ 고유 기술</div>
                      <div className="text-sm font-bold text-accent mb-1">【{selectedCardData.skill.name}】</div>
                      <p className="text-xs text-text-secondary line-clamp-2">{selectedCardData.skill.description}</p>
                    </div>

                    {/* 스탯 & 상성 */}
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="text-xs text-accent mb-2">📊 스탯</div>
                      <div className="flex gap-3 text-xs mb-2">
                        <span className="text-red-400">ATK {selectedCardData.baseStats.atk}</span>
                        <span className="text-blue-400">DEF {selectedCardData.baseStats.def}</span>
                        <span className="text-yellow-400">SPD {selectedCardData.baseStats.spd}</span>
                      </div>
                      <div className="text-xs text-text-secondary">
                        강함: <span className="text-win">{selectedCardData.attribute === 'BODY' ? '저주' : selectedCardData.attribute === 'CURSE' ? '혼백' : selectedCardData.attribute === 'SOUL' ? '결계' : selectedCardData.attribute === 'BARRIER' ? '신체' : '-'}</span>
                        {' | '}
                        약함: <span className="text-lose">{selectedCardData.attribute === 'BODY' ? '결계' : selectedCardData.attribute === 'CURSE' ? '신체' : selectedCardData.attribute === 'SOUL' ? '저주' : selectedCardData.attribute === 'BARRIER' ? '혼백' : '-'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 경기장 효과 (강화된 표시) */}
                  {currentArena && (() => {
                    const relevantEffects = currentArena.effects.filter(
                      e => e.target === selectedCardData.attribute || e.target === 'ALL'
                    );
                    const hasBoost = relevantEffects.some(e => e.value > 0);
                    const hasWeaken = relevantEffects.some(e => e.value < 0);

                    return (
                      <div className={`mt-3 rounded-lg p-3 border ${
                        hasBoost && !hasWeaken ? 'bg-green-500/10 border-green-500/30' :
                        hasWeaken && !hasBoost ? 'bg-red-500/10 border-red-500/30' :
                        hasBoost && hasWeaken ? 'bg-yellow-500/10 border-yellow-500/30' :
                        'bg-black/30 border-white/10'
                      }`}>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">🏟️</span>
                          <span className="text-sm font-bold text-text-primary">{currentArena.name.ko}</span>
                          {hasBoost && !hasWeaken && (
                            <span className="text-xs px-2 py-0.5 rounded bg-green-500/20 text-green-400">유리</span>
                          )}
                          {hasWeaken && !hasBoost && (
                            <span className="text-xs px-2 py-0.5 rounded bg-red-500/20 text-red-400">불리</span>
                          )}
                          {hasBoost && hasWeaken && (
                            <span className="text-xs px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-400">복합</span>
                          )}
                        </div>

                        {relevantEffects.length > 0 ? (
                          <div className="space-y-1">
                            {relevantEffects.map((effect, idx) => (
                              <div
                                key={idx}
                                className={`text-xs flex items-center gap-2 ${
                                  effect.value > 0 ? 'text-green-400' : effect.value < 0 ? 'text-red-400' : 'text-yellow-400'
                                }`}
                              >
                                <span className="text-base">
                                  {effect.value > 0 ? '⬆️' : effect.value < 0 ? '⬇️' : '⚡'}
                                </span>
                                <span className="font-medium">{effect.description}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-text-secondary">
                            이 카드에 적용되는 경기장 효과가 없습니다
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 우측: 상대 크루 */}
        <div className="w-32 flex-shrink-0">
          <div className="text-sm text-text-secondary mb-2 text-center">상대 크루</div>
          <div className="space-y-2">
            {aiCrewCards.map(card => {
              const isUsed = session.ai.usedCards.includes(card.id);

              return (
                <div
                  key={card.id}
                  className={`transition-all ${isUsed ? 'opacity-30 grayscale' : ''}`}
                >
                  <CardDisplay
                    character={card}
                    size="sm"
                    showStats={false}
                    showSkill={false}
                  />
                  {isUsed && (
                    <div className="text-[10px] text-center text-text-secondary">사용됨</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// 속성 상성 체크
function getAttributeAdvantage(attacker: string, defender: string): boolean {
  const advantages: Record<string, string[]> = {
    'PHYSICAL': ['CURSE'],
    'CURSE': ['SOUL'],
    'SOUL': ['BARRIER'],
    'BARRIER': ['PHYSICAL'],
  };
  return advantages[attacker]?.includes(defender) || false;
}
