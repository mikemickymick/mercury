import { ProductBuilder } from '../models/productbuilder.js';
import { GenerateChatComposition, GenerateFirstEncounter, GenerateMessageDays, GenerateMessageTimes, GenerateSearchRecord, GenerateTopWords } from './metricmodulecontroller.js';

/**Function to populate a Product Builder - takes a parameter of the FileFormat output*/
async function PopulateProductBuilder (chatMaster, personalWord){
    let chatObjArr = chatMaster.ArrayOfMessageObjs;
    let wholeChatString = chatMaster.WholeChatString;
    let chatComposition = GenerateChatComposition(chatObjArr);
    let timeArray = GenerateMessageTimes(chatObjArr);
    let dayArray = GenerateMessageDays(chatObjArr);
    let firstEncounter = GenerateFirstEncounter(chatObjArr);
    let personalWordSearchRecord = GenerateSearchRecord(chatObjArr, "personal", false, 2, 1, [personalWord]);
    let fromDateStr = firstEncounter.FirstMessageDate;
    let toDateStr = chatObjArr.reverse()[0].Date;
    chatObjArr.reverse(); //Reverse it back

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
async function ParseProductBuilder(productBuilder) {
  const data = {
    ShippingAddress: {
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
    },
    OrderNumber: "xxxx",
    ProductName: "test product",
    DateFrom: productBuilder.FromDate,
    DateTo: productBuilder.ToDate,
    AuthorCount: productBuilder.ChatComposition.Chatters.length,
    AuthorDataList: productBuilder.ChatComposition.Chatters,
    WordIndexCount: productBuilder.TopWords.TopWordsTable.length,
    FirstMessageSender: productBuilder.FirstEncounter.FirstChatterName,
    FirstMessageDate: productBuilder.FirstEncounter.FirstMessageDate,
    FirstMessageTime: productBuilder.FirstEncounter.FirstMessageTime,
    FirstMessageBody: productBuilder.FirstEncounter.FirstMessageBody,
    Replier: productBuilder.FirstEncounter.ReplyingChatterName,
    ReplierDate: productBuilder.FirstEncounter.ReplyMessageDate,
    ReplierTime: productBuilder.FirstEncounter.ReplyMessageTime,
    ReplierMessageBody: productBuilder.FirstEncounter.ReplyMessage
  };

  const messageDaysTable = productBuilder.MessageDays.MessageDaysTable;
  const messageTimesTable = productBuilder.MessageTimes.MessageTimesTable;
  const topWordsTable = productBuilder.TopWords.TopWordsTable;

  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  dayNames.forEach((day, index) => {
    data[`${day}Count`] = messageDaysTable[index].Count;
    data[`${day}Percent`] = messageDaysTable[index].Percent;
  });

  for (let i = 0; i < 24; i++) {
    data[`Time${i}`] = messageTimesTable[i].Count;
  }

  productBuilder.SearchRecordArray.forEach((record) => {
    const name = record.Name;

    const recordMappings = {
      personal: { prop: "PersonalWord", countProp: "PersonalWordCount", indexCountProp: "TotalCount" },
      morning: { countProp: "MorningCount" },
      night: { countProp: "NightCount" },
      laugh: { countProp: "LaughCount" },
      emoji: {
        indexCountProp: "SearchLogs",
        prefix: "Emoji",
        countPrefix: "EmojiCount"
      }
    };

    if (name in recordMappings) {
      const mapping = recordMappings[name];

      if (mapping.prop) {
        data[mapping.prop] = record[mapping.indexCountProp][0].SearchTerm;
      }
      if (mapping.countProp) {
        data[mapping.countProp] = record.TotalCount;
      }
      if (mapping.indexCountProp) {
        const logs = record[mapping.indexCountProp];
        logs.forEach((log, i) => {
          data[`${mapping.prefix}${i + 1}`] = log.SearchTerm;
          data[`${mapping.countPrefix}${i + 1}`] = log.Count;
        });
      }
    }
  });

  topWordsTable.forEach((wordLog, i) => {
    data[`Word${i + 1}`] = wordLog.Word;
    data[`WordCount${i + 1}`] = wordLog.Count;
  });

  return {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "Accept": "application/json",
      "Host": "prod-14.uksouth.logic.azure.com",
    },
    method: "POST",
    body: JSON.stringify(data)
  };
}


export { PopulateProductBuilder, ParseProductBuilder }