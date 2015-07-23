package main // import "github.com/omie/shruti-client"

import (
	"log"
	"os"
	"strconv"
	"strings"
)

const (
	DEFAULT_REFRESH_INTERVAL = 15
	MILLISECONDS_IN_MINUTE   = 60 * 1000
)

func main() {

	host := os.Getenv("SHRUTI_CLIENT_HOST")
	port := os.Getenv("SHRUTI_CLIENT_PORT")
	if host == "" || port == "" {
		log.Println("main: environment variables not set")
		return
	}

	apiUrl := os.Getenv("SHRUTI_API_URL")
	if apiUrl == "" {
		log.Println("main: api url not set")
		return
	}
	apiUrl = strings.TrimSuffix(apiUrl, "/")

	ivonaUrl := os.Getenv("SHRUTI_IVONA_URL")
	if ivonaUrl == "" {
		log.Println("main: ivona url not set")
		return
	}
	ivonaUrl = strings.TrimSuffix(ivonaUrl, "/")

	clientId := os.Getenv("SHRUTI_CLIENT_ID")
	if clientId == "" {
		log.Println("main: client id not set")
		return
	}

	_refreshInterval := os.Getenv("SHRUTI_CLIENT_REFRESH_INTERVAL")
	if _refreshInterval == "" {
		log.Println("main: refresh interval not set, defaulting to 15 minutes")
		_refreshInterval = "15"
	}
	refreshInterval, err := strconv.Atoi(_refreshInterval)
	if err != nil {
		log.Println("invalid interval value, set to 15 minutes")
		refreshInterval = DEFAULT_REFRESH_INTERVAL
	}
	refreshInterval = refreshInterval * MILLISECONDS_IN_MINUTE

	err = StartHTTPServer(host, port, apiUrl, ivonaUrl, clientId, refreshInterval)
	if err != nil {
		log.Println("Error starting server", err)
	}
}
