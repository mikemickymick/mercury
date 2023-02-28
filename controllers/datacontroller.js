import { BlobReader, BlobWriter, TextWriter, ZipReader, ZipWriter } from "https://deno.land/x/zipjs/index.js";
import { EmojiArray, StartsWithDateRegEx } from "../helpers/searchhelper.js";

/**Converts chat entries to Message objects*/
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
            let author = message.substr(message.indexOf('-') + 2, authorLength).trim();

            //Remove emojis from names
            for (var i = 0; i < author.length; i++) {
                if (EmojiArray.includes(author.charAt(i))){
                    author.split(author.charAt(i)).join("");
                }
            }

            let messageBody = message.substr(message.indexOf('-') + 4 + authorLength)
            let messageModel = {};
            messageModel["Date"] = date;
            messageModel["Time"] = time;
            messageModel["Author"] = author;
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

/**Takes a File, formats it, and converts into an indexed Object*/
async function FormatFile (uploadedFile){
    let lowerCaseChat;
    if(uploadedFile.type == "application/zip" || uploadedFile.type == "application/x-zip-compressed"){
        //Unzip file
        const zipFileReader = new BlobReader(uploadedFile);
        const helloWorldWriter = new TextWriter();
        const zipReader = new ZipReader(zipFileReader);
        const entries = await zipReader.getEntries();
        const data = await entries[0].getData(helloWorldWriter);
        await zipReader.close();
        lowerCaseChat = data.toLowerCase();
    }else if (uploadedFile.type == "text/plain"){
        //Stupid but it works. Zip and then unzip file. Gets around the asynchronous nature of FileReader
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
    }else if(uploadedFile.type == "application/json"){
        //TODO add functionality
    }else{
        lowerCaseChat = "Oops! Sorry, we only accept .zip .txt or .json files";
    }

    lowerCaseChat = RemoveEncryptionAndSubjectMessage(lowerCaseChat);
    let linesArray = FormatIOSChats(lowerCaseChat);
    let chatObjArr = ConvertEntriesToMessageObjects(linesArray);

    let chatters = new Array();
    chatObjArr.forEach(element => {
        let chatterInArray = false;
        chatters.forEach(x => {
            if(x == element.Author){
                chatterInArray = true;
            }
        });
        if(!chatterInArray){
            chatters.push(element.Author);
        }
    });

    return { WholeChatString: lowerCaseChat, ArrayOfMessageObjs: chatObjArr, Chatters: chatters};
}

/**Converts string to ensure WhatsApp chats from iOS devices are formatted properly*/
function FormatIOSChats(chatString){
    let linesArray = new Array();
    linesArray = chatString.split('\n');
    
    for(let i = 0; i < linesArray.length; i++){
        let lineString = linesArray[i];
        if(lineString.length > 0){

            if(lineString[0] == String.fromCharCode(8206)){
                lineString = lineString.substr(1);
            }

            //Normal formatting
            if(lineString.indexOf('[') == 0 && lineString.indexOf(']') == 21 && lineString.indexOf(',') == 11){
                let firstHalf = lineString.substr(lineString.indexOf('[') + 1, 17);
                let secondHalf = lineString.substr(lineString.indexOf(']'));
                linesArray[i] = firstHalf + secondHalf.replace(']', ' -').replace('\r','');
            }
            //AM PM formatting
            else if((lineString.indexOf(']') == 19 || lineString.indexOf(']') == 20 || lineString.indexOf(']') == 21 || lineString.indexOf(']') == 22) && (lineString.indexOf(',') == 7 || lineString.indexOf(',') == 8 || lineString.indexOf(',') == 9 || lineString.indexOf(',') == 11)){
                let colonIndex = GetNthIndex(lineString, ':', 2);
                let dateAndTimeString = lineString.substr(lineString.indexOf("[") + 1, colonIndex-1);
                let dateString = dateAndTimeString.split(",")[0];
                let monthString = dateString.split('/')[0];
                let dayString = dateString.split('/')[1];
                let yearString = "20" + dateString.split('/')[2];
                let timeString = dateAndTimeString.split(", ")[1];
                let hourString = timeString.split(':')[0];
                let minuteString = timeString.split(':')[1];

                if (dayString.length == 1) {dayString = "0" + dayString; }
                if (monthString.length == 1) { monthString = "0" + monthString; }

                let dateAndComma = dayString + '/' + monthString + "/" + yearString + ", ";

                //Take away PM and AM
                if (lineString.includes(" am] ")){
                    if (hourString.length == 1) { 
                        hourString = "0" + hourString; 
                    }else if (hourString == "12"){
                        hourString = "00";
                    }
                }
                else if (lineString.includes(" pm] ")){
                    let newHour;
                    switch (hourString){
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

                timeString = hourString + ':' + minuteString;
                dateAndTimeString = dateAndComma + timeString;
                let secondHalf = lineString.substr(lineString.indexOf("]"));
                linesArray[i] = dateAndTimeString + secondHalf.replace("]", " -");
            }
        }
    }
    return linesArray;
}

/**Finds the nth index of a character in a string*/
function GetNthIndex(s, t, n){
    let count = 0;
    for (let i = 0; i < s.length; i++)
    {
        if (s[i] == t)
        {
            count++;
            if (count == n)
            {
                return i;
            }
        }
    }
    return -1;
}

/**Removes message about encryption and subject*/
function RemoveEncryptionAndSubjectMessage(chatString){
    const whatsappEncryptionMessage = "messages and calls are end-to-end encrypted";
    const subjectChangeMessage = " changed the subject to ";
    const numberChangeMessage = "changed their phone number";
    let firstLine = chatString.split("\n")[0];

    while(firstLine.includes(whatsappEncryptionMessage) || firstLine.includes(subjectChangeMessage) || firstLine.includes(numberChangeMessage)){
        chatString = chatString.substr(chatString.indexOf("\n")+1);
        firstLine = chatString.split("\n")[0];
    }
    
    return chatString;
}

/**Sends request to logic app to create csv*/
async function SendChatChartRequest(httpRequest){
    let url = 'https://prod-14.uksouth.logic.azure.com:443/workflows/6f40b458f6d447cf931ad42dc778db92/triggers/manual/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=Xxz51scEThNC4v_zdGkWd0EB2FWl0OOUO5FtUlOpDe8';
    return await fetch(url, httpRequest);
}

export {ConvertEntriesToMessageObjects, FormatFile, FormatIOSChats, RemoveEncryptionAndSubjectMessage, SendChatChartRequest};