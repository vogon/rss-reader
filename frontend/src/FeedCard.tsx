import { main } from "../wailsjs/go/models";

export type FeedCardProps = {
    feed: main.FeedViewModel;
};

export function FeedCard(props: FeedCardProps) {
    return (
        <div className="grid grid-cols-[1fr_auto] my-2 first:mt-0">
            <p className="col-1 truncate font-bold">{props.feed.FeedTitle}</p>
            <p className="col-2 text-right">{props.feed.LastUpdated}</p>
            <p className="col-span-2 truncate">{props.feed.ArticleTitle}</p>
            <p className="col-span-2 line-clamp-2 text-base-content/50">{props.feed.ArticleLede}</p>
        </div>
    )
}