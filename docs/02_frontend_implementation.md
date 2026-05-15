# Frontend Implementation

## 목표
사용자 입력 UI와 감성 분석 결과 모달 구현.

---

## 파일 구조

```txt
/public
 ├── index.html
 ├── style.css
 ├── app.js
 └── assets
```

---

## 주요 기능

### 1. Textarea 입력
- 최대 1000자 제한
- placeholder 제공

### 2. 감성 분석 버튼
- 클릭 시 fetch 요청

### 3. Loading UI
- API 응답 전까지 표시

### 4. 결과 모달
표시 항목:
- 감성 결과
- 신뢰도
- 분석 이유
