export namespace main {
	
	export class FeedViewModel {
	    Url: string;
	    FeedTitle: string;
	    LastUpdated: string;
	    ArticleTitle: string;
	    ArticleLede: string;
	
	    static createFrom(source: any = {}) {
	        return new FeedViewModel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Url = source["Url"];
	        this.FeedTitle = source["FeedTitle"];
	        this.LastUpdated = source["LastUpdated"];
	        this.ArticleTitle = source["ArticleTitle"];
	        this.ArticleLede = source["ArticleLede"];
	    }
	}

}

