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

/**Represents the Chat Composition chat metric*/
class ChatComposition extends MetricModule {
    constructor(chatters) {
        super("Chat Composition", true, 1, 2);
        this.Chatters = chatters;
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

/**Represents the Instance Counter chat metric*/
class InstanceCounter extends MetricModule {
    constructor(name, instance, count) {
        super(name, false, 1, 1);
        this.Instance = instance;
        this.Count = count;
    }
}

/**Represents the Message Days chat metric*/
class MessageDays extends MetricModule {
    constructor(messageDaysTable) {
        super("Message Days", false, 2, 2);
        this.MessageDaysTable = messageDaysTable;
    }
}

/**Represents the Message Times chat metric*/
class MessageTimes extends MetricModule {
    constructor(messageTimesTable) {
        super("Message Times", false, 2, 2);
        this.MessageTimesTable = messageTimesTable;
    }
}

/**Represents the Top Emojis chat metric*/
class TopEmojis extends MetricModule {
    constructor(topEmojisTable) {
        super("Top Emojis", false, 1, 2);
        this.TopEmojisTable = topEmojisTable;
    }
}

/**Represents the Top Words chat metric*/
class TopWords extends MetricModule {
    constructor(topWordsTable) {
        super("Top Words", false, 1, 2);
        this.TopWordsTable = topWordsTable;
    }
}

export {
    ChatComposition,
    FirstEncounter,
    InstanceCounter,
    MessageDays,
    MessageTimes,
    MetricModule,
    TopEmojis,
    TopWords
};