// wrapper for Earthwalker API

// helpers

// gets object from the given URL, else null
async function getObject(url) {
    let response = await fetch(url);
    if (response.ok) {
        return response.json();
    }
    // non-null return signals fetch completion
    // TODO: better way?
    return {}
}

// posts object to the given URL, returns response object else null
async function postObject(url, object) {
    let response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(object),
    });
    if (response.ok) {
        return response.json();
    }
    // non-null return signals fetch completion
    // TODO: better way?
    return {}
}

function orderRounds(arrWithRoundNums) {
    return arrWithRoundNums.sort((a, b) => a.RoundNum - b.RoundNum);
}

interface EarthwalkerAPI {
    configURL: string;
    mapsURL: string;
    challengesURL: string;
    resultsURL: string;
    allResultsURL: string;
    guessesURL: string;
}

class EarthwalkerAPI {
    constructor(baseURL="") {
        this.configURL = baseURL + "/api/config";
        this.mapsURL = baseURL + "/api/maps";
        this.challengesURL = baseURL + "/api/challenges";
        this.resultsURL = baseURL + "/api/results";
        this.allResultsURL = baseURL + "/api/results/all";
        this.guessesURL = baseURL + "/api/guesses";
    }

    // get tile server url (as object) from server, nolabel if specified
    getTileServer(labeled=true) {
        return getObject(this.configURL + (labeled ? "/tileserver" : "/nolabeltileserver"))
    }

    // get map object from server by id
    getMap(mapID) {
        return getObject(this.mapsURL+"/"+mapID);
    }

    // post new map object to server
    postMap(map) {
        return postObject(this.mapsURL, map);
    }

    async getChallenge(challengeID) {
        let challenge = await getObject(this.challengesURL+"/"+challengeID);
        if (challenge.Places) {
            challenge.Places = orderRounds(challenge.Places);
        } else {
            challenge.Places = [];
        }
        return challenge;
    }

    postChallenge(challenge) {
        return postObject(this.challengesURL, challenge);
    }

    async getResult(resultID) {
        let result = await getObject(this.resultsURL+"/"+resultID);
        if (result.Guesses) {
            result.Guesses = orderRounds(result.Guesses);
        } else {
            result.Guesses = [];
        }
        return result;
    }

    async getAllResults(challengeID) {
        let results = await getObject(this.allResultsURL+"/"+challengeID);
        results.forEach(result => {
            if (result.Guesses) {
                result.Guesses = orderRounds(result.Guesses);
            } else {
                result.Guesses = [];
            }
        });
        return results;
    }

    postResult(result) {
        return postObject(this.resultsURL, result);
    }

    postGuess(guess) {
        return postObject(this.guessesURL, guess);
    }
}

export {EarthwalkerAPI};