import { BlobReader, BlobWriter, TextWriter, ZipReader, ZipWriter } from "https://deno.land/x/zipjs/index.js";
import { StartsWithDateRegEx } from "../helpers/searchhelper.js";

const startsWithDateRegEx = StartsWithDateRegEx;

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
  const linesArray = FormatIOSChats(lowerCaseChat);
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

function FormatIOSChats(chatString) {
    let linesArray = new Array();
    linesArray = chatString.split('\n');
    
    for(let i = 0; i < linesArray.length; i++){
        let lineString = linesArray[i];
        if(lineString.length > 0){

            if(lineString[0] == String.fromCharCode(8206)){ lineString = lineString.substr(1); }

            const openingBracketIndex = lineString.indexOf('[');
            const closingBracketIndex = lineString.indexOf(']');
            const commaIndex = lineString.indexOf(',');

            //Normal formatting
            if(openingBracketIndex == 0 && closingBracketIndex == 21 && commaIndex == 11){
                let firstHalf = lineString.substr(openingBracketIndex + 1, 17);
                let secondHalf = lineString.substr(closingBracketIndex);
                linesArray[i] = firstHalf + secondHalf.replace(']', ' -').replace('\r','');
            }
            //AM PM formatting
            else if((closingBracketIndex == 19 || closingBracketIndex == 20 || closingBracketIndex == 21 || closingBracketIndex == 22) && (commaIndex == 7 || commaIndex == 8 || commaIndex == 9 || commaIndex == 11)){
                let colonIndex = GetNthIndex(lineString, ':', 2);
                let dateAndTimeString = lineString.substr(openingBracketIndex + 1, colonIndex-1);
                let dateString = dateAndTimeString.split(",")[0];
                let monthString = dateString.split('/')[0];
                let dayString = dateString.split('/')[1];
                let yearString = "20" + dateString.split('/')[2];
                let timeString = dateAndTimeString.split(", ")[1];
                let hourString = timeString.split(':')[0];
                let minuteString = timeString.split(':')[1];

                if (dayString.length == 1) {dayString = "0" + dayString; }
                if (monthString.length == 1) { monthString = "0" + monthString; }

                //Take away PM and AM
                if (lineString.includes(" am] ")){
                    if (hourString.length == 1) { 
                        hourString = "0" + hourString; 
                    }else if (hourString == "12"){
                        hourString = "00";
                    }
                }
                else if (lineString.includes(" pm] ")){
                    const hourLookupTable = {
                        "1": "13", "2": "14", "3": "15", "4": "16",
                        "5": "17", "6": "18", "7": "19", "8": "20",
                        "9": "21", "10": "22", "11": "23"
                      };
                      hourString = hourLookupTable[hourString] || "12";
                }

                const dateAndComma = `${dayString}/${monthString}/${yearString}, `;
                const timeStringFormatted = `${hourString}:${minuteString}`;
                const dateAndTimeStringFormatted = dateAndComma + timeStringFormatted;
                const secondHalf = lineString.substr(closingBracketIndex);
                linesArray[i] = dateAndTimeStringFormatted + secondHalf.replace("]", " -");
            }
        }
    }
  return linesArray;
}

function GetNthIndex(s, t, n) {
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
}


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
  FormatIOSChats,
  RemoveEncryptionAndSubjectMessage,
  SendChatChartRequest
};