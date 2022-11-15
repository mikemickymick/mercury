/**Represents a person within a chat*/
class Chatter {
    constructor(authorIndex, author, messageCount, messagePercent){
        this.AuthorIndex = authorIndex;
        this.Author = author;
        this.MessageCount = messageCount;
        this.MessagePercent = messagePercent;
    };
}

export {
    Chatter
};