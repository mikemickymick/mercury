import { BlobReader, BlobWriter, TextWriter, ZipReader, ZipWriter } from "https://deno.land/x/zipjs/index.js";
import {ConvertEntriesToMessageObjects, FormatIOSChats, RemoveEncryptionAndSubjectMessage} from './datacontroller.js';

/** Returns an Array of the names used in a chat file */
async function GetChatAuthors(uploadedFile){
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
    }else{
        lowerCaseChat = "Oops! Sorry, we only accept .zip .txt or .json files";
    }

    lowerCaseChat = RemoveEncryptionAndSubjectMessage(lowerCaseChat);
    let linesArray = FormatIOSChats(lowerCaseChat);
    let chatObjArr = ConvertEntriesToMessageObjects(linesArray);

    let chatters = new Array();
    let authorIndex = 0;
    chatObjArr.forEach(element => {
        let chatterInArray = false;
        chatters.forEach(x => {
            if(x == element.Author){
                chatterInArray = true;
            }
        });
        if(!chatterInArray){
            authorIndex ++;
            chatters.push(element.Author);
        }
    });

    return chatters;
}

export {GetChatAuthors}