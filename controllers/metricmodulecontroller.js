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