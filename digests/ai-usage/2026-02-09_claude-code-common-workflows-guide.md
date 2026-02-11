# Claude Code 실전 워크플로우 가이드

## 메타 정보
- **출처**: [Claude Code Docs](https://code.claude.com/docs/en/common-workflows)
- **저자**: Anthropic
- **작성일**: 2026-01 (지속 업데이트)
- **수집일**: 2026-02-09
- **카테고리**: AI 활용

---

## 한 줄 요약
> Claude Code를 활용한 일상 개발 작업의 실전 워크플로우와 프롬프트 예시를 정리한 공식 가이드

---

## 핵심 내용 요약

### 문제 인식
개발자들이 Claude Code를 사용할 때 어떤 프롬프트를 써야 할지, 어떤 순서로 작업해야 할지 막막해하는 경우가 많음. 공식 문서에서 실전 워크플로우를 단계별로 제시.

### 핵심 메시지
1. **피드백 루프가 핵심**: Claude에게 작업을 검증할 방법(테스트, bash 명령, 시뮬레이터)을 제공하는 것이 가장 중요
2. **병렬 세션 활용**: Git worktree를 활용해 여러 작업을 동시에 진행 가능
3. **Plan Mode로 안전한 분석**: 코드 변경 없이 분석만 하고 싶을 때 Plan Mode 활용

### 주요 개념/프레임워크

#### 1. 코드베이스 탐색 워크플로우
```
1. "give me an overview of this codebase"
2. "explain the main architecture patterns used here"
3. "what are the key data models?"
4. "how is authentication handled?"
```

#### 2. 버그 수정 워크플로우
```
1. "I'm seeing an error when I run npm test"
2. "suggest a few ways to fix the @ts-ignore in user.ts"
3. "update user.ts to add the null check you suggested"
```

#### 3. 리팩토링 워크플로우
```
1. "find deprecated API usage in our codebase"
2. "suggest how to refactor utils.js to use modern JavaScript features"
3. "refactor utils.js to use ES2024 features while maintaining the same behavior"
4. "run tests for the refactored code"
```

#### 4. 테스트 작성 워크플로우
```
1. "find functions in NotificationsService.swift that are not covered by tests"
2. "add tests for the notification service"
3. "add test cases for edge conditions in the notification service"
4. "run the new tests and fix any failures"
```

---

## 상세 내용

### Plan Mode 활용법
Plan Mode는 읽기 전용 작업으로 코드를 분석하고 계획을 세울 때 유용. `Shift+Tab`으로 모드 전환하거나 `--permission-mode plan` 플래그로 시작.

복잡한 리팩토링 계획 예시:
```bash
claude --permission-mode plan
> I need to refactor our authentication system to use OAuth2. Create a detailed migration plan.
```

### Git Worktree로 병렬 작업
```bash
# 새 worktree 생성
git worktree add ../project-feature-a -b feature-a

# 각 worktree에서 Claude 실행
cd ../project-feature-a && claude
```

### 세션 관리
- `/rename auth-refactor` - 세션 이름 지정
- `claude --continue` - 최근 대화 계속
- `claude --resume session-name` - 특정 세션 재개

### Extended Thinking (사고 모드)
복잡한 문제에 대해 Claude가 단계별로 추론하도록 함. `Ctrl+O`로 verbose mode 켜서 사고 과정 확인 가능.

---

## 활용 사례

### 원문 사례
- Boris Cherny(Claude Code 창시자): 로컬 터미널에서 5개, 웹에서 5-10개 세션을 병렬로 실행
- 각 세션은 별도의 git checkout 사용 (브랜치나 worktree 대신)

### 적용 아이디어
- **운영 자동화**: 반복적인 코드 리뷰나 테스트 작성 작업을 Claude에게 위임
- **온보딩 가속화**: 새 팀원이 코드베이스를 파악할 때 Claude와 함께 탐색
- **멀티태스킹**: worktree로 버그 수정하면서 동시에 새 기능 개발

---

## 실천 포인트

### 즉시 적용 (5분)
- `claude --permission-mode plan`으로 현재 프로젝트 구조 분석해보기
- `/rename`으로 현재 세션에 의미 있는 이름 붙이기

### 단기 적용 (이번 주)
- Git worktree 설정하고 병렬 Claude 세션 실험
- 자주 쓰는 프롬프트를 `.claude/commands/`에 커스텀 명령어로 저장

### 장기 고려
- 팀 전체의 Claude Code 워크플로우 표준화
- CI/CD 파이프라인에 Claude 린트 통합

---

## 관련 키워드
`#ClaudeCode` `#워크플로우` `#개발생산성` `#GitWorktree` `#PlanMode`

---

## 원문 링크
[전체 원문 읽기](https://code.claude.com/docs/en/common-workflows)
