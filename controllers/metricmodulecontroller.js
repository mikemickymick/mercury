import { Chatter } from '../models/chatter.js';
import { SearchLog } from '../models/searchlog.js';
import { ChatComposition, FirstEncounter, MessageDays, MessageTimes, SearchRecord, TopWords } from '../models/metricmodules.js';
import { AudioArray, EmojiArray, ImageArray, LateNightArray, LaughArray, LoveArray, MorningArray, NightArray, NumberRegEx, PunctuationRegEx, SkipWords, SwearArray } from '../helpers/searchhelper.js';

/**Generates the Chat composition from an array of Message objects */
function GenerateChatComposition(messageObjectArray) {
    const chatters = new Map();
    let authorIndex = 0;
    
    for (const element of messageObjectArray) {
        const author = element.Author;
        if (chatters.has(author)) {
            const chatter = chatters.get(author);
            chatter.MessageCount += 1;
        } else {
            authorIndex++;
            const chatter = new Chatter(authorIndex, author, 1, 0);
            chatters.set(author, chatter);
        }
    }
    
    const totalMessages = messageObjectArray.length;
    for (const chatter of chatters.values()) {
        chatter.MessagePercent = Math.round((chatter.MessageCount / totalMessages) * 100);
    }
    
    return new ChatComposition([...chatters.values()]);
}

/**Generates a First Encounter module */
function GenerateFirstEncounter(chatObjArr) {
    const firstMessage = chatObjArr[0];
    const firstMessageDate = firstMessage.Date;
    const firstMessageTime = firstMessage.Time;
    const firstMessageAuthor = firstMessage.Author;
    let firstMessageBody = firstMessage.MessageBody;
    
    const replierIndex = chatObjArr.findIndex(x => x.Author !== firstMessageAuthor);
    const replyMessage = chatObjArr[replierIndex];
    const replyDate = replyMessage.Date;
    const replyTime = replyMessage.Time;
    const replyAuthor = replyMessage.Author;
    let replyMessageBody = replyMessage.MessageBody;
    
    firstMessageBody = GetMessageComposite(chatObjArr, replierIndex, firstMessageBody);
    replyMessageBody = GetMessageComposite(chatObjArr.slice(replierIndex, 50), chatObjArr.findIndex(x => x.Author !== replyAuthor), replyMessageBody);
    
    return new FirstEncounter(firstMessageDate, firstMessageTime, firstMessageAuthor, firstMessageBody, replyDate, replyTime, replyAuthor, replyMessageBody);
}

/**Generates a Search Record */
function GenerateSearchRecord(chatObjArr, searchRecordName, required, width, height, searchTermArr) {
    let searchLogs = [];
    
    switch (searchRecordName) {
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
            // Do nothing
    }
    
    if (searchRecordName === "emoji") {
        const unicodeStrings = new Map();
        
        for (const x of searchTermArr) {
            const instanceRegEx = new RegExp(x.toLowerCase(), "g");
            const unicodeString = x.codePointAt(0).toString(16);
            const counter = chatObjArr.filter(x => x.MessageBody.match(instanceRegEx)).length;
            
            if (unicodeStrings.has(unicodeString)) {
                unicodeStrings.set(unicodeString, unicodeStrings.get(unicodeString) + counter);
            } else {
                unicodeStrings.set(unicodeString, counter);
            }
        }
        
        for (const [uniStr, emojiCount] of unicodeStrings.entries()) {
            searchLogs.push(new SearchLog(EmojiArray[parseInt(uniStr, 16)], emojiCount));
        }
    } else {
        for (const x of searchTermArr) {
            const instanceRegEx = new RegExp(x.toLowerCase(), "g");
            const counter = chatObjArr.filter(x => x.MessageBody.match(instanceRegEx)).length;
            searchLogs.push(new SearchLog(x, counter));
        }
    }
    
    let counter = 0;
    let orderedSearchLogs = [];
    if (searchRecordName === "emoji") {
        searchLogs.sort((a, b) => b.Count - a.Count);
        orderedSearchLogs = searchLogs.slice(0, 15);
    } else {
        for (const log of searchLogs) {
            counter += log.Count;
        }
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
function GenerateMessageDays(chatObjArr) {
    const dayArray = [
        { Day: "Monday", Count: 0, Percent: 0 },
        { Day: "Tuesday", Count: 0, Percent: 0 },
        { Day: "Wednesday", Count: 0, Percent: 0 },
        { Day: "Thursday", Count: 0, Percent: 0 },
        { Day: "Friday", Count: 0, Percent: 0 },
        { Day: "Saturday", Count: 0, Percent: 0 },
        { Day: "Sunday", Count: 0, Percent: 0 }
    ];
    
    const totalCount = chatObjArr.length;
    
    for (const x of chatObjArr) {
        const [day, , , year] = x.Date.split('/');
        const dateBuilder = new Date(year, parseInt(day) - 1);
        const dayOfWeek = dateBuilder.toLocaleDateString('en-US', { weekday: 'long' });
        
        const foundDay = dayArray.find(y => y.Day === dayOfWeek);
        if (foundDay) {
            foundDay.Count++;
        }
    }
    
    let percentTotal = 0;
    for (const day of dayArray) {
        if (dayArray.indexOf(day) === 6) {
            day.Percent = 100 - percentTotal;
        } else {
            day.Percent = Math.round((day.Count / totalCount) * 100);
            percentTotal += day.Percent;
        }
    }
    
    return new MessageDays(dayArray);
}

/**Generates a Message Times metric module */
function GenerateMessageTimes(chatObjArr) {
    const timeArray = Array.from({ length: 24 }, (_, i) => ({ Hour: i.toString().padStart(2, '0'), Count: 0 }));
    
    for (const x of chatObjArr) {
        const hour = parseInt(x.Time.split(':')[0]);
        timeArray[hour].Count++;
    }
    
    return new MessageTimes(timeArray);
}

/**Generates a Top Words metric module */
function GenerateTopWords(wholeChatString, namesArray) {
    const topWordsTable = [];
    const punctuationRegEx = new RegExp(PunctuationRegEx, 'g');
    const numberRegEx = new RegExp(NumberRegEx, 'g');
    const newNameArray = namesArray.flatMap(x => x.split(' '));
    
    // Split entire chat into words Array
    const wordsArray = wholeChatString.replace(/(’s)/g, '').replace(/('s)/g, '').split(' ');

    // Making sure we don't include punctuation, emojis, numbers, or skipwords in this table
    const filteredArray = wordsArray.filter(x => !SkipWords.includes(x) && !EmojiArray.includes(x) && !x.match(punctuationRegEx) && !x.match(numberRegEx) && !newNameArray.includes(x) && x.length < 10);
    const counts = {};
    for (const num of filteredArray) {
        counts[num] = counts[num] ? counts[num] + 1 : 1;
    }
    
    for (const property in counts) {
        topWordsTable.push({ Word: property, Count: counts[property] });
    }

    return new TopWords(topWordsTable.sort((a, b) => b.Count - a.Count).slice(0, 15));
}

/**Generates a composite of all messages until the next author in a chat */
function GetMessageComposite(chatObjArr, replierIndex, message) {
    if (replierIndex > 1) {
        for (let x = 1; x < replierIndex; x++) {
            const currentMessage = chatObjArr[x];

            const puncRegEx = new RegExp(PunctuationRegEx, 'g');

            if (message.match(puncRegEx)) {
                message += ` ${currentMessage.MessageBody}`;
            } else {
                message += `. ${currentMessage.MessageBody}`;
            }
        }
    }
    return message;
}

export {
    GenerateChatComposition,
    GenerateFirstEncounter,
    GenerateMessageDays,
    GenerateMessageTimes,
    GenerateSearchRecord,
    GenerateTopWords
};