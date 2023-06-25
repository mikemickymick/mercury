import { Chatter } from '../models/chatter.js';
import { SearchLog } from '../models/searchlog.js';
import { ChatComposition, FirstEncounter, MessageDays, MessageTimes, SearchRecord, TopWords } from '../models/metricmodules.js';
import { AudioArray, EmojiArray, ImageArray, LateNightArray, LaughArray, LoveArray, MorningArray, NightArray, PunctuationRegEx, SkipWords, SwearArray } from '../helpers/searchhelper.js';

/**Generates the Chat composition from an array of Message objects */
function GenerateChatComposition(messageObjectArray) {
    let chatters = [];
    let authorIndex = 0;
  
    for (const element of messageObjectArray) {
      let chatterInArray = false;
  
      for (const x of chatters) {
        if (x.Name === element.Author) {
          chatterInArray = true;
          x.MessageCount += 1;
        }
      }
  
      if (!chatterInArray) {
        authorIndex++;
        let chatter = new Chatter(authorIndex, element.Author, 1, 0);
        chatters.push(chatter);
      }
    }
  
    let totalMessages = 0;
    for (const m of chatters) {
      totalMessages += m.MessageCount;
    }
  
    for (const y of chatters) {
      y.MessagePercent = Math.round((y.MessageCount / totalMessages) * 100);
    }
  
    return new ChatComposition(chatters);
  }

/**Generates a First Encounter module */
function GenerateFirstEncounter(chatObjArr){
    let firstMessage = chatObjArr[0];
    let firstMessageDate = firstMessage["Date"];
    let firstMessageTime = firstMessage["Time"];
    let firstMessageAuthor = firstMessage["Author"];
    let firstMessageBody = firstMessage["MessageBody"];

    let replierIndex = chatObjArr.indexOf(chatObjArr.find(x => x.Author != firstMessageAuthor));
    let replyMessage = chatObjArr[replierIndex];
    let replyDate = replyMessage["Date"];
    let replyTime = replyMessage["Time"];
    let replyAuthor = replyMessage["Author"];
    let replyMessageBody = replyMessage["MessageBody"];

    let arrFromSecondAuth = chatObjArr.slice(replierIndex,50);
    let thirdAuthorIndex = arrFromSecondAuth.indexOf(arrFromSecondAuth.find(x => x.Author != replyAuthor));

    firstMessageBody = GetMessageComposite(chatObjArr, replierIndex, firstMessageBody);
    replyMessageBody = GetMessageComposite(arrFromSecondAuth, thirdAuthorIndex, replyMessageBody);

    return new FirstEncounter(firstMessageDate, firstMessageTime, firstMessageAuthor, firstMessageBody, replyDate, replyTime, replyAuthor, replyMessageBody);
}

/**Generates a Search Record */
function GenerateSearchRecord(chatObjArr, searchRecordName, required, width, height, searchTermArr) {
    let searchTermMap;
  
    switch (searchRecordName) {
      case "laugh":
        searchTermMap = LaughMap;
        break;
      case "morning":
        searchTermMap = MorningMap;
        break;
      case "night":
        searchTermMap = NightMap;
        break;
      case "audio":
        searchTermMap = AudioMap;
        break;
      case "image":
        searchTermMap = ImageMap;
        break;
      case "love":
        searchTermMap = LoveMap;
        break;
      case "swear":
        searchTermMap = SwearMap;
        break;
      case "late-night":
        searchTermMap = LateNightMap;
        break;
      case "emoji":
        searchTermMap = new Map();
        searchTermArr.forEach((emoji) => {
          const instanceRegEx = new RegExp(emoji.toLowerCase(), "g");
          const counter = chatObjArr.filter((message) => message.MessageBody.match(instanceRegEx)).length;
  
          if (searchTermMap.has(emoji)) {
            const existingCount = searchTermMap.get(emoji);
            searchTermMap.set(emoji, existingCount + counter);
          } else {
            searchTermMap.set(emoji, counter);
          }
        });
        break;
      default:
        // Do nothing
    }
  
    const searchLogs = Array.from(searchTermMap, ([term, count]) => new SearchLog(term, count));
    let orderedSearchLogs;
    let counter = 0;
  
    if (searchRecordName === "emoji") {
      searchLogs.sort((a, b) => b.Count - a.Count);
      orderedSearchLogs = searchLogs.slice(0, 15);
    } else {
      searchLogs.forEach((log) => {
        counter += log.Count;
      });
      orderedSearchLogs = searchLogs;
    }
  
    if (searchRecordName === "audio" || searchRecordName === "image") {
      if (counter === 0) {
        return null;
      }
    }
  
    return new SearchRecord(searchRecordName, required, width, height, orderedSearchLogs, counter);
  }  

/**Generates a Message Days metric module */
function GenerateMessageDays(chatObjArr){
    let dayArray = [{Day: "Monday", Count: 0, Percent: 0}, {Day: "Tuesday", Count: 0, Percent: 0}, {Day: "Wednesday", Count: 0, Percent: 0}, {Day: "Thursday", Count: 0, Percent: 0}, {Day: "Friday", Count: 0, Percent: 0}, {Day: "Saturday", Count: 0, Percent: 0}, {Day: "Sunday", Count: 0, Percent: 0}];
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let totalCount = 0;

    chatObjArr.forEach(x => {
        let dateString = x.Date;
        let date = parseInt(dateString.split('/')[0]);
        let month = parseInt(dateString.split('/')[1]);
        let year = parseInt(dateString.split('/')[2]);

        let dateBuilder = new Date();
        dateBuilder.setDate(date);
        dateBuilder.setMonth(month- 1);
        dateBuilder.setFullYear(year);
        
        let day = days[dateBuilder.getDay()];

        dayArray.forEach(y => day === y.Day ? y.Count ++ : null);
        totalCount ++;
    });

    let percentTotal = 0;
    dayArray.forEach(x => {
        if(dayArray.indexOf(x) == 6){
            x.Percent = 100 - percentTotal;
        }else{
            x.Percent = Math.round((x.Count / totalCount) * 100);
            percentTotal += x.Percent;
        }
    });

    return new MessageDays(dayArray);
}

/**Generates a Message Times metric module */
function GenerateMessageTimes(chatObjArr){
    let timeArray= [];
    for(let i = 0; i <10; i++){
        timeArray.push({Hour: "0" + i.toString(), Count: 0});
    }
    for(let i = 10; i <24; i++){
        timeArray.push({Hour: i.toString(), Count: 0});
    }

    chatObjArr.forEach(x => {
        let hour = x.Time.split(':')[0];
        timeArray.forEach(y => {
            if(hour === y.Hour){
                y.Count ++;
            }
        });
    });

    return new MessageTimes(timeArray);
}

/**Generates a Top Words metric module */
function GenerateTopWords(wholeChatString, namesArray) {
    const topWordsTable = [];
    const punctuationRegEx = /[!?,.:;_)]$/g;
    const numberRegEx = /([0-9])+/g;
    const newNameSet = new Set();
    const filteredArray = [];
    const counts = new Map();
  
    // Prepare the new name set
    namesArray.forEach((name) => {
      name.split(" ").forEach((word) => newNameSet.add(word));
    });
  
    // Split entire chat into words array
    const wordsArray = wholeChatString.replace(/(’s)/g,"").replace(/('s)/g,"").split(' ');
  
    // Filter out unwanted words
    wordsArray.forEach((word) => {
      if (
        word.length < 10 &&
        !SkipWords.includes(word) &&
        !EmojiArray.includes(word) &&
        !word.match(punctuationRegEx) &&
        !word.match(numberRegEx) &&
        !newNameSet.has(word)
      ) {
        filteredArray.push(word);
      }
    });
  
    // Count word occurrences
    filteredArray.forEach((word) => {
      counts.set(word, (counts.get(word) || 0) + 1);
    });
  
    // Convert the map to an array of objects
    counts.forEach((count, word) => {
      topWordsTable.push({ Word: word, Count: count });
    });
  
    // Sort and get the top 15 words
    topWordsTable.sort((a, b) => b.Count - a.Count);
    topWordsTable.length = Math.min(topWordsTable.length, 15);
  
    return new TopWords(topWordsTable);
  }

/**Generates a composite of all messages until the next author in a chat */
function GetMessageComposite(chatObjArr, replierIndex, message) {
    if (replierIndex > 1) {
      const messageBodies = chatObjArr
        .slice(1, replierIndex)
        .map((currentMessage) => currentMessage["MessageBody"]);
  
      if (messageBodies.length > 0) {
        const joinedMessageBodies = messageBodies.join(". ");
        const puncRegEx = new RegExp(PunctuationRegEx, "g");
  
        if (message.match(puncRegEx)) {
          message += " " + joinedMessageBodies;
        } else {
          message += ". " + joinedMessageBodies;
        }
      }
    }
  
    return message;
  }  

export {GenerateChatComposition, GenerateFirstEncounter, GenerateMessageDays, GenerateMessageTimes, GenerateSearchRecord, GenerateTopWords};