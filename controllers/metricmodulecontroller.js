import { Chatter } from '../models/chatter.js';
import { SearchLog } from '../models/searchlog.js';
import { FirstEncounter, SearchRecord, TopWords } from '../models/metricmodules.js';
import { AudioArray, EmojiArray, ImageArray, LateNightArray, LaughArray, LoveArray, MorningArray, NightArray, NumberRegEx, PunctuationRegEx, SkipWords, SwearArray } from '../helpers/searchhelper.js';

/**Generates the Chat composition from an array of Message objects */
function GenerateChatComposition(messageObjectArray){
    let chatters = new Array();
    let authorIndex = 0;
    messageObjectArray.forEach(element => {
        let chatterInArray = false;
        chatters.forEach(x => {
            if(x.Author == element.Author){
                chatterInArray = true;
                x.MessageCount += 1;
            }
        });
        if(!chatterInArray){
            authorIndex ++;
            let chatter = new Chatter(authorIndex, element.Author, 1, 0);
            chatters.push(chatter);
        }
    });            

    //Add percentages
    let totalMessages = 0;
    chatters.forEach(m => {
        totalMessages += m.MessageCount;
    });
    chatters.forEach(y => {
        y.MessagePercent = Math.round((y.MessageCount / totalMessages) * 100);
    });

    return chatters;
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

    searchTermArr.forEach(x => {
        let instanceRegEx = new RegExp(x.toLowerCase(),"g");
        let counter = chatObjArr.filter(x => x.MessageBody.match(instanceRegEx)).length;
        let searchLog = new SearchLog(x, counter);
        searchLogs.push(searchLog);
    });

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

    return new SearchRecord(searchRecordName, required, width, height, orderedSearchLogs, counter);
}

/**Generates a Message Times metric module */
function GenerateMessageTimes(chatObjArr){
    let timeArray= [];

    //Add 0 prefix
            for(let i = 0; i <10; i++){
                timeArray.push({Hour: "0" + i.toString(), Count: 0});
            }
            for(let i = 10; i <24; i++){
                timeArray.push({Hour: i.toString(), Count: 0});
            }
}

/**Generates a Top Words metric module */
function GenerateTopWords(wholeChatString, namesArray){
    let topWordsTable = new Array();
    let punctuationRegEx = new RegExp(PunctuationRegEx, "g");
    let numberRegEx = new RegExp(NumberRegEx, "g");

    //Split entire chat into words Array
    let wordsArray = wholeChatString.split(' ');

    //Making sure we don't include punctuation, emojis, numbers, or skipwords in this table
    let filteredArray = wordsArray.filter(x => !SkipWords.includes(x) && !EmojiArray.includes(x) && !x.match(punctuationRegEx) && !x.match(numberRegEx) && !namesArray.includes(x));
    let counts = {};
    for (const num of filteredArray) {
        counts[num] = counts[num] ? counts[num] + 1 : 1;
    }
    
    for (const property in counts) {
	    topWordsTable.push({Word: property, Count: counts[property]});
    }

    return new TopWords(topWordsTable.sort((a, b) => b.Count - a.Count).slice(0,15));
}

/**Generates a composite of all messages until the next author in a chat */
function GetMessageComposite(chatObjArr, replierIndex, message){
    if(replierIndex > 1){
        for(let x = 1; x < replierIndex; x++){
            let currentMessage = chatObjArr[x];

            let puncRegEx = new RegExp(PunctuationRegEx,"g");

            if(message.match(puncRegEx)){
                message += " " + currentMessage["MessageBody"];
            }else{
                message += ". " + currentMessage["MessageBody"];
            }
        }
    }
    return message;
}

export {GenerateChatComposition, GenerateFirstEncounter, GenerateSearchRecord, GenerateTopWords};