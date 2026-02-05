---
name: daily-insight
description: "매일 관심 분야의 양질의 콘텐츠를 WebSearch로 수집하여 마크다운 파일로 저장하는 스킬. AI 활용, Self-Development, Growth Insights, Leadership, Teams 5개 카테고리에서 요일별로 2개 콘텐츠를 수집하여 GitHub 레포에 저장."
---

# Daily Insight 수집 스킬

매일 관심 분야의 양질의 콘텐츠를 WebSearch로 수집하여 마크다운 파일로 저장합니다.

## 실행 흐름

```
1. 오늘 요일/주차 확인
2. 요일별 키워드 2개 결정
3. 각 키워드별 WebSearch 실행 (최적화된 쿼리 사용)
4. 검색 결과에서 고품질 콘텐츠 1개 선택
5. 콘텐츠 상세 분석 및 템플릿에 맞춰 작성 (한국어)
6. 파일 저장 → Git commit & push
7. 완료 보고
```

## 요일별 키워드 배정

| 요일 | 콘텐츠 1 | 콘텐츠 2 |
|------|----------|----------|
| 월 | AI 활용 | Growth Insights |
| 화 | Self-Development | AI 활용 |
| 수 | Leadership (홀수주) / Teams (짝수주) | Self-Development |
| 목 | Growth Insights | AI 활용 |
| 금 | AI 활용 | Leadership (홀수주) / Teams (짝수주) |

**홀수주/짝수주**: ISO 주차 기준 (1, 3, 5... = 홀수주 → Leadership)

---

## WebSearch 최적화 쿼리

### AI 활용
```
# 기본 쿼리 (택1)
"Claude Code" tutorial OR workflow OR tips 2025..2026
"MCP server" Claude setup guide
"AI automation" "non-developer" workflow
"prompt engineering" best practices 2025
"agentic coding" OR "vibe coding" examples

# 심화 쿼리
site:reddit.com/r/ClaudeAI best practices
site:simonwillison.net Claude OR AI
"Claude" skill OR agent workflow
```

### Self-Development
```
# 기본 쿼리
"personal knowledge management" system 2025
"second brain" method guide
"deep work" strategies leaders
"meta-learning" techniques
productivity system for managers

# 심화 쿼리
site:nesslabs.com learning OR productivity
site:fortelabs.com knowledge management
"continuous learning" leadership
```

### Growth Insights
```
# 기본 쿼리
"business strategy" 2026 trends
"scenario planning" framework
"systems thinking" leadership
"technology adoption" timing strategy
startup growth insights 2025

# 심화 쿼리
site:a16z.com insights OR trends
site:firstround.com strategy OR growth
"first principles" thinking business
```

### Leadership
```
# 기본 쿼리
"psychological safety" team building
"radical candor" feedback guide
"change management" framework 2025
manager transition best practices
"decision making" framework leaders

# 심화 쿼리
site:hbr.org leadership 2025
"vulnerability-based leadership"
"trust building" remote teams
```

### Teams
```
# 기본 쿼리
"async communication" best practices
"remote team" collaboration guide
"meeting hygiene" productivity
"team rituals" distributed teams
"cross-functional" collaboration framework

# 심화 쿼리
site:about.gitlab.com remote OR async
site:atlassian.com/blog teamwork
"hybrid work" team management
```

---

## 검색 전략

### 1단계: 기본 검색
- 해당 카테고리의 기본 쿼리 중 하나 선택
- 최신 콘텐츠 우선 (2025-2026)

### 2단계: 결과 평가
검색 결과에서 다음 기준으로 평가:
- **깊이**: 구체적인 방법론/사례가 있는가?
- **실용성**: 바로 적용 가능한 인사이트가 있는가?
- **신뢰성**: 출처가 믿을 만한가?
- **신선함**: 새로운 관점이 있는가?

### 3단계: 콘텐츠 부족 시
- 다른 쿼리로 재검색
- 심화 쿼리 사용
- 검색어 조합 변경

### 제외 기준
- 광고성/홍보성 콘텐츠
- 내용이 피상적인 글
- 3년 이상 된 오래된 글
- 특정 제품만 홍보하는 글

---

## 파일 저장

### 경로
```
digests/{category}/{YYYY-MM-DD}_{english-title}.md
```

### 카테고리 폴더
- AI 활용 → `ai-usage`
- Self-Development → `self-development`
- Growth Insights → `growth-insights`
- Leadership → `leadership`
- Teams → `teams`

### 파일명 규칙
- 날짜: YYYY-MM-DD
- 제목: 영문 소문자, 하이픈 연결, 핵심 3-5단어
- 예: `2026-02-05_claude-code-mcp-workflow-automation.md`

---

## 콘텐츠 템플릿

```markdown
# [제목 - 한국어]

## 메타 정보
- **출처**: [사이트명](URL)
- **저자**: 저자명
- **작성일**: YYYY-MM-DD (원문)
- **수집일**: YYYY-MM-DD
- **카테고리**: [카테고리명]

---

## 한 줄 요약
> 이 글의 핵심을 한 문장으로

---

## 핵심 내용 요약

### 문제 인식
저자가 제기하는 문제 또는 배경 설명

### 핵심 메시지
1. 첫 번째 핵심 메시지
2. 두 번째 핵심 메시지  
3. 세 번째 핵심 메시지

### 주요 개념/프레임워크
개념이나 프레임워크가 있는 경우 설명

---

## 상세 내용

원문의 주요 논지를 재구성하여 서술 (한국어)

---

## 활용 사례

### 원문 사례
원문에서 언급된 실제 사례

### 적용 아이디어
로랑의 맥락(운영 팀 리더, 나인투원, 공유 모빌리티)에 적용할 수 있는 아이디어:
- 적용 아이디어 1
- 적용 아이디어 2

---

## 실천 포인트

### 즉시 적용 (5분)
- 오늘 바로 할 수 있는 것

### 단기 적용 (이번 주)
- 이번 주 내 시도해볼 것

### 장기 고려
- 시스템/프로세스로 정착시킬 것

---

## 관련 키워드
`#키워드1` `#키워드2` `#키워드3`

---

## 원문 링크
[전체 원문 읽기](URL)
```

---

## 완료 후 작업

### Git 커밋
```bash
git add digests/
git commit -m "feat: daily insight - {카테고리} - {제목 요약}"
git push origin main
```

### 완료 보고 형식
```
✅ Daily Insight 수집 완료 (YYYY-MM-DD)

📁 저장된 파일:
1. digests/{category1}/{filename1}.md
2. digests/{category2}/{filename2}.md

📌 오늘의 인사이트:
- [카테고리1] 제목 - 한 줄 요약
- [카테고리2] 제목 - 한 줄 요약
```

---

## 주의사항

- 주말(토, 일)에는 실행하지 않음
- 검색 결과가 부족하면 다른 쿼리로 재시도
- 동일 URL 중복 수집 방지 (기존 파일 확인)
- 콘텐츠 내용은 반드시 한국어로 작성
- 파일명만 영어로 작성

---

## 버전
- v2.0 (2026-02-05): WebSearch 기반으로 전환, 쿼리 최적화 추가
