package main

import (
	"errors"
	"log"
	"time"

	"github.com/mmcdole/gofeed"
	c "github.com/ostafen/clover/v2"
	cdoc "github.com/ostafen/clover/v2/document"
	cq "github.com/ostafen/clover/v2/query"
)

type Store struct {
	clover *c.DB
}

type feed struct {
	URL                 string     `clover:"url"`
	LastFetch           *time.Time `clover:"lastFetch"`
	LastSuccessfulFetch *time.Time `clover:"lastSuccessfulFetch"`
	LastFetchError      error      `clover:"error"`
	Title               *string    `clover:"title"`
}

func NewStore() (*Store, error) {
	cdb, err := c.Open("state.db")

	if err != nil {
		return nil, err
	}

	err = cdb.CreateCollection("feeds")

	if err != nil && !errors.Is(err, c.ErrCollectionExist) {
		// ignore collection-exists errors, since that just makes this a no-op
		log.Fatal(err)
	}

	err = cdb.CreateCollection("feedItems")

	if err != nil && !errors.Is(err, c.ErrCollectionExist) {
		log.Fatal(err)
	}

	return &Store{
		clover: cdb,
	}, nil
}

func (store *Store) ListFeeds() ([]*feed, error) {
	feeds := []*feed{}
	docs, err := store.clover.FindAll(cq.NewQuery("feeds"))
	if err != nil {
		return nil, err
	}

	for _, doc := range docs {
		// load feed from clover doc
		feed := &feed{}
		docerr := doc.Unmarshal(feed)

		if docerr != nil {
			log.Printf("error loading feed from document with id %s: %s\n", doc.ObjectId(), err)
			continue
		}

		feeds = append(feeds, feed)
	}

	return feeds, nil
}

func (store *Store) UpdateFeedFromWeb(url string) error {
	// check for existing feed, if any
	q := cq.NewQuery("feeds").Where(cq.Field("url").Eq(url))
	exists, loadErr := store.clover.Exists(q)

	if loadErr != nil {
		return loadErr
	}

	// fetch feed from web
	parser := gofeed.NewParser()
	newParse, fetchErr := parser.ParseURL(url)

	var err error
	err = nil

	if fetchErr != nil {
		if exists {
			err = store.clover.Update(q, map[string]interface{}{
				"lastFetch":      time.Now(),
				"lastFetchError": fetchErr.Error(),
			})
		} else {
			doc := cdoc.NewDocument()
			doc.Set("url", url)
			doc.Set("lastFetch", time.Now())
			doc.Set("lastFetchError", fetchErr.Error())

			_, err = store.clover.InsertOne("feeds", doc)
		}
	} else {
		if exists {
			err = store.clover.Update(q, map[string]interface{}{
				"lastFetch":           time.Now(),
				"lastSuccessfulFetch": time.Now(),
				"lastFetchError":      nil,
				"title":               newParse.Title,
			})
		} else {
			doc := cdoc.NewDocument()
			doc.Set("url", url)
			doc.Set("lastFetch", time.Now())
			doc.Set("lastSuccessfulFetch", time.Now())
			doc.Set("lastFetchError", nil)
			doc.Set("title", newParse.Title)

			_, err = store.clover.InsertOne("feeds", doc)
		}
	}

	return err
}

func (store *Store) DropFeed(url string) {
	store.clover.Delete(cq.NewQuery("feeds").Where(cq.Field("url").Eq(url)))
}

// func loadFeedFromCloverDocument(doc *cdoc.Document) (*feed, error) {
// 	feed := &feed{}
// 	err := doc.Unmarshal(feed)

// 	return feed, err
// }

// func fetchFromUrl(db *c.DB, url string) *feed {
// 	// update record with new data
// 	parser := gofeed.NewParser()
// 	newParse, err := parser.ParseURL(url)

// 	if err != nil {
// 		return &feed{
// 			URL:            url,
// 			EverFetched:    true,
// 			LastFetch:      time.Now(),
// 			LastFetchError: err,
// 			Title:          nil,
// 		}
// 	} else {
// 		return &feed{
// 			URL:            url,
// 			EverFetched:    true,
// 			LastFetch:      time.Now(),
// 			LastFetchError: nil,
// 			Title:          &newParse.Title,
// 		}
// 	}
// }
