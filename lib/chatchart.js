/**Represents a container for everything needed for a Chat Chart*/
class ChatChart {
    constructor(chatters, startDate, endDate){
        this.Chatters = chatters;
        this.StartDate = startDate;
        this.EndDate = endDate;
        
    };

    MetricModules = new Array();

    AddMetricModule (metricModule){
        this.MetricModules.push(metricModule);
    }
}

export {
    ChatChart
}