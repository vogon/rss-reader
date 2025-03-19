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

type article struct {
	GUID        string     `clover:"guid"`
	FeedURL     string     `clover:"feedURL"`
	Title       string     `clover:"title"`
	Link        string     `clover:"link"`
	Description string     `clover:"description"`
	PubDate     *time.Time `clover:"pubDate"`
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

	err = cdb.CreateCollection("articles")

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

func (store *Store) ArticlesForFeed(feedURL string, limit int) ([]*article, error) {
	q := cq.
		NewQuery("articles").
		Where(cq.Field("feedURL").
			Eq(feedURL)).
		Sort(cq.SortOption{Field: "pubDate", Direction: -1})

	if limit != 0 {
		q = q.Limit(limit)
	}

	docs, err := store.clover.FindAll(q)
	articles := []*article{}

	if err != nil {
		return nil, err
	} else {
		// load article from clover doc
		for _, doc := range docs {
			article := &article{}
			docerr := doc.Unmarshal(article)

			if docerr != nil {
				log.Printf("error deserializing article: %s", docerr)
				continue
			} else {
				articles = append(articles, article)
			}
		}

		return articles, nil
	}
}

func (store *Store) updateArticleFromItem(item *gofeed.Item, feedURL string) error {
	// check for existing article, if any
	q := cq.NewQuery("articles").Where(cq.Field("guid").Eq(item.GUID))
	exists, loadErr := store.clover.Exists(q)

	if loadErr != nil {
		return loadErr
	}

	var err error

	doc := map[string]interface{}{
		"guid":        item.GUID,
		"feedURL":     feedURL,
		"title":       item.Title,
		"link":        item.Link,
		"description": item.Description,
		"pubDate":     item.PublishedParsed,
	}

	if exists {
		err = store.clover.Update(q, doc)
	} else {
		cloverDoc := cdoc.NewDocumentOf(doc)
		_, err = store.clover.InsertOne("articles", cloverDoc)
	}

	return err
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

		// update all of the articles on the feed, too
		for _, item := range newParse.Items {
			articleErr := store.updateArticleFromItem(item, url)

			if articleErr != nil {
				log.Printf("error loading article %s: %s", item.GUID, articleErr)
			}
		}
	}

	return err
}

func (store *Store) DropFeed(url string) {
	store.clover.Delete(cq.NewQuery("feeds").Where(cq.Field("url").Eq(url)))
	store.clover.Delete(cq.NewQuery("articles").Where(cq.Field("feedURL").Eq(url)))
}
