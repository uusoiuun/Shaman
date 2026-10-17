// Расчётное ядро астрологического разбора.
// Западная карта (тропический зодиак, дома Плацидуса), ведическая (сидерический зодиак, айанамша Лахири,
// накшатры, Вимшоттари-даши), бацзы (четыре столпа, такты удачи, символические звёзды) и астрокартография.
// Положения планет — библиотека astronomy-engine (MIT).
(function (global) {
  var A = global.Astronomy || (typeof require === 'function' ? require('./vendor/astronomy-2.1.19.min.js') : null);
  var RAD = Math.PI / 180;
  function norm(x) { x %= 360; return x < 0 ? x + 360 : x; }
  function sind(x) { return Math.sin(x * RAD); }
  function cosd(x) { return Math.cos(x * RAD); }
  function tand(x) { return Math.tan(x * RAD); }
  function atan2d(y, x) { return Math.atan2(y, x) / RAD; }
  function asind(x) { return Math.asin(Math.max(-1, Math.min(1, x))) / RAD; }
  function diff(a, b) { var d = norm(a - b); return d > 180 ? d - 360 : d; } // a − b в пределах ±180

  var SIGNS = ['Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог', 'Водолей', 'Рыбы'];
  var BODIES = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

  // ---------- Время ----------
  function zoneOffsetMin(zone, ms) {
    var f = new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' });
    var p = {}; f.formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
    var asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
    return Math.round((asUtc - ms) / 60000);
  }
  // Местное время рождения → UTC с учётом исторических поясов и летнего времени
  function localToUtc(y, m, d, h, mi, zone) {
    var guess = Date.UTC(y, m - 1, d, h, mi);
    if (typeof zone === 'number') return { ms: guess - zone * 60000, offset: zone }; // фиксированное смещение в минутах
    var off = zoneOffsetMin(zone, guess), t = guess - off * 60000;
    var off2 = zoneOffsetMin(zone, t);
    if (off2 !== off) t = guess - off2 * 60000;
    return { ms: t, offset: zoneOffsetMin(zone, t) };
  }
  function centuries(date) { return (date.getTime() / 86400000 + 2440587.5 - 2451545) / 36525; }

  // ---------- Положения ----------
  function obliquity(T) { return 23.4392911 - 0.0130042 * T; }
  function bodyLon(name, date) {
    if (name === 'Sun') return A.SunPosition(date).elon;
    if (name === 'Moon') return A.EclipticGeoMoon(date).lon;
    var e = A.Ecliptic(A.GeoVector(name, date, true));
    return e.elon;
  }
  function bodyLat(name, date) {
    if (name === 'Sun') return 0;
    if (name === 'Moon') return A.EclipticGeoMoon(date).lat;
    return A.Ecliptic(A.GeoVector(name, date, true)).elat;
  }
  function trueNode(T) {
    var om = 125.0445479 - 1934.1362891 * T + 0.0020754 * T * T;
    var D = 297.8501921 + 445267.1114034 * T, M = 357.5291092 + 35999.0502909 * T;
    var Mp = 134.9633964 + 477198.8675055 * T, F = 93.2720950 + 483202.0175233 * T;
    return norm(om - 1.4979 * sind(2 * (D - F)) - 0.15 * sind(M) - 0.1226 * sind(2 * D) + 0.1176 * sind(2 * F) - 0.0801 * sind(2 * (Mp - F)));
  }
  function meanLilith(T) { return norm(83.3532465 + 4069.0137287 * T - 0.01032 * T * T + 180); }
  function lahiri(date) { var yrs = (date.getTime() - Date.UTC(2000, 0, 1, 12)) / 31557600000; return 23.857092 + yrs * 50.2790 / 3600; }
  function toEquatorial(lon, lat, eps) {
    var ra = atan2d(sind(lon) * cosd(eps) - tand(lat) * sind(eps), cosd(lon));
    var dec = asind(sind(lat) * cosd(eps) + cosd(lat) * sind(eps) * sind(lon));
    return { ra: norm(ra), dec: dec };
  }

  // ---------- Дома ----------
  function ascMc(ramc, lat, eps) {
    var mc = norm(atan2d(sind(ramc), cosd(ramc) * cosd(eps)));
    var asc = norm(atan2d(cosd(ramc), -(sind(ramc) * cosd(eps) + tand(lat) * sind(eps))));
    return { asc: asc, mc: mc };
  }
  function eclipticFromRa(ra, eps) { return norm(atan2d(sind(ra), cosd(ra) * cosd(eps))); }
  function placidus(ramc, lat, eps, asc, mc) {
    function cusp(offsetFn) {
      var lon = eclipticFromRa(offsetFn(0), eps);
      for (var i = 0; i < 40; i++) {
        var dec = asind(sind(eps) * sind(lon)), x = tand(lat) * tand(dec);
        if (Math.abs(x) >= 1) return null;
        var ad = asind(x);
        var next = eclipticFromRa(offsetFn(ad), eps);
        if (Math.abs(diff(next, lon)) < 1e-6) return next;
        lon = next;
      }
      return lon;
    }
    var c11 = cusp(function (ad) { return ramc + (90 + ad) / 3; });
    var c12 = cusp(function (ad) { return ramc + 2 * (90 + ad) / 3; });
    var c2 = cusp(function (ad) { return ramc + 180 - 2 * (90 - ad) / 3; });
    var c3 = cusp(function (ad) { return ramc + 180 - (90 - ad) / 3; });
    if ([c11, c12, c2, c3].some(function (c) { return c === null; })) return null;
    return [asc, c2, c3, norm(mc + 180), norm(c11 + 180), norm(c12 + 180), norm(asc + 180), norm(c2 + 180), norm(c3 + 180), mc, c11, c12];
  }
  function porphyry(asc, mc) {
    var ic = norm(mc + 180), q1 = norm(ic - asc), q2 = norm(asc + 180 - ic);
    var h = [asc, norm(asc + q1 / 3), norm(asc + 2 * q1 / 3), ic, norm(ic + q2 / 3), norm(ic + 2 * q2 / 3)];
    return h.concat(h.map(function (x) { return norm(x + 180); }));
  }
  function houseOf(lon, cusps) {
    for (var i = 0; i < 12; i++) {
      var a = cusps[i], b = cusps[(i + 1) % 12];
      if (norm(lon - a) < norm(b - a)) return i + 1;
    }
    return 1;
  }

  // ---------- Аспекты ----------
  var ASPECTS = [[0, 'соединение', 8], [60, 'секстиль', 5], [90, 'квадрат', 7], [120, 'трин', 7], [180, 'оппозиция', 8]];
  function aspects(points) {
    var out = [];
    for (var i = 0; i < points.length; i++) for (var j = i + 1; j < points.length; j++) {
      var a = points[i], b = points[j], d = Math.abs(diff(a.lon, b.lon));
      ASPECTS.forEach(function (asp) {
        var orb = asp[2] + ((a.key === 'Sun' || a.key === 'Moon' || b.key === 'Sun' || b.key === 'Moon') ? 2 : 0);
        if (Math.abs(d - asp[0]) <= orb) out.push({ a: a.key, b: b.key, type: asp[1], angle: asp[0], orb: Math.abs(d - asp[0]) });
      });
    }
    return out.sort(function (x, y) { return x.orb - y.orb; });
  }

  // ---------- Ведическая астрология ----------
  var NAK_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'];
  var DASHA_YEARS = { Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17 };
  function dashas(moonSid, birthMs) {
    var span = 360 / 27, idx = Math.floor(moonSid / span), frac = (moonSid - idx * span) / span;
    var start = NAK_LORDS.indexOf(NAK_LORDS[idx % 9]), list = [], t = birthMs, YEAR = 365.25 * 86400000;
    for (var k = 0; k < 10; k++) {
      var lord = NAK_LORDS[(start + k) % 9], yrs = DASHA_YEARS[lord] * (k === 0 ? 1 - frac : 1);
      var begin = k === 0 ? birthMs - DASHA_YEARS[lord] * frac * YEAR : t;
      var end = t + yrs * YEAR;
      var subs = [], s = begin;
      for (var j = 0; j < 9; j++) {
        var sl = NAK_LORDS[(start + k + j) % 9], len = DASHA_YEARS[lord] * DASHA_YEARS[sl] / 120 * YEAR;
        subs.push({ lord: sl, start: s, end: s + len }); s += len;
      }
      list.push({ lord: lord, start: k === 0 ? birthMs : t, end: end, subs: subs });
      t = end;
    }
    return { nakshatra: idx, pada: Math.floor(frac * 4) + 1, list: list };
  }

  // ---------- Бацзы ----------
  var STEM_EL = ['wood', 'wood', 'fire', 'fire', 'earth', 'earth', 'metal', 'metal', 'water', 'water'];
  var BRANCH_MAIN = [9, 5, 0, 1, 4, 2, 3, 5, 6, 7, 4, 8]; // главный скрытый ствол ветви
  var GEN = { wood: 'fire', fire: 'earth', earth: 'metal', metal: 'water', water: 'wood' };
  var CTRL = { wood: 'earth', earth: 'water', water: 'fire', fire: 'metal', metal: 'wood' };
  function parentOf(e) { for (var k in GEN) if (GEN[k] === e) return k; }
  function controllerOf(e) { for (var k in CTRL) if (CTRL[k] === e) return k; }
  function tenGod(dm, s) {
    var a = STEM_EL[dm], b = STEM_EL[s], same = (dm % 2) === (s % 2);
    if (a === b) return same ? 'companion' : 'robwealth';
    if (GEN[a] === b) return same ? 'eatinggod' : 'hurtingofficer';
    if (CTRL[a] === b) return same ? 'indirectwealth' : 'directwealth';
    if (CTRL[b] === a) return same ? 'sevenkillings' : 'directofficer';
    return same ? 'indirectresource' : 'directresource';
  }
  function jdn(y, m, d) {
    var a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }
  function eqTime(date) {
    var start = Date.UTC(date.getUTCFullYear(), 0, 0), n = (date.getTime() - start) / 86400000;
    var B = 360 / 365 * (n - 81);
    return 9.87 * sind(2 * B) - 7.53 * cosd(B) - 1.5 * sind(B); // минуты
  }
  function bazi(utcMs, lon, hasTime, gender) {
    var date = new Date(utcMs), sunLon = A.SunPosition(date).elon;
    // Истинное солнечное время места рождения
    var solarMs = utcMs + (lon * 4 + eqTime(date)) * 60000, sd = new Date(solarMs);
    var y = sd.getUTCFullYear(), m = sd.getUTCMonth() + 1, d = sd.getUTCDate();
    var cy = date.getUTCFullYear();
    if (date.getUTCMonth() < 2 && sunLon >= 270 && sunLon < 315) cy -= 1;
    var yStem = ((cy - 4) % 10 + 10) % 10, yBranch = ((cy - 4) % 12 + 12) % 12;
    var mIdx = Math.floor(norm(sunLon - 315) / 30); // 0 = месяц Тигра
    var mStem = ((yStem % 5) * 2 + 2 + mIdx) % 10, mBranch = (mIdx + 2) % 12;
    var dayNum = jdn(y, m, d), dStem = (dayNum + 9) % 10, dBranch = (dayNum + 1) % 12;
    var pillars = [[yStem, yBranch], [mStem, mBranch], [dStem, dBranch]];
    if (hasTime) {
      var hr = sd.getUTCHours() + sd.getUTCMinutes() / 60, hBranch = Math.floor((hr + 1) / 2) % 12;
      pillars.push([((dStem % 5) * 2 + hBranch) % 10, hBranch]);
    }
    // Баланс стихий и сила Хозяина дня
    var weights = [[1, 1], [1, 2.5], [0, 1.5], [1, 1]], count = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 }, total = 0;
    pillars.forEach(function (p, i) {
      count[STEM_EL[p[0]]] += weights[i][0]; count[STEM_EL[BRANCH_MAIN[p[1]]]] += weights[i][1];
      total += weights[i][0] + weights[i][1];
    });
    var dmEl = STEM_EL[dStem], support = count[dmEl] + count[parentOf(dmEl)];
    var strong = support / total >= 0.45;
    var favor = strong ? [GEN[dmEl], CTRL[dmEl], controllerOf(dmEl)] : [parentOf(dmEl), dmEl];
    if (strong) favor.sort(function (a, b) { return count[a] - count[b]; });
    var useful = favor.slice(0, 2), unfavorable = strong ? [parentOf(dmEl), dmEl] : [controllerOf(dmEl), CTRL[dmEl]];
    // Животное удачи (тайный друг, шесть гармоний) и союзники (три гармонии) ветви дня
    var SIX = [1, 0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
    var TRIADS = [[8, 0, 4, 'water'], [11, 3, 7, 'wood'], [2, 6, 10, 'fire'], [5, 9, 1, 'metal']];
    var friend = SIX[dBranch], triad = TRIADS.filter(function (t) { return t.indexOf(dBranch) >= 0 && t.indexOf(dBranch) < 3; })[0];
    var allies = triad.slice(0, 3).filter(function (b) { return b !== dBranch; });
    // Талисман богатства по ветви дня: Крыса → Коза, Бык → Обезьяна, … Свинья → Лошадь
    var wealthAnimal = (dBranch + 7) % 12;
    function rate(stem, branch) {
      var sc = 0, els = [STEM_EL[stem], STEM_EL[BRANCH_MAIN[branch]]];
      els.forEach(function (e, i) { var w = i ? 1.2 : 1; if (useful.indexOf(e) >= 0) sc += w; else if (unfavorable.indexOf(e) >= 0) sc -= w; });
      // Животное удачи делает период хорошим или сглаживает трудный, союзник — поддерживает
      if (branch === friend) sc = Math.max(sc, 0) + 1;
      else if (allies.indexOf(branch) >= 0) sc += 0.5;
      return sc;
    }
    // Такты удачи
    var yangYear = yStem % 2 === 0, forward = (yangYear && gender === 'm') || (!yangYear && gender === 'f');
    var jieNext = norm(15 + 30 * Math.ceil((sunLon - 15) / 30)), jiePrev = norm(15 + 30 * Math.floor((sunLon - 15) / 30));
    var t = forward ? A.SearchSunLongitude(jieNext, date, 40) : A.SearchSunLongitude(jiePrev, new Date(utcMs - 40 * 86400000), 40);
    var daysTo = t ? Math.abs(t.date.getTime() - utcMs) / 86400000 : 15;
    var startAge = daysTo / 3, luck = [];
    for (var i = 1; i <= 9; i++) {
      var st = ((mStem + (forward ? i : -i)) % 10 + 10) % 10, br = ((mBranch + (forward ? i : -i)) % 12 + 12) % 12;
      var age = startAge + (i - 1) * 10;
      luck.push({ stem: st, branch: br, age: age, from: utcMs + age * 31557600000, score: rate(st, br), god: tenGod(dStem, st), friend: br === friend, ally: allies.indexOf(br) >= 0, wealth: br === wealthAnimal });
    }
    // Годы ближайшего будущего
    var nowYear = new Date().getFullYear(), years = [];
    for (var yy = nowYear; yy < nowYear + 10; yy++) {
      var ys = ((yy - 4) % 10 + 10) % 10, yb = ((yy - 4) % 12 + 12) % 12;
      years.push({ year: yy, stem: ys, branch: yb, score: rate(ys, yb), friend: yb === friend, ally: allies.indexOf(yb) >= 0, wealth: yb === wealthAnimal });
    }
    // Символические звёзды
    var branches = pillars.map(function (p) { return p[1]; });
    function group(b) { return [8, 0, 4].indexOf(b) >= 0 ? 0 : [2, 6, 10].indexOf(b) >= 0 ? 1 : [5, 9, 1].indexOf(b) >= 0 ? 2 : 3; }
    var PEACH = [9, 3, 6, 0], HORSE = [2, 8, 11, 5], CANOPY = [4, 10, 1, 7], GENERAL = [0, 6, 9, 3];
    var NOBLE = { 0: [1, 7], 4: [1, 7], 6: [1, 7], 1: [0, 8], 5: [0, 8], 2: [11, 9], 3: [11, 9], 7: [2, 6], 8: [3, 5], 9: [3, 5] };
    var ACADEMIC = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3];
    function hasAny(list) { return branches.some(function (b) { return list.indexOf(b) >= 0; }); }
    var refs = [yBranch, dBranch];
    var stars = {
      nobleman: hasAny(NOBLE[dStem]),
      academic: hasAny([ACADEMIC[dStem]]),
      peach: refs.some(function (r) { return branches.indexOf(PEACH[group(r)]) >= 0 && PEACH[group(r)] !== r; }),
      horse: refs.some(function (r) { return branches.indexOf(HORSE[group(r)]) >= 0; }),
      canopy: refs.some(function (r) { return branches.indexOf(CANOPY[group(r)]) >= 0; }),
      general: refs.some(function (r) { return branches.indexOf(GENERAL[group(r)]) >= 0; })
    };
    var gods = {};
    pillars.forEach(function (p, i) {
      if (i !== 2) gods[tenGod(dStem, p[0])] = (gods[tenGod(dStem, p[0])] || 0) + 1;
      gods[tenGod(dStem, BRANCH_MAIN[p[1]])] = (gods[tenGod(dStem, BRANCH_MAIN[p[1]])] || 0) + (i === 1 ? 1.5 : 1);
    });
    return {
      pillars: pillars, dayStem: dStem, dayBranch: dBranch, dmEl: dmEl, strong: strong, count: count,
      useful: useful, unfavorable: unfavorable, luck: luck, years: years, stars: stars, gods: gods,
      forward: forward, startAge: startAge, solarTime: hasTime ? sd : null,
      spouseEl: gender === 'm' ? CTRL[dmEl] : controllerOf(dmEl), wealthEl: CTRL[dmEl],
      friend: friend, allies: allies, triadEl: triad[3], wealthAnimal: wealthAnimal
    };
  }

  // ---------- Астрокартография ----------
  function acg(planets, gast, cities) {
    var lines = [];
    cities.forEach(function (c) {
      var lat = c[3], lon = c[4], lst = norm(gast * 15 + lon), hits = [];
      planets.forEach(function (p) {
        var H = diff(lst, p.ra), kmPerDeg = 111.32 * Math.max(cosd(lat), 0.2);
        var cand = [['MC', Math.abs(H)], ['IC', 180 - Math.abs(H)]];
        var x = -tand(lat) * tand(p.dec);
        if (Math.abs(x) < 1) {
          var h0 = Math.acos(x) / RAD;
          cand.push(['ASC', Math.abs(diff(H, -h0))], ['DSC', Math.abs(diff(H, h0))]);
        }
        cand.forEach(function (k) { var km = k[1] * kmPerDeg; if (km < 900) hits.push({ planet: p.key, angle: k[0], km: Math.round(km) }); });
      });
      lines.push({ city: c, hits: hits });
    });
    return lines;
  }

  // ---------- Карта целиком ----------
  function chart(input) {
    // input: { y, m, d, h, mi, hasTime, lat, lon, tz, gender }
    var h = input.hasTime ? input.h : 12, mi = input.hasTime ? input.mi : 0;
    var utc = localToUtc(input.y, input.m, input.d, h, mi, input.tz);
    var date = new Date(utc.ms), T = centuries(date), eps = obliquity(T), ayan = lahiri(date);
    var later = new Date(utc.ms + 86400000);
    var planets = BODIES.map(function (b) {
      var lon = bodyLon(b, date), lat = bodyLat(b, date), eq = toEquatorial(lon, lat, eps);
      var retro = b !== 'Sun' && b !== 'Moon' && diff(bodyLon(b, later), lon) < 0;
      return { key: b, lon: lon, lat: lat, ra: eq.ra, dec: eq.dec, retro: retro };
    });
    var node = trueNode(T), lil = meanLilith(T);
    planets.push({ key: 'NorthNode', lon: node, lat: 0, retro: true });
    planets.push({ key: 'SouthNode', lon: norm(node + 180), lat: 0, retro: true });
    planets.push({ key: 'Lilith', lon: lil, lat: 0 });
    var gast = A.SiderealTime(date), ramc = norm(gast * 15 + input.lon);
    var angles = null, cusps = null, system = null;
    if (input.hasTime) {
      angles = ascMc(ramc, input.lat, eps);
      cusps = placidus(ramc, input.lat, eps, angles.asc, angles.mc);
      system = 'Плацидус';
      if (!cusps) { cusps = porphyry(angles.asc, angles.mc); system = 'Порфирий (в высоких широтах Плацидус не работает)'; }
      planets.forEach(function (p) { p.house = houseOf(p.lon, cusps); });
    }
    planets.forEach(function (p) {
      p.sign = Math.floor(p.lon / 30); p.deg = p.lon % 30;
      p.sid = norm(p.lon - ayan); p.sidSign = Math.floor(p.sid / 30); p.sidDeg = p.sid % 30;
      p.nak = Math.floor(p.sid / (360 / 27));
    });
    var vedic = { ayanamsa: ayan, dashas: dashas(planets[1].sid, utc.ms) };
    if (angles) {
      var lagna = norm(angles.asc - ayan);
      vedic.lagna = lagna; vedic.lagnaSign = Math.floor(lagna / 30);
      planets.forEach(function (p) { p.vhouse = (p.sidSign - vedic.lagnaSign + 12) % 12 + 1; });
    }
    // Атмакарака: наибольший градус в знаке среди семи планет
    var seven = planets.slice(0, 7).slice().sort(function (a, b) { return b.sidDeg - a.sidDeg; });
    vedic.atmakaraka = seven[0].key;
    var aspPoints = planets.filter(function (p) { return BODIES.indexOf(p.key) >= 0 && (input.hasTime || p.key !== 'Moon'); }).map(function (p) { return { key: p.key, lon: p.lon }; });
    if (angles) aspPoints.push({ key: 'ASC', lon: angles.asc }, { key: 'MC', lon: angles.mc });
    return {
      utc: utc, date: date, eps: eps, gast: gast, planets: planets, angles: angles, cusps: cusps, houseSystem: system,
      aspects: aspects(aspPoints), vedic: vedic, bazi: bazi(utc.ms, input.lon, input.hasTime, input.gender),
      acg: input.hasTime && input.cities ? acg(planets.filter(function (p) { return BODIES.indexOf(p.key) >= 0; }), gast, input.cities) : null
    };
  }

  var api = { chart: chart, localToUtc: localToUtc, SIGNS: SIGNS, STEM_EL: STEM_EL, BRANCH_MAIN: BRANCH_MAIN, GEN: GEN, CTRL: CTRL, parentOf: parentOf, controllerOf: controllerOf, norm: norm, diff: diff, NAK_LORDS: NAK_LORDS };
  global.SakhaAstro = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
