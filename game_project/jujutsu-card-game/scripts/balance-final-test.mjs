// ═══════════════════════════════════════════════════════════
// 최종 밸런스 조정안 검증 (더 강한 CE 계수 + 스탯 조정)
// ═══════════════════════════════════════════════════════════

const ATTR_ADV = {
  BARRIER:['CURSE','CONVERT'], BODY:['BARRIER','CONVERT'],
  CURSE:['BODY','RANGE'], SOUL:['BARRIER','CURSE'],
  CONVERT:['SOUL','RANGE'], RANGE:['BODY','SOUL']
};
function getAttrMult(a,d) {
  if(ATTR_ADV[a]?.includes(d))return 1.5;
  if(ATTR_ADV[d]?.includes(a))return 0.7;
  return 1.0;
}
const ARENAS = [
  {bonus:'CURSE',bonusPct:10,penalty:'BARRIER',penaltyPct:5},
  {bonus:'BODY',bonusPct:10,penalty:'CURSE',penaltyPct:5},
  {bonus:'BARRIER',bonusPct:10,penalty:'BODY',penaltyPct:5},
  {bonus:'SOUL',bonusPct:10,penalty:'BODY',penaltyPct:5},
  {bonus:'CURSE',bonusPct:15,penalty:'SOUL',penaltyPct:10},
  {bonus:'BARRIER',bonusPct:15,penalty:'CURSE',penaltyPct:10},
  {bonus:'BODY',bonusPct:15,penalty:'SOUL',penaltyPct:10},
  {bonus:'SOUL',bonusPct:15,penalty:'BARRIER',penaltyPct:10},
  {bonus:'BODY',bonusPct:3,penalty:'SOUL',penaltyPct:3},
  {bonus:'CURSE',bonusPct:20,penalty:'BARRIER',penaltyPct:15},
];
const GRADE_CRT = {'특급':15,'준특급':14,'1급':12,'준1급':10,'2급':8,'3급':5};
function mk(id,name,grade,attr,atk,def,spd,ce,hp,crt=null) {
  return {id,name,grade,attr,atk,def,spd,ce,hp,crt:crt??GRADE_CRT[grade]};
}

function getChars() { return [
  mk("gojo","고죠 사토루","특급","BARRIER",22,20,22,25,100),
  mk("sukuna","료멘 스쿠나","특급","CURSE",25,18,22,24,100),
  mk("yuta","옷코츠 유타","특급","CURSE",21,18,20,26,100),
  mk("kenjaku","켄자쿠","특급","SOUL",18,17,18,25,100),
  mk("yuki","츠쿠모 유키","특급","BODY",23,16,19,24,95),
  mk("yuji_f","이타도리(최종전)","특급","SOUL",23,18,23,22,95),
  mk("geto","게토 스구루","준특급","CURSE",19,18,18,22,93),
  mk("tengen","텐겐","준특급","BARRIER",12,20,10,25,100),
  mk("toji","후시구로 토우지","준특급","BODY",25,16,24,0,92,26),
  mk("mahoraga","마허라","준특급","BODY",22,18,18,20,100),
  mk("rika","완전체 리카","준특급","SOUL",22,17,19,24,95),
  mk("tamamo","타마모노마에","준특급","CURSE",21,19,20,22,95),
  mk("dabura","다부라","준특급","BODY",23,18,21,20,95),
  mk("yuji","이타도리 유지","1급","BODY",19,16,20,18,90),
  mk("maki_aw","젠인 마키(각성)","1급","BODY",23,15,24,0,88,23),
  mk("nanami","나나미 켄토","1급","BODY",18,17,16,18,88),
  mk("jogo","죠고","1급","CONVERT",22,13,17,23,88),
  mk("hanami","하나미","1급","CONVERT",16,19,14,20,92),
  mk("kashimo","카시모 하지메","1급","CONVERT",22,15,22,21,86),
  mk("ryu","이시고리 류","1급","RANGE",23,15,14,20,88),
  mk("hakari","하카리 킨지","1급","BARRIER",21,16,20,22,87),
  mk("choso","쵸소","1급","CURSE",18,16,17,19,88),
  mk("todo","토도 아오이","1급","BODY",20,16,17,17,90),
  mk("mahito","마히토","1급","SOUL",19,15,19,22,83),
  mk("mechamaru","메카마루","1급","RANGE",19,17,14,21,85),
  mk("miguel","미겔","1급","BODY",20,16,19,18,88),
  mk("tsurugi","옷코츠 츠루기","1급","BODY",23,15,23,0,87,23),
  mk("higuruma","히구루마","1급","BARRIER",17,18,16,23,86),
  mk("naobito","나오비토","1급","BODY",17,14,24,19,80),
  mk("naoya","나오야","1급","BODY",18,13,23,18,78),
  mk("uro","우로 타카코","1급","BARRIER",18,16,20,19,82),
  mk("yorozu","요로즈","1급","CONVERT",19,15,17,21,83),
  mk("uraume","우라우메","1급","CONVERT",17,17,18,20,85),
  mk("mei_mei","메이메이","1급","RANGE",16,15,16,18,80),
  mk("smallpox","포창신","1급","CURSE",16,18,12,22,90),
  mk("kuro","쿠로우루시","1급","CURSE",18,14,18,20,82),
  mk("bansho","만상","1급","CONVERT",17,16,15,20,85),
  mk("dagon","다곤","1급","CONVERT",17,17,14,21,90),
  mk("megumi","메구미","준1급","SOUL",16,15,17,19,82),
  mk("inumaki","이누마키","준1급","CURSE",14,13,16,21,75),
  mk("maki","젠인 마키","준1급","BODY",17,15,18,5,82),
  mk("angel","천사/하나","준1급","BARRIER",15,17,16,22,78),
  mk("reggie","레지 스타","준1급","RANGE",16,14,17,19,78),
  mk("takaba","타카바","준1급","SOUL",14,18,15,20,82),
  mk("jinichi","진이치","준1급","BODY",17,16,15,16,85),
  mk("ogi","오기","준1급","CONVERT",18,14,16,17,82),
  mk("kamo","카모","준1급","CONVERT",15,14,17,18,78),
  mk("hazenoki","하제노키","준1급","RANGE",16,12,17,17,75),
  mk("kusakabe","쿠사카베","준1급","BODY",16,16,15,14,85),
  mk("uiui","우이우이","준1급","BARRIER",10,14,20,21,72),
  mk("yuka","유카","준1급","BODY",16,13,18,17,76),
  mk("cross","크로스","준1급","CONVERT",18,15,17,19,80),
  mk("marulu","마루","준1급","BARRIER",15,16,16,23,78),
  mk("usami","우사미","준1급","CURSE",13,14,16,22,75),
  mk("yaga","야가","준1급","SOUL",14,15,11,18,82),
  mk("nobara","노바라","2급","RANGE",15,13,15,17,75),
  mk("panda","판다","2급","BODY",16,15,14,15,82),
  mk("ino","이노","2급","CURSE",14,14,15,17,78),
  mk("momo","니시미야","2급","RANGE",12,12,18,16,70),
  mk("miwa","미와","2급","BODY",13,14,16,14,75),
  mk("mai","마이","2급","RANGE",14,12,15,16,72),
  mk("eso","에소","2급","CURSE",15,13,14,17,78),
  mk("kechizu","케치즈","2급","CURSE",14,14,13,16,80),
  mk("utahime","우타히메","2급","BARRIER",12,15,13,19,75),
  mk("shoko","쇼코","2급","SOUL",10,14,12,20,80),
  mk("ogami","오가미","2급","SOUL",10,13,11,19,75),
  mk("charles","찰스","2급","SOUL",14,12,16,17,75),
  mk("haibara","하이바라","3급","BODY",13,13,14,14,75),
  mk("ijichi","이지치","3급","BARRIER",8,16,10,18,70),
  mk("nitta","닛타","3급","SOUL",8,13,12,17,72),
  mk("kuroi","쿠로이","3급","BODY",10,14,13,12,75),
];}

function simInd(c1,c2,arena,ceF) {
  const tot=c=>c.atk+c.def+c.spd+c.ce+c.hp;
  let t1=tot(c1),t2=tot(c2);
  let b1=0,p1=0,b2=0,p2=0;
  if(arena.bonus===c1.attr)b1=arena.bonusPct;
  if(arena.penalty===c1.attr)p1=arena.penaltyPct;
  if(arena.bonus===c2.attr)b2=arena.bonusPct;
  if(arena.penalty===c2.attr)p2=arena.penaltyPct;
  let a1=Math.round(t1*(1+b1/100)*(1-p1/100));
  let a2=Math.round(t2*(1+b2/100)*(1-p2/100));
  let hp1=100,hp2=100,g1=0,g2=0;
  let at=c1.spd>=c2.spd?1:2;
  for(let t=0;t<30&&hp1>0&&hp2>0;t++){
    const f=at===1;
    const ac=f?c1:c2,dc=f?c2:c1,aA=f?a1:a2,dA=f?a2:a1,aG=f?g1:g2;
    let d=Math.round(ac.atk*0.4+5);
    d=Math.round(d*(1-Math.min(dc.def*0.3,30)/100));
    d=Math.max(5,d);
    d=Math.round(d*Math.max(0.8,Math.min(1.2,1+(aA-dA)/1000)));
    // CE 계수
    if(ceF>0) d=Math.round(d*(1+ac.ce*ceF));
    d=Math.round(d*(0.9+Math.random()*0.2));
    let m=1.0;
    if(aG>=100)m=2.0;else if(Math.random()<0.3)m=1.3;
    if(Math.random()<ac.crt/150)m*=1.5;
    let fd=Math.max(5,Math.round(d*m));
    if(f){hp2-=fd;if(aG>=100)g1=0;else{g1=Math.min(100,g1+25);g2=Math.min(100,g2+25);}}
    else{hp1-=fd;if(aG>=100)g2=0;else{g1=Math.min(100,g1+25);g2=Math.min(100,g2+25);}}
    at=at===1?2:1;
  }
  if(hp1>0&&hp2<=0)return 1;if(hp2>0&&hp1<=0)return 2;
  return hp1>hp2?1:(hp2>hp1?2:0);
}

function simTeam(c1,c2,arena) {
  const am1=getAttrMult(c1.attr,c2.attr),am2=getAttrMult(c2.attr,c1.attr);
  const cm1=1+c1.ce/100,cm2=1+c2.ce/100;
  let ab1=1,ab2=1;
  if(arena.bonus===c1.attr)ab1=1+arena.bonusPct/100;
  if(arena.penalty===c1.attr)ab1=1-arena.penaltyPct/100;
  if(arena.bonus===c2.attr)ab2=1+arena.bonusPct/100;
  if(arena.penalty===c2.attr)ab2=1-arena.penaltyPct/100;
  const d1=Math.max(1,Math.floor(c1.atk*am1*cm1*ab1-c2.def));
  const d2=Math.max(1,Math.floor(c2.atk*am2*cm2*ab2-c1.def));
  let hp1=c1.hp,hp2=c2.hp;
  const pf=c1.spd>c2.spd?true:(c1.spd<c2.spd?false:Math.random()>0.5);
  for(let t=0;t<100&&hp1>0&&hp2>0;t++){
    if(pf){hp2-=d1;if(hp2<=0)break;hp1-=d2;}
    else{hp1-=d2;if(hp1<=0)break;hp2-=d1;}
  }
  if(hp1>0&&hp2<=0)return 1;if(hp2>0&&hp1<=0)return 2;
  return hp1>hp2?1:(hp2>hp1?2:0);
}

function run(chars, simFn, sims=30) {
  const N=chars.length, res={};
  for(const c of chars) res[c.id]={wins:0,total:0};
  for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){
    for(const ar of ARENAS){for(let s=0;s<sims;s++){
      const w=simFn(chars[i],chars[j],ar);
      res[chars[i].id].total++;res[chars[j].id].total++;
      if(w===1)res[chars[i].id].wins++;else if(w===2)res[chars[j].id].wins++;
    }}
  }
  return chars.map(c=>({...c,wr:res[c.id].total>0?(res[c.id].wins/res[c.id].total*100):0}));
}

function apply(chars, adj) {
  return chars.map(c=>{const a=adj[c.id];return a?{...c,...a}:{...c};});
}

// ═══════════════════════════════
// 최종 조정안들
// ═══════════════════════════════

const FINAL_ADJUSTMENTS = {
  // 텐겐: ATK 12→18, SPD 10→16 (결계의 마스터이자 불사, 전투력 보정)
  tengen: { atk: 18, spd: 16 },
  // 토우지: ATK 25→22, SPD 24→22, CRT 26→18 (여전히 최강 피지컬이지만 과도하지 않게)
  toji: { atk: 22, spd: 22, crt: 18 },
  // 마키(각성): ATK 23→20, SPD 24→21, CRT 23→15 (1급 상위권으로 조정)
  maki_aw: { atk: 20, spd: 21, crt: 15 },
  // 츠루기: ATK 23→20, SPD 23→21, CRT 23→15 (마키와 비슷한 수준)
  tsurugi: { atk: 20, spd: 21, crt: 15 },
};

const CE_FACTOR = 0.006; // CE 0→×1.0, CE 20→×1.12, CE 25→×1.15

console.log(`\n🔬 최종 밸런스 조정안 검증`);
console.log(`${'═'.repeat(65)}`);
console.log(`CE 계수: ${CE_FACTOR} (CE 0=×1.0, CE 20=×1.12, CE 25=×1.15)\n`);

const BASE = getChars();
const ADJ = apply(BASE, FINAL_ADJUSTMENTS);
const S = 40;

console.log(`[1/4] 조정 전 개인리그...`);
const bI = run(BASE, (a,b,ar)=>simInd(a,b,ar,0), S);
console.log(`[2/4] 조정 후 개인리그...`);
const aI = run(ADJ, (a,b,ar)=>simInd(a,b,ar,CE_FACTOR), S);
console.log(`[3/4] 조정 전 팀리그...`);
const bT = run(BASE, simTeam, S);
console.log(`[4/4] 조정 후 팀리그...`);
const aT = run(ADJ, simTeam, S);

// ═══════════════════════════════════════════════════════════
// 결과
// ═══════════════════════════════════════════════════════════

function gradeAvg(r, g) {
  const f = r.filter(x=>x.grade===g);
  return f.length?f.reduce((s,x)=>s+x.wr,0)/f.length:0;
}

console.log(`\n${'═'.repeat(70)}`);
console.log(`  📋 등급별 평균 승률 비교`);
console.log(`${'═'.repeat(70)}`);
console.log(`등급     | 개인(전)  개인(후)  변화   | 팀(전)   팀(후)   변화`);
console.log(`${'─'.repeat(70)}`);
for(const g of ['특급','준특급','1급','준1급','2급','3급']){
  const bi=gradeAvg(bI,g), ai=gradeAvg(aI,g), bt=gradeAvg(bT,g), at=gradeAvg(aT,g);
  const di=ai-bi, dt=at-bt;
  console.log(`${g.padEnd(5)} | ${bi.toFixed(1).padStart(5)}%  ${ai.toFixed(1).padStart(5)}%  ${(di>=0?'+':'')+di.toFixed(1).padStart(4)}% | ${bt.toFixed(1).padStart(5)}%  ${at.toFixed(1).padStart(5)}%  ${(dt>=0?'+':'')+dt.toFixed(1).padStart(4)}%`);
}

// 핵심 캐릭터
console.log(`\n${'═'.repeat(70)}`);
console.log(`  📌 핵심 캐릭터 상세 비교 (개인리그 / 팀리그)`);
console.log(`${'═'.repeat(70)}`);
console.log(`캐릭터               등급    | 개인(전) 개인(후)  | 팀(전)  팀(후)`);
console.log(`${'─'.repeat(70)}`);
const keyIds = ['tengen','toji','maki_aw','tsurugi','gojo','sukuna','yuji_f','kashimo','dabura','mahoraga','rika','geto','tamamo'];
for(const id of keyIds){
  const bi=bI.find(x=>x.id===id), ai=aI.find(x=>x.id===id);
  const bt=bT.find(x=>x.id===id), at=aT.find(x=>x.id===id);
  if(bi&&ai){
    const mark = (bi.wr - ai.wr > 5 || ai.wr - bi.wr > 5) ? ' ←' : '';
    console.log(`${bi.name.padEnd(18)} ${bi.grade.padEnd(5)} | ${bi.wr.toFixed(1).padStart(5)}%  ${ai.wr.toFixed(1).padStart(5)}%   | ${bt.wr.toFixed(1).padStart(5)}%  ${at.wr.toFixed(1).padStart(5)}%${mark}`);
  }
}

// 준특급 내부 순위
console.log(`\n${'═'.repeat(70)}`);
console.log(`  📊 준특급 내부 순위 비교 (개인리그)`);
console.log(`${'═'.repeat(70)}`);
const semiSpec = ['geto','tengen','toji','mahoraga','rika','tamamo','dabura'];
const befSorted = semiSpec.map(id=>bI.find(x=>x.id===id)).sort((a,b)=>b.wr-a.wr);
const aftSorted = semiSpec.map(id=>aI.find(x=>x.id===id)).sort((a,b)=>b.wr-a.wr);
console.log(`\n  조정 전:`);
befSorted.forEach((c,i)=>console.log(`    ${i+1}. ${c.name.padEnd(16)} ${c.wr.toFixed(1)}%`));
console.log(`\n  조정 후:`);
aftSorted.forEach((c,i)=>console.log(`    ${i+1}. ${c.name.padEnd(16)} ${c.wr.toFixed(1)}%`));

// 1급 CE0 vs 일반 1급
console.log(`\n${'═'.repeat(70)}`);
console.log(`  📊 1급 CE 0 vs 일반 1급 상위 비교 (개인리그)`);
console.log(`${'═'.repeat(70)}`);
const g1All = aI.filter(x=>x.grade==='1급').sort((a,b)=>b.wr-a.wr);
console.log(`\n  조정 후 1급 전체 순위:`);
g1All.forEach((c,i)=>console.log(`    ${String(i+1).padStart(2)}. ${c.name.padEnd(16)} ${c.wr.toFixed(1)}% ${c.ce===0?'[CE 0]':''}`));

// 스탯 변경 요약
console.log(`\n${'═'.repeat(70)}`);
console.log(`  📝 스탯 변경 요약`);
console.log(`${'═'.repeat(70)}`);
console.log(`\n  텐겐:     ATK 12→18(+6)  SPD 10→16(+6)  DEF/CE/HP 유지`);
console.log(`  토우지:    ATK 25→22(-3)  SPD 24→22(-2)  CRT 26→18(-8)`);
console.log(`  마키(각성): ATK 23→20(-3)  SPD 24→21(-3)  CRT 23→15(-8)`);
console.log(`  츠루기:    ATK 23→20(-3)  SPD 23→21(-2)  CRT 23→15(-8)`);
console.log(`\n  개인리그 공식 추가: 데미지 × (1 + CE × 0.006)`);
console.log(`    CE 0  → ×1.000 (변화 없음)`);
console.log(`    CE 18 → ×1.108 (+10.8%)`);
console.log(`    CE 25 → ×1.150 (+15.0%)`);

console.log(`\n${'═'.repeat(70)}`);
console.log(`  시뮬레이션 완료`);
console.log(`${'═'.repeat(70)}\n`);
