# 영역전개 캐릭터 확장 데이터 Part 1

## 시스템 변경 사항

```typescript
// 크루 시스템 변경
const CREW_COUNT = 8;           // 4 → 8
const CARDS_PER_CREW = 6;       // 5 → 6
const REGULAR_SEASON_GAMES = 7; // 8크루 리그

// 등급 제한 변경 (크루당)
const GRADE_LIMITS = {
  '특급': 1,
  '1급': 2,
  '준1급': 6,
  '2급': 6,
  '3급': 6
};
```

---

## 특급 (8명)

### 1. 고죠 사토루
```typescript
{
  id: "gojo_satoru",
  name: { ko: "고죠 사토루", ja: "五条悟" },
  grade: "특급",
  attribute: "BARRIER",
  baseStats: { atk: 22, def: 20, spd: 22, ce: 25, hp: 100 },
  basicSkills: [
    { name: "무하 (無下)", type: "DEFENSE", effect: { type: "DAMAGE_REDUCE", value: 80 } },
    { name: "술순전환 - 창", type: "ATTACK", effect: { type: "DAMAGE", value: 140 } },
    { name: "술순전환 - 적", type: "ATTACK", effect: { type: "DAMAGE", value: 130, extra: "KNOCKBACK" } }
  ],
  ultimateSkill: {
    name: "무량공처 (無量空處)",
    description: "무한의 정보를 흘려보내 행동불능",
    effect: { type: "STUN", duration: 2, damage: 200 }
  }
}
```

### 2. 게토 스구루 (원본)
```typescript
{
  id: "geto_suguru",
  name: { ko: "게토 스구루", ja: "夏油傑" },
  grade: "특급",
  attribute: "CURSE",
  baseStats: { atk: 20, def: 18, spd: 18, ce: 24, hp: 95 },
  basicSkills: [
    { name: "저주령 조작", type: "ATTACK", effect: { type: "SUMMON_DAMAGE", value: 120 } },
    { name: "극노천", type: "ATTACK", effect: { type: "AOE_DAMAGE", value: 100 } },
    { name: "저주령 방벽", type: "DEFENSE", effect: { type: "DAMAGE_REDUCE", value: 50 } }
  ],
  ultimateSkill: {
    name: "우즈마키 (渦)",
    description: "모든 저주령을 하나로 합쳐 극대화된 일격",
    effect: { type: "DAMAGE", value: 280, piercing: true }
  }
}
```

### 3. 오코츠 유타
```typescript
{
  id: "yuta_okkotsu",
  name: { ko: "오코츠 유타", ja: "乙骨憂太" },
  grade: "특급",
  attribute: "CURSE",
  baseStats: { atk: 21, def: 18, spd: 20, ce: 26, hp: 95 },
  basicSkills: [
    { name: "반전술식", type: "UTILITY", effect: { type: "HEAL", value: 60 } },
    { name: "검술", type: "ATTACK", effect: { type: "DAMAGE", value: 130 } },
    { name: "술식 복사", type: "ATTACK", effect: { type: "COPY_ATTACK", multiplier: 0.9 } }
  ],
  ultimateSkill: {
    name: "리카 완전 현현",
    description: "특급 과오원령 리카의 완전한 힘",
    effect: { type: "SUMMON", damage: 260, defBonus: 40 }
  }
}
```

### 4. 츠쿠모 유키
```typescript
{
  id: "yuki_tsukumo",
  name: { ko: "츠쿠모 유키", ja: "九十九由基" },
  grade: "특급",
  attribute: "BODY",
  baseStats: { atk: 23, def: 16, spd: 19, ce: 22, hp: 90 },
  basicSkills: [
    { name: "성자 (星者)", type: "ATTACK", effect: { type: "DAMAGE", value: 150 } },
    { name: "가르다", type: "ATTACK", effect: { type: "SUMMON_DAMAGE", value: 110 } },
    { name: "질량 부여", type: "UTILITY", effect: { type: "DEF_BOOST", value: 40 } }
  ],
  ultimateSkill: {
    name: "흑점 (黑點)",
    description: "무한에 가까운 질량으로 블랙홀 생성",
    effect: { type: "INSTANT_KILL_OR_DAMAGE", threshold: 25, damage: 300 }
  }
}
```

### 5. 켄자쿠
```typescript
{
  id: "kenjaku",
  name: { ko: "켄자쿠", ja: "羂索" },
  grade: "특급",
  attribute: "SOUL",
  baseStats: { atk: 18, def: 17, spd: 17, ce: 24, hp: 100 },
  basicSkills: [
    { name: "저주령 조작", type: "ATTACK", effect: { type: "SUMMON_DAMAGE", value: 110 } },
    { name: "중력 조작", type: "UTILITY", effect: { type: "SLOW", value: 30 } },
    { name: "뇌격", type: "ATTACK", effect: { type: "DAMAGE", value: 120 } }
  ],
  ultimateSkill: {
    name: "태산부군제",
    description: "천년의 지혜로 완성한 금기술식",
    effect: { type: "DAMAGE", value: 240, skillSeal: true }
  }
}
```

### 6. 텐겐
```typescript
{
  id: "tengen",
  name: { ko: "텐겐", ja: "天元" },
  grade: "특급",
  attribute: "BARRIER",
  baseStats: { atk: 12, def: 25, spd: 10, ce: 28, hp: 120 },
  basicSkills: [
    { name: "결계술", type: "DEFENSE", effect: { type: "DAMAGE_REDUCE", value: 70 } },
    { name: "정보 인지", type: "UTILITY", effect: { type: "DODGE_BOOST", value: 40 } },
    { name: "저주력 방출", type: "ATTACK", effect: { type: "DAMAGE", value: 90 } }
  ],
  ultimateSkill: {
    name: "허공다면체",
    description: "무수한 결계가 중첩된 절대 방어",
    effect: { type: "INVINCIBLE", duration: 2, reflect: 50 }
  }
}
```

### 7. 료멘 스쿠나
```typescript
{
  id: "ryomen_sukuna",
  name: { ko: "료멘 스쿠나", ja: "両面宿儺" },
  grade: "특급",
  attribute: "CURSE",
  baseStats: { atk: 25, def: 18, spd: 22, ce: 24, hp: 95 },
  basicSkills: [
    { name: "해 (解)", type: "ATTACK", effect: { type: "DAMAGE", value: 130 } },
    { name: "첩 (捷)", type: "ATTACK", effect: { type: "MULTI_HIT", hits: 3, value: 55 } },
    { name: "■ (화염)", type: "ATTACK", effect: { type: "DAMAGE", value: 140, element: "FIRE" } }
  ],
  ultimateSkill: {
    name: "복마전신",
    description: "결계 없는 영역전개, 무한 참격",
    effect: { type: "CONTINUOUS_DAMAGE", value: 90, duration: 3, ignoreDefense: true }
  }
}
```

### 8. 후시구로 토지
```typescript
{
  id: "fushiguro_toji",
  name: { ko: "후시구로 토지", ja: "伏黒甚爾" },
  grade: "특급",
  attribute: "BODY",
  baseStats: { atk: 24, def: 15, spd: 25, ce: 0, hp: 90 },
  basicSkills: [
    { name: "유성의 검", type: "ATTACK", effect: { type: "DAMAGE", value: 140, ignoreBarrier: true } },
    { name: "만상의 뱀", type: "UTILITY", effect: { type: "WEAPON_CHANGE", atkBonus: 25 } },
    { name: "암살", type: "ATTACK", effect: { type: "CRITICAL_ATTACK", value: 160, critRate: 60 } }
  ],
  ultimateSkill: {
    name: "천역봉인",
    description: "모든 술식을 강제 해제",
    effect: { type: "SKILL_NULLIFY", damage: 200, dispel: true }
  }
}
```

---

## 1급 (16명)

### 9. 이타도리 유지
```typescript
{
  id: "itadori_yuji",
  name: { ko: "이타도리 유지", ja: "虎杖悠仁" },
  grade: "1급",
  attribute: "BODY",
  baseStats: { atk: 19, def: 16, spd: 20, ce: 18, hp: 90 },
  basicSkills: [
    { name: "일격", type: "ATTACK", effect: { type: "DAMAGE", value: 100 } },
    { name: "연타", type: "ATTACK", effect: { type: "MULTI_HIT", hits: 3, value: 40 } },
    { name: "발경", type: "ATTACK", effect: { type: "TRUE_DAMAGE", value: 80 } }
  ],
  ultimateSkill: {
    name: "흑섬 (黑閃)",
    description: "저주력의 핵심을 찌르는 일격",
    effect: { type: "CRITICAL_GUARANTEED", damage: 220, multiplier: 2.5 }
  }
}
```

### 10. 젠인 마키 (각성)
```typescript
{
  id: "maki_zenin_awakened",
  name: { ko: "젠인 마키 (각성)", ja: "禪院真希 (覚醒)" },
  grade: "1급",
  attribute: "BODY",
  baseStats: { atk: 22, def: 14, spd: 23, ce: 0, hp: 85 },
  basicSkills: [
    { name: "유성의 검", type: "ATTACK", effect: { type: "DAMAGE", value: 130, ignoreBarrier: true } },
    { name: "천여함수의 동체시력", type: "DEFENSE", effect: { type: "DODGE", chance: 70 } },
    { name: "연속 참격", type: "ATTACK", effect: { type: "MULTI_HIT", hits: 4, value: 40 } }
  ],
  ultimateSkill: {
    name: "천여함수 완성",
    description: "토지와 동등한 경지",
    effect: { type: "STAT_BOOST", atkBonus: 60, spdBonus: 40, damage: 180 }
  }
}
```

### 11. 나나미 켄토
```typescript
{
  id: "nanami_kento",
  name: { ko: "나나미 켄토", ja: "七海建人" },
  grade: "1급",
  attribute: "BODY",
  baseStats: { atk: 18, def: 17, spd: 16, ce: 18, hp: 88 },
  basicSkills: [
    { name: "십획상사", type: "ATTACK", effect: { type: "RATIO_DAMAGE", value: 110, bonusDamage: 40 } },
    { name: "둔도 일격", type: "ATTACK", effect: { type: "DAMAGE", value: 100 } },
    { name: "방어 태세", type: "DEFENSE", effect: { type: "DAMAGE_REDUCE", value: 45 } }
  ],
  ultimateSkill: {
    name: "시간외 노동",
    description: "리미터 해제, 모든 능력 극대화",
    effect: { type: "STAT_BOOST", atkBonus: 50, spdBonus: 30, damage: 180 }
  }
}
```

### 12. 죠고
```typescript
{
  id: "jogo",
  name: { ko: "죠고", ja: "漏瑚" },
  grade: "1급",
  attribute: "CONVERT",
  baseStats: { atk: 20, def: 12, spd: 16, ce: 22, hp: 85 },
  basicSkills: [
    { name: "화염탄", type: "ATTACK", effect: { type: "DAMAGE", value: 120, element: "FIRE" } },
    { name: "용암 분출", type: "ATTACK", effect: { type: "AOE_DAMAGE", value: 90 } },
    { name: "소각", type: "ATTACK", effect: { type: "BURN", value: 70, dotDamage: 25, duration: 2 } }
  ],
  ultimateSkill: {
    name: "개문돈갑 (철위산)",
    description: "태양 온도의 영역",
    effect: { type: "INSTANT_KILL_OR_DAMAGE", threshold: 30, damage: 280 }
  }
}
```

### 13. 하나미
```typescript
{
  id: "hanami",
  name: { ko: "하나미", ja: "花御" },
  grade: "1급",
  attribute: "CONVERT",
  baseStats: { atk: 16, def: 20, spd: 14, ce: 20, hp: 95 },
  basicSkills: [
    { name: "저주의 새싹", type: "ATTACK", effect: { type: "DAMAGE", value: 100 } },
    { name: "목룡", type: "ATTACK", effect: { type: "DAMAGE", value: 120 } },
    { name: "자연 흡수", type: "UTILITY", effect: { type: "HEAL", value: 50 } }
  ],
  ultimateSkill: {
    name: "화어",
    description: "모든 생물의 저주력을 강제 흡수",
    effect: { type: "DRAIN", value: 160, healPercent: 60 }
  }
}
```

### 14. 젠인 나오비토
```typescript
{
  id: "naobito_zenin",
  name: { ko: "젠인 나오비토", ja: "禪院直毘人" },
  grade: "1급",
  attribute: "BODY",
  baseStats: { atk: 17, def: 14, spd: 24, ce: 19, hp: 80 },
  basicSkills: [
    { name: "투사호법", type: "ATTACK", effect: { type: "DAMAGE", value: 110, guaranteed_first: true } },
    { name: "프레임 이동", type: "DEFENSE", effect: { type: "DODGE", chance: 65 } },
    { name: "연속 타격", type: "ATTACK", effect: { type: "MULTI_HIT", hits: 3, value: 45 } }
  ],
  ultimateSkill: {
    name: "시강원둔",
    description: "프레임을 완전히 지배",
    effect: { type: "SPEED_BOOST", spdBonus: 100, damage: 200, multiAttack: 5 }
  }
}
```

### 15. 젠인 나오야
```typescript
{
  id: "naoya_zenin",
  name: { ko: "젠인 나오야", ja: "禪院直哉" },
  grade: "1급",
  attribute: "BODY",
  baseStats: { atk: 18, def: 13, spd: 23, ce: 18, hp: 78 },
  basicSkills: [
    { name: "투사호법", type: "ATTACK", effect: { type: "DAMAGE", value: 105, guaranteed_first: true } },
    { name: "초월 속도", type: "ATTACK", effect: { type: "CRITICAL_ATTACK", value: 120, critRate: 40 } },
    { name: "프레임 회피", type: "DEFENSE", effect: { type: "DODGE", chance: 55 } }
  ],
  ultimateSkill: {
    name: "시강원둔",
    description: "투사호법의 영역",
    effect: { type: "DOMAIN", damage: 180, speedBoost: 80 }
  }
}
```

### 16. 히구루마 히로미
```typescript
{
  id: "hiromi_higuruma",
  name: { ko: "히구루마 히로미", ja: "日車寛見" },
  grade: "1급",
  attribute: "BARRIER",
  baseStats: { atk: 16, def: 18, spd: 15, ce: 22, hp: 85 },
  basicSkills: [
    { name: "법정봉 타격", type: "ATTACK", effect: { type: "DAMAGE", value: 90 } },
    { name: "심문", type: "UTILITY", effect: { type: "WEAKNESS_EXPOSE", defReduce: 30 } },
    { name: "증거 수집", type: "UTILITY", effect: { type: "GAUGE_CHARGE", value: 30 } }
  ],
  ultimateSkill: {
    name: "사형선고",
    description: "유죄 판결 시 처형",
    effect: { type: "EXECUTE", threshold: 40, damage: 300, ceSeal: true }
  }
}
```

### 17. 카시모 하지메
```typescript
{
  id: "hajime_kashimo",
  name: { ko: "카시모 하지메", ja: "鹿紫雲一" },
  grade: "1급",
  attribute: "CONVERT",
  baseStats: { atk: 21, def: 14, spd: 21, ce: 20, hp: 82 },
  basicSkills: [
    { name: "뇌격", type: "ATTACK", effect: { type: "DAMAGE", value: 120, element: "LIGHTNING" } },
    { name: "방전", type: "ATTACK", effect: { type: "AOE_DAMAGE", value: 85 } },
    { name: "전격 가속", type: "UTILITY", effect: { type: "SPD_BOOST", value: 40 } }
  ],
  ultimateSkill: {
    name: "환상의 수 (호박)",
    description: "번개의 신으로 변신",
    effect: { type: "TRANSFORM", damage: 280, spdBonus: 60, duration: 3 }
  }
}
```

### 18. 이시고리 류
```typescript
{
  id: "ryu_ishigori",
  name: { ko: "이시고리 류", ja: "石流龍" },
  grade: "1급",
  attribute: "RANGE",
  baseStats: { atk: 23, def: 15, spd: 14, ce: 20, hp: 88 },
  basicSkills: [
    { name: "저주력 포격", type: "ATTACK", effect: { type: "DAMAGE", value: 140 } },
    { name: "연속 포격", type: "ATTACK", effect: { type: "MULTI_HIT", hits: 3, value: 50 } },
    { name: "포격 집중", type: "UTILITY", effect: { type: "ATK_BOOST", value: 50 } }
  ],
  ultimateSkill: {
    name: "화산두",
    description: "최대 출력 저주력 방출",
    effect: { type: "DAMAGE", value: 320, chargeBonus: true }
  }
}
```

### 19. 우로 타카코
```typescript
{
  id: "takako_uro",
  name: { ko: "우로 타카코", ja: "烏路陽子" },
  grade: "1급",
  attribute: "BARRIER",
  baseStats: { atk: 18, def: 16, spd: 20, ce: 19, hp: 82 },
  basicSkills: [
    { name: "공간 조작", type: "ATTACK", effect: { type: "DAMAGE", value: 110, piercing: true } },
    { name: "반사", type: "DEFENSE", effect: { type: "REFLECT", value: 60 } },
    { name: "공간 비틀기", type: "ATTACK", effect: { type: "AOE_DAMAGE", value: 90 } }
  ],
  ultimateSkill: {
    name: "하늘 접기",
    description: "하늘 전체를 접어 압축",
    effect: { type: "DAMAGE", value: 240, defIgnore: 50 }
  }
}
```

### 20. 하카리 킨지
```typescript
{
  id: "kinji_hakari",
  name: { ko: "하카리 킨지", ja: "秤金次" },
  grade: "1급",
  attribute: "BARRIER",
  baseStats: { atk: 19, def: 16, spd: 18, ce: 21, hp: 85 },
  basicSkills: [
    { name: "권투", type: "ATTACK", effect: { type: "DAMAGE", value: 100 } },
    { name: "도박", type: "UTILITY", effect: { type: "RANDOM_GAUGE", min: 10, max: 50 } },
    { name: "러쉬", type: "ATTACK", effect: { type: "MULTI_HIT", hits: 4, value: 30 } }
  ],
  ultimateSkill: {
    name: "좌보존완신팔권",
    description: "잭팟! 무한 저주력 + 불사",
    effect: { type: "JACKPOT", invincible: true, ceInfinite: true, duration: 3, damage: 200 }
  }
}
```

### 21. 쵸소
```typescript
{
  id: "choso",
  name: { ko: "쵸소", ja: "脹相" },
  grade: "1급",
  attribute: "CURSE",
  baseStats: { atk: 18, def: 16, spd: 17, ce: 19, hp: 88 },
  basicSkills: [
    { name: "적혈조작 - 천혈", type: "ATTACK", effect: { type: "DAMAGE", value: 115 } },
    { name: "적혈조작 - 혈인", type: "ATTACK", effect: { type: "MULTI_HIT", hits: 4, value: 35 } },
    { name: "혈갑", type: "DEFENSE", effect: { type: "DAMAGE_REDUCE", value: 50 } }
  ],
  ultimateSkill: {
    name: "초노바",
    description: "혈액을 독으로 변환 폭발",
    effect: { type: "POISON_EXPLOSION", damage: 220, dotDamage: 35, duration: 2 }
  }
}
```

### 22. 토도 아오이
```typescript
{
  id: "todo_aoi",
  name: { ko: "토도 아오이", ja: "東堂葵" },
  grade: "1급",
  attribute: "BODY",
  baseStats: { atk: 20, def: 16, spd: 17, ce: 17, hp: 90 },
  basicSkills: [
    { name: "강타", type: "ATTACK", effect: { type: "DAMAGE", value: 115 } },
    { name: "박수", type: "UTILITY", effect: { type: "GAUGE_CHARGE", value: 25 } },
    { name: "연속 타격", type: "ATTACK", effect: { type: "MULTI_HIT", hits: 2, value: 60 } }
  ],
  ultimateSkill: {
    name: "부기우기",
    description: "위치 교체 기습",
    effect: { type: "SWAP_ATTACK", damage: 200, guaranteed_first: true }
  }
}
```

### 23. 우라우메
```typescript
{
  id: "uraume",
  name: { ko: "우라우메", ja: "裏梅" },
  grade: "1급",
  attribute: "CONVERT",
  baseStats: { atk: 17, def: 17, spd: 18, ce: 20, hp: 85 },
  basicSkills: [
    { name: "빙결", type: "ATTACK", effect: { type: "DAMAGE", value: 100, element: "ICE" } },
    { name: "서리 방벽", type: "DEFENSE", effect: { type: "DAMAGE_REDUCE", value: 45 } },
    { name: "동결", type: "UTILITY", effect: { type: "SLOW", value: 40 } }
  ],
  ultimateSkill: {
    name: "빙응",
    description: "절대 영도로 모든 것을 동결",
    effect: { type: "FREEZE", damage: 180, stunDuration: 2 }
  }
}
```

### 24. 요로즈
```typescript
{
  id: "yorozu",
  name: { ko: "요로즈", ja: "万" },
  grade: "1급",
  attribute: "CONVERT",
  baseStats: { atk: 19, def: 15, spd: 17, ce: 21, hp: 83 },
  basicSkills: [
    { name: "구축술식", type: "ATTACK", effect: { type: "DAMAGE", value: 110 } },
    { name: "갑충 소환", type: "ATTACK", effect: { type: "SUMMON_DAMAGE", value: 95 } },
    { name: "갑충 갑옷", type: "DEFENSE", effect: { type: "DAMAGE_REDUCE", value: 40 } }
  ],
  ultimateSkill: {
    name: "진구 (真球)",
    description: "완벽한 구체로 공격",
    effect: { type: "DAMAGE", value: 260, piercing: true }
  }
}
```
