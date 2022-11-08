/**Represents a person within a chat*/
class Chatter {
    constructor(index, name, messageCount, messagePercent){
        this.Index = index;
        this.Name = name;
        this.MessageCount = messageCount;
        this.MessagePercent = messagePercent;
    }
}

export {
    Chatter
};