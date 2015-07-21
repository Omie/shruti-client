package main // import "github.com/src/shruti-client"

import (
	"log"
	"os"
	"strings"
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

	err := StartHTTPServer(host, port, apiUrl)
	if err != nil {
		log.Println("Error starting server", err)
	}
}
