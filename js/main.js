'use strict'

const MINE = '🧨'
var gBoard = []
var gLevel = {
    size: 4,
    mines: 2
}
const gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: 0,
    secsPassed: 0
}

function onInit() {
    gBoard = buildBoard(gLevel.size)
    renderBoard(gBoard)
}

var cell = createCell()
// console.log('cell:', cell);
function createCell() {
    var cell = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: true
    }
    return cell
}
var b = buildBoard(gLevel.size)

function buildBoard(size) {
    for (var i = 0; i < size; i++) {
        gBoard.push([])
        for (var j = 0; j < size; j++) {
            gBoard[i][j] = createCell()
        }
        console.log(gBoard)
    }
    gBoard[1][1].isMine = true
    gBoard[2][3].isMine = true
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
            else if (currCell.isMine === false) {
                currCell.minesAroundCount = setMinesNegsCount(i, j)
            }
            strHTML += `<td class="${cellClass}"
                        onclick="cellClicked(this,${i},${j})">
                        ${currCell.minesAroundCount}
                        </td>`
        }
        strHTML += `</tr>`
    }
    // console.log('strHTML:',strHTML)
    const elBoard = document.querySelector('.board')
    elBoard.innerHTML = strHTML
    return gBoard
}
// var count = setMinesNegsCount(1,2)
// console.log('count:', count);
function setMinesNegsCount(cellI, cellJ) {
    var negsCount = ''
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

function cellClicked(elCell, cellI, cellJ) {
     elCell.classList.add('show')
    if (gBoard[cellI][cellJ].isMine !== true) {
        var currMinesNegsCount = elCell.minesNegsCount
        currMinesNegsCount = setMinesNegsCount(cellI, cellJ)
    }
    return currMinesNegsCount
}

// function checkGameOver() {

// }

// function expandShown(board, elCell, i, j) {

// }
// function openNumsMinesNegs(){
//     var elModal = document.querySelector('.')
// }