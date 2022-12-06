import { FormatFile } from '../controllers/dataprepper.js';
import { GenerateChatComposition, GenerateFirstEncounter, GenerateMessageDays, GenerateMessageTimes, GenerateSearchRecord, GenerateTopWords } from '../controllers/metricmodulecontroller.js';

/**Function to populate a Product renderer */
async function PopulateProductBuilder(uploadedFile){
    let chatMaster = await FormatFile(uploadedFile);
    let chatObjArr = chatMaster.ArrayOfMessageObjs;
    let chatComposition = GenerateChatComposition(chatMaster.ArrayOfMessageObjs);
    let fromDate = chatObjArr[0].Date;
    let toDate = chatObjArr.reverse()[0].Date;
    let timeArray = GenerateMessageTimes(chatObjArr);
    let dayArray = GenerateMessageDays(chatObjArr);
    let firstEncounter = GenerateFirstEncounter(chatObjArr);
    let laughSearchRecord = GenerateSearchRecord(chatObjArr, "laugh", false, 2, 1, null);
    let morningSearchRecord = GenerateSearchRecord(chatObjArr, "morning", false, 2, 1, null);
    let nightSearchRecord = GenerateSearchRecord(chatObjArr, "night", false, 2, 1, null);
    let audioSearchRecord = GenerateSearchRecord(chatObjArr, "audio", false, 2, 1, null);
    let imageSearchRecord = GenerateSearchRecord(chatObjArr, "image", false, 2, 1, null);
    let loveSearchRecord = GenerateSearchRecord(chatObjArr, "love", false, 2, 1, null);
    let swearSearchRecord = GenerateSearchRecord(chatObjArr, "swear", false, 2, 1, null);
    let emojiSearchRecord = GenerateSearchRecord(chatObjArr, "emoji", false, 2, 1, null);

    let authors =  [];
    chatComposition.forEach(x => authors.push(x.Author));
    let tWtable = GenerateTopWords(chatMaster.WholeChatString, authors);

    //TODO - SET THIS AS A CLASS WITH A CONSTRUCTOR SO THAT THE RETURN VALUE CAN BE MANIPULATED ON THE FRONT END

}