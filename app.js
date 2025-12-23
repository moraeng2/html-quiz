(function(){
  "use strict";

  var DATA_URL = "./html-quiz.json";

  var state = {
    subject: "HTML",
    questions: [],
    order: [],
    index: 0,
    answeredMap: {},     // qid -> { chosenIndex, isCorrect }
    correct: 0,
    wrong: 0
  };

  // DOM
  var subjectText = document.getElementById("subjectText");
  var progressText = document.getElementById("progressText");
  var correctText = document.getElementById("correctText");
  var wrongText = document.getElementById("wrongText");
  var barFill = document.getElementById("barFill");

  var topicText = document.getElementById("topicText");
  var qidText = document.getElementById("qidText");
  var questionText = document.getElementById("questionText");
  var descText = document.getElementById("descText");
  var choicesArea = document.getElementById("choicesArea");

  var feedbackArea = document.getElementById("feedbackArea");
  var judgeText = document.getElementById("judgeText");
  var explainText = document.getElementById("explainText");

  var quizCard = document.getElementById("quizCard");
  var endCard = document.getElementById("endCard");
  var endSummary = document.getElementById("endSummary");

  var btnPrev = document.getElementById("btnPrev");
  var btnNext = document.getElementById("btnNext");
  var btnShuffle = document.getElementById("btnShuffle");
  var btnRestart = document.getElementById("btnRestart");
  var btnRestart2 = document.getElementById("btnRestart2");
  var btnShuffle2 = document.getElementById("btnShuffle2");

  function escapeHtml(s){
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function shuffleArray(arr){
    var i, j, tmp;
    for (i = arr.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  }

  function setProgress(){
    var total = state.order.length;
    var now = state.index + 1;
    progressText.textContent = String(now) + "/" + String(total);

    correctText.textContent = String(state.correct);
    wrongText.textContent = String(state.wrong);

    var percent = 0;
    if (total > 0) {
      percent = Math.round((now / total) * 100);
    }
    barFill.style.width = String(percent) + "%";
  }

  function getCurrentQuestion(){
    var qIndex = state.order[state.index];
    return state.questions[qIndex];
  }

  function showEnd(){
    quizCard.style.display = "none";
    endCard.style.display = "block";

    var total = state.order.length;
    var msg = "총 " + total + "문제 중 정답 " + state.correct + "개, 오답 " + state.wrong + "개 입니다. ";
    msg += "오답은 해설을 보고 같은 범위에서 예제를 다시 작성해보면 빨리 고쳐집니다.";
    endSummary.textContent = msg;
  }

  function showQuiz(){
    endCard.style.display = "none";
    quizCard.style.display = "block";
  }

  function renderQuestion(){
    showQuiz();

    var q = getCurrentQuestion();
    if (!q) return;

    topicText.textContent = q.topic ? q.topic : "기타";
    qidText.textContent = q.id ? q.id : "-";
    questionText.innerHTML = escapeHtml(q.prompt);
    descText.textContent = q.desc ? q.desc : "";

    // 버튼 상태
    btnPrev.disabled = (state.index === 0);
    btnNext.disabled = false;

    // 보기 렌더
    choicesArea.innerHTML = "";
    feedbackArea.style.display = "none";
    judgeText.className = "judge";
    judgeText.textContent = "";
    explainText.textContent = "";

    var answered = state.answeredMap[q.id];
    var i, btn;

    for (i = 0; i < q.choices.length; i++) {
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "choiceBtn";
      btn.setAttribute("data-choice", String(i));
      btn.innerHTML = escapeHtml(q.choices[i]);

      // 이미 답했으면 잠그고 표시
      if (answered) {
        btn.disabled = true;
        if (i === q.answerIndex) {
          btn.classList.add("correct");
        }
        if (i === answered.chosenIndex && answered.chosenIndex !== q.answerIndex) {
          btn.classList.add("wrong");
        }
      } else {
        btn.disabled = false;
      }

      btn.addEventListener("click", onChoiceClick);
      choicesArea.appendChild(btn);
    }

    // 이미 답한 문제면 피드백도 보여주기
    if (answered) {
      feedbackArea.style.display = "block";
      if (answered.isCorrect) {
        judgeText.classList.add("ok");
        judgeText.textContent = "정답";
      } else {
        judgeText.classList.add("no");
        judgeText.textContent = "오답";
      }
      explainText.textContent = q.explanation ? q.explanation : "";
    }

    setProgress();
  }

  function onChoiceClick(e){
    var q = getCurrentQuestion();
    var target = e.currentTarget;
    var chosen = parseInt(target.getAttribute("data-choice"), 10);
    if (isNaN(chosen)) return;

    // 이미 답했으면 무시
    if (state.answeredMap[q.id]) return;

    var isCorrect = (chosen === q.answerIndex);
    state.answeredMap[q.id] = { chosenIndex: chosen, isCorrect: isCorrect };

    if (isCorrect) state.correct++;
    else state.wrong++;

    // 버튼 스타일 반영 + 잠금
    var btns = choicesArea.querySelectorAll(".choiceBtn");
    var i;
    for (i = 0; i < btns.length; i++) {
      btns[i].disabled = true;
      var idx = parseInt(btns[i].getAttribute("data-choice"), 10);

      if (idx === q.answerIndex) btns[i].classList.add("correct");
      if (idx === chosen && chosen !== q.answerIndex) btns[i].classList.add("wrong");
    }

    // 즉시 피드백
    feedbackArea.style.display = "block";
    judgeText.className = "judge";
    if (isCorrect) {
      judgeText.classList.add("ok");
      judgeText.textContent = "정답";
    } else {
      judgeText.classList.add("no");
      judgeText.textContent = "오답";
    }
    explainText.textContent = q.explanation ? q.explanation : "";

    setProgress();
  }

  function next(){
    var total = state.order.length;
    if (state.index < total - 1) {
      state.index++;
      renderQuestion();
    } else {
      showEnd();
    }
  }

  function prev(){
    if (state.index > 0) {
      state.index--;
      renderQuestion();
    }
  }

  function restart(shuffle){
    state.index = 0;
    state.answeredMap = {};
    state.correct = 0;
    state.wrong = 0;

    // order 재생성
    var i;
    state.order = [];
    for (i = 0; i < state.questions.length; i++) state.order.push(i);

    if (shuffle) shuffleArray(state.order);

    renderQuestion();
  }

  function bindEvents(){
    btnNext.addEventListener("click", next);
    btnPrev.addEventListener("click", prev);

    btnShuffle.addEventListener("click", function(){ restart(true); });
    btnRestart.addEventListener("click", function(){ restart(false); });

    btnRestart2.addEventListener("click", function(){ restart(false); });
    btnShuffle2.addEventListener("click", function(){ restart(true); });

    // 키보드: Enter 다음, ← 이전, → 다음
    document.addEventListener("keydown", function(e){
      if (endCard.style.display === "block") return;

      if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
      else if (e.key === "Enter") next();
    });
  }

  function loadData(){
    fetch(DATA_URL, { cache: "no-store" })
      .then(function(res){
        if (!res.ok) throw new Error("JSON 로드 실패");
        return res.json();
      })
      .then(function(data){
        state.subject = data.subject || "HTML";
        state.questions = data.questions || [];
        subjectText.textContent = state.subject;

        // 기본 order
        var i;
        state.order = [];
        for (i = 0; i < state.questions.length; i++) state.order.push(i);

        renderQuestion();
      })
      .catch(function(err){
        questionText.textContent = "데이터를 불러오지 못했습니다.";
        descText.textContent = "Live Server로 실행했는지 확인하세요. (fetch로 json을 불러옵니다)";
        choicesArea.innerHTML = "";
        feedbackArea.style.display = "none";
        console.error(err);
      });
  }

  function init(){
    bindEvents();
    loadData();
  }

  init();
})();
