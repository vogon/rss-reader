export namespace main {
	
	export class ArticleViewModel {
	    GUID: string;
	    FeedURL: string;
	    Title: string;
	    Link: string;
	    Description: string;
	    PubDateISO: string;
	
	    static createFrom(source: any = {}) {
	        return new ArticleViewModel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.GUID = source["GUID"];
	        this.FeedURL = source["FeedURL"];
	        this.Title = source["Title"];
	        this.Link = source["Link"];
	        this.Description = source["Description"];
	        this.PubDateISO = source["PubDateISO"];
	    }
	}
	export class FeedViewModel {
	    Url: string;
	    FeedTitle: string;
	    LastUpdatedISO?: string;
	    ArticleTitle: string;
	    ArticleLede: string;
	    LatestArticlePubDateISO: string;
	
	    static createFrom(source: any = {}) {
	        return new FeedViewModel(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.Url = source["Url"];
	        this.FeedTitle = source["FeedTitle"];
	        this.LastUpdatedISO = source["LastUpdatedISO"];
	        this.ArticleTitle = source["ArticleTitle"];
	        this.ArticleLede = source["ArticleLede"];
	        this.LatestArticlePubDateISO = source["LatestArticlePubDateISO"];
	    }
	}

}

