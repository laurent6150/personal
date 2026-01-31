// ========================================
// 캐릭터 이미지 헬퍼 - 실제 이미지 + 폴백
// ========================================

import { ATTRIBUTES } from '../data';
import type { Attribute } from '../types';

// 캐릭터별 실제 이미지 URL 매핑
// 실제 이미지 파일을 public/images/characters/ 폴더에 추가하세요
// 파일명: {character_id}.png (예: gojo_satoru.png)
export const CHARACTER_IMAGES: Record<string, string> = {
  // 실제 이미지가 있으면 여기에 URL 추가
  // 예: gojo_satoru: '/images/characters/gojo_satoru.png',
};

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
