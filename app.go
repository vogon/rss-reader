package main

import (
	"context"
	"log"
)

// App struct
type App struct {
	ctx   context.Context
	store *Store
}

// type appFeedState struct {
// 	feed
// 	feedId      string
// 	fetchTicker time.Ticker
// }

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	store, err := NewStore()
	if err != nil {
		log.Fatal(err)
	}

	a.store = store
}

type FeedViewModel struct {
	Url          string
	FeedTitle    string
	LastUpdated  string
	ArticleTitle string
	ArticleLede  string
}

func (a *App) AddFeed(url string) error {
	log.Printf("AddFeed(%s)", url)

	return a.store.UpdateFeedFromWeb(url)
}

func (a *App) Feeds() []FeedViewModel {
	feeds, err := a.store.ListFeeds()

	if err != nil {
		log.Printf("Feeds(): error loading feeds: %s", err)
		return []FeedViewModel{}
	} else {
		lipsum := `
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
			ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
			laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
			voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
			non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		`
		feedVMs := []FeedViewModel{}

		for idx, feed := range feeds {
			effectiveTitle := "(no title)"

			if feed.Title != nil {
				effectiveTitle = *feed.Title
			}

			feedVMs = append(feedVMs, FeedViewModel{
				Url:          feed.URL,
				FeedTitle:    effectiveTitle,
				LastUpdated:  "69m",
				ArticleTitle: "article title",
				ArticleLede:  lipsum[idx*50:],
			})
		}

		return feedVMs
	}
}
