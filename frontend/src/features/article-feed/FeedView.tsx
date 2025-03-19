import { useAppSelector } from "../../app/hooks";
import { selectFeedListState } from "../feed-list/feed-list-slice";
import { selectArticles } from "./article-feed-slice";
import { AbsoluteTimestamp } from "../../components/AbsoluteTimestamp";
import { Cog6ToothIcon, GlobeAltIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import { BrowserOpenURL } from "../../../wailsjs/runtime/runtime";
import DOMPurify from "dompurify";
import { Button } from "@headlessui/react";

export function FeedView() {
    const feedListState = useAppSelector(selectFeedListState);
    const articles = useAppSelector(selectArticles);

    const activeFeed = feedListState.activeFeed ? feedListState.feeds[feedListState.activeFeed] : null;

    // create a spare element to use for decoding HTML entities in article titles
    const entityDecodingScratchpad = document.createElement("div");

    return <div className="p-4">
        <header className="flex flex-row">
            {activeFeed ?
                <>
                    <div>
                        <h1 className="text-2xl font-bold">{activeFeed.FeedTitle}</h1> 
                        <h2 className="text-lg italic">updated at <AbsoluteTimestamp timestampISO={activeFeed.LastUpdatedISO} /></h2>
                    </div>
                    <div className="flex flex-row flex-1 gap-4 justify-end items-center">
                        <Button className="btn btn-secondary">
                            <Cog6ToothIcon width="24" />
                            feed settings
                        </Button>
                        <Button className="btn btn-warning">
                            <MinusCircleIcon width="24" />
                            unsubscribe
                        </Button>
                    </div>
                </>
            : null}
        </header>

        {
            articles.map((article) => {
                // decode HTML entities in article title
                const purifiedTitle = DOMPurify.sanitize(article.Title);
                entityDecodingScratchpad.innerHTML = purifiedTitle;
                const purifiedTitleText = entityDecodingScratchpad.textContent;

                const purifiedDescription = DOMPurify.sanitize(article.Description);
                const purifiedContent = DOMPurify.sanitize(article.Content);

                return <article key={article.GUID} className="border-2 rounded-box my-4 p-4 max-h-60 overflow-hidden">
                    <span className="text-2xl font-bold">
                        {purifiedTitleText !== "" ? purifiedTitleText : <span className="opacity-50">(no title)</span>}&nbsp;
                        
                        <a 
                            className="inline-block text-primary cursor-pointer" 
                            onClick={() => BrowserOpenURL(article.Link)}
                        >
                            <GlobeAltIcon width="24" />
                        </a>
                    </span>
                    <p className="italic">published at <AbsoluteTimestamp timestampISO={article.PubDateISO} /></p>
                    <p className="line-clamp-4" dangerouslySetInnerHTML={{__html: purifiedDescription}} />
                    <p className="line-clamp-4" dangerouslySetInnerHTML={{__html: purifiedContent}} />
                    <p className="italic">
                        {article.Categories ? 
                            `(categories: ${article.Categories.join(", ")})`
                            : null
                        }
                    </p>
                </article>
            })
        }
    </div>

}