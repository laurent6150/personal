// ========================================
// 캐릭터 이미지 헬퍼 - 실제 이미지 + 폴백
// ========================================

import { ATTRIBUTES } from '../data';
import type { Attribute } from '../types';

// CORS 프록시 URL
const CORS_PROXY = 'https://corsproxy.io/?';

// 캐릭터별 실제 이미지 URL 매핑 (Fandom Wiki)
const RAW_CHARACTER_IMAGES: Record<string, string> = {
  // S등급
  gojo_satoru: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/1/10/Gojo_recovers_%28Anime%29.png/revision/latest?cb=20201121025457',
  ryomen_sukuna: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/b/b5/Sukuna_full_appearance_%28Anime%29.png/revision/latest?cb=20231019150040',
  kenjaku: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/5/58/Kenjaku_%28Anime%29.png/revision/latest?cb=20230831130935',

  // A등급
  fushiguro_toji: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/d/d3/Toji_Fushiguro_%28Anime%29.png/revision/latest?cb=20230824142812',
  nanami_kento: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/9/9d/Nanami_ready_to_fight_%28Anime%29.png/revision/latest?cb=20201128023457',
  jogo: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/b/bd/Jogo_%28Anime%29.png/revision/latest?cb=20201024185157',
  hanami: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/3/36/Hanami_%28Anime%29.png/revision/latest?cb=20210227025407',
  choso: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/c/c5/Choso_%28Anime%29.png/revision/latest?cb=20230907140329',
  yuta_okkotsu: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/2/2e/Yuta_Okkotsu_%28Movie%29.png/revision/latest?cb=20220326234457',
  todo_aoi: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/c/cb/Aoi_Todo_%28Anime%29.png/revision/latest?cb=20210220044139',

  // B등급
  itadori_yuji: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/4/4e/Yuji_Itadori_%28Anime%29.png/revision/latest?cb=20210117131027',
  fushiguro_megumi: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/8/88/Megumi_Fushiguro_%28Anime%29.png/revision/latest?cb=20210117134051',
  mahito: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/9/90/Mahito_%28Anime%29.png/revision/latest?cb=20201205010746',
  mei_mei: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/f/f1/Mei_Mei_%28Anime%29.png/revision/latest?cb=20210306030406',
  inumaki_toge: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/2/27/Toge_Inumaki_%28Anime%29.png/revision/latest?cb=20210123052212',
  maki_zenin: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/1/18/Maki_Zenin_%28Anime%29.png/revision/latest?cb=20210123051457',

  // C등급
  kugisaki_nobara: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/5/57/Nobara_Kugisaki_%28Anime%29.png/revision/latest?cb=20210117135052',
  ino_takuma: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/1/1c/Takuma_Ino_%28Anime%29.png/revision/latest?cb=20230914133227',
  panda: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/a/a6/Panda_%28Anime%29.png/revision/latest?cb=20210123051818',
  nishimiya_momo: 'https://static.wikia.nocookie.net/jujutsu-kaisen/images/4/41/Momo_Nishimiya_%28Anime%29.png/revision/latest?cb=20210227025327',
};

// CORS 프록시 적용된 이미지 URL
export const CHARACTER_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(RAW_CHARACTER_IMAGES).map(([id, url]) => [
    id,
    `${CORS_PROXY}${encodeURIComponent(url)}`,
  ])
);

// UI Avatars를 사용한 플레이스홀더 이미지 생성
export function getPlaceholderImage(name: string, attribute: Attribute): string {
  const color = ATTRIBUTES[attribute].color.replace('#', '');
  const bgColor = color;
  // UI Avatars API 사용 - 이름 이니셜로 아바타 생성
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=fff&size=200&bold=true&format=svg`;
}

// 캐릭터 이미지 URL 가져오기 (실제 이미지 + 폴백)
export function getCharacterImage(characterId: string, name: string, attribute: Attribute): string {
  // 실제 이미지가 있으면 사용, 없으면 플레이스홀더
  if (CHARACTER_IMAGES[characterId]) {
    return CHARACTER_IMAGES[characterId];
  }
  return getPlaceholderImage(name, attribute);
}

// 이미지 로드 실패 시 폴백 처리
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement>,
  name: string,
  attribute: Attribute
): void {
  const target = event.currentTarget;
  target.onerror = null; // 무한 루프 방지
  target.src = getPlaceholderImage(name, attribute);
}
