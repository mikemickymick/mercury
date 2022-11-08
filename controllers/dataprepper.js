import { BlobReader, TextWriter, ZipReader } from "https://deno.land/x/zipjs/index.js";

/**Takes a File and formats it to be analysed*/
async function FormatFile (uploadedFile){
    const fileType = uploadedFile.type;
    const reader = new FileReader();
    let lowerCaseChat = "";

    if(fileType == "application/zip" || fileType == "application/x-zip-compressed"){
        //Unzip file
        const zipFileReader = new BlobReader(uploadedFile);
        const helloWorldWriter = new TextWriter();
        const zipReader = new ZipReader(zipFileReader);
        const entries = await zipReader.getEntries();
        const data = await entries[0].getData(helloWorldWriter);
        await zipReader.close();
        lowerCaseChat = data.toLowerCase();
    }else if (fileType == "text/plain"){
        lowerCaseChat = reader.readAsText(uploadedFile);
    }else{
        alert("Oops! Sorry, we only accept .zip .txt or .json files");
    }

    lowerCaseChat = RemoveEncryptionAndSubjectMessage(lowerCaseChat);









}

//*Fires on successful format of file*/
function FileFormattingSuccessful (){

}

//*Converts string to ensure WhatsApp chats from iOS devices are formatted properly*/
function FormatIOSChats(chatString){
    let linesArray = new Array();
    linesArray = chatString.Split('\n');
    
    for(let i = 0; i < linesArray.length; i++){

        let lineString = linesArray[i];
        if(lineString.length > 0){

            if(lineString[0] == String.fromCharCode(8206)){
                lineString = lineString.substring(0);
            }

            if(lineString.indexOf('[') == 0 && lineString.indexOf(']') == 21 && lineString.indexOf(',') == 11){
                let firstHalf = lineString.substring(lineString.indexOf('[') + 1, 17);
                let secondHalf = lineString.substring(lineString.indexOf(']'));
                linesArray[i] = firstHalf + secondHalf.replace(']', ' -');
            }
        }
    }

    return linesArray;
} 

//*Removes message about encryption and subject*/
function RemoveEncryptionAndSubjectMessage(chatString){
    const whatsappEncryptionMessage = "messages and calls are end-to-end encrypted";
    const subjectChangeMessage = " changed the subject to ";
    const firstLine = chatString.Split("\n")[0];

    if(firstLine.includes(whatsappEncryptionMessage) || firstLine.includes(subjectChangeMessage)){
        chatString = chatString.substring(chatString.indexOf("\n"), 1);
    }

    return chatString;
}