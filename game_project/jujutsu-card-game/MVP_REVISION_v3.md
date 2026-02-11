# 영역전개 MVP 3차 수정 요청서

## 수정 사항 6가지

---

## 1. 승수 반영 버그 수정

### 현재 문제
- 경기에서 승리해도 순위표의 승수/승점이 반영되지 않음

### 요청 사항
경기 종료 시 결과를 시즌 데이터에 정확히 반영해주세요.

```typescript
// 경기 종료 후 처리
function finishMatch(result: MatchResult) {
  const { currentSeason } = useGameStore.getState();
  
  // 플레이어 크루 찾기
  const playerCrew = currentSeason.crews.find(c => c.isPlayer);
  const opponentCrew = currentSeason.crews.find(c => c.id === result.opponentId);
  
  if (!playerCrew || !opponentCrew) return;
  
  // 경기 수 증가
  playerCrew.stats.played += 1;
  opponentCrew.stats.played += 1;
  
  // 라운드 승리 수 기록
  playerCrew.stats.roundWins += result.playerScore;
  opponentCrew.stats.roundWins += result.opponentScore;
  
  // 승패 및 승점 반영
  if (result.playerScore > result.opponentScore) {
    // 플레이어 승리
    playerCrew.stats.wins += 1;
    playerCrew.stats.points += 3;
    opponentCrew.stats.losses += 1;
  } else if (result.playerScore < result.opponentScore) {
    // 플레이어 패배
    playerCrew.stats.losses += 1;
    opponentCrew.stats.wins += 1;
    opponentCrew.stats.points += 3;
  } else {
    // 무승부
    playerCrew.stats.draws += 1;
    playerCrew.stats.points += 1;
    opponentCrew.stats.draws += 1;
    opponentCrew.stats.points += 1;
  }
  
  // 상태 저장
  updateSeason(currentSeason);
}
```

---

## 2. 크루 구성 등급 제한 복원

### 현재 문제
- 덱 구성에 등급 제한이 없어서 S등급만 5장으로 구성 가능

### 요청 사항
크루 편집 시 등급 제한을 적용해주세요.

```typescript
// 등급별 제한
const GRADE_LIMITS = {
  S: 1,  // 최대 1장
  A: 2,  // 최대 2장
  B: 5,  // 제한 없음
  C: 5,  // 제한 없음
  D: 5   // 제한 없음
};

// 크루 유효성 검사
function validateCrew(cards: CharacterCard[]): { valid: boolean; error?: string } {
  if (cards.length !== 5) {
    return { valid: false, error: "크루는 5장으로 구성해야 합니다." };
  }
  
  // 등급별 카운트
  const gradeCount: Record<Grade, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
  cards.forEach(card => gradeCount[card.grade]++);
  
  // 제한 체크
  if (gradeCount.S > GRADE_LIMITS.S) {
    return { valid: false, error: `S등급은 최대 ${GRADE_LIMITS.S}장까지만 가능합니다.` };
  }
  if (gradeCount.A > GRADE_LIMITS.A) {
    return { valid: false, error: `A등급은 최대 ${GRADE_LIMITS.A}장까지만 가능합니다.` };
  }
  
  return { valid: true };
}

// 크루 관리 화면에서 제한 표시
<div className="text-sm text-gray-400 mb-4">
  등급 제한: S등급 최대 1장 | A등급 최대 2장
</div>

// 카드 선택 시 제한 초과하면 비활성화
<button
  disabled={wouldExceedLimit(card)}
  className={wouldExceedLimit(card) ? 'opacity-50 cursor-not-allowed' : ''}
>
  {card.name.ko}
</button>
{wouldExceedLimit(card) && (
  <span className="text-red-400 text-xs">등급 제한 초과</span>
)}
```

---

## 3. 카드 상세 정보 위치 개선

### 현재 문제
- 카드 설명이 화면 하단에 있어서 시선 이동이 불편함

### 요청 사항
카드 클릭/호버 시 카드 옆에 툴팁 형태로 표시하거나, 우측 패널에 고정 표시해주세요.

```tsx
// 방법 1: 카드 옆 툴팁 (추천)
<div className="relative">
  <CardDisplay card={card} onClick={() => setSelectedCard(card)} />
  
  {selectedCard?.id === card.id && (
    <div className="absolute left-full top-0 ml-2 z-50 w-72">
      <CardDetailTooltip card={card} arena={currentArena} />
    </div>
  )}
</div>

// 방법 2: 우측 고정 패널
// 대전 화면 레이아웃
<div className="flex gap-4">
  {/* 왼쪽: 내 크루 */}
  <div className="w-48">
    <MyCrewPanel />
  </div>
  
  {/* 중앙: 대전 영역 */}
  <div className="flex-1">
    <BattleArea />
  </div>
  
  {/* 오른쪽: 상대 크루 + 선택된 카드 정보 */}
  <div className="w-72">
    <OpponentCrewPanel />
    {selectedCard && (
      <CardDetailPanel card={selectedCard} arena={currentArena} />
    )}
  </div>
</div>

// CardDetailTooltip 컴포넌트
function CardDetailTooltip({ card, arena }) {
  return (
    <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl">
      <h4 className="font-bold text-white mb-1">{card.name.ko}</h4>
      
      {/* 고유 기술 */}
      <div className="bg-gray-700 rounded p-2 mb-2">
        <div className="text-yellow-400 font-bold text-sm">【{card.skill.name}】</div>
        <div className="text-gray-300 text-xs">{card.skill.description}</div>
        <div className="text-green-400 text-xs mt-1">{card.skill.effect.description}</div>
      </div>
      
      {/* 속성 상성 */}
      <div className="flex gap-4 text-xs mb-2">
        <div>
          <span className="text-green-400">강함:</span> {getAdvantageText(card)}
        </div>
        <div>
          <span className="text-red-400">약함:</span> {getWeaknessText(card)}
        </div>
      </div>
      
      {/* 경기장 효과 */}
      {arena && (
        <div className="text-xs text-blue-400">
          {getArenaEffectText(card, arena)}
        </div>
      )}
    </div>
  );
}
```

---

## 4. 대결 시 상대 카드 공개 연출

### 현재 문제
- 대결 버튼 누르면 바로 전투 시작
- 상대가 어떤 카드를 냈는지 확인할 틈이 없음

### 요청 사항
대결 버튼 클릭 → 카드 공개 연출 → 전투 진행 순서로 변경해주세요.

```tsx
// 대결 진행 단계
type BattlePhase = 'SELECT' | 'REVEAL' | 'COMBAT' | 'RESULT';

const [battlePhase, setBattlePhase] = useState<BattlePhase>('SELECT');
const [aiSelectedCard, setAiSelectedCard] = useState<CharacterCard | null>(null);

// 대결 버튼 클릭
function handleBattleClick() {
  // AI 카드 선택
  const aiCard = aiSelectCard(aiCrew, aiUsedCards, arena, difficulty);
  setAiSelectedCard(aiCard);
  
  // 카드 공개 단계로 전환
  setBattlePhase('REVEAL');
}

// 카드 공개 화면
{battlePhase === 'REVEAL' && (
  <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
    <div className="text-center">
      <div className="text-2xl text-white mb-8">카드 공개!</div>
      
      <div className="flex items-center justify-center gap-16">
        {/* 내 카드 */}
        <div className="transform transition-all duration-500">
          <CardDisplay card={selectedCard} size="large" />
          <div className="mt-2 text-blue-400 font-bold">나의 선택</div>
        </div>
        
        <div className="text-4xl text-red-500 font-bold">VS</div>
        
        {/* 상대 카드 (뒤집기 애니메이션) */}
        <div className="transform transition-all duration-500 animate-flip">
          <CardDisplay card={aiSelectedCard} size="large" />
          <div className="mt-2 text-red-400 font-bold">상대의 선택</div>
        </div>
      </div>
      
      {/* 상성 미리보기 */}
      <div className="mt-8 text-lg">
        {getAttributeAdvantageText(selectedCard, aiSelectedCard)}
      </div>
      
      {/* 전투 시작 버튼 */}
      <button
        onClick={() => setBattlePhase('COMBAT')}
        className="mt-8 px-8 py-3 bg-red-600 hover:bg-red-500 
                   text-white font-bold rounded-lg text-xl"
      >
        전투 시작!
      </button>
    </div>
  </div>
)}

// 속성 상성 텍스트
function getAttributeAdvantageText(myCard, enemyCard) {
  if (ATTRIBUTE_ADVANTAGE[myCard.attribute].includes(enemyCard.attribute)) {
    return <span className="text-green-400">💪 속성 유리! (데미지 ×1.5)</span>;
  }
  if (ATTRIBUTE_ADVANTAGE[enemyCard.attribute].includes(myCard.attribute)) {
    return <span className="text-red-400">😰 속성 불리... (데미지 ×0.7)</span>;
  }
  return <span className="text-gray-400">속성 동등</span>;
}
```

---

## 5. 전투 시스템 개선 (공방 연장)

### 현재 문제
- 한 번의 공격으로 대부분 승부가 결정됨
- 전투가 너무 빨리 끝나서 긴장감이 없음

### 요청 사항
여러 턴에 걸친 공방이 이뤄지도록 전투 시스템을 수정해주세요.

```typescript
// 전투 시스템 변경: 턴제 공방
interface CombatState {
  playerHp: number;
  aiHp: number;
  turn: number;
  maxTurns: number;
  log: BattleMessage[];
}

function runCombat(playerCard: CombatCard, aiCard: CombatCard, arena: Arena): CombatResult {
  const state: CombatState = {
    playerHp: playerCard.hp,
    aiHp: aiCard.hp,
    turn: 0,
    maxTurns: 5,  // 최대 5턴
    log: []
  };
  
  // 선공 결정
  const playerFirst = playerCard.spd >= aiCard.spd;
  
  state.log.push({
    text: `${playerFirst ? playerCard.name : aiCard.name}이(가) 선공!`,
    type: 'normal'
  });
  
  // 턴 진행
  while (state.turn < state.maxTurns && state.playerHp > 0 && state.aiHp > 0) {
    state.turn++;
    state.log.push({ text: `── 턴 ${state.turn} ──`, type: 'turn' });
    
    if (playerFirst) {
      // 플레이어 공격
      const playerDmg = calculateTurnDamage(playerCard, aiCard, arena, state);
      state.aiHp -= playerDmg;
      state.log.push({ 
        text: `${playerCard.name.ko}의 공격! ${playerDmg} 데미지!`, 
        type: 'damage' 
      });
      
      if (state.aiHp <= 0) break;
      
      // AI 공격
      const aiDmg = calculateTurnDamage(aiCard, playerCard, arena, state);
      state.playerHp -= aiDmg;
      state.log.push({ 
        text: `${aiCard.name.ko}의 반격! ${aiDmg} 데미지!`, 
        type: 'damage' 
      });
    } else {
      // AI 선공
      const aiDmg = calculateTurnDamage(aiCard, playerCard, arena, state);
      state.playerHp -= aiDmg;
      state.log.push({ 
        text: `${aiCard.name.ko}의 공격! ${aiDmg} 데미지!`, 
        type: 'damage' 
      });
      
      if (state.playerHp <= 0) break;
      
      // 플레이어 반격
      const playerDmg = calculateTurnDamage(playerCard, aiCard, arena, state);
      state.aiHp -= playerDmg;
      state.log.push({ 
        text: `${playerCard.name.ko}의 반격! ${playerDmg} 데미지!`, 
        type: 'damage' 
      });
    }
    
    // HP 상태 표시
    state.log.push({
      text: `[HP] ${playerCard.name.ko}: ${Math.max(0, state.playerHp)} | ${aiCard.name.ko}: ${Math.max(0, state.aiHp)}`,
      type: 'status'
    });
  }
  
  // 결과 판정
  const winner = state.aiHp <= 0 ? 'PLAYER' : 
                 state.playerHp <= 0 ? 'AI' : 
                 (state.playerHp > state.aiHp ? 'PLAYER' : 
                  state.aiHp > state.playerHp ? 'AI' : 'DRAW');
  
  return { winner, log: state.log, finalHp: { player: state.playerHp, ai: state.aiHp } };
}

// 턴당 데미지 계산 (기존보다 낮게 조정)
function calculateTurnDamage(attacker, defender, arena, state) {
  const baseDamage = attacker.atk * 0.4;  // 기본 데미지 낮춤
  const attrMultiplier = getAttributeMultiplier(attacker, defender);
  const ceBonus = 1 + (attacker.ce / 200);  // CE 효과도 낮춤
  const arenaBonus = getArenaBonus(attacker, arena);
  
  let damage = (baseDamage * attrMultiplier * ceBonus * (1 + arenaBonus)) - (defender.def * 0.3);
  
  // 스킬 발동 체크
  if (shouldActivateSkill(attacker, state)) {
    damage = applySkillEffect(damage, attacker, defender);
    state.log.push({
      text: `🔥 【${attacker.skill.name}】 발동!`,
      type: 'skill'
    });
  }
  
  return Math.max(1, Math.floor(damage));
}

// 전투 로그 표시 속도 조절
const BATTLE_LOG_SPEED = 600;  // 0.6초 간격 (기존 1.2초에서 단축)
```

---

## 6. 양측 크루 카드 표시 UI

### 현재 문제
- 상대 크루가 어떤 카드를 보유했는지 확인 불가
- 전략적 판단이 어려움

### 요청 사항
대전 화면에서 양측 크루를 좌우로 배치해주세요.

```tsx
// 대전 화면 레이아웃
<div className="flex h-full">
  {/* 좌측: 내 크루 */}
  <div className="w-56 bg-gray-800/50 p-4 flex flex-col">
    <h3 className="text-blue-400 font-bold mb-3 text-center">내 크루</h3>
    <div className="flex flex-col gap-2">
      {playerCrew.map(card => (
        <div 
          key={card.id}
          onClick={() => handleCardSelect(card)}
          className={`
            p-2 rounded-lg cursor-pointer transition-all
            ${usedCards.includes(card.id) ? 'opacity-40 cursor-not-allowed' : 'hover:bg-gray-700'}
            ${selectedCard?.id === card.id ? 'ring-2 ring-blue-500 bg-blue-900/30' : 'bg-gray-700/50'}
          `}
        >
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded text-xs flex items-center justify-center ${getGradeBg(card.grade)}`}>
              {card.grade}
            </span>
            <span className="text-white text-sm flex-1">{card.name.ko}</span>
            <span className="text-xs" style={{ color: COLORS.attribute[card.attribute] }}>
              {ATTRIBUTES[card.attribute].icon}
            </span>
          </div>
          {usedCards.includes(card.id) && (
            <span className="text-xs text-gray-500">사용됨</span>
          )}
        </div>
      ))}
    </div>
  </div>

  {/* 중앙: 대전 영역 */}
  <div className="flex-1 flex flex-col items-center justify-center p-4">
    {/* 경기장 정보 */}
    <div className="text-center mb-6">
      <div className="text-lg font-bold text-white">{arena.name.ko}</div>
      <div className="text-sm text-gray-400">{arena.effects.map(e => e.description).join(' | ')}</div>
    </div>
    
    {/* VS 영역 */}
    <div className="flex items-center gap-8">
      <div className="w-48">
        {selectedCard ? (
          <CardDisplay card={selectedCard} size="medium" />
        ) : (
          <div className="w-48 h-64 border-2 border-dashed border-gray-600 rounded-lg 
                          flex items-center justify-center text-gray-500">
            카드를 선택하세요
          </div>
        )}
      </div>
      
      <div className="text-4xl font-bold text-red-500">VS</div>
      
      <div className="w-48">
        <div className="w-48 h-64 bg-gray-700 rounded-lg flex items-center justify-center">
          <span className="text-4xl">🎴</span>
        </div>
      </div>
    </div>
    
    {/* 대결 버튼 */}
    <button
      onClick={handleBattleClick}
      disabled={!selectedCard}
      className="mt-8 px-12 py-4 text-xl font-bold bg-gradient-to-r from-red-600 to-orange-500 
                 hover:from-red-500 hover:to-orange-400 disabled:from-gray-600 disabled:to-gray-500
                 text-white rounded-xl shadow-lg"
    >
      ⚔️ 대결!
    </button>
  </div>

  {/* 우측: 상대 크루 */}
  <div className="w-56 bg-gray-800/50 p-4 flex flex-col">
    <h3 className="text-red-400 font-bold mb-3 text-center">상대 크루</h3>
    <div className="flex flex-col gap-2">
      {opponentCrew.map(card => (
        <div 
          key={card.id}
          className={`
            p-2 rounded-lg bg-gray-700/50
            ${aiUsedCards.includes(card.id) ? 'opacity-40' : ''}
          `}
        >
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded text-xs flex items-center justify-center ${getGradeBg(card.grade)}`}>
              {card.grade}
            </span>
            <span className="text-white text-sm flex-1">{card.name.ko}</span>
            <span className="text-xs" style={{ color: COLORS.attribute[card.attribute] }}>
              {ATTRIBUTES[card.attribute].icon}
            </span>
          </div>
          {aiUsedCards.includes(card.id) && (
            <span className="text-xs text-gray-500">사용됨</span>
          )}
        </div>
      ))}
    </div>
    
    {/* 선택된 카드 상세 정보 */}
    {selectedCard && (
      <div className="mt-4 pt-4 border-t border-gray-700">
        <CardDetailPanel card={selectedCard} arena={arena} />
      </div>
    )}
  </div>
</div>
```

---

## 수정 우선순위

1. **[긴급]** 승수 반영 버그 - 게임 핵심 기능 고장
2. **[높음]** 크루 등급 제한 - 밸런스 붕괴 방지
3. **[높음]** 양측 크루 표시 UI - 전략적 플레이에 필수
4. **[중간]** 상대 카드 공개 연출 - UX 개선
5. **[중간]** 전투 공방 연장 - 게임성 향상
6. **[중간]** 카드 상세 정보 위치 - UX 개선

---

## Claude Code 프롬프트

```
영역전개 게임 MVP 3차 수정을 진행해주세요.

## 긴급 수정
1. 승수 미반영 버그 수정 - 경기 종료 시 시즌 데이터에 승패/승점 반영

## 기능 수정
2. 크루 등급 제한 복원 - S등급 최대 1장, A등급 최대 2장
3. 양측 크루 UI - 좌측에 내 크루, 우측에 상대 크루 표시 (사용된 카드 표시)
4. 카드 상세 정보를 우측 패널 하단에 표시
5. 대결 시 상대 카드 공개 연출 추가 (카드 공개 → 전투 시작 버튼)
6. 전투를 턴제 공방으로 변경 (최대 5턴, 턴마다 공격/반격)

첨부된 MVP_REVISION_v3.md 파일의 상세 코드를 참고하여 구현해주세요.
```
