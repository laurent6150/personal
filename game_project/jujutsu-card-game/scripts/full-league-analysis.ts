/**
 * 팀리그 등급별 내부 시뮬레이션
 *
 * 팀리그 룰: 5라운드 1v1 순차전 (선승3), 2:2시 에이스매치
 * 각 등급 내에서 5인 팀을 구성, 팀 vs 팀 매치 시뮬레이션
 *
 * 분석 항목:
 * - 개인 라운드 승률 (1v1 기여도)
 * - 팀 포함시 팀 승률 (캐리 지수)
 * - 에이스 매치 승률 (클러치력)
 * - 팀 정책(공격/균형/수비) 효과 분석
 */

// ═══ 전투 시스템 ═══
const ATTRIBUTE_ADVANTAGE: Record<string, string[]> = {
  BARRIER: ['CURSE', 'CONVERT'], BODY: ['BARRIER', 'CONVERT'],
  CURSE: ['BODY', 'RANGE'], SOUL: ['BARRIER', 'CURSE'],
  CONVERT: ['SOUL', 'RANGE'], RANGE: ['BODY', 'SOUL']
};
const ADV = 1.08, DIS = 0.96;
function getAttrMult(a: string, b: string): number {
  if (ATTRIBUTE_ADVANTAGE[a]?.includes(b)) return ADV;
  if (ATTRIBUTE_ADVANTAGE[b]?.includes(a)) return DIS;
  return 1.0;
}

interface C {
  id: string; name: string; grade: string; attr: string;
  atk: number; def: number; spd: number; ce: number; hp: number;
  crt: number; tec: number; mnt: number; total: number;
}
const D = 50;

const ALL: C[] = [
  // 특급 (6)
  { id: "gojo", name: "고죠 사토루", grade: "특급", attr: "BARRIER", atk: 22, def: 20, spd: 20, ce: 25, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
  { id: "sukuna", name: "료멘 스쿠나", grade: "특급", attr: "CURSE", atk: 25, def: 18, spd: 20, ce: 24, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
  { id: "kenjaku", name: "켄자쿠", grade: "특급", attr: "SOUL", atk: 22, def: 17, spd: 18, ce: 25, hp: 104, crt: D, tec: D, mnt: D, total: 0 },
  { id: "yuki", name: "츠쿠모 유키", grade: "특급", attr: "BODY", atk: 24, def: 16, spd: 19, ce: 24, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
  { id: "yuta", name: "옷코츠 유타", grade: "특급", attr: "CURSE", atk: 23, def: 18, spd: 20, ce: 25, hp: 104, crt: D, tec: D, mnt: D, total: 0 },
  { id: "yuji_final", name: "이타도리(최종전)", grade: "특급", attr: "SOUL", atk: 22, def: 18, spd: 21, ce: 22, hp: 95, crt: D, tec: D, mnt: D, total: 0 },
  // 준특급 (7)
  { id: "geto", name: "게토 스구루", grade: "준특급", attr: "CURSE", atk: 21, def: 18, spd: 18, ce: 22, hp: 98, crt: D, tec: D, mnt: D, total: 0 },
  { id: "tengen", name: "텐겐", grade: "준특급", attr: "BARRIER", atk: 20, def: 20, spd: 17, ce: 25, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
  { id: "toji", name: "토우지", grade: "준특급", attr: "BODY", atk: 23, def: 16, spd: 21, ce: 0, hp: 92, crt: 35, tec: 50, mnt: 45, total: 0 },
  { id: "mahoraga", name: "마허라", grade: "준특급", attr: "BODY", atk: 22, def: 18, spd: 18, ce: 20, hp: 100, crt: D, tec: D, mnt: D, total: 0 },
  { id: "rika", name: "완전체 리카", grade: "준특급", attr: "CURSE", atk: 21, def: 17, spd: 19, ce: 24, hp: 95, crt: D, tec: D, mnt: D, total: 0 },
  { id: "tamamo", name: "타마모노마에", grade: "준특급", attr: "CURSE", atk: 21, def: 19, spd: 20, ce: 22, hp: 96, crt: D, tec: D, mnt: D, total: 0 },
  { id: "dabura", name: "다부라", grade: "준특급", attr: "BODY", atk: 23, def: 18, spd: 21, ce: 20, hp: 95, crt: D, tec: D, mnt: D, total: 0 },
  // 1급 (25)
  { id: "yuji", name: "이타도리 유지", grade: "1급", attr: "BODY", atk: 18, def: 16, spd: 19, ce: 18, hp: 90, crt: D, tec: D, mnt: D, total: 0 },
  { id: "maki_aw", name: "마키(각성)", grade: "1급", attr: "BODY", atk: 20, def: 15, spd: 19, ce: 0, hp: 88, crt: 35, tec: 50, mnt: 40, total: 0 },
  { id: "nanami", name: "나나미 켄토", grade: "1급", attr: "BODY", atk: 18, def: 17, spd: 16, ce: 18, hp: 88, crt: D, tec: D, mnt: D, total: 0 },
  { id: "jogo", name: "죠고", grade: "1급", attr: "CONVERT", atk: 21, def: 13, spd: 17, ce: 23, hp: 88, crt: D, tec: D, mnt: D, total: 0 },
  { id: "hanami", name: "하나미", grade: "1급", attr: "CONVERT", atk: 18, def: 19, spd: 16, ce: 20, hp: 92, crt: D, tec: D, mnt: D, total: 0 },
  { id: "naobito", name: "나오비토", grade: "1급", attr: "BODY", atk: 18, def: 14, spd: 20, ce: 19, hp: 82, crt: D, tec: D, mnt: D, total: 0 },
  { id: "naoya", name: "나오야", grade: "1급", attr: "BODY", atk: 18, def: 13, spd: 23, ce: 18, hp: 78, crt: D, tec: D, mnt: D, total: 0 },
  { id: "higuruma", name: "히구루마", grade: "1급", attr: "BARRIER", atk: 17, def: 18, spd: 16, ce: 23, hp: 86, crt: D, tec: D, mnt: D, total: 0 },
  { id: "kashimo", name: "카시모", grade: "1급", attr: "CONVERT", atk: 21, def: 15, spd: 20, ce: 21, hp: 86, crt: D, tec: D, mnt: D, total: 0 },
  { id: "ryu", name: "이시고리 류", grade: "1급", attr: "RANGE", atk: 23, def: 15, spd: 14, ce: 20, hp: 88, crt: D, tec: D, mnt: D, total: 0 },
  { id: "uro", name: "우로 타카코", grade: "1급", attr: "BARRIER", atk: 18, def: 16, spd: 20, ce: 19, hp: 82, crt: D, tec: D, mnt: D, total: 0 },
  { id: "hakari", name: "하카리", grade: "1급", attr: "BARRIER", atk: 19, def: 16, spd: 19, ce: 22, hp: 85, crt: D, tec: D, mnt: D, total: 0 },
  { id: "choso", name: "쵸소", grade: "1급", attr: "CONVERT", atk: 19, def: 16, spd: 17, ce: 19, hp: 90, crt: D, tec: D, mnt: D, total: 0 },
  { id: "todo", name: "토도 아오이", grade: "1급", attr: "BODY", atk: 20, def: 16, spd: 17, ce: 17, hp: 90, crt: D, tec: D, mnt: D, total: 0 },
  { id: "uraume", name: "우라우메", grade: "1급", attr: "CONVERT", atk: 17, def: 17, spd: 18, ce: 20, hp: 85, crt: D, tec: D, mnt: D, total: 0 },
  { id: "yorozu", name: "요로즈", grade: "1급", attr: "CONVERT", atk: 21, def: 15, spd: 17, ce: 21, hp: 87, crt: D, tec: D, mnt: D, total: 0 },
  { id: "mahito", name: "마히토", grade: "1급", attr: "SOUL", atk: 19, def: 15, spd: 19, ce: 22, hp: 83, crt: D, tec: D, mnt: D, total: 0 },
  { id: "meimei", name: "메이메이", grade: "1급", attr: "RANGE", atk: 20, def: 15, spd: 16, ce: 18, hp: 88, crt: D, tec: D, mnt: D, total: 0 },
  { id: "dagon", name: "다곤", grade: "1급", attr: "CONVERT", atk: 19, def: 17, spd: 16, ce: 21, hp: 90, crt: D, tec: D, mnt: D, total: 0 },
  { id: "mechamaru", name: "메카마루", grade: "1급", attr: "RANGE", atk: 19, def: 17, spd: 14, ce: 21, hp: 85, crt: D, tec: D, mnt: D, total: 0 },
  { id: "miguel", name: "미겔", grade: "1급", attr: "BODY", atk: 18, def: 16, spd: 19, ce: 18, hp: 88, crt: D, tec: D, mnt: D, total: 0 },
  { id: "smallpox", name: "포창신", grade: "1급", attr: "CURSE", atk: 18, def: 18, spd: 14, ce: 22, hp: 90, crt: D, tec: D, mnt: D, total: 0 },
  { id: "kurourushi", name: "쿠로우루시", grade: "1급", attr: "CURSE", atk: 19, def: 14, spd: 18, ce: 20, hp: 84, crt: D, tec: D, mnt: D, total: 0 },
  { id: "bansho", name: "만상", grade: "1급", attr: "CONVERT", atk: 21, def: 16, spd: 16, ce: 20, hp: 91, crt: D, tec: D, mnt: D, total: 0 },
  { id: "tsurugi", name: "츠루기", grade: "1급", attr: "BODY", atk: 20, def: 15, spd: 19, ce: 0, hp: 87, crt: 35, tec: 50, mnt: 40, total: 0 },
  // 준1급 (17)
  { id: "megumi", name: "후시구로 메구미", grade: "준1급", attr: "SOUL", atk: 14, def: 15, spd: 17, ce: 19, hp: 80, crt: D, tec: D, mnt: D, total: 0 },
  { id: "inumaki", name: "이누마키 토게", grade: "준1급", attr: "CURSE", atk: 15, def: 13, spd: 16, ce: 21, hp: 77, crt: D, tec: D, mnt: D, total: 0 },
  { id: "maki", name: "젠인 마키", grade: "준1급", attr: "BODY", atk: 17, def: 15, spd: 18, ce: 5, hp: 82, crt: D, tec: D, mnt: D, total: 0 },
  { id: "angel", name: "천사/하나", grade: "준1급", attr: "BARRIER", atk: 15, def: 17, spd: 16, ce: 22, hp: 79, crt: D, tec: D, mnt: D, total: 0 },
  { id: "reggie", name: "레지 스타", grade: "준1급", attr: "RANGE", atk: 16, def: 14, spd: 17, ce: 19, hp: 78, crt: D, tec: D, mnt: D, total: 0 },
  { id: "takaba", name: "타카바", grade: "준1급", attr: "SOUL", atk: 14, def: 18, spd: 15, ce: 20, hp: 83, crt: D, tec: D, mnt: D, total: 0 },
  { id: "jinichi", name: "젠인 진이치", grade: "준1급", attr: "BODY", atk: 17, def: 16, spd: 15, ce: 16, hp: 85, crt: D, tec: D, mnt: D, total: 0 },
  { id: "ogi", name: "젠인 오기", grade: "준1급", attr: "CONVERT", atk: 18, def: 14, spd: 16, ce: 17, hp: 82, crt: D, tec: D, mnt: D, total: 0 },
  { id: "kamo", name: "카모 노리토시", grade: "준1급", attr: "CONVERT", atk: 15, def: 14, spd: 17, ce: 18, hp: 78, crt: D, tec: D, mnt: D, total: 0 },
  { id: "hazenoki", name: "하제노키", grade: "준1급", attr: "RANGE", atk: 16, def: 12, spd: 17, ce: 17, hp: 75, crt: D, tec: D, mnt: D, total: 0 },
  { id: "kusakabe", name: "쿠사카베", grade: "준1급", attr: "BODY", atk: 16, def: 16, spd: 15, ce: 14, hp: 85, crt: D, tec: D, mnt: D, total: 0 },
  { id: "uiui", name: "우이우이", grade: "준1급", attr: "BARRIER", atk: 14, def: 14, spd: 18, ce: 21, hp: 75, crt: D, tec: D, mnt: D, total: 0 },
  { id: "yuka", name: "옷코츠 유카", grade: "준1급", attr: "BODY", atk: 14, def: 13, spd: 18, ce: 17, hp: 74, crt: D, tec: D, mnt: D, total: 0 },
  { id: "cross", name: "크로스", grade: "준1급", attr: "CONVERT", atk: 18, def: 15, spd: 17, ce: 19, hp: 80, crt: D, tec: D, mnt: D, total: 0 },
  { id: "marulu", name: "마루", grade: "준1급", attr: "BARRIER", atk: 15, def: 16, spd: 16, ce: 23, hp: 79, crt: D, tec: D, mnt: D, total: 0 },
  { id: "usami", name: "우사미", grade: "준1급", attr: "CURSE", atk: 16, def: 14, spd: 16, ce: 21, hp: 79, crt: D, tec: D, mnt: D, total: 0 },
  { id: "yaga", name: "야가 마사미치", grade: "준1급", attr: "SOUL", atk: 16, def: 15, spd: 14, ce: 18, hp: 85, crt: D, tec: D, mnt: D, total: 0 },
];

for (const c of ALL) c.total = c.atk + c.def + c.spd + c.ce + c.hp;

const B = {
  ATK_COEFF: 0.4, BASE_DMG: 5, DEF_RATE: 0.7, MAX_DEF: 22,
  CE_COEFF: 0.006, CE0_BONUS: 0.12, TEC_BASE: 20, TEC_RATE: 1.0,
  SKILL_MULT: 1.3, ULT_MULT: 2.0, CRT_DIV: 150, CRT_MULT: 1.5,
  MNT_RATE: 0.5, MIN_DMG: 5, MAX_TURNS: 30, GAUGE_CHARGE: 25,
};

const ATTR_KO: Record<string, string> = {
  BARRIER: '결계', BODY: '신체', CURSE: '저주', SOUL: '혼백', CONVERT: '변환', RANGE: '원거리'
};

// ═══ 전투 로직 ═══

function calcDmg(atk: C, def: C, ult: boolean, policy: { atkMod: number, defMod: number } = { atkMod: 1, defMod: 1 }): number {
  let d = Math.round((atk.atk * policy.atkMod) * B.ATK_COEFF + B.BASE_DMG);
  d = Math.round(d * (1 - Math.min((def.def * policy.defMod) * B.DEF_RATE, B.MAX_DEF) / 100));
  d = Math.round(d * (1 - def.mnt * B.MNT_RATE / 100));
  d = Math.round(d * getAttrMult(atk.attr, def.attr));
  d = Math.round(d * (atk.ce === 0 ? 1 + B.CE0_BONUS : 1 + atk.ce * B.CE_COEFF));
  d = Math.max(d, B.MIN_DMG);
  d = Math.round(d * Math.max(0.8, Math.min(1.2, 1 + (atk.total - def.total) / 1000)));
  d = Math.round(d * (0.9 + Math.random() * 0.2));
  let m = ult ? B.ULT_MULT : (Math.random() * 100 < B.TEC_BASE + atk.tec * B.TEC_RATE ? B.SKILL_MULT : 1.0);
  let f = Math.round(d * m);
  if (Math.random() < atk.crt / B.CRT_DIV) f = Math.round(f * B.CRT_MULT);
  return Math.max(B.MIN_DMG, f);
}

function sim1v1(a: C, b: C, pA = { atkMod: 1, defMod: 1 }, pB = { atkMod: 1, defMod: 1 }): boolean {
  let aH = a.hp, bH = b.hp, aG = 0, bG = 0, aAtk = a.spd >= b.spd;
  for (let t = 1; t <= B.MAX_TURNS && aH > 0 && bH > 0; t++) {
    const atker = aAtk ? a : b, defer = aAtk ? b : a;
    const pol = aAtk ? pA : pB, defPol = aAtk ? pB : pA;
    const ult = (aAtk ? aG : bG) >= 100;
    const d = calcDmg(atker, defer, ult, { atkMod: pol.atkMod, defMod: defPol.defMod });
    if (aAtk) { bH -= d; if (ult) aG = 0; else { aG = Math.min(100, aG + B.GAUGE_CHARGE); bG = Math.min(100, bG + B.GAUGE_CHARGE); } }
    else { aH -= d; if (ult) bG = 0; else { aG = Math.min(100, aG + B.GAUGE_CHARGE); bG = Math.min(100, bG + B.GAUGE_CHARGE); } }
    aAtk = !aAtk;
  }
  return aH > bH;
}

// ═══ 팀리그 매치 시뮬레이션 ═══
// 5라운드 1v1 순차전 (선승 3), 2:2시 에이스매치

interface TeamMatchResult {
  teamAWin: boolean;
  roundWinners: number[];  // 각 라운드에서 이긴 카드의 인덱스 (ALL 기준)
  aceUsed: boolean;
}

function simTeamMatch(
  teamA: C[],   // 5 cards
  teamB: C[],   // 5 cards
  polA = { atkMod: 1, defMod: 1 },
  polB = { atkMod: 1, defMod: 1 }
): TeamMatchResult {
  let aScore = 0, bScore = 0;
  const roundWinners: number[] = [];

  // 라운드 1~4: 라인업 순서대로 1v1
  for (let r = 0; r < 4 && aScore < 3 && bScore < 3; r++) {
    const cardA = teamA[r], cardB = teamB[r];
    const aWin = sim1v1(cardA, cardB, polA, polB);
    if (aWin) {
      aScore++;
      roundWinners.push(ALL.indexOf(cardA));
    } else {
      bScore++;
      roundWinners.push(ALL.indexOf(cardB));
    }
  }

  // 2:2 에이스 매치 (5번째 카드 = 에이스)
  let aceUsed = false;
  if (aScore === 2 && bScore === 2) {
    aceUsed = true;
    const aceA = teamA[4], aceB = teamB[4];
    const aWin = sim1v1(aceA, aceB, polA, polB);
    if (aWin) {
      aScore++;
      roundWinners.push(ALL.indexOf(aceA));
    } else {
      bScore++;
      roundWinners.push(ALL.indexOf(aceB));
    }
  }

  return { teamAWin: aScore > bScore, roundWinners, aceUsed };
}

// ═══ 등급별 분석 ═══

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 조합 생성
function combinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]];
  if (arr.length < k) return [];
  const result: T[][] = [];
  const [first, ...rest] = arr;
  // Include first
  for (const combo of combinations(rest, k - 1)) {
    result.push([first, ...combo]);
  }
  // Exclude first
  result.push(...combinations(rest, k));
  return result;
}

interface GradeAnalysis {
  grade: string;
  chars: C[];
  // 개인리그 (1v1 라운드로빈)
  individual: { char: C, wr: number }[];
  // 팀리그
  team: {
    char: C;
    teamWR: number;      // 이 카드 포함 팀의 승률
    roundWR: number;      // 라운드에서 이 카드가 이긴 비율
    aceWR: number;        // 에이스로 출전 시 승률
    carryIndex: number;   // teamWR - baseTeamWR (캐리 지수)
  }[];
}

function analyzeGrade(grade: string, chars: C[], teamTrials: number): GradeAnalysis {
  const n = chars.length;

  // ═══ 1. 개인리그: 등급 내 1v1 라운드로빈 ═══
  const INDIVIDUAL_TRIALS = 5000;
  const wm: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      let w = 0;
      for (let t = 0; t < INDIVIDUAL_TRIALS; t++) {
        if (sim1v1(chars[i], chars[j])) w++;
      }
      wm[i][j] = w / INDIVIDUAL_TRIALS;
      wm[j][i] = 1 - wm[i][j];
    }
  }

  const individual = chars.map((c, i) => {
    const wr = wm[i].reduce((s, v, j) => j === i ? s : s + v, 0) / (n - 1);
    return { char: c, wr };
  }).sort((a, b) => b.wr - a.wr);

  // ═══ 2. 팀리그: 팀 매치 시뮬레이션 ═══

  // 캐릭터별 통계
  const charTeamWins: number[] = new Array(n).fill(0);    // 포함 팀 승리
  const charTeamGames: number[] = new Array(n).fill(0);   // 포함 팀 총 게임
  const charRoundWins: number[] = new Array(n).fill(0);   // 라운드 승리
  const charRoundGames: number[] = new Array(n).fill(0);  // 라운드 출전
  const charAceWins: number[] = new Array(n).fill(0);     // 에이스 승리
  const charAceGames: number[] = new Array(n).fill(0);    // 에이스 출전

  if (n >= 5) {
    // 팀 구성: 5인 팀, 5번째 = 에이스 (가장 강한 카드)
    // 소규모 등급은 전수 조합, 대규모는 샘플링
    const allTeams = n <= 8 ? combinations(chars, 5) : null;
    const totalTeams = allTeams ? allTeams.length : 0;

    if (allTeams && totalTeams <= 50) {
      // 전수 조합 (특급 C(6,5)=6, 준특급 C(7,5)=21)
      for (let i = 0; i < totalTeams; i++) {
        for (let j = i + 1; j < totalTeams; j++) {
          // 랜덤 라인업 순서 (에이스 = 인덱스 4)
          for (let trial = 0; trial < Math.ceil(teamTrials / (totalTeams * (totalTeams - 1) / 2)); trial++) {
            const tA = shuffle(allTeams[i]);
            const tB = shuffle(allTeams[j]);
            const result = simTeamMatch(tA, tB);

            // 팀 통계
            for (const c of allTeams[i]) {
              const ci = chars.indexOf(c);
              charTeamGames[ci]++;
              if (result.teamAWin) charTeamWins[ci]++;
            }
            for (const c of allTeams[j]) {
              const ci = chars.indexOf(c);
              charTeamGames[ci]++;
              if (!result.teamAWin) charTeamWins[ci]++;
            }

            // 라운드 승리 통계
            for (let r = 0; r < Math.min(4, tA.length); r++) {
              const ciA = chars.indexOf(tA[r]);
              const ciB = chars.indexOf(tB[r]);
              charRoundGames[ciA]++;
              charRoundGames[ciB]++;
            }
            for (const wi of result.roundWinners) {
              const ci = chars.indexOf(ALL[wi]);
              if (ci >= 0) charRoundWins[ci]++;
            }

            // 에이스 통계
            if (result.aceUsed) {
              const aceAi = chars.indexOf(tA[4]);
              const aceBi = chars.indexOf(tB[4]);
              charAceGames[aceAi]++;
              charAceGames[aceBi]++;
              const lastWinner = result.roundWinners[result.roundWinners.length - 1];
              const wi = chars.indexOf(ALL[lastWinner]);
              if (wi >= 0) charAceWins[wi]++;
            }
          }
        }
      }
    } else {
      // 랜덤 샘플링 (1급, 준1급)
      for (let trial = 0; trial < teamTrials; trial++) {
        const pool = shuffle(chars);
        const tA = pool.slice(0, 5);
        const remaining = pool.slice(5);
        // B팀도 랜덤 5명 (겹칠 수 있음 - 동일 등급이므로)
        const poolB = shuffle(chars);
        const tB = poolB.slice(0, 5);

        const result = simTeamMatch(shuffle(tA), shuffle(tB));

        for (const c of tA) {
          const ci = chars.indexOf(c);
          charTeamGames[ci]++;
          if (result.teamAWin) charTeamWins[ci]++;
        }
        for (const c of tB) {
          const ci = chars.indexOf(c);
          charTeamGames[ci]++;
          if (!result.teamAWin) charTeamWins[ci]++;
        }
        for (const wi of result.roundWinners) {
          const ci = chars.indexOf(ALL[wi]);
          if (ci >= 0) charRoundWins[ci]++;
        }
        // 라운드 출전 수
        const actualTa = shuffle(tA);
        const actualTb = shuffle(tB);
        for (let r = 0; r < 4; r++) {
          charRoundGames[chars.indexOf(actualTa[r])]++;
          charRoundGames[chars.indexOf(actualTb[r])]++;
        }
        if (result.aceUsed) {
          const aceAi = chars.indexOf(actualTa[4]);
          const aceBi = chars.indexOf(actualTb[4]);
          charAceGames[aceAi]++;
          charAceGames[aceBi]++;
          const lastWinner = result.roundWinners[result.roundWinners.length - 1];
          const wi = chars.indexOf(ALL[lastWinner]);
          if (wi >= 0) charAceWins[wi]++;
        }
      }
    }
  }

  const baseTeamWR = 0.5; // 기준 팀 승률
  const team = chars.map((c, i) => ({
    char: c,
    teamWR: charTeamGames[i] > 0 ? charTeamWins[i] / charTeamGames[i] : 0.5,
    roundWR: charRoundGames[i] > 0 ? charRoundWins[i] / charRoundGames[i] : 0.5,
    aceWR: charAceGames[i] > 0 ? charAceWins[i] / charAceGames[i] : 0.5,
    carryIndex: charTeamGames[i] > 0 ? (charTeamWins[i] / charTeamGames[i]) - baseTeamWR : 0,
  })).sort((a, b) => b.teamWR - a.teamWR);

  return { grade, chars, individual, team };
}

// ═══ 정책 효과 분석 ═══

interface PolicyResult {
  policy: string;
  avgWR: number;
  bestChar: { name: string; wr: number };
  worstChar: { name: string; wr: number };
}

function analyzePolicies(chars: C[]): PolicyResult[] {
  const policies = [
    { name: '공격적', atkMod: 1.05, defMod: 0.97 },
    { name: '균형', atkMod: 1.0, defMod: 1.0 },
    { name: '수비적', atkMod: 0.97, defMod: 1.05 },
  ];
  const TRIALS = 3000;
  const results: PolicyResult[] = [];

  for (const pol of policies) {
    const pMod = { atkMod: pol.atkMod, defMod: pol.defMod };
    const neutral = { atkMod: 1, defMod: 1 };
    const wrs: { name: string; wr: number }[] = [];

    for (const c of chars) {
      let wins = 0, games = 0;
      for (const opp of chars) {
        if (c === opp) continue;
        for (let t = 0; t < TRIALS; t++) {
          if (sim1v1(c, opp, pMod, neutral)) wins++;
          games++;
        }
      }
      wrs.push({ name: c.name, wr: wins / games });
    }

    const avgWR = wrs.reduce((s, w) => s + w.wr, 0) / wrs.length;
    wrs.sort((a, b) => b.wr - a.wr);
    results.push({
      policy: pol.name,
      avgWR,
      bestChar: wrs[0],
      worstChar: wrs[wrs.length - 1],
    });
  }

  return results;
}

// ═══ 메인 실행 ═══

console.log('╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║     개인리그 / 팀리그 등급별 종합 시뮬레이션                                ║');
console.log('╚══════════════════════════════════════════════════════════════════════════╝\n');

const grades = ['특급', '준특급', '1급', '준1급'];
const gradeChars: Record<string, C[]> = {};
for (const g of grades) gradeChars[g] = ALL.filter(c => c.grade === g);

const allAnalyses: GradeAnalysis[] = [];
const allPolicies: Record<string, PolicyResult[]> = {};

for (const g of grades) {
  const chars = gradeChars[g];
  const teamTrials = chars.length <= 8 ? 5000 : 3000;

  console.log(`\n  ▶ ${g} (${chars.length}명) 분석 중...`);
  const start = Date.now();
  const analysis = analyzeGrade(g, chars, teamTrials);
  allAnalyses.push(analysis);

  // 정책 효과
  console.log(`    정책 효과 분석 중...`);
  allPolicies[g] = analyzePolicies(chars);

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`    완료 (${elapsed}s)`);
}

// ═══ 결과 출력 ═══

for (const analysis of allAnalyses) {
  const g = analysis.grade;
  const n = analysis.chars.length;

  console.log('\n');
  console.log(`╔══════════════════════════════════════════════════════════════════════════╗`);
  console.log(`║  【${g}】 ${n}명 — 개인리그 / 팀리그 비교                                  ║`);
  console.log(`╚══════════════════════════════════════════════════════════════════════════╝`);

  // 개인리그 vs 팀리그 비교 테이블
  console.log(`\n  ${'#'.padStart(3)} ${'캐릭터'.padEnd(14)} ${'속성'.padEnd(4)}  ` +
    `${'개인WR'.padStart(6)} ${'개인순위'.padStart(5)}  ` +
    `${'팀WR'.padStart(5)} ${'팀순위'.padStart(4)} ${'라운드WR'.padStart(7)} ${'에이스WR'.padStart(7)} ${'캐리'.padStart(5)}  ${'개→팀'.padStart(5)}`);
  console.log('  ' + '─'.repeat(95));

  // 개인 순위 맵
  const indRank: Record<string, { rank: number; wr: number }> = {};
  analysis.individual.forEach((x, i) => { indRank[x.char.id] = { rank: i + 1, wr: x.wr }; });

  // 팀 순위 맵
  const teamRank: Record<string, { rank: number; data: typeof analysis.team[0] }> = {};
  analysis.team.forEach((x, i) => { teamRank[x.char.id] = { rank: i + 1, data: x }; });

  // 통합 표시 (팀WR 순)
  for (let i = 0; i < analysis.team.length; i++) {
    const t = analysis.team[i];
    const c = t.char;
    const ind = indRank[c.id];
    const tRank = i + 1;
    const diff = ind.rank - tRank;
    const diffStr = diff > 0 ? `▲${diff}` : diff < 0 ? `▼${Math.abs(diff)}` : '  =';
    const opwk = t.teamWR >= 0.57 ? ' OP' : t.teamWR <= 0.43 ? ' WK' : '';
    const indFlag = ind.wr >= 0.65 ? '⚠' : ind.wr <= 0.35 ? '⚠' : ' ';

    console.log(
      `  ${tRank.toString().padStart(3)} ${c.name.padEnd(14)} ${ATTR_KO[c.attr].padEnd(4)}  ` +
      `${(ind.wr * 100).toFixed(1).padStart(5)}% ${ind.rank.toString().padStart(3)}위${indFlag}  ` +
      `${(t.teamWR * 100).toFixed(1).padStart(5)}% ${tRank.toString().padStart(3)}위 ` +
      `${(t.roundWR * 100).toFixed(1).padStart(6)}% ${(t.aceWR * 100).toFixed(1).padStart(6)}% ` +
      `${(t.carryIndex > 0 ? '+' : '') + (t.carryIndex * 100).toFixed(1).padStart(4)}%  ${diffStr}${opwk}`
    );
  }

  // 속성별 팀리그 평균
  const attrTeam: Record<string, number[]> = {};
  const attrInd: Record<string, number[]> = {};
  for (const t of analysis.team) {
    const ak = ATTR_KO[t.char.attr];
    if (!attrTeam[ak]) { attrTeam[ak] = []; attrInd[ak] = []; }
    attrTeam[ak].push(t.teamWR);
    attrInd[ak].push(indRank[t.char.id].wr);
  }
  console.log('\n  속성별 평균:');
  for (const [attr, wrs] of Object.entries(attrTeam)) {
    const avgTeam = wrs.reduce((s, x) => s + x, 0) / wrs.length;
    const avgInd = attrInd[attr].reduce((s, x) => s + x, 0) / attrInd[attr].length;
    console.log(`    ${attr.padEnd(4)}(${wrs.length}): 개인 ${(avgInd * 100).toFixed(1)}% → 팀 ${(avgTeam * 100).toFixed(1)}%`);
  }

  // 정책 효과
  const policies = allPolicies[g];
  console.log('\n  팀 정책 효과 (vs 균형 상대):');
  for (const p of policies) {
    console.log(
      `    ${p.policy.padEnd(4)}: 평균 ${(p.avgWR * 100).toFixed(1)}%  ` +
      `최대수혜 ${p.bestChar.name}(${(p.bestChar.wr * 100).toFixed(1)}%)  ` +
      `최대손해 ${p.worstChar.name}(${(p.worstChar.wr * 100).toFixed(1)}%)`
    );
  }

  // 밸런스 판정
  const indRange = analysis.individual[0].wr - analysis.individual[n - 1].wr;
  const teamMax = Math.max(...analysis.team.map(t => t.teamWR));
  const teamMin = Math.min(...analysis.team.map(t => t.teamWR));
  const teamRange = teamMax - teamMin;
  console.log('\n  밸런스:');
  console.log(`    개인리그 격차: ${(indRange * 100).toFixed(0)}%p (${analysis.individual[0].char.name} ${(analysis.individual[0].wr * 100).toFixed(0)}% ~ ${analysis.individual[n - 1].char.name} ${(analysis.individual[n - 1].wr * 100).toFixed(0)}%)`);
  console.log(`    팀리그 격차:   ${(teamRange * 100).toFixed(0)}%p`);
}

// ═══ 종합 인사이트 ═══

console.log('\n\n');
console.log('╔══════════════════════════════════════════════════════════════════════════╗');
console.log('║                         종합 인사이트 & 취약점                             ║');
console.log('╚══════════════════════════════════════════════════════════════════════════╝');

// 개인 vs 팀 가치 역전 캐릭터
console.log('\n━━━ 개인→팀 순위 변동 TOP 5 (상승 / 하락) ━━━\n');

const allChanges: { char: C; grade: string; indRank: number; teamRank: number; diff: number; indWR: number; teamWR: number }[] = [];
for (const analysis of allAnalyses) {
  const indRank: Record<string, number> = {};
  analysis.individual.forEach((x, i) => { indRank[x.char.id] = i + 1; });
  analysis.team.forEach((t, i) => {
    const tRank = i + 1;
    const iRank = indRank[t.char.id];
    allChanges.push({
      char: t.char,
      grade: analysis.grade,
      indRank: iRank,
      teamRank: tRank,
      diff: iRank - tRank,
      indWR: analysis.individual.find(x => x.char.id === t.char.id)!.wr,
      teamWR: t.teamWR,
    });
  });
}

const rising = [...allChanges].sort((a, b) => b.diff - a.diff).slice(0, 5);
const falling = [...allChanges].sort((a, b) => a.diff - b.diff).slice(0, 5);

console.log('  【팀에서 더 빛나는 캐릭터 (팀 순위 상승)】');
for (const c of rising) {
  if (c.diff <= 0) break;
  console.log(`    ${c.char.name} [${c.grade}] 개인${c.indRank}위→팀${c.teamRank}위 (▲${c.diff}) 개인${(c.indWR*100).toFixed(0)}%→팀${(c.teamWR*100).toFixed(0)}%`);
}

console.log('\n  【팀에서 빛이 바래는 캐릭터 (팀 순위 하락)】');
for (const c of falling) {
  if (c.diff >= 0) break;
  console.log(`    ${c.char.name} [${c.grade}] 개인${c.indRank}위→팀${c.teamRank}위 (▼${Math.abs(c.diff)}) 개인${(c.indWR*100).toFixed(0)}%→팀${(c.teamWR*100).toFixed(0)}%`);
}

// OP/WK 캐릭터 종합
console.log('\n━━━ OP/WK 캐릭터 종합 ━━━\n');

console.log('  【OP (개인 65%+ 또는 팀 57%+)】');
for (const a of allAnalyses) {
  for (const t of a.team) {
    const indData = a.individual.find(x => x.char.id === t.char.id)!;
    if (indData.wr >= 0.65 || t.teamWR >= 0.57) {
      console.log(`    ${t.char.name} [${a.grade}/${ATTR_KO[t.char.attr]}] 개인${(indData.wr*100).toFixed(1)}% 팀${(t.teamWR*100).toFixed(1)}% 캐리${(t.carryIndex*100).toFixed(1)}%`);
    }
  }
}

console.log('\n  【WK (개인 35%- 또는 팀 43%-)】');
for (const a of allAnalyses) {
  for (const t of a.team) {
    const indData = a.individual.find(x => x.char.id === t.char.id)!;
    if (indData.wr <= 0.35 || t.teamWR <= 0.43) {
      console.log(`    ${t.char.name} [${a.grade}/${ATTR_KO[t.char.attr]}] 개인${(indData.wr*100).toFixed(1)}% 팀${(t.teamWR*100).toFixed(1)}%`);
    }
  }
}

// 등급별 밸런스 요약
console.log('\n━━━ 등급별 밸런스 요약 ━━━\n');
console.log(`  ${'등급'.padEnd(6)} ${'개인격차'.padStart(7)} ${'팀격차'.padStart(6)} ${'인원'.padStart(3)} ${'최적정책'.padStart(6)} ${'최약점'.padEnd(20)}`);
console.log('  ' + '─'.repeat(70));

for (const a of allAnalyses) {
  const n = a.chars.length;
  const indRange = (a.individual[0].wr - a.individual[n - 1].wr) * 100;
  const teamMax = Math.max(...a.team.map(t => t.teamWR));
  const teamMin = Math.min(...a.team.map(t => t.teamWR));
  const teamRange = (teamMax - teamMin) * 100;
  const policies = allPolicies[a.grade];
  const bestPolicy = policies.sort((a, b) => b.avgWR - a.avgWR)[0];
  const weakest = a.team[a.team.length - 1];

  console.log(
    `  ${a.grade.padEnd(6)} ${indRange.toFixed(0).padStart(5)}%p ${teamRange.toFixed(0).padStart(4)}%p ${n.toString().padStart(3)}명  ` +
    `${bestPolicy.policy.padStart(4)}(${(bestPolicy.avgWR*100).toFixed(0)}%)  ` +
    `${weakest.char.name}(팀${(weakest.teamWR*100).toFixed(0)}%)`
  );
}
