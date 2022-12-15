import { GenerateSearchRecord } from "./metricmodulecontroller.js";

async function CountPersonalWord(chatObjArr, personalWord){
    let searchTermArr = [personalWord];
    return GenerateSearchRecord(chatObjArr,null,true,null,null,searchTermArr);
}

export {CountPersonalWord}