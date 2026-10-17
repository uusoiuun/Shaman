(function () {
  var WHATSAPP = '79148286969';
  var panels = document.querySelectorAll('.tab-panel');
  var navLinks = document.querySelectorAll('.nav a');
  var nav = document.getElementById('nav');
  var toggle = document.querySelector('.menu-toggle');

  // Кнопки записи ведут в WhatsApp с готовым текстом сообщения
  document.querySelectorAll('.js-wa').forEach(function (a) {
    var msg = a.getAttribute('data-msg') || '';
    a.href = 'https://wa.me/' + WHATSAPP + (msg ? '?text=' + encodeURIComponent(msg) : '');
    a.target = '_blank';
    a.rel = 'noopener';
  });

  function showTab(id) {
    var found = false;
    panels.forEach(function (p) {
      var active = p.getAttribute('data-panel') === id;
      p.hidden = !active;
      if (active) found = true;
    });
    if (!found) return showTab('home');
    navLinks.forEach(function (a) {
      if (a.getAttribute('data-tab') === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    window.scrollTo(0, 0);
  }

  function route() {
    showTab(location.hash.replace('#', '') || 'home');
  }

  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  // Тест «Нужно ли вам на приём?»: у каждого ответа есть баллы,
  // при сумме от PASS_SCORE и выше тест советует записаться.
  var QUIZ = [
    {
      q: 'Чувствуете ли вы в последнее время тяжесть или усталость без видимой причины?',
      a: [['Да, часто', 2], ['Иногда', 1], ['Почти никогда', 0]]
    },
    {
      q: 'Повторяются ли в вашей жизни или в роду неудачи, ссоры, болезни?',
      a: [['Да, постоянно', 2], ['Бывало', 1], ['Нет', 0]]
    },
    {
      q: 'Снятся ли вам тревожные или повторяющиеся сны?',
      a: [['Да, часто', 2], ['Иногда', 1], ['Нет', 0]]
    },
    {
      q: 'Стоите ли вы сейчас перед важным выбором или переменами?',
      a: [['Да, и не знаю, как поступить', 2], ['Да, но путь мне ясен', 1], ['Нет', 0]]
    },
    {
      q: 'Чувствуете ли вы внутренний зов обратиться к шаману?',
      a: [['Да, уже давно', 2], ['Возможно', 1], ['Нет, мне просто интересно', 0]]
    }
  ];
  var PASS_SCORE = 5;
  var RESULTS = {
    yes: {
      title: 'Вам стоит записаться на приём',
      text: 'По вашим ответам видно, что сейчас вам нужна помощь. Напишите шаману в WhatsApp, и он подберёт для вас удобное время.',
      button: 'Записаться в WhatsApp',
      msg: 'Здравствуйте! Я прошёл(а) тест на сайте, хочу записаться на приём.'
    },
    no: {
      title: 'Пока вам не стоит торопиться',
      text: 'Сейчас серьёзных причин для приёма не видно. Берегите себя, а если что-то начнёт тревожить, пройдите тест ещё раз или напишите шаману.',
      button: 'Задать вопрос шаману',
      msg: 'Здравствуйте! Я прошёл(а) тест на сайте, хочу задать вопрос.'
    }
  };

  var quiz = document.getElementById('quiz');
  var stage = quiz.querySelector('.quiz-stage');
  var progress = quiz.querySelector('.quiz-progress');
  var step = 0, score = 0, lastFocus = null;

  QUIZ.forEach(function () { progress.appendChild(document.createElement('span')); });

  function setProgress() {
    progress.querySelectorAll('span').forEach(function (dot, i) {
      dot.className = i < step ? 'done' : (i === step ? 'current' : '');
    });
  }

  function swap(build) {
    var old = stage.firstElementChild;
    function show() {
      stage.innerHTML = '';
      var card = document.createElement('div');
      card.className = 'quiz-card';
      build(card);
      stage.appendChild(card);
      var first = card.querySelector('button, a');
      if (first) first.focus({ preventScroll: true });
    }
    if (!old) return show();
    old.classList.add('leaving');
    setTimeout(show, 220);
  }

  function renderQuestion() {
    setProgress();
    var item = QUIZ[step];
    swap(function (card) {
      card.innerHTML = '<p class="quiz-count">Вопрос ' + (step + 1) + ' из ' + QUIZ.length + '</p><h3></h3><div class="quiz-answers"></div>';
      card.querySelector('h3').textContent = item.q;
      var box = card.querySelector('.quiz-answers');
      item.a.forEach(function (ans) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'quiz-answer';
        b.textContent = ans[0];
        b.addEventListener('click', function () {
          score += ans[1];
          step++;
          if (step < QUIZ.length) renderQuestion();
          else renderResult();
        });
        box.appendChild(b);
      });
    });
  }

  function renderResult() {
    setProgress();
    var r = RESULTS[score >= PASS_SCORE ? 'yes' : 'no'];
    swap(function (card) {
      card.classList.add('quiz-result', score >= PASS_SCORE ? 'is-yes' : 'is-no');
      card.innerHTML = '<div class="quiz-sign" aria-hidden="true"></div><h3></h3><p></p>' +
        '<div class="quiz-actions"><a class="btn btn-primary" target="_blank" rel="noopener"></a>' +
        '<button type="button" class="btn btn-ghost">Пройти ещё раз</button></div>';
      card.querySelector('h3').textContent = r.title;
      card.querySelector('p').textContent = r.text;
      var wa = card.querySelector('a');
      wa.textContent = r.button;
      wa.href = 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(r.msg);
      card.querySelector('.btn-ghost').addEventListener('click', startQuiz);
    });
  }

  function startQuiz() {
    step = 0;
    score = 0;
    renderQuestion();
  }

  function openQuiz() {
    lastFocus = document.activeElement;
    stage.innerHTML = '';
    quiz.hidden = false;
    document.body.classList.add('no-scroll');
    startQuiz();
  }

  function closeQuiz() {
    quiz.hidden = true;
    document.body.classList.remove('no-scroll');
    if (lastFocus) lastFocus.focus();
  }

  document.querySelectorAll('.js-quiz-open').forEach(function (b) {
    b.addEventListener('click', openQuiz);
  });
  quiz.querySelectorAll('[data-quiz-close]').forEach(function (el) {
    el.addEventListener('click', closeQuiz);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !quiz.hidden) closeQuiz();
  });

  window.addEventListener('hashchange', route);
  route();
})();
