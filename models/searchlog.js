/**Represents a key-value pairing of a search term and it's count */
class SearchLog {
    constructor(searchTerm, count){
        this.SearchTerm = searchTerm;
        this.Count = count;
    }
}

export {SearchLog}