/**Represents a container for a chat metric*/
class MetricModule {
    constructor(name, required, width, height) {
        this.Name = name;
        this.Required = required;
        this.Width = width;
        this.Height = height;
        this.Area = width * height;
    }
}

/**Represents the First Encounter chat metric*/
class FirstEncounter extends MetricModule {
    constructor(firstChatter, firstMessage, replyingChatter, replyMessage) {
        super("First Encounter", true, 2, 2);
        this.FirstChatter = firstChatter;
        this.FirstMessage = firstMessage;
        this.ReplyingChatter = replyingChatter;
        this.ReplyMessage = replyMessage;
    }
}

export {
    MetricModule,
    FirstEncounter
};