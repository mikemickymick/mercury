/**Represents a person within a chat */
class Chatter {
    constructor(authorNumber, author, messageCount, messagePercent){
        this.AuthorNumber = authorNumber;
        this.Author = author;
        this.MessageCount = messageCount;
        this.MessagePercent = messagePercent;
    };
}

export {Chatter}