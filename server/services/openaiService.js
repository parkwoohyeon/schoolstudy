/**
 * OpenAI Service
 * OpenAI API를 사용하여 감성 분석을 수행하는 로직을 관리합니다.
 */

const { OpenAI } = require('openai');
require('dotenv').config();

// OpenAI 클라이언트 초기화
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * 텍스트 감성 분석 수행 함수
 * @param {string} text - 분석할 사용자 입력 문장
 * @returns {Promise<Object>} - 분석 결과 (sentiment, confidence, reason)
 */
async function analyzeSentiment(text) {
  try {
    if (!openai) {
      throw new Error('OpenAI API 키가 설정되지 않았습니다. 환경 변수를 확인해 주세요.');
    }
    const prompt = `
다음 문장의 감정을 분석해줘.

반드시 아래 JSON 형식으로만 답변해. 다른 설명은 생략해.

{
  "sentiment": "긍정/부정/중립",
  "confidence": 0에서 100 사이의 정수,
  "reason": "분석 이유"
}

문장:
"${text}"
    `.trim();

    // OpenAI Chat Completion 호출 (gpt-4o-mini 모델 사용)
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // 문서에는 4.1-mini로 되어있으나 현재 가능한 최신 mini 모델 사용
      messages: [
        { role: "system", content: "너는 문장의 감정을 정확하게 분석하는 전문가야. 결과는 항상 JSON 형식으로만 응답해." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }, // JSON 응답 강제
    });

    // 응답 내용 파싱
    const result = JSON.parse(response.choices[0].message.content);
    return result;

  } catch (error) {
    console.error('OpenAI API 호출 중 오류 발생:', error);
    throw new Error('AI 분석 중 오류가 발생했습니다.');
  }
}

module.exports = {
  analyzeSentiment
};
