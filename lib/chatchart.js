/**Represents a container for everything needed for a Chat Chart*/
class ChatChart {
    constructor(chatters, startDate, endDate, metricModules){
        this.Chatters = chatters;
        this.StartDate = startDate;
        this.EndDate = endDate;
        this.MetricModules = metricModules;
    };

    *AddMetricModule (metricModule){
        this.Chatters.push(metricModule);
    }
}

export {
    ChatChart
}