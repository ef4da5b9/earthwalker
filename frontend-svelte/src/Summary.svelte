<script>
    // TODO: most of this script is duplicated in Scores.svelte.
    //       (also a bit in Modify.svelte)
    //       consolidate.
    import {onMount} from 'svelte';
    import { loc, ewapi, globalMap, globalChallenge, globalResult } from './stores.js';
    import LeafletGuessesMap from './components/LeafletGuessesMap.svelte';
    import Leaderboard from './components/Leaderboard.svelte';

    let displayedResult;
    // name of the current player
    let currentPlayer;
    // name of the player selected in the leaderboard
    let focusedPlayer;
    let allResults = [];
    let scoresTableData = new Object();

    let guessLocs;
    let actualLocs;
    let scoreDists = [];

    // leaflet
    let scoreMap;
    let scoreMapPolyGroup;
    let scoreMapGuessGroup;

    async function fetchData() {
        allResults = await $ewapi.getAllResults($globalChallenge.ChallengeID);
        allResults.forEach(r => {
            r.scoreDists = r.Guesses.map((guess, i) => calcScoreDistance(guess, $globalChallenge.Places[i], $globalMap.GraceDistance, $globalMap.Area));
            r.scoreDists = r.scoreDists.concat(Array($globalMap.NumRounds - r.scoreDists.length).fill([0, 0]));
            r.totalScore = r.scoreDists.reduce((acc, val) => acc + val[0], 0);
            r.totalDist = r.scoreDists.reduce((acc, val) => acc + val[1], 0)
        });
        displayedResult = allResults.find(r => r.ChallengeResultID === $globalResult.ChallengeResultID);
        currentPlayer = displayedResult.Nickname;
        focusedPlayer = currentPlayer;
        allResults.sort((a, b) => b.totalScore - a.totalScore);
        allResults = allResults;

        scoresTableData.Nicknames = [];
        scoresTableData.ScoresPerPlayer = [];

        allResults.forEach(r => {
            scoresTableData.Nicknames = scoresTableData.Nicknames.concat(Array(r.Nickname));
            scoresTableData.ScoresPerPlayer = scoresTableData.ScoresPerPlayer.concat(Array(r.scoreDists));
        });

        // transpose matrix
        scoresTableData.ScoresPerRound = scoresTableData.ScoresPerPlayer[0].map((_, colIndex) =>
            scoresTableData.ScoresPerPlayer.map(row => row[colIndex]));
    }

    function isShowAllPlayersInScoresPerRound(allPlayers) {
        return allPlayers.length <= 3;
    }

    function isShowPlayerInScoresPerRoundTable(player, currentPlayer, focusedPlayer, allPlayers) {
        if (isShowAllPlayersInScoresPerRound(allPlayers)) {
            return true;
        }
        // only show the current player and optionally another selected player
        return (player === currentPlayer) || (player === focusedPlayer);
    }

    function isHighlightPlayerInScoresPerRoundTable(player, focusedPlayer) {
        return player === focusedPlayer;
    }
</script>

<style>
    :global(th.highlight, td.highlight) {
        background-color: lightblue !important;
    }
</style>

<!-- This prevents users who haven't finished the challenge from viewing
     TODO: cleaner protection for this page -->
{#if $globalResult.Guesses && $globalMap.NumRounds && $globalResult.Guesses.length == $globalMap.NumRounds}
    {#await fetchData()}
        <h2>Loading...</h2>
    {:then}
        <LeafletGuessesMap {displayedResult} showAll={true}/>

        <div class="container">
            <br>
            <div class="row">
                <div class="col text-center">
                    <button type="button" id="copy-game-link" class="btn btn-primary" on:click={() => showChallengeLinkPrompt($globalChallenge.ChallengeID)}>
                        Copy link to this game
                    </button>
                </div>
            </div>

            <div style="margin-top: 2em; text-align: center;">
                <h3>Scores</h3>
                <table class="table table-striped">
                    <thead>
                    <th scope="col">Round</th>
                    {#each scoresTableData.Nicknames as playerName}
                        {#if isShowPlayerInScoresPerRoundTable(playerName, currentPlayer, focusedPlayer, scoresTableData.Nicknames)}
                            <th scope="col" class={isHighlightPlayerInScoresPerRoundTable(playerName, focusedPlayer) ? 'highlight' : ''}>{playerName + "\'s"} Points</th>
                            <th scope="col" class={isHighlightPlayerInScoresPerRoundTable(playerName, focusedPlayer) ? 'highlight' : ''}>{playerName + "\'s"} Distance Off</th>
                        {/if}
                    {/each}
                    </thead>
                    <tbody>
                    {#if scoresTableData.ScoresPerRound}
                        {#each scoresTableData.ScoresPerRound as scoresOfRound, roundIndex}
                            <tr scope="row">
                                <td>{roundIndex + 1}</td>
                                {#each scoresOfRound as scoreDistOfRoundAndPlayer, playerIndex}
                                    {#if isShowPlayerInScoresPerRoundTable(scoresTableData.Nicknames[playerIndex], currentPlayer, focusedPlayer, scoresTableData.Nicknames)}
                                        <td class={isHighlightPlayerInScoresPerRoundTable(scoresTableData.Nicknames[playerIndex], focusedPlayer) ? 'highlight' : ''}>{scoreDistOfRoundAndPlayer[0]}</td>
                                        <td class={isHighlightPlayerInScoresPerRoundTable(scoresTableData.Nicknames[playerIndex], focusedPlayer) ? 'highlight' : ''}>{distString(scoreDistOfRoundAndPlayer[1])}</td>
                                    {/if}
                                {/each}
                            </tr>
                        {/each}
                    {/if}
                    </tbody>
                </table>
            </div>

            <div id="leaderboard" style="margin-top: 2em; text-align: center;">
                <h3>Challenge Leaderboard</h3>
                <Leaderboard bind:focusedPlayer={focusedPlayer} {allResults} curRound={$globalMap.NumRounds - 1}/>
            </div>
        </div>
    {/await}
{:else}
    <div class="text-center">
        <h2>You must finish the game to view this page.</h2>
    </div>
{/if}