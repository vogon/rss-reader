import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { main } from "../../../wailsjs/go/models";
import { ArticlesForFeed, Feeds } from "../../../wailsjs/go/main/App";

export interface ArticleFeedState {
    articles: main.ArticleViewModel[];
}

const initialState: ArticleFeedState = {
    articles: []
};

export const fetchArticleFeed = createAsyncThunk("article-feed/fetch", 
    async (url: string, thunkAPI) => {
        return ArticlesForFeed(url);
    }
);

export const articleFeedSlice = createSlice({
    name: "articleFeed",
    initialState,
    reducers: {

    },
    selectors: {
        selectArticles: (state) => state.articles,
    },
    extraReducers: (builder) => {
        builder.addCase(fetchArticleFeed.fulfilled, (state, action) => {
            state.articles = action.payload;
        })
    }
});

export const {selectArticles} = articleFeedSlice.selectors;

export default articleFeedSlice.reducer;