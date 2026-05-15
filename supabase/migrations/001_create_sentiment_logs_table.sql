-- 001_create_sentiment_logs_table.sql
-- 감성 분석 결과를 저장하기 위한 테이블을 생성합니다.

-- 기존에 테이블이 존재한다면 삭제 (초기화용)
DROP TABLE IF EXISTS sentiment_logs;

-- sentiment_logs 테이블 생성
CREATE TABLE sentiment_logs (
  -- 각 로그의 고유 식별자 (자동 생성되는 UUID)
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- 사용자가 입력한 텍스트 (민감 정보 보호를 위해 백엔드에서 암호화하여 저장할 수 있도록 text 타입 사용)
  input_text TEXT NOT NULL,
  
  -- 분석된 감정 결과 (긍정, 부정, 중립 등)
  sentiment VARCHAR(20) NOT NULL,
  
  -- 분석 결과의 신뢰도 (0 ~ 100 사이의 정수)
  confidence INTEGER NOT NULL,
  
  -- AI가 해당 감정으로 분석한 구체적인 이유
  reason TEXT NOT NULL,
  
  -- 데이터 생성 일시 (기본값: 현재 시간)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 추가 (조회 성능 향상을 위해)
CREATE INDEX idx_sentiment ON sentiment_logs(sentiment);
CREATE INDEX idx_created_at ON sentiment_logs(created_at);

-- 주석 추가 (데이터베이스 관리 용이성)
COMMENT ON TABLE sentiment_logs IS 'AI 감성 분석 결과 로그 테이블';
COMMENT ON COLUMN sentiment_logs.input_text IS '사용자 입력 문장 (암호화 권장)';
COMMENT ON COLUMN sentiment_logs.sentiment IS '분석된 감정 (긍정/부정/중립)';
COMMENT ON COLUMN sentiment_logs.confidence IS '분석 신뢰도 점수';
