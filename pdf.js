// PDF с результатами диагностики и разбора. Библиотека pdfmake (MIT, шрифт Roboto)
// подгружается только по нажатию кнопки. Текст берётся из уже показанного на странице результата.
(function () {
  var SITE = 'https://sakhashaman.pro';
  var CONTACTS = 'WhatsApp 8 914 828-69-69  ·  uus.oyuun@yandex.ru  ·  Instagram @uus.oiuun  ·  sakhashaman.pro';
  var INK = '#14141c', DIM = '#62677d', ACCENT = '#3f7d2b', LINE = '#d9dbe6';
  var loading = null;

  function loadScript(src) {
    return new Promise(function (ok, fail) {
      var s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = fail; document.head.appendChild(s);
    });
  }
  function ready() {
    if (window.pdfMake && window.pdfMake.vfs && window.pdfMake.vfs['Roboto-Regular.ttf']) return Promise.resolve();
    if (!loading) loading = loadScript('vendor/pdfmake-0.2.23.min.js').then(function () { return loadScript('vendor/pdfmake-0.2.23-fonts.js'); });
    return loading;
  }

  // Убираем китайские иероглифы (в шрифте их нет) и лишние пробелы
  function clean(t) { return String(t || '').replace(/[\u3000-\u9fff\uff00-\uffef\u2600-\u26ff\u2bd8-\u2bdf\u2640-\u2647]/g, '').replace(/[\uFE0E\uFE0F]/g, '').replace(/\s+/g, ' ').trim(); }
  // Текст элемента с пробелами между дочерними тегами (иначе «ГородСтрана» слипаются)
  function spaced(el, skip) {
    var parts = [];
    (function go(n) {
      Array.prototype.forEach.call(n.childNodes, function (x) {
        if (x.nodeType === 3) parts.push(x.nodeValue);
        else if (x.nodeType === 1 && !(skip && x.tagName === skip)) { parts.push(' '); go(x); parts.push(' '); }
      });
    })(el);
    return clean(parts.join('')).replace(/\s+([.,;:!?)])/g, '$1');
  }
  function txt(el) { return clean(el.textContent); }
  function width(el) { var i = el.querySelector('i'); var m = i && /width:\s*([\d.]+)%/.exec(i.getAttribute('style') || ''); return m ? Math.round(+m[1]) : null; }
  function bar(p) { return { canvas: [{ type: 'rect', x: 0, y: 4, w: 160, h: 5, color: LINE }, { type: 'rect', x: 0, y: 4, w: Math.max(1, 1.6 * p), h: 5, color: ACCENT }] }; }

  function walk(node, out) {
    Array.prototype.forEach.call(node.children, function (el) {
      var c = el.classList, tag = el.tagName;
      if (tag === 'SVG' || tag === 'svg' || tag === 'BUTTON' || tag === 'FORM' || tag === 'A' || tag === 'TEXTAREA') return;
      if (c.contains('diag-actions') || c.contains('astro-code') || c.contains('diag-progress') || c.contains('astro-test')) return;
      if (c.contains('astro-gate')) {
        out.push({ text: 'Полный разбор', style: 'h2', margin: [0, 14, 0, 4] });
        out.push({ text: 'Откройте полный разбор на сайте sakhashaman.pro во вкладке «Астроразбор»: после оплаты шаман пришлёт код доступа. В нём — психологический портрет, профориентация, западная и ведическая карта, бацзы, лучшие города и периоды жизни.', style: 'p' });
        return;
      }
      if (tag === 'SECTION') {
        var h = el.querySelector('h4');
        out.push({ text: h ? txt(h).replace(/^\/\d+\s*/, '') : '', style: 'h2', margin: [0, 16, 0, 6] });
        walk(el, out); return;
      }
      if (tag === 'H4') return;
      if (tag === 'H3') { out.push({ text: txt(el), style: c.contains('diag-formula') ? 'title' : 'h3' }); return; }
      if (c.contains('diag-bars') || c.contains('astro-b5')) {
        Array.prototype.forEach.call(el.children, function (li) {
          var label = li.querySelector('span'), p = width(li), note = li.querySelector('p');
          out.push({ columns: [{ text: label ? txt(label) : '', width: 150, style: 'p' }, p === null ? { text: '' } : bar(p)], margin: [0, 1, 0, 1] });
          if (note) out.push({ text: txt(note), style: 'small', margin: [0, 0, 0, 4] });
        });
        return;
      }
      if (c.contains('astro-pillars')) {
        out.push({ table: { widths: ['*', '*', '*', '*'], body: [Array.prototype.map.call(el.children, function (d) {
          return { stack: Array.prototype.map.call(d.children, function (x) { return { text: txt(x), style: x.tagName === 'SPAN' ? 'label' : 'small', alignment: 'center' }; }).filter(function (x) { return x.text; }) };
        })] }, layout: 'lightHorizontalLines', margin: [0, 4, 0, 8] });
        return;
      }
      if (c.contains('astro-timeline')) {
        Array.prototype.forEach.call(el.children, function (li) {
          var s = li.querySelector('span'), b = li.querySelector('b'), p = li.querySelector('p');
          out.push({ columns: [{ text: s ? txt(s) : '', width: 120, style: li.classList.contains('is-now') ? 'nowLabel' : 'small' }, { stack: [{ text: b ? txt(b) : '', style: 'pb' }, { text: p ? txt(p) : '', style: 'small' }] }], margin: [0, 3, 0, 3] });
        });
        return;
      }
      if (c.contains('astro-years')) {
        out.push({ ul: Array.prototype.map.call(el.children, function (s) {
          var b = s.querySelector('b'), tags = Array.prototype.map.call(s.querySelectorAll('i'), txt);
          var rest = clean(Array.prototype.filter.call(s.childNodes, function (x) { return x.nodeType === 3; }).map(function (x) { return x.nodeValue; }).join(' '));
          return { text: [{ text: b ? txt(b) : '', bold: true }, ' — ' + rest + (tags.length ? ' (' + tags.join(', ') + ')' : '')], style: 'p' };
        }), margin: [0, 2, 0, 8] });
        return;
      }
      if (c.contains('diag-axes')) {
        Array.prototype.forEach.call(el.children, function (li) {
          var spans = li.querySelectorAll('.diag-axis-labels span'), p = li.querySelector('p');
          var lab = [];
          Array.prototype.forEach.call(spans, function (sp, i) {
            if (i) lab.push({ text: '  /  ', color: DIM });
            lab.push(sp.classList.contains('is-on') ? { text: txt(sp), bold: true, color: ACCENT } : { text: txt(sp), color: DIM });
          });
          out.push({ text: lab, style: 'p', margin: [0, 4, 0, 1] });
          if (p) out.push({ text: txt(p), style: 'small' });
        });
        return;
      }
      if (tag === 'TABLE') {
        var rows = Array.prototype.map.call(el.querySelectorAll('tr'), function (tr, i) {
          return Array.prototype.map.call(tr.children, function (td) { return { text: txt(td), style: i ? 'cell' : 'th' }; });
        });
        if (rows.length) out.push({ table: { headerRows: 1, widths: rows[0].map(function () { return '*'; }), body: rows }, layout: 'lightHorizontalLines', margin: [0, 4, 0, 10] });
        return;
      }
      if (tag === 'UL' || tag === 'OL') {
        var items = Array.prototype.map.call(el.children, function (li) {
          var b = li.querySelector('b'), sp = li.querySelector('span');
          if (el.classList.contains('astro-jobs') && b) return { stack: [{ text: txt(b), style: 'pb' }, { text: sp ? txt(sp) : '', style: 'small' }] };
          var ps = li.querySelectorAll(':scope > p');
          if (el.classList.contains('astro-topics')) return { stack: Array.prototype.map.call(ps, function (x, i) { return { text: txt(x), style: i ? 'small' : 'lead' }; }) };
          if (ps.length) return { stack: [{ text: spaced(li, 'P'), style: 'pb' }, { text: txt(ps[0]), style: 'small' }] };
          return { text: spaced(li), style: 'p' };
        });
        out.push(tag === 'OL' ? { ol: items, margin: [0, 2, 0, 8] } : { ul: items, margin: [0, 2, 0, 8] });
        return;
      }
      if (tag === 'P') {
        var t = txt(el); if (!t) return;
        var st = c.contains('diag-big') ? 'big' : c.contains('diag-mid') || c.contains('diag-num') ? 'mid' : c.contains('diag-small') || c.contains('diag-kicker') ? 'label' : c.contains('diag-note') || c.contains('astro-disclaimer') ? 'small' : c.contains('astro-final') ? 'lead' : 'p';
        out.push({ text: t, style: st });
        return;
      }
      if (tag === 'FIGURE' || tag === 'IMG') return;
      walk(el, out);
    });
  }

  function build(card, title, name) {
    var content = [];
    walk(card, content);
    content.push({ text: 'Записаться на приём', style: 'h2', margin: [0, 20, 0, 4] });
    content.push({ text: 'Приём ведётся в г. Якутске и онлайн по всему миру.', style: 'p' });
    content.push({ text: [{ text: 'WhatsApp: ', bold: true }, { text: '8 914 828-69-69', link: 'https://wa.me/79148286969' }], style: 'p' });
    content.push({ text: [{ text: 'Почта: ', bold: true }, { text: 'uus.oyuun@yandex.ru', link: 'mailto:uus.oyuun@yandex.ru' }], style: 'p' });
    content.push({ text: [{ text: 'Instagram: ', bold: true }, { text: '@uus.oiuun', link: 'https://instagram.com/uus.oiuun' }], style: 'p' });
    content.push({ text: [{ text: 'Сайт: ', bold: true }, { text: 'sakhashaman.pro', link: SITE, color: ACCENT }], style: 'p' });
    var d = new Date();
    return {
      pageSize: 'A4', pageMargins: [48, 64, 48, 64],
      info: { title: title + (name ? ' — ' + name : ''), author: 'Уус Ойуун Дьурантай', subject: 'sakhashaman.pro' },
      header: function () {
        return { margin: [48, 24, 48, 0], columns: [
          { text: 'УУС ОЙУУН ДЬУРАНТАЙ', bold: true, fontSize: 9, color: INK, characterSpacing: 1 },
          { text: 'потомственный якутский шаман', fontSize: 9, color: DIM, alignment: 'right' }
        ] };
      },
      footer: function (page, pages) {
        return { margin: [48, 16, 48, 0], stack: [
          { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 499, y2: 0, lineWidth: 0.5, lineColor: LINE }] },
          { columns: [
            { text: CONTACTS, fontSize: 7.5, color: DIM, link: SITE, margin: [0, 6, 0, 0] },
            { text: page + ' / ' + pages, fontSize: 7.5, color: DIM, alignment: 'right', width: 40, margin: [0, 6, 0, 0] }
          ] }
        ] };
      },
      content: [
        { text: title.toUpperCase(), style: 'label' },
        { text: (name ? name + ' · ' : '') + 'составлено ' + d.toLocaleDateString('ru-RU') + ' на сайте sakhashaman.pro', style: 'small', link: SITE, margin: [0, 0, 0, 10] }
      ].concat(content),
      defaultStyle: { font: 'Roboto', fontSize: 10, color: INK, lineHeight: 1.3 },
      styles: {
        title: { fontSize: 18, bold: true, margin: [0, 4, 0, 10] },
        h2: { fontSize: 12, bold: true, color: ACCENT, characterSpacing: 0.5 },
        h3: { fontSize: 13, bold: true, margin: [0, 6, 0, 6] },
        lead: { fontSize: 12, margin: [0, 2, 0, 8] },
        big: { fontSize: 15, bold: true, margin: [0, 2, 0, 3] },
        mid: { fontSize: 12, bold: true, margin: [0, 2, 0, 3] },
        label: { fontSize: 8, bold: true, color: DIM, characterSpacing: 1, margin: [0, 8, 0, 2] },
        nowLabel: { fontSize: 8.5, bold: true, color: ACCENT },
        p: { margin: [0, 1, 0, 5] },
        pb: { bold: true },
        small: { fontSize: 8.5, color: DIM, margin: [0, 0, 0, 4] },
        bar: { fontSize: 9, color: ACCENT },
        th: { fontSize: 8, bold: true, color: ACCENT },
        cell: { fontSize: 9 }
      }
    };
  }

  // Имя файла латиницей: кириллица в имени скачиваемого файла поддерживается не везде
  var TR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya', һ: 'h', ө: 'o', ү: 'u', ҥ: 'n', ҕ: 'g' };
  function slug(t) {
    return String(t).toLowerCase().split('').map(function (c) { return TR[c] !== undefined ? TR[c] : c; }).join('')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  }

  function fileName(title, name) { return 'sakhashaman-' + slug(title) + (name ? '-' + slug(name) : '') + '.pdf'; }
  function busy(button, on) {
    if (!button) return;
    if (on) { button.dataset.label = button.textContent; button.disabled = true; button.textContent = 'Готовлю PDF…'; }
    else { button.disabled = false; button.textContent = button.dataset.label; }
  }
  function fail() { alert('Не удалось создать PDF. Проверьте интернет и попробуйте ещё раз.'); }

  // card — элемент с результатом, title — заголовок файла, name — имя человека
  function download(card, title, name, button) {
    busy(button, true);
    return ready().then(function () {
      window.pdfMake.createPdf(build(card, title, name)).download(fileName(title, name));
    }).catch(fail).then(function () { busy(button, false); });
  }

  // Человек сам отправляет PDF шаману. На телефоне — меню «Поделиться» с файлом,
  // на компьютере — скачивание файла и чат WhatsApp с готовым текстом
  function share(card, title, name, button, phone, msg) {
    var text = msg + '\n\nОтправляю свой результат: ' + title + '.';
    var wa = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(text + ' Файл PDF прикреплю.');
    var cached = button && button._pdf;
    if (cached) return send(cached);
    var win = null;
    busy(button, true);
    return ready().then(function () {
      return new Promise(function (ok) { window.pdfMake.createPdf(build(card, title, name)).getBlob(ok); });
    }).then(function (blob) {
      busy(button, false);
      var file = new File([blob], fileName(title, name), { type: 'application/pdf' });
      if (button) button._pdf = file;
      return send(file, true);
    }).catch(function (e) { busy(button, false); if (!e || e.name !== 'AbortError') fail(); });

    function send(file, late) {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({ files: [file], title: title, text: text }).catch(function (e) {
          // Браузер мог запретить «Поделиться» после ожидания — просим нажать ещё раз, файл уже готов
          if (late && e && e.name === 'NotAllowedError' && button) { button.textContent = 'Файл готов — нажмите ещё раз'; return; }
          if (!e || e.name !== 'AbortError') location.href = wa;
        });
      }
      var a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = file.name;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 60000);
      win = window.open(wa, '_blank', 'noopener');
      if (!win) location.href = wa;
    }
  }
  window.SakhaPDF = { download: download, share: share, build: build, ready: ready };
})();
