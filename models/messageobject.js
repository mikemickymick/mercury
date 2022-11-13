/**Represents a single message object*/
class MessageObject {
    constructor(date, day, time, hour, author, message){
        this.Date = date;
        this.Day = day;
        this.Time = time;
        this.Hour = hour;
        this.Author = author;
        this.Message = message;
    }
}

export {MessageObject}