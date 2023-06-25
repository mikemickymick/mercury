/**Represents the Product class which all CC products will be a sub-class of.*/
class Product {
    constructor(productName, productCode, sendRequestToPoD) {
        this.ProductName = productName;
        this.ProductCode = productCode;
        this.SendRequestToPoD = sendRequestToPoD;
    }
}

class ChatChart extends Product {
    constructor(productCode, chatters, startDate, endDate) {
        super("Chat Chart", productCode, false);
        this.Chatters = chatters;
        this.StartDate = startDate;
        this.EndDate = endDate;
        this.MetricModules = new Map();
        this.ProgressPercent = 0;
    }

    AddMetricModule(metricModule) {
        let areaSum = 0;
        for (const value of this.MetricModules.values()) {
            areaSum += value.Area;
        }

        if (areaSum > 24) {
            alert("Sorry, we can't fit any more graphics on your Chat Chart! Try removing something.");
        } else {
            this.MetricModules.set(metricModule, true);
            this.ProgressPercent += Math.round((metricModule.Area * 100) / 24);
        }
    }

    RemoveMetricModule(metricModule) {
        if (!this.MetricModules.has(metricModule)) { return; }

        const moduleArea = metricModule.Area;
        this.ProgressPercent -= Math.round((moduleArea * 100) / 24);
        this.MetricModules.delete(metricModule);
    }
}

export {
    ChatChart
};