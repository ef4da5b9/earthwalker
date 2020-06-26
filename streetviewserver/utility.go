package streetviewserver

import (
	"regexp"
)

// GOAL : MATCH [["Jl. SMA Aek Kota Batu","id"],["Sumatera Utara","de"]]
var streetStringRegex = "(\\p{L}| |\\d|\\_|\\-|\\,|\\.|/)"
var streetLanguageRegex = "\\[\"" + streetStringRegex + "+\"+,\"" + streetStringRegex + "{1,10}\"\\]"
var streetRegexp *regexp.Regexp = regexp.MustCompile(streetLanguageRegex)

// filterStreetStrings filters all string contents from a given string (as byte array),
// used to strip all localization information from a specific street view packet
func filterStreetStrings(body []byte) []byte {
	result := streetRegexp.ReplaceAllString(string(body), "[\"\",\"\"]")
	return []byte(result)
}

// GOAL : MATCH Google URLs and change them to our own
var urlStringRegex = "https://www.google.com/maps"
var urlRegexp *regexp.Regexp = regexp.MustCompile(streetLanguageRegex)

// filterStreetStrings filters all string contents from a given string (as byte array),
// used to strip all localization information from a specific street view packet
func filterURL(body []byte) []byte {
	result := streetRegexp.ReplaceAllString(string(body), "/maps")
	return []byte(result)
}
