function checkArrayFor(jsons, url){
  // called from the spreadsheet itself. Includes 
  // the call to checkFor that takes takes the
  // same arguments. 
  // Date started: 04/11/2019
  let result = []
  jsons.forEach(element => {
    //TODO: find out what this next line is. Tertiary or nullable?
    result.push((element != "")?checkFor(element,url):"") 
  })
  return result
}