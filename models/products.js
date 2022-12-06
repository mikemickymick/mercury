/**Represents the Product class which all CC products will be a sub-class of */
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

    AddMetricModule (metricModule){
        let areaSum = 0;
        this.MetricModules.forEach(x => {
            areaSum += x.Area;
        });

        if(areaSum > 24){
            //Throw error
            alert("Sorry, we can't fit anymore graphics on your Chat Chart! Try removing something.");
        }else{
            this.MetricModules.push(metricModule);
            let modulePercent = Math.round((metricModule.Area/24)*100);
            this.ProgressPercent += modulePercent;
        }
    }

    RemoveMetricModule(metricModule){
        if (!this.MetricModules.includes(metricModule)){ return; }

        this.MetricModules.splice(this.MetricModules.indexOf(metricModule),1);
        let modulePercent = Math.round((metricModule.Area/24)*100);
        this.ProgressPercent += modulePercent;
    }
}

export {
    ChatChart
}