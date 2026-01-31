// ========================================
// 전투 텍스트 연출 컴포넌트
// ========================================

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CharacterCard, RoundResult } from '../../types';
import { ATTRIBUTES } from '../../data/constants';
import { Button } from '../UI/Button';

interface BattleMessage {
  id: number;
  text: string;
  type: 'info' | 'advantage' | 'disadvantage' | 'skill' | 'damage' | 'result';
}

interface BattleNarrationProps {
  playerCard: CharacterCard;
  aiCard: CharacterCard;
  result: RoundResult;
  onComplete: () => void;
}

export function BattleNarration({ playerCard, aiCard, result, onComplete }: BattleNarrationProps) {
  const [messages, setMessages] = useState<BattleMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // 전투 메시지 생성
  const generateMessages = useCallback((): BattleMessage[] => {
    const msgs: BattleMessage[] = [];
    const calc = result.calculation;
    let id = 0;

    // 1. 대결 시작
    msgs.push({
      id: id++,
      text: `⚔️ ${playerCard.name.ko} VS ${aiCard.name.ko}`,
      type: 'info'
    });

    // 2. 속성 상성
    const playerAttr = ATTRIBUTES[playerCard.attribute];
    const aiAttr = ATTRIBUTES[aiCard.attribute];

    if (calc.attributeMultiplier.player > 1) {
      msgs.push({
        id: id++,
        text: `${playerAttr.icon} ${playerAttr.ko} → ${aiAttr.icon} ${aiAttr.ko} 상성 유리!`,
        type: 'advantage'
      });
    } else if (calc.attributeMultiplier.player < 1) {
      msgs.push({
        id: id++,
        text: `${playerAttr.icon} ${playerAttr.ko} → ${aiAttr.icon} ${aiAttr.ko} 상성 불리...`,
        type: 'disadvantage'
      });
    } else {
      msgs.push({
        id: id++,
        text: `${playerAttr.icon} ${playerAttr.ko} ↔ ${aiAttr.icon} ${aiAttr.ko} 상성 동등`,
        type: 'info'
      });
    }

    // 3. 선공 판정
    msgs.push({
      id: id++,
      text: calc.playerFirst
        ? `⚡ ${playerCard.name.ko}의 선공!`
        : `⚡ ${aiCard.name.ko}의 선공!`,
      type: calc.playerFirst ? 'advantage' : 'disadvantage'
    });

    // 4. 스킬 발동
    if (calc.skillActivated.player) {
      msgs.push({
        id: id++,
        text: `✨ 【${playerCard.skill.name}】 발동!`,
        type: 'skill'
      });
    }
    if (calc.skillActivated.ai) {
      msgs.push({
        id: id++,
        text: `💀 【${aiCard.skill.name}】 발동!`,
        type: 'skill'
      });
    }

    // 5. 데미지 교환
    msgs.push({
      id: id++,
      text: `💥 ${playerCard.name.ko}: ${calc.playerDamage} 데미지 | ${aiCard.name.ko}: ${calc.aiDamage} 데미지`,
      type: 'damage'
    });

    // 6. 결과
    if (result.winner === 'PLAYER') {
      msgs.push({
        id: id++,
        text: `🎉 ${playerCard.name.ko} 승리!`,
        type: 'result'
      });
    } else if (result.winner === 'AI') {
      msgs.push({
        id: id++,
        text: `😢 ${aiCard.name.ko} 승리...`,
        type: 'result'
      });
    } else {
      msgs.push({
        id: id++,
        text: `🤝 무승부!`,
        type: 'result'
      });
    }

    return msgs;
  }, [playerCard, aiCard, result]);

  // 메시지 초기화
  useEffect(() => {
    const allMessages = generateMessages();
    setMessages(allMessages);
    setCurrentIndex(0);
    setIsComplete(false);
  }, [generateMessages]);

  // 메시지 순차 표시 (1.2초 간격)
  useEffect(() => {
    if (currentIndex < messages.length && !isComplete) {
      const timer = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, 1200);
      return () => clearTimeout(timer);
    } else if (currentIndex >= messages.length && messages.length > 0) {
      setIsComplete(true);
    }
  }, [currentIndex, messages.length, isComplete]);

  // 스킵
  const handleSkip = () => {
    setCurrentIndex(messages.length);
    setIsComplete(true);
  };

  const getMessageColor = (type: BattleMessage['type']) => {
    switch (type) {
      case 'advantage': return 'text-win';
      case 'disadvantage': return 'text-lose';
      case 'skill': return 'text-accent';
      case 'damage': return 'text-yellow-400';
      case 'result': return 'text-white font-bold text-lg';
      default: return 'text-text-primary';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div className="bg-bg-secondary rounded-xl p-6 max-w-lg w-full mx-4 border border-white/10">
        {/* 전투 로그 */}
        <div className="min-h-[200px] mb-4 space-y-2">
          <AnimatePresence>
            {messages.slice(0, currentIndex).map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`py-2 px-3 rounded-lg bg-black/30 ${getMessageColor(msg.type)}`}
              >
                {msg.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* 버튼 */}
        <div className="flex gap-3">
          {!isComplete && (
            <Button onClick={handleSkip} variant="ghost" className="flex-1">
              스킵 →
            </Button>
          )}
          {isComplete && (
            <Button onClick={onComplete} variant="primary" className="flex-1">
              계속
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
