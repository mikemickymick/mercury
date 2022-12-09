import { ProductBuilder } from '../models/productbuilder.js';
import { FormatFile } from './dataprepper.js';
import { GenerateChatComposition, GenerateFirstEncounter, GenerateMessageDays, GenerateMessageTimes, GenerateSearchRecord, GenerateTopWords } from './metricmodulecontroller.js';

/**Function to populate a Product renderer */
export async function PopulateProductBuilder (uploadedFile){

    let chatMaster = await FormatFile(uploadedFile);
    let chatObjArr = chatMaster.ArrayOfMessageObjs;
    let chatComposition = GenerateChatComposition(chatMaster.ArrayOfMessageObjs);
    let fromDate = chatObjArr[0].Date;
    let toDate = chatObjArr.reverse()[0].Date;
    let timeArray = GenerateMessageTimes(chatObjArr);
    let dayArray = GenerateMessageDays(chatObjArr);
    let firstEncounter = GenerateFirstEncounter(chatObjArr);

    let searchRecordArr = [];
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "laugh", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "morning", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "night", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "love", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "swear", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "emoji", false, 2, 1, null));
    let audioSearchRecord = GenerateSearchRecord(chatObjArr, "audio", false, 2, 1, null);
    audioSearchRecord != null ? searchRecordArr.pushc(audioSearchRecord) : null;
    let imageSearchRecord = GenerateSearchRecord(chatObjArr, "image", false, 2, 1, null);
    imageSearchRecord != null ? searchRecordArr.pushc(imageSearchRecord) : null;

    let authors =  [];
    chatComposition.forEach(x => authors.push(x.Author));
    let tWtable = GenerateTopWords(chatMaster.WholeChatString, authors);

    //to do total time
    
    return new ProductBuilder(chatComposition,fromDate,toDate,timeArray,dayArray,firstEncounter,tWtable,searchRecordArr);

}