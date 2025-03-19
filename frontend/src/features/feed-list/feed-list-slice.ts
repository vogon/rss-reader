import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { main } from "../../../wailsjs/go/models";
import { Feeds } from "../../../wailsjs/go/main/App";

export interface FeedListState {
    feeds: { [url: string]: main.FeedViewModel };
    activeFeed: string | null;
}

const initialState: FeedListState = {
    feeds: {},
    activeFeed: null
};

export const fetchFeedList = createAsyncThunk("feed-list/fetch", async (thunkAPI) => {
    return Feeds();
});

export const feedListSlice = createSlice({
    name: "feedList",
    initialState,
    reducers: {
        changeActiveFeed: (state, action: PayloadAction<string>) => {
            if (Object.getOwnPropertyNames(state.feeds).includes(action.payload)) {
                console.log(`changing active feed to ${action.payload}`);
                state.activeFeed = action.payload;
            }
        }
    },
    selectors: {
        selectFeedListState: (state) => ({ feeds: state.feeds, activeFeed: state.activeFeed }),
    },
    extraReducers: (builder) => {
        builder.addCase(fetchFeedList.fulfilled, (state, action) => {
            state.feeds = {};

            for (const feed of action.payload) {
                state.feeds[feed.Url] = feed;
            }

            if (state.activeFeed && !Object.getOwnPropertyNames(state.feeds).includes(state.activeFeed)) {
                state.activeFeed = null;
            }
        })
    }
});

export const { changeActiveFeed } = feedListSlice.actions;
export const { selectFeedListState } = feedListSlice.selectors;

export default feedListSlice.reducer;