import { ProductBuilder } from '../models/productbuilder.js';
import { GenerateChatComposition, GenerateFirstEncounter, GenerateMessageDays, GenerateMessageTimes, GenerateSearchRecord, GenerateTopWords } from './metricmodulecontroller.js';

/**Function to populate a Product Builder - takes a parameter of the FileFormat output*/
async function PopulateProductBuilder (chatMaster, personalWord){
    let chatObjArr = chatMaster.ArrayOfMessageObjs;
    let wholeChatString = chatMaster.WholeChatString;
    let chatComposition = GenerateChatComposition(chatObjArr);
    let fromDateStr = chatObjArr[0].Date;
    let toDateStr = chatObjArr.reverse()[0].Date;
    chatObjArr.reverse(); //Reverse it back
    let timeArray = GenerateMessageTimes(chatObjArr);
    let dayArray = GenerateMessageDays(chatObjArr);
    let firstEncounter = GenerateFirstEncounter(chatObjArr);
    let personalWordSearchRecord = GenerateSearchRecord(chatObjArr, "personal", false, 2, 1, [personalWord]);

    let searchRecordArr = [];
    let laughSR = GenerateSearchRecord(chatObjArr, "laugh", false, 2, 1, null)
    searchRecordArr.push(laughSR);
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "morning", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "night", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "love", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "swear", false, 2, 1, null));
    searchRecordArr.push(GenerateSearchRecord(chatObjArr, "emoji", false, 2, 1, null));
    searchRecordArr.push(personalWordSearchRecord);
    let audioSearchRecord = GenerateSearchRecord(chatObjArr, "audio", false, 2, 1, null);
    audioSearchRecord != null ? searchRecordArr.push(audioSearchRecord) : null;
    let imageSearchRecord = GenerateSearchRecord(chatObjArr, "image", false, 2, 1, null);
    imageSearchRecord != null ? searchRecordArr.push(imageSearchRecord) : null;

    let authors =  [];
    chatComposition.Chatters.forEach(x => authors.push(x.Name));
    let tWtable = GenerateTopWords(wholeChatString, authors);

    //Top Words has to split the whole chat into an array to search, however SearchRecords have to use RegEx, so the personal word
    //can show up with 2 separate counts. To fix this, we default both to the personal word count and re-sort the Top Words table
    tWtable.TopWordsTable.forEach(x => {
        if(x.Word == personalWord){
            x.Count = personalWordSearchRecord.TotalCount;
        }
    });

    tWtable.TopWordsTable.sort((a, b) => b.Count - a.Count);

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

    //formatting for the logic app
    let finalFromDate = fromYear + "-" + fromMonth + "-" + fromDay + "T00:00:00";
    let finalToDate = toYear + "-" + toMonth + "-" + toDay + "T00:00:00";
    
    return new ProductBuilder(chatComposition,finalFromDate,finalToDate,timeArray,dayArray,firstEncounter,tWtable,searchRecordArr,daysDifference,personalWord);
}

/**Parses productBuilder data into a http request */
async function ParseProductBuilder(productBuilder){
    
    let data = {};
    data.ShippingAddress = {
        "First_Name": "MIKE",
        "Address1": "505 TEST ROAD",
        "Phone": "07777777777",
        "City": "London",
        "Zip": "SE3 T2T",
        "Province": "England",
        "Country": "United Kingdom",
        "Last_Name": "TEST SURNAME",
        "Address2": "TEST TOWN",
        "Company": null,
        "Latitude": 53.412287,
        "Longitude": -2.5558833,
        "Name": "TEST FULLNAME",
        "Country_Code": "GB",
        "Province_Code": "ENG"
    };
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
    data.Time0 = productBuilder.MessageTimes.MessageTimesTable[0].Count;
    data.Time1 = productBuilder.MessageTimes.MessageTimesTable[1].Count;
    data.Time2 = productBuilder.MessageTimes.MessageTimesTable[2].Count;
    data.Time3 = productBuilder.MessageTimes.MessageTimesTable[3].Count;
    data.Time4 = productBuilder.MessageTimes.MessageTimesTable[4].Count;
    data.Time5 = productBuilder.MessageTimes.MessageTimesTable[5].Count;
    data.Time6 = productBuilder.MessageTimes.MessageTimesTable[6].Count;
    data.Time7 = productBuilder.MessageTimes.MessageTimesTable[7].Count;
    data.Time8 = productBuilder.MessageTimes.MessageTimesTable[8].Count;
    data.Time9 = productBuilder.MessageTimes.MessageTimesTable[9].Count;
    data.Time10 = productBuilder.MessageTimes.MessageTimesTable[10].Count;
    data.Time11 = productBuilder.MessageTimes.MessageTimesTable[11].Count;
    data.Time12 = productBuilder.MessageTimes.MessageTimesTable[12].Count;
    data.Time13 = productBuilder.MessageTimes.MessageTimesTable[13].Count;
    data.Time14 = productBuilder.MessageTimes.MessageTimesTable[14].Count;
    data.Time15 = productBuilder.MessageTimes.MessageTimesTable[15].Count;
    data.Time16 = productBuilder.MessageTimes.MessageTimesTable[16].Count;
    data.Time17 = productBuilder.MessageTimes.MessageTimesTable[17].Count;
    data.Time18 = productBuilder.MessageTimes.MessageTimesTable[18].Count;
    data.Time19 = productBuilder.MessageTimes.MessageTimesTable[19].Count;
    data.Time20 = productBuilder.MessageTimes.MessageTimesTable[20].Count;
    data.Time21 = productBuilder.MessageTimes.MessageTimesTable[21].Count;
    data.Time22 = productBuilder.MessageTimes.MessageTimesTable[22].Count;
    data.Time23 = productBuilder.MessageTimes.MessageTimesTable[23].Count;
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
            for(let i = 0; i < x.SearchLogs.length; i++){
                let searchLog = x.SearchLogs[i];
                let searchProp = "Emoji" + (i+1);
                data[searchProp] = searchLog.SearchTerm;
                let countProp = "EmojiCount" + (i+1);
                data[countProp] = searchLog.Count;
            }
        }
    });

    for (let i = 0; i < productBuilder.TopWords.TopWordsTable.length; i++){
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