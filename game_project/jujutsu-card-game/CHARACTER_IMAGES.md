# 캐릭터 이미지 URL 목록

Claude Code에 전달하여 `data/characters.ts`의 `imageUrl` 필드를 업데이트하세요.

## 이미지 URL 데이터

```typescript
// data/characterImages.ts

export const CHARACTER_IMAGES: Record<string, string> = {
  // S등급
  "gojo_satoru": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/1/10/Gojo_recovers_%28Anime%29.png",
  "ryomen_sukuna": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/b/b5/Sukuna_full_appearance_%28Anime%29.png",
  "kenjaku": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/5/58/Kenjaku_%28Anime%29.png",
  
  // A등급
  "fushiguro_toji": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/d/d3/Toji_Fushiguro_%28Anime%29.png",
  "nanami_kento": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/9/9d/Nanami_ready_to_fight_%28Anime%29.png",
  "jogo": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/b/bd/Jogo_%28Anime%29.png",
  "hanami": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/3/36/Hanami_%28Anime%29.png",
  "choso": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/c/c5/Choso_%28Anime%29.png",
  "yuta_okkotsu": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/2/2e/Yuta_Okkotsu_%28Movie%29.png",
  "todo_aoi": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/c/cb/Aoi_Todo_%28Anime%29.png",
  
  // B등급
  "itadori_yuji": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/4/4e/Yuji_Itadori_%28Anime%29.png",
  "fushiguro_megumi": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/8/88/Megumi_Fushiguro_%28Anime%29.png",
  "mahito": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/9/90/Mahito_%28Anime%29.png",
  "mei_mei": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/f/f1/Mei_Mei_%28Anime%29.png",
  "inumaki_toge": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/2/27/Toge_Inumaki_%28Anime%29.png",
  "maki_zenin": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/1/18/Maki_Zenin_%28Anime%29.png",
  
  // C등급
  "kugisaki_nobara": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/5/57/Nobara_Kugisaki_%28Anime%29.png",
  "ino_takuma": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/1/1c/Takuma_Ino_%28Anime%29.png",
  "panda": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/a/a6/Panda_%28Anime%29.png",
  "nishimiya_momo": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/4/41/Momo_Nishimiya_%28Anime%29.png"
};
```

## Claude Code 프롬프트

```
캐릭터 이미지를 적용해주세요.

1. data/characterImages.ts 파일을 생성하고 위 URL 데이터를 넣어주세요.

2. data/characters.ts에서 각 캐릭터의 imageUrl을 업데이트하세요:
   - CHARACTER_IMAGES[id]를 사용

3. components/Card/CardDisplay.tsx 수정:
   - 이모지 대신 실제 이미지 표시
   - 이미지 로드 실패 시 기존 이모지로 폴백

코드:
```tsx
// CardDisplay.tsx 이미지 부분
<div className="w-full h-32 overflow-hidden rounded-t-lg">
  <img 
    src={card.imageUrl} 
    alt={card.name.ko}
    className="w-full h-full object-cover object-top"
    onError={(e) => {
      e.currentTarget.style.display = 'none';
      e.currentTarget.nextElementSibling?.classList.remove('hidden');
    }}
  />
  <div className="hidden w-full h-full flex items-center justify-center text-4xl bg-gray-700">
    {getAttributeEmoji(card.attribute)}
  </div>
</div>
```
```

## 주의사항

위키 이미지 URL은 가끔 변경될 수 있습니다. 만약 이미지가 안 나오면:

1. https://jujutsu-kaisen.fandom.com 에서 해당 캐릭터 검색
2. 이미지 우클릭 → "이미지 주소 복사"
3. URL 업데이트

## 대안: 더 안정적인 방법

위키 이미지가 불안정하면, 이미지를 다운로드해서 Imgur나 Cloudinary에 업로드 후 그 URL을 사용하는 것이 더 안정적입니다.

```bash
# Imgur 업로드 (무료, 간편)
# 1. https://imgur.com/upload 에서 이미지 업로드
# 2. 직접 링크 복사 (i.imgur.com/xxxxx.png 형식)
```
