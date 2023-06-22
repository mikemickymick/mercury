import { GenerateSearchRecord } from './metricmodulecontroller.js';

/**
 * Count instances of a personal word
 * @param {Array} chatObjArr - Array of chat objects
 * @param {string} personalWord - Personal word to count
 * @returns {Promise} - Promise that resolves to the search record
 */
async function CountPersonalWord(chatObjArr, personalWord) {
  const searchTermArr = [personalWord];
  return GenerateSearchRecord(chatObjArr, null, true, null, null, searchTermArr);
}

export {CountPersonalWord} 