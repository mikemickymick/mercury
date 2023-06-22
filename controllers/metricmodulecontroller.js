import { Chatter } from '../models/chatter.js';
import { SearchLog } from '../models/searchlog.js';
import {
  ChatComposition,
  FirstEncounter,
  MessageDays,
  MessageTimes,
  SearchRecord,
  TopWords
} from '../models/metricmodules.js';
import {
  AudioArray,
  EmojiArray,
  ImageArray,
  LateNightArray,
  LaughArray,
  LoveArray,
  MorningArray,
  NightArray,
  NumberRegEx,
  PunctuationRegEx,
  SkipWords,
  SwearArray
} from '../helpers/searchhelper.js';

function GenerateChatComposition(messageObjectArray) {
  const chatters = [];
  let authorIndex = 0;

  messageObjectArray.forEach((element) => {
    let chatterInArray = false;

    chatters.forEach((x) => {
      if (x.Name === element.Author) {
        chatterInArray = true;
        x.MessageCount += 1;
      }
    });

    if (!chatterInArray) {
      authorIndex++;
      const chatter = new Chatter(authorIndex, element.Author, 1, 0);
      chatters.push(chatter);
    }
  });

  let totalMessages = 0;
  chatters.forEach((m) => {
    totalMessages += m.MessageCount;
  });

  chatters.forEach((y) => {
    y.MessagePercent = Math.round((y.MessageCount / totalMessages) * 100);
  });

  return new ChatComposition(chatters);
}

function GenerateFirstEncounter(chatObjArr) {
  const firstMessage = chatObjArr[0];
  const firstMessageDate = firstMessage.Date;
  const firstMessageTime = firstMessage.Time;
  const firstMessageAuthor = firstMessage.Author;
  let firstMessageBody = firstMessage.MessageBody;

  const replierIndex = chatObjArr.findIndex((x) => x.Author !== firstMessageAuthor);
  const replyMessage = chatObjArr[replierIndex];
  const replyDate = replyMessage.Date;
  const replyTime = replyMessage.Time;
  const replyAuthor = replyMessage.Author;
  let replyMessageBody = replyMessage.MessageBody;

  firstMessageBody = GetMessageComposite(chatObjArr, replierIndex, firstMessageBody);
  replyMessageBody = GetMessageComposite(chatObjArr.slice(replierIndex, 50), 0, replyMessageBody);

  return new FirstEncounter(
    firstMessageDate,
    firstMessageTime,
    firstMessageAuthor,
    firstMessageBody,
    replyDate,
    replyTime,
    replyAuthor,
    replyMessageBody
  );
}

function GenerateSearchRecord(chatObjArr, searchRecordName, required, width, height, searchTermArr) {
  let searchLogs = [];

  switch (searchRecordName) {
    case 'laugh':
      searchTermArr = LaughArray;
      break;
    case 'morning':
      searchTermArr = MorningArray;
      break;
    case 'night':
      searchTermArr = NightArray;
      break;
    case 'audio':
      searchTermArr = AudioArray;
      break;
    case 'image':
      searchTermArr = ImageArray;
      break;
    case 'love':
      searchTermArr = LoveArray;
      break;
    case 'swear':
      searchTermArr = SwearArray;
      break;
    case 'late-night':
      searchTermArr = LateNightArray;
      break;
    case 'emoji':
      searchTermArr = EmojiArray;
      break;
    default:
      // Do nothing
  }

  if (searchRecordName === 'emoji') {
    const unicodeStrings = [];
    searchTermArr.forEach((x) => {
      const instanceRegEx = new RegExp(x.toLowerCase(), 'g');
      const unicodeString = x.codePointAt(0).toString(16);
      const counter = chatObjArr.filter((x) => x.MessageBody.match(instanceRegEx)).length;

      const existingUnicodeString = unicodeStrings.find((v) => v.uniStr === unicodeString);
      if (!existingUnicodeString) {
        unicodeStrings.push({
          emoji: x,
          uniStr: unicodeString,
          emojiCount: counter
        });
      } else {
        existingUnicodeString.emojiCount += counter;
      }
    });

    unicodeStrings.forEach((j) => {
      const searchLog = new SearchLog(j.emoji, j.emojiCount);
      searchLogs.push(searchLog);
    });
  } else {
    searchTermArr.forEach((x) => {
      const instanceRegEx = new RegExp(x.toLowerCase(), 'g');
      const counter = chatObjArr.filter((x) => x.MessageBody.match(instanceRegEx)).length;
      const searchLog = new SearchLog(x, counter);
      searchLogs.push(searchLog);
    });
  }

  let counter = 0;
  let orderedSearchLogs = [];

  if (searchRecordName === 'emoji') {
    searchLogs.sort((a, b) => b.Count - a.Count);
    orderedSearchLogs = searchLogs.slice(0, 15);
  } else {
    searchLogs.forEach((x) => {
      counter += x.Count;
    });
    orderedSearchLogs = searchLogs;
  }

  if (searchRecordName === 'audio' || searchRecordName === 'image') {
    if (counter === 0) {
      return null;
    }
  }

  return new SearchRecord(searchRecordName, required, width, height, orderedSearchLogs, counter);
}

function GenerateMessageDays(chatObjArr) {
  const dayArray = [
    { Day: 'Monday', Count: 0, Percent: 0 },
    { Day: 'Tuesday', Count: 0, Percent: 0 },
    { Day: 'Wednesday', Count: 0, Percent: 0 },
    { Day: 'Thursday', Count: 0, Percent: 0 },
    { Day: 'Friday', Count: 0, Percent: 0 },
    { Day: 'Saturday', Count: 0, Percent: 0 },
    { Day: 'Sunday', Count: 0, Percent: 0 }
  ];
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let totalCount = 0;

  chatObjArr.forEach((x) => {
    const dateString = x.Date;
    const date = parseInt(dateString.split('/')[0]);
    const month = parseInt(dateString.split('/')[1]);
    const year = parseInt(dateString.split('/')[2]);

    const dateBuilder = new Date();
    dateBuilder.setDate(date);
    dateBuilder.setMonth(month - 1);
    dateBuilder.setFullYear(year);

    const day = days[dateBuilder.getDay()];

    dayArray.forEach((y) => (day === y.Day ? y.Count++ : null));
    totalCount++;
  });

  let percentTotal = 0;

  dayArray.forEach((x) => {
    if (dayArray.indexOf(x) === 6) {
      x.Percent = 100 - percentTotal;
    } else {
      x.Percent = Math.round((x.Count / totalCount) * 100);
      percentTotal += x.Percent;
    }
  });

  return new MessageDays(dayArray);
}

function GenerateMessageTimes(chatObjArr) {
  const timeArray = [];

  for (let i = 0; i < 10; i++) {
    timeArray.push({ Hour: `0${i}`, Count: 0 });
  }
  for (let i = 10; i < 24; i++) {
    timeArray.push({ Hour: `${i}`, Count: 0 });
  }

  chatObjArr.forEach((x) => {
    const hour = x.Time.split(':')[0];
    timeArray.forEach((y) => {
      if (hour === y.Hour) {
        y.Count++;
      }
    });
  });

  return new MessageTimes(timeArray);
}

function GenerateTopWords(wholeChatString, namesArray) {
  const topWordsTable = [];
  const punctuationRegEx = new RegExp(PunctuationRegEx, 'g');
  const numberRegEx = new RegExp(NumberRegEx, 'g');
  const newNameArray = [];

  namesArray.forEach((x) => {
    x.split(' ').forEach((y) => newNameArray.push(y));
  });

  const wordsArray = wholeChatString
    .replace(/(’s)/g, '')
    .replace(/('s)/g, '')
    .split(' ');

  const filteredArray = wordsArray.filter(
    (x) =>
      !SkipWords.includes(x) &&
      !EmojiArray.includes(x) &&
      !x.match(punctuationRegEx) &&
      !x.match(numberRegEx) &&
      !newNameArray.includes(x) &&
      x.length < 10
  );

  const counts = {};

  for (const num of filteredArray) {
    counts[num] = counts[num] ? counts[num] + 1 : 1;
  }

  for (const property in counts) {
    topWordsTable.push({ Word: property, Count: counts[property] });
  }

  return new TopWords(topWordsTable.sort((a, b) => b.Count - a.Count).slice(0, 15));
}

export {
  GenerateChatComposition,
  GenerateFirstEncounter,
  GenerateMessageDays,
  GenerateMessageTimes,
  GenerateSearchRecord,
  GenerateTopWords
};
