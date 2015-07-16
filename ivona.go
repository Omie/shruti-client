package main

import (
	"bytes"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"strconv"
)

type IvonaService struct {
	Protocol string
	Host     string
}

func (self *IvonaService) GetTTS(text, voice string) (response []byte, err error) {

	_url := self.Protocol + self.Host

	data := url.Values{}
	data.Set("text", text)
	data.Add("voice", voice)

	u, err := url.ParseRequestURI(_url)
	if err != nil {
		log.Println(err)
		return
	}
	urlStr := fmt.Sprintf("%v", u)

	client := &http.Client{}
	r, err := http.NewRequest("POST", urlStr, bytes.NewBufferString(data.Encode())) // <-- URL-encoded payload
	if err != nil {
		log.Println(err)
		return
	}
	r.Header.Add("Content-Type", "application/x-www-form-urlencoded")
	r.Header.Add("Content-Length", strconv.Itoa(len(data.Encode())))

	resp, err := client.Do(r)
	if err != nil {
		log.Println(err)
		return
	}
	defer resp.Body.Close()

	response, err = ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Println(err)
		return
	}

	if resp.StatusCode != 200 {
		err = errors.New(string(response))
	}

	return

}
