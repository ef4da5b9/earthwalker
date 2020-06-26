// Package streetviewserver serves a streetview url that is injected with
// a script
package streetviewserver

import (
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	"github.com/golang/geo/s2"
	"gitlab.com/glatteis/earthwalker/config"
	"gitlab.com/glatteis/earthwalker/urlbuilder"
)

func modifyMainPage(target string, w http.ResponseWriter, r *http.Request) {
	res, err := http.Get(target)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}
	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}
	bodyAsString := string(body)

	insertBody, err := ioutil.ReadFile(config.Env.EarthwalkerStaticPath + "/templates/to_insert.html")
	if err != nil {
		log.Fatal(err)
	}

	replacedBody := strings.Replace(bodyAsString, "<head>", "<head> "+string(insertBody), 1)
	w.Write([]byte(replacedBody))
}

func modifyInformation(target string, w http.ResponseWriter, r *http.Request) {
	req, err := http.NewRequest("GET", target, nil)
	req.Header.Add("User-Agent", r.Header.Get("User-Agent"))
	req.Header.Add("Accept", r.Header.Get("Accept"))

	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	res, err := http.DefaultClient.Do(req)
	// res, err := http.Get(target)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}
	defer res.Body.Close()
	body, err := ioutil.ReadAll(res.Body)
	if err != nil {
		http.Error(w, err.Error(), http.StatusForbidden)
		return
	}

	if strings.Contains(target, "photometa") {
		body = filterStreetStrings(body)
	}
	// body = filterURL(body)

	for key, headers := range r.Header {
		for _, value := range headers {
			w.Header().Add(key, value)
		}
	}
	w.Write(body)
}

// ServeLocation serves a specific location to the user.
func ServeLocation(l s2.LatLng, w http.ResponseWriter, r *http.Request) {
	mapsURL := urlbuilder.BuildURL(l)
	modifyMainPage(mapsURL, w, r)
}

// ServeMaps is a proxy to google maps
func ServeMaps(w http.ResponseWriter, r *http.Request) {
	fullURL := r.URL
	fullURL.Host = "www.google.com"
	fullURL.Scheme = "https"

	modifyInformation(fullURL.String(), w, r)
	// if strings.Contains(fullURL.String(), "photometa") {
	// 	modifyInformation(fullURL.String(), w, r)
	// } else {
	// 	http.Redirect(w, r, fullURL.String(), http.StatusFound)
	// }
}
