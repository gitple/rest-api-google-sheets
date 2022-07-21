## Google apps script
-  방명록에 시간 업데이트 예제
- 깃플 홈페이지 방명록에 연동 완료

### 1. 문서에서 스크립트 편집기 열기
- 문서에서 스크립트 편집기 열기
<img width="982" alt="스크린샷 2022-07-21 오전 11 08 50" src="https://user-images.githubusercontent.com/995533/180114455-20de92b9-605e-4fe9-8ebd-7dfd5f1ec90b.png">

- 스크립트 편집 화면
<img width="1059" alt="스크린샷 2021-01-26 오전 10 54 29" src="https://user-images.githubusercontent.com/995776/105800840-0c134c80-5fdb-11eb-9759-d62dce2e8b8a.png">

### 2. 스크립트 작성
- 스크립트 작성 후 저장
<img width="1272" alt="스크린샷 2021-01-26 오후 1 34 10" src="https://user-images.githubusercontent.com/995776/105801115-c440f500-5fdb-11eb-8649-97d6b7ec7eb4.png">

- 방명록 스크립트

```javascript
// 작성 시각을 지정된 column에 업데이트
function updateTime(sheet, row) {
  var targetRange = sheet.getRange(row, 6);
  var now = new Date();
  var currentValue = targetRange.getValue();

  // 첫번째 row일 경우는 업데이트 하지 않음.
  if (row != 1) {
    // 이전에 입력된 시간값이 없을 경우에만 시간을 업데이트
    if (!currentValue) {
      targetRange.setValue(now);
      Logger.log("방명록 시간이 업데이트 되었습니다.");
    }
  }
}

// 방명록 수정시에 simple trigger에서 호출하는 함수
function onEditGuestBook(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet(); 
  var sheet = ss.getActiveSheet();
  var row = ss.getActiveCell().getRow();

  if (sheet && row) {
    Logger.log("[onEditGuestBook] 수정된 row:" + row);
    updateTime(sheet, row);
  } else {
    Logger.log("sheet 또는 row가 없습니다." + "event:" + JSON.stringify(e));
  }
}

```

### 3. 트리거에 작성 함수 연결
- 왼쪽 메뉴에서 트리거 선택후 트리거 추가 
<img width="1219" alt="스크린샷 2021-01-26 오전 11 33 39" src="https://user-images.githubusercontent.com/995776/105801275-2568c880-5fdc-11eb-8ca0-6219da3e7ed0.png">

- 트리거 편집 화면에서 `실행할 함수 선택: 작성한 함수`, `이벤트 유형 선택: 변경시` 편집 후 저장
<img width="1218" alt="스크린샷 2021-01-26 오전 11 34 13" src="https://user-images.githubusercontent.com/995776/105801382-5d700b80-5fdc-11eb-9233-185c6756ede6.png">


### 4.실행 로그 보기
- 왼쪽 메뉴에서 이후 실행한 로그를 확인
<img width="1272" alt="스크린샷 2021-01-26 오후 1 31 25" src="https://user-images.githubusercontent.com/995776/105801402-6660dd00-5fdc-11eb-81a4-9d349a2a464c.png">

### 참고 링크
- Google spreadsheet 를 위한 apps-script APIs
    * https://developers.google.com/apps-script/reference/spreadsheet

- Trigger event 참고
    * https://developers.google.com/apps-script/guides/triggers/events

- Google apps script date api
    * https://developers.google.com/google-ads/scripts/docs/features/dates

- 수식을 업데이트할 경우는 `setFormulaR1C1()` 함수를 이용해서 현재 row, column의 상대값으로 지정 가능
```javascript
// getRange로 지정된 column에서 상대값으로 수식을 지정해서 사용 가능
// R[0] : 현재 row. R[-1]: 이전으로 1만큼 이동한 row
// C[0] : 현재 column. C[-2]: 이전으로 2만큼 이동한 column
sheet.getRange(i + 1, 7).setFormulaR1C1("=SUM(R[0]C[-2]:R[0]C[-1])");
```
