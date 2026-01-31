# 실제 캐릭터 이미지 URL 적용

## 요청 사항

`CHARACTER_IMAGES` 객체에 실제 주술회전 캐릭터 이미지 URL을 추가해주세요.

Jujutsu Kaisen Fandom Wiki에서 가져온 이미지 URL입니다.

## imageHelper.ts 수정

```typescript
// src/utils/imageHelper.ts 또는 src/data/characterImages.ts

export const CHARACTER_IMAGES: Record<string, string> = {
  // S등급
  "gojo_satoru": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/1/10/Gojo_recovers_%28Anime%29.png/revision/latest?cb=20201121025457",
  "ryomen_sukuna": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/b/b5/Sukuna_full_appearance_%28Anime%29.png/revision/latest?cb=20231019150040",
  "kenjaku": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/5/58/Kenjaku_%28Anime%29.png/revision/latest?cb=20230831130935",
  
  // A등급
  "fushiguro_toji": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/d/d3/Toji_Fushiguro_%28Anime%29.png/revision/latest?cb=20230824142812",
  "nanami_kento": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/9/9d/Nanami_ready_to_fight_%28Anime%29.png/revision/latest?cb=20201128023convey",
  "jogo": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/b/bd/Jogo_%28Anime%29.png/revision/latest?cb=20201024185157",
  "hanami": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/3/36/Hanami_%28Anime%29.png/revision/latest?cb=20210227025407",
  "choso": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/c/c5/Choso_%28Anime%29.png/revision/latest?cb=20230907140329",
  "yuta_okkotsu": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/2/2e/Yuta_Okkotsu_%28Movie%29.png/revision/latest?cb=20220326234convey",
  "todo_aoi": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/c/cb/Aoi_Todo_%28Anime%29.png/revision/latest?cb=20210220044139",
  
  // B등급
  "itadori_yuji": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/4/4e/Yuji_Itadori_%28Anime%29.png/revision/latest?cb=20210117131027",
  "fushiguro_megumi": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/8/88/Megumi_Fushiguro_%28Anime%29.png/revision/latest?cb=20210117134051",
  "mahito": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/9/90/Mahito_%28Anime%29.png/revision/latest?cb=20201205010746",
  "mei_mei": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/f/f1/Mei_Mei_%28Anime%29.png/revision/latest?cb=20210306030406",
  "inumaki_toge": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/2/27/Toge_Inumaki_%28Anime%29.png/revision/latest?cb=20210123052212",
  "maki_zenin": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/1/18/Maki_Zenin_%28Anime%29.png/revision/latest?cb=20210123051457",
  
  // C등급
  "kugisaki_nobara": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/5/57/Nobara_Kugisaki_%28Anime%29.png/revision/latest?cb=20210117135052",
  "ino_takuma": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/1/1c/Takuma_Ino_%28Anime%29.png/revision/latest?cb=20230914133227",
  "panda": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/a/a6/Panda_%28Anime%29.png/revision/latest?cb=20210123051818",
  "nishimiya_momo": "https://static.wikia.nocookie.net/jujutsu-kaisen/images/4/41/Momo_Nishimiya_%28Anime%29.png/revision/latest?cb=20210227025327"
};
```

## 주의사항

Fandom Wiki 이미지는 핫링크 방지가 있을 수 있습니다. 만약 이미지가 안 나오면:

1. **CORS 프록시 사용** (임시 해결책):
```typescript
const getImageUrl = (id: string) => {
  const url = CHARACTER_IMAGES[id];
  if (!url) return getPlaceholderImage(id);
  // 프록시 경유
  return `https://corsproxy.io/?${encodeURIComponent(url)}`;
};
```

2. **또는 MyAnimeList/AniList 이미지 사용** (더 안정적):
```typescript
export const CHARACTER_IMAGES: Record<string, string> = {
  "gojo_satoru": "https://cdn.myanimelist.net/images/characters/15/422168.jpg",
  "itadori_yuji": "https://cdn.myanimelist.net/images/characters/6/467646.jpg",
  // ... 
};
```

실제로 이미지가 표시되는지 확인 후, 안 되면 말씀해주세요!
