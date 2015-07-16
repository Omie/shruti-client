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

// Serves the homepage with the question form
func indexHandler(w http.ResponseWriter, r *http.Request) {
	t, err := template.New("base.html").Delims("{%", "%}").ParseFiles("./templates/base.html", "./templates/index.html")
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	t.Execute(w, nil)
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

func StartHTTPServer(host string, port string) error {
	r := mux.NewRouter()
	r.StrictSlash(true)

	r.HandleFunc("/", indexHandler)

	r.HandleFunc(`/assets/{path:[a-zA-Z0-9=\-\/\.\_]+}`, assetsHandler)

	http.Handle("/", r)

	bind := fmt.Sprintf("%s:%s", host, port)
	log.Println("listening on: ", bind)
	return http.ListenAndServe(bind, nil)
}
