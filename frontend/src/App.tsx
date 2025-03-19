import { Dialog, DialogPanel, DialogTitle, Input, Field, Label } from "@headlessui/react";
import { ArrowPathIcon, PlusCircleIcon } from "@heroicons/react/24/outline";
import classnames from "classnames";
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { AddFeed } from "../wailsjs/go/main/App";
import { FeedCard } from "./features/feed-list/FeedCard";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { fetchFeedList, selectFeedListState } from "./features/feed-list/feed-list-slice";
import { FeedView } from "./features/article-feed/FeedView";

type AddFeedFormData = {
    url: string
};

function App() {
    const dispatch = useAppDispatch();
    const feedListState = useAppSelector(selectFeedListState);
    const [isAddFeedOpen, setIsAddFeedOpen] = useState<boolean>(false);
    const { register, handleSubmit } = useForm<AddFeedFormData>({
        defaultValues: {
            url: ""
        }
    });

    const sortedFeedList = Object.values(feedListState.feeds).
        sort((a, b) => a.FeedTitle.localeCompare(b.FeedTitle));

    async function refreshAllFeeds() {
        for (const feed of Object.values(feedListState.feeds)) {
            await AddFeed(feed.Url);
        }
    }

    useEffect(() => {
        dispatch(fetchFeedList());
    }, []);

    function onAddFeedSubmit(data: AddFeedFormData) {
        AddFeed(data.url);
        setIsAddFeedOpen(false);
    }

    return (
        <div id="App" className="flex flex-row h-[100vh]">
            <Dialog open={isAddFeedOpen} onClose={() => setIsAddFeedOpen(false)}>
                <dialog className={classnames("modal", { "modal-open": isAddFeedOpen })}>
                    <DialogPanel className="modal-box">
                        <form onSubmit={handleSubmit(onAddFeedSubmit)}>
                            <DialogTitle>
                                <h3 className="text-xl font-bold">Add a new feed</h3>
                            </DialogTitle>
                            <Field className="pt-4">
                                <Label>URL of feed to add:</Label>
                                <Input type="url" className="input w-full" {...register("url")} />
                            </Field>
                            
                            <div className="modal-action">
                                <button className="btn" onClick={() => setIsAddFeedOpen(false)}>cancel</button>
                                <button className="btn btn-accent" type="submit">ok</button>
                            </div>
                        </form>
                    </DialogPanel>
                </dialog>
            </Dialog>

            {/* left pane */}
            <div className="flex flex-col w-1/3 max-w-xs bg-base-200 overflow-auto">
                <ul>
                    {
                        sortedFeedList.map((feed, index) => <li key={index}>
                            {index != 0 ? <hr/> : null}
                            <FeedCard feed={feed} />
                        </li>)
                    }
                </ul>

                <div className="flex flex-row gap-2 pt-2 px-2">
                    <button className="btn flex-1 border-accent text-accent" onClick={() => setIsAddFeedOpen(true)}>
                        <PlusCircleIcon width="24" />
                        add feed
                    </button>

                    <button className="btn btn-square border-neutral-content" onClick={() => refreshAllFeeds()}>
                        <ArrowPathIcon width="24" />
                    </button>
                </div>
            </div>

            {/* main pane */}
            <div className="flex flex-col gap-12 flex-1 overflow-auto">
                <FeedView />
            </div>
        </div>
    )
}

export default App
