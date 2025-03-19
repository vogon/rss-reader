import { main } from "../../../wailsjs/go/models";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { changeActiveFeed, selectFeedListState } from "./feed-list-slice";
import classNames from "classnames";
import { fetchArticleFeed } from "../article-feed/article-feed-slice";
import { RelativeTimestamp } from "../../components/RelativeTimestamp";

export type FeedCardProps = {
    feed: main.FeedViewModel;
};

export function FeedCard(props: FeedCardProps) {
    const dispatch = useAppDispatch();
    const feedListState = useAppSelector(selectFeedListState);
    
    function onClicked() {
        dispatch(changeActiveFeed(props.feed.Url));
        dispatch(fetchArticleFeed(props.feed.Url));
    }

    return (
        <div className={classNames("grid grid-cols-[1fr_auto] p-2", { "bg-primary": feedListState.activeFeed === props.feed.Url })} onClick={onClicked}>
            <p className="col-1 truncate font-bold">{props.feed.FeedTitle}</p>
            <RelativeTimestamp className="col-2 text-right" timestampISO={props.feed.LatestArticlePubDateISO} />
            <p className="col-span-2 truncate">{props.feed.ArticleTitle}</p>
            <p className="col-span-2 line-clamp-2 text-base-content/50">{props.feed.ArticleLede}</p>
        </div>
    )
}