# 영역전개 캐릭터 확장 데이터 Part 2

## 준1급 (14명)

### 25. 후시구로 메구미
```typescript
{
  id: "fushiguro_megumi",
  name: { ko: "후시구로 메구미", ja: "伏黒恵" },
  grade: "준1급",
  attribute: "RANGE",
  baseStats: { atk: 16, def: 15, spd: 17, ce: 19, hp: 82 },
  basicSkills: [
    { name: "옥견", type: "ATTACK", effect: { type: "SUMMON_DAMAGE", value: 85 } },
    { name: "대사", type: "ATTACK", effect: { type: "DAMAGE", value: 95 } },
    { name: "눌", type: "DEFENSE", effect: { type: "DODGE", chance: 50 } }
  ],
  ultimateSkill: {
    name: "질풍암영정",
    description: "그림자를 지배하는 영역전개",
    effect: { type: "DOMAIN", damage: 170, summonBoost: 50 }
  }
}
```

### 26. 마히토
```typescript
{
  id: "mahito",
  name: { ko: "마히토", ja: "真人" },
  grade: "준1급",
  attribute: "SOUL",
  baseStats: { atk: 17, def: 14, spd: 18, ce: 20, hp: 80 },
  basicSkills: [
    { name: "무위전변", type: "ATTACK", effect: { type: "TRUE_DAMAGE", value: 100 } },
    { name: "형태 변화", type: "DEFENSE", effect: { type: "DODGE", chance: 55 } },
    { name: "분신", type: "UTILITY", effect: { type: "CLONE", damage: 45, count: 2 } }
  ],
  ultimateSkill: {
    name: "자폐원둔리득체기",
    description: "영역 내 모든 영혼을 만진다",
    effect: { type: "DOMAIN", damage: 200, ignoreDefense: true }
  }
}
```

### 27. 메이메이
```typescript
{
  id: "mei_mei",
  name: { ko: "메이메이", ja: "冥冥" },
  grade: "준1급",
  attribute: "RANGE",
  baseStats: { atk: 16, def: 15, spd: 16, ce: 18, hp: 80 },
  basicSkills: [
    { name: "흑조 조작", type: "ATTACK", effect: { type: "SUMMON_DAMAGE", value: 85 } },
    { name: "도끼 공격", type: "ATTACK", effect: { type: "DAMAGE", value: 105 } },
    { name: "정찰", type: "UTILITY", effect: { type: "WEAKNESS_FIND", critBonus: 35 } }
  ],
  ultimateSkill: {
    name: "조의 송장",
    description: "까마귀에 120% 저주력을 실어 돌격",
    effect: { type: "SACRIFICE_ATTACK", damage: 260 }
  }
}
```

### 28. 이누마키 토게
```typescript
{
  id: "inumaki_toge",
  name: { ko: "이누마키 토게", ja: "狗巻棘" },
  grade: "준1급",
  attribute: "CURSE",
  baseStats: { atk: 14, def: 13, spd: 16, ce: 21, hp: 75 },
  basicSkills: [
    { name: "움직이지 마", type: "UTILITY", effect: { type: "STUN", duration: 1 } },
    { name: "도망쳐", type: "UTILITY", effect: { type: "KNOCKBACK", skipTurn: true } },
    { name: "터져라", type: "ATTACK", effect: { type: "TRUE_DAMAGE", value: 90 } }
  ],
  ultimateSkill: {
    name: "죽어",
    description: "최강의 주언, 치명적 부작용",
    effect: { type: "INSTANT_DAMAGE", damage: 300, selfDamage: 60 }
  }
}
```

### 29. 젠인 마키 (일반)
```typescript
{
  id: "maki_zenin_normal",
  name: { ko: "젠인 마키", ja: "禪院真希" },
  grade: "준1급",
  attribute: "BODY",
  baseStats: { atk: 17, def: 15, spd: 18, ce: 5, hp: 82 },
  basicSkills: [
    { name: "창술", type: "ATTACK", effect: { type: "DAMAGE", value: 95 } },
    { name: "저주도구 - 검", type: "ATTACK", effect: { type: "DAMAGE", value: 100 } },
    { name: "회피", type: "DEFENSE", effect: { type: "DODGE", chance: 45 } }
  ],
  ultimateSkill: {
    name: "연속 참격",
    description: "저주도구 연속 공격",
    effect: { type: "MULTI_HIT", hits: 5, value: 45 }
  }
}
```

### 30. 천사/쿠루스 하나
```typescript
{
  id: "angel_hana",
  name: { ko: "천사/쿠루스 하나", ja: "天使/来栖華" },
  grade: "준1급",
  attribute: "BARRIER",
  baseStats: { atk: 15, def: 17, spd: 16, ce: 22, hp: 78 },
  basicSkills: [
    { name: "야곱의 사다리", type: "ATTACK", effect: { type: "DAMAGE", value: 105 } },
    { name: "술식 소멸", type: "UTILITY", effect: { type: "SKILL_SEAL", duration: 2 } },
    { name: "비행", type: "DEFENSE", effect: { type: "DODGE", chance: 50 } }
  ],
  ultimateSkill: {
    name: "천사의 심판",
    description: "모든 술식과 저주를 정화",
    effect: { type: "PURIFY", damage: 200, dispelAll: true }
  }
}
```

### 31. 레지 스타
```typescript
{
  id: "reggie_star",
  name: { ko: "레지 스타", ja: "レジー・スター" },
  grade: "준1급",
  attribute: "RANGE",
  baseStats: { atk: 16, def: 14, spd: 17, ce: 19, hp: 78 },
  basicSkills: [
    { name: "영수증 소환", type: "ATTACK", effect: { type: "SUMMON_DAMAGE", value: 90 } },
    { name: "차량 소환", type: "ATTACK", effect: { type: "DAMAGE", value: 110 } },
    { name: "칼 소환", type: "ATTACK", effect: { type: "MULTI_HIT", hits: 4, value: 30 } }
  ],
  ultimateSkill: {
    name: "대량 소환",
    description: "모든 영수증으로 대규모 소환",
    effect: { type: "MASSIVE_SUMMON", damage: 220, multiHit: 6 }
  }
}
```

### 32. 타카바 후미히코
```typescript
{
  id: "fumihiko_takaba",
  name: { ko: "타카바 후미히코", ja: "高羽史彦" },
  grade: "준1급",
  attribute: "SOUL",
  baseStats: { atk: 14, def: 18, spd: 15, ce: 23, hp: 85 },
  basicSkills: [
    { name: "개그", type: "UTILITY", effect: { type: "RANDOM_EFFECT", positive: true } },
    { name: "츳코미", type: "ATTACK", effect: { type: "DAMAGE", value: 85 } },
    { name: "보케", type: "DEFENSE", effect: { type: "DAMAGE_NULLIFY", chance: 40 } }
  ],
  ultimateSkill: {
    name: "코미디",
    description: "재밌으면 모든 것이 가능",
    effect: { type: "REALITY_WARP", invincible: true, randomDamage: { min: 100, max: 300 } }
  }
}
```

### 33. 찰스 버나드
```typescript
{
  id: "charles_bernard",
  name: { ko: "찰스 버나드", ja: "シャルル" },
  grade: "준1급",
  attribute: "RANGE",
  baseStats: { atk: 15, def: 13, spd: 18, ce: 18, hp: 75 },
  basicSkills: [
    { name: "G펜 찌르기", type: "ATTACK", effect: { type: "DAMAGE", value: 90 } },
    { name: "미래 예지", type: "UTILITY", effect: { type: "FORESIGHT", dodgeBoost: 50 } },
    { name: "만화 그리기", type: "ATTACK", effect: { type: "DAMAGE", value: 95 } }
  ],
  ultimateSkill: {
    name: "아우터",
    description: "상대의 미래를 조작",
    effect: { type: "FUTURE_CONTROL", damage: 180, stunChance: 60 }
  }
}
```

### 34. 젠인 진이치
```typescript
{
  id: "jinichi_zenin",
  name: { ko: "젠인 진이치", ja: "禪院甚壱" },
  grade: "준1급",
  attribute: "BODY",
  baseStats: { atk: 17, def: 16, spd: 15, ce: 16, hp: 85 },
  basicSkills: [
    { name: "미궤도", type: "ATTACK", effect: { type: "DAMAGE", value: 100 } },
    { name: "궤도 조작", type: "DEFENSE", effect: { type: "DODGE", chance: 45 } },
    { name: "연속 타격", type: "ATTACK", effect: { type: "MULTI_HIT", hits: 3, value: 40 } }
  ],
  ultimateSkill: {
    name: "무궤도 타격",
    description: "예측 불가능한 연속 공격",
    effect: { type: "UNPREDICTABLE", damage: 200, cannotDodge: true }
  }
}
```

### 35. 젠인 오기
```typescript
{
  id: "ogi_zenin",
  name: { ko: "젠인 오기", ja: "禪院扇" },
  grade: "준1급",
  attribute: "CONVERT",
  baseStats: { atk: 18, def: 14, spd: 16, ce: 17, hp: 82 },
  basicSkills: [
    { name: "화참", type: "ATTACK", effect: { type: "DAMAGE", value: 105, element: "FIRE" } },
    { name: "검술", type: "ATTACK", effect: { type: "DAMAGE", value: 95 } },
    { name: "방어 태세", type: "DEFENSE", effect: { type: "DAMAGE_REDUCE", value: 40 } }
  ],
  ultimateSkill: {
    name: "비검 - 낙화",
    description: "젠인가 비전 화염검술",
    effect: { type: "FIRE_SLASH", damage: 220, burnDamage: 40, duration: 2 }
  }
}
```

### 36. 카모 노리토시
```typescript
{
  id: "noritoshi_kamo",
  name: { ko: "카모 노리토시", ja: "加茂憲紀" },
  grade: "준1급",
  attribute: "CURSE",
  baseStats: { atk: 15, def: 14, spd: 17, ce: 18, hp: 78 },
  basicSkills: [
    { name: "적혈조작", type: "ATTACK", effect: { type: "DAMAGE", value: 90 } },
    { name: "혈도", type: "UTILITY", effect: { type: "ATK_BOOST", value: 30 } },
    { name: "궁도", type: "ATTACK", effect: { type: "DAMAGE", value: 85 } }
  ],
  ultimateSkill: {
    name: "유도 혈탄",
    description: "무한 분열 유도 공격",
    effect: { type: "HOMING_ATTACK", damage: 180, hits: 5 }
  }
}
```

### 37. 하제노키 이오리
```typescript
{
  id: "iori_hazenoki",
  name: { ko: "하제노키 이오리", ja: "波野木伊織" },
  grade: "준1급",
  attribute: "RANGE",
  baseStats: { atk: 16, def: 12, spd: 17, ce: 17, hp: 75 },
  basicSkills: [
    { name: "폭발 - 이빨", type: "ATTACK", effect: { type: "DAMAGE", value: 95 } },
    { name: "폭발 - 눈알", type: "ATTACK", effect: { type: "AOE_DAMAGE", value: 80 } },
    { name: "자폭", type: "ATTACK", effect: { type: "DAMAGE", value: 110, selfDamage: 20 } }
  ],
  ultimateSkill: {
    name: "전신 폭발",
    description: "몸 전체를 폭탄으로 대폭발",
    effect: { type: "MASSIVE_EXPLOSION", damage: 250, selfDamage: 50 }
  }
}
```

### 38. 쿠사카베 아츠야
```typescript
{
  id: "kusakabe_atsuya",
  name: { ko: "쿠사카베 아츠야", ja: "日下部篤也" },
  grade: "준1급",
  attribute: "BODY",
  baseStats: { atk: 16, def: 16, spd: 15, ce: 14, hp: 85 },
  basicSkills: [
    { name: "간단한 영역", type: "DEFENSE", effect: { type: "DOMAIN_COUNTER", value: 70 } },
    { name: "검술", type: "ATTACK", effect: { type: "DAMAGE", value: 95 } },
    { name: "발도", type: "ATTACK", effect: { type: "CRITICAL_ATTACK", value: 100, critRate: 35 } }
  ],
  ultimateSkill: {
    name: "신음류 오의",
    description: "간단한 영역 + 검술 결합",
    effect: { type: "COUNTER_SLASH", damage: 200, counterBonus: 100 }
  }
}
```

---

## 2급 (10명)

### 39. 쿠기사키 노바라
```typescript
{
  id: "kugisaki_nobara",
  name: { ko: "쿠기사키 노바라", ja: "釘崎野薔薇" },
  grade: "2급",
  attribute: "RANGE",
  baseStats: { atk: 15, def: 13, spd: 15, ce: 17, hp: 75 },
  basicSkills: [
    { name: "공진", type: "ATTACK", effect: { type: "DAMAGE", value: 85 } },
    { name: "간모", type: "ATTACK", effect: { type: "TRUE_DAMAGE", value: 70 } },
    { name: "화공", type: "ATTACK", effect: { type: "MULTI_HIT", hits: 4, value: 25 } }
  ],
  ultimateSkill: {
    name: "흑섬 공명",
    description: "흑섬과 공명의 결합",
    effect: { type: "RESONANCE", damage: 200, reflectDamage: 50 }
  }
}
```

### 40. 판다
```typescript
{
  id: "panda",
  name: { ko: "판다", ja: "パンダ" },
  grade: "2급",
  attribute: "BODY",
  baseStats: { atk: 16, def: 17, spd: 14, ce: 15, hp: 90 },
  basicSkills: [
    { name: "펀치", type: "ATTACK", effect: { type: "DAMAGE", value: 90 } },
    { name: "고릴라 모드", type: "ATTACK", effect: { type: "DAMAGE", value: 120, selfDefReduce: 20 } },
    { name: "핵 전환", type: "UTILITY", effect: { type: "HEAL", value: 40 } }
  ],
  ultimateSkill: {
    name: "자매 핵 해방",
    description: "세 번째 핵의 힘",
    effect: { type: "TRANSFORM", damage: 200, defBonus: 40, atkBonus: 30 }
  }
}
```

### 41. 이노 타쿠마
```typescript
{
  id: "ino_takuma",
  name: { ko: "이노 타쿠마", ja: "猪野琢真" },
  grade: "2급",
  attribute: "CURSE",
  baseStats: { atk: 14, def: 14, spd: 15, ce: 17, hp: 78 },
  basicSkills: [
    { name: "가마사 - 용어", type: "ATTACK", effect: { type: "SUMMON_DAMAGE", value: 80 } },
    { name: "가마사 - 수호", type: "DEFENSE", effect: { type: "DAMAGE_REDUCE", value: 45 } },
    { name: "가마사 - 화염", type: "ATTACK", effect: { type: "DAMAGE", value: 85, element: "FIRE" } }
  ],
  ultimateSkill: {
    name: "여제례",
    description: "모든 가마사 동시 강림",
    effect: { type: "MULTI_SUMMON", damage: 180, hits: 4 }
  }
}
```

### 42. 니시미야 모모
```typescript
{
  id: "nishimiya_momo",
  name: { ko: "니시미야 모모", ja: "西宮桃" },
  grade: "2급",
  attribute: "RANGE",
  baseStats: { atk: 12, def: 12, spd: 18, ce: 16, hp: 70 },
  basicSkills: [
    { name: "빗자루 공격", type: "ATTACK", effect: { type: "DAMAGE", value: 70 } },
    { name: "바람 조작", type: "ATTACK", effect: { type: "DAMAGE", value: 75 } },
    { name: "비행", type: "DEFENSE", effect: { type: "DODGE", chance: 55 } }
  ],
  ultimateSkill: {
    name: "대선풍",
    description: "거대한 바람으로 광역 공격",
    effect: { type: "AOE_DAMAGE", damage: 150, knockback: true }
  }
}
```

### 43. 미와 카스미
```typescript
{
  id: "kasumi_miwa",
  name: { ko: "미와 카스미", ja: "三輪霞" },
  grade: "2급",
  attribute: "BODY",
  baseStats: { atk: 13, def: 14, spd: 16, ce: 14, hp: 75 },
  basicSkills: [
    { name: "신음류 - 발도", type: "ATTACK", effect: { type: "DAMAGE", value: 85 } },
    { name: "간단한 영역", type: "DEFENSE", effect: { type: "DOMAIN_COUNTER", value: 50 } },
    { name: "검격", type: "ATTACK", effect: { type: "DAMAGE", value: 75 } }
  ],
  ultimateSkill: {
    name: "신음류 - 발도술",
    description: "극한 집중력의 발도",
    effect: { type: "QUICK_DRAW", damage: 170, guaranteed_first: true }
  }
}
```

### 44. 젠인 마이
```typescript
{
  id: "mai_zenin",
  name: { ko: "젠인 마이", ja: "禪院真依" },
  grade: "2급",
  attribute: "RANGE",
  baseStats: { atk: 14, def: 12, spd: 15, ce: 16, hp: 72 },
  basicSkills: [
    { name: "사격", type: "ATTACK", effect: { type: "DAMAGE", value: 80 } },
    { name: "저주력 탄환", type: "ATTACK", effect: { type: "DAMAGE", value: 90 } },
    { name: "구축 - 탄환", type: "ATTACK", effect: { type: "TRUE_DAMAGE", value: 85 } }
  ],
  ultimateSkill: {
    name: "구축 (構築術式)",
    description: "생명을 대가로 창조",
    effect: { type: "SACRIFICE_CREATE", damage: 200, selfDamage: 40 }
  }
}
```

### 45. 에소
```typescript
{
  id: "eso",
  name: { ko: "에소", ja: "壊相" },
  grade: "2급",
  attribute: "CURSE",
  baseStats: { atk: 15, def: 13, spd: 14, ce: 17, hp: 78 },
  basicSkills: [
    { name: "비익", type: "ATTACK", effect: { type: "DAMAGE", value: 85, poison: true } },
    { name: "독혈 살포", type: "ATTACK", effect: { type: "AOE_DAMAGE", value: 70, poisonDamage: 20 } },
    { name: "비행", type: "DEFENSE", effect: { type: "DODGE", chance: 40 } }
  ],
  ultimateSkill: {
    name: "극노천",
    description: "최대 농도 독혈 방출",
    effect: { type: "POISON_EXPLOSION", damage: 160, poisonDamage: 40, duration: 3 }
  }
}
```

### 46. 케치즈
```typescript
{
  id: "kechizu",
  name: { ko: "케치즈", ja: "血塗" },
  grade: "2급",
  attribute: "CURSE",
  baseStats: { atk: 14, def: 14, spd: 13, ce: 16, hp: 80 },
  basicSkills: [
    { name: "독혈 토출", type: "ATTACK", effect: { type: "DAMAGE", value: 80, poison: true } },
    { name: "독혈 폭발", type: "ATTACK", effect: { type: "AOE_DAMAGE", value: 75 } },
    { name: "재생", type: "UTILITY", effect: { type: "HEAL", value: 35 } }
  ],
  ultimateSkill: {
    name: "부식의 피",
    description: "모든 것을 부식시키는 극독",
    effect: { type: "CORROSION", damage: 150, defReduce: 50, duration: 2 }
  }
}
```

### 47. 이오리 우타히메
```typescript
{
  id: "utahime_iori",
  name: { ko: "이오리 우타히메", ja: "庵歌姫" },
  grade: "2급",
  attribute: "BARRIER",
  baseStats: { atk: 12, def: 15, spd: 13, ce: 19, hp: 75 },
  basicSkills: [
    { name: "단독금지", type: "UTILITY", effect: { type: "PARTY_BOOST", atkBonus: 25, defBonus: 25 } },
    { name: "결계술", type: "DEFENSE", effect: { type: "DAMAGE_REDUCE", value: 45 } },
    { name: "저주력 증폭", type: "UTILITY", effect: { type: "CE_BOOST", value: 30 } }
  ],
  ultimateSkill: {
    name: "솔로 금지",
    description: "모든 아군 대폭 강화",
    effect: { type: "MASSIVE_BUFF", atkBonus: 50, defBonus: 50, ceBonus: 50 }
  }
}
```

### 48. 이에이리 쇼코
```typescript
{
  id: "shoko_ieiri",
  name: { ko: "이에이리 쇼코", ja: "家入硝子" },
  grade: "2급",
  attribute: "SOUL",
  baseStats: { atk: 10, def: 14, spd: 12, ce: 20, hp: 80 },
  basicSkills: [
    { name: "반전술식 - 치료", type: "UTILITY", effect: { type: "HEAL", value: 60 } },
    { name: "반전술식 - 재생", type: "UTILITY", effect: { type: "HEAL_OVER_TIME", value: 25, duration: 3 } },
    { name: "저주력 공격", type: "ATTACK", effect: { type: "DAMAGE", value: 60 } }
  ],
  ultimateSkill: {
    name: "완전 소생",
    description: "치명상도 완전 회복",
    effect: { type: "FULL_HEAL", healPercent: 80 }
  }
}
```

---

## 3급 (6명)

### 49. 하이바라 유
```typescript
{
  id: "yu_haibara",
  name: { ko: "하이바라 유", ja: "灰原雄" },
  grade: "3급",
  attribute: "BODY",
  baseStats: { atk: 13, def: 13, spd: 14, ce: 14, hp: 75 },
  basicSkills: [
    { name: "검술", type: "ATTACK", effect: { type: "DAMAGE", value: 75 } },
    { name: "저주력 강화", type: "ATTACK", effect: { type: "DAMAGE", value: 80 } },
    { name: "회피", type: "DEFENSE", effect: { type: "DODGE", chance: 40 } }
  ],
  ultimateSkill: {
    name: "동료를 위해",
    description: "동료를 지키려는 의지",
    effect: { type: "DAMAGE", value: 160, defBonus: 30 }
  }
}
```

### 50. 이지치 키요타카
```typescript
{
  id: "kiyotaka_ijichi",
  name: { ko: "이지치 키요타카", ja: "伊地知潔高" },
  grade: "3급",
  attribute: "BARRIER",
  baseStats: { atk: 8, def: 16, spd: 10, ce: 18, hp: 70 },
  basicSkills: [
    { name: "장막 전개", type: "DEFENSE", effect: { type: "DAMAGE_REDUCE", value: 50 } },
    { name: "결계 유지", type: "UTILITY", effect: { type: "GAUGE_CHARGE", value: 20 } },
    { name: "저주력 공격", type: "ATTACK", effect: { type: "DAMAGE", value: 50 } }
  ],
  ultimateSkill: {
    name: "완벽한 장막",
    description: "모든 것을 차단하는 결계",
    effect: { type: "PERFECT_BARRIER", invincible: true, duration: 2 }
  }
}
```

### 51. 닛타 아카리
```typescript
{
  id: "akari_nitta",
  name: { ko: "닛타 아카리", ja: "新田明" },
  grade: "3급",
  attribute: "SOUL",
  baseStats: { atk: 8, def: 13, spd: 12, ce: 17, hp: 72 },
  basicSkills: [
    { name: "상태 유지", type: "UTILITY", effect: { type: "STATUS_LOCK", duration: 2 } },
    { name: "치료 보조", type: "UTILITY", effect: { type: "HEAL", value: 40 } },
    { name: "저주력 공격", type: "ATTACK", effect: { type: "DAMAGE", value: 50 } }
  ],
  ultimateSkill: {
    name: "완전 보존",
    description: "대상의 상태를 완전히 유지",
    effect: { type: "FULL_STATUS_LOCK", invincible: true, duration: 2 }
  }
}
```

### 52. 쿠로이 미사토
```typescript
{
  id: "misato_kuroi",
  name: { ko: "쿠로이 미사토", ja: "黒井美里" },
  grade: "3급",
  attribute: "BODY",
  baseStats: { atk: 10, def: 14, spd: 13, ce: 12, hp: 75 },
  basicSkills: [
    { name: "호신술", type: "DEFENSE", effect: { type: "DAMAGE_REDUCE", value: 40 } },
    { name: "타격", type: "ATTACK", effect: { type: "DAMAGE", value: 65 } },
    { name: "회피", type: "DEFENSE", effect: { type: "DODGE", chance: 35 } }
  ],
  ultimateSkill: {
    name: "필사의 수호",
    description: "목숨을 걸고 지킨다",
    effect: { type: "PROTECT", damage: 120, defBonus: 60 }
  }
}
```

### 53. 야가 마사미치
```typescript
{
  id: "masamichi_yaga",
  name: { ko: "야가 마사미치", ja: "夜蛾正道" },
  grade: "3급",
  attribute: "SOUL",
  baseStats: { atk: 14, def: 15, spd: 11, ce: 18, hp: 82 },
  basicSkills: [
    { name: "저주 인형 소환", type: "ATTACK", effect: { type: "SUMMON_DAMAGE", value: 85 } },
    { name: "인형 방어", type: "DEFENSE", effect: { type: "DAMAGE_REDUCE", value: 45 } },
    { name: "다중 소환", type: "ATTACK", effect: { type: "MULTI_HIT", hits: 3, value: 30 } }
  ],
  ultimateSkill: {
    name: "자율 인형술",
    description: "자아를 가진 인형 군단",
    effect: { type: "SUMMON_ARMY", damage: 180, summonCount: 5 }
  }
}
```

### 54. 에소와 케치즈 (듀오)
```typescript
{
  id: "eso_kechizu_duo",
  name: { ko: "에소와 케치즈", ja: "壊相と血塗" },
  grade: "3급",
  attribute: "CURSE",
  baseStats: { atk: 16, def: 14, spd: 13, ce: 18, hp: 85 },
  basicSkills: [
    { name: "콤비 공격", type: "ATTACK", effect: { type: "DAMAGE", value: 95 } },
    { name: "이중 독혈", type: "ATTACK", effect: { type: "AOE_DAMAGE", value: 85, poison: true } },
    { name: "형제 방어", type: "DEFENSE", effect: { type: "DAMAGE_REDUCE", value: 50 } }
  ],
  ultimateSkill: {
    name: "형제 합체기",
    description: "저주태반 형제의 합동 공격",
    effect: { type: "COMBO_ATTACK", damage: 220, poisonDamage: 50, duration: 2 }
  }
}
```

---

## 총 캐릭터 수: 54명

| 등급 | 인원 |
|------|------|
| 특급 | 8명 |
| 1급 | 16명 |
| 준1급 | 14명 |
| 2급 | 10명 |
| 3급 | 6명 |
| **합계** | **54명** |

### 크루 배정
- 8크루 × 6장 = 48장 필요
- 54명 중 48명 배정, 6명은 미배정 풀

### 이미지 파일 필요 목록
`public/images/characters/` 폴더에 아래 파일명으로 저장:

```
gojo_satoru.png
geto_suguru.png
yuta_okkotsu.png
yuki_tsukumo.png
kenjaku.png
tengen.png
ryomen_sukuna.png
fushiguro_toji.png
itadori_yuji.png
maki_zenin_awakened.png
nanami_kento.png
jogo.png
hanami.png
naobito_zenin.png
naoya_zenin.png
hiromi_higuruma.png
hajime_kashimo.png
ryu_ishigori.png
takako_uro.png
kinji_hakari.png
choso.png
todo_aoi.png
uraume.png
yorozu.png
fushiguro_megumi.png
mahito.png
mei_mei.png
inumaki_toge.png
maki_zenin_normal.png
angel_hana.png
reggie_star.png
fumihiko_takaba.png
charles_bernard.png
jinichi_zenin.png
ogi_zenin.png
noritoshi_kamo.png
iori_hazenoki.png
kusakabe_atsuya.png
kugisaki_nobara.png
panda.png
ino_takuma.png
nishimiya_momo.png
kasumi_miwa.png
mai_zenin.png
eso.png
kechizu.png
utahime_iori.png
shoko_ieiri.png
yu_haibara.png
kiyotaka_ijichi.png
akari_nitta.png
misato_kuroi.png
masamichi_yaga.png
eso_kechizu_duo.png
```
