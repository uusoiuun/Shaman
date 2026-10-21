// Анкета «Отбор помощника»: вопросы о себе, даре и опыте, тест на эго.
// Ответы уходят шаману в WhatsApp готовым сообщением. Результат теста человек не видит:
// в сообщении он записан как «Код анкеты: Э<балл>», где балл 0–100 — сила эго.
(function () {
  var root = document.getElementById('helper');
  if (!root) return;

  // Адрес веб-приложения Google Apps Script (таблица + письмо). Пусто — анкета уходит через WhatsApp
  var HELPER_URL = '';
  var WHATSAPP = '79148286969', DRAFT = 'sakha-helper-draft';

  var AGREE = [['Нет', 0], ['Скорее нет', 1], ['Отчасти', 2], ['Скорее да', 3], ['Да', 4]];
  // rev: 1 — согласие говорит о смирении, а не об эго
  var EGO = [
    ['Мне важно, чтобы окружающие замечали мои способности', 0],
    ['Я легко признаю свои ошибки', 1],
    ['Когда меня критикуют, я сначала думаю, есть ли в этом правда', 1],
    ['Я часто чувствую, что знаю лучше других', 0],
    ['Мне неприятно, когда похвалу получает кто-то другой, а не я', 0],
    ['Я готов(а) делать простую незаметную работу, если она нужна делу', 1],
    ['Я считаю, что у меня особая миссия, которую другие не понимают', 0],
    ['Мне трудно выполнять решение, с которым я не согласен(на)', 0],
    ['Я могу первым(ой) попросить прощения', 1],
    ['Мне важно, чтобы мой вклад отметили при всех', 0],
    ['Я учусь у людей, даже если они младше или менее опытны', 1],
    ['Я обижаюсь, если мои советы не принимают', 0],
    ['Мне нравится быть в центре внимания', 0],
    ['Я могу долго слушать, не вставляя своё мнение', 1]
  ];
  var EGO_CASES = [
    ['Шаман резко поправил вас при людях. Как вы поступите?', [['Поблагодарю и сделаю, как он сказал', 0], ['Промолчу, но внутри обижусь', 2], ['Объясню, почему я был(а) прав(а)', 3], ['Уйду: так со мной нельзя', 4]]],
    ['После обряда человек благодарит не шамана, а вас. Что вы скажете?', [['Скажу, что заслуга шамана и духов', 0], ['Просто приму благодарность', 2], ['Расскажу, что я тоже многое умею', 4]]],
    ['Вам поручили мыть посуду и убирать после обряда, а другие помогают в самом обряде. Ваши чувства?', [['Спокойно сделаю: любая помощь важна', 0], ['Сделаю, но попрошу в следующий раз дело поважнее', 2], ['Мне обидно: я способен(на) на большее', 4]]]
  ];
  var SKILLS = ['Организация мероприятий и людей', 'Соцсети, фото и видео', 'Машина и поездки', 'Кухня и угощение', 'Рукоделие, шитьё, изделия', 'Хозяйство, стройка, ремонт', 'Тексты, переводы, документы', 'Общение с людьми, запись на приём', 'Музыка, пение, хомус'];

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function field(id, label, type, extra) {
    return '<label for="hp-' + id + '">' + label + '</label>' +
      (type === 'area' ? '<textarea id="hp-' + id + '" name="' + id + '" rows="4" maxlength="1500"' + (extra || '') + '></textarea>'
        : '<input id="hp-' + id + '" name="' + id + '" type="' + type + '"' + (extra || '') + '>');
  }
  function radios(name, label, opts) {
    return '<fieldset class="hp-choice"><legend>' + label + '</legend>' + opts.map(function (o, i) {
      return '<label><input type="radio" name="' + name + '" value="' + i + '"><span>' + esc(Array.isArray(o) ? o[0] : o) + '</span></label>';
    }).join('') + '</fieldset>';
  }
  function scale(name, text) {
    return '<fieldset class="hp-scale"><legend>' + esc(text) + '</legend><div>' + AGREE.map(function (o, i) {
      return '<label><input type="radio" name="' + name + '" value="' + i + '"><span>' + o[0] + '</span></label>';
    }).join('') + '</div></fieldset>';
  }

  root.innerHTML = '<form class="hp-form" novalidate autocomplete="on">' +
    '<h3 class="hp-sec"><sup>/1</sup>О себе</h3>' +
    field('name', 'Имя и фамилия', 'text', ' required autocomplete="name"') +
    field('age', 'Возраст', 'number', ' min="14" max="99" inputmode="numeric"') +
    field('city', 'Город или село', 'text', ' autocomplete="address-level2"') +
    field('phone', 'Телефон или WhatsApp', 'tel', ' required autocomplete="tel" placeholder="+7 900 000-00-00"') +
    field('social', 'Instagram или другие соцсети', 'text', ' placeholder="необязательно"') +
    field('work', 'Чем вы занимаетесь: работа, учёба, опыт', 'area') +
    radios('yakut', 'Знаете ли вы якутский язык?', ['Свободно', 'Понимаю, говорю немного', 'Не знаю']) +

    '<h3 class="hp-sec"><sup>/2</sup>Дар и опыт</h3>' +
    radios('gift', 'Есть ли у вас дар?', ['Да, знаю точно', 'Чувствую, но не уверен(а)', 'Нет', 'Не знаю']) +
    field('giftText', 'Если есть — в чём он проявляется?', 'area') +
    radios('seen', 'Видели или чувствовали ли вы что-то сверхъестественное?', ['Да, не раз', 'Был один случай', 'Нет']) +
    field('seenText', 'Расскажите, что это было', 'area') +
    radios('rod', 'Были ли в вашем роду шаманы, удаганки, знахари, костоправы?', ['Да', 'Говорят, что были', 'Нет', 'Не знаю']) +

    '<h3 class="hp-sec"><sup>/3</sup>Помощь шаману</h3>' +
    field('why', 'Почему вы хотите помогать шаману?', 'area', ' required') +
    field('benefit', 'Какую пользу вы можете принести?', 'area', ' required') +
    '<fieldset class="hp-choice hp-multi"><legend>Чем можете помочь на деле</legend>' + SKILLS.map(function (s, i) {
      return '<label><input type="checkbox" name="skills" value="' + i + '"><span>' + s + '</span></label>';
    }).join('') + '</fieldset>' +
    radios('time', 'Сколько времени готовы уделять?', ['Несколько часов в месяц', 'Каждые выходные', 'Несколько дней в неделю', 'Готов(а) на выезды и ретриты']) +

    '<h3 class="hp-sec"><sup>/4</sup>Тест: вы и ваше «я»</h3>' +
    '<p class="hp-lead">Отвечайте честно, первым чувством. Правильных ответов здесь нет.</p>' +
    EGO.map(function (q, i) { return scale('ego' + i, q[0]); }).join('') +
    EGO_CASES.map(function (c, i) { return radios('case' + i, c[0], c[1]); }).join('') +

    '<label class="hp-agree"><input type="checkbox" name="agree"> <span>Я даю согласие на обработку моих персональных данных и принимаю <a href="privacy.html" target="_blank" rel="noopener">политику конфиденциальности</a></span></label>' +
    '<p class="diag-error" hidden></p>' +
    '<div class="diag-actions"><button class="btn btn-lime" type="submit">Отправить анкету</button></div>' +
    '</form><div class="hp-done" hidden></div>';

  var form = root.querySelector('form'), err = form.querySelector('.diag-error'), done = root.querySelector('.hp-done');

  // Черновик: длинную анкету можно заполнять в несколько заходов
  function collect() {
    var d = {};
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name) return;
      if (el.type === 'radio') { if (el.checked) d[el.name] = +el.value; }
      else if (el.type === 'checkbox') { if (el.name === 'skills') { d.skills = d.skills || []; if (el.checked) d.skills.push(+el.value); } else d[el.name] = el.checked; }
      else d[el.name] = el.value.trim();
    });
    return d;
  }
  function restore() {
    var d; try { d = JSON.parse(localStorage.getItem(DRAFT) || 'null'); } catch (e) { d = null; }
    if (!d) return;
    Array.prototype.forEach.call(form.elements, function (el) {
      if (!el.name || d[el.name] === undefined) return;
      if (el.type === 'radio') el.checked = d[el.name] === +el.value;
      else if (el.type === 'checkbox') el.checked = el.name === 'skills' ? (d.skills || []).indexOf(+el.value) >= 0 : !!d[el.name];
      else el.value = d[el.name];
    });
  }
  restore();
  form.addEventListener('input', function () { try { localStorage.setItem(DRAFT, JSON.stringify(collect())); } catch (e) {} });
  form.addEventListener('change', function () { try { localStorage.setItem(DRAFT, JSON.stringify(collect())); } catch (e) {} });

  // Эго: 0–100, чем выше, тем сильнее эго
  function egoResult(d) {
    var sum = 0, max = 0, lines = [], short = [];
    EGO.forEach(function (q, i) {
      var a = d['ego' + i]; max += 4;
      if (a === undefined) return;
      sum += q[1] ? 4 - a : a;
      lines.push(q[0] + ' — ' + AGREE[a][0]);
      short.push((i + 1) + '. ' + q[0] + ': ' + AGREE[a][0]);
    });
    EGO_CASES.forEach(function (c, i) {
      var a = d['case' + i]; max += 4;
      if (a === undefined) return;
      sum += c[1][a][1];
      lines.push(c[0] + ' — ' + c[1][a][0]);
      short.push((EGO.length + i + 1) + '. ' + c[0].split('.')[0] + ': ' + c[1][a][0]);
    });
    var score = Math.round(sum / max * 100);
    var level = score <= 35 ? 'спокойное эго, готовность служить' : score <= 55 ? 'умеренное эго' : score <= 70 ? 'заметное эго, стоит присмотреться' : 'сильное эго';
    return { score: score, level: level, answers: lines, short: short };
  }
  function pick(list, i) { return i === undefined ? '' : (Array.isArray(list[i]) ? list[i][0] : list[i]); }
  function summary(d, ego) {
    return {
      name: d.name, age: d.age, city: d.city, phone: d.phone, social: d.social, work: d.work,
      yakut: pick(['Свободно', 'Понимаю, говорю немного', 'Не знаю'], d.yakut),
      gift: pick(['Да, знаю точно', 'Чувствую, но не уверен(а)', 'Нет', 'Не знаю'], d.gift), giftText: d.giftText,
      seen: pick(['Да, не раз', 'Был один случай', 'Нет'], d.seen), seenText: d.seenText,
      rod: pick(['Да', 'Говорят, что были', 'Нет', 'Не знаю'], d.rod),
      why: d.why, benefit: d.benefit, skills: (d.skills || []).map(function (i) { return SKILLS[i]; }).join(', '),
      time: pick(['Несколько часов в месяц', 'Каждые выходные', 'Несколько дней в неделю', 'Готов(а) на выезды и ретриты'], d.time),
      egoScore: ego.score, egoLevel: ego.level, egoAnswers: ego.answers.join('\n'), egoShort: ego.short.join('\n')
    };
  }
  function waText(s) {
    return 'Анкета помощника\n' + s.name + ', ' + (s.age || '—') + ' лет, ' + (s.city || '—') + '\nТелефон: ' + s.phone + (s.social ? '\nСоцсети: ' + s.social : '') +
      '\nЗанятие: ' + (s.work || '—') + '\nЯкутский язык: ' + (s.yakut || '—') +
      '\nДар: ' + (s.gift || '—') + (s.giftText ? ' — ' + s.giftText : '') + '\nСверхъестественное: ' + (s.seen || '—') + (s.seenText ? ' — ' + s.seenText : '') +
      '\nРод: ' + (s.rod || '—') + '\nПочему хочу помогать: ' + s.why + '\nПольза: ' + s.benefit + '\nНавыки: ' + (s.skills || '—') + '\nВремя: ' + (s.time || '—') +
      '\n\nОтветы теста:\n' + s.egoShort + '\n\nКод анкеты: Э' + s.egoScore;
  }
  function finish(ok, s) {
    form.hidden = true; done.hidden = false;
    try { localStorage.removeItem(DRAFT); } catch (e) {}
    done.innerHTML = ok
      ? '<h3 class="hp-sec">Анкета отправлена</h3><p>Спасибо! Шаман прочитает её и свяжется с вами по телефону или в WhatsApp.</p>'
      : '<h3 class="hp-sec">Осталось отправить</h3><p>Открылся WhatsApp с вашей анкетой — нажмите «Отправить». Если WhatsApp не открылся, нажмите кнопку ниже. Шаман прочитает анкету и свяжется с вами.</p>' +
        '<div class="diag-actions"><a class="btn btn-lime" target="_blank" rel="noopener" href="https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(waText(s)) + '">Отправить в WhatsApp</a></div>';
    root.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var d = collect(), missing = [];
    if (!d.name) missing.push('имя');
    if ((d.phone || '').replace(/\D/g, '').length < 10) missing.push('телефон');
    if (!d.why) missing.push('почему хотите помогать');
    if (!d.benefit) missing.push('какую пользу принесёте');
    var unanswered = EGO.filter(function (q, i) { return d['ego' + i] === undefined; }).length + EGO_CASES.filter(function (c, i) { return d['case' + i] === undefined; }).length;
    if (unanswered) missing.push('вопросы теста (осталось ' + unanswered + ')');
    if (!d.agree) missing.push('согласие на обработку данных');
    if (missing.length) { err.textContent = 'Заполните: ' + missing.join(', ') + '.'; err.hidden = false; return; }
    err.hidden = true;
    var s = summary(d, egoResult(d)), btn = form.querySelector('[type=submit]');
    if (!HELPER_URL) { window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(waText(s)), '_blank', 'noopener'); return finish(false, s); }
    btn.disabled = true; btn.textContent = 'Отправляю…';
    fetch(HELPER_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(s) })
      .then(function () { finish(true, s); })
      .catch(function () { btn.disabled = false; btn.textContent = 'Отправить анкету'; finish(false, s); });
  });
})();
