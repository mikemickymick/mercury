/**Represents a person within a chat.*/
class Chatter {
    constructor(authorNumber, name, messageCount, messagePercent){
        this.AuthorNumber = authorNumber;
        this.Name = name;
        this.MessageCount = messageCount;
        this.MessagePercent = messagePercent;
    }
}

export {Chatter}