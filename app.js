var DATA_URL = "./html-quiz.json";

var state = {
  questions: [],
  order: [],
  index: 0,
  filterDay: "all",
  correct: 0,
  wrong: 0,
  answered: {},
};

var dayButtons = document.querySelectorAll(".pill-btn");
var questionText = document.getElementById("questionText");
var descText = document.getElementById("descText");
var topicText = document.getElementById("topicText");
var choicesArea = document.getElementById("choicesArea");
var feedbackArea = document.getElementById("feedbackArea");
var judgeText = document.getElementById("judgeText");
var explainText = document.getElementById("explainText");

var progressText = document.getElementById("progressText");
var correctText = document.getElementById("correctText");
var wrongText = document.getElementById("wrongText");
var barFill = document.getElementById("barFill");

document.getElementById("btnNext").onclick = next;
document.getElementById("btnPrev").onclick = prev;

for(var i=0;i<dayButtons.length;i++){
  dayButtons[i].onclick = function(){
    var selectedDay = this.getAttribute("data-day");
    state.filterDay = selectedDay;

    // active 처리
    for(var j=0;j<dayButtons.length;j++){
      dayButtons[j].classList.remove("active");
    }
    this.classList.add("active");

    restart(false);
  };
}

document.getElementById("btnShuffle").onclick = function(){
  shuffle(state.order);
  state.index = 0;
  render();
};

document.getElementById("btnReset").onclick = function(){
  state.filterDay = "all";

  // Day 버튼 active 초기화
  for(var i=0;i<dayButtons.length;i++){
    dayButtons[i].classList.remove("active");
    if(dayButtons[i].getAttribute("data-day")==="all"){
      dayButtons[i].classList.add("active");
    }
  }

  restart(false); // 순서대로
};



function shuffle(arr) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = arr[i];
    arr[i] = arr[j];
    arr[j] = t;
  }
}

function buildOrder() {
  state.order = [];
  for (var i = 0; i < state.questions.length; i++) {
    if (
      state.filterDay === "all" ||
      String(state.questions[i].day) === state.filterDay
    ) {
      state.order.push(i);
    }
  }
}

function render() {
  var q = state.questions[state.order[state.index]];
  if (q.topic) {
    topicText.textContent = "Day " + q.day + " · " + q.topic;
  } else {
    topicText.textContent = "Day " + q.day;
  }
  questionText.textContent = q.prompt;
  descText.textContent = q.desc || "";

  choicesArea.innerHTML = "";
  feedbackArea.style.display = "none";

  for (var i = 0; i < 4; i++) {
    var b = document.createElement("button");
    b.className = "choiceBtn";
    b.textContent = q.choices[i];
    b.dataset.idx = i;
    b.onclick = choose;
    choicesArea.appendChild(b);
  }

  updateStatus();
}

function choose(e) {
  var idx = Number(e.target.dataset.idx);
  var q = state.questions[state.order[state.index]];

  if (idx === q.answerIndex) {
    e.target.classList.add("correct");
    state.correct++;
    judgeText.textContent = "정답";
  } else {
    e.target.classList.add("wrong");
    state.wrong++;
    judgeText.textContent = "오답";
  }

  explainText.textContent = q.explanation;
  feedbackArea.style.display = "block";

  var btns = document.querySelectorAll(".choiceBtn");
  for (var i = 0; i < btns.length; i++) btns[i].disabled = true;

  updateStatus();
}

function updateStatus() {
  var total = state.order.length;
  progressText.textContent = state.index + 1 + "/" + total;
  correctText.textContent = state.correct;
  wrongText.textContent = state.wrong;
  barFill.style.width = ((state.index + 1) / total) * 100 + "%";
}

function next() {
  if (state.index < state.order.length - 1) {
    state.index++;
    render();
  }
}

function prev() {
  if (state.index > 0) {
    state.index--;
    render();
  }
}

function restart(shuffleOn) {
  state.index = 0;
  state.correct = 0;
  state.wrong = 0;
  buildOrder();
  if (shuffleOn) shuffle(state.order);
  render();
}

fetch(DATA_URL)
  .then((r) => r.json())
  .then((d) => {
    state.questions = d.questions;
    restart(false);
  });

