import type { Action, ThunkAction } from "@reduxjs/toolkit";
import { configureStore } from "@reduxjs/toolkit";
import feedListReducer from "../features/feed-list/feed-list-slice";
import articleFeedReducer from "../features/article-feed/article-feed-slice";

export const store = configureStore({
    reducer: {
        feedList: feedListReducer,
        articleFeed: articleFeedReducer,
    }
});

export type AppStore = typeof store;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunk<ThunkReturnType = void> = ThunkAction<
    ThunkReturnType,
    RootState,
    unknown,
    Action
>;