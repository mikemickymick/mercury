/**Represents a container for everything needed for a Chat Chart*/
class ChatChart {
    constructor(chatters, startDate, endDate){
        this.Chatters = chatters;
        this.StartDate = startDate;
        this.EndDate = endDate;
        this.MetricModules = [];
    };

    AddMetricModule (metricModule){
        MetricModules.push(metricModule);
    }
}

export {
    ChatChart
}