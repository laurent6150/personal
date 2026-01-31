// ========================================
// 캐릭터 이미지 헬퍼 - 실제 이미지 + 폴백
// ========================================

import { ATTRIBUTES } from '../data';
import type { Attribute } from '../types';

// 캐릭터별 실제 이미지 URL (고품질 PNG/WebP)
// 실제 프로젝트에서는 public/images/characters/ 폴더에 이미지를 추가하세요
export const CHARACTER_IMAGES: Record<string, string> = {
  // S등급
  gojo_satoru: '/images/characters/gojo_satoru.png',
  ryomen_sukuna: '/images/characters/ryomen_sukuna.png',
  kenjaku: '/images/characters/kenjaku.png',

  // A등급
  fushiguro_toji: '/images/characters/fushiguro_toji.png',
  nanami_kento: '/images/characters/nanami_kento.png',
  jogo: '/images/characters/jogo.png',
  hanami: '/images/characters/hanami.png',
  choso: '/images/characters/choso.png',
  yuta_okkotsu: '/images/characters/yuta_okkotsu.png',
  todo_aoi: '/images/characters/todo_aoi.png',

  // B등급
  itadori_yuji: '/images/characters/itadori_yuji.png',
  fushiguro_megumi: '/images/characters/fushiguro_megumi.png',
  mahito: '/images/characters/mahito.png',
  mei_mei: '/images/characters/mei_mei.png',
  inumaki_toge: '/images/characters/inumaki_toge.png',
  maki_zenin: '/images/characters/maki_zenin.png',

  // C등급
  kugisaki_nobara: '/images/characters/kugisaki_nobara.png',
  ino_takuma: '/images/characters/ino_takuma.png',
  panda: '/images/characters/panda.png',
  nishimiya_momo: '/images/characters/nishimiya_momo.png',
};

// 플레이스홀더 이미지 생성 (폴백용)
export function getPlaceholderImage(name: string, attribute: Attribute): string {
  const color = ATTRIBUTES[attribute].color.replace('#', '');
  return `https://via.placeholder.com/200x280/${color}/FFFFFF?text=${encodeURIComponent(name)}`;
}

// 캐릭터 이미지 URL 가져오기 (실제 이미지 + 폴백)
export function getCharacterImage(characterId: string, name: string, attribute: Attribute): string {
  return CHARACTER_IMAGES[characterId] || getPlaceholderImage(name, attribute);
}

// 이미지 로드 실패 시 폴백 처리를 위한 훅에서 사용
export function handleImageError(
  event: React.SyntheticEvent<HTMLImageElement>,
  name: string,
  attribute: Attribute
): void {
  const target = event.currentTarget;
  target.onerror = null; // 무한 루프 방지
  target.src = getPlaceholderImage(name, attribute);
}
