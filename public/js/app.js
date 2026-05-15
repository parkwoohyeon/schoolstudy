/**
 * AI Sentiment Analyzer - Frontend Logic
 * 사용자 입력 처리, 백엔드 API 연동, 히스토리 관리를 담당합니다.
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- 엘리먼트 참조 ---
    const userInput = document.getElementById('userInput');
    const currentCharCount = document.getElementById('currentChar');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const loadingOverlay = document.getElementById('loadingOverlay');
    const resultModal = document.getElementById('resultModal');
    const closeModal = document.getElementById('closeModal');
    
    // 결과 표시 엘리먼트
    const sentimentResult = document.getElementById('sentimentResult');
    const confidenceValue = document.getElementById('confidenceValue');
    const confidenceBar = document.getElementById('confidenceBar');
    const analysisReason = document.getElementById('analysisReason');

    // 히스토리 엘리먼트 (추가됨)
    const historyList = document.getElementById('historyList');
    const refreshHistoryBtn = document.getElementById('refreshHistory');

    // --- 초기화 ---
    fetchHistory(); // 페이지 로드 시 히스토리 불러오기

    /**
     * 1. 글자수 체크 기능
     * 사용자가 입력할 때마다 현재 글자수를 업데이트합니다.
     */
    userInput.addEventListener('input', () => {
        const length = userInput.value.length;
        currentCharCount.textContent = length;

        // 1000자 제한 시 빨간색으로 경고
        if (length >= 1000) {
            currentCharCount.style.color = '#ff3b30'; // Apple Red
        } else {
            currentCharCount.style.color = '#86868b';
        }
    });

    /**
     * 2. 분석 버튼 클릭 핸들러
     * 백엔드 API에 분석을 요청하고 결과를 화면에 표시합니다.
     */
    analyzeBtn.addEventListener('click', async () => {
        const text = userInput.value.trim();

        // 빈 입력값 체크
        if (!text) {
            alert('분석할 문장을 입력해 주세요.');
            return;
        }

        // 로딩 화면 표시
        showLoading(true);

        try {
            // 백엔드 API 호출 (POST /api/analyze)
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text }),
            });

            const result = await response.json();

            if (result.success) {
                // 분석 성공 시 결과 모달 표시
                showResult(result.data);
                // 히스토리 목록 갱신 (추가됨)
                fetchHistory();
            } else {
                alert(result.message || '분석에 실패했습니다.');
            }

        } catch (error) {
            console.error('API 호출 중 오류 발생:', error);
            alert('서버와 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
        } finally {
            showLoading(false);
        }
    });

    /**
     * 3. 히스토리 새로고침 버튼
     */
    refreshHistoryBtn.addEventListener('click', fetchHistory);

    /**
     * 4. 모달 닫기 버튼
     */
    closeModal.addEventListener('click', () => {
        resultModal.classList.add('hidden');
    });

    // --- 유틸리티 함수들 ---

    /**
     * 분석 히스토리를 서버에서 가져와 렌더링합니다. (추가됨)
     */
    async function fetchHistory() {
        try {
            const response = await fetch('/api/analyze');
            const result = await response.json();

            if (result.success) {
                renderHistory(result.data);
            }
        } catch (error) {
            console.error('히스토리 로드 실패:', error);
        }
    }

    /**
     * 히스토리 데이터를 기반으로 HTML 목록을 생성합니다. (추가됨)
     */
    function renderHistory(logs) {
        if (!logs || logs.length === 0) {
            historyList.innerHTML = '<p class="empty-msg">아직 분석 기록이 없습니다.</p>';
            return;
        }

        historyList.innerHTML = ''; // 기존 목록 비우기

        logs.forEach(log => {
            const item = document.createElement('div');
            item.className = 'history-item';
            
            // 날짜 포맷팅 (YYYY.MM.DD HH:mm)
            const date = new Date(log.created_at).toLocaleString('ko-KR', {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });

            item.innerHTML = `
                <div class="history-content">
                    <div class="history-text">${log.input_text}</div>
                    <div class="history-date">${date}</div>
                </div>
                <div class="history-badge" style="${getBadgeStyle(log.sentiment)}">
                    ${log.sentiment}
                </div>
            `;

            // 히스토리 클릭 시 해당 결과 모달로 다시 보여주기
            item.addEventListener('click', () => {
                showResult({
                    sentiment: log.sentiment,
                    confidence: log.confidence,
                    reason: log.reason
                });
            });

            historyList.appendChild(item);
        });
    }

    /**
     * 감정에 따른 배지 스타일 문자열 반환 (추가됨)
     */
    function getBadgeStyle(sentiment) {
        if (sentiment === '긍정') return 'background-color: #34c759; color: white;';
        if (sentiment === '부정') return 'background-color: #ff3b30; color: white;';
        return 'background-color: #f5f5f7; color: #1d1d1f;';
    }

    /**
     * 로딩 오버레이 표시/숨김
     */
    function showLoading(isLoading) {
        if (isLoading) {
            loadingOverlay.classList.remove('hidden');
            analyzeBtn.disabled = true;
            analyzeBtn.style.opacity = '0.5';
        } else {
            loadingOverlay.classList.add('hidden');
            analyzeBtn.disabled = false;
            analyzeBtn.style.opacity = '1';
        }
    }

    /**
     * 분석 결과를 모달에 채우고 표시
     */
    function showResult(data) {
        sentimentResult.textContent = data.sentiment;
        confidenceValue.textContent = data.confidence;
        
        confidenceBar.style.width = '0%';
        setTimeout(() => {
            confidenceBar.style.width = `${data.confidence}%`;
        }, 100);

        analysisReason.textContent = data.reason;
        updateBadgeStyle(data.sentiment);
        resultModal.classList.remove('hidden');
    }

    /**
     * 감정에 따라 배지의 색상을 변경 (기존 로직 유지)
     */
    function updateBadgeStyle(sentiment) {
        if (sentiment === '긍정') {
            sentimentResult.style.backgroundColor = '#34c759';
            sentimentResult.style.color = 'white';
        } else if (sentiment === '부정') {
            sentimentResult.style.backgroundColor = '#ff3b30';
            sentimentResult.style.color = 'white';
        } else {
            sentimentResult.style.backgroundColor = '#f5f5f7';
            sentimentResult.style.color = '#1d1d1f';
        }
    }
});
