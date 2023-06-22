/**Represents the Product class which all CC products will be a sub-class of.*/
class Product {
    constructor(productName, productCode, sendRequestToPoD){
        this.ProductName = productName;
        this.ProductCode = productCode;
        this.SendRequestToPoD = sendRequestToPoD;
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
        this.ProgressPercent = 0;
    }

    AddMetricModule(metricModule) {
        let areaSum = this.MetricModules.reduce((sum, x) => sum + x.Area, 0);
        
        if (areaSum > 24) {
            alert("Sorry, we can't fit any more graphics on your Chat Chart! Try removing something.");
        } else {
            this.MetricModules.push(metricModule);
            let modulePercent = (metricModule.Area / 24) * 100;
            this.ProgressPercent += Math.round(modulePercent);
        }
    }

    RemoveMetricModule(metricModule) {
        const index = this.MetricModules.findIndex(x => x === metricModule);
        if (index === -1) { return; }
    
        let modulePercent = (metricModule.Area / 24) * 100;
        this.ProgressPercent -= Math.round(modulePercent);
        this.MetricModules.splice(index, 1);
    }    
}

export {
    ChatChart
}