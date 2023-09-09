/**Represents a person within a chat*/
class Chatter {
    constructor(authorNumber, name, messageCount, messagePercent, wordCount, minutesSpentMessaging, timesSpentMessagingString){
        this.AuthorNumber = authorNumber;
        this.Name = name;
        this.MessageCount = messageCount;
        this.MessagePercent = messagePercent;
        this.WordCount = wordCount;
        this.MinutesSpentMessaging = minutesSpentMessaging;
        this.TimeSpentMessagingString = timesSpentMessagingString;
    }
}

export {Chatter}