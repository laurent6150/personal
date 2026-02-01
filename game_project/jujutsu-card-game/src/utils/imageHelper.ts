// ========================================
// 캐릭터 이미지 헬퍼 - 로컬 이미지 사용
// ========================================

import { ATTRIBUTES } from '../data';
import type { Attribute } from '../types';

// 로컬 캐릭터 이미지 경로 매핑
export const CHARACTER_IMAGES: Record<string, string> = {
  // 특급
  gojo_satoru: '/images/characters/Satoru_Gojo.jpg',
  ryomen_sukuna: '/images/characters/Ryomen_Sukuna.jpg',
  kenjaku: '/images/characters/Kenjaku (in Suguru Geto Body).jpg',

  // 1급
  fushiguro_toji: '/images/characters/Toji_Fushiguro.jpg',
  nanami_kento: '/images/characters/Kento_Nanami.jpg',
  jogo: '/images/characters/Jogo.jpg',
  hanami: '/images/characters/Hanami.jpg',
  choso: '/images/characters/Choso.jpg',
  yuta_okkotsu: '/images/characters/Yuta_Okkotsu.jpg',
  todo_aoi: '/images/characters/Aoi_Todo.jpg',

  // 준1급
  itadori_yuji: '/images/characters/Yuji_Itadori.jpg',
  fushiguro_megumi: '/images/characters/Megumi_Fushiguro.jpg',
  mahito: '/images/characters/Mahito.jpg',
  mei_mei: '/images/characters/Mei_Mei.jpg',
  inumaki_toge: '/images/characters/Toge_Inumaki.jpg',
  maki_zenin: '/images/characters/Maki_Zenin (Normal).jpg',

  // 2급
  kugisaki_nobara: '/images/characters/Nobara_Kugisaki.jpg',
  ino_takuma: '/images/characters/Takuma_Ino.jpg',
  panda: '/images/characters/Panda.jpg',
  nishimiya_momo: '/images/characters/Momo_Nishimiya.jpg',
};

// UI Avatars를 사용한 플레이스홀더 이미지 생성
export function getPlaceholderImage(name: string, attribute: Attribute): string {
  const color = ATTRIBUTES[attribute].color.replace('#', '');
  const bgColor = color;
  // UI Avatars API 사용 - 이름 이니셜로 아바타 생성
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=fff&size=200&bold=true&format=svg`;
}

// 캐릭터 이미지 URL 가져오기 (로컬 이미지 + 폴백)
export function getCharacterImage(characterId: string, name: string, attribute: Attribute): string {
  // 로컬 이미지가 있으면 사용, 없으면 플레이스홀더
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
