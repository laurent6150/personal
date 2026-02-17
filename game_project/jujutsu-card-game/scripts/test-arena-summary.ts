// 변경된 getArenaEffectSummary 출력 테스트

const arenas = [
  {
    name: "성무변환 다리",
    effects: [
      { type: "ATTRIBUTE_BOOST", target: "BARRIER", value: 0.15, description: "결계 속성 데미지 +15%" },
      { type: "SPECIAL_RULE", target: "ALL", value: -1, description: "스킬 CE 소모량 -1" }
    ]
  },
  {
    name: "성장체 의식장",
    effects: [
      { type: "ATTRIBUTE_BOOST", target: "SOUL", value: 0.20, description: "혼백 속성 데미지 +20%" },
      { type: "SPECIAL_RULE", target: "HEAL", value: 0.30, description: "회복 스킬 효과 +30%" }
    ]
  },
  {
    name: "사흉의 경기장",
    effects: [
      { type: "SPECIAL_RULE", target: "ALL", value: 0.30, description: "30% 확률로 스킬 봉인" },
      { type: "ATTRIBUTE_WEAKEN", target: "BARRIER", value: -0.10, description: "결계 속성 데미지 -10%" }
    ]
  },
  {
    name: "투기장",
    effects: [
      { type: "SPECIAL_RULE", target: "RANDOM", value: 0.50, description: "매 턴 50% 확률: ATK +5 또는 -3" },
      { type: "SPECIAL_RULE", target: "HIGHEST_ATK", value: -0.30, description: "최고 ATK 캐릭터 ATK -30%" }
    ]
  },
  {
    name: "카모가의 영지",
    effects: [
      { type: "SPECIAL_RULE", target: "ON_HEAL", value: 2, description: "HP 회복 시 ATK +2 (중첩 가능)" },
      { type: "ATTRIBUTE_BOOST", target: "CONVERT", value: 0.10, description: "변환 속성 데미지 +10%" }
    ]
  }
];

function getArenaEffectSummary(arena: any): string {
  const summaries: string[] = [];
  for (const effect of arena.effects) {
    if (effect.type === 'ATTRIBUTE_BOOST') {
      const attrNames: Record<string, string> = {
        BARRIER: '결계', BODY: '신체', CURSE: '저주',
        SOUL: '혼백', CONVERT: '변환', RANGE: '원거리'
      };
      const name = attrNames[effect.target] || effect.target;
      const value = Math.round(effect.value * 100);
      summaries.push(`${name}+${value}%`);
    } else if (effect.type === 'ATTRIBUTE_WEAKEN') {
      const attrNames: Record<string, string> = {
        BARRIER: '결계', BODY: '신체', CURSE: '저주',
        SOUL: '혼백', CONVERT: '변환', RANGE: '원거리'
      };
      const name = attrNames[effect.target] || effect.target;
      const value = Math.abs(Math.round(effect.value * 100));
      summaries.push(`${name}-${value}%`);
    } else if (effect.type === 'STAT_MODIFY') {
      const stat = effect.stat?.toUpperCase() || '';
      const value = effect.value;
      const sign = value >= 0 ? '+' : '';
      summaries.push(`${stat}${sign}${value}`);
    } else if (effect.type === 'SPECIAL_RULE') {
      if (effect.description.includes('SPD 역전')) {
        summaries.push('SPD역전');
      } else if (effect.description.includes('속성 상성 무효')) {
        summaries.push('상성무효');
      } else if (effect.description.includes('스킬 봉인')) {
        const prob = Math.round(effect.value * 100);
        summaries.push(`봉인${prob}%`);
      } else if (effect.description.includes('크리티컬')) {
        summaries.push(`크리+${effect.value}%`);
      } else {
        summaries.push(effect.description);
      }
    }
  }
  return summaries.join(', ');
}

console.log('═══ Before vs After 비교 ═══\n');

for (const arena of arenas) {
  const summary = getArenaEffectSummary(arena);
  const lines = summary.split(', ');

  // Before (old logic)
  const oldSummaries: string[] = [];
  for (const effect of arena.effects) {
    if (effect.type === 'ATTRIBUTE_BOOST') {
      const attrNames: any = { BARRIER: '결계', BODY: '신체', CURSE: '저주', SOUL: '혼백', CONVERT: '변환', RANGE: '원거리' };
      oldSummaries.push(`${attrNames[effect.target]}+${Math.round(effect.value * 100)}%`);
    } else if (effect.type === 'ATTRIBUTE_WEAKEN') {
      const attrNames: any = { BARRIER: '결계', BODY: '신체', CURSE: '저주', SOUL: '혼백', CONVERT: '변환', RANGE: '원거리' };
      oldSummaries.push(`${attrNames[effect.target]}-${Math.abs(Math.round(effect.value * 100))}%`);
    } else if (effect.type === 'SPECIAL_RULE') {
      if (effect.description.includes('스킬 봉인')) oldSummaries.push(`봉인${Math.round(effect.value * 100)}%`);
      else if (effect.description.includes('크리티컬')) oldSummaries.push(`크리+${effect.value}%`);
      else oldSummaries.push(effect.description.slice(0, 6) + '...');
    }
  }
  const oldResult = oldSummaries.slice(0, 2).join(', ');

  console.log(`  【${arena.name}】`);
  console.log(`    Before: "${oldResult}"`);
  console.log(`    After:  각 줄별 →`);
  lines.forEach((line, i) => console.log(`      ${i+1}줄: "${line}"`));
  console.log();
}
