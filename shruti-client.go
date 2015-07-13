package main

import (
	shruti "github.com/omie/shruti-go"
	"log"
	"time"
)

func main() {
	client := &shruti.Client{"http://", "localhost:9574"}

	providers, err := client.GetAllProviders()
	if err != nil {
		log.Println(err)
		return
	}

	for _, provider := range providers {
		log.Println(*provider)
	}

	provider, err := client.GetSingleProvider("hackernews1")
	if err != nil {
		log.Println(err)
		return
	}
	log.Println(*provider)

	t := time.Unix(100, 0)
	notifications, err := client.GetNotificationsSince(&t)
	if err != nil {
		log.Println(err)
		return
	}

	for _, n := range notifications {
		log.Println(*n)
	}

}
