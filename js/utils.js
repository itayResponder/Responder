'use strict';

function getRandomIntInclusive(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function renderBoard(board, selector) {
    var strHTML = '<table border="2"><tbody>';
    for (var i = 0; i < board.length; i++) {
        strHTML += '<tr>';
        for (var j = 0; j < board[0].length; j++) {
            strHTML += `<td id=cell-${i}-${j} oncontextmenu="cellMarked(${i},${j}, this);return false;" onclick="cellClicked(${i},${j}, this)"></td>`
        }
        strHTML += '</tr>'
    }
    strHTML += '</tbody></table>';
    var elContainer = document.querySelector(selector);
    elContainer.innerHTML = strHTML;
}

function getCellIdName(strCellId) {
    var parts = strCellId.split('-')
    var nameId = parts[0];
    return nameId;
}

function checkNeighborsOfMines(board, row, col) {
    var count = 0;
    for (var i = row - 1; i <= row + 1; i++) {
        for (var j = col - 1; j <= col + 1; j++) {
            if (i < 0 || j < 0 || i >= board.length || j >= board.length) continue;
            if (i === row && j === col) continue;
            if (board[i][j].isMine === true) {
                count++;
            }
        }
    }
    return count;
}

function renderCell(location, value) {
    var elCell = document.querySelector(`#cell-${location.i}-${location.j}`);
    elCell.innerHTML = value;
}
