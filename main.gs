function doGet(e) {
  return ContentService.createTextOutput(UrlFetchApp.fetch("http://ip-api.com/json"));
}

function doPost(e) {
  let event      = JSON.parse(e.postData.contents).events[0];
  let replyToken = event.replyToken;
  if (typeof replyToken === 'undefined') {
    return;
  }
  const userId   = event.source.userId; // なぜか知らんが、'undefined'になる。（event.sourceまでは取れてる。）
  // writeLog('うつうつつつ1', 'fewfwqfewf', event.source); // 友達追加した人がグループで話すと、「user」から「room」になる？
  let username = getUserName(userId);

  if(event.type == 'message') {
    let userMessage = event.message.text;
    let replyMessages = getShutaMessages();
    sendMessage(replyToken, replyMessages);
    writeLog(userMessage, replyMessages, event);
    // writeLog(userMessage, replyMessages);
    return ContentService.createTextOutput(
      JSON.stringify({'content': 'ok'})
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

function sendMessage(replyToken, replyMessages) {
  const url = LINE_MESSAGE_REPLY_URL;
  let messages = replyMessages.map(function (v) {
    return {'type': 'text', 'text': v};
  });
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type' : 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method' : 'post',
    'payload': JSON.stringify({
      'replyToken': replyToken,
      'messages'  : messages,
    }),
  });
}

function getUserName(userId) {
  var url         = LINE_PROFILE_ENDPOINT + userId;
  var userProfile = UrlFetchApp.fetch(url,{
    'headers': {
      'Authorization' : 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
  })
  return JSON.parse(userProfile).displayName;
}

function getMultipleMessages() {

}

function getShutaMessages() {
  const sheetName = SHEET_NAME_1ST;
  let spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(sheetName);
  const COLUMN_INDEX_OF_KEY = 1;
  let last_row = 1; // 最終行のインデックス
  let selected_row; // 選択された行
  
  last_row     = Number(sheet.getRange(2, COLUMN_INDEX_OF_KEY + 5).getValue());
  selected_row = Math.floor(Math.random() * (last_row)) + 1;
  if (selected_row == 0 || selected_row == last_row) {
    selected_row = 1;
  }
  let messages = [sheet.getRange(selected_row, COLUMN_INDEX_OF_KEY).getValue()];
  return messages;
}

function writeLog(userMessage, replyMessages, event) {
  const spreadsheetId = SPREADSHEET_ID;
  const sheetName = SHEET_NAME_2ND;
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetName);
  const COLUMN_INDEX_OF_KEY = 1;
  let row = Number(sheet.getRange(2, COLUMN_INDEX_OF_KEY + 5).getValue());
  
  let date    = new Date();
  sheet.getRange(row, COLUMN_INDEX_OF_KEY).setValue(date);
  sheet.getRange(row, COLUMN_INDEX_OF_KEY + 1).setValue(String(userMessage));
  sheet.getRange(row, COLUMN_INDEX_OF_KEY + 2).setValue(String(replyMessages[0]));
  sheet.getRange(row, COLUMN_INDEX_OF_KEY + 3).setValue(String(event.type));
  
  sheet.getRange(2 , COLUMN_INDEX_OF_KEY + 5).setValue(row + 1);
}

//function writeLog(userMessage, replyMessages) {
//  const spreadsheetId = SPREADSHEET_ID;
//  const sheetName     = SHEET_NAME_2ND;
//  let   spreadsheet   = SpreadsheetApp.openById(spreadsheetId);
//  let   sheet         = spreadsheet.getSheetByName(sheetName);
//  const COLUMN_INDEX_OF_KEY = 1;
//  let   line          = "デフォルト";
//  let   row           = 1;
//  while (line != "") {
//    line = sheet.getRange(row, COLUMN_INDEX_OF_KEY).getValue();
//    row++;
//  }
//  let date    = new Date();
//  sheet.getRange(row - 1, COLUMN_INDEX_OF_KEY).setValue(date);
//  sheet.getRange(row - 1, COLUMN_INDEX_OF_KEY + 1).setValue(String(userMessage));
//  sheet.getRange(row - 1, COLUMN_INDEX_OF_KEY + 2).setValue(String(replyMessages[0]));
//}

