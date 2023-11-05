import { BlobReader, BlobWriter, TextWriter, ZipReader, ZipWriter } from "https://deno.land/x/zipjs/index.js";
import { StartsWithDateRegEx } from "../helpers/searchhelper.js";

/**Converts chat entries to Message objects.*/
function ConvertEntriesToMessageObjects(array){
  const parsedData = [];
  for(let i = 0; i < array.length; i++){
      let message = array[i];
      if(message != ''){
          let m = message.match(StartsWithDateRegEx);
          if (m != null) {
              let date = message.substr(0, 10);
              let time = message.substr(12, 5);
              let tempSubstr = message.substr(message.indexOf('-') + 2);
              let authorLength = tempSubstr.indexOf(':');
              let author = message.substr(message.indexOf('-') + 2, authorLength);
              let trimmedAuthor = author.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').replace(/[^\x20-\x7E]/g, '').trim();
              let messageBody = message.substr(message.indexOf('-') + 4 + authorLength);
              const messageModel = {
                  Date: date,
                  Time: time,
                  Author: trimmedAuthor,
                  MessageBody: messageBody
              };
              if(author != ""){
                  parsedData.push(messageModel);
              }
          } else {
              let latestEntry = parsedData[parsedData.length - 1];
              latestEntry.MessageBody += '\n' + message;
              parsedData[parsedData.length - 1] = latestEntry;
          }
      }
  }
  return parsedData;
}

async function FormatFile(uploadedFile) {
  let lowerCaseChat;
  if (uploadedFile.type === "application/zip" || uploadedFile.type === "application/x-zip-compressed") {
    const zipFileReader = new BlobReader(uploadedFile);
    const zipReader = new ZipReader(zipFileReader);
    const entries = await zipReader.getEntries();
    const data = await entries[0].getData(new TextWriter());
    await zipReader.close();
    lowerCaseChat = data.toLowerCase();
  } else if (uploadedFile.type === "text/plain") {
    const zipFileWriter = new BlobWriter();
    const helloWorldReader = new BlobReader(uploadedFile);
    const zipWriter = new ZipWriter(zipFileWriter);
    await zipWriter.add("chat-thing.txt", helloWorldReader);
    await zipWriter.close();
    const zipFileBlob = await zipFileWriter.getData();
    const zipFileReader = new BlobReader(zipFileBlob);
    const zipReader = new ZipReader(zipFileReader);
    const entries = await zipReader.getEntries();
    const data = await entries[0].getData(new TextWriter());
    await zipReader.close();
    lowerCaseChat = data.toLowerCase();
  } else if (uploadedFile.type === "application/json") {
    // TODO: add functionality
    return;
  } else {
    lowerCaseChat = "Oops! Sorry, we only accept .zip, .txt, or .json files";
  }

  lowerCaseChat = RemoveEncryptionAndSubjectMessage(lowerCaseChat);
  const linesArray = FormatChat(lowerCaseChat);
  const chatObjArr = ConvertEntriesToMessageObjects(linesArray);

  const chatters = new Set();
  for (const element of chatObjArr) {
    chatters.add(element.Author);
  }
  const chattersArray = Array.from(chatters);

  return {
    WholeChatString: lowerCaseChat,
    ArrayOfMessageObjs: chatObjArr,
    Chatters: chattersArray
  };
}

function FormatChat(chatString) {
    let linesArray = new Array();
    linesArray = chatString.split('\n');
    linesArray = StandardiseCharacters(linesArray);
    linesArray = StandardiseDateFormat(linesArray);
    linesArray = StandardiseClockFormat(linesArray);
    return linesArray;
}

function StandardiseCharacters(linesArray){
  for(var i = 0; i < linesArray.length; i++) {
      let currentLine = linesArray[i];
      if (currentLine[0] == String.fromCharCode(8206)) {
          currentLine = currentLine.substr(1);
      }
      if(currentLine.includes('[') && currentLine.includes(']')){
          const numberOfBrackets = currentLine.replace(/[^\[\]]/g, "").length;
          if(numberOfBrackets == 4){ //skip next 10 messages
              linesArray[i] = '';
              for(var j = 1; j < 9; j++){
                  linesArray[i + j] = '';
                  j++;
              }
              i += 9;                
          }else{
              currentLine = currentLine.replace(/-/g, '/').replace(/[\[]/gm, '').replace(/[\]]/gm,' -');
              if(currentLine[10] != ','){
                  const firstHalf = currentLine.substring(0, 10);
                  const secondHalf = currentLine.substring(10);
                  currentLine = firstHalf + "," + secondHalf;
              }
              linesArray[i] = currentLine;
          }
      }
  }
  return linesArray;
}

function StandardiseDateFormat(linesArray){
  const dateFormat = GetDateFormat(linesArray);
  let i = 0;
  while( i < linesArray.length){
      let currentLine = linesArray[i];
      let beginningOfLine = currentLine.substr(0,30);

      try{
        if (beginningOfLine.length > 0 && beginningOfLine.includes(':') && beginningOfLine.includes(',') && beginningOfLine.includes('-') && (beginningOfLine.indexOf('/') == 1 || beginningOfLine.indexOf('/') == 2)) {
          const dateString = currentLine.split(",")[0];
          let dayString = "";
          let monthString = "";
          if(dateFormat == "ENG"){
              dayString = dateString.split('/')[0].length == 2 ? dateString.split('/')[0] : "0" + dateString.split('/')[0];
              monthString = dateString.split('/')[1].length == 2 ? dateString.split('/')[1] : "0" + dateString.split('/')[1];
          }else{
              dayString = dateString.split('/')[1].length == 2 ? dateString.split('/')[1] : "0" + dateString.split('/')[1];
              monthString = dateString.split('/')[0].length == 2 ? dateString.split('/')[0] : "0" + dateString.split('/')[0];
          }
          const yearString = dateString.split('/')[2].length == 4 ? dateString.split('/')[2] : "20" + dateString.split('/')[2];
          const dateFormatted = `${dayString}/${monthString}/${yearString}`;
          const newLine = currentLine.replace(dateString, dateFormatted);
          linesArray[i] = newLine;
      }
      i++;
      }
      catch{
        i++;
      }
  }
  return linesArray;
}

function StandardiseClockFormat(linesArray){
  const hourLookupTable = {
      "1": "13",
      "2": "14",
      "3": "15",
      "4": "16",
      "5": "17",
      "6": "18",
      "7": "19",
      "8": "20",
      "9": "21",
      "10": "22",
      "11": "23"
  };

  const clockFormat = GetClockFormat(linesArray);
  let i = 0;
  while( i < linesArray.length){
      let currentLine = linesArray[i];
      if (currentLine.length > 0 && currentLine.includes(':') && currentLine.indexOf('/') == 2) {
          const commaIndex = currentLine.indexOf(', ');
          const colonIndex = currentLine.indexOf(':');
          const dashIndex = currentLine.indexOf(' - ');
          let hourString = currentLine.substring(commaIndex + 2, colonIndex);
          let minuteString = currentLine.substring(colonIndex + 1, colonIndex +3);
          
          if(clockFormat == "12"){                
              if (currentLine.toLowerCase().includes("am -")) {
                  if (hourString.length == 1) {
                      hourString = "0" + hourString;
                  } else if (hourString == "12") {
                      hourString = "00";
                  }
              } 
              else{
                  hourString = hourLookupTable[hourString] || "12";
              }
          }

          const firstHalf = currentLine.substring(0, commaIndex + 2);
          const secondHalf = currentLine.substring(dashIndex);
          const timeFormatted = `${hourString}:${minuteString}`;
          linesArray[i] = firstHalf + timeFormatted + secondHalf;
      }
      i++;
  }
  return linesArray;
}

function GetDateFormat(linesArray){
  let i = 0;
  while(i < linesArray.length){
      let previousLine = linesArray[i - 1];
      let lineString = linesArray[i];
      //If message is not empty and it includes a datetime stamp
      if (lineString.length > 0 && IsProperLine(lineString)) {
          if (previousLine != undefined && previousLine.length > 0 && IsProperLine(previousLine)) {
              if (previousLine[0] == String.fromCharCode(8206)) {
                  previousLine = previousLine.substr(1);
              }
              const previousFirstSlashIndex = previousLine.indexOf('/');
              const previousBeginningOfMonth = previousLine.substring(previousFirstSlashIndex + 1);
              const previousMonthString = previousBeginningOfMonth.substring(0,2);
              const previousMonthInt = parseInt(previousMonthString);

              const firstSlashIndex = lineString.indexOf('/');
              const beginningOfMonth = lineString.substring(firstSlashIndex + 1);
              const monthString = beginningOfMonth.substring(0,2);
              const monthInt = parseInt(monthString);
              if(previousMonthInt == 12 && monthInt == 1){
                  return "ENG";
              } else if(monthInt > 12){
                  return "USA";
              }            
          }
      }
      i++;
  }
  return "ENG";
}

function GetClockFormat(linesArray){
  let i = 0;
  while(i < linesArray.length){
      let lineString = linesArray[i];
      if (lineString.length > 0 && lineString.includes(':')) {
          if (lineString[0] == String.fromCharCode(8206)) { lineString = lineString.substr(1); }
          if(lineString.toLowerCase().includes("am -") || lineString.toLowerCase().includes("pm -")){
              return "12";
          }else{
              return "24";
          }
      }
      i++;
  }
}

function IsProperLine(lineString){
    let hyphenCount = (lineString.match(/\//gm) || []).length;
    let dashCount = (lineString.match(/-/gm) || []).length;
    return hyphenCount >= 2 || dashCount >= 2;
}

/**function GetNthIndex(s, t, n) {
  let count = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === t) {
      count++;
      if (count === n) {
        return i;
      }
    }
  }
  return -1;
}*/

function RemoveEncryptionAndSubjectMessage(chatString) {
  const whatsappEncryptionMessage = "messages and calls are end-to-end encrypted";
    const subjectChangeMessage = " changed the subject to ";
    const numberChangeMessage = "changed their phone number";
    let chatSplitArr = chatString.split("\n");

    for(var x = 0; x < 5; x++){
        let currentLine = chatSplitArr[x];
        if (currentLine.includes(whatsappEncryptionMessage) || currentLine.includes(subjectChangeMessage) || currentLine.includes(numberChangeMessage)){
            chatSplitArr[x] = '';
        }
    }

    return chatSplitArr.join("\n");
}


async function SendChatChartRequest(httpRequest) {
  const url = 'https://prod-14.uksouth.logic.azure.com:443/workflows/6f40b458f6d447cf931ad42dc778db92/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Xxz51scEThNC4v_zdGkWd0EB2FWl0OOUO5FtUlOpDe8';
  return await fetch(url, httpRequest);
}

export {
  ConvertEntriesToMessageObjects,
  FormatFile,
  FormatChat,
  RemoveEncryptionAndSubjectMessage,
  SendChatChartRequest
};