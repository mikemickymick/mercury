/**Represents a container for a chat metric.*/
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
    constructor(firstMessageDate, firstMessageTime, firstChatterName, firstMessage, replyMessageDate, replyMessageTime, replyingChatterName, replyMessage) {
        super("First Encounter", true, 2, 2);
        this.FirstMessageDate = firstMessageDate;
        this.FirstMessageTime = firstMessageTime;
        this.FirstChatterName = firstChatterName;
        this.FirstMessageBody = firstMessage;
        this.ReplyMessageDate = replyMessageDate;
        this.ReplyMessageTime = replyMessageTime;
        this.ReplyingChatterName = replyingChatterName;
        this.ReplyMessage = replyMessage;
    }
}

/**Represents the SearchRecord chat metric*/
class SearchRecord extends MetricModule {
    constructor(name, required, width, height, searchLogs, totalCount) {
        super(name, required, width, height);
        this.SearchLogs = searchLogs;
        this.TotalCount = totalCount;
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
    SearchRecord,
    MessageDays,
    MessageTimes,
    MetricModule,
    TopWords
};