# Daily Insight 수집 스킬

## 개요
매일 관심 분야의 양질의 콘텐츠를 수집하여 마크다운 파일로 저장하는 스킬입니다.

## 실행 방법
```
/daily-insight
```

## 요일별 키워드 배정

| 요일 | 콘텐츠 1 | 콘텐츠 2 |
|------|----------|----------|
| 월요일 | AI 활용 | Growth Insights |
| 화요일 | Self-Development | AI 활용 |
| 수요일 | Leadership (홀수주) / Teams (짝수주) | Self-Development |
| 목요일 | Growth Insights | AI 활용 |
| 금요일 | AI 활용 | Leadership (홀수주) / Teams (짝수주) |

### 홀수주/짝수주 판단
- ISO 주차 기준 (1월 첫째 주 = 1주차)
- 홀수주: 1, 3, 5, 7... → Leadership
- 짝수주: 2, 4, 6, 8... → Teams

## 키워드별 검색 쿼리 및 소스

### AI 활용
**검색 키워드**:
- Claude Code, Claude agent, Claude skill, MCP, Model Context Protocol
- AI automation, AI workflow, prompt engineering
- no-code AI, AI for non-developers, AI productivity
- Cursor, Windsurf, agentic coding, vibe coding

**소스**:
| 소스 | URL 패턴 | 우선순위 |
|------|----------|----------|
| Reddit r/ClaudeAI | `https://www.reddit.com/r/ClaudeAI/top.json?t=week` | 1 |
| Reddit r/LocalLLaMA | `https://www.reddit.com/r/LocalLLaMA/top.json?t=week` | 2 |
| Hacker News | `https://hn.algolia.com/api/v1/search?query=Claude&tags=story` | 1 |
| Simon Willison | `https://simonwillison.net/atom/everything/` | 1 |

### Self-Development
**검색 키워드**:
- meta-learning, PKM, personal knowledge management, second brain
- deep work, energy management, continuous learning
- productivity system, habit building, self-awareness
- learning how to learn, personal OS

**소스**:
| 소스 | URL 패턴 | 우선순위 |
|------|----------|----------|
| Medium | `https://medium.com/feed/tag/self-improvement` | 1 |
| Substack Tiago Forte | `https://fortelabs.substack.com/feed` | 1 |
| Substack Sahil Bloom | `https://sahilbloom.substack.com/feed` | 2 |
| Ness Labs | `https://nesslabs.com/feed` | 2 |

### Growth Insights
**검색 키워드**:
- scenario planning, systems thinking, first principles
- prediction, adoption timing, technology trends
- business strategy, innovation, venture capital insights

**소스**:
| 소스 | URL 패턴 | 우선순위 |
|------|----------|----------|
| a16z | `https://a16z.com/feed/` | 1 |
| First Round Review | `https://review.firstround.com/feed.xml` | 1 |
| HBR | `https://hbr.org/feed` | 2 |
| MIT Sloan | `https://mitsloan.mit.edu/ideas-made-to-matter/feed` | 2 |

### Leadership
**검색 키워드**:
- psychological safety, radical candor, change management
- manager transition, trust building, feedback loop
- decision framework, vulnerability-based leadership
- succession planning, executive coaching

**소스**:
| 소스 | URL 패턴 | 우선순위 |
|------|----------|----------|
| HBR Leadership | `https://hbr.org/topic/leadership/feed` | 1 |
| First Round Review | `https://review.firstround.com/feed.xml` | 1 |
| MIT Sloan | `https://mitsloan.mit.edu/ideas-made-to-matter/feed` | 2 |
| CCL | `https://www.ccl.org/feed/` | 2 |

### Teams
**검색 키워드**:
- async communication, meeting hygiene, remote culture
- team topologies, cross-functional collaboration
- hybrid work, distributed teams, team rituals
- psychological safety, invisible agreements

**소스**:
| 소스 | URL 패턴 | 우선순위 |
|------|----------|----------|
| Atlassian Work Life | `https://www.atlassian.com/blog/feed` | 1 |
| GitLab Blog | `https://about.gitlab.com/atom.xml` | 1 |
| First Round Review | `https://review.firstround.com/feed.xml` | 2 |
| Doist Blog | `https://blog.doist.com/feed/` | 2 |

## 파일 저장 규칙

### 저장 경로
```
/personal/digests/{카테고리}/{YYYY-MM-DD}_{영문-제목}.md
```

### 카테고리 폴더명
- AI 활용 → `ai-usage`
- Self-Development → `self-development`
- Growth Insights → `growth-insights`
- Leadership → `leadership`
- Teams → `teams`

### 파일명 규칙
- 날짜: `YYYY-MM-DD` 형식
- 제목: 영문 소문자, 하이픈(-) 연결, 핵심 키워드 3~5개
- 예시: `2026-02-05_claude-code-mcp-workflow-automation.md`

## 콘텐츠 템플릿

```markdown
# [제목 - 한국어]

## 메타 정보
- **출처**: [사이트명](URL)
- **저자**: 저자명
- **작성일**: YYYY-MM-DD
- **수집일**: YYYY-MM-DD
- **카테고리**: [카테고리명]

---

## 한 줄 요약
> 이 글의 핵심을 한 문장으로

---

## 핵심 내용 요약

### 문제 인식
- 저자가 제기하는 문제 또는 배경

### 핵심 메시지
- 메시지 1
- 메시지 2
- 메시지 3

### 주요 개념/프레임워크
- 개념 설명 (있는 경우)

---

## 상세 내용

(원문의 주요 논지를 재구성하여 서술 - 한국어)

---

## 활용 사례

### 원문 사례
- 원문에서 언급된 실제 사례

### 적용 아이디어
- 로랑의 맥락(운영 팀 리더, 나인투원, 공유 모빌리티)에 적용할 수 있는 아이디어

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

## 콘텐츠 선정 기준

### 우선순위 (높음 → 낮음)
1. **실용성**: 바로 적용 가능한 인사이트가 있는가?
2. **깊이**: 피상적이지 않고 구체적인 내용인가?
3. **신선함**: 새로운 관점이나 접근법이 있는가?
4. **신뢰성**: 출처가 믿을 만한가? 사례가 있는가?

### 제외 기준
- 광고성 콘텐츠
- 내용이 너무 짧거나 피상적인 글
- 이미 수집한 콘텐츠와 중복되는 내용
- 특정 제품/서비스 홍보 목적의 글

## 실행 흐름

```
1. 오늘 요일 확인
2. 요일별 키워드 2개 확인 (홀수주/짝수주 판단 포함)
3. 각 키워드별 소스에서 최신 콘텐츠 검색
4. 선정 기준에 따라 각 키워드당 1개 콘텐츠 선택
5. 콘텐츠 상세 분석 및 템플릿에 맞춰 작성
6. 파일 저장 (/personal/digests/{카테고리}/)
7. 수집 완료 보고
```

## 주의사항

- 주말(토, 일)에는 실행하지 않음
- 네트워크 제한으로 접근 불가한 소스는 건너뛰고 대체 소스 사용
- 콘텐츠 품질이 기준에 미달하면 해당 키워드는 다음 날로 연기하고 사용자에게 알림
- 동일 콘텐츠 중복 수집 방지 (기존 파일 확인)

## 버전
- v1.0 (2026-02-05): 초기 생성
