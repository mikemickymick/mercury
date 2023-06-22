import { ProductBuilder } from '../models/productbuilder.js';
import {
  GenerateChatComposition,
  GenerateFirstEncounter,
  GenerateMessageDays,
  GenerateMessageTimes,
  GenerateSearchRecord,
  GenerateTopWords
} from './metricmodulecontroller.js';

/**Function to populate a Product Builder - takes a parameter of the FileFormat output.*/
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

  const searchRecordArr = [];
  searchRecordArr.push(GenerateSearchRecord(chatObjArr, 'laugh', false, 2, 1, null));
  searchRecordArr.push(GenerateSearchRecord(chatObjArr, 'morning', false, 2, 1, null));
  searchRecordArr.push(GenerateSearchRecord(chatObjArr, 'night', false, 2, 1, null));
  searchRecordArr.push(GenerateSearchRecord(chatObjArr, 'love', false, 2, 1, null));
  searchRecordArr.push(GenerateSearchRecord(chatObjArr, 'swear', false, 2, 1, null));
  searchRecordArr.push(GenerateSearchRecord(chatObjArr, 'emoji', false, 2, 1, null));
  searchRecordArr.push(personalWordSearchRecord);

  const audioSearchRecord = GenerateSearchRecord(chatObjArr, 'audio', false, 2, 1, null);
  if (audioSearchRecord != null) {
    searchRecordArr.push(audioSearchRecord);
  }

  const imageSearchRecord = GenerateSearchRecord(chatObjArr, 'image', false, 2, 1, null);
  if (imageSearchRecord != null) {
    searchRecordArr.push(imageSearchRecord);
  }

  const authors = chatComposition.Chatters.map(x => x.Name);
  const tWtable = GenerateTopWords(wholeChatString, authors);

  tWtable.TopWordsTable.forEach(x => {
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

  const finalFromDate = `${fromYear}-${fromMonth}-${fromDay}T00:00:00`;
  const finalToDate = `${toYear}-${toMonth}-${toDay}T00:00:00`;

  return new ProductBuilder(
    chatComposition,
    finalFromDate,
    finalToDate,
    timeArray,
    dayArray,
    firstEncounter,
    tWtable,
    searchRecordArr,
    daysDifference,
    personalWord
  );
}

/**
 * Converts a Product Builder into a http request
 * @param {ProductBuilder} productBuilder - Product builder
 * @returns {Promise<Object>} - Promise that resolves to a http request containing all information needed
 */
async function ParseProductBuilder(productBuilder) {
  const data = {};
  data.ShippingAddress = {
    First_Name: 'MIKE',
    Address1: '505 TEST ROAD',
    Phone: '07777777777',
    City: 'London',
    Zip: 'SE3 T2T',
    Province: 'England',
    Country: 'United Kingdom',
    Last_Name: 'TEST SURNAME',
    Address2: 'TEST TOWN',
    Company: null,
    Latitude: 53.412287,
    Longitude: -2.5558833,
    Name: 'TEST FULLNAME',
    Country_Code: 'GB',
    Province_Code: 'ENG'
  };
  data.OrderNumber = 'xxxx';
  data.ProductName = 'test product';
  data.DateFrom = productBuilder.FromDate;
  data.DateTo = productBuilder.ToDate;
  data.AuthorCount = productBuilder.ChatComposition.Chatters.length;
  data.AuthorDataList = productBuilder.ChatComposition.Chatters;

  for (let i = 0; i < productBuilder.MessageDays.MessageDaysTable.length; i++) {
    const day = productBuilder.MessageDays.MessageDaysTable[i];
    data[`${day.DayOfWeek}Count`] = day.Count;
    data[`${day.DayOfWeek}Percent`] = day.Percent;
  }

  for (let i = 0; i < productBuilder.MessageTimes.MessageTimesTable.length; i++) {
    const time = productBuilder.MessageTimes.MessageTimesTable[i];
    data[`Time${i}`] = time.Count;
  }

  data.FirstMessageSender = productBuilder.FirstEncounter.FirstChatterName;
  data.FirstMessageDate = productBuilder.FirstEncounter.FirstMessageDate;
  data.FirstMessageTime = productBuilder.FirstEncounter.FirstMessageTime;
  data.FirstMessageBody = productBuilder.FirstEncounter.FirstMessageBody;
  data.Replier = productBuilder.FirstEncounter.ReplyingChatterName;
  data.ReplierDate = productBuilder.FirstEncounter.ReplyMessageDate;
  data.ReplierTime = productBuilder.FirstEncounter.ReplyMessageTime;
  data.ReplierMessageBody = productBuilder.FirstEncounter.ReplyMessage;
  data.WordIndexCount = productBuilder.TopWords.TopWordsTable.length;

  for (let i = 0; i < productBuilder.TopWords.TopWordsTable.length; i++) {
    const wordLog = productBuilder.TopWords.TopWordsTable[i];
    data[`Word${i + 1}`] = wordLog.Word;
    data[`WordCount${i + 1}`] = wordLog.Count;
  }

  productBuilder.SearchRecordArray.forEach(x => {
    if (x.Name === 'personal') {
      data.PersonalWord = x.SearchLogs[0].SearchTerm;
      data.PersonalWordCount = x.TotalCount;
    } else if (x.Name === 'morning') {
      data.MorningCount = x.TotalCount;
    } else if (x.Name === 'night') {
      data.NightCount = x.TotalCount;
    } else if (x.Name === 'laugh') {
      data.LaughCount = x.TotalCount;
    } else if (x.Name === 'emoji') {
      data.EmojiIndexCount = x.SearchLogs.length;
      for (let i = 0; i < x.SearchLogs.length; i++) {
        const searchLog = x.SearchLogs[i];
        const searchProp = `Emoji${i + 1}`;
        const countProp = `EmojiCount${i + 1}`;
        data[searchProp] = searchLog.SearchTerm;
        data[countProp] = searchLog.Count;
      }
    }
  });

  return {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      Accept: 'application/json',
      Host: 'prod-14.uksouth.logic.azure.com'
    },
    method: 'POST',
    body: JSON.stringify(data)
  };
}

export { PopulateProductBuilder, ParseProductBuilder };