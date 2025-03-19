import { useAppSelector } from "../../app/hooks";
import { selectFeedListState } from "../feed-list/feed-list-slice";
import { selectArticles } from "./article-feed-slice";
import { AbsoluteTimestamp } from "../../components/AbsoluteTimestamp";
import { Cog6ToothIcon, GlobeAltIcon, MinusCircleIcon } from "@heroicons/react/24/outline";
import { BrowserOpenURL } from "../../../wailsjs/runtime/runtime";
import DOMPurify from "dompurify";
import { Button, Checkbox, Dialog, DialogPanel, DialogTitle, Field, Fieldset, Input, Label } from "@headlessui/react";
import { useState } from "react";
import classNames from "classnames";

export function FeedView() {
    const feedListState = useAppSelector(selectFeedListState);
    const articles = useAppSelector(selectArticles);
    const [isFeedOptionsOpen, setIsFeedOptionsOpen] = useState<boolean>(false);

    const activeFeed = feedListState.activeFeed ? feedListState.feeds[feedListState.activeFeed] : null;

    // create a spare element to use for decoding HTML entities in article titles
    const entityDecodingScratchpad = document.createElement("div");

    return <div className="p-4">
        <Dialog open={isFeedOptionsOpen} onClose={() => setIsFeedOptionsOpen(false)}>
            <dialog className={classNames("modal", { "modal-open": isFeedOptionsOpen })}>
                <DialogPanel className="modal-box">
                    <form className="flex flex-col">
                        <DialogTitle className="text-xl font-bold">
                            feed settings
                        </DialogTitle>

                        <Fieldset className="fieldset w-full border p-2">
                            <legend className="fieldset-legend m-2">Display article fields</legend>

                            <Field>
                                <Label className="label">description</Label>
                                <Input type="checkbox" className="toggle" />
                            </Field>

                            <Field>
                                <Label className="label">content</Label>
                                <Input as="select" className="select">
                                    <option>always</option>
                                    <option selected>if description is empty</option>
                                    <option>never</option>
                                </Input>
                            </Field>

                            <Field>
                                <Label className="label">categories</Label>
                                <Input type="checkbox" className="toggle" />
                            </Field>
                        </Fieldset>

                        <div className="modal-action">
                            <button className="btn" onClick={() => setIsFeedOptionsOpen(false)}>cancel</button>
                            <button className="btn btn-accent" type="submit">save</button>
                        </div>
                    </form>
                </DialogPanel>
            </dialog>
        </Dialog>

        <header className="flex flex-row">
            {activeFeed ?
                <>
                    <div>
                        <h1 className="text-2xl font-bold">{activeFeed.FeedTitle}</h1> 
                        <h2 className="text-lg italic">updated at <AbsoluteTimestamp timestampISO={activeFeed.LastUpdatedISO} /></h2>
                    </div>
                    <div className="flex flex-row flex-1 gap-4 justify-end items-center">
                        <Button className="btn btn-secondary" onClick={() => setIsFeedOptionsOpen(true)}>
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