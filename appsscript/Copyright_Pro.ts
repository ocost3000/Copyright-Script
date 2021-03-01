// Edits by Omar Costilla
// Started 2/22/2021


/*******************************************************
 The function below should put the image file name to
 the Copyright Project sheet. The image file names should 
 be posted in coloumn C under description.
 Date started: 4/02/2019
 Date(s) updated: 4/04,05,11,12/2019
*******************************************************/
function addImageInfo(){
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

/********************************************************
 Helper function below to check the image IDs have already on 
 the spread sheet. The image Ids that are already on the
 sheet should not be processed again if the timestamp 
 shows that the image was "recently" processed.
 Date started: 04/12/2019
********************************************************/
function beenProcessed(fileID: string): number {
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Checked Images");
  let lastRow = sheet.getLastRow()-1;
  let imageId = sheet.getRange(2,2,lastRow,1).getValues();
  let i: number;
  for(i=0; (i<lastRow) && ((imageId[i][0]!=fileID)); i++){
    
  }
  return i<lastRow ? i+2 : 0;
}

function getRequest() {
  // This function below is a different a GET request to TinEye's
  // API. Professor Tak walked me through the code below. 
  // Lots of thinking it through and problem solving was needed to tweak the 
  // code to adjust to TinEye's required format when making a GET request. 

  // Definitions for API_KEY and API_PRIVATE_KEY must be manually defined
  // Date started: 03/22/2019
  // Date(s) updated: 03/28/2019, 04/02/2019
  
  // assign folder that contains images
  let files = DriveApp.getFolderById("1uqFAPIVqYgN3CkFpVV3K9tLQlJb0nTWd").getFiles();
  let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Checked Images");
  let timeoutPeriod = sheet.getRange(2,13).getValues()[0][0]; // should be getValue
  
  let fileCount = 0;
  let UrlColoumn = 'D';
  let metaColoumn = 'E';
  
  while (files.hasNext()){
    
    let file = files.next();
    let file_id = file.getId();
  
    let row: number;
    let fileRowNum = beenProcessed(file_id);
    let checkWithTineye = false;

    // Check timestamp to see if time to reevaluate
    if (fileRowNum == 0) {
      row = sheet.getLastRow()+1;
      checkWithTineye = true;
    } else {
      row = fileRowNum;
      let jsonString = sheet.getRange(row,5).getValues()[0][0]; // could probably change to getValue()
        
      let timeStamp = lastDate(jsonString)/86400;
      if(Date.now()/1000/86400 - timeStamp >= timeoutPeriod){
        checkWithTineye = true;
      }
    }

    // send to tineye
    if (checkWithTineye) {
      let stringOne = "";
      let http_verb = "GET"
      let content_type_header = ""
      let uploaded_image_name = ""
      // TODO: this can probably be 1 line and 1 type
        let date: Date|number = new Date()
        date = Math.floor(date.getTime()/1000)
      let nonce = makeString(8)
      let request_url = "https://api.tineye.com/rest/search/"
      let image_url = "https://drive.google.com/uc?id="
      let string_to_sign = API_PRIVATE_KEY + http_verb + content_type_header + uploaded_image_name +
                           date + nonce + request_url + "image_url="+encodeURIComponent(image_url+file_id)
      // TODO: See if this can chain?
      let api_sig: string = Utilities.computeHmacSha256Signature(string_to_sign, API_PRIVATE_KEY).map(function(chr){return (chr+256).toString(16).slice(-2)})
      .join('')
      let options: URLFetchReqOptions = {
        method: "get",
        muteHttpExceptions: true,
        escaping: false,
      };
      let url = request_url+"?api_key="+(API_KEY)+"&image_url="+encodeURIComponent(image_url+file_id)+"&date="+date+"&nonce="+nonce+"&api_sig="+(api_sig);
      
      // send request, receive response
      let results: HTTPResponse = UrlFetchApp.fetch(url, options);
      
      // turn response into JSON
      let jasonObj: any = JSON.parse(results.getContentText())
      if (jasonObj.hasOwnProperty("results") && jasonObj.results.hasOwnProperty("matches"))
      {
        jasonObj.results.matches.forEach( element => { 
          delete element["backlinks"] 
          delete element["overlay"]
        })
      }
      // convert JSON to string and store in sheet
      let newJson: string = JSON.stringify(jasonObj)
      sheet.getRange(metaColoumn+row).setValue(newJson);

      fileCount++;
      Logger.log(file.getName());
      Logger.log(file.getMimeType());
      Logger.log(file.getId());
      sheet.getRange(UrlColoumn+row).setValue(url);
      row++;
      Logger.log(style);
    }
  }
  Logger.log(fileCount);
}

function lastDate(jasonObj: string){
  // "fetches" the timestamp of the json object.
  // The timestamp is what will be checked to determine if it should be
  // processed again (ran through the getRequest).
  // Date started: 04/23/2019
  // Date(s) updated: 
  
  let parsedJson: any = JSON.parse(jasonObj);
  
  if (parsedJson.hasOwnProperty("results") && parsedJson.results.hasOwnProperty("matches")){
        return parsedJson.stats.timestamp;                                 
  }
  else{
   return 0; 
  }
}