import { ProductBuilder } from '../models/productbuilder.js';
import { FormatFile } from './datacontroller.js';
import { GenerateChatComposition, GenerateFirstEncounter, GenerateMessageDays, GenerateMessageTimes, GenerateSearchRecord, GenerateTopWords } from './metricmodulecontroller.js';

/**Function to populate a Product Builder */
export async function PopulateProductBuilder (uploadedFile){

    let chatMaster = await FormatFile(uploadedFile);
    let chatObjArr = chatMaster.ArrayOfMessageObjs;
    let wholeChatString = chatMaster.WholeChatString;
    let chatComposition = GenerateChatComposition(chatObjArr);
    let fromDateStr = chatObjArr[0].Date;
    let toDateStr = chatObjArr.reverse()[0].Date;
    let timeArray = GenerateMessageTimes(chatObjArr);
    let dayArray = GenerateMessageDays(chatObjArr);
    let firstEncounter = GenerateFirstEncounter(chatObjArr);

    let searchRecordArr = [];
    let laughSR = GenerateSearchRecord(chatObjArr, "laugh", false, 2, 1, null)
    searchRecordArr.push(laughSR);
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "morning", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "night", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "love", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "swear", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "emoji", false, 2, 1, null));
    let audioSearchRecord = GenerateSearchRecord(chatObjArr, "audio", false, 2, 1, null);
    audioSearchRecord != null ? searchRecordArr.push(audioSearchRecord) : null;
    let imageSearchRecord = GenerateSearchRecord(chatObjArr, "image", false, 2, 1, null);
    imageSearchRecord != null ? searchRecordArr.push(imageSearchRecord) : null;

    let authors =  [];
    chatComposition.Chatters.forEach(x => authors.push(x.Author));
    let tWtable = GenerateTopWords(wholeChatString, authors);

    let fromDay = fromDateStr.split('/')[0];
    let fromMonth = fromDateStr.split('/')[1];
    let fromYear = fromDateStr.split('/')[2];
    let fromDate = new Date();
    fromDate.setDate(fromDay);
    fromDate.setMonth(fromMonth-1);
    fromDate.setYear(fromYear);

    let toDay = toDateStr.split('/')[0];
    let toMonth = toDateStr.split('/')[1];
    let toYear = toDateStr.split('/')[2];
    let toDate = new Date();
    toDate.setDate(toDay);
    toDate.setMonth(toMonth-1);
    toDate.setYear(toYear);

    let daysDifference = Math.round((toDate - fromDate)/1000/60/60/24);
    
    return new ProductBuilder(chatComposition,fromDateStr,toDateStr,timeArray,dayArray,firstEncounter,tWtable,searchRecordArr,daysDifference);
}