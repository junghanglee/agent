# 08. 프론트엔드 디자인 레퍼런스

## 1. 받은 디자인 파일

사용자가 전달한 프론트엔드 디자인 ZIP을 아래 위치에 보관했습니다.

```text
projects/ai-linker-platform/design-reference/frontend-design.zip
projects/ai-linker-platform/design-reference/frontend-design/
```

## 2. 디자인 파일 성격

압축 해제 결과, 단순 이미지가 아니라 Next.js 기반 프론트엔드 코드 형태의 디자인 레퍼런스입니다.

주요 구조:

```text
app/
components/
hooks/
lib/
public/
styles/
package.json
pnpm-lock.yaml
```

주요 페이지:

```text
app/page.tsx
app/agents/page.tsx
app/agents/[id]/page.tsx
app/checkout/page.tsx
app/community/page.tsx
app/mypage/page.tsx
app/support/page.tsx
app/tokens/page.tsx
```

주요 컴포넌트:

```text
components/layout/header.tsx
components/layout/footer.tsx
components/landing/hero-section.tsx
components/landing/value-cards.tsx
components/landing/purpose-section.tsx
components/landing/featured-agents.tsx
components/landing/token-section.tsx
components/landing/community-preview.tsx
components/landing/skill-preview.tsx
components/ui/*
```

## 3. 기술 스택 관찰

디자인 레퍼런스는 다음 기반으로 보입니다.

```text
Next.js 16.2.6
React 19
TypeScript
Tailwind CSS 4
Radix UI
lucide-react
recharts
shadcn 스타일 UI 컴포넌트 구조
pnpm
```

## 4. 디자인 핵심 방향

프론트엔드 개발 시 아래 디자인 방향을 우선 반영합니다.

### 4.1 브랜드 톤

```text
Deep Navy
Violet
Electric Cyan
White card
Soft gradient
Rounded corners
Premium SaaS marketplace
```

### 4.2 컬러 토큰

`app/globals.css`에 정의된 주요 변수:

```css
--brand-navy
--brand-violet
--brand-cyan
--brand-cyan-soft
```

디자인 구현 시 이 브랜드 토큰을 유지합니다.

### 4.3 메인 히어로 특징

`components/landing/hero-section.tsx` 기준:

- 어두운 네이비 배경
- Canvas particle network animation
- Cyan/Violet radial glow
- 회전 키워드 텍스트
- 큰 한국어 헤드라인
- CTA 버튼 2개
- 신뢰 배지
- 하단 카테고리 탭 바

핵심 메시지:

```text
업무자동화/고객상담/데이터분석 등을 위한 AI Agent를 지금 바로 시작하세요.
목적에 맞는 Agent를 고르고, 설치코드 한 번으로 설치한 뒤, AI Linker 전용 토큰으로 바로 사용하세요.
```

## 5. 개발 반영 원칙

Gate 1 이후 실제 구현 시 아래 원칙을 따릅니다.

1. 디자인 레퍼런스를 단순 복붙하지 않고, AI Linker 서비스 구조에 맞게 정리합니다.
2. 사용자 웹서비스와 관리자 백오피스를 같은 디자인 시스템으로 통합합니다.
3. Tailwind 4 기반 디자인 토큰은 최대한 유지합니다.
4. 컴포넌트는 재사용 가능하게 분리합니다.
5. 첫 구현 범위는 Gate 1 기준으로 제한합니다.
6. 페이지별 기능은 이후 Gate에서 순차적으로 연결합니다.

## 6. Gate 1 반영 범위

Gate 1에서 우선 반영할 부분:

```text
- Next.js 프로젝트 구성
- Tailwind / 글로벌 디자인 토큰
- Header / Footer
- Landing hero section
- Value cards
- Purpose section
- Featured Agent cards
- Token section preview
- Community preview
- 관리자 기본 레이아웃은 별도 관리자 디자인 파일 수령 후 통합
```

## 7. 보류 사항

현재 전달받은 파일은 프론트엔드 사용자 디자인입니다. 관리자 대시보드 디자인은 아직 별도 수령 필요합니다.

관리자 디자인 수령 전에도 Gate 1의 사용자 웹 프레임은 시작할 수 있지만, 관리자 대시보드는 임시 레이아웃만 만들거나 대기하는 것이 안전합니다.
