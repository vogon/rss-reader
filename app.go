package main

import (
	"context"
	"log"
	"time"
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
	Url            string
	FeedTitle      string
	LastUpdatedISO *string
	ArticleTitle   string
	ArticleLede    string
}

type ArticleViewModel struct {
	GUID        string
	FeedURL     string
	Title       string
	Link        string
	Description string
	PubDateISO  string
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
		feedVMs := []FeedViewModel{}

		for _, feed := range feeds {
			var lastUpdatedISO *string

			effectiveTitle := "(no title)"
			lastUpdatedISO = nil
			articleTitle := "(no articles)"
			articleDescription := ""

			if feed.Title != nil {
				effectiveTitle = *feed.Title
			}

			if feed.LastSuccessfulFetch != nil {
				str := feed.LastSuccessfulFetch.Format(time.RFC3339)
				lastUpdatedISO = &str
			}

			articles, articleErr := a.store.ArticlesForFeed(feed.URL, 1)

			if articleErr != nil {
				log.Printf("error loading latest article for feed %s: %s", feed.URL, articleErr)
			} else if len(articles) > 0 {
				articleTitle = articles[0].Title
				articleDescription = articles[0].Description
			}

			feedVMs = append(feedVMs, FeedViewModel{
				Url:            feed.URL,
				FeedTitle:      effectiveTitle,
				LastUpdatedISO: lastUpdatedISO,
				ArticleTitle:   articleTitle,
				ArticleLede:    articleDescription,
			})
		}

		return feedVMs
	}
}

func (a *App) ArticlesForFeed(url string) []ArticleViewModel {
	articles, err := a.store.ArticlesForFeed(url, 0)

	if err != nil {
		log.Printf("error loading articles for feed %s: %s", url, err)
		return []ArticleViewModel{}
	} else {
		articleVMs := []ArticleViewModel{}

		for _, article := range articles {
			pubDateISO := time.Unix(0, 0).Format(time.RFC3339)

			if article.PubDate != nil {
				pubDateISO = article.PubDate.Format(time.RFC3339)
			}

			articleVMs = append(articleVMs, ArticleViewModel{
				GUID:        article.GUID,
				FeedURL:     article.FeedURL,
				Title:       article.Title,
				Link:        article.Link,
				Description: article.Description,
				PubDateISO:  pubDateISO,
			})
		}

		return articleVMs
	}
}
