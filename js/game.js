'use strict'

storageDataRecord();
const MINE = '💣';
const FLAG = '🚩';
const HINT = '💡';
const SAD_SMILE = '🤕';
const SUN_SMILE = '😎';
const NORMAL_SMILE = '🙂';
const LIVE = '👻';

var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0, lives: [LIVE], hints: 3 }
var gLevel = { LEVEL: 'Easy', SIZE: 4, MINES: 2 };
var gBoard;
var gTimerInterval;
var gIsFirstRightClick;
var gIsHintClicked;

function initGame() {
    gGame.isOn = true;
    gIsFirstRightClick = false;
    gIsHintClicked = false;
    gGame.shownCount = 0;
    gGame.hints = 3;
    gGame.markedCount = 0;
    gGame.secsPassed = 0;
    if (gTimerInterval) stopTimer();
    gTimerInterval = null;
    renderButtons();
    renderHint(HINT);
    renderSmiley(NORMAL_SMILE);
    renderTimer();
    buildBoard();
    document.querySelector('.game-over').innerText = '';
    document.querySelector('.lives span').innerText = gGame.lives + ' Lives left';
}

function setGameLevel(value) {
    if (value === 'Easy') {
        gLevel.SIZE = 4;
        gLevel.MINES = 2;
        gLevel.LEVEL = 'Easy';
    }

    else if (value === 'Medium') {
        gLevel.SIZE = 8
        gLevel.MINES = 12;
        gLevel.LEVEL = 'Medium';
    }

    else if (value === 'Expert') {
        gLevel.SIZE = 12;
        gLevel.MINES = 30;
        gLevel.LEVEL = 'Expert';
    }
    initGame();
}

function buildBoard() {
    gBoard = initBoard(gLevel.SIZE);
    placeRandomMinesOnBoard(gLevel.SIZE, gLevel.MINES);
    setMinesNegsCount();
    renderBoard(gBoard, '.board');
}

function initBoard(SIZE) {
    var board = new Array(SIZE);
    for (var i = 0; i < board.length; i++) {
        board[i] = new Array(SIZE);
    }
    for (var i = 0; i < SIZE; i++) {
        for (var j = 0; j < SIZE; j++) {
            var cell = { minesAroundCount: 4, isShown: false, isMine: false, isMarked: false };
            board[i][j] = cell;
        }
    }
    return board;
}

function setMinesNegsCount() {
    for (var i = 0; i < gLevel.SIZE; i++) {
        for (var j = 0; j < gLevel.SIZE; j++) {
            var resCount = checkNeighborsOfMines(gBoard, i, j);
            gBoard[i][j].minesAroundCount = resCount;
        }
    }
}

function cellClicked(i, j) {
    if (!gGame.isOn) return;
    if (gBoard[i][j].isMarked === true) return;
    if (gGame.shownCount === 0 && gGame.markedCount === 0) {
        while (gBoard[i][j].isMine === true) {
            buildBoard();
        }
        startTimer();
    }
    if (gBoard[i][j].isShown === false) {
        if (gIsHintClicked) {
            revealCellNeighbors(i, j);
            gIsHintClicked = false;
            return;
        }
        if (gBoard[i][j].isMine === true) {
            gBoard[i][j].isShown = true;
            renderCell({ i: i, j: j }, MINE);
            gGame.markedCount++;
            gGame.lives.pop();
            var lives = getLives();
            document.querySelector('.lives span').innerText = lives + ' Lives left';
            document.querySelector('.smiley').innerHTML
        }
        if (gBoard[i][j].isMine === false && gBoard[i][j].isMarked === false) {
            if (gBoard[i][j].minesAroundCount > 0) {
                gBoard[i][j].isShown = true;
                gGame.shownCount++;
                renderCell({ i: i, j: j }, gBoard[i][j].minesAroundCount);
            }
            if (gBoard[i][j].minesAroundCount === 0) {
                recursiveExpandShown(i, j, 0);
            }
        }
    }
    isGameOver();
}

function getLives() {
    var strHTMLLives = '';
    if (gGame.lives.length > 0) {
        for (var i = 0; i < gGame.lives.length; i++) {
            strHTMLLives += gGame.lives[i];
            strHTMLLives += ' ';
        }
        return strHTMLLives;
    } else return strHTMLLives = 'None';
}

function cellMarked(i, j) {
    if (!gGame.isOn) return;
    if (gGame.markedCount === 0 && !gIsFirstRightClick) {
        startTimer();
        gIsFirstRightClick = true;
    }
    if (gBoard[i][j].isShown === false) {
        if (gBoard[i][j].isMarked === false) {
            gGame.markedCount++;
            gBoard[i][j].isMarked = true;
            renderCell({ i: i, j: j }, FLAG);
        } else {
            gGame.markedCount--;
            gBoard[i][j].isMarked = false;
            renderCell({ i: i, j: j }, '');
        }
    }
    isGameOver();
}

function placeRandomMinesOnBoard(SIZE) {
    var countMines = gLevel.MINES;
    while (countMines > 0) {
        var randomI = getRandomIntInclusive(0, SIZE - 1);
        var randomJ = getRandomIntInclusive(0, SIZE - 1);
        if (gBoard[randomI][randomJ].isMine === false) {
            gBoard[randomI][randomJ].isMine = true;
            countMines--;
        }
    }
}


function isGameOver() {
    // if its a victory
    if (gGame.shownCount === gLevel.SIZE ** 2 - gLevel.MINES && gGame.markedCount === gLevel.MINES) {
        stopTimer();
        gGame.isOn = false;
        renderSmiley(SUN_SMILE);
        updateAndRenderDataBase();
        document.querySelector('.game-over').innerText = 'YOU WON!';
    }
    // if its a loose
    if (gGame.lives.length === 0) {
        stopTimer();
        for (var i = 0; i < gBoard.length; i++) {
            for (var j = 0; j < gBoard.length; j++) {
                if (gBoard[i][j].isShown === false && gBoard[i][j].isMine === true) {
                    // gBoard[i][j].mine = MINE;
                    renderCell({ i: i, j: j }, MINE);
                }
            }
        }
        document.querySelector('.game-over').innerText = 'YOU LOOSE!';
        renderSmiley(SAD_SMILE);
        gGame.isOn = false;
    }
}

function updateAndRenderDataBase() {
    var elBestScore = document.querySelectorAll('.best-score h2 span');
    updateDataBaseRecord()
    if (gLevel.LEVEL === 'Easy') {
        elBestScore[0].innerText = ' ' + localStorage.getItem(gLevel.LEVEL);
    } else if (gLevel.LEVEL === 'Medium') {
        elBestScore[1].innerText = ' ' + localStorage.getItem(gLevel.LEVEL);
    } else {
        elBestScore[2].innerText = ' ' + localStorage.getItem(gLevel.LEVEL);
    }
}

function updateDataBaseRecord() {
    if (localStorage.getItem(gLevel.LEVEL) === '0') {
        localStorage.setItem(gLevel.LEVEL, gGame.secsPassed);

    } else {
        if (gGame.secsPassed < localStorage.getItem(gLevel.LEVEL)) {
            localStorage.setItem(gLevel.LEVEL, gGame.secsPassed);
        }
    }
}

function startTimer() {
    if (!gTimerInterval) {
        gTimerInterval = setInterval(function () {
            document.querySelector('.timer span').innerText = " " + ++gGame.secsPassed;
        }, 1000)
    }
}

function stopTimer() {
    clearInterval(gTimerInterval);
}

function recursiveExpandShown(row, col, level) {
    if (row < 0 || col < 0 || row >= gBoard.length || col >= gBoard.length) return;
    if (gBoard[row][col].isShown === true) return;
    if (gBoard[row][col].isMine === true) return;
    if (gBoard[row][col].isMarked === true) return;
    if (gBoard[row][col].minesAroundCount > 0) {
        gBoard[row][col].isShown = true;
        renderCell({ i: row, j: col }, gBoard[row][col].minesAroundCount);
        gGame.shownCount++;
        return;
    }
    gBoard[row][col].isShown = true;
    renderCell({ i: row, j: col }, gBoard[row][col].minesAroundCount);
    gGame.shownCount++;
    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (i != row || j != col) {
                recursiveExpandShown(i, j, level + 1);
            }
        }
    }
}

function renderSmiley(smiley) {
    gGame.lives = [];
    var elSmile = document.querySelector('.smiley');
    if (gLevel.SIZE === 4) {
        gGame.lives = [LIVE];
    } else {
        for (var i = 0; i < 3; i++) {
            gGame.lives.push(LIVE);
        }
    }
    var strHTML = `<button id="cell-button" onclick="initGame()">${smiley}</button>`
    elSmile.innerHTML = strHTML;
}

function renderHint(emoji) {
    var elHint = document.querySelector('.hint');
    var strHTML = '';
    for (var i = 0; i < 3; i++) {
        strHTML += `<button class="hint-emoji" onclick="hint(this)">${emoji}</button>`
        elHint.innerHTML = strHTML;
    }
}

function hint(elHint) {
    gIsHintClicked = true;
    gGame.hints--;
    elHint.style.display = 'none';
}

function storageDataRecord() {
    localStorage.setItem('Easy', 0);
    localStorage.setItem('Medium', 0);
    localStorage.setItem('Expert', 0);
}

function renderTimer() {
    var elTimer = document.querySelector('.timer');
    var strHTML = '<h2 class="time">Time: <span></span></h2>';
    elTimer.innerHTML = strHTML;
}

function renderButtons() {
    var elButton = document.querySelector('.button');
    var strHTML = '';
    strHTML += '<button onclick="setGameLevel(this.innerText)">Easy</button>';
    strHTML += '<button onclick="setGameLevel(this.innerText)">Medium</button>';
    strHTML += '<button onclick="setGameLevel(this.innerText)">Expert</button>';
    elButton.innerHTML = strHTML;
}

function revealCellNeighbors(row, col) {
    var revealCells = [];
    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (i < 0 || j < 0 || i >= gBoard.length || j >= gBoard.length || gBoard[i][j].isMarked === true) continue;
            var tempObj = {
                location: { i: i, j: j }, isShown: gBoard[i][j].isShown, isMine: gBoard[i][j].isMine, isMarked: gBoard[i][j].isMarked,
                minesAroundCount: gBoard[i][j].minesAroundCount
            };
            if (tempObj.isShown === false) {
                if (tempObj.isMine === true) renderCell(tempObj.location, MINE);
                else {
                    renderCell(tempObj.location, tempObj.minesAroundCount);
                }
            }
            revealCells.push(tempObj);
        }
    }
    setTimeout(function () {
        for (var i = 0; i < revealCells.length; i++) {
            if (revealCells[i].isShown === false) {
                renderCell(revealCells[i].location, '');
            }
        }
    }, 1000);
}