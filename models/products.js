/**Represents the Product class which all CC products will be a sub-class of */
class Product {
    constructor(productName, productCode, sendToPoD){
        this.ProductName = productName;
        this.ProductCode = productCode;
        this.SendToPoD = sendToPoD;
    }
}

/**Represents a container for a Chat Chart*/
class ChatChart extends Product {
    constructor(productCode, chatters, startDate, endDate){
        super("Chat Chart", productCode, false);
        this.Chatters = chatters;
        this.StartDate = startDate;
        this.EndDate = endDate;
        this.MetricModules = new Array();
    };

    AddMetricModule (metricModule){
        this.MetricModules.push(metricModule);
    }
}

export {
    ChatChart
}