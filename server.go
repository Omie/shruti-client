package main

import (
	//"encoding/json"
	"fmt"
	"github.com/gorilla/mux"
	"html/template"
	"log"
	"net/http"
	"path/filepath"
)

var (
	ApiUrl              string
	IvonaUrl            string
	ClientId            string
	PusherAPIKey        string
	PusherChannel       string
	PusherEvent         string
	AutoRefreshInterval int
)

// Serves the single page app
func indexHandler(w http.ResponseWriter, r *http.Request) {
	t, err := template.New("base.html").Delims("{%", "%}").ParseFiles("./templates/base.html", "./templates/index.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	context := struct {
		ApiUrl              string
		IvonaUrl            string
		ClientId            string
		PusherAPIKey        string
		PusherChannel       string
		PusherEvent         string
		AutoRefreshInterval int
	}{ApiUrl: ApiUrl,
		IvonaUrl:            IvonaUrl,
		ClientId:            ClientId,
		AutoRefreshInterval: AutoRefreshInterval}
	if PusherAPIKey != "" {
		context.PusherAPIKey = PusherAPIKey
		context.PusherChannel = PusherChannel
		context.PusherEvent = PusherEvent
	}

	t.Execute(w, context)
}

// Serves the /assets/ directory for js, html, css assets
func assetsHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	static := vars["path"]
	http.ServeFile(w, r, filepath.Join("./assets", static))
}

// Serves the audio files
func audioHandler(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	static := vars["path"]
	http.ServeFile(w, r, filepath.Join("./audiofiles", static))
}

func StartHTTPServer(host, port, apiUrl, ivonaUrl, clientId,
	pusherAPIKey, pusherChannel, pusherEvent string,
	refreshInterval int) error {

	ApiUrl = apiUrl
	IvonaUrl = ivonaUrl
	ClientId = clientId
	PusherAPIKey = pusherAPIKey
	PusherChannel = pusherChannel
	PusherEvent = pusherEvent
	AutoRefreshInterval = refreshInterval

	r := mux.NewRouter()
	r.StrictSlash(true)

	r.HandleFunc("/", indexHandler)

	r.HandleFunc(`/assets/{path:[a-zA-Z0-9=\-\/\.\_]+}`, assetsHandler)

	http.Handle("/", r)

	bind := fmt.Sprintf("%s:%s", host, port)
	log.Println("listening on: ", bind)
	return http.ListenAndServe(bind, nil)
}
