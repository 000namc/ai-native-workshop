// 시트 열 때 커스텀 메뉴 생성
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🤖 GPT 분류')
    .addItem('선택한 행 분류하기', 'classifySelectedRows')
    .addItem('전체 분류하기', 'classifyAllRows')
    .addSeparator()
    .addItem('API 키 설정', 'setApiKey')
    .addToUi();
}

// API 키 설정 함수
function setApiKey() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.prompt('OpenAI API 키를 입력하세요:', ui.ButtonSet.OK_CANCEL);

  if (response.getSelectedButton() == ui.Button.OK) {
    PropertiesService.getScriptProperties().setProperty('OPENAI_API_KEY', response.getResponseText().trim());
    ui.alert('API 키가 저장되었습니다!');
  }
}

// 퓨샷샘플 가져오기
function getFewShotSamples() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sampleSheet = ss.getSheetByName('퓨샷샘플');

  if (!sampleSheet) return '';

  const lastRow = sampleSheet.getLastRow();
  if (lastRow < 2) return '';

  const data = sampleSheet.getRange(2, 1, lastRow - 1, 5).getValues();
  const lines = [];

  for (const row of data) {
    const [withdrawal, deposit, description, midCategory, subCategory] = row;
    if (description && midCategory) {
      const type = withdrawal ? `출금 ${withdrawal}원` : `입금 ${deposit}원`;
      lines.push(`${type} | ${description} → ${midCategory}|${subCategory}`);
    }
  }

  return lines.join('\n');
}

// GPT API 배치 호출 함수
function callGPTBatch(fewShotText, items) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');

  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다. 메뉴에서 "API 키 설정"을 먼저 실행하세요.');
  }

  // 시스템 프롬프트 구성
  let systemPrompt = `당신은 회사 결제 내역을 분류하는 전문가입니다.

[출금 분류 체계] (중분류: 소분류 목록)
- 인건비: 직원급여, 임원급여, 4대보험, 원천세, 사업소득, 퇴직/상여금, 출장비, 지방세
- 식대: 중식, 간식, 초과근무
- 업무툴: 공용툴, 직무툴
- 업무위탁: 세무기장, 법무
- 사무실: KT, 정수기, 임차료, 보증금, 전기, 가스, 관리비
- 서비스수수료: 클리포
- 문화: 문화, 교육, 경조사
- 소모품: 소모품, 운반
- 기타: 보증보험 등, 특허 출원/관납, 부가세, 등록면허세, 재산세, 잡손실
- 유형자산: 유형자산
- 서버: 개발팀, AI팀, 클리포, 그 외 서비스
- 외주비: 외주비
- 미팅: 교통, 미팅, 경조사비(거래처)
- 기부금: 기부금
- 마케팅: 언론보도/온라인, 부대비용
- 용역: 용역
- 대출이자: IBK 대출, 중진공 대출
- 지원사업: IITP, KERIS, 지원사업
- 23년 마감: K-Cloud, NIA, 중견중소

[입금 분류 체계] (중분류: 소분류 목록)
- 매출: 서비스, 용역
- 이자수익: 이자수익
- 지원사업: IITP, KERIS, 과제3, 과제4
- 잡이익: 잡이익`;

  if (fewShotText) {
    systemPrompt += `

[분류 예시]
${fewShotText}`;
  }

  systemPrompt += `

[출력 형식] ⚠️ 반드시 지켜주세요
각 항목마다 "중분류|소분류" 형식으로 답하세요.

올바른 예시:
1. 식대|중식
2. 인건비|4대보험
3. 매출|서비스

잘못된 예시 (절대 하지 마세요):
1. 중식|맘스터치 ❌
2. 4대보험|국민연금 ❌

분류가 불가능하면: 기타|기타`;

  const itemList = items.map((item, idx) => {
    const type = item.withdrawal ? '[출금]' : '[입금]';
    const amount = item.withdrawal || item.deposit;
    return `${idx + 1}. ${item.transDate} | ${type} ${amount}원 | ${item.description}`;
  }).join('\n');

  const url = 'https://api.openai.com/v1/chat/completions';

  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `다음 통장 내역을 분류해주세요:\n\n${itemList}` }
    ],
    temperature: 0.1,
    max_tokens: 1000
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'Authorization': 'Bearer ' + apiKey
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch(url, options);
  const json = JSON.parse(response.getContentText());

  if (json.error) {
    throw new Error(json.error.message);
  }

  const usage = json.usage || {};
  const content = json.choices[0].message.content.trim();
  const lines = content.split('\n');

  const results = [];
  for (const line of lines) {
    const match = line.match(/(?:\d+\.\s*)?([^|]+)\|(.+)/);
    if (match) {
      results.push({
        middleCategory: match[1].trim(),
        subCategory: match[2].trim()
      });
    }
  }

  return {
    results: results,
    usage: {
      prompt: usage.prompt_tokens || 0,
      completion: usage.completion_tokens || 0,
      total: usage.total_tokens || 0
    }
  };
}

// 선택한 행만 분류
function classifySelectedRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('통장사용내역');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('"통장사용내역" 시트를 찾을 수 없습니다.');
    return;
  }

  const selection = ss.getActiveRange();
  const startRow = selection.getRow();
  const numRows = selection.getNumRows();

  processRows(sheet, startRow, numRows);
}

// 전체 행 분류 (2행부터)
function classifyAllRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('통장사용내역');

  if (!sheet) {
    SpreadsheetApp.getUi().alert('"통장사용내역" 시트를 찾을 수 없습니다.');
    return;
  }

  const lastRow = sheet.getLastRow();

  if (lastRow < 2) {
    SpreadsheetApp.getUi().alert('분류할 데이터가 없습니다.');
    return;
  }

  processRows(sheet, 2, lastRow - 1);
}

// 실제 분류 처리 (배치)
function processRows(sheet, startRow, numRows) {
  const ui = SpreadsheetApp.getUi();
  const BATCH_SIZE = 20;

  const fewShotText = getFewShotSamples();

  let successCount = 0;
  let errorCount = 0;
  let totalPromptTokens = 0;
  let totalCompletionTokens = 0;
  let totalTokens = 0;

  const itemsToProcess = [];

  for (let i = 0; i < numRows; i++) {
    const row = startRow + i;
    const transDate = sheet.getRange(row, 1).getValue();
    const withdrawal = sheet.getRange(row, 2).getValue();
    const deposit = sheet.getRange(row, 3).getValue();
    const description = sheet.getRange(row, 4).getValue();

    if (!description) continue;

    itemsToProcess.push({
      row: row,
      transDate: transDate,
      withdrawal: withdrawal,
      deposit: deposit,
      description: description
    });
  }

  if (itemsToProcess.length === 0) {
    ui.alert('분류할 항목이 없습니다.');
    return;
  }

  for (let i = 0; i < itemsToProcess.length; i += BATCH_SIZE) {
    const batch = itemsToProcess.slice(i, i + BATCH_SIZE);

    try {
      const response = callGPTBatch(fewShotText, batch);
      const results = response.results;

      totalPromptTokens += response.usage.prompt;
      totalCompletionTokens += response.usage.completion;
      totalTokens += response.usage.total;

      for (let j = 0; j < results.length && j < batch.length; j++) {
        const row = batch[j].row;
        sheet.getRange(row, 5).setValue(results[j].middleCategory);
        sheet.getRange(row, 6).setValue(results[j].subCategory);
        successCount++;
      }

      if (i + BATCH_SIZE < itemsToProcess.length) {
        Utilities.sleep(500);
      }

    } catch (error) {
      console.error(`배치 에러: ${error.message}`);
      errorCount += batch.length;
    }
  }

  const inputCost = (totalPromptTokens / 1000000) * 0.15;
  const outputCost = (totalCompletionTokens / 1000000) * 0.60;
  const totalCost = inputCost + outputCost;

  const fewShotMsg = fewShotText ? '✅' : '❌';

  ui.alert(`완료!

📊 분류 결과
ㆍ성공: ${successCount}건
ㆍ실패: ${errorCount}건

📁 참조 데이터
ㆍ퓨샷샘플: ${fewShotMsg}

💰 토큰 사용량
ㆍ입력: ${totalPromptTokens.toLocaleString()} 토큰
ㆍ출력: ${totalCompletionTokens.toLocaleString()} 토큰
ㆍ총합: ${totalTokens.toLocaleString()} 토큰

💵 예상 비용: $${totalCost.toFixed(4)} (약 ${Math.ceil(totalCost * 1400)}원)`);
}
