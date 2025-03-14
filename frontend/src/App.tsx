import { Dialog, DialogPanel, DialogTitle, Description, Input } from "@headlessui/react";
import { Bars3Icon, PlusCircleIcon } from "@heroicons/react/24/outline";
import classnames from "classnames";
import { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import { main } from "../wailsjs/go/models";
import { AddFeed, Feeds } from "../wailsjs/go/main/App";
import { FeedCard, FeedCardProps } from "./FeedCard";

type AddFeedFormData = {
    url: string
};

function App() {
    const [feeds, updateFeeds] = useState<main.FeedViewModel[]>([]);
    const [isAddFeedOpen, setIsAddFeedOpen] = useState<boolean>(false);
    const { register, handleSubmit } = useForm<AddFeedFormData>({
        defaultValues: {
            url: ""
        }
    })

    function refreshFeeds() {
        Feeds().then(async (newFeeds) => {
            console.log(newFeeds);
            updateFeeds(newFeeds);
        });
    }

    useEffect(() => {
        refreshFeeds();
    }, []);

    function onAddFeedSubmit(data: AddFeedFormData) {
        AddFeed(data.url);
        setIsAddFeedOpen(false);
        refreshFeeds();
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
                            <Description>
                                <p className="pt-4">URL of feed to add:</p>
                            </Description>
                            <Input type="url" className="input w-full" {...register("url")} />
                            <div className="modal-action">
                                <button className="btn" onClick={() => setIsAddFeedOpen(false)}>cancel</button>
                                <button className="btn btn-accent" type="submit">ok</button>
                            </div>
                        </form>
                    </DialogPanel>
                </dialog>
            </Dialog>

            {/* left pane */}
            <div className="flex flex-col w-1/3 max-w-xs bg-base-200 p-2 overflow-auto">
                {/* menu bar */}
                {/* <div className="flex flex-row">
                    <div className="dropdown dropdown-start">
                        <div tabIndex={0} role="button" className="btn btn-square btn-ghost">
                            <Bars3Icon width="24" />
                        </div>
                        <ul tabIndex={0} className="menu dropdown-content bg-base-200 rounded-box border-1 z-1 w-3xs">
                            <li>menu item</li>
                        </ul>
                    </div>

                    <div className="flex-1"/>

                    <div className="btn btn-circle btn-accent">
                        <PlusCircleIcon width="24" />
                    </div>
                </div> */}

                <ul>
                    {
                        feeds.map((feed, index) => <li key={index}>
                            {index != 0 ? <hr/> : null}
                            <FeedCard feed={feed} />
                        </li>)
                    }
                </ul>

                <button className="btn btn-block border-accent text-accent" onClick={() => setIsAddFeedOpen(true)}>
                    <PlusCircleIcon width="24" />
                    add feed
                </button>
            </div>

            {/* main pane */}
            <div className="flex-1">
                main pane
            </div>

            {/* <div id="result" className="result">{resultText}</div>
            <div id="input" className="input-box">
                <input id="name" className="input" onChange={updateName} autoComplete="off" name="input" type="text"/>
                <button className="btn" onClick={greet}>Greet</button>
            </div> */}
        </div>
    )
}

export default App
