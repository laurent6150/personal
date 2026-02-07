// ========================================
// 맵 밴/픽 화면 컴포넌트 (Phase 3)
// 16강부터 3판 2선승제 경기장 선택 시스템
// ========================================

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ALL_ARENAS, ARENA_CATEGORIES } from '../../data/arenas';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { getCharacterImage } from '../../utils/imageHelper';
import { Button } from '../UI/Button';
import type { Arena, LeagueParticipant } from '../../types';

interface MapBanPickScreenProps {
  fighter1: LeagueParticipant;
  fighter2: LeagueParticipant;
  bestOf: number; // 3 or 5
  onComplete: (selectedArenas: Arena[]) => void;
  onSkip: () => void;
}

type BanPickPhase =
  | 'INTRO'
  | 'P1_BAN'
  | 'P2_BAN'
  | 'P1_PICK'
  | 'P2_PICK'
  | 'FINAL_PICK'
  | 'COMPLETE';

interface BanPickState {
  p1Ban: Arena | null;
  p2Ban: Arena | null;
  p1Picks: Arena[];
  p2Picks: Arena[];
  finalPick: Arena | null;
}

export function MapBanPickScreen({
  fighter1,
  fighter2,
  bestOf,
  onComplete,
  onSkip
}: MapBanPickScreenProps) {
  const [phase, setPhase] = useState<BanPickPhase>('INTRO');
  const [state, setState] = useState<BanPickState>({
    p1Ban: null,
    p2Ban: null,
    p1Picks: [],
    p2Picks: [],
    finalPick: null
  });
  const [selectedArena, setSelectedArena] = useState<Arena | null>(null);
  const [isAutoMode, setIsAutoMode] = useState(false);

  const card1 = CHARACTERS_BY_ID[fighter1.odId];
  const card2 = CHARACTERS_BY_ID[fighter2.odId];

  // 사용 가능한 경기장 (밴/픽된 것 제외)
  const getAvailableArenas = useCallback(() => {
    const usedIds: string[] = [];
    if (state.p1Ban) usedIds.push(state.p1Ban.id);
    if (state.p2Ban) usedIds.push(state.p2Ban.id);
    state.p1Picks.forEach(a => usedIds.push(a.id));
    state.p2Picks.forEach(a => usedIds.push(a.id));
    if (state.finalPick) usedIds.push(state.finalPick.id);

    return ALL_ARENAS.filter(a => !usedIds.includes(a.id));
  }, [state]);

  // AI 자동 선택 (상대방 + 내 카드가 아닌 경우)
  const autoSelectArena = useCallback(() => {
    const available = getAvailableArenas();
    if (available.length === 0) return null;

    // 랜덤 선택
    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
  }, [getAvailableArenas]);

  // 현재 선택자가 내 카드인지 확인
  const isCurrentPlayerMyCard = () => {
    if (phase === 'P1_BAN' || phase === 'P1_PICK') {
      return fighter1.isPlayerCrew;
    }
    if (phase === 'P2_BAN' || phase === 'P2_PICK') {
      return fighter2.isPlayerCrew;
    }
    return false;
  };

  // 페이즈 진행
  const advancePhase = useCallback((arena: Arena) => {
    switch (phase) {
      case 'INTRO':
        setPhase('P1_BAN');
        break;
      case 'P1_BAN':
        setState(prev => ({ ...prev, p1Ban: arena }));
        setPhase('P2_BAN');
        setSelectedArena(null);
        break;
      case 'P2_BAN':
        setState(prev => ({ ...prev, p2Ban: arena }));
        setPhase('P1_PICK');
        setSelectedArena(null);
        break;
      case 'P1_PICK':
        setState(prev => ({ ...prev, p1Picks: [...prev.p1Picks, arena] }));
        if (bestOf === 3) {
          setPhase('P2_PICK');
        } else {
          // 5판제: P1 -> P2 -> P2 -> P1 -> Final
          if (state.p1Picks.length === 0) {
            setPhase('P2_PICK');
          } else {
            setPhase('FINAL_PICK');
          }
        }
        setSelectedArena(null);
        break;
      case 'P2_PICK':
        setState(prev => ({ ...prev, p2Picks: [...prev.p2Picks, arena] }));
        if (bestOf === 3) {
          setPhase('FINAL_PICK');
        } else {
          // 5판제
          if (state.p2Picks.length === 0) {
            // 첫 P2 픽 -> 두번째 P2 픽
            setPhase('P2_PICK');
          } else {
            setPhase('P1_PICK');
          }
        }
        setSelectedArena(null);
        break;
      case 'FINAL_PICK':
        setState(prev => ({ ...prev, finalPick: arena }));
        setPhase('COMPLETE');
        setSelectedArena(null);
        break;
    }
  }, [phase, bestOf, state.p1Picks.length, state.p2Picks.length]);

  // 인트로 -> 밴픽 시작
  useEffect(() => {
    if (phase === 'INTRO') {
      const timer = setTimeout(() => setPhase('P1_BAN'), 1500);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // 자동 모드: AI 선택
  useEffect(() => {
    if (phase === 'COMPLETE') return;
    if (phase === 'INTRO') return;

    if (!isCurrentPlayerMyCard() || isAutoMode) {
      const timer = setTimeout(() => {
        const autoArena = autoSelectArena();
        if (autoArena) {
          advancePhase(autoArena);
        }
      }, isAutoMode ? 300 : 1000);
      return () => clearTimeout(timer);
    }
  }, [phase, isAutoMode, autoSelectArena, advancePhase]);

  // 완료 시 결과 전달
  useEffect(() => {
    if (phase === 'COMPLETE') {
      const timer = setTimeout(() => {
        const arenas: Arena[] = [];
        // 3판제: p1픽 -> p2픽 -> final
        // 5판제: p1픽1 -> p2픽1 -> p2픽2 -> p1픽2 -> final
        if (bestOf === 3) {
          if (state.p1Picks[0]) arenas.push(state.p1Picks[0]);
          if (state.p2Picks[0]) arenas.push(state.p2Picks[0]);
          if (state.finalPick) arenas.push(state.finalPick);
        } else {
          // 5판제 순서
          if (state.p1Picks[0]) arenas.push(state.p1Picks[0]);
          if (state.p2Picks[0]) arenas.push(state.p2Picks[0]);
          if (state.p2Picks[1]) arenas.push(state.p2Picks[1]);
          if (state.p1Picks[1]) arenas.push(state.p1Picks[1]);
          if (state.finalPick) arenas.push(state.finalPick);
        }
        onComplete(arenas);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [phase, state, bestOf, onComplete]);

  // 선택 확인
  const handleConfirmSelection = () => {
    if (selectedArena) {
      advancePhase(selectedArena);
    }
  };

  // 현재 페이즈 텍스트
  const getPhaseText = () => {
    switch (phase) {
      case 'INTRO': return '맵 밴/픽 시작';
      case 'P1_BAN': return `${fighter1.odName}의 밴`;
      case 'P2_BAN': return `${fighter2.odName}의 밴`;
      case 'P1_PICK': return `${fighter1.odName}의 픽`;
      case 'P2_PICK': return `${fighter2.odName}의 픽`;
      case 'FINAL_PICK': return '최종 경기장 선택';
      case 'COMPLETE': return '맵 선택 완료!';
    }
  };

  const availableArenas = getAvailableArenas();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 overflow-auto"
    >
      <div className="max-w-5xl w-full">
        {/* 헤더 */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-white mb-2">
            맵 밴/픽
          </div>
          <div className="text-sm text-text-secondary">
            {bestOf}판 {Math.ceil(bestOf / 2)}선승제 - 각 세트별 다른 경기장에서 진행
          </div>
        </div>

        {/* 대전 정보 */}
        <div className="flex items-center justify-center gap-8 mb-6">
          {/* P1 */}
          <div className={`text-center ${phase.startsWith('P1') ? 'ring-2 ring-yellow-400 rounded-lg p-2' : ''}`}>
            <div className={`
              w-16 h-16 mx-auto rounded-full overflow-hidden mb-2
              ${fighter1.isPlayerCrew ? 'border-2 border-yellow-400' : 'border border-white/30'}
            `}>
              {card1 && (
                <img
                  src={getCharacterImage(card1.id, card1.name.ko, card1.attribute)}
                  alt={card1.name.ko}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="text-sm font-bold text-white">
              {fighter1.isPlayerCrew && '* '}
              {fighter1.odName}
            </div>
          </div>

          {/* VS */}
          <div className="text-2xl font-bold text-white/50">VS</div>

          {/* P2 */}
          <div className={`text-center ${phase.startsWith('P2') ? 'ring-2 ring-yellow-400 rounded-lg p-2' : ''}`}>
            <div className={`
              w-16 h-16 mx-auto rounded-full overflow-hidden mb-2
              ${fighter2.isPlayerCrew ? 'border-2 border-yellow-400' : 'border border-white/30'}
            `}>
              {card2 && (
                <img
                  src={getCharacterImage(card2.id, card2.name.ko, card2.attribute)}
                  alt={card2.name.ko}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="text-sm font-bold text-white">
              {fighter2.isPlayerCrew && '* '}
              {fighter2.odName}
            </div>
          </div>
        </div>

        {/* 현재 페이즈 */}
        <motion.div
          key={phase}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-lg font-bold text-accent mb-4"
        >
          {getPhaseText()}
        </motion.div>

        {/* 밴픽 현황 */}
        <div className="bg-bg-secondary rounded-lg p-4 mb-4 border border-white/10">
          <div className="grid grid-cols-2 gap-4">
            {/* P1 밴/픽 */}
            <div>
              <div className="text-sm font-bold text-text-secondary mb-2">
                {fighter1.odName}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">BAN:</span>
                  <span className={state.p1Ban ? 'text-red-400' : 'text-text-secondary'}>
                    {state.p1Ban?.name.ko || '...'}
                  </span>
                </div>
                {state.p1Picks.map((arena, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-green-400">세트 {i * 2 + 1}:</span>
                    <span className="text-green-400">{arena.name.ko}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* P2 밴/픽 */}
            <div>
              <div className="text-sm font-bold text-text-secondary mb-2">
                {fighter2.odName}
              </div>
              <div className="space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">BAN:</span>
                  <span className={state.p2Ban ? 'text-red-400' : 'text-text-secondary'}>
                    {state.p2Ban?.name.ko || '...'}
                  </span>
                </div>
                {state.p2Picks.map((arena, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-blue-400">세트 {i * 2 + 2}:</span>
                    <span className="text-blue-400">{arena.name.ko}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 최종 경기장 */}
          {state.finalPick && (
            <div className="mt-3 pt-3 border-t border-white/10 text-center">
              <span className="text-sm text-purple-400">
                최종 세트: {state.finalPick.name.ko}
              </span>
            </div>
          )}
        </div>

        {/* 경기장 선택 (내 카드 차례일 때만) */}
        {phase !== 'INTRO' && phase !== 'COMPLETE' && isCurrentPlayerMyCard() && !isAutoMode && (
          <div className="bg-bg-secondary rounded-lg p-4 border border-white/10 mb-4">
            <div className="text-sm font-bold text-text-primary mb-3">
              경기장 선택
            </div>

            {/* 카테고리별 경기장 */}
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {(['LOCATION', 'DOMAIN', 'SPECIAL'] as const).map(category => {
                const categoryArenas = availableArenas.filter(a => a.category === category);
                if (categoryArenas.length === 0) return null;

                return (
                  <div key={category}>
                    <div className="text-xs text-text-secondary mb-2">
                      {ARENA_CATEGORIES[category].icon} {ARENA_CATEGORIES[category].name}
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {categoryArenas.map(arena => (
                        <button
                          key={arena.id}
                          onClick={() => setSelectedArena(arena)}
                          className={`
                            p-2 rounded-lg text-left text-xs transition-all
                            ${selectedArena?.id === arena.id
                              ? 'bg-accent/30 border-2 border-accent'
                              : 'bg-bg-primary/50 border border-white/10 hover:border-white/30'}
                          `}
                        >
                          <div className="font-bold text-text-primary truncate">
                            {arena.name.ko}
                          </div>
                          <div className="text-text-secondary text-[10px] truncate">
                            {arena.effects[0]?.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 선택 확인 */}
            <div className="mt-4 flex justify-center gap-3">
              <Button
                variant="primary"
                onClick={handleConfirmSelection}
                disabled={!selectedArena}
              >
                {phase.includes('BAN') ? '밴 확정' : '픽 확정'}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsAutoMode(true)}
              >
                자동 선택
              </Button>
            </div>
          </div>
        )}

        {/* 자동 진행 중 표시 */}
        <AnimatePresence>
          {(phase !== 'INTRO' && phase !== 'COMPLETE' && (!isCurrentPlayerMyCard() || isAutoMode)) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-text-secondary mb-4"
            >
              <div className="animate-pulse">
                {isCurrentPlayerMyCard() ? '자동 선택 중...' : `${getPhaseText()} 진행 중...`}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 완료 표시 */}
        {phase === 'COMPLETE' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="text-2xl text-green-400 font-bold mb-4">
              맵 선택 완료!
            </div>
            <div className="text-sm text-text-secondary">
              경기를 시작합니다...
            </div>
          </motion.div>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-center gap-4 mt-6">
          <Button variant="ghost" onClick={onSkip}>
            스킵 (자동 선택)
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export default MapBanPickScreen;
