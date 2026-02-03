// ========================================
// 대전 화면 - MVP v3: 새 레이아웃 + 턴제 전투 + 밴/픽 시스템
// ========================================

import { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBattle } from '../../hooks/useBattle';
import { CardDisplay } from '../Card/CardDisplay';
import { ArenaDisplay } from './ArenaDisplay';
import { TurnBattleModal } from './TurnBattleModal';
import { Button } from '../UI/Button';
import { ExitConfirmModal } from '../UI/ExitConfirmModal';
import { ArenaBanModal } from '../BanPick/ArenaBanModal';
import { BanResultModal } from '../BanPick/BanResultModal';
import { CardPlacementScreen } from '../BanPick/CardPlacementScreen';
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
    updateRoundWinner,
    continueGame,
    returnToMenu,
    // 밴/픽 관련
    banPickPhase,
    pendingBanPickInfo,
    submitBan,
    confirmBanResult,
    submitPlacements,
    startAfterPlacements,
    // 배치 모드에서 현재 라운드에 배치된 카드
    assignedCardForCurrentRound
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

  // 카드별 라운드 결과 집계 (게임 종료 화면용)
  const cardBattleResults = useMemo(() => {
    if (!session) return {};
    const results: Record<string, { wins: number; losses: number; draws: number; rounds: number[] }> = {};

    session.rounds.forEach((round, idx) => {
      const cardId = round.playerCardId;
      if (!results[cardId]) {
        results[cardId] = { wins: 0, losses: 0, draws: 0, rounds: [] };
      }
      results[cardId].rounds.push(idx + 1);
      if (round.winner === 'PLAYER') {
        results[cardId].wins++;
      } else if (round.winner === 'AI') {
        results[cardId].losses++;
      } else {
        results[cardId].draws++;
      }
    });

    return results;
  }, [session]);

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

  // 배치 모드: 라운드 시작 시 미리 배치된 카드 자동 선택
  useEffect(() => {
    if (
      battlePhase === 'SELECT' &&
      assignedCardForCurrentRound &&
      !selectedCardId &&
      session?.status === 'IN_PROGRESS' &&
      session.cardAssignments // 배치 모드인지 확인
    ) {
      selectCard(assignedCardForCurrentRound);
    }
  }, [battlePhase, assignedCardForCurrentRound, selectedCardId, session, selectCard]);

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

    // ⚠️ 중요: executeRound 전에 battlePhase를 변경하여
    // 게임 종료 화면이 미리 표시되는 것을 방지
    setBattlePhase('REVEAL');

    // 라운드 실행하여 AI 카드 선택
    const result = await executeRound();
    if (result) {
      const aiCard = CHARACTERS_BY_ID[result.aiCardId];
      setRevealedAiCard(aiCard || null);
    }
  };

  // 전투 시작 버튼 클릭
  const handleStartBattle = () => {
    setBattlePhase('BATTLE');
  };

  // 턴제 전투 완료 - 실제 승자로 점수 업데이트
  const handleTurnBattleComplete = (winner: 'PLAYER' | 'AI' | 'DRAW') => {
    // 실제 전투 결과로 점수 업데이트
    updateRoundWinner(winner);

    setShowTurnBattle(false);
    setRevealedAiCard(null);
    setRevealedPlayerCard(null);
    setBattlePhase('SELECT');
    continueGame();
  };

  // 배경 이미지 스타일
  const bgStyle = {
    backgroundImage: 'url(/images/backgrounds/battle_bg.jpg)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={bgStyle}>
        <div className="text-center">
          <div className="text-xl text-text-secondary mb-4">세션이 없습니다</div>
          <Button onClick={onReturnToMenu} variant="primary">
            메인 메뉴로
          </Button>
        </div>
      </div>
    );
  }

  // ========================================
  // 밴/픽 페이즈 렌더링
  // ========================================

  // 1. 플레이어 경기장 밴 선택
  if (banPickPhase === 'PLAYER_BAN') {
    return (
      <ArenaBanModal
        opponentCrewName={opponentName || 'AI'}
        opponentCrew={session.ai.crew}
        playerCrew={session.player.crew}
        onBanSelect={submitBan}
        onCancel={() => {
          returnToMenu();
          onReturnToMenu();
        }}
      />
    );
  }

  // 2. 밴 결과 표시
  if (banPickPhase === 'BAN_RESULT' && pendingBanPickInfo) {
    return (
      <BanResultModal
        banPickInfo={pendingBanPickInfo}
        onContinue={confirmBanResult}
      />
    );
  }

  // 3. 카드 배치 화면
  if (banPickPhase === 'CARD_PLACEMENT' && pendingBanPickInfo) {
    return (
      <CardPlacementScreen
        playerCrew={session.player.crew}
        arenas={pendingBanPickInfo.selectedArenas}
        opponentCrewName={opponentName || 'AI'}
        onConfirm={(assignments) => {
          submitPlacements(assignments);
        }}
        onBack={() => {
          returnToMenu();
          onReturnToMenu();
        }}
      />
    );
  }

  // 4. 배치 완료 - 전투 시작 대기
  if (banPickPhase === 'READY') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={bgStyle}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-bg-card rounded-xl p-8 max-w-md w-full text-center border border-white/10"
        >
          <div className="text-4xl mb-4">⚔️</div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">준비 완료!</h2>
          <p className="text-text-secondary mb-6">
            vs {opponentName || 'AI'}<br />
            5라운드 경기가 시작됩니다
          </p>
          <Button onClick={startAfterPlacements} variant="primary" size="lg" className="w-full">
            전투 시작!
          </Button>
        </motion.div>
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
        style={bgStyle}
      >
        <div className="bg-bg-secondary rounded-xl p-6 max-w-2xl w-full border border-white/10 shadow-2xl">
          {/* 헤더 */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className={`text-5xl mb-3 ${isPlayerWin ? 'text-win' : 'text-lose'}`}
            >
              {isPlayerWin ? '🎉' : '😢'}
            </motion.div>

            <h1 className={`text-2xl font-bold mb-1 ${isPlayerWin ? 'text-win' : 'text-lose'}`}>
              {isPlayerWin ? '승리!' : '패배'}
            </h1>

            <p className="text-text-secondary">
              최종 스코어: <span className="text-win font-bold">{currentScore.player}</span>
              {' - '}
              <span className="text-lose font-bold">{currentScore.ai}</span>
            </p>
          </div>

          {/* 라운드 요약 */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-black/30 rounded-lg p-4 mb-4"
          >
            <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
              <span>📊</span> 라운드 요약
            </h3>
            <div className="flex justify-center gap-2 flex-wrap">
              {session?.rounds.map((round, idx) => (
                <div
                  key={idx}
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold
                    ${round.winner === 'PLAYER' ? 'bg-green-500/30 text-green-400 border border-green-500/50' :
                      round.winner === 'AI' ? 'bg-red-500/30 text-red-400 border border-red-500/50' :
                      'bg-yellow-500/30 text-yellow-400 border border-yellow-500/50'}
                  `}
                  title={`${idx + 1}R: ${CHARACTERS_BY_ID[round.playerCardId]?.name.ko || '?'} vs ${CHARACTERS_BY_ID[round.aiCardId]?.name.ko || '?'}`}
                >
                  {idx + 1}R
                </div>
              ))}
            </div>
          </motion.div>

          {/* 카드별 상세 경험치 */}
          {gameEndResult?.expGained && Object.keys(gameEndResult.expGained).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-black/30 rounded-lg p-4 mb-4"
            >
              <h3 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                <span>⚡</span> 카드별 경험치 획득
              </h3>
              <div className="space-y-3">
                {Object.entries(gameEndResult.expGained).map(([cardId, exp]) => {
                  const card = CHARACTERS_BY_ID[cardId];
                  const battleResult = cardBattleResults[cardId];
                  const isPositiveExp = exp >= 0;

                  return (
                    <div
                      key={cardId}
                      className="bg-black/20 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {card?.attribute === 'BODY' ? '💪' :
                             card?.attribute === 'CURSE' ? '👁️' :
                             card?.attribute === 'SOUL' ? '👻' :
                             card?.attribute === 'BARRIER' ? '🛡️' : '🎯'}
                          </span>
                          <span className="font-bold text-text-primary">
                            {card?.name.ko || cardId}
                          </span>
                        </div>
                        <span className={`font-bold ${isPositiveExp ? 'text-win' : 'text-lose'}`}>
                          {isPositiveExp ? '+' : ''}{exp} EXP
                        </span>
                      </div>

                      {/* 전투 결과 */}
                      {battleResult && (
                        <div className="flex items-center gap-4 text-xs">
                          <div className="flex items-center gap-1">
                            <span className="text-green-400">승 {battleResult.wins}</span>
                            <span className="text-text-secondary">/</span>
                            <span className="text-red-400">패 {battleResult.losses}</span>
                            {battleResult.draws > 0 && (
                              <>
                                <span className="text-text-secondary">/</span>
                                <span className="text-yellow-400">무 {battleResult.draws}</span>
                              </>
                            )}
                          </div>
                          <div className="text-text-secondary">
                            참가: {battleResult.rounds.map(r => `${r}R`).join(', ')}
                          </div>
                        </div>
                      )}

                      {/* 경험치 상세 (계산된 값) */}
                      <div className="flex flex-wrap gap-2 mt-2 text-[10px]">
                        {battleResult && battleResult.wins > 0 && (
                          <span className="bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                            승리 보너스 +{battleResult.wins * 100}
                          </span>
                        )}
                        {battleResult && battleResult.losses > 0 && (
                          <span className="bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                            패배 -{battleResult.losses * 30}
                          </span>
                        )}
                        {isPlayerWin && (
                          <span className="bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded">
                            팀 승리 보너스
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* 레벨업 알림 */}
          {gameEndResult?.levelUps && gameEndResult.levelUps.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4"
            >
              <h3 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
                <span>🎉</span> 레벨 업!
              </h3>
              <div className="flex flex-wrap gap-2">
                {gameEndResult.levelUps.map((cardId) => (
                  <span key={cardId} className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-sm">
                    {CHARACTERS_BY_ID[cardId]?.name.ko || cardId}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* 업적 알림 */}
          {gameEndResult?.newAchievements && gameEndResult.newAchievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4"
            >
              <h3 className="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
                <span>🏆</span> 새 업적!
              </h3>
              <div className="flex flex-wrap gap-2">
                {gameEndResult.newAchievements.map((achievement, idx) => (
                  <span key={idx} className="bg-purple-500/20 text-purple-400 px-2 py-1 rounded text-sm">
                    {achievement}
                  </span>
                ))}
              </div>
            </motion.div>
          )}

          {/* 버튼 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button onClick={handleReturnToMenuClick} variant="primary" className="w-full">
              시즌 허브로
            </Button>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={bgStyle}>
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
          <div className="text-sm text-text-secondary mb-2 text-center">
            {session.cardAssignments ? '배치된 카드' : '내 크루'}
          </div>
          <div className="space-y-2">
            {playerCrewCards.map(card => {
              const isUsed = session.player.usedCards.includes(card.id);
              const isSelected = selectedCardId === card.id;
              const isPreAssigned = assignedCardForCurrentRound === card.id;
              const isPlacementMode = !!session.cardAssignments;
              // 배치 모드에서는 미리 배치된 카드만 선택 가능
              const isAvailable = !isUsed && battlePhase === 'SELECT' && (!isPlacementMode || isPreAssigned);

              return (
                <motion.div
                  key={card.id}
                  whileHover={isAvailable ? { scale: 1.05 } : undefined}
                  whileTap={isAvailable ? { scale: 0.95 } : undefined}
                  className={`cursor-pointer transition-all relative ${
                    isUsed ? 'opacity-30 grayscale' : ''
                  } ${isSelected ? 'ring-2 ring-accent' : ''} ${
                    isPreAssigned && !isUsed && !isSelected ? 'ring-2 ring-yellow-500 animate-pulse' : ''
                  } ${
                    !isAvailable && !isUsed ? 'pointer-events-none opacity-50' : ''
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
                  {isPreAssigned && !isUsed && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 text-black text-[8px] px-1 py-0.5 rounded font-bold">
                      이번 경기
                    </div>
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

                    {/* 스탯 (8스탯) & 상성 */}
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="text-xs text-accent mb-2">📊 스탯</div>
                      <div className="grid grid-cols-4 gap-1 text-[10px] mb-2">
                        <span className="text-red-400">ATK {selectedCardData.baseStats.atk}</span>
                        <span className="text-blue-400">DEF {selectedCardData.baseStats.def}</span>
                        <span className="text-yellow-400">SPD {selectedCardData.baseStats.spd}</span>
                        <span className="text-purple-400">CE {selectedCardData.baseStats.ce}</span>
                        <span className="text-pink-400">HP {selectedCardData.baseStats.hp}</span>
                        <span className="text-pink-300">CRT {(selectedCardData.baseStats as unknown as Record<string, number>).crt ?? 0}</span>
                        <span className="text-teal-400">TEC {(selectedCardData.baseStats as unknown as Record<string, number>).tec ?? 0}</span>
                        <span className="text-indigo-400">MNT {(selectedCardData.baseStats as unknown as Record<string, number>).mnt ?? 0}</span>
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
