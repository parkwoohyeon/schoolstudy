# OpenAI Integration

## 목표
OpenAI API를 사용하여 감성 분석 수행.

---

## 사용 모델
gpt-4.1-mini

---

## Prompt 예시

```txt
다음 문장의 감정을 분석해줘.

반드시 아래 JSON 형식으로만 답변해.

{
  "sentiment": "긍정/부정/중립",
  "confidence": 숫자,
  "reason": "분석 이유"
}

문장:
"{사용자 입력값}"
```

---

## 응답 예시

```json
{
  "sentiment": "긍정",
  "confidence": 92,
  "reason": "긍정적인 표현이 많습니다."
}
```
