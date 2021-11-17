class Highscore {
  constructor(name, score) {
    this.name = name;
    this.score = score;
  }
}

// board array
let board = [];
let field = [];
let wordList = [];

let highScores = [];
let lastCellArray = [];
let index = 0;
let playerName = "";
let selectedString = "";
let currentScore = 0;


// fill board with cells containing random letters
function getBox() {
  $.ajax({
    url: "https://localhost:44391/api/boggle/getbogglebox",
    type: 'GET',
    contentType: "application/json",
    dataType: 'json'
  }
  ).done(function (data, textStatus, jqXHR) {
    boggleBox = data;
    fillTable();
  }).fail(function (jqXHR, textStatus, errorThrown) {
    console.log("Error: " + textStatus + "\t" + errorThrown.toString());
  });
}

function scoreWord() {
  word = wordList[wordList.length - 1]
  if (word.length > 2) {
    id = boggleBox.boggleBoxId;

    $.ajax({
      url: "https://localhost:44391/api/boggle/isvalidword/" + id + "/" + word,
      type: 'GET',
      contentType: "application/json",
      dataType: 'json'
    }
    ).done(function (data, textStatus, jqXHR) {
      score = data;
      if (score > 0) {
        updateScore(word, score);
      }
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.log("Error: " + textStatus + "\t" + errorThrown.toString());
    });
  }
}

// table HTML

let table_body = '<table id="board" border="1">';

let word_view = '<div class="wordview" id="wordview"> </div>';

let highscore_view = '<div class="highscoreview" id="highscoreview"> High scores: </div>';

let name_view = '<div id="nameview">Player: </div><br>';

for (let i = 0; i < 4; i++) {
  table_body += '<tr>';

  for (let j = 0; j < 4; j++) {
    table_body += '<td class="cell">';
    table_body += '</td>';
  }
  table_body += '</tr>';
}
table_body += '</table>';

// fills table
function fillTable() {
  let cnt = 0;
  for (let i = 0; i < boggleBox.dice.length; i++) {
    for (let j = 0; j < boggleBox.dice.length; j++) {
      $("#board .cell").eq(cnt++).html(boggleBox.dice[i][j].value);
    }
  }
}

// clear selectedString and unselect cells
function clear() {
  selectedString = "";
  lastCellArray = [];

  $(".cell").css({
    "background-color": "transparent",
  });
}


// add selectedString to 
function submit() {
  if (selectedString.length >= 3 && $.inArray(selectedString, wordList) == -1) {
    wordList.push(selectedString);
    scoreWord();
  }
  clear();
}


// check if the clicked cell is adjacent to the previous clicked cell
function adjacencyCheck(e) {
  if (lastCellArray.length == 0) {
    return true
  }
  let cellIndex = e.cellIndex;
  let rowIndex = e.parentNode.rowIndex;

  let lastCell = lastCellArray[lastCellArray.length - 1];

  let lastCellX = lastCell.cellIndex;
  let lastCellY = lastCell.parentNode.rowIndex;

  if (Math.abs(cellIndex - lastCellX) < 2 && Math.abs(rowIndex - lastCellY) < 2) {
    return true;
  }
  return false;
}

// set selected to true and change color of cells
function select(e) {
  let letter = e.innerText;

  if (!lastCellArray.includes(e)) {
    if (adjacencyCheck(e)) {
      $(e).css({
        "background-color": "red",
      });

      selectedString += letter;
      lastCellArray.push(e);
    }
  } else {
    if (e == lastCellArray[lastCellArray.length - 1]) {
      $(e).css({
        "background-color": "transparent",
      });

      selectedString = selectedString.replace(letter, '');
      lastCellArray.pop();
    }
  }
}


function reset() {
  $(".wordview").empty();
  start = false;
  $('#timer').text(180 + " Seconds");
  duration = 180;
  $("#score").text(0 + " Points");
  currentScore = 0;
  wordList.length = 0;
  $("#board .cell").empty();
  board = [];
  clear();
};



// button_submit
let button_submit =
  '<input id="button-submit" type="button" value="submit"/>';

// button_start
let button_start =
  '<input id="button-start" type="button" value="start"/>';

// button_reset
let button_reset =
  '<input id="button-reset" type="button" value="reset"/>';

let button_finish =
  '<input id="button-finish" type="button" value="finish"/>';

// name field
let enter_name =
  '<br><input id="name_entry" type="text" name="name_entry" placeholder="name"/><br>';

// timer: once in a while, if start == true then countdown 
//  when duration reaches < 1, sets duration = 1, calls function
let duration = 180;
let start = false;
let timer_HTML = '<div id="timer">' + duration + ' Seconds</div><br>';
let interval = setInterval(function () {

  if (start) {
    $('#timer').text((duration -= 1)
      + " Seconds");

    if (duration < 1) {
      duration = 1;
      highScore = new Highscore(playerName, currentScore);
      highScores.push(highScore);
      start = false;
      highScores.sort(highScoreSort);
      printHighScores(highScores);
      reset();

    }
  }

}, 1000);

// starts timer
function timerStart() {
  start = true;
}

function highScoreSort(a, b) {
  var aScore = a.score;
  var bScore = b.score;

  return ((aScore < bScore) ? 1 : ((aScore > bScore) ? -1 : 0));
}

function printHighScores(highScores) {
  $(".highscoreview").empty();
  $(".highscoreview").append("<div> High scores: </div>")
  highScores.forEach(highScore => {
    $(".highscoreview").append('<div>' + highScore.name + ":" + highScore.score + '</div>');

  })
}

// score
let score_HTML = "<div id='score'>" + currentScore + " Points </div><br>";

// updates score
function updateScore(word, score) {
  currentScore += score;
  $("#score").text(currentScore + " Points");
  $(".wordview").append('<div>' + word + '</div>');
}

// onready
$(document).ready(function () {

  // append html
  $("body").append(table_body);
  $("body").append(button_submit);
  $("body").append(button_start);
  $("body").append(button_reset);
  $("body").append(button_finish);
  $("body").append(enter_name);
  $("body").append(name_view);
  $("body").append(timer_HTML);
  $("body").append(score_HTML);
  $("body").append(word_view);
  $("body").append(highscore_view);


  // document css
  $("html").css({
    "font-family": "'Lucida Console', Courier, monospace",
  });

  // board/table css
  $("#board").css({
    "-webkit-touch-callout": "none",
    "-webkit-user-select": "none",
    "-khtml-user-select": "none",
    "-moz-user-select": "none",
    "-ms-user-select": "none",
    "user-select": "none",

    "margin-left": "auto",
    "margin-right": "auto",

    "table-layout": "fixed",
    "height": "320px",
    "width": "320px",

    "text-align": "center",
    "float": "left",
  });

  // cell css
  $("#board .cell").css({
    "cursor": "pointer",

  });

  $("#wordview").css({
    "width": "200px",
    "float": "left"
  });

  $("#highscoreview").css({
    "width": "200px",
    "float": "right"
  })

  $("#nameview").css({
    "width": "200px",
    "float": "left"
  })

  $("#score").css({    
    "float": "left"
  })

  $("#timer").css({
    "float": "left"
  })

  // cell click
  $("#board .cell").click(function (e) {
    if (start) {
      select(this);
    }
    e.preventDefault();
  });

  // button submit click
  $("#button-submit").click(function (e) {
    submit();
    e.preventDefault();

  });

  $("#button-reset").click(function (e) {
    reset();

  });

  $("#button-finish").click(function (e) {
    duration = 0;
  });

  // button start click
  $("#button-start").click(function (e) {
    if ($("#name_entry").val().length > 2) {
      getBox();
      playerName = $("#name_entry").val();
      $("#nameview").text(' Player:' + playerName);
      timerStart();
      e.preventDefault();
    }
  });
});
