import { ChatComposition, FirstEncounter, SearchRecord, MessageDays, MessageTimes, MetricModule, TopWords  } from "./models/metricmodules.js";
import { ChatChart } from "./models/products.js";
import { Chatter } from "./models/chatter.js";
import { FormatFile } from "./controllers/dataprepper.js";
import { GenerateChatComposition, GenerateFirstEncounter, GenerateMessageDays, GenerateMessageTimes, GenerateSearchRecord, GenerateTopWords } from "./controllers/metricmodulecontroller.js";
import { PopulateProductBuilder } from "./controllers/productbuildercontroller.js";

//TODO - Remove all functions other than PopulateProductBuilder

export {
    ChatChart,
    ChatComposition,
    Chatter,
    FirstEncounter,
    FormatFile,
    GenerateChatComposition,
    GenerateFirstEncounter,
    GenerateMessageDays,
    GenerateMessageTimes,
    GenerateSearchRecord,
    GenerateTopWords,
    PopulateProductBuilder,
    SearchRecord,
    MessageDays,
    MessageTimes,
    MetricModule,
    TopWords
}