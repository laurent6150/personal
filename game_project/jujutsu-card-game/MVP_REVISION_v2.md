# 영역전개 MVP 2차 수정 요청서

## 수정 사항 3가지

---

## 1. UI/UX 전면 개선

### 현재 문제
- 화면이 중앙 정렬되지 않고 좌측으로 쏠려있음
- "대결" 버튼이 화면 최하단에 있어서 누르기 불편
- 카드 상세 패널이 화면 밖으로 밀려남
- 전체적인 레이아웃 밸런스가 맞지 않음

### 요청 사항

#### 1-1. 전체 레이아웃 중앙 정렬
```tsx
// App.tsx 또는 최상위 레이아웃
<div className="min-h-screen bg-gray-900 flex items-center justify-center">
  <div className="w-full max-w-6xl mx-auto px-4">
    {/* 게임 콘텐츠 */}
  </div>
</div>
```

#### 1-2. 대전 화면 레이아웃 재구성
```
┌─────────────────────────────────────────────────────────────┐
│ [나가기]          라운드 1/5  |  3점 선승          [설정] │
│                    당신 0 : 0 AI                            │
├─────────────────────────────────────────────────────────────┤
│                   【경기장: 복마전신】                        │
│              저주 +25% | 모든 캐릭터 DEF -3                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│     ┌─────────┐                    ┌─────────┐              │
│     │         │                    │         │              │
│     │ 내 카드  │       VS          │ AI 카드  │              │
│     │         │                    │  (???)  │              │
│     └─────────┘                    └─────────┘              │
│                                                             │
│                    [ 🔥 대결! ]                             │  ← 버튼 중앙 배치
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  사용 가능한 카드를 선택하세요                               │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                   │
│  │카드1│ │카드2│ │카드3│ │카드4│ │카드5│                   │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘                   │
├─────────────────────────────────────────────────────────────┤
│  【선택된 카드 정보】                                        │
│  후시구로 메구미 (B등급) - 원거리                            │
│  기술: 십종영보 - 팔악검 이승 | 식신 소환으로 방어 강화      │
│  상성: 💪신체, 👻혼백에 강함 / 👁️저주, 🔥변환에 약함         │
└─────────────────────────────────────────────────────────────┘
```

#### 1-3. 대결 버튼 위치 및 스타일 개선
```tsx
// 대결 버튼을 VS 영역 바로 아래, 중앙에 크게 배치
<div className="flex justify-center my-6">
  <button 
    onClick={handleBattle}
    disabled={!selectedCard}
    className="px-12 py-4 text-2xl font-bold text-white 
               bg-gradient-to-r from-red-600 to-orange-500 
               hover:from-red-500 hover:to-orange-400
               disabled:from-gray-600 disabled:to-gray-500
               rounded-xl shadow-lg transform hover:scale-105 
               transition-all duration-200"
  >
    ⚔️ 대결!
  </button>
</div>
```

#### 1-4. 카드 상세 패널 위치 조정
```tsx
// 화면 하단에 고정, 카드 선택 영역 아래에 배치
<div className="mt-4 p-4 bg-gray-800 rounded-lg">
  {selectedCard ? (
    <div className="flex items-center gap-6">
      <div className="text-lg font-bold">{selectedCard.name.ko}</div>
      <div className="text-yellow-400">【{selectedCard.skill.name}】</div>
      <div className="text-gray-300 text-sm flex-1">{selectedCard.skill.description}</div>
      <div className="text-sm">
        <span className="text-green-400">강함: {getAdvantageText(selectedCard)}</span>
        <span className="mx-2">|</span>
        <span className="text-red-400">약함: {getWeaknessText(selectedCard)}</span>
      </div>
    </div>
  ) : (
    <div className="text-gray-500 text-center">카드를 선택하세요</div>
  )}
</div>
```

---

## 2. 전투 텍스트 연출 추가

### 현재 문제
- 대결 시 바로 결과만 표시됨
- 어떤 과정으로 승패가 결정됐는지 알 수 없음
- 몰입감이 부족함

### 요청 사항
마이스타크래프트처럼 전투 과정을 텍스트로 연출해주세요.

#### 2-1. 전투 로그 컴포넌트
```tsx
// components/Battle/BattleLog.tsx

interface BattleLogProps {
  playerCard: CharacterCard;
  aiCard: CharacterCard;
  result: RoundResult;
  onComplete: () => void;
}

export function BattleLog({ playerCard, aiCard, result, onComplete }: BattleLogProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  // 전투 로그 메시지 생성
  const battleMessages = useMemo(() => generateBattleMessages(playerCard, aiCard, result), []);
  
  // 순차적으로 메시지 표시
  useEffect(() => {
    if (currentStep < battleMessages.length) {
      const timer = setTimeout(() => setCurrentStep(prev => prev + 1), 1200);
      return () => clearTimeout(timer);
    } else {
      // 모든 메시지 표시 후 2초 대기
      const timer = setTimeout(onComplete, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-8 max-w-2xl w-full mx-4">
        {/* 카드 대결 표시 */}
        <div className="flex justify-center items-center gap-8 mb-6">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{playerCard.name.ko}</div>
            <div className="text-sm text-gray-400">{ATTRIBUTES[playerCard.attribute].ko}</div>
          </div>
          <div className="text-3xl text-red-500 font-bold">VS</div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{aiCard.name.ko}</div>
            <div className="text-sm text-gray-400">{ATTRIBUTES[aiCard.attribute].ko}</div>
          </div>
        </div>
        
        {/* 전투 로그 */}
        <div className="bg-gray-800 rounded-lg p-4 h-64 overflow-y-auto">
          {battleMessages.slice(0, currentStep).map((msg, idx) => (
            <div 
              key={idx} 
              className={`mb-2 ${msg.type === 'critical' ? 'text-yellow-400 font-bold' : 
                                 msg.type === 'damage' ? 'text-red-400' :
                                 msg.type === 'skill' ? 'text-purple-400' :
                                 msg.type === 'result' ? 'text-2xl font-bold text-center mt-4' :
                                 'text-gray-300'}`}
            >
              {msg.text}
            </div>
          ))}
        </div>
        
        {/* 스킵 버튼 */}
        <div className="mt-4 text-center">
          <button 
            onClick={onComplete}
            className="text-gray-500 hover:text-white text-sm"
          >
            스킵 →
          </button>
        </div>
      </div>
    </div>
  );
}
```

#### 2-2. 전투 메시지 생성 함수
```typescript
// utils/battleMessages.ts

interface BattleMessage {
  text: string;
  type: 'normal' | 'skill' | 'damage' | 'critical' | 'result';
}

export function generateBattleMessages(
  playerCard: CharacterCard, 
  aiCard: CharacterCard, 
  result: RoundResult
): BattleMessage[] {
  const messages: BattleMessage[] = [];
  const calc = result.calculation;
  
  // 1. 대결 시작
  messages.push({ 
    text: `${playerCard.name.ko} vs ${aiCard.name.ko}!`, 
    type: 'normal' 
  });
  
  // 2. 속성 상성 체크
  if (calc.attributeMultiplier.player > 1) {
    messages.push({ 
      text: `💪 ${playerCard.name.ko}의 ${ATTRIBUTES[playerCard.attribute].ko} 속성이 유리하다!`, 
      type: 'critical' 
    });
  } else if (calc.attributeMultiplier.player < 1) {
    messages.push({ 
      text: `😰 ${playerCard.name.ko}의 속성이 불리하다...`, 
      type: 'normal' 
    });
  }
  
  // 3. 선공 판정
  const playerFirst = playerCard.spd >= aiCard.spd;
  messages.push({ 
    text: playerFirst 
      ? `⚡ ${playerCard.name.ko}이(가) 먼저 움직인다!` 
      : `⚡ ${aiCard.name.ko}이(가) 먼저 움직인다!`, 
    type: 'normal' 
  });
  
  // 4. 스킬 발동 체크
  if (calc.skillsActivated.includes(playerCard.id)) {
    messages.push({ 
      text: `🔥 ${playerCard.name.ko}의 【${playerCard.skill.name}】 발동!`, 
      type: 'skill' 
    });
    messages.push({ 
      text: `   → ${playerCard.skill.effect.description}`, 
      type: 'skill' 
    });
  }
  
  if (calc.skillsActivated.includes(aiCard.id)) {
    messages.push({ 
      text: `🔥 ${aiCard.name.ko}의 【${aiCard.skill.name}】 발동!`, 
      type: 'skill' 
    });
  }
  
  // 5. 데미지 교환
  messages.push({ 
    text: `💥 ${playerCard.name.ko}이(가) ${calc.playerDamage} 데미지를 입혔다!`, 
    type: 'damage' 
  });
  messages.push({ 
    text: `💥 ${aiCard.name.ko}이(가) ${calc.aiDamage} 데미지를 입혔다!`, 
    type: 'damage' 
  });
  
  // 6. 결과
  if (result.winner === 'PLAYER') {
    messages.push({ 
      text: `🏆 ${playerCard.name.ko} 승리!`, 
      type: 'result' 
    });
  } else if (result.winner === 'AI') {
    messages.push({ 
      text: `💀 ${aiCard.name.ko} 승리...`, 
      type: 'result' 
    });
  } else {
    messages.push({ 
      text: `🤝 무승부!`, 
      type: 'result' 
    });
  }
  
  return messages;
}
```

---

## 3. 시즌 & 리그 시스템 추가

### 현재 문제
- 5라운드 경기 1회로 게임 종료
- 지속적인 플레이 동기 부족
- 성장 시스템이 의미 없음

### 요청 사항
리그 형태의 시즌 시스템을 추가해주세요.

#### 3-1. 시즌/리그 데이터 구조
```typescript
// types/season.ts

interface Season {
  id: number;                    // 시즌 번호 (1, 2, 3...)
  status: 'IN_PROGRESS' | 'COMPLETED';
  startedAt: Date;
  completedAt?: Date;
  
  // 리그 참가 크루들 (플레이어 + AI 크루들)
  crews: LeagueCrew[];
  
  // 경기 기록
  matches: LeagueMatch[];
  
  // 시즌 결과
  champion?: string;             // 우승 크루 ID
}

interface LeagueCrew {
  id: string;
  name: string;
  isPlayer: boolean;             // 플레이어 크루 여부
  cards: string[];               // 카드 ID 5장
  
  // 시즌 성적
  stats: {
    played: number;              // 경기 수
    wins: number;                // 승리
    losses: number;              // 패배
    draws: number;               // 무승부
    points: number;              // 승점 (승리 3점, 무승부 1점)
    roundWins: number;           // 총 라운드 승리 수 (타이브레이커용)
  };
}

interface LeagueMatch {
  id: string;
  seasonId: number;
  homeCrewId: string;
  awayCrewId: string;
  result?: {
    homeScore: number;           // 홈 라운드 승리 수
    awayScore: number;           // 어웨이 라운드 승리 수
    winner: 'HOME' | 'AWAY' | 'DRAW';
  };
  rounds: RoundResult[];
  playedAt?: Date;
}
```

#### 3-2. AI 크루 생성
```typescript
// data/aiCrews.ts

export const AI_CREWS: Omit<LeagueCrew, 'stats'>[] = [
  {
    id: "curse_kings",
    name: "저주의 왕들",
    isPlayer: false,
    cards: ["ryomen_sukuna", "mahito", "jogo", "hanami", "choso"]
  },
  {
    id: "jujutsu_high_1st",
    name: "주술고전 1학년",
    isPlayer: false,
    cards: ["itadori_yuji", "fushiguro_megumi", "kugisaki_nobara", "panda", "inumaki_toge"]
  },
  {
    id: "zenin_clan",
    name: "젠인 가문",
    isPlayer: false,
    cards: ["fushiguro_toji", "maki_zenin", "naobito_zenin", "ogi_zenin", "jinichi_zenin"]
  },
  {
    id: "kyoto_school",
    name: "쿄토교 정예",
    isPlayer: false,
    cards: ["todo_aoi", "mei_mei", "nishimiya_momo", "kamo_noritoshi", "miwa_kasumi"]
  },
  {
    id: "special_grade",
    name: "특급 술사단",
    isPlayer: false,
    cards: ["gojo_satoru", "yuta_okkotsu", "yuki_tsukumo", "geto_suguru", "kenjaku"]
  }
];

// 플레이어 크루 포함 총 6팀 리그
```

#### 3-3. 리그 순위표 컴포넌트
```tsx
// components/League/LeagueTable.tsx

export function LeagueTable({ season }: { season: Season }) {
  // 승점순 정렬 (동점 시 라운드 승리 수)
  const sortedCrews = [...season.crews].sort((a, b) => {
    if (b.stats.points !== a.stats.points) return b.stats.points - a.stats.points;
    return b.stats.roundWins - a.stats.roundWins;
  });

  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden">
      <div className="bg-gray-700 px-4 py-3">
        <h3 className="text-lg font-bold text-white">시즌 {season.id} 순위표</h3>
      </div>
      <table className="w-full">
        <thead className="bg-gray-750">
          <tr className="text-gray-400 text-sm">
            <th className="px-4 py-2 text-left">순위</th>
            <th className="px-4 py-2 text-left">크루</th>
            <th className="px-4 py-2 text-center">경기</th>
            <th className="px-4 py-2 text-center">승</th>
            <th className="px-4 py-2 text-center">무</th>
            <th className="px-4 py-2 text-center">패</th>
            <th className="px-4 py-2 text-center">승점</th>
          </tr>
        </thead>
        <tbody>
          {sortedCrews.map((crew, idx) => (
            <tr 
              key={crew.id} 
              className={`border-t border-gray-700 ${crew.isPlayer ? 'bg-blue-900/30' : ''}`}
            >
              <td className="px-4 py-3 text-white font-bold">
                {idx + 1}
                {idx === 0 && ' 🏆'}
              </td>
              <td className="px-4 py-3 text-white">
                {crew.name}
                {crew.isPlayer && <span className="ml-2 text-xs text-blue-400">(YOU)</span>}
              </td>
              <td className="px-4 py-3 text-center text-gray-300">{crew.stats.played}</td>
              <td className="px-4 py-3 text-center text-green-400">{crew.stats.wins}</td>
              <td className="px-4 py-3 text-center text-gray-400">{crew.stats.draws}</td>
              <td className="px-4 py-3 text-center text-red-400">{crew.stats.losses}</td>
              <td className="px-4 py-3 text-center text-yellow-400 font-bold">{crew.stats.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### 3-4. 시즌 진행 플로우
```tsx
// components/League/SeasonHub.tsx

export function SeasonHub() {
  const { currentSeason, playerCrew } = useGameStore();
  
  // 다음 상대 찾기
  const nextOpponent = findNextOpponent(currentSeason, playerCrew.id);
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 시즌 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">시즌 {currentSeason.id}</h1>
        <p className="text-gray-400">
          {currentSeason.matches.filter(m => m.result).length} / {getTotalMatches(currentSeason)} 경기 진행
        </p>
      </div>
      
      {/* 순위표 */}
      <LeagueTable season={currentSeason} />
      
      {/* 다음 경기 */}
      {nextOpponent ? (
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-bold text-white mb-4">다음 경기</h3>
          <div className="flex items-center justify-between">
            <div className="text-center">
              <div className="text-xl font-bold text-blue-400">{playerCrew.name}</div>
              <div className="text-sm text-gray-400">YOUR CREW</div>
            </div>
            <div className="text-2xl text-red-500 font-bold">VS</div>
            <div className="text-center">
              <div className="text-xl font-bold text-white">{nextOpponent.name}</div>
              <div className="text-sm text-gray-400">
                {nextOpponent.stats.wins}승 {nextOpponent.stats.losses}패
              </div>
            </div>
          </div>
          <button 
            onClick={() => startMatch(nextOpponent)}
            className="w-full mt-6 py-4 bg-red-600 hover:bg-red-500 
                       text-white font-bold rounded-lg text-lg"
          >
            경기 시작!
          </button>
        </div>
      ) : (
        // 시즌 종료
        <SeasonComplete season={currentSeason} />
      )}
    </div>
  );
}
```

#### 3-5. 시즌 종료 및 다음 시즌 이동
```tsx
// components/League/SeasonComplete.tsx

export function SeasonComplete({ season }: { season: Season }) {
  const { startNewSeason } = useGameStore();
  const champion = season.crews.find(c => c.id === season.champion);
  const isPlayerChampion = champion?.isPlayer;

  return (
    <div className="mt-8 bg-gradient-to-b from-yellow-900/50 to-gray-800 rounded-lg p-8 text-center">
      <div className="text-6xl mb-4">🏆</div>
      <h2 className="text-2xl font-bold text-yellow-400 mb-2">
        시즌 {season.id} 종료!
      </h2>
      <div className="text-3xl font-bold text-white mb-4">
        {champion?.name} 우승!
      </div>
      {isPlayerChampion && (
        <div className="text-green-400 mb-6">축하합니다! 당신이 챔피언입니다!</div>
      )}
      
      <div className="bg-gray-800 rounded-lg p-4 mb-6">
        <h4 className="text-gray-400 mb-2">내 시즌 기록</h4>
        <div className="text-white">
          {playerStats.wins}승 {playerStats.draws}무 {playerStats.losses}패 
          (승점 {playerStats.points})
        </div>
      </div>
      
      <button
        onClick={() => startNewSeason()}
        className="px-8 py-4 bg-blue-600 hover:bg-blue-500 
                   text-white font-bold rounded-lg text-lg"
      >
        시즌 {season.id + 1} 시작하기 →
      </button>
      <p className="text-gray-500 text-sm mt-2">
        * 카드 레벨과 장비는 유지됩니다
      </p>
    </div>
  );
}
```

#### 3-6. 상태 저장 구조 업데이트
```typescript
// stores/gameStore.ts

interface GameState {
  // 기존 플레이어 데이터 (시즌 간 유지)
  playerCards: PlayerCard[];      // 레벨, 장비, 전적
  unlockedItems: string[];
  
  // 시즌 데이터
  currentSeason: Season;
  seasonHistory: Season[];        // 과거 시즌 기록
  
  // 플레이어 크루
  playerCrew: LeagueCrew;
}

// LocalStorage 저장 시 전체 데이터 유지
```

---

## 수정 우선순위

1. **[높음]** UI/UX 개선 - 플레이 불편 해소
2. **[높음]** 시즌/리그 시스템 - 게임의 핵심 루프
3. **[중간]** 전투 텍스트 연출 - 몰입감 향상

---

## Claude Code 프롬프트

```
영역전개 게임 MVP 2차 수정을 진행해주세요.

## 수정 사항

### 1. UI/UX 전면 개선
- 전체 레이아웃 중앙 정렬
- 대결 버튼을 VS 영역 바로 아래 중앙에 크게 배치
- 카드 상세 패널을 카드 선택 영역 아래에 가로로 배치
- 전반적인 여백과 정렬 개선

### 2. 전투 텍스트 연출 추가
- 대결 시 전투 과정을 텍스트로 순차 표시
- 속성 상성, 선공 판정, 스킬 발동, 데미지, 결과 순서로
- 각 메시지 1.2초 간격으로 표시
- 스킵 버튼으로 즉시 결과 확인 가능

### 3. 시즌 & 리그 시스템
- 6개 크루가 참가하는 리그 형태 (플레이어 1 + AI 5)
- 각 크루가 다른 모든 크루와 1회씩 대결 (총 5경기)
- 승리 3점, 무승부 1점, 패배 0점
- 시즌 종료 시 승점 1위가 우승
- 다음 시즌으로 이동 (카드 레벨/장비 유지)
- 메인 화면을 "시즌 허브"로 변경 (순위표 + 다음 경기)

첨부된 MVP_REVISION_v2.md 파일의 상세 코드를 참고하여 구현해주세요.
```
