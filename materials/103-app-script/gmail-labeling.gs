// 시트 열 때 커스텀 메뉴 생성 (Gmail 라벨링용 시트에서 관리)
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('📧 Gmail 분류')
    .addItem('미분류 메일 분류하기', 'classifyEmails')
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

// GPT API 호출
function callGPT(subject, body, from) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('OPENAI_API_KEY');

  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다. 메뉴에서 "API 키 설정"을 먼저 실행하세요.');
  }

  const payload = {
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `메일을 다음 카테고리 중 하나로 분류하세요.
카테고리: 고객문의, 마케팅, 내부공유, 일정, 기타

카테고리 이름만 답하세요.`
      },
      {
        role: 'user',
        content: `발신: ${from}\n제목: ${subject}\n본문: ${body.substring(0, 500)}`
      }
    ],
    temperature: 0.1,
    max_tokens: 20
  };

  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: { 'Authorization': 'Bearer ' + apiKey },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };

  const response = UrlFetchApp.fetch('https://api.openai.com/v1/chat/completions', options);
  const json = JSON.parse(response.getContentText());

  if (json.error) {
    throw new Error(json.error.message);
  }

  return json.choices[0].message.content.trim();
}

// 미분류 메일 분류
function classifyEmails() {
  const threads = GmailApp.search('newer_than:7d', 0, 10);
  let successCount = 0;

  for (const thread of threads) {
    try {
      const message = thread.getMessages()[0];
      const subject = message.getSubject();
      const body = message.getPlainBody();
      const from = message.getFrom();

      const category = callGPT(subject, body, from);

      // 라벨 가져오기 (없으면 생성)
      const label = GmailApp.getUserLabelByName(category)
        || GmailApp.createLabel(category);
      label.addToThread(thread);

      successCount++;
      Utilities.sleep(300);
    } catch (error) {
      console.error(`에러: ${error.message}`);
    }
  }

  SpreadsheetApp.getUi().alert(`완료! ${successCount}건의 메일을 분류했습니다.`);
}
