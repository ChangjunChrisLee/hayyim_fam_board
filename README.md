# 🌟 하임이네 목표 달성 보드

귀엽고 따뜻한 가족 목표 달성 앱입니다. Next.js + TypeScript + Tailwind CSS로 제작되었으며, Google Sheets를 데이터베이스로 사용합니다.

---

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. Google Sheets 설정 (처음 한 번만)

**Step 1: Google Cloud 프로젝트 만들기**
1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. 새 프로젝트 생성
3. `APIs & Services` → `Library` → "Google Sheets API" 검색 → 활성화

**Step 2: 서비스 계정 만들기**
1. `APIs & Services` → `Credentials` → `Create Credentials` → `Service Account`
2. 이름 입력 후 생성
3. 서비스 계정 클릭 → `Keys` 탭 → `Add Key` → `Create New Key` → JSON 선택
4. JSON 파일 다운로드 (안전한 곳에 보관!)

**Step 3: Google Sheets 스프레드시트 만들기**
1. [Google Sheets](https://sheets.google.com)에서 새 스프레드시트 생성
2. 탭 이름을 다음 4개로 만들기: `goals`, `completions`, `rewards`
   - 시트 하단의 `+` 버튼으로 추가
3. 스프레드시트를 서비스 계정 이메일과 **공유** (편집자 권한)
   - 서비스 계정 이메일: JSON 파일의 `client_email` 값
4. URL에서 스프레드시트 ID 복사
   - `https://docs.google.com/spreadsheets/d/[이게 ID입니다]/edit`

**Step 4: 환경변수 설정**

`.env.local` 파일을 만들고:

```env
GOOGLE_SHEETS_SPREADSHEET_ID=복사한_스프레드시트_ID
GOOGLE_SERVICE_ACCOUNT_EMAIL=서비스계정@프로젝트.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----\n...\n-----END RSA PRIVATE KEY-----\n"
```

> ⚠️ `GOOGLE_PRIVATE_KEY`는 JSON 파일의 `private_key` 값을 그대로 붙여넣으세요. 줄바꿈(`\n`)이 그대로 들어가야 합니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

→ http://localhost:3000 에서 확인!

> 💡 Google Sheets 설정 없이도 앱이 실행됩니다. 이 경우 데이터는 브라우저 localStorage에 저장됩니다.

---

## 📦 Vercel 배포

### 방법 1: Vercel CLI

```bash
npm install -g vercel
vercel
```

### 방법 2: GitHub 연동 (권장)

1. GitHub에 코드 push
2. [Vercel](https://vercel.com) 접속 → `New Project` → GitHub 저장소 선택
3. `Environment Variables`에 위 3개 환경변수 추가
4. `Deploy` 클릭!

---

## 🗂️ 프로젝트 구조

```
src/
├── app/
│   ├── api/
│   │   ├── goals/route.ts        # 목표 CRUD API
│   │   ├── completions/route.ts  # 완료 CRUD API
│   │   └── rewards/route.ts      # 보상 CRUD API
│   ├── layout.tsx
│   ├── page.tsx                  # 메인 대시보드
│   └── globals.css
├── components/
│   ├── MemberCard.tsx            # 가족 구성원 카드
│   ├── GoalModal.tsx             # 목표 추가 모달
│   ├── RewardModal.tsx           # 보상 설정 모달
│   └── CelebrationEffect.tsx    # 축하 효과
├── hooks/
│   └── useAppData.ts             # 메인 데이터 훅 (API ↔ localStorage)
├── lib/
│   ├── constants.ts              # 가족 구성원 데이터, 헬퍼 함수
│   └── storage/
│       ├── types.ts              # IStorage 인터페이스
│       ├── googleSheets.ts       # Google Sheets 구현체
│       └── index.ts              # 스토리지 팩토리
└── types/
    └── index.ts                  # TypeScript 타입 정의
```

---

## 🔮 향후 계획

- [ ] 💌 마음카드 — 가족에게 감사/사랑 메시지 보내기
- [ ] ⭐ 칭찬스티커 — 가족 구성원에게 스티커 붙여주기
- [ ] 🎯 가족 미션 — 가족 전체가 함께하는 미션
- [ ] 📊 월별 통계 차트
- [ ] 🔔 목표 알림 (PWA push)
- [ ] 🖼️ 프로필 사진 업로드
