// ========================================
// 캐릭터 이미지 헬퍼 - 54명 캐릭터 지원
// ========================================

import { ATTRIBUTES } from '../data/constants';
import type { Attribute } from '../types';

// 로컬 캐릭터 이미지 경로 매핑 (54명)
export const CHARACTER_IMAGES: Record<string, string> = {
  // ===== 특급 (8명) =====
  gojo_satoru: '/images/characters/Satoru_Gojo.jpg',
  geto_suguru: '/images/characters/Suguru_Geto.jpg',
  yuta_okkotsu: '/images/characters/Yuta_Okkotsu.jpg',
  yuki_tsukumo: '/images/characters/Yuki_Tsukumo.jpg',
  kenjaku: '/images/characters/Kenjaku (in Suguru Geto Body).jpg',
  tengen: '/images/characters/Tengen.jpg',
  ryomen_sukuna: '/images/characters/Ryomen_Sukuna.jpg',
  fushiguro_toji: '/images/characters/Toji_Fushiguro.jpg',

  // ===== 1급 (16명) =====
  itadori_yuji: '/images/characters/Yuji_Itadori.jpg',
  maki_zenin_awakened: '/images/characters/Maki_Zenin (Awakened).jpg',
  nanami_kento: '/images/characters/Kento_Nanami.jpg',
  jogo: '/images/characters/Jogo.jpg',
  hanami: '/images/characters/Hanami.jpg',
  naobito_zenin: '/images/characters/Naobito_Zenin.jpg',
  naoya_zenin: '/images/characters/Naoya_Zenin.jpg',
  hiromi_higuruma: '/images/characters/Hiromi_Higuruma.jpg',
  hajime_kashimo: '/images/characters/Hajime_Kashimo.jpg',
  ryu_ishigori: '/images/characters/Ryu_Ishigori.jpg',
  takako_uro: '/images/characters/Takako_Uro.jpg',
  kinji_hakari: '/images/characters/Kinji_Hakari.jpg',
  choso: '/images/characters/Choso.jpg',
  todo_aoi: '/images/characters/Aoi_Todo.jpg',
  uraume: '/images/characters/Uraume.jpg',
  yorozu: '/images/characters/Yorozu.jpg',

  // ===== 준1급 (14명) =====
  fushiguro_megumi: '/images/characters/Megumi_Fushiguro.jpg',
  mahito: '/images/characters/Mahito.jpg',
  mei_mei: '/images/characters/Mei_Mei.jpg',
  inumaki_toge: '/images/characters/Toge_Inumaki.jpg',
  maki_zenin: '/images/characters/Maki_Zenin (Normal).jpg',
  angel_hana: '/images/characters/Hana_Kurusu.jpg',
  reggie_star: '/images/characters/Reggie_Star.jpg',
  fumihiko_takaba: '/images/characters/Fumihiko_Takaba.jpg',
  charles_bernard: '/images/characters/Charles_Bernard.jpg',
  jinichi_zenin: '/images/characters/Jinichi_Zenin.jpg',
  ogi_zenin: '/images/characters/Ogi_Zenin.jpg',
  noritoshi_kamo: '/images/characters/Noritoshi_Kamo.jpg',
  iori_hazenoki: '/images/characters/Iori_Hazenoki.jpg',
  kusakabe_atsuya: '/images/characters/Atsuya_Kusakabe.jpg',

  // ===== 2급 (10명) =====
  kugisaki_nobara: '/images/characters/Nobara_Kugisaki.jpg',
  panda: '/images/characters/Panda.jpg',
  ino_takuma: '/images/characters/Takuma_Ino.jpg',
  nishimiya_momo: '/images/characters/Momo_Nishimiya.jpg',
  kasumi_miwa: '/images/characters/Kasumi_Miwa.jpg',
  mai_zenin: '/images/characters/Mai_Zenin.jpg',
  eso: '/images/characters/Eso.jpg',
  kechizu: '/images/characters/Kechizu.jpg',
  utahime_iori: '/images/characters/Utahime_Iori.jpg',
  shoko_ieiri: '/images/characters/Shoko_Ieiri.jpg',

  // ===== 3급 (6명) =====
  yu_haibara: '/images/characters/Yu_Haibara.jpg',
  kiyotaka_ijichi: '/images/characters/Kiyotaka_Ijichi.jpg',
  akari_nitta: '/images/characters/Akari_Nitta.jpg',
  misato_kuroi: '/images/characters/Misato_Kuroi.jpg',
  masamichi_yaga: '/images/characters/Masamichi_Yaga.jpg',
  eso_kechizu_duo: '/images/characters/Eso_Kechizu.jpg',
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
