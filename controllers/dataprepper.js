import { BlobReader, BlobWriter, TextWriter, ZipReader, ZipWriter } from "https://deno.land/x/zipjs/index.js";

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
    }else{
        lowerCaseChat = "Oops! Sorry, we only accept .zip .txt or .json files";
    }

    return RemoveEncryptionAndSubjectMessage(lowerCaseChat);
}

//*Converts string to ensure WhatsApp chats from iOS devices are formatted properly*/
function FormatIOSChats(chatString){
    let linesArray = new Array();
    linesArray = chatString.split('\n');
    
    for(let i = 0; i < linesArray.length; i++){

        let lineString = linesArray[i];
        if(lineString.length > 0){

            if(lineString[0] == String.fromCharCode(8206)){
                lineString = lineString.substr(1);
            }

            if(lineString.indexOf('[') == 0 && lineString.indexOf(']') == 21 && lineString.indexOf(',') == 11){
                let firstHalf = lineString.substr(lineString.indexOf('[') + 1, 18);
                let secondHalf = lineString.substr(lineString.indexOf(']'));
                linesArray[i] = firstHalf + secondHalf.replace(']', ' -');
            }
        }
    }

    return linesArray;
}

//*Converts Array to Message Object*/
function ConvertArrayToMessageObject(array){
    for(let i = 0; i < array.length; i++){

    }







    let newObj = {};
    for(let i = 0; i < array.length; i++){
        let firstChar = array[i][0];
        if(newObj[firstChar]){
            newObj[firstChar].push(array[i]);
        } else {
            newObj[firstChar] = [array[i]];
        }
    }
    return newObj;
}

//*Removes message about encryption and subject*/
function RemoveEncryptionAndSubjectMessage(chatString){
    const whatsappEncryptionMessage = "messages and calls are end-to-end encrypted";
    const subjectChangeMessage = " changed the subject to ";
    const firstLine = chatString.split("\n")[0];

    if(firstLine.includes(whatsappEncryptionMessage) || firstLine.includes(subjectChangeMessage)){
        chatString = chatString.substr(chatString.indexOf("\n")+1);
    }
    return chatString;
}

export {FormatFile, FormatIOSChats};