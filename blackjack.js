// JavaScriptを記述しましょう。
// 前回作成したコードをここに貼り付けてください。

class Card
{
    constructor(suit, rank)
    {
        // スート
        this.suit = suit

        // ランク
        this.rank = rank
    }

    getRankNumber()
    {
        let hash = {"A": 11, "2": 2, "3": 3, "4": 4, "5": 5, "6": 6, "7": 7, "8": 8, "9": 9, "10": 10, "J": 10, "Q": 10, "K": 10}
        //TODO: ここから挙動をコードしてください。
        return hash[this.rank]
    }
}

class Deck
{
    constructor(gameType)
    {
        // このデッキが扱うゲームタイプ
        this.gameType = gameType

        // カードの配列
        this.cards = []

        // ゲームタイプによって、カードを初期化してください。
        if(gameType == 'blackjack') this.resetDeck();
    }
    
    shuffle()
    {
        //TODO: ここから挙動をコードしてください。
        for(let i = 0; i < this.cards.length; i++){
            var random = Math.floor( Math.random() * this.cards.length);
            let value = this.cards[i];
            this.cards[i] = this.cards[random];
            this.cards[random] = value;
        }
    }

    resetDeck()
    {
        //TODO: ここから挙動をコードしてください。
        let suit = ["heart","diamond","clover","spade"];
        let rank = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
        this.cards.splice(0)
        for(let i = 0; i < suit.length; i++){
            for(let j = 0; j < rank.length; j++){
                let card = new Card(suit[i],rank[j]);
                this.cards.push(card);
            }
        }
        this.shuffle()
    }
    
    drawOne()
    {
        let card = this.cards.shift()
        return card;
        //TODO: code behavior here
    }
}

class Player
{
    constructor(name, type, gameType)
    {
        // プレイヤーの名前
        this.name = name

        // プレイヤーのタイプ
        this.type = type

        // 現在のゲームタイプ
        this.gameType = gameType

        // プレイヤーの手札
        this.hand = []

        // プレイヤーが所持しているチップ。
        this.chips = 400

        // 現在のラウンドでのベットしているチップ
        this.bet = 0

        // 勝利金額。正の数にも負の数にもなります。
        this.winAmount = 0 

        // プレイヤーのゲームの状態やアクションを表します。
        // ブラックジャックの場合、最初の状態は「betting」です。
        if(this.type == "house"){
            this.gameStatus = 'acting'
        }else{
            this.gameStatus = 'betting'
        }

    }

    promptPlayer(userData)
    {
        if(this.gameStatus == "betting"){
            if(userData == null){
                return new GameDecision("bet",100)
            }else{
            //UIはこれから作るので、仮で入れる
                return new GameDecision("bet",userData)
            }
        }else if(this.gameStatus == "acting"){
            if(userData == null){
                if(this.getHandScore() < 11){
                    return new GameDecision("hit", 0)
                }else{
                    return new GameDecision("stand", 0)
                }
            }else{
            //UIはこれから作るので、仮で入れる
                if(userData == "surrender"){
                    return new GameDecision("surrender",0)
                }else if(userData == "stand"){
                    return new GameDecision("stand",0)
                }else if(userData == "hit"){
                    return new GameDecision("hit",0)
                }else if(userData == "double"){
                    return new GameDecision("double",0)
                }
            }
        }
    }


    getHandScore()
    {
        //TODO: ここから挙動をコードしてください。
        let totalScore = 0;
        for(let i = 0; i < this.hand.length; i++){
            totalScore += this.hand[i].getRankNumber()
        }
        if(totalScore > 21) {
            // Aが2枚以上あるケースがあるので繰り返し処理も想定
            if(this.hand.find(element => element.rank == "A")) totalScore -= 10
        }
        return totalScore
    }
}

class GameDecision
{
    constructor(action, amount)
    {
        // アクション
        this.action = action
        // プレイヤーが選択する数値
        this.amount = amount
    }
}

class Table
{
    constructor(name,gameType, betDenominations = [5,20,50,100])
    {
        // ゲームタイプを表します。
        this.gameType = gameType
        
        // プレイヤーが選択できるベットの単位。
        this.betDenominations = betDenominations
        
        // テーブルのカードのデッキ
        this.deck = new Deck(this.gameType)
        
        this.players = [new Player(name,"user",gameType),new Player("player2","ai",gameType),new Player("player3","ai",gameType)]
        
        // プレイヤーをここで初期化してください。
        let housePlayer = new Player("house","house","blackjack")
        this.house = housePlayer

        this.gamePhase = 'betting'

        // これは各ラウンドの結果をログに記録するための文字列の配列です。
        this.resultsLog = []
        this.turnCounter = 0;
    }

    evaluateMove(decision)
    {
        let player = this.getTurnPlayer();
        if(this.gamePhase == "betting"){
            player.bet += decision.amount
            player.chips -= player.bet
            player.gameStatus = "acting"
        }else if(this.gamePhase == "acting"){
            this.actingEvaluate(decision.action,player)
        }else if(this.gamePhase == "evaluatingWinners"){
            this.winAmountMove(decision)
        }
    }

    actingEvaluate(action,player){
        if(action == "stand"){
            player.gameStatus = "stand"
        }else if(action == "hit"){
            console.log(player.getHandScore(),player.gameStatus,player.hand)
            player.hand.push(this.deck.drawOne())
            if(player.getHandScore() > 21){
                player.gameStatus = "bust"
            }
        }else if(action == "double"){
            player.chips -= player.bet
            player.bet += player.bet
            player.hand.push(Deck.drawOne())
            if(player.getHandScore() > 21){
                player.gameStatus = "bust"
            }
        }else if(action == "surrender"){
            player.chips += player.bet/2
            player.gameStatus = "surrender"
        }
    }

    winAmountMove(decision){
        // this.house.gameStatus = decision.action
    
        for(let i = 0; i < this.players.length; i++){
            let currentPlayer = this.players[i]
            if(currentPlayer.gameStatus == "stand"){
                if(decision.action == "stand" && currentPlayer.getHandScore() > this.house.getHandScore()){
                    currentPlayer.winAmount = currentPlayer.bet
                    currentPlayer.chips += currentPlayer.winAmount*2
                }else if(decision.action != "stand"){
                    currentPlayer.winAmount = currentPlayer.bet
                    currentPlayer.chips += currentPlayer.winAmount*2
                }else{
                    currentPlayer.winAmount = -currentPlayer.bet
                }
            }else if(currentPlayer.gameStatus != "stand" && decision.action == "stand"){
                currentPlayer.winAmount = -currentPlayer.bet
            }
        }
    }

    blackjackEvaluateAndGetRoundResults()
    {
        // 見本を見てどんな情報を出力すればいいか見る
        let res = []
        for(let i = 0; i < this.players.length; i++){
            let currentPlayer = this.players[i]
            res.push("name:" + currentPlayer.name + ",action:" + currentPlayer.gameStatus + ",bet:" + currentPlayer.bet + "won:" + currentPlayer.winAmount)
        }
        return res;
        //TODO: ここから挙動をコードしてください。    
    }

    blackjackAssignPlayerHands()
    {
        for(let i = 0; i < this.players.length; i++){
            this.players[i].hand.push(this.deck.drawOne());
            this.players[i].hand.push(this.deck.drawOne());
        }
        this.house.hand.push(this.deck.drawOne())
        this.house.hand.push(this.deck.drawOne())
    }

    blackjackClearPlayerHandsAndBets()
    {
        //TODO: ここから挙動をコードしてください。
        for(let i = 0; i < this.players.length; i++){
            this.players[i].hand.splice(0);
            this.players[i].bet = 0;
        }
    }

    getTurnPlayer()
    {
        //TODO: ここから挙動をコードしてください。
        return this.players[this.turnCounter]
    }

    haveTurn(userData)
    {
        let currentPlayer = this.getTurnPlayer()

        if(this.gamePhase == "betting"){
            // これなるべくrenderTableに入れた方が綺麗かも
            let warning = document.getElementById("warning")
            if(userData > currentPlayer.chips){
                warning.innerHTML = "手持ちのchipsを超える金額です"
            }else{
                warning.innerHTML = ""
                if(currentPlayer == this.players[0]){
                    this.blackjackClearPlayerHandsAndBets()
                    this.deck.resetDeck()
                    this.blackjackAssignPlayerHands()
                }
                // promptPlayerでGameDesisionを取得、evaluateMove
                if(userData != null){
                    let bettingDecision = currentPlayer.promptPlayer(userData)
                    this.evaluateMove(bettingDecision)
                }else{
                    let bettingDecision = currentPlayer.promptPlayer()
                    this.evaluateMove(bettingDecision)
                }

                // lastPlayerだったらactingに以降、違ければ次のプレイヤーに回す
                if(this.onLastPlayer()){
                    this.turnCounter = 0
                    this.gamePhase = "acting"
                    this.renderTable()
                }else{
                    this.turnCounter += 1
                }
                // 最初のプレイヤー（user)の処理完了後、次のフェーズまでループ
                //ラストのプレイヤーのときに一度だけhaveTurnを実行
                if(this.getTurnPlayer() == this.players[1]){
                    while(!this.onLastPlayer()){
                        this.haveTurn()
                    }
                    this.haveTurn()
                }
            }
        }else if(this.gamePhase == "acting"){
            //gameDisision取得→evaluateMove実行
            let actingDecision = null;
            userData != null ? actingDecision = currentPlayer.promptPlayer(userData) : actingDecision = currentPlayer.promptPlayer()
            this.evaluateMove(actingDecision)
            // allPlayerActionsResolvedならevaluatingWinnersに以降する
            // currentPlayerがacting以外なら次のプレイヤーに回す
            this.renderTable()
            if(this.allPlayerActionsResolved()){
                this.gamePhase = "evaluatingWinners"
                this.turnCounter = 0
                this.haveTurn()
            }else if(currentPlayer == this.players[0]){
                // 1のときにturnCounterが発動していない
                if(currentPlayer.gameStatus != "acting"){
                    this.turnCounter += 1
                    this.haveTurn()
                }
            }else if(currentPlayer.gameStatus != "acting"){
                this.turnCounter += 1
                this.haveTurn()
            }else if(currentPlayer.gameStatus == "acting"){
                this.haveTurn()
            }

        }else if(this.gamePhase == "evaluatingWinners"){
            // リセットする
            this.renderTable()
            let houseDecision = this.house.promptPlayer()
            this.evaluateMove(houseDecision)
            let result = this.blackjackEvaluateAndGetRoundResults()

            this.resultsLog.push(result)
            let round = this.resultsLog.length
            console.log("round" + round + ":")
            for(let i = 0; i < result.length; i++){
                console.log(result[i])
            }

            for(let i = 0; i < this.players.length; i++){
                this.players[i].bet = 0
                this.players[i].gameStatus = "betting"
                this.players[i].winAmount = 0
                this.players[i].hand.splice(0)
                this.house.hand.splice(0)
            }

            if(this.players[0].chips <= 0){
                this.gamePhase = "gameOver"
                let me = this
                setTimeout(function(){me.haveTurn();},1000)
            }else{
                this.gamePhase = "betting"
                let me = this
                setTimeout(function(){me.renderTable();},1000)
            }

        }else if(this.gamePhase == "gameOver"){
            this.renderTable()
            for(let i = 0; i < this.resultsLog.length; i++){
                let round = i + 1
                console.log("round" + round + ":")
                for(let j = 0; j < this.resultsLog[i].length; j++){
                    console.log( this.resultsLog[i][j])
                }
            }
            this.players.splice(0)
            this.resultsLog.splice(0)
        }
    }

    renderTable(){
      let bettingDom = document.getElementById("bettingDom")
      let startGameDom = document.getElementById("startGameDom")
      let actingDom = document.getElementById("actingDom")
      let gameOverDom = document.getElementById("gameOverDom")
      
      if(this.gamePhase == "betting"){
        let betChoiceDom = ``
        for(let i = 0; i < this.betDenominations.length; i++){
            let num = i + 1
            betChoiceDom += `<div>
            <div class="input-group">
                <input id="${"betInput" + num}" type="number" class="input-number text-center" size="2" min="0" maxlength="5" value="0">
            </div><!--end input group div -->
            <p class="text-white text-center">${this.betDenominations[i]}</p>
        </div>`
        }
        let bettingHouseDom = `<div id="playersDiv" class="d-flex justify-content-center">
        <div id="nonCurPlayer1Div" class="flex-column">
            <p class="m-0 text-white text-center rem3">${this.house.name}</p>

            <div class="text-white d-flex m-0 p-0 justify-content-between">
                <p class="rem1 text-left">S:${this.house.gameStatus}</a>
            </div>
            <div class="d-flex justify-content-center">
                <div class="bg-white border mx-2">
                    <div class="text-center">
                        <img src="/img/questionMark.png" alt="" width="50" height="50">
                    </div>
                    <div class="text-center">
                        <p class="m-0">?</p>
                    </div>
                </div>
                <div class="bg-white border mx-2">
                    <div class="text-center">
                        <img src="/img/questionMark.png" alt="" width="50" height="50">
                    </div>
                    <div class="text-center">
                        <p class="m-0">?</p>
                    </div>
                </div>
            </div>
        </div>`
        let bettingPlayersDom = ``
        for(let i = 0; i < this.players.length; i++){
        bettingPlayersDom += `<div id="playersDiv" class="d-flex justify-content-center">
        <div id="nonCurPlayer1Div" class="flex-column">
            <p class="m-0 text-white text-center rem3">${this.players[i].name}</p>
            <div class="text-white d-flex m-0 p-0 justify-content-between">
                <p class="rem1 text-left">S:${this.players[i].gameStatus}</p>
                <p class="rem1 text-left">B:${this.players[i].bet}</p>
                <p class="rem1 text-left">R:${this.players[i].chips}</p>
            </div>
            <div class="d-flex justify-content-center">
                <div class="bg-white border mx-2">
                    <div class="text-center">
                        <img src="/img/questionMark.png" alt="" width="50" height="50">
                    </div>
                    <div class="text-center">
                        <p class="m-0">?</p>
                    </div>
                </div>
                <div class="bg-white border mx-2">
                    <div class="text-center">
                        <img src="/img/questionMark.png" alt="" width="50" height="50">
                    </div>
                    <div class="text-center">
                        <p class="m-0">?</p>
                    </div>
                </div>
            </div>
        </div>`
        }
        var bettingHouseDiv = document.getElementById("bettingHouseDiv")
        var bettingPlayersDiv = document.getElementById("bettingPlayersDiv")
        bettingDom.classList.remove("hide-dom")
        startGameDom.classList.add("hide-dom")
        actingDom.classList.add("hide-dom")
        
        bettingHouseDiv.innerHTML = bettingHouseDom
        bettingPlayersDiv.innerHTML = bettingPlayersDom
        betsDiv.innerHTML = betChoiceDom
        
      }else if(this.gamePhase == "acting" || this.gamePhase == "evaluatingWinners"){
        let actingHouseDom = `<div id="playersDiv" class="d-flex justify-content-center">
        <div id="nonCurPlayer1Div" class="flex-column">
            <p class="m-0 text-white text-center rem3">${this.house.name}</p>
            <div class="text-white d-flex m-0 p-0 justify-content-between">
                <p class="rem1 text-left">S:${this.house.gameStatus} </p>
            </div>
            <div class="d-flex justify-content-center">
                <div class="bg-white border mx-2">
                    <div class="text-center">
                        <img src="/img/dashboard/lessons/projects/${this.house.hand[0].suit}.png" alt="" width="50" height="50">
                    </div>
                    <div class="text-center">
                        <p class="m-0">${this.house.hand[0].rank}</p>
                    </div>
                </div>
                <div class="bg-white border mx-2">
                    <div class="text-center">
                        <img src="${this.gamePhase == "acting" ? "/img/questionMark.png" : "/img/dashboard/lessons/projects/" + this.house.hand[1].suit + ".png"}" alt="" width="50" height="50">
                    </div>
                    <div class="text-center">
                        <p class="m-0">${this.gamePhase == "acting" ? "?" : this.house.hand[1].rank}</p>
                    </div>
                </div>
            </div>
        </div>`
        let actingPlayersDom = ``
        for(let i = 0; i < this.players.length; i++){
            var actingCardsDom = ``
            for(let j = 0; j < this.players[i].hand.length; j++){
                actingCardsDom += `<div class="bg-white border mx-2">
                    <div class="text-center">
                        <img src="/img/dashboard/lessons/projects/${this.players[i].hand[j].suit}.png" alt="" width="50" height="50">
                    </div>
                    <div class="text-center">
                        <p class="m-0">${this.players[i].hand[j].rank}</p>
                    </div>
                </div>`
            }

            actingPlayersDom += `<div id="playersDiv" class="d-flex justify-content-center">
            <div id="nonCurPlayer1Div" class="flex-column">
                <p class="m-0 text-white text-center rem3">${this.players[i].name}</p>
                <div class="text-white d-flex m-0 p-0 justify-content-between">
                    <p class="rem1 text-left">S:${this.players[i].gameStatus} </p>
                    <p class="rem1 text-left">B:${this.players[i].bet} </p>
                    <p class="rem1 text-left">R:${this.players[i].chips} </p>
                </div>
                <div class="d-flex justify-content-center">
                    ${actingCardsDom}
                </div>
            </div>`
        }
        
        var actingHouseDiv = document.getElementById("actingHouseDiv")
        var actingPlayersDiv = document.getElementById("actingPlayersDiv")
        bettingDom.classList.add("hide-dom")
        actingDom.classList.remove("hide-dom")
        actingHouseDiv.innerHTML = actingHouseDom
        actingPlayersDiv.innerHTML = actingPlayersDom
      }else if(this.gamePhase == "gameOver"){
        actingDom.classList.add("hide-dom")
        gameOverDom.classList.remove("hide-dom")
        let resultLogDiv = document.getElementById("resultLog")
        let resultLogPrint = ``
        for(let i = 0; i < this.resultsLog.length; i++){
            let round = i + 1
            resultLogPrint += '<div class="d-block"><p>round' + round + ':<br></p>'

            for(let j = 0; j < this.resultsLog[i].length; j++){
             resultLogPrint += '<p>' + this.resultsLog[i][j] + '<br></p>'
            }
            resultLogPrint += '</div>'
        }

        resultLogDiv.innerHTML += resultLogPrint
        
      }
    }

    /*
        return Boolean : テーブルがプレイヤー配列の最初のプレイヤーにフォーカスされている場合はtrue、そうでない場合はfalseを返します。
    */
    onFirstPlayer()
    {
        //TODO: ここから挙動をコードしてください。
        return this.getTurnPlayer() == this.players[0];
    }

    /*
        return Boolean : テーブルがプレイヤー配列の最後のプレイヤーにフォーカスされている場合はtrue、そうでない場合はfalseを返します。
    */
    onLastPlayer()
    {
        //TODO: ここから挙動をコードしてください。
        return this.getTurnPlayer() == this.players[this.players.length - 1];
    }
    
    /*
        全てのプレイヤーがセット{'broken', 'bust', 'stand', 'surrender'}のgameStatusを持っていればtrueを返し、持っていなければfalseを返します。
    */
    allPlayerActionsResolved()
    {
        //TODO: ここから挙動をコードしてください。
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].gameStatus == "betting" || this.players[i].gameStatus == "acting"){
                return false
            }
        }
        return true;
    }
}

function createTable(name,game){
    let table = new Table(name,game)
    table.renderTable()
    return table
}

let startBtn = document.getElementById("start-game")
let bettingBtn = document.getElementById("betting-btn")

let table = null
startBtn.addEventListener("click",()=>{
    let name = document.getElementById("name")
    let game = document.getElementById("game")
    table = createTable(name.value, game.value)
})

bettingBtn.addEventListener("click",()=>{
    let select1 = document.getElementById("betInput1").value
    let select2 = document.getElementById("betInput2").value
    let select3 = document.getElementById("betInput3").value
    let select4 = document.getElementById("betInput4").value
    let totalBet = select1 * table.betDenominations[0] + select2 * table.betDenominations[1] + select3 * table.betDenominations[2] + select4 * table.betDenominations[3]
    table.haveTurn(totalBet)
})

let surrenderBtn = document.getElementById("surrender")
let standBtn = document.getElementById("stand")
let hitBtn = document.getElementById("hit")
let doubleBtn = document.getElementById("double")
let plusBtn = document.getElementById("betPlus")
let reTryBtn = document.getElementById("reTryBtn")
let gameOverDom = document.getElementById("gameOverDom")
let startGameDom = document.getElementById("startGameDom")

standBtn.addEventListener("click",()=>{
    table.haveTurn("stand")
})

surrenderBtn.addEventListener("click",()=>{
    table.haveTurn("surrender")
})

hitBtn.addEventListener("click",()=>{
    table.haveTurn("hit")
    // ここでhaveTurn書いてしまうと、hitにしたときに次のアクションが自動的に決められてしまう
})
doubleBtn.addEventListener("click",()=>{
    table.haveTurn("double")
})

reTryBtn.addEventListener("click", ()=>{
    gameOverDom.classList.add("hide-dom")
    startGameDom.classList.remove("hide-dom")
})