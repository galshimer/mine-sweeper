'use strict'

const MINE = '💣'
const EMPTY = ''
const FLAG = '🚩'
var gBoard
var gTimerInterval
var gStartTime
var gIsFirstClick = true
var gLives = 3
var gIsDark = false

var gLevel = {
    size: 4,
    mines: 3,
}
const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function onInit() {
    resetTimer()

    gLives = 3
    gBoard = buildBoard(gLevel.size)
    renderBoard(gBoard)
    gIsFirstClick = true
    var lives = document.querySelector('.lives')
    lives.innerText = gLives + ' ❤️'
    var elEmoji = document.querySelector('.emoji')
    elEmoji.innerText = '😄'
    onCloseModal()

}

function createCell() {
    var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false
    }
    return cell
}

function buildBoard(size) {
    gBoard = []
    for (var i = 0; i < size; i++) {
        gBoard.push([])
        for (var j = 0; j < size; j++) {
            gBoard[i][j] = createCell()
        }
    }
    console.table(gBoard)
    for (var i = 0; i < gLevel.mines; i++) {
        gBoard[getRandomInt(0, gLevel.size)][getRandomInt(0, gLevel.size)].isMine = true
    }
    return gBoard
}

function renderBoard(board) {
    var strHTML = ''
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>'
        for (var j = 0; j < board[i].length; j++) {
            var currCell = board[i][j]
            var cellClass = getClassName({ i: i, j: j })
            if (currCell.isMine) cellClass += 'mine'
            else if (!currCell.isMine) {
                currCell.minesAroundCount = setMinesNegsCount(i, j)
            }
            strHTML += `<td class="${cellClass}"
                        onclick="onCellClicked(this,${i},${j})"
                        oncontextmenu="onCellIsMarked(event,this,${i},${j})">
                        </td>`
        }
        strHTML += `</tr>`
    }

    // console.log('strHTML:',strHTML)
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
    return board
}

function onCellClicked(elCell, cellI, cellJ) {
    if (gLives === 0) return
    if (gIsFirstClick) {
        startTimer()
        gIsFirstClick = false
    }
    var cell = gBoard[cellI][cellJ]
    if (cell.isShown || cell.isMarked) return
    cell.isShown = true
    gGame.shownCount++
    cell.minesNegsCount = setMinesNegsCount(cellI, cellJ)
    elCell.classList.add('clicked')
    elCell.innerHTML = cell.minesAroundCount > 0 ? cell.minesAroundCount : EMPTY
    if (cell.isMine) {
        elCell.innerHTML = MINE
        gLives--
        var lives = document.querySelector('.lives')
        lives.innerText = gLives + '❤️'
        checkGameOver()
    } else {
        if (cell.minesAroundCount === 0)
            expandShown(gBoard, elCell, cellI, cellJ)
    }
    isVictory()
}

function setMinesNegsCount(cellI, cellJ) {
    var negsCount = 0
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= gBoard.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= gBoard[i].length) continue
            if (i === cellI && j === cellJ) continue
            if (gBoard[i][j].isMine === true) negsCount++
        }
    }
    return negsCount
}

function chooseLevelSize(elBtn) {
    var size = +elBtn.dataset.size
    gLevel.size = size
    if (gLevel.size === 4) gLevel.mines = 3
    else if (gLevel.size === 8) gLevel.mines = 14
    else gLevel.mines = 32
    onInit()
}

function startTimer() {
    gStartTime = Date.now()
    gTimerInterval = setInterval(() => {
        var seconds = ((Date.now() - gStartTime) / 1000).toFixed(2);
        var elSpan = document.querySelector('.timer');
        elSpan.innerText = seconds
    }, 10);
}

function resetTimer() {
    clearInterval(gTimerInterval)
    var elSpan = document.querySelector('.timer')
    elSpan.innerText = '0.00'
}

function onCloseModal() {
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'none'
}

function onOpenModal() {
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'block'
}

function onDarkMode(elBtn) {
    var body = document.querySelector('body')
    if (body.classList.contains('dark')) {
        body.classList.remove('dark')
        elBtn.innerText = 'Dark Mode'
    } else {
        body.classList.add('dark')
        elBtn.innerText = 'Light Mode'
    }
    gIsDark = !gIsDark
}

function checkGameOver() {
    if (gLives === 0) {
        clearInterval(gTimerInterval)
        onOpenModal()
        var elEmoji = document.querySelector('.emoji')
        elEmoji.innerText = '😵‍💫'
    }
}

function isVictory() {
    var totalCells = gBoard.length * gBoard[0].length
    if (gGame.shownCount + gGame.markedCount === totalCells &&
        gGame.markedCount === gLevel.mines) {
        var elEmoji = document.querySelector('.emoji')
        elEmoji.innerText = '🥳'
        onOpenModal()
        clearInterval(gTimerInterval)
    }
}

function onCellIsMarked(event, elCell, cellI, cellJ) {
    event.preventDefault()
    // if (elCell.innerText)
    var cell = gBoard[cellI][cellJ]
    if (cell.isMarked) {
        gGame.markedCount--
        cell.isMarked = false
        elCell.innerText = EMPTY
    } else {
        gGame.markedCount++
        cell.isMarked = true
        elCell.innerText = FLAG
    }
    isVictory()
}

function expandShown(board, elCell, cellI, cellJ) {
    for (var i = cellI - 1; i <= cellI + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = cellJ - 1; j <= cellJ + 1; j++) {
            if (j < 0 || j >= board[i].length) continue
            if (i === cellI && j === cellJ) continue
            var currCell = board[i][j]
            var elCurrNeg = document.querySelector(`.cell-${i}-${j}`)
            if (currCell.isMine) continue
            if (currCell.isShown) continue
            currCell.isShown = true
            gGame.shownCount++
            currCell.minesAroundCount = setMinesNegsCount(i, j)
            elCurrNeg.classList.add('clicked')
            elCurrNeg.innerHTML = currCell.minesAroundCount > 0 ? currCell.minesAroundCount : EMPTY

            if (currCell.minesAroundCount === 0) {
                expandShown(board, elCell, i, j);
            }
        }
    }
}
