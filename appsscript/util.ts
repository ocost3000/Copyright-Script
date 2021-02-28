
function makeString(len: number): string {
  // For creating a random string. This is for the nonce parameter.
  // Date started: 03/26/2019
  // Date(s) updated: 03/26,28/2019
  let text = "";
  let possible = "0123456789abcdef";
  
  for(let i=0; i<len; i++){
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  
  return text;
}

function checkFor(json,url): boolean {
  // look through the metadata and verify that the urls of 
  // the 3 websites are found
  // Date started: 04/11/2019
  let obj = JSON.parse(json) // obj to represent a reply from Tineye
  let found = false
  if (obj.hasOwnProperty("results") && obj.results.hasOwnProperty("matches"))
  {
    // TODO: Weird, should be a every() not forEach()
    obj.results.matches.forEach(element => {
      found = found || (element["domain"] == url)
    })
  }
  return found
}
