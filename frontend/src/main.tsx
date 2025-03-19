import React from 'react'
import {createRoot} from 'react-dom/client'
import './style.css'
import App from './App'
import { Provider } from 'react-redux'

import { store } from './app/store'
import { EventsOn } from "../wailsjs/runtime/runtime"
import { fetchFeedList } from './features/feed-list/feed-list-slice'

EventsOn("feed-list/updated", () => {
    console.log("feed-list/updated received");
    store.dispatch(fetchFeedList());
});

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <App/>
        </Provider>
    </React.StrictMode>
)
