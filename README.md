# FITCAR 아반떼 장기렌트 · 경량 배포용 소스

React 19 + TypeScript + Vite 8 기반의 반응형 장기렌트 랜딩페이지입니다.
Vercel과 Cloudflare Pages에서 **정적 사이트(Static Site)**로 배포할 수 있도록 정리했습니다.
기존 Sites/Cloudflare Worker 전용 템플릿과 미사용 UI·DB 예제를 포함하지 않습니다.

## 1. 로컬 실행

Node.js 20.19 이상과 pnpm을 준비합니다.

```bash
pnpm install
pnpm dev
```

화면이 정상적으로 보이면 아래 명령으로 배포 파일을 빌드할 수 있습니다.

```bash
pnpm test
pnpm build
pnpm preview
```

배포 결과물은 `dist/` 폴더입니다. 소스코드는 `src/`, 차량 이미지는 `public/`에 있습니다.

## 2. 배포

| 서비스 | 설정 |
| --- | --- |
| Vercel | Framework Preset: Vite, Build Command: `pnpm build`, Output Directory: `dist` |
| Cloudflare Pages | Framework Preset: Vite, Build Command: `pnpm build`, Build Output Directory: `dist` |

정식 도메인이 생기기 전에는 기준 주소가 `https://rental-car-hyendai-avante.vercel.app` 입니다. canonical, Open Graph, JSON-LD, sitemap이 이 주소를 사용합니다. 정식 도메인이 확정되면 환경 변수만 바꾸면 됩니다.

```env
SITE_URL=https://www.your-domain.com
ENABLE_INDEXING=true
```

- `SITE_URL`이 없으면 위의 임시 도메인을 사용하고, 기본값은 검색 색인 허용입니다.
- `ENABLE_INDEXING=false`이면 canonical은 유지한 채 `noindex`로 바꿉니다.
- Vercel 미리보기 배포(`VERCEL_ENV=preview`)는 배포별 주소가 색인되지 않도록 `noindex`이며, canonical은 기준 주소를 가리킵니다.
- 색인 허용 시에만 `sitemap.xml`을 만들고, `robots.txt`는 크롤링을 허용한 뒤 sitemap을 안내합니다.
- Open Graph, Twitter Card, JSON-LD Organization / WebSite / WebPage / Service / FAQPage와 1200×630 WebP 이미지를 포함합니다.
- Facebook·카카오톡 등은 Open Graph를 사용합니다. 공식 SNS 계정이 없어 확인되지 않은 계정 링크는 기입하지 않았습니다.

### 검색엔진을 위한 HTML 사전 렌더링

`pnpm build`는 Vite로 번들을 생성한 뒤 `scripts/prerender.tsx`에서 전체 랜딩페이지를 HTML에 사전 렌더링합니다.
따라서 JavaScript가 실행되기 전에도 검색엔진이 페이지 제목, 설명, 본문과 섹션 구조를 읽을 수 있습니다.
브라우저에서는 React hydration으로 버튼, 컬러 선택, 견적 계산과 FAQ가 활성화됩니다.

## 3. 보존된 기능

- 히어로, 주요 기능, 컬러+견적, 장기렌트 장점, FAQ, 최종 CTA, 푸터
- 반응형 PC·모바일 디자인, Lenis 부드러운 스크롤, 이미지 및 진입 애니메이션
- 3개 트림과 7개 컬러, 계약기간 36/48/60개월, 연간 주행거리 1만/1.5만/2만/3만/무제한
- 선납금·보증금 0/10/20/30%, 예상 월 렌트료 계산 및 100원 단위 반올림
- 상담 팝업 고객명·연락처·내용·개인정보 수집 이용 동의 유효성 검사
- 아코디언 FAQ, 접근성 레이블, 차량 공식 이미지 출처 표기

## 4. 중요: 운영 전 확인 사항

1. **월 렌트료는 렌터사 확정가가 아니라 기존 화면의 시뮬레이션 계산식**입니다. 보험·정비·심사·프로모션·시장요율 API 연동 후 검증이 필요합니다.
2. **상담 신청은 아직 API와 연결되지 않았습니다.** 입력값을 서버에 저장·전송하지 않고 화면에서 확인 메시지만 표시합니다. 실제 운영 전 개인정보 처리방침, 보유기간, 백엔드 접수 시스템을 연결해야 합니다.
3. 회사 정보는 기존 랜딩페이지에 기재된 내용을 유지했습니다. 실제 사업자 정보 및 법적 고지 검토가 필요합니다.
4. 현 배포 ZIP에 `node_modules/`, `dist/`, `.git/`, 플랫폼 전용 `.openai/`, DB 예제 또는 디자인 리뷰 도구는 포함하지 않습니다.

## 5. 구조

```text
avante-rental-deploy/
├── index.html               # 기본 메타 및 앱 진입점
├── src/
│   ├── Home.tsx             # 전체 랜딩·팝업·FAQ·인터랙션
│   ├── rental-data.ts       # 트림·색상·견적 계산
│   ├── styles.css           # 반응형 디자인
│   └── main.tsx             # React hydration
├── public/                 # 실제 사용하는 WebP·OG·파비콘만
├── scripts/
│   ├── prerender.tsx        # HTML·SEO·robots·sitemap 생성
│   └── test-rental.ts       # 예상 견적 회귀 테스트
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── postcss.config.mjs
└── vite.config.ts
```

## 6. 향후 관리자 페이지 연동

차량/트림/컬러 데이터와 견적 계산을 `src/rental-data.ts`로 분리했습니다.
향후 API가 준비되면 이 파일의 정적 데이터를 API 응답으로 교체하거나 별도 서비스 계층을 만들 수 있습니다.
현재 배포본에 관리 권한이나 데이터베이스를 임의로 추가하지 않았습니다.
