function addImageInfo() {
  // should put the image file name into
  // the Copyright Project sheet in coloumn C under description.
  // Date started: 4/02/2019
  // Date(s) updated: 4/04,05,11,12/2019
  let files = DriveApp.getFolderById("1uqFAPIVqYgN3CkFpVV3K9tLQlJb0nTWd").getFiles();
  let coloumn0 = 'C';
  let coloumn1 = 'A';
  let coloumn2 = 'B';
  let row = 2;
  while (files.hasNext()) {
    let file = files.next();
    let sheet = SpreadsheetApp.getActiveSheet();
    sheet.getRange(coloumn0+row).setValue(file.getName());
    sheet.getRange(coloumn1+row).setValue(file.getUrl());
    sheet.getRange(coloumn2+row).setValue(file.getId());
    row++;
  }
}


function checkArrayFor(jsons, url) {
  // called from the spreadsheet itself. Includes 
  // the call to checkFor that takes takes the
  // same arguments. 
  // Date started: 04/11/2019
  let result = []
  jsons.forEach(element => {
    //TODO: find out what this next line is. Tertiary or nullable?
    // then add type to declaration
    result.push((element != "")?checkFor(element,url):"") 
  })
  return result
}

function beenProcessed(fileID: string): number {
  // check the image IDs already on 
  // the spread sheet. The image Ids already on the
  // sheet should not be processed again if the timestamp 
  // shows that the image was "recently" processed. TODO: what is "recently"?
  // Date started: 04/12/2019
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Checked Images");
  let lastRow = sheet.getLastRow()-1;
  let imageId = sheet.getRange(2,2,lastRow,1).getValues();
  let i: number;
  for(i=0; (i<lastRow) && ((imageId[i][0]!=fileID)); i++){
    
  }
  return i<lastRow ? i+2 : 0;
}