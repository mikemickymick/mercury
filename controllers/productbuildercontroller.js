import { ProductBuilder } from '../models/productbuilder.js';
import { GenerateChatComposition, GenerateFirstEncounter, GenerateMessageDays, GenerateMessageTimes, GenerateSearchRecord, GenerateTopWords } from './metricmodulecontroller.js';

/**Function to populate a Product Builder - takes a parameter of the FileFormat output*/
async function PopulateProductBuilder(chatMaster, personalWord) {
  const {
    ArrayOfMessageObjs,
    WholeChatString
  } = chatMaster;

  const chatComposition = GenerateChatComposition(ArrayOfMessageObjs);
  const timeArray = GenerateMessageTimes(ArrayOfMessageObjs);
  const dayArray = GenerateMessageDays(ArrayOfMessageObjs);
  const firstEncounter = GenerateFirstEncounter(ArrayOfMessageObjs);
  const personalWordSearchRecord = GenerateSearchRecord(ArrayOfMessageObjs, "personal", false, 2, 1, [personalWord]);
  const fromDateStr = firstEncounter.FirstMessageDate;
  const toDateStr = ArrayOfMessageObjs[ArrayOfMessageObjs.length - 1].Date;

  const searchRecordArr = [];
  const searchRecordNames = ["laugh", "emoji"];
  searchRecordNames.forEach((name) => {
    const record = GenerateSearchRecord(ArrayOfMessageObjs, name, false, 2, 1, null);
    if (record) {
      searchRecordArr.push(record);
    }
  });
  searchRecordArr.push(personalWordSearchRecord);

  const authors = chatComposition.Chatters.map(x => x.Name);
  const tWtable = GenerateTopWords(WholeChatString, authors);

  // Set personal word count in the top words table
  tWtable.TopWordsTable.forEach((x) => {
    if (x.Word === personalWord) {
      x.Count = personalWordSearchRecord.TotalCount;
    }
  });

  tWtable.TopWordsTable.sort((a, b) => b.Count - a.Count);

  const [fromDay, fromMonth, fromYear] = fromDateStr.split('/');
  const fromDate = new Date(fromYear, fromMonth - 1, fromDay);

  const [toDay, toMonth, toYear] = toDateStr.split('/');
  const toDate = new Date(toYear, toMonth - 1, toDay);

  const daysDifference = Math.round((toDate - fromDate) / 1000 / 60 / 60 / 24);

  return new ProductBuilder(
    chatComposition,
    fromDateStr,
    toDateStr,
    timeArray,
    dayArray,
    firstEncounter,
    tWtable,
    searchRecordArr,
    daysDifference,
    personalWord
  );
}

/**Parses productBuilder data into a http request */
async function ParseProductBuilder(productBuilder){
    
    let data = {};
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