export class ProductBuilder{
    constructor(chatComposition, fromDate, toDate, messageTimes, messageDays, firstEncounter, topWords, searchRecordArray, daysDifference){
        this.ChatComposition = chatComposition,
        this.FromDate = fromDate,
        this.ToDate = toDate,
        this.MessageTimes = messageTimes,
        this.MessageDays = messageDays,
        this.FirstEncounter = firstEncounter,
        this.TopWords = topWords,
        this.SearchRecordArray = searchRecordArray,
        this.DaysDifference = daysDifference
    }
} 