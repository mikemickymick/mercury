export class ProductBuilder{
    constructor(chatComposition, fromDate, toDate, messageTimes, messageDays, firstEncounter, topWords, searchRecordArray){
        this.ChatComposition = chatComposition,
        this.FromDate = fromDate,
        this.ToDate = toDate,
        this.MesageTimes = messageTimes,
        this.MessageDays = messageDays,
        this.FirsEncounter = firstEncounter,
        this.TopWords = topWords,
        this.SearchRecordArray = searchRecordArray
    }
}