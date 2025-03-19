package main

import (
	"context"
	"log"
	"time"

	wailsrt "github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx         context.Context
	store       *Store
	autofetches []autofetchState
}

type autofetchState struct {
	url           string
	fetchTicker   *time.Ticker
	stopAutofetch chan bool
}

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

	// start autofetches for all of the feeds in the store
	a.autofetches = []autofetchState{}
	feeds := a.Feeds()

	for _, feed := range feeds {
		fetchTicker := time.NewTicker(300 * time.Second)
		stopAutofetch := make(chan bool)

		go func() {
			for {
				select {
				case <-stopAutofetch:
					return
				case <-fetchTicker.C:
					log.Printf("autofetching feed from %s...", feed.Url)
					a.store.UpdateFeedFromWeb(feed.Url)
					wailsrt.EventsEmit(a.ctx, "feed-list/updated")
				}
			}
		}()

		a.autofetches = append(a.autofetches, autofetchState{
			url:           feed.Url,
			fetchTicker:   fetchTicker,
			stopAutofetch: stopAutofetch,
		})
	}
}

type FeedViewModel struct {
	Url                     string
	FeedTitle               string
	LastUpdatedISO          *string
	ArticleTitle            string
	ArticleLede             string
	LatestArticlePubDateISO string
}

type ArticleViewModel struct {
	GUID        string
	FeedURL     string
	Title       string
	Link        string
	Description string
	Content     string
	PubDateISO  string
	Categories  []string
}

func (a *App) AddFeed(url string) error {
	log.Printf("AddFeed(%s)", url)

	err := a.store.UpdateFeedFromWeb(url)

	if err != nil {
		return err
	} else {
		wailsrt.EventsEmit(a.ctx, "feed-list/updated")
		return nil
	}
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
			articleLede := ""

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

				if len(articles[0].Description) > 0 {
					articleLede = articles[0].Description
				} else {
					articleLede = articles[0].Content
				}
			}

			latestArticlePubDateISO := time.Unix(0, 0).Format(time.RFC3339)

			if articles[0].PubDate != nil {
				latestArticlePubDateISO = articles[0].PubDate.Format(time.RFC3339)
			}

			feedVMs = append(feedVMs, FeedViewModel{
				Url:                     feed.URL,
				FeedTitle:               effectiveTitle,
				LastUpdatedISO:          lastUpdatedISO,
				ArticleTitle:            articleTitle,
				ArticleLede:             articleLede,
				LatestArticlePubDateISO: latestArticlePubDateISO,
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
				Content:     article.Content,
				PubDateISO:  pubDateISO,
				Categories:  article.Categories,
			})
		}

		return articleVMs
	}
}
