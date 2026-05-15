/**
 * Main Server File
 * Express 서버를 실행하고 미들웨어 및 라우트를 설정합니다.
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const analyzeRouter = require('./routes/analyze');

const app = express();
const PORT = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors()); // 교차 출처 리소스 공유 허용
app.use(express.json()); // JSON 본문 파싱 허용

// 정적 파일 서비스 (Vercel에서는 vercel.json에서 처리하지만, 로컬 호환성을 위해 유지)
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath)); 

// 라우트 설정
app.use('/api/analyze', analyzeRouter);

// 서버 실행 (Vercel 환경이 아닐 때만 실행)
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`========================================`);
    console.log(`  AI Sentiment Analyzer Server Started!`);
    console.log(`  Local: http://localhost:${PORT}`);
    console.log(`========================================`);
  });
}

// Vercel 배포를 위해 app 객체 내보내기
module.exports = app;
