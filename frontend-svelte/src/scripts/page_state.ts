const challengeCookieName = "earthwalker_lastChallenge";
const resultCookiePrefix = "earthwalker_lastResult_";

// getChallengeID from the URL (key: "id"), else get the value of cookie
// lastChallenge, else null
function getChallengeID() {
    let id = getURLParam("id");
    if (id) {
        return id;
    }
    return getCookieValue(challengeCookieName);
}

// getChallengeResultID from cookie resultCookiePrefix+challengeID, else null
function getChallengeResultID(challengeID) {
    return getCookieValue(resultCookiePrefix+challengeID);
}

// return value of url param with key, else null
function getURLParam(key) {
    let params = new URLSearchParams(window.location.search)
    if (!params.has(key)) {
        return;
    }
    return params.get(key);
}

// getCookieValue with specified name, else null
function getCookieValue(name) {
    let cookies = document.cookie.split("; ");
    let cookie = cookies.find(row => row.startsWith(name));
    if (cookie) {
        return cookie.split('=')[1];
    }
    return null;
}

// TODO: move this somewhere else
function showChallengeLinkPrompt(challengeID) {
    let link = window.location.origin + "/play?id=" + challengeID;
    window.prompt("Copy to clipboard: Ctrl+C, Enter", link);
}

export { getChallengeID, getChallengeResultID, getURLParam, getCookieValue, showChallengeLinkPrompt };