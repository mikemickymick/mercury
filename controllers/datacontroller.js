import { BlobReader, BlobWriter, TextWriter, ZipReader, ZipWriter } from "https://deno.land/x/zipjs/index.js";
import { StartsWithDateRegEx } from "../helpers/searchhelper.js";

/**Converts chat entries to Message objects.*/
function ConvertEntriesToMessageObjects(array){
    let startsWithDateRegEx = StartsWithDateRegEx;
    let parsedData = new Array();
    for(let i = 0; i < array.length; i++){
        let message = array[i];        
        let m = message.match(startsWithDateRegEx);
        if (m != null) {
            //Transform into model
            let date = message.substr(0, 10);
            let time = message.substr(12, 5);
            let tempSubstr = message.substr(message.indexOf('-') + 2);
            let authorLength = tempSubstr.indexOf(':');
            let author = message.substr(message.indexOf('-') + 2, authorLength);
            //Remove emojis and invisible characters from names
            let trimmedAuthor = author.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').replace(/[^\x20-\x7E]/g, '').trim();
            let messageBody = message.substr(message.indexOf('-') + 4 + authorLength)
            let messageModel = {};
            messageModel["Date"] = date;
            messageModel["Time"] = time;
            messageModel["Author"] = trimmedAuthor;
            messageModel["MessageBody"] = messageBody;
            parsedData.push(messageModel);
        } else {
            let latestEntry = parsedData[parsedData.length - 1];
            latestEntry.MessageBody += '\n' + message;
            parsedData[parsedData.length - 1] = latestEntry;
        }
    }
    return parsedData;
}

async function FormatFile(uploadedFile) {
  let lowerCaseChat;
  if (uploadedFile.type === "application/zip" || uploadedFile.type === "application/x-zip-compressed") {
    const zipFileReader = new BlobReader(uploadedFile);
    const helloWorldWriter = new TextWriter();
    const zipReader = new ZipReader(zipFileReader);
    const entries = await zipReader.getEntries();
    const data = await entries[0].getData(helloWorldWriter);
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
    const helloWorldWriter = new TextWriter();
    const zipReader = new ZipReader(zipFileReader);
    const entries = await zipReader.getEntries();
    const data = await entries[0].getData(helloWorldWriter);
    await zipReader.close();
    lowerCaseChat = data.toLowerCase();
  } else if (uploadedFile.type === "application/json") {
    // TODO: add functionality
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
  const linesArray = chatString.split('\n');
  const formattedLinesArray = [];

  for (let i = 0; i < linesArray.length; i++) {
    const lineString = linesArray[i];
    
    if (lineString.length > 0) {
      if (lineString.charCodeAt(0) === 8206) {
        lineString = lineString.substr(1);
      }

      const openingBracketIndex = lineString.indexOf('[');
      const closingBracketIndex = lineString.indexOf(']');
      const commaIndex = lineString.indexOf(',');

      if (
        openingBracketIndex === 0 &&
        closingBracketIndex === 21 &&
        commaIndex === 11
      ) {
        const firstHalf = lineString.substr(openingBracketIndex + 1, 17);
        const secondHalf = lineString.substr(closingBracketIndex);
        const formattedLine = firstHalf + secondHalf.replace(']', ' -').replace('\r', '');
        formattedLinesArray.push(formattedLine);
      } else if (
        closingBracketIndex >= 19 && closingBracketIndex <= 22 &&
        commaIndex >= 7 && commaIndex <= 11
      ) {
        const colonIndex = GetNthIndex(lineString, ':', 2);
        const dateAndTimeString = lineString.substring(openingBracketIndex + 1, colonIndex - 1);
        const dateString = dateAndTimeString.substring(0, commaIndex);
        const [day, month, year] = dateString.split('/');
        const monthString = month.padStart(2, '0');
        const dayString = day.padStart(2, '0');
        const yearString = "20" + year;
        const timeString = dateAndTimeString.substring(commaIndex + 2);
        let hourString = timeString.split(':')[0];
        const minuteString = timeString.split(':')[1];

        if (lineString.includes(" am] ")) {
          if (hourString.length === 1) {
            hourString = "0" + hourString;
          } else if (hourString === "12") {
            hourString = "00";
          }
        } else if (lineString.includes(" pm] ")) {
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
        const formattedLine = dateAndTimeStringFormatted + secondHalf.replace("]", " -");
        formattedLinesArray.push(formattedLine);
      }
    }
  }

  return formattedLinesArray;
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
  const whatsappEncryptionMessage = /messages and calls are end-to-end encrypted/;
  const subjectChangeMessage = / changed the subject to /;
  const numberChangeMessage = /changed their phone number/;
  let firstLine = chatString;

  while (
    whatsappEncryptionMessage.test(firstLine) ||
    subjectChangeMessage.test(firstLine) ||
    numberChangeMessage.test(firstLine)
  ) {
    const newLineIndex = chatString.indexOf("\n", firstLine.length);
    if (newLineIndex === -1) break;
    firstLine = chatString.substring(newLineIndex + 1);
  }

  return firstLine;
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