/**
 * Analysis Route
 * 사용자의 텍스트를 받아 분석하고 결과를 DB에 저장합니다.
 */

const express = require('express');
const router = express.Router();
const { analyzeSentiment } = require('../services/openaiService');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config();

// Supabase 초기화
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// 암호화 설정 (보안 규칙 준수)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_32_chars_long!!';
const ALGORITHM = 'aes-256-cbc';

/**
 * 데이터 암호화 함수
 * @param {string} text - 암호화할 원문
 */
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

/**
 * 데이터 복호화 함수 (추가됨)
 * @param {string} text - 복호화할 암호문 (iv:encrypted 형식)
 */
function decrypt(text) {
  try {
    const [ivHex, encryptedHex] = text.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('복호화 오류:', error);
    return '암호화된 텍스트를 읽을 수 없습니다.';
  }
}

// GET /api/analyze - 히스토리 목록 조회 (추가됨)
router.get('/', async (req, res) => {
  try {
    // 1. Supabase에서 최신순으로 10개 가져오기
    const { data, error } = await supabase
      .from('sentiment_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Supabase 조회 오류:', error);
      throw error;
    }

    // 2. 각 데이터의 input_text를 복호화해서 전달
    const decryptedData = data.map(item => ({
      ...item,
      input_text: decrypt(item.input_text)
    }));

    res.json({
      success: true,
      data: decryptedData
    });

  } catch (error) {
    console.error('히스토리 조회 오류:', error);
    res.status(500).json({
      success: false,
      message: '히스토리를 불러오는 중 오류가 발생했습니다.'
    });
  }
});

// POST /api/analyze
router.post('/', async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, message: '분석할 텍스트를 입력해 주세요.' });
    }

    // 1. OpenAI를 통한 감성 분석 수행
    const analysis = await analyzeSentiment(text);

    // 신뢰도(confidence) 값이 소수점(0~1)으로 올 경우 정수(0~100)로 변환
    if (analysis.confidence <= 1) {
      analysis.confidence = Math.round(analysis.confidence * 100);
    } else {
      analysis.confidence = Math.round(analysis.confidence);
    }

    // 2. 민감 정보 암호화 (사용자 입력 텍스트)
    const encryptedText = encrypt(text);

    // 3. Supabase에 결과 저장
    const { error: dbError } = await supabase
      .from('sentiment_logs')
      .insert([
        {
          input_text: encryptedText,
          sentiment: analysis.sentiment,
          confidence: analysis.confidence,
          reason: analysis.reason
        }
      ]);

    if (dbError) {
      console.error('DB 저장 오류:', dbError);
    }

    // 4. 결과 반환
    res.json({
      success: true,
      data: analysis
    });

  } catch (error) {
    console.error('분석 라우트 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'
    });
  }
});

module.exports = router;
