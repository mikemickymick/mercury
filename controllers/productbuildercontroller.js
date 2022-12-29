import { ProductBuilder } from '../models/productbuilder.js';
import { GenerateChatComposition, GenerateFirstEncounter, GenerateMessageDays, GenerateMessageTimes, GenerateSearchRecord, GenerateTopWords } from './metricmodulecontroller.js';

/**Function to populate a Product Builder - takes a parameter of the FileFormat output*/
async function PopulateProductBuilder (chatMaster, personalWord){
    let chatObjArr = chatMaster.ArrayOfMessageObjs;
    let wholeChatString = chatMaster.WholeChatString;
    let chatComposition = GenerateChatComposition(chatObjArr);
    let fromDateStr = chatObjArr[0].Date;
    let toDateStr = chatObjArr.reverse()[0].Date;
    let timeArray = GenerateMessageTimes(chatObjArr);
    let dayArray = GenerateMessageDays(chatObjArr);
    let firstEncounter = GenerateFirstEncounter(chatObjArr);

    let searchRecordArr = [];
    let laughSR = GenerateSearchRecord(wholeChatString, "laugh", false, 2, 1, null)
    searchRecordArr.push(laughSR);
    searchRecordArr.push(GenerateSearchRecord(wholeChatString, "morning", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(wholeChatString, "night", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(wholeChatString, "love", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(wholeChatString, "swear", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(wholeChatString, "emoji", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(wholeChatString, "personal", false, 2, 1, [personalWord]));
    let audioSearchRecord = GenerateSearchRecord(wholeChatString, "audio", false, 2, 1, null);
    audioSearchRecord != null ? searchRecordArr.push(audioSearchRecord) : null;
    let imageSearchRecord = GenerateSearchRecord(wholeChatString, "image", false, 2, 1, null);
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
    
    return new ProductBuilder(chatComposition,fromDateStr,toDateStr,timeArray,dayArray,firstEncounter,tWtable,searchRecordArr,daysDifference,personalWord);
}

/**Parses productBuilder data into a http request */
async function ParseProductBuilder(productBuilder){
    
    let data = {};
    data.ShippingAddress = null;
    data.OrderNumber = "xxxx";
    data.ProductName = "test product";
    data.DateFrom = productBuilder.FromDate;
    data.DateTo = productBuilder.ToDate;
    data.AuthorCount = productBuilder.ChatComposition.Chatters.length;
    data.AuthorDataList = productBuilder.ChatComposition.Chatters;
    data.MondayCount = productBuilder.MessageDays.MessageDaysTable[0].Count;
    data.TuesdayCount =  productBuilder.MessageDays.MessageDaysTable[1].Count;
    data.WednesdayCount = productBuilder.MessageDays.MessageDaysTable[2].Count;
    data.ThursdayCount = productBuilder.MessageDays.MessageDaysTable[3].Count;
    data.FridayCount = productBuilder.MessageDays.MessageDaysTable[4].Count;
    data.SaturdayCount = productBuilder.MessageDays.MessageDaysTable[5].Count;
    data.SundayCount = productBuilder.MessageDays.MessageDaysTable[6].Count;
    data.MondayPercent = productBuilder.MessageDays.MessageDaysTable[0].Percent;
    data.TuesdayPercent =  productBuilder.MessageDays.MessageDaysTable[1].Percent;
    data.WednesdayPercent = productBuilder.MessageDays.MessageDaysTable[2].Percent;
    data.ThursdayPercent = productBuilder.MessageDays.MessageDaysTable[3].Percent;
    data.FridayPercent = productBuilder.MessageDays.MessageDaysTable[4].Percent;
    data.SaturdayPercent = productBuilder.MessageDays.MessageDaysTable[5].Percent;
    data.SundayPercent = productBuilder.MessageDays.MessageDaysTable[6].Percent;
    data.Time0 = productBuilder.MessageTimes.MessageTimesTable[0];
    data.Time1 = productBuilder.MessageTimes.MessageTimesTable[1];
    data.Time2 = productBuilder.MessageTimes.MessageTimesTable[2];
    data.Time3 = productBuilder.MessageTimes.MessageTimesTable[3];
    data.Time4 = productBuilder.MessageTimes.MessageTimesTable[4];
    data.Time5 = productBuilder.MessageTimes.MessageTimesTable[5];
    data.Time6 = productBuilder.MessageTimes.MessageTimesTable[6];
    data.Time7 = productBuilder.MessageTimes.MessageTimesTable[7];
    data.Time8 = productBuilder.MessageTimes.MessageTimesTable[8];
    data.Time9 = productBuilder.MessageTimes.MessageTimesTable[9];
    data.Time10 = productBuilder.MessageTimes.MessageTimesTable[10];
    data.Time11 = productBuilder.MessageTimes.MessageTimesTable[11];
    data.Time12 = productBuilder.MessageTimes.MessageTimesTable[12];
    data.Time13 = productBuilder.MessageTimes.MessageTimesTable[13];
    data.Time14 = productBuilder.MessageTimes.MessageTimesTable[14];
    data.Time15 = productBuilder.MessageTimes.MessageTimesTable[15];
    data.Time16 = productBuilder.MessageTimes.MessageTimesTable[16];
    data.Time17 = productBuilder.MessageTimes.MessageTimesTable[17];
    data.Time18 = productBuilder.MessageTimes.MessageTimesTable[18];
    data.Time19 = productBuilder.MessageTimes.MessageTimesTable[19];
    data.Time20 = productBuilder.MessageTimes.MessageTimesTable[20];
    data.Time21 = productBuilder.MessageTimes.MessageTimesTable[21];
    data.Time22 = productBuilder.MessageTimes.MessageTimesTable[22];
    data.Time23 = productBuilder.MessageTimes.MessageTimesTable[23];
    data.FirstMessageSender = productBuilder.FirstEncounter.FirstChatterName;
    data.FirstMessageDate = productBuilder.FirstEncounter.FirstMessageDate;
    data.FirstMessageTime = productBuilder.FirstEncounter.FirstMessageTime;
    data.FirstMessageBody = productBuilder.FirstEncounter.FirstMessageBody;
    data.Replier = productBuilder.FirstEncounter.ReplyingChatterName;
    data.ReplierDate = productBuilder.FirstEncounter.ReplyMessageDate;
    data.ReplierTime = productBuilder.FirstEncounter.ReplyMessageTime;
    data.ReplierMessageBody = productBuilder.FirstEncounter.ReplyMessage;
    data.WordIndexCount = productBuilder.TopWords.TopWordsTable.length;    

    productBuilder.SearchRecordArray.forEach(x => {
        if(x.Name == "personal"){
            data.PersonalWord = x.SearchLogs[0].SearchTerm;
            data.PersonalWordCount = x.TotalCount;
        }else if(x.Name == "morning"){
            data.MorningCount = x.TotalCount;
        }else if(x.Name == "night"){
            data.NightCount = x.TotalCount;
        }else if(x.Name == "laugh"){
            data.LaughCount = x.TotalCount;
        }else if (x.Name == "emoji"){
            data.EmojiIndexCount = x.SearchLogs.length;
            for(let i = 0; i++; i < x.SearchLogs.length -1){
                let searchLog = x.SearchLogs[i];
                let searchProp = "Emoji" + (i+1);
                data[searchProp] = searchLog.SearchTerm;
                let countProp = "EmojiCount" + (i+1);
                data[countProp] = searchLog.Count;
            }
        }
    });

    for (let i = 0; i++; productBuilder.TopWords.TopWordsTable.length -1){
        let wordLog = productBuilder.TopWords.TopWordsTable[i];
        let wordProp = "Word" + (i+1);
        data[wordProp] = wordLog.Word;
        let countProp = "WordCount" + (i+1);
        data[countProp] = wordLog.Count;
    }

    return {
        headers:{
            "content-type":"application/json; charset=utf-8",
            "Accept": "application/json",
            "Host": "prod-14.uksouth.logic.azure.com",
        },
        method:"POST",
        body: JSON.stringify(data)
    }
}

export { PopulateProductBuilder, ParseProductBuilder }