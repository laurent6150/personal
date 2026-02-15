// ========================================
// 전략 대시보드 - 크루 분석 및 전략 추천
// ========================================

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerCard, CharacterCard, Arena, Attribute } from '../../types';
import { CHARACTERS_BY_ID } from '../../data/characters';
import { ALL_ARENAS, ARENAS_BY_ID } from '../../data/arenas';
import { ATTRIBUTES } from '../../data/constants';
import {
  analyzeCrewComposition,
  analyzeMatchup,
  recommendArenaBan,
  recommendOptimalPlacement,
  analyzeCard,
  getEffectiveStats,
  calculateTotalPower,
  type CrewAnalysis,
  type MatchupAnalysis,
  type BanRecommendation,
  type PlacementRecommendation,
  type CardAnalysis
} from '../../utils/strategyAdvisor';

interface StrategyDashboardProps {
  playerCards: PlayerCard[];
  opponentCards?: CharacterCard[];
  opponentName?: string;
  onClose?: () => void;
}

type TabType = 'crew' | 'matchup' | 'arenas' | 'cards';

export function StrategyDashboard({
  playerCards,
  opponentCards,
  opponentName,
  onClose
}: StrategyDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('crew');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // 분석 데이터 계산
  const crewAnalysis = useMemo(() =>
    analyzeCrewComposition(playerCards),
    [playerCards]
  );

  const matchupAnalysis = useMemo(() =>
    opponentCards && opponentCards.length > 0
      ? analyzeMatchup(playerCards, opponentCards, ALL_ARENAS)
      : null,
    [playerCards, opponentCards]
  );

  const banRecommendations = useMemo(() =>
    recommendArenaBan(playerCards, opponentCards || null, ALL_ARENAS),
    [playerCards, opponentCards]
  );

  const selectedCardAnalysis = useMemo(() =>
    selectedCardId
      ? analyzeCard(playerCards.find(c => c.cardId === selectedCardId)!)
      : null,
    [selectedCardId, playerCards]
  );

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'crew', label: '크루 분석', icon: '👥' },
    { id: 'matchup', label: '매치업', icon: '⚔️' },
    { id: 'arenas', label: '경기장', icon: '🏟️' },
    { id: 'cards', label: '카드 분석', icon: '🃏' }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-gray-900 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📊</span> 전략 대시보드
          </h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white text-2xl"
            >
              ×
            </button>
          )}
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-gray-700 bg-gray-800">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-purple-400 border-b-2 border-purple-400 bg-gray-900/50'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        <div className="flex-1 overflow-y-auto p-4">
          <AnimatePresence mode="wait">
            {activeTab === 'crew' && (
              <CrewAnalysisTab
                key="crew"
                analysis={crewAnalysis}
                playerCards={playerCards}
              />
            )}
            {activeTab === 'matchup' && (
              <MatchupTab
                key="matchup"
                analysis={matchupAnalysis}
                opponentName={opponentName}
                opponentCards={opponentCards}
              />
            )}
            {activeTab === 'arenas' && (
              <ArenasTab
                key="arenas"
                banRecommendations={banRecommendations}
                playerCards={playerCards}
              />
            )}
            {activeTab === 'cards' && (
              <CardsTab
                key="cards"
                playerCards={playerCards}
                selectedCardId={selectedCardId}
                onSelectCard={setSelectedCardId}
                cardAnalysis={selectedCardAnalysis}
              />
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// ========================================
// 크루 분석 탭
// ========================================

interface CrewAnalysisTabProps {
  analysis: CrewAnalysis;
  playerCards: PlayerCard[];
}

function CrewAnalysisTab({ analysis, playerCards }: CrewAnalysisTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* 전투력 요약 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold text-white mb-3">전투력 요약</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-3xl font-bold text-purple-400">
              {analysis.totalPower}
            </div>
            <div className="text-sm text-gray-400">총 전투력</div>
          </div>
          <div className="bg-gray-700/50 rounded-lg p-3 text-center">
            <div className="text-3xl font-bold text-blue-400">
              {analysis.averagePower.toFixed(1)}
            </div>
            <div className="text-sm text-gray-400">평균 전투력</div>
          </div>
        </div>
      </div>

      {/* 속성 분포 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold text-white mb-3">속성 분포</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {(Object.entries(analysis.attributeDistribution) as [Attribute, number][]).map(
            ([attr, count]) => (
              <div
                key={attr}
                className={`rounded-lg p-2 text-center ${
                  count > 0 ? 'bg-gray-700' : 'bg-gray-800/50'
                }`}
              >
                <div className="text-2xl">{ATTRIBUTES[attr].icon}</div>
                <div className="text-xs text-gray-400">{ATTRIBUTES[attr].ko}</div>
                <div className={`text-lg font-bold ${count > 0 ? 'text-white' : 'text-gray-600'}`}>
                  {count}
                </div>
              </div>
            )
          )}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-sm text-gray-400">밸런스:</span>
          <span className={`text-sm font-medium px-2 py-1 rounded ${
            analysis.attributeBalance === 'BALANCED'
              ? 'bg-green-900/50 text-green-400'
              : analysis.attributeBalance === 'SPECIALIZED'
              ? 'bg-blue-900/50 text-blue-400'
              : 'bg-red-900/50 text-red-400'
          }`}>
            {analysis.attributeBalance === 'BALANCED' ? '균형' :
             analysis.attributeBalance === 'SPECIALIZED' ? '특화' : '불균형'}
          </span>
        </div>
      </div>

      {/* 강점 & 약점 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
            <span>💪</span> 강점
          </h3>
          {analysis.strengths.length > 0 ? (
            <ul className="space-y-2">
              {analysis.strengths.map((strength, i) => (
                <li key={i} className="text-gray-300 flex items-start gap-2">
                  <span className="text-green-400">✓</span>
                  {strength}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">분석된 강점이 없습니다</p>
          )}
        </div>

        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
            <span>⚠️</span> 약점
          </h3>
          {analysis.weaknesses.length > 0 ? (
            <ul className="space-y-2">
              {analysis.weaknesses.map((weakness, i) => (
                <li key={i} className="text-gray-300 flex items-start gap-2">
                  <span className="text-red-400">!</span>
                  {weakness}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">분석된 약점이 없습니다</p>
          )}
        </div>
      </div>

      {/* 추천 사항 */}
      {analysis.recommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-900/30 to-indigo-900/30 border border-purple-700/50 rounded-lg p-4">
          <h3 className="text-lg font-bold text-purple-400 mb-3 flex items-center gap-2">
            <span>💡</span> 추천 사항
          </h3>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="text-gray-300 flex items-start gap-2">
                <span className="text-purple-400">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

// ========================================
// 매치업 탭
// ========================================

interface MatchupTabProps {
  analysis: MatchupAnalysis | null;
  opponentName?: string;
  opponentCards?: CharacterCard[];
}

function MatchupTab({ analysis, opponentName, opponentCards }: MatchupTabProps) {
  if (!analysis || !opponentCards || opponentCards.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="flex flex-col items-center justify-center py-12"
      >
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-bold text-white mb-2">상대를 선택하세요</h3>
        <p className="text-gray-400 text-center">
          경기 상대를 선택하면 매치업 분석을 볼 수 있습니다.
        </p>
      </motion.div>
    );
  }

  const advantageColor = analysis.overallAdvantage === 'FAVORABLE'
    ? 'text-green-400'
    : analysis.overallAdvantage === 'UNFAVORABLE'
    ? 'text-red-400'
    : 'text-yellow-400';

  const advantageLabel = analysis.overallAdvantage === 'FAVORABLE'
    ? '유리'
    : analysis.overallAdvantage === 'UNFAVORABLE'
    ? '불리'
    : '균형';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* 전체 분석 요약 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">
            vs {opponentName || '상대'}
          </h3>
          <span className={`text-2xl font-bold ${advantageColor}`}>
            {advantageLabel}
          </span>
        </div>

        {/* 우위 게이지 */}
        <div className="relative h-8 bg-gray-700 rounded-full overflow-hidden mb-3">
          <div
            className={`absolute h-full transition-all duration-500 ${
              analysis.advantageScore >= 0
                ? 'bg-gradient-to-r from-green-600 to-green-400 left-1/2'
                : 'bg-gradient-to-l from-red-600 to-red-400 right-1/2'
            }`}
            style={{
              width: `${Math.abs(analysis.advantageScore) / 2}%`
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold">
              {analysis.advantageScore > 0 ? '+' : ''}{analysis.advantageScore.toFixed(0)}
            </span>
          </div>
        </div>

        <p className="text-gray-300 text-sm">{analysis.summary}</p>
      </div>

      {/* 상대 크루 속성 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold text-white mb-3">상대 크루 구성</h3>
        <div className="flex flex-wrap gap-2">
          {opponentCards.map(card => (
            <div
              key={card.id}
              className="bg-gray-700 rounded-lg px-3 py-2 flex items-center gap-2"
            >
              <span className="text-lg">{ATTRIBUTES[card.attribute].icon}</span>
              <span className="text-white text-sm">{card.name.ko}</span>
              <span className="text-xs text-gray-400">{card.grade}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 경기장별 분석 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold text-white mb-3">경기장별 유불리</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {analysis.arenaMatchups
            .sort((a, b) => (b.playerAdvantage - b.aiAdvantage) - (a.playerAdvantage - a.aiAdvantage))
            .map(({ arena, playerAdvantage, aiAdvantage, recommendation }) => {
              const diff = playerAdvantage - aiAdvantage;
              return (
                <div
                  key={arena.id}
                  className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between"
                >
                  <div>
                    <span className="text-white font-medium">{arena.name.ko}</span>
                    <p className="text-xs text-gray-400">{recommendation}</p>
                  </div>
                  <div className={`text-lg font-bold ${
                    diff > 10 ? 'text-green-400' :
                    diff < -10 ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(0)}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </motion.div>
  );
}

// ========================================
// 경기장 탭
// ========================================

interface ArenasTabProps {
  banRecommendations: BanRecommendation[];
  playerCards: PlayerCard[];
}

function ArenasTab({ banRecommendations, playerCards }: ArenasTabProps) {
  const placementRecommendations = useMemo(() =>
    recommendOptimalPlacement(playerCards, ALL_ARENAS.slice(0, 5)),
    [playerCards]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      {/* 밴 추천 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
          <span>🚫</span> 밴 추천 경기장
        </h3>
        {banRecommendations.length > 0 ? (
          <div className="space-y-3">
            {banRecommendations.slice(0, 5).map((rec, i) => (
              <div
                key={rec.arenaId}
                className={`rounded-lg p-3 ${
                  i === 0 ? 'bg-red-900/30 border border-red-700/50' : 'bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-medium flex items-center gap-2">
                    {i === 0 && <span className="text-red-400">★</span>}
                    {rec.arenaName}
                  </span>
                  <span className={`text-sm font-bold ${
                    rec.banScore > 30 ? 'text-red-400' :
                    rec.banScore > 15 ? 'text-yellow-400' : 'text-gray-400'
                  }`}>
                    위험도: {rec.banScore.toFixed(0)}
                  </span>
                </div>
                <ul className="text-xs text-gray-400 space-y-1">
                  {rec.reasons.map((reason, j) => (
                    <li key={j}>• {reason}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">밴 추천이 없습니다. 모든 경기장이 균등합니다.</p>
        )}
      </div>

      {/* 배치 추천 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold text-green-400 mb-3 flex items-center gap-2">
          <span>📍</span> 최적 배치 추천
        </h3>
        <div className="space-y-3">
          {placementRecommendations.map((rec, i) => (
            <div key={rec.arenaId} className="bg-gray-700/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{rec.arenaName}</span>
                <span className="text-sm text-green-400">적합도: {rec.score.toFixed(0)}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-400 font-bold">→</span>
                <span className="text-white">{rec.recommendedCardName}</span>
              </div>
              {rec.alternativeCards.length > 0 && (
                <div className="text-xs text-gray-400">
                  대안: {rec.alternativeCards.map(c => c.cardName).join(', ')}
                </div>
              )}
              {rec.reasons.length > 0 && (
                <ul className="text-xs text-gray-500 mt-2 space-y-1">
                  {rec.reasons.slice(0, 2).map((reason, j) => (
                    <li key={j}>• {reason}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ========================================
// 카드 분석 탭
// ========================================

interface CardsTabProps {
  playerCards: PlayerCard[];
  selectedCardId: string | null;
  onSelectCard: (cardId: string | null) => void;
  cardAnalysis: CardAnalysis | null;
}

function CardsTab({ playerCards, selectedCardId, onSelectCard, cardAnalysis }: CardsTabProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      {/* 카드 선택 */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-lg font-bold text-white mb-3">카드 선택</h3>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {playerCards.map(card => {
            const baseCard = CHARACTERS_BY_ID[card.cardId];
            if (!baseCard) return null;

            const stats = getEffectiveStats(card);
            const power = calculateTotalPower(stats);

            return (
              <button
                key={card.cardId}
                onClick={() => onSelectCard(
                  selectedCardId === card.cardId ? null : card.cardId
                )}
                className={`rounded-lg p-2 transition-all ${
                  selectedCardId === card.cardId
                    ? 'bg-purple-700 ring-2 ring-purple-400'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="text-2xl">{ATTRIBUTES[baseCard.attribute].icon}</div>
                <div className="text-xs text-white truncate">{baseCard.name.ko}</div>
                <div className="text-xs text-gray-400">Lv.{card.level}</div>
                <div className="text-xs text-purple-400">{power}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 선택된 카드 분석 */}
      {cardAnalysis ? (
        <div className="bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span>{ATTRIBUTES[cardAnalysis.attribute].icon}</span>
            {cardAnalysis.name}
          </h3>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">
                {cardAnalysis.totalPower}
              </div>
              <div className="text-sm text-gray-400">총 전투력</div>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="text-lg font-bold text-yellow-400">
                {cardAnalysis.grade}
              </div>
              <div className="text-sm text-gray-400">등급</div>
            </div>
          </div>

          {/* 상성 */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h4 className="text-sm font-bold text-green-400 mb-2">강한 상대</h4>
              <div className="space-y-1">
                {cardAnalysis.strongAgainst.map(m => (
                  <div key={m.attribute} className="text-xs text-gray-300 flex items-center gap-1">
                    <span>{ATTRIBUTES[m.attribute].icon}</span>
                    {m.attributeName} (x{m.multiplier})
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-400 mb-2">약한 상대</h4>
              <div className="space-y-1">
                {cardAnalysis.weakAgainst.map(m => (
                  <div key={m.attribute} className="text-xs text-gray-300 flex items-center gap-1">
                    <span>{ATTRIBUTES[m.attribute].icon}</span>
                    {m.attributeName}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 최적/최악 경기장 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-bold text-green-400 mb-2">최적 경기장</h4>
              <div className="space-y-1">
                {cardAnalysis.bestArenas.map(a => (
                  <div key={a.arena.id} className="text-xs text-gray-300">
                    {a.arena.name.ko} ({a.score.toFixed(0)}점)
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-400 mb-2">최악 경기장</h4>
              <div className="space-y-1">
                {cardAnalysis.worstArenas.map(a => (
                  <div key={a.arena.id} className="text-xs text-gray-300">
                    {a.arena.name.ko} ({a.score.toFixed(0)}점)
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-8 flex flex-col items-center justify-center">
          <div className="text-4xl mb-3">🃏</div>
          <p className="text-gray-400">카드를 선택하면 상세 분석을 볼 수 있습니다</p>
        </div>
      )}
    </motion.div>
  );
}

// ========================================
// 미니 대시보드 (인라인용)
// ========================================

interface MiniStrategyPanelProps {
  playerCards: PlayerCard[];
  opponentCards?: CharacterCard[];
  onOpenFull?: () => void;
}

export function MiniStrategyPanel({
  playerCards,
  opponentCards,
  onOpenFull
}: MiniStrategyPanelProps) {
  const crewAnalysis = useMemo(() =>
    analyzeCrewComposition(playerCards),
    [playerCards]
  );

  const matchupAnalysis = useMemo(() =>
    opponentCards && opponentCards.length > 0
      ? analyzeMatchup(playerCards, opponentCards, ALL_ARENAS)
      : null,
    [playerCards, opponentCards]
  );

  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-bold text-purple-400 flex items-center gap-1">
          <span>📊</span> 전략 요약
        </h4>
        {onOpenFull && (
          <button
            onClick={onOpenFull}
            className="text-xs text-gray-400 hover:text-white"
          >
            상세보기 →
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-700/50 rounded p-2">
          <div className="text-gray-400">전투력</div>
          <div className="text-white font-bold">{crewAnalysis.averagePower.toFixed(0)}</div>
        </div>
        <div className="bg-gray-700/50 rounded p-2">
          <div className="text-gray-400">밸런스</div>
          <div className={`font-bold ${
            crewAnalysis.attributeBalance === 'BALANCED' ? 'text-green-400' :
            crewAnalysis.attributeBalance === 'SPECIALIZED' ? 'text-blue-400' : 'text-red-400'
          }`}>
            {crewAnalysis.attributeBalance === 'BALANCED' ? '균형' :
             crewAnalysis.attributeBalance === 'SPECIALIZED' ? '특화' : '불균형'}
          </div>
        </div>
      </div>

      {matchupAnalysis && (
        <div className="mt-2 p-2 bg-gray-700/50 rounded">
          <div className="text-xs text-gray-400">매치업</div>
          <div className={`font-bold ${
            matchupAnalysis.overallAdvantage === 'FAVORABLE' ? 'text-green-400' :
            matchupAnalysis.overallAdvantage === 'UNFAVORABLE' ? 'text-red-400' : 'text-yellow-400'
          }`}>
            {matchupAnalysis.overallAdvantage === 'FAVORABLE' ? '유리' :
             matchupAnalysis.overallAdvantage === 'UNFAVORABLE' ? '불리' : '균형'}
            {' '}({matchupAnalysis.advantageScore > 0 ? '+' : ''}{matchupAnalysis.advantageScore.toFixed(0)})
          </div>
        </div>
      )}
    </div>
  );
}
