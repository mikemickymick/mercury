import { BlobReader, BlobWriter, TextWriter, ZipReader, ZipWriter } from "https://deno.land/x/zipjs/index.js";
import { StartsWithDateRegEx } from "../helpers/searchhelper.js";

	/**Converts chat entries to Message objects.*/
  function ConvertEntriesToMessageObjects(array) {
    const startsWithDateRegEx = StartsWithDateRegEx;
    const parsedData = [];
  
    for (const message of array) {
        const m = message.match(startsWithDateRegEx);
        if (m !== null) {
            const date = message.substr(0, 10);
            const time = message.substr(12, 5);
            const tempSubstr = message.substr(message.indexOf('-') + 2);
            const authorLength = tempSubstr.indexOf(':');
            const author = message.substr(message.indexOf('-') + 2, authorLength);
            const trimmedAuthor = author.replace(/[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2580-\u27BF]|\uD83E[\uDD10-\uDDFF]/g, '').replace(/[^\x20-\x7E]/g, '').trim();
            const messageBody = message.substr(message.indexOf('-') + 4 + authorLength);
            const messageModel = {
                Date: date,
                Time: time,
                Author: trimmedAuthor,
                MessageBody: messageBody
            };
            parsedData.push(messageModel);
        } else {
            const latestEntry = parsedData[parsedData.length - 1];
            latestEntry.MessageBody += '\n' + message;
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
  
    const chatters = new Set(chatObjArr.map(element => element.Author));
    const chattersArray = Array.from(chatters);
  
    return {
        WholeChatString: lowerCaseChat,
        ArrayOfMessageObjs: chatObjArr,
        Chatters: chattersArray
    };
}

function FormatIOSChats(chatString) {
    const linesArray = chatString.split('\n');
  
    for (let i = 0; i < linesArray.length; i++) {
        let lineString = linesArray[i];
        if (lineString.length > 0) {
            if (lineString[0] === String.fromCharCode(8206)) {
                lineString = lineString.substr(1);
            }
  
            if ((lineString.indexOf('[') === 0 && lineString.indexOf(']') === 21 && lineString.indexOf(',') === 11) ||
                ((lineString.indexOf(']') >= 19 && lineString.indexOf(']') <= 22) && (lineString.indexOf(',') >= 7 && lineString.indexOf(',') <= 11))) {
                const colonIndex = GetNthIndex(lineString, ':', 2);
                const dateAndTimeString = lineString.substr(lineString.indexOf("[") + 1, colonIndex - 1);
                const dateString = dateAndTimeString.split(",")[0];
                const monthString = dateString.split('/')[0].padStart(2, '0');
                const dayString = dateString.split('/')[1].padStart(2, '0');
                const yearString = "20" + dateString.split('/')[2];
                const timeString = dateAndTimeString.split(", ")[1];
                let hourString = timeString.split(':')[0];
                const minuteString = timeString.split(':')[1];
  
                if (lineString.includes(" am] ")) {
                    if (hourString.length === 1) {
                        hourString = "0" + hourString;
                    } else if (hourString === "12") {
                        hourString = "00";
                    }
                } else if (lineString.includes(" pm] ")) {
                    let newHour;
                    switch (hourString) {
                        case "1":
                            newHour = "13";
                            break;
                        case "2":
                            newHour = "14";
                            break;
                        case "3":
                            newHour = "15";
                            break;
                        case "4":
                            newHour = "16";
                            break;
                        case "5":
                            newHour = "17";
                            break;
                        case "6":
                            newHour = "18";
                            break;
                        case "7":
                            newHour = "19";
                            break;
                        case "8":
                            newHour = "20";
                            break;
                        case "9":
                            newHour = "21";
                            break;
                        case "10":
                            newHour = "22";
                            break;
                        case "11":
                            newHour = "23";
                            break;
                        default:
                            newHour = "12";
                    }
                    hourString = newHour;
                }
  
                const dateAndComma = `${dayString}/${monthString}/${yearString}, `;
                const timeStringFormatted = `${hourString}:${minuteString}`;
                const dateAndTimeStringFormatted = dateAndComma + timeStringFormatted;
                const secondHalf = lineString.substr(lineString.indexOf("]"));
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
    let firstLine = chatString.split("\n")[0];
  
    while (firstLine.includes(whatsappEncryptionMessage) || firstLine.includes(subjectChangeMessage) || firstLine.includes(numberChangeMessage)) {
        chatString = chatString.substr(chatString.indexOf("\n") + 1);
        firstLine = chatString.split("\n")[0];
    }
  
    return chatString;
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