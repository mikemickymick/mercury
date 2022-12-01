import { Chatter } from '../models/chatter.js';
import { SearchLog } from '../models/searchlog.js';
import { SearchRecord } from '../models/metricmodules.js';
import { AudioArray, EmojiArray, ImageArray, LateNightArray, LaughArray, LoveArray, MorningArray, NightArray, PunctuationRegEx, SkipWords, SwearArray } from '../helpers/searchhelper.js';

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

/**Generates a Top Words metric module */
function GenerateTopWords(linesArray){
    let topWordsTable = new Array();
    let wordsArr = new Array();
    let punctuationRegEx = new RegExp(PunctuationRegEx, "g");

    //Making sure we don't include punctuation, emojis, or skipwords in this table
    linesArray.filter(x => !SkipWords.includes(x) && !EmojiArray.includes(x) && !x.match(punctuationRegEx));
    let newArr = groupByArray(chatObjArr);

    //TO DO
}

function groupByArray(xs, key) { 
    return xs.reduce(function (rv, x) { 
        let v = key instanceof Function ? key(x) : x[key];
        let el = rv.find((r) => r && r.key === v);
        if (el) { 
            el.values.push(x);
        } else {
            rv.push({ key: v, values: [x] });
        }
        return rv;
    },[]);
}

export {GenerateChatComposition, GenerateSearchRecord};