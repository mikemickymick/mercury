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
function GenerateSearchRecord(chatObjArr, searchRecordName, required, width, height, searchTermArr){
    let searchLogs = new Array();

    switch(searchRecordName){
        case "laugh":
            searchTermArr = LaughArray;
            break;
        case "morning":
            searchTermArr = MorningArray;
            break;
        case "night":
            searchTermArr = NightArray;
            break;
        case "audio":
            searchTermArr = AudioArray;
            break;
        case "image":
            searchTermArr = ImageArray;
            break;
        case "love":
            searchTermArr = LoveArray;
            break;
        case "swear":
            searchTermArr = SwearArray;
            break;
        case "late-night":
            searchTermArr = LateNightArray;
            break;
        case "emoji":
            searchTermArr = EmojiArray;
            break;
        default:
            //Do nothing
    }

    if (searchRecordName == "emoji"){
        let unicodeStrings = new Array();
        searchTermArr.forEach(x => {
            let instanceRegEx = new RegExp(x.toLowerCase(),"g");
            let unicodeString = x.codePointAt(0).toString(16);
            let counter = chatObjArr.filter(x => x.MessageBody.match(instanceRegEx)).length;

            if (!unicodeStrings.find(v => v.uniStr === unicodeString)){
                unicodeStrings.push({
                    emoji: x,
                    uniStr: unicodeString,
                    emojiCount: counter
                });
            } else {
                unicodeStrings.find((o, i) => {
                    if (o.uniStr === unicodeString) {
                        unicodeStrings[i] = { emoji: o.emoji, uniStr: o.uniStr, emojiCount: o.emojiCount + counter };
                        return true; // stop searching
                    }
                });
            }
            
        });

        unicodeStrings.forEach(j => {
            let searchLog = new SearchLog(j.emoji, j.emojiCount);
            searchLogs.push(searchLog);
        })

    }else{
        searchTermArr.forEach(x => {
            let instanceRegEx = new RegExp(x.toLowerCase(),"g");
            let counter = chatObjArr.filter(x => x.MessageBody.match(instanceRegEx)).length;
            let searchLog = new SearchLog(x, counter);
            searchLogs.push(searchLog);
        });
    }

    let counter = 0;
    let orderedSearchLogs = new Array();
    if(searchRecordName == "emoji"){
        searchLogs.sort((a,b) => {
            return b.Count - a.Count;
        });
        for(let i = 0; i < 15; i++){
            orderedSearchLogs.push(searchLogs[i]);
        }
    } else {
        searchLogs.forEach(x =>{
            counter += x.Count
        });
        orderedSearchLogs = searchLogs;
    }

    if(searchRecordName == "audio" || searchRecordName == "image"){
        if(counter == 0){
            return null;
        }else{
            return new SearchRecord(searchRecordName, required, width, height, orderedSearchLogs, counter);
        }
    }else{
        return new SearchRecord(searchRecordName, required, width, height, orderedSearchLogs, counter);
    }
}

/**Generates a Message Days metric module */
function GenerateMessageDays(chatObjArr) {
    const dayMap = new Map([
      ["Sunday", { Day: "Sunday", Count: 0, Percent: 0 }],
      ["Monday", { Day: "Monday", Count: 0, Percent: 0 }],
      ["Tuesday", { Day: "Tuesday", Count: 0, Percent: 0 }],
      ["Wednesday", { Day: "Wednesday", Count: 0, Percent: 0 }],
      ["Thursday", { Day: "Thursday", Count: 0, Percent: 0 }],
      ["Friday", { Day: "Friday", Count: 0, Percent: 0 }],
      ["Saturday", { Day: "Saturday", Count: 0, Percent: 0 }],
    ]);
  
    let totalCount = 0;
  
    chatObjArr.forEach((message) => {
      const dateString = message.Date;
      const [date, month, year] = dateString.split("/");
  
      const dateBuilder = new Date(year, month - 1, date);
      const day = dateBuilder.toLocaleDateString("en-US", { weekday: "long" });
  
      const dayObj = dayMap.get(day);
      if (dayObj) {
        dayObj.Count++;
      }
      totalCount++;
    });
  
    let percentTotal = 0;
    const dayArray = Array.from(dayMap.values());
    dayArray.forEach((dayObj, index) => {
      if (index === 6) {
        dayObj.Percent = 100 - percentTotal;
      } else {
        dayObj.Percent = Math.round((dayObj.Count / totalCount) * 100);
        percentTotal += dayObj.Percent;
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