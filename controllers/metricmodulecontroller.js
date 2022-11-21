import { Chatter } from '../models/chatter.js';
import { SearchLog } from '../models/searchlog.js';
import { SearchRecord } from '../models/metricmodules.js';

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
            searchTermArr = ["haha", "lol", "lmao", "lmfao", "hehe", "😆", "😅", "😂", "🤣"];
            break;
        case "morning":
            searchTermArr = ["morning x", "good morning"];
            break;
        case "night":
            searchTermArr = ["night night", "good night", "night x" ];
            break;
        case "audio":
            searchTermArr = ["audio omitted"];
            break;
        case "image":
            searchTermArr = ["image omitted"];
            break;
        case "love":
            searchTermArr = ["love", "adore", "x", "xx", "xxx", "xxxx", "xxxxx", "❤️", "🫶", "🥰", "😍","😘", "💏"];
            break;
        case "swear":
            searchTermArr = ["fuck", "shit", "cunt", "bollocks", "twat"];
            break;
        case "late-night":
            searchTermArr = ["horny","fuck","shag","screw","tits","ass","pussy","vagina","vaj","penis","dick","cock","balls","sex","blowjob","head","anal","bum","arse","spank","🍑","😈","lick","suck","kiss","cum","orgasm","🍆","👅","naughty","kinky","sexy","dirty","💦","🍒","🤤","😏","🥵"];
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
    searchLogs.forEach(x =>{
            counter += x.Count
    });

    return new SearchRecord(searchRecordName, required, width, height, searchLogs, counter);
}

export {GenerateChatComposition, GenerateSearchRecord};