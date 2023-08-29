/**Represents a person within a chat*/
class Chatter {
    constructor(authorNumber, name, messageCount, messagePercent, wordCount, timeSpentMessaging){
        this.AuthorNumber = authorNumber;
        this.Name = name;
        this.MessageCount = messageCount;
        this.MessagePercent = messagePercent;
        this.WordCount = wordCount;
        this.TimeSpentMessaging = timeSpentMessaging;
    }
}

export {Chatter}