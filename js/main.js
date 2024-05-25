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
var gSafeClick

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
    gSafeClick = 3
    var elSpan = document.querySelector('.safe-click span')
    elSpan.innerText = 'safe clicks ' + gSafeClick

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
    var cell = gBoard[cellI][cellJ]
    if (gIsFirstClick) {
        startTimer()
        gIsFirstClick = false
    }
    if (cell.isShown || cell.isMarked) return
    cell.isShown = true
    gGame.shownCount++
    cell.minesNegsCount = setMinesNegsCount(cellI, cellJ)
    elCell.classList.add('clicked')
    elCell.innerHTML = cell.minesAroundCount > 0 ? cell.minesAroundCount : EMPTY
    if (cell.isMine) {
        elCell.innerHTML = MINE
        playSound()
        gLives--
        var lives = document.querySelector('.lives')
        lives.innerText = gLives + '❤️'
        checkGameOver()
        elCell.classList.add('shake')
    } else {
        if (cell.minesAroundCount === 0) {
            expandShown(gBoard, elCell, cellI, cellJ)
        }
        colorNum(elCell)
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
        gGame.isOn = false
    }
}

function isVictory() {
    var totalCells = gBoard.length ** 2
    if (gGame.shownCount + gGame.markedCount === totalCells &&
        gGame.markedCount === gLevel.mines) {
        var elEmoji = document.querySelector('.emoji')
        elEmoji.innerText = '🥳'
        onOpenModal()
        clearInterval(gTimerInterval)
        gGame.isOn = false
        onInit()
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
            colorNum(elCurrNeg)
            if (currCell.minesAroundCount === 0) {
                expandShown(board, elCurrNeg, i, j);
            }
        }
    }
}

function onSafeCell() {
    var emptyCells = []
    for (var i = 0; i < gBoard.length; i++) {
        for (var j = 0; j < gBoard.length; j++) {
            var currCell = gBoard[i][j]
            if (currCell.isMine || currCell.isShown || currCell.isMarked) continue
            var obj = { i, j }
            emptyCells.push(obj)
        }
    }
    var idx = getRandomInt(0, emptyCells.length)
    var safeCell = emptyCells[idx]
    var elSafeCell = document.querySelector(`.cell-${safeCell.i}-${safeCell.j}`)
    if (gSafeClick <= 0) return
    gSafeClick--
    elSafeCell.classList.add('safe')
    setTimeout(() => {
        elSafeCell.classList.remove('safe')
    }, 3000);
    var elSpan = document.querySelector('.safe-click span')
    elSpan.innerText = 'safe clicks ' + gSafeClick
}
function colorNum(elCell) {
    if (elCell.innerText === '1') elCell.style.color = 'blue'
    if (elCell.innerText === '2') elCell.style.color = 'green'
    if (elCell.innerText === '3') elCell.style.color = 'red'
    if (elCell.innerText === '4') elCell.style.color = 'purple'
    if (elCell.innerText === '5') elCell.style.color = 'orange'

}