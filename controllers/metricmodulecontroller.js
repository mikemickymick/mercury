import { Chatter } from '../models/chatter.js';
import { SearchLog } from '../models/searchlog.js';
import { SearchRecord } from '../models/metricmodules.js';
import { AudioArray, EmojiArray, ImageArray, LateNightArray, LaughArray, LoveArray, MorningArray, NightArray, SkipWords, SwearArray } from '../helpers/searchhelper';

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
        let counter = 0;
        let instanceRegEx = new RegExp(x.toLowerCase(),"g");
        chatObjArr.forEach(y => {
            if (y.MessageBody.match(instanceRegEx)){
                counter++
            }
        });
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
function GenerateTopWords(chatObjArr){
    let topWordsTable = new Array();
    let skipWords = SkipWords;
    let kiss = "x";
    //Remove all the kisses people send eachother
    for(var i = 0; i < 15; i++) {
        kiss += "x";
        skipWords.push(kiss);
    }





}

export {GenerateChatComposition, GenerateSearchRecord};