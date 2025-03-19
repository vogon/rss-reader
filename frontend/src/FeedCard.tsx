import * as luxon from "luxon";
import { main } from "../wailsjs/go/models";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { changeActiveFeed, selectFeedListState } from "./features/feed-list/feed-list-slice";
import classNames from "classnames";
import { fetchArticleFeed } from "./features/article-feed/article-feed-slice";

export type FeedCardProps = {
    feed: main.FeedViewModel;
};

export function FeedCard(props: FeedCardProps) {
    const dispatch = useAppDispatch();
    const feedListState = useAppSelector(selectFeedListState);

    function formatLastUpdatedTimestamp(timestampISO: string | undefined): string {
        if (timestampISO !== undefined) {
            const luxonDT = luxon.DateTime.fromISO(timestampISO);
            const secondsAgo = luxonDT.diffNow(["seconds"]);

            if (secondsAgo.seconds < -(24 * 60 * 60)) {
                return `${Math.round(-secondsAgo.seconds / (24 * 60 * 60))}d`;
            } else if (secondsAgo.seconds < -(60 * 60)) {
                return `${Math.round(-secondsAgo.seconds / (60 * 60))}h`;
            } else if (secondsAgo.seconds < -60) {
                return `${Math.round(-secondsAgo.seconds / 60)}m`;
            } else {
                return `${Math.round(-secondsAgo.seconds)}s`;
            }
        } else {
            return "";
        }
    }

    function onClicked() {
        dispatch(changeActiveFeed(props.feed.Url));
        dispatch(fetchArticleFeed(props.feed.Url));
    }

    return (
        <div className={classNames("grid grid-cols-[1fr_auto] p-2", { "bg-primary": feedListState.activeFeed === props.feed.Url })} onClick={onClicked}>
            <p className="col-1 truncate font-bold">{props.feed.FeedTitle}</p>
            <p className="col-2 text-right">{formatLastUpdatedTimestamp(props.feed.LastUpdatedISO)}</p>
            <p className="col-span-2 truncate">{props.feed.ArticleTitle}</p>
            <p className="col-span-2 line-clamp-2 text-base-content/50">{props.feed.ArticleLede}</p>
        </div>
    )
}