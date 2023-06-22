import { GenerateSearchRecord } from "./metricmodulecontroller.js";

/**Count instances of a personal word*/
async function CountPersonalWord(chatObjArr, personalWord){
    let searchTermArr = [personalWord];
    return GenerateSearchRecord(chatObjArr,null,true,null,null,searchTermArr);
}

export {CountPersonalWord} 