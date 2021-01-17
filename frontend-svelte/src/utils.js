export function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        console.log('Copy succesful');
    }, function(err) {
        console.log('Copy failed', err);
    });
}

export function getGameLink(challengeID) {
    return `${window.location.origin}/play?id=${challengeID}`;
}

export default { copyToClipboard, getGameLink };