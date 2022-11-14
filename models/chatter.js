/**Represents a person within a chat*/
class Chatter {
    constructor(index, author, messageCount, messagePercent){
        this.Index = index;
        this.Name = author;
        this.MessageCount = messageCount;
        this.MessagePercent = messagePercent;
    };
}

export {
    Chatter
};