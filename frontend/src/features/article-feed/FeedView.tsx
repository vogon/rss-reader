import { useAppSelector } from "../../app/hooks";
import { selectFeedListState } from "../feed-list/feed-list-slice";
import { selectArticles } from "./article-feed-slice";
import { AbsoluteTimestamp } from "../../components/AbsoluteTimestamp";

export function FeedView() {
    const feedListState = useAppSelector(selectFeedListState);
    const articles = useAppSelector(selectArticles);

    const activeFeed = feedListState.activeFeed ? feedListState.feeds[feedListState.activeFeed] : null;

    return <div className="p-4">
        {activeFeed ?
            <>
                <h1 className="text-2xl font-bold">{activeFeed.FeedTitle}</h1> 
                <h2 className="text-lg italic">updated at <AbsoluteTimestamp timestampISO={activeFeed.LastUpdatedISO} /></h2>
            </>             
            : null}

        {
            articles.map((article) => {
                return <article key={article.GUID} className="border-2 rounded-box my-4 p-4">
                    <h1 className="text-2xl font-bold">{article.Title}</h1>
                    <p className="italic">published at <AbsoluteTimestamp timestampISO={article.PubDateISO} /></p>
                    <p className="line-clamp-4">{article.Description}</p>
                </article>
            })
        }
    </div>

}