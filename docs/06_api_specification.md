# API Specification

## POST /api/analyze

### 설명
텍스트 감성 분석 수행.

---

## Request

```json
{
  "text": "오늘 정말 행복했어"
}
```

---

## Response

```json
{
  "success": true,
  "data": {
    "sentiment": "긍정",
    "confidence": 94,
    "reason": "긍정적인 표현이 포함되어 있습니다."
  }
}
```
