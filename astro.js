// Платный астрологический разбор по авторскому методу.
// Анкета (дата, время и место рождения) + психологические тесты (Mini-IPIP, профориентация по Холланду, архетипы)
// → единый разбор: западная и ведическая астрология, бацзы, астрокартография, периоды жизни.
(function () {
  var root = document.getElementById('astro');
  if (!root || !window.SakhaAstro || !window.Astronomy) return;
  var S = window.SakhaAstro, CITIES = window.SAKHA_CITIES || [], DIAG = window.SAKHA_DIAG || {};
  var WHATSAPP = '79148286969', STORE = 'sakha-astro-v1', UNLOCK = 'sakha-astro-open', FREE_USED = 'sakha-astro-free';
  // Тестовый режим: столько разборов в браузере открываются без кода. Перед публикацией поставить 0.
  var FREE_TESTS = 5;
  // SHA-256 (первые 24 знака) кодов доступа, которые шаман выдаёт после оплаты
  var CODE_HASHES = ["0024bf28baa13f99303e6228", "4e834516701d5812a7225ef8", "3b0615c12114a278d70e4729", "318591a9d7f92f667e91ce9a", "90d952769d97b760621a9bba", "ca34d59826d91e61f8c4c4a4", "569f9c28f534735801a65478", "97bbb108d2a9377d45a5726e", "c6885343f326f63d561e25a7", "5e60ba3991b6c044420c1d55", "dfe4d4919b336c2d02d4cc82", "78e7675e42c5c5dcde499e96", "3ae4c33f30d8aa1e5af137b8", "61d2d357d80803d56eab5777", "531621d465bc5e0037a8b0eb", "ef92db400f084c3108076841", "48aaab3b303282a39430f826", "8374770e5248a6662c3357af", "1af9ba14c72453fbfa35a4e6", "45cf1b9b9c43e6801724ddb0", "fba9e96f15d211eceee71ef3", "d8cfbebd1f18b33b42adf247", "6500d0cfc3dde8162b9ceb71", "91a3b658f1da5d9fc8c900ed", "3265b4cd0d34c26fa387c222", "8f91f73872db519897e43a15", "0fe977b79d17da54001638c4", "a345555b72c81b0fbbceb4e7", "108d31b9ec2e4a49b0bb6412", "6379623d3f98da9e350adf79"];
  var stage = root.querySelector('.astro-stage');

  // ---------- Справочники: западная астрология ----------
  var SIGNS = S.SIGNS;
  var SIGN_STYLE = ['смело, прямо и с напором', 'спокойно, основательно, через тело и удовольствие', 'легко, любознательно, через слово и общение', 'чутко и заботливо, через семью и чувства', 'ярко, щедро, от сердца', 'точно и практично, через пользу и порядок', 'гармонично, через партнёрство и красоту', 'глубоко и страстно, без полумер', 'широко, с верой и поиском смысла', 'серьёзно и ответственно, на результат', 'свободно и нестандартно, ради будущего', 'тонко и интуитивно, с состраданием'];
  var SIGN_QUALITY = ['смелость и самостоятельность', 'устойчивость и умение ценить жизнь', 'любознательность и общение', 'заботу и чувство дома', 'творческое самовыражение и щедрость сердца', 'мастерство и служение', 'партнёрство и дипломатию', 'глубину и силу перерождения', 'веру, смысл и учительство', 'ответственность и достижения', 'свободу и служение людям', 'духовность, интуицию и сострадание'];
  var SIGN_EL = ['Огонь', 'Земля', 'Воздух', 'Вода'];
  var PLANET = {
    Sun: ['Солнце', '☉', 'ваше ядро, воля и путь к признанию', 'воля'],
    Moon: ['Луна', '☽', 'чувства, потребности и то, что даёт вам опору', 'чувства'],
    Mercury: ['Меркурий', '☿', 'мышление, речь и учёба', 'ум'],
    Venus: ['Венера', '♀', 'любовь, вкус, деньги и ценности', 'любовь и деньги'],
    Mars: ['Марс', '♂', 'энергия, желание и способ действовать', 'энергия'],
    Jupiter: ['Юпитер', '♃', 'удача, рост и вера', 'удача'],
    Saturn: ['Сатурн', '♄', 'уроки, дисциплина и зрелость', 'дисциплина'],
    Uranus: ['Уран', '♅', 'свобода и внезапные перемены', 'свобода'],
    Neptune: ['Нептун', '♆', 'мечты, вдохновение и духовность', 'вдохновение'],
    Pluto: ['Плутон', '♇', 'сила, кризисы и перерождение', 'сила'],
    NorthNode: ['Северный узел (Раху)', '☊', 'задача этой жизни', 'путь'],
    SouthNode: ['Южный узел (Кету)', '☋', 'опыт прошлого', 'прошлое'],
    Lilith: ['Лилит (Чёрная Луна)', '⚸', 'тень, соблазны и подавленные желания', 'тень'],
    ASC: ['Асцендент', 'AC', 'то, как вы проявляетесь', 'личность'],
    MC: ['MC', 'MC', 'призвание и вершина карьеры', 'призвание']
  };
  var HOUSE = ['личность и тело', 'деньги и ресурсы', 'общение, учёба и ближний круг', 'дом, род и корни', 'творчество, дети и удовольствия', 'работа, здоровье и служение', 'партнёрство и брак', 'кризисы, общие деньги и глубокие перемены', 'мировоззрение, путешествия и учителя', 'карьера, призвание и статус', 'друзья, сообщества и мечты', 'уединение, духовность и подсознание'];
  var ASPECT_TEXT = { 'соединение': 'сливаются в одну силу', 'трин': 'поддерживают друг друга — это врождённый талант', 'секстиль': 'легко сотрудничают — это возможность, которую стоит использовать', 'квадрат': 'спорят между собой — это напряжение, которое толкает к росту', 'оппозиция': 'тянут в разные стороны — здесь нужен баланс' };
  var HARMONY = { 'трин': 1, 'секстиль': 1, 'соединение': 0, 'квадрат': -1, 'оппозиция': -1 };

  // ---------- Ведическая астрология ----------
  var NAK = [['Ашвини', 'скорость, исцеление, новые начала'], ['Бхарани', 'сила жизни, ответственность, перерождение'], ['Криттика', 'очищающий огонь, решительность'], ['Рохини', 'красота, плодородие, притяжение'], ['Мригашира', 'поиск, любопытство, мягкость'], ['Ардра', 'буря и обновление через кризис'], ['Пунарвасу', 'возвращение света, восстановление'], ['Пушья', 'питание, забота, духовная опора'], ['Ашлеша', 'проницательность, змеиная мудрость'], ['Магха', 'род, предки, царственная сила'], ['Пурва-Пхальгуни', 'радость, любовь, творчество'], ['Уттара-Пхальгуни', 'союзы, верность, покровительство'], ['Хаста', 'мастерство рук, ремесло'], ['Читра', 'красота формы, созидание'], ['Свати', 'независимость, гибкость, торговля'], ['Вишакха', 'целеустремлённость и победа'], ['Анурадха', 'дружба, преданность, успех вдали от дома'], ['Джьештха', 'старшинство, защита, сила'], ['Мула', 'корни, поиск истины, отсечение лишнего'], ['Пурва-Ашадха', 'непобедимость, очищение водой'], ['Уттара-Ашадха', 'окончательная победа и честь'], ['Шравана', 'слушание, обучение, мудрость'], ['Дхаништха', 'ритм, музыка, достаток'], ['Шатабхиша', 'сто целителей, тайные знания'], ['Пурва-Бхадрапада', 'огонь аскезы, трансформация'], ['Уттара-Бхадрапада', 'глубина, мудрость, покой'], ['Ревати', 'путеводность, забота, завершение пути']];
  var GRAHA = { Sun: 'Солнце (Сурья)', Moon: 'Луна (Чандра)', Mars: 'Марс (Мангала)', Mercury: 'Меркурий (Будха)', Jupiter: 'Юпитер (Гуру)', Venus: 'Венера (Шукра)', Saturn: 'Сатурн (Шани)', Rahu: 'Раху', Ketu: 'Кету' };
  var DASHA_TEXT = { Sun: 'лидерство, признание, отношения с властью и отцом', Moon: 'чувства, семья, дом и забота', Mars: 'действие, смелые решения, борьба и недвижимость', Mercury: 'учёба, общение, торговля и тексты', Jupiter: 'рост, мудрость, учителя, дети и удача', Venus: 'любовь, красота, комфорт, деньги и искусство', Saturn: 'труд, ответственность и проверка на прочность — результаты приходят медленно, но надолго', Rahu: 'амбиции, резкие перемены, новое и иностранное', Ketu: 'отрешённость, духовность, завершения и поиск смысла' };
  var DASHA_TONE = { Jupiter: 1, Venus: 1, Moon: 1, Mercury: 1, Sun: 0, Mars: 0, Saturn: -1, Rahu: -1, Ketu: 0 };
  var EXALT = { Sun: 0, Moon: 1, Mars: 9, Mercury: 5, Jupiter: 3, Venus: 11, Saturn: 6 };
  var OWN = { Sun: [4], Moon: [3], Mars: [0, 7], Mercury: [2, 5], Jupiter: [8, 11], Venus: [1, 6], Saturn: [9, 10] };
  var AK_TEXT = { Sun: 'душа стремится к признанию и честному лидерству', Moon: 'душа учится заботе и эмоциональной зрелости', Mars: 'душа учится смелости и правильному использованию силы', Mercury: 'душа развивается через знания, речь и обучение других', Jupiter: 'душа приходит учить и нести мудрость', Venus: 'душа учится любви, красоте и гармонии в отношениях', Saturn: 'душа проходит путь терпения, труда и служения' };

  // ---------- Бацзы ----------
  var STEM_RU = ['Цзя', 'И', 'Бин', 'Дин', 'У', 'Цзи', 'Гэн', 'Синь', 'Жэнь', 'Гуй'];
  var STEM_CH = '甲乙丙丁戊己庚辛壬癸', BRANCH_CH = '子丑寅卯辰巳午未申酉戌亥';
  var BRANCH_RU = ['Крыса', 'Бык', 'Тигр', 'Кролик', 'Дракон', 'Змея', 'Лошадь', 'Коза', 'Обезьяна', 'Петух', 'Собака', 'Свинья'];
  var EL = { wood: 'Дерево', fire: 'Огонь', earth: 'Земля', metal: 'Металл', water: 'Вода' };
  var EL_GEN = { wood: 'Дерева', fire: 'Огня', earth: 'Земли', metal: 'Металла', water: 'Воды' };
  var DIRECTION = { wood: 'восток', fire: 'юг', earth: 'центр (рядом с местом рождения)', metal: 'запад', water: 'север' };
  var DM_TEXT = ['Могучее дерево: прямота, рост, покровительство', 'Гибкая трава: приспособляемость, дипломатия, упорство', 'Солнце: щедрость, открытость, свет для других', 'Пламя свечи: тонкость, тепло, внутренний свет', 'Гора: надёжность, сила, устойчивость', 'Плодородная почва: забота, терпение, умение взращивать', 'Меч: решительность, справедливость, прямота', 'Драгоценность: изящество, ценность, тонкий вкус', 'Океан: размах, мудрость, свобода', 'Роса и дождь: интуиция, мягкость, проникновенность'];
  var GOD = {
    companion: ['Друг', 'самостоятельность и опора на себя, дела наравне с партнёрами'],
    robwealth: ['Соперник', 'азарт, конкуренция, сила команды; с деньгами нужна осторожность'],
    eatinggod: ['Бог еды', 'творчество, вкус, удовольствие, мягкое самовыражение'],
    hurtingofficer: ['Ранящий чиновника', 'яркий талант, сильная речь, новаторство, неприятие рамок'],
    indirectwealth: ['Свободные деньги', 'предпринимательство, торговля, доход из многих источников'],
    directwealth: ['Стабильные деньги', 'надёжный доход, бережливость, управление ресурсами'],
    sevenkillings: ['Воин', 'смелость, работа в кризисе, власть через вызов'],
    directofficer: ['Чиновник', 'статус, порядок, репутация, работа в структуре'],
    indirectresource: ['Мистик', 'интуиция, нетрадиционные знания, психология, эзотерика, целительство'],
    directresource: ['Наставник', 'обучение, поддержка, образование, забота о людях']
  };
  var ACTIVITIES = {
    metal: ['финансы, банки, инвестиции', 'юриспруденция и договоры', 'инженерия, техника, станки', 'ювелирное дело и работа с металлом', 'изготовление инструментов и атрибутики', 'управление, контроль, аудит', 'IT-системы и безопасность', 'хирургия, стоматология, точная медицина'],
    water: ['торговля и перепродажа', 'логистика и транспорт', 'путешествия и туризм', 'психология и консультирование', 'философия, духовные практики, ретриты', 'связь, переговоры, медиа', 'напитки, рыба, всё, что связано с водой', 'исследования и аналитика'],
    wood: ['образование и обучение', 'книги, тексты, издательство', 'мода, текстиль, одежда', 'травы, растения, фитотерапия', 'медицина и восстановление здоровья', 'мебель и изделия из дерева', 'коучинг и развитие людей', 'экология и работа с природой'],
    fire: ['медиа, блог, публичность', 'сцена, шоу, ведение праздников', 'реклама и маркетинг', 'красота и косметология', 'электроника и IT', 'энергетика', 'кулинария и ресторанное дело', 'обряды и ритуалы с огнём'],
    earth: ['недвижимость и строительство', 'земля, хозяйство, фермерство', 'консалтинг и посредничество', 'страхование и хранение', 'керамика, камень, глина', 'гостиничное дело и гостевые дома', 'управление ресурсами и складом', 'забота о семье, дом и быт как бизнес']
  };
  var INDUSTRY = {
    wood: 'образование, книги, обучение людей, мода и текстиль, травы и растения, развитие и рост',
    fire: 'медиа, сцена, реклама, красота, IT и электроника, публичные выступления',
    earth: 'недвижимость, строительство, земля и хозяйство, консалтинг, посредничество',
    metal: 'финансы, право, инженерия, металлы и украшения, техника, управление',
    water: 'торговля, логистика, путешествия и туризм, психология, философия, духовные практики'
  };
  var STAR = {
    nobleman: ['Благородный покровитель', 'в трудный момент приходят люди, которые помогают; ищите наставников и покровителей'],
    academic: ['Звезда учёности', 'способность к учёбе, письму и знаниям — учение приносит успех'],
    peach: ['Персиковый цветок', 'обаяние и притягательность; сильна сфера любви, красоты и публичности'],
    horse: ['Почтовая лошадь', 'движение, переезды, путешествия — удача приходит в дороге'],
    canopy: ['Хуа Гай (Балдахин)', 'тяга к духовному, искусству и тайным знаниям — знак тех, кто идёт путём мудрости'],
    general: ['Звезда генерала', 'лидерство, авторитет, способность вести людей']
  };

  // ---------- Психология и профориентация ----------
  var BIG5 = {
    E: ['Экстраверсия', 'общительность', 'любовь к тишине', 'Вы черпаете силы в людях и действии, легко начинаете разговор и заряжаете окружающих.', 'Вы черпаете силы в тишине и глубоких разговорах один на один; вам нужно время на восстановление.'],
    A: ['Доброжелательность', 'мягкость', 'прямота', 'Вы мягки, чутки и легко сопереживаете — люди доверяют вам самое личное.', 'Вы прямы и независимы в суждениях — умеете отстаивать своё и говорить неудобную правду.'],
    C: ['Организованность', 'собранность', 'гибкость', 'Вы собраны и надёжны: доводите дела до конца, на вас можно положиться.', 'Вы гибки и спонтанны: лучше работаете по вдохновению, чем по жёсткому плану.'],
    N: ['Чувствительность', 'тонкая чувствительность', 'устойчивость', 'Вы глубоко переживаете и тонко чувствуете — это дар, но ресурс нужно беречь.', 'Вы эмоционально устойчивы и спокойны в стрессе.'],
    O: ['Открытость опыту', 'воображение', 'практичность', 'У вас живое воображение и интерес к идеям, тайному и новому.', 'Вы практичны и опираетесь на проверенное — сильная сторона в реальных делах.']
  };
  var RIASEC = {
    R: ['Практик', 'вам важно делать руками, работать с материалом, телом и природой'],
    I: ['Исследователь', 'вам важно понимать, изучать и докапываться до сути'],
    A: ['Творец', 'вам важно создавать, выражать себя и работать с образами'],
    S: ['Помогающий', 'вам важно помогать, учить и поддерживать людей'],
    E: ['Лидер', 'вам важно вести, убеждать, организовывать и зарабатывать'],
    C: ['Организатор', 'вам важны порядок, точность, структура и надёжность']
  };
  var JOBS = [
    ['R', 'metal', 'Мастер ремёсел и шаманской атрибутики'], ['R', 'wood', 'Мастер по дереву, столяр'], ['R', 'wood', 'Садовник, ландшафтный дизайнер'], ['R', 'water', 'Гид, инструктор походов и экспедиций'], ['R', 'earth', 'Массажист, телесный терапевт'], ['R', 'metal', 'Ювелир'], ['R', 'fire', 'Повар, мастер национальной кухни'],
    ['I', 'water', 'Исследователь, учёный'], ['I', 'metal', 'Аналитик'], ['I', 'wood', 'Фитотерапевт, специалист по травам'], ['I', 'water', 'Астролог, специалист по метафизике'], ['I', 'fire', 'Программист'], ['I', 'earth', 'Историк, этнограф, знаток традиций'],
    ['A', 'fire', 'Художник'], ['A', 'metal', 'Дизайнер одежды и украшений'], ['A', 'water', 'Музыкант'], ['A', 'fire', 'Фотограф, видеограф'], ['A', 'wood', 'Писатель, автор, сценарист'], ['A', 'earth', 'Мастер этнических изделий'], ['A', 'earth', 'Дизайнер интерьера'],
    ['S', 'water', 'Психолог, консультант'], ['S', 'wood', 'Преподаватель, наставник'], ['S', 'water', 'Проводник ретритов и духовных практик'], ['S', 'wood', 'Коуч'], ['S', 'earth', 'Руководитель социальных и семейных проектов'], ['S', 'wood', 'Реабилитолог, специалист по здоровью'], ['S', 'fire', 'Тренер, ведущий групп'],
    ['E', 'fire', 'Предприниматель'], ['E', 'metal', 'Руководитель проектов'], ['E', 'fire', 'Продюсер, организатор событий'], ['E', 'fire', 'Маркетолог, специалист по продажам'], ['E', 'water', 'Владелец туристического бизнеса'], ['E', 'metal', 'Юрист, переговорщик'], ['E', 'earth', 'Ресторатор, владелец гостевого дома'],
    ['C', 'metal', 'Финансист, бухгалтер'], ['C', 'earth', 'Администратор, операционный менеджер'], ['C', 'water', 'Логист'], ['C', 'earth', 'Архивист, специалист по документам'], ['C', 'metal', 'Аналитик данных']
  ];
  var ARCH_TYPES = [['S', 'C'], ['I', 'S'], ['R', 'I'], ['A', 'E'], ['I', 'S', 'A'], ['R', 'E'], ['A', 'S'], ['A', 'S'], ['S', 'C', 'R'], ['S'], ['E', 'C'], ['A']];
  var MC_TYPES = { 'Огонь': ['E', 'A'], 'Земля': ['R', 'C'], 'Воздух': ['I', 'S', 'E'], 'Вода': ['S', 'A', 'I'] };

  // ---------- Вопросы ----------
  var LIKERT = [['Точно да', 4], ['Скорее да', 3], ['Не знаю', 2], ['Скорее нет', 1], ['Нет', 0]];
  var INTEREST = [['Нравится', 2], ['Не уверен(а)', 1], ['Не нравится', 0]];
  function b5(f, rev, text) { return { set: 'big5', f: f, rev: rev, text: text }; }
  function ri(t, text) { return { set: 'riasec', t: t, text: text }; }
  // Mini-IPIP (Donnellan и соавт., 2006; пункты IPIP — общественное достояние)
  var Q_BIG5 = [
    b5('E', 0, 'Я душа компании'), b5('A', 0, 'Я сочувствую чувствам других людей'), b5('C', 0, 'Я сразу берусь за домашние дела'), b5('N', 0, 'У меня часто меняется настроение'), b5('O', 0, 'У меня яркое воображение'),
    b5('E', 1, 'Я немногословен(на)'), b5('A', 1, 'Мне не интересны чужие проблемы'), b5('C', 1, 'Я часто забываю положить вещи на место'), b5('N', 1, 'Большую часть времени я спокоен(на)'), b5('O', 1, 'Абстрактные идеи мне не интересны'),
    b5('E', 0, 'На праздниках я общаюсь со множеством разных людей'), b5('A', 0, 'Я чувствую эмоции других'), b5('C', 0, 'Я люблю порядок'), b5('N', 0, 'Меня легко расстроить'), b5('O', 1, 'Мне трудно понимать отвлечённые идеи'),
    b5('E', 1, 'Я держусь в тени'), b5('A', 1, 'Другие люди мне не особенно интересны'), b5('C', 1, 'Я всё запутываю и откладываю'), b5('N', 1, 'Мне редко бывает грустно'), b5('O', 1, 'У меня бедное воображение')
  ];
  // Профориентация по Холланду (по мотивам O*NET Interest Profiler — общественное достояние США)
  var Q_RIASEC = [
    ri('R', 'Делать мебель или изделия из дерева'), ri('I', 'Изучать строение тела человека'), ri('A', 'Писать книги, статьи или стихи'), ri('S', 'Помогать людям с личными и душевными трудностями'), ri('E', 'Открыть собственное дело'), ri('C', 'Вести учёт денег и документов'),
    ri('R', 'Ремонтировать технику и вещи'), ri('I', 'Проводить опыты и исследования'), ri('A', 'Играть на музыкальном инструменте'), ri('S', 'Давать людям советы о профессии и пути'), ri('E', 'Договариваться о сделках и контрактах'), ri('C', 'Составлять таблицы и отчёты'),
    ri('R', 'Работать на природе: в лесу, в поле, с животными'), ri('I', 'Изучать звёзды, планеты и законы природы'), ri('A', 'Рисовать, создавать дизайн и красивые вещи'), ri('S', 'Учить детей или взрослых'), ri('E', 'Руководить отделом или командой'), ri('C', 'Проверять документы на ошибки'),
    ri('R', 'Делать украшения, одежду или изделия руками'), ri('I', 'Разбираться в причинах сложных явлений'), ri('A', 'Выступать на сцене, петь или танцевать'), ri('S', 'Проводить групповые занятия и практики'), ri('E', 'Продавать и продвигать товар или услугу'), ri('C', 'Планировать расписание и бюджет'),
    ri('R', 'Готовить еду для многих людей'), ri('I', 'Изучать травы, минералы и лекарства'), ri('A', 'Снимать фото и видео'), ri('S', 'Заботиться о больных и пожилых'), ri('E', 'Организовывать большие события'), ri('C', 'Наводить порядок в данных и архивах'),
    ri('R', 'Работать с инструментами и механизмами'), ri('I', 'Решать сложные логические задачи'), ri('A', 'Сочинять музыку или песни'), ri('S', 'Работать с детьми'), ri('E', 'Вести переговоры и убеждать людей'), ri('C', 'Работать с цифрами и расчётами'),
    ri('R', 'Строить дом, баню или делать ремонт'), ri('I', 'Изучать психологию и устройство человека'), ri('A', 'Шить, вязать, вышивать, создавать узоры'), ri('S', 'Помогать людям восстанавливаться после болезни или горя'), ri('E', 'Руководить собственным бизнесом'), ri('C', 'Составлять инструкции и правила'),
    ri('R', 'Ухаживать за животными: лошадьми, оленями, собаками'), ri('I', 'Анализировать данные и находить закономерности'), ri('A', 'Оформлять пространство и праздники'), ri('S', 'Вести людей через обряды и практики'), ri('E', 'Выступать перед публикой и вести за собой'), ri('C', 'Следить за порядком на складе или в магазине')
  ];
  // Детство — ключ к призванию: что человек любил до того, как появились «надо»
  function kid(t, text) { return { set: 'child', t: t, text: 'В детстве я любил(а) ' + text }; }
  var Q_CHILD = [
    { set: 'childText', type: 'text', text: 'Чем вы больше всего любили заниматься в детстве? Напишите своими словами — это ключ к вашему призванию' },
    kid('R', 'мастерить, строить, разбирать вещи'), kid('I', 'задавать вопросы «почему?» и читать энциклопедии'), kid('A', 'рисовать, лепить, петь или танцевать'),
    kid('S', 'заботиться о младших, играть «в школу» или «в больницу»'), kid('E', 'быть заводилой и командовать в играх'), kid('C', 'раскладывать вещи по порядку, собирать коллекции'),
    kid('R', 'бегать, лазить, играть на улице и в лесу'), kid('I', 'наблюдать за природой, звёздами, ставить опыты'), kid('A', 'сочинять истории, играть в театр, наряжаться'),
    kid('S', 'мирить друзей и выслушивать их секреты'), kid('E', 'продавать, меняться, придумывать, как заработать'), kid('C', 'играть «в магазин» или «в банк», считать'),
    kid('R', 'возиться с животными или в огороде'), kid('I', 'решать головоломки и задачки'), kid('A', 'придумывать свои игры и миры'),
    kid('S', 'помогать взрослым и чувствовать себя нужным'), kid('E', 'соревноваться и побеждать'), kid('C', 'делать всё аккуратно и по правилам')
  ];
  var CHILD_SCALE = [['Да, очень', 2], ['Иногда', 1], ['Нет / не помню', 0]];
  var Q_ARCH = (DIAG.ARCH_QS || []).map(function (q) { return { set: 'arch', text: q.text, opts: q.opts }; });
  var BLOCKS = [
    { title: 'Психологический портрет', lead: 'Тест «Большая пятёрка». Насколько это про вас?', qs: Q_BIG5, scale: LIKERT },
    { title: 'Детство — ключ', lead: 'Вспомните себя до 12 лет: чем вы жили, когда никто не заставлял', qs: Q_CHILD, scale: CHILD_SCALE },
    { title: 'Профориентация', lead: 'Как вам такое занятие? Не думайте о зарплате и образовании', qs: Q_RIASEC, scale: INTEREST },
    { title: 'Архетипы Юнга', lead: 'Выберите вариант, который ближе', qs: Q_ARCH }
  ];
  var FLAT = [];
  BLOCKS.forEach(function (b, bi) { b.qs.forEach(function (q) { FLAT.push({ b: bi, q: q }); }); });
  var TOTAL = FLAT.length;

  // ---------- Состояние ----------
  var state = { form: null, answers: [], step: 0 };
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }
  function load() { try { var s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (s && s.answers) state = s; } catch (e) {} }
  // Код открывает только тот разбор, для которого его ввели (дата, время, место, пол)
  function reportKey() { var f = state.form; return [f.date, f.time, f.city, f.gender].join('|'); }
  function readList(k) { try { return JSON.parse(localStorage.getItem(k) || '[]'); } catch (e) { return []; } }
  function writeList(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function unlocked() { return readList(UNLOCK).indexOf(reportKey()) >= 0; }
  function openReport() { var l = readList(UNLOCK); if (l.indexOf(reportKey()) < 0) { l.push(reportKey()); writeList(UNLOCK, l); } }
  // Возвращает номер тестового разбора, если он открыт бесплатно, иначе 0
  function freeTest() {
    var used = readList(FREE_USED), key = reportKey(), i = used.indexOf(key);
    if (i >= 0) return i + 1;
    if (used.length >= FREE_TESTS) return 0;
    used.push(key); writeList(FREE_USED, used); return used.length;
  }

  // ---------- Помощники ----------
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function deg(x) { var d = Math.floor(x), m = Math.floor((x - d) * 60); return d + '°' + (m < 10 ? '0' : '') + m + '′'; }
  function pos(lon) { return SIGNS[Math.floor(lon / 30)] + ' ' + deg(lon % 30); }
  function pname(k) { return PLANET[k] ? PLANET[k][0] : (GRAHA[k] || k); }
  function year(ms) { return new Date(ms).getFullYear(); }
  function ageAt(ms, birth) { return Math.floor((ms - birth) / 31557600000); }
  function swap(html, after) {
    var old = stage.firstElementChild;
    function show() {
      stage.innerHTML = '<div class="diag-card">' + html + '</div>';
      if (after) after(stage.firstElementChild);
    }
    if (!old) return show();
    old.classList.add('leaving'); setTimeout(show, 200);
  }
  function scrollTop() { var y = root.getBoundingClientRect().top + window.pageYOffset - 80; if (window.pageYOffset > y) window.scrollTo(0, y); }
  function lc(s) { return s.toLowerCase().replace(/ё/g, 'е'); }
  var TR = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya' };
  function translit(s) { return lc(s).split('').map(function (c) { return TR[c] !== undefined ? TR[c] : c; }).join(''); }
  function findCities(q) {
    q = lc(q.trim()); if (q.length < 2) return [];
    var t = translit(q).replace(/[^a-z]/g, ''), res = [];
    CITIES.forEach(function (c, i) {
      var ru = lc(c[0]), la = c[1].toLowerCase().replace(/[^a-z]/g, ''), score = -1;
      if (ru.indexOf(q) === 0 || (t && la.indexOf(t) === 0)) score = 2;
      else if (ru.indexOf(q) > 0) score = 1;
      if (score >= 0) res.push([score, i]);
    });
    return res.sort(function (a, b) { return b[0] - a[0] || a[1] - b[1]; }).slice(0, 8).map(function (r) { return r[1]; });
  }
  function cityName(c) { return c[0] || c[1]; }

  // ---------- Шаг 1: анкета ----------
  function renderForm() {
    var f = state.form || {};
    var has = state.answers.length > 0 && state.step < TOTAL;
    swap(
      '<form class="diag-form astro-form" novalidate autocomplete="off">' +
      '<label for="as-name">Имя</label><input id="as-name" type="text" value="' + esc(f.name || '') + '">' +
      '<fieldset class="astro-gender"><legend>Пол</legend>' +
      '<label><input type="radio" name="as-gender" value="f"' + (f.gender === 'f' ? ' checked' : '') + '> Женский</label>' +
      '<label><input type="radio" name="as-gender" value="m"' + (f.gender === 'm' ? ' checked' : '') + '> Мужской</label></fieldset>' +
      '<label for="as-date">Дата рождения</label><input id="as-date" type="date" min="1920-01-01" max="2015-12-31" value="' + esc(f.date || '') + '">' +
      '<label for="as-time">Время рождения</label><input id="as-time" type="time" value="' + esc(f.time || '') + '"' + (f.noTime ? ' disabled' : '') + '>' +
      '<label class="astro-check"><input id="as-notime" type="checkbox"' + (f.noTime ? ' checked' : '') + '> Не знаю точного времени</label>' +
      '<label for="as-city">Место рождения</label>' +
      '<div class="astro-city"><input id="as-city" type="text" placeholder="Начните вводить: Якутск, Нюрба, Москва…" value="' + esc(f.city !== undefined ? cityName(CITIES[f.city]) : '') + '">' +
      '<ul class="astro-suggest" hidden></ul></div>' +
      '<p class="astro-hint">Если вашего села нет в списке, выберите ближайший к нему город или райцентр.</p>' +
      '<p class="diag-error" hidden></p>' +
      '<div class="diag-actions">' +
      (has ? '<button class="btn btn-lime" type="button" data-act="continue">Продолжить с вопроса ' + (state.step + 1) + '</button><button class="btn btn-ghost" type="submit">Начать заново</button>'
           : '<button class="btn btn-lime" type="submit">Далее: ' + TOTAL + ' вопросов</button>') +
      '</div></form>',
      function (card) {
        var city = f.city, input = card.querySelector('#as-city'), list = card.querySelector('.astro-suggest');
        var time = card.querySelector('#as-time'), noTime = card.querySelector('#as-notime'), err = card.querySelector('.diag-error');
        noTime.addEventListener('change', function () { time.disabled = noTime.checked; });
        input.addEventListener('input', function () {
          city = undefined;
          var found = findCities(input.value);
          list.innerHTML = found.map(function (i) { var c = CITIES[i]; return '<li><button type="button" data-i="' + i + '">' + esc(cityName(c)) + '<span>' + esc(c[2]) + '</span></button></li>'; }).join('');
          list.hidden = !found.length;
        });
        list.addEventListener('click', function (e) {
          var b = e.target.closest('button'); if (!b) return;
          city = +b.getAttribute('data-i'); input.value = cityName(CITIES[city]); list.hidden = true;
        });
        function take() {
          var g = card.querySelector('input[name="as-gender"]:checked'), date = card.querySelector('#as-date').value;
          var msg = !g ? 'Укажите пол: от него зависит направление тактов удачи в бацзы.' : !/^\d{4}-\d{2}-\d{2}$/.test(date) ? 'Укажите дату рождения.' : (!noTime.checked && !/^\d{2}:\d{2}/.test(time.value)) ? 'Укажите время рождения или отметьте «Не знаю точного времени».' : city === undefined ? 'Выберите место рождения из списка подсказок.' : '';
          if (msg) { err.textContent = msg; err.hidden = false; return false; }
          state.form = { name: card.querySelector('#as-name').value.trim(), gender: g.value, date: date, time: noTime.checked ? '' : time.value.slice(0, 5), noTime: noTime.checked, city: city };
          return true;
        }
        card.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); if (!take()) return; state.answers = []; state.step = 0; save(); renderBlockStart(); });
        var cont = card.querySelector('[data-act="continue"]');
        if (cont) cont.addEventListener('click', function () { if (!take()) return; save(); renderQuestion(); });
      }
    );
  }

  // ---------- Шаг 2: вопросы ----------
  function progress() {
    var start = 0;
    return '<div class="diag-progress astro-progress" aria-hidden="true">' + BLOCKS.map(function (b) {
      var done = Math.max(0, Math.min(b.qs.length, state.step - start)), w = done / b.qs.length * 100; start += b.qs.length;
      return '<span><i style="width:' + w + '%"></i></span>';
    }).join('') + '</div>';
  }
  function renderBlockStart() {
    var bi = FLAT[state.step].b, b = BLOCKS[bi];
    scrollTop();
    swap(progress() + '<p class="diag-kicker">Блок ' + (bi + 1) + ' из ' + BLOCKS.length + ' · ' + b.qs.length + ' вопросов</p>' +
      '<h3 class="diag-block-title">' + esc(b.title) + '</h3><p class="diag-lead">' + esc(b.lead) + '</p>' +
      '<div class="diag-actions"><button class="btn btn-lime" type="button">Начать блок</button></div>',
      function (card) { card.querySelector('button').addEventListener('click', renderQuestion); });
  }
  function renderQuestion() {
    if (state.step >= TOTAL) return renderReport();
    var item = FLAT[state.step], q = item.q, b = BLOCKS[item.b];
    var opts = q.opts ? q.opts.map(function (o) { return [o[1], o[0]]; }) : b.scale;
    var cur = state.answers[state.step];
    if (q.type === 'text') {
      return swap(progress() +
        '<p class="diag-kicker"><span>/' + (item.b + 1) + ' ' + esc(b.title) + '</span><span>Вопрос ' + (state.step + 1) + ' из ' + TOTAL + '</span></p>' +
        '<h3 class="diag-q">' + esc(q.text) + '</h3><label class="astro-sr" for="as-child">Ваш ответ</label>' +
        '<textarea id="as-child" class="astro-textarea" rows="4" maxlength="400" placeholder="Например: рисовала часами, собирала травы с бабушкой, устраивала концерты…">' + esc(typeof cur === 'string' ? cur : '') + '</textarea>' +
        '<div class="diag-actions"><button type="button" class="btn btn-lime">Дальше</button></div>' +
        (state.step > 0 ? '<button type="button" class="diag-back">← Назад</button>' : ''),
        function (card) {
          card.querySelector('.btn-lime').addEventListener('click', function () {
            state.answers[state.step] = card.querySelector('textarea').value.trim(); state.step++; save(); renderQuestion();
          });
          var back = card.querySelector('.diag-back');
          if (back) back.addEventListener('click', function () { state.step--; save(); renderQuestion(); });
        });
    }
    swap(progress() +
      '<p class="diag-kicker"><span>/' + (item.b + 1) + ' ' + esc(b.title) + '</span><span>Вопрос ' + (state.step + 1) + ' из ' + TOTAL + '</span></p>' +
      '<h3 class="diag-q">' + esc(q.text) + '</h3><div class="diag-answers">' +
      opts.map(function (o) { return '<button type="button" class="diag-answer' + (cur === o[1] ? ' is-picked' : '') + '" data-v="' + o[1] + '">' + esc(o[0]) + '</button>'; }).join('') +
      '</div>' + (state.step > 0 ? '<button type="button" class="diag-back">← Назад</button>' : ''),
      function (card) {
        card.querySelectorAll('.diag-answer').forEach(function (btn) {
          btn.addEventListener('click', function () {
            state.answers[state.step] = Number(btn.getAttribute('data-v')); state.step++; save();
            if (state.step >= TOTAL) return renderReport();
            if (FLAT[state.step].b !== item.b) return renderBlockStart();
            renderQuestion();
          });
        });
        var back = card.querySelector('.diag-back');
        if (back) back.addEventListener('click', function () { state.step--; save(); renderQuestion(); });
      });
  }

  // ---------- Шаг 3: расчёт ----------
  function psych() {
    var big = { E: 0, A: 0, C: 0, N: 0, O: 0 }, rs = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }, child = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 }, childText = '', arch = (DIAG.ARCH || []).map(function () { return 0; });
    FLAT.forEach(function (it, i) {
      var a = state.answers[i]; if (a === undefined || a === null) return;
      var q = it.q;
      if (q.set === 'childText') { childText = String(a); return; }
      if (q.set === 'child') { child[q.t] += a; rs[q.t] += a * 1.5; return; } // детство весит в полтора раза больше
      if (q.set === 'big5') big[q.f] += q.rev ? 4 - a : a;
      else if (q.set === 'riasec') rs[q.t] += a;
      else arch[a] += 1;
    });
    var code = Object.keys(rs).sort(function (a, b) { return rs[b] - rs[a]; });
    var archRank = arch.map(function (v, i) { return i; }).sort(function (a, b) { return arch[b] - arch[a]; });
    var childCode = Object.keys(child).sort(function (a, b) { return child[b] - child[a]; });
    return { big: big, rs: rs, code: code, arch: archRank, child: child, childCode: childCode, childText: childText };
  }

  function professions(p, chart) {
    var bz = chart.bazi, mcEl = chart.angles ? SIGN_EL[Math.floor(chart.angles.mc / 30) % 4] : null;
    var archTypes = ARCH_TYPES[p.arch[0]] || [], max = p.rs[p.code[0]] || 1;
    var list = JOBS.map(function (j) {
      var rank = p.code.indexOf(j[0]), sc = rank < 3 ? (p.rs[j[0]] / max) * 3 - rank * 0.3 : 0, why = [];
      if (rank < 3) why.push('профориентация: ' + RIASEC[j[0]][0]);
      if (j[1] === bz.wealthEl) { sc += 1; why.push('стихия денег по бацзы: ' + EL[j[1]]); }
      if (j[0] === p.childCode[0] && p.child[j[0]] > 0) { sc += 0.7; why.push('ключ из детства'); }
      if (archTypes.indexOf(j[0]) >= 0) { sc += 0.6; why.push('архетип: ' + DIAG.ARCH[p.arch[0]].name); }
      if (mcEl && MC_TYPES[mcEl].indexOf(j[0]) >= 0) { sc += 0.5; why.push('MC в знаке ' + SIGNS[Math.floor(chart.angles.mc / 30)]); }
      return { name: j[2], type: j[0], el: j[1], score: sc, why: why };
    }).filter(function (j) { return p.code.indexOf(j.type) < 3; }).sort(function (a, b) { return b.score - a.score; });
    // Главный тип профориентации всегда представлен хотя бы двумя профессиями
    var top = list.slice(0, 6), main = list.filter(function (j) { return j.type === p.code[0]; });
    while (top.filter(function (j) { return j.type === p.code[0]; }).length < 2 && main.length) {
      var add = main.filter(function (j) { return top.indexOf(j) < 0; })[0]; if (!add) break;
      top.splice(top.length - 1, 1); top.splice(1, 0, add);
    }
    return top;
  }

  var ACG_W = {
    career: { Sun_MC: 3, Jupiter_MC: 3, Sun_ASC: 2, Venus_MC: 1.5, Saturn_MC: 1.2, Mars_MC: 1.2, Mercury_MC: 1, Neptune_MC: -2, Pluto_ASC: -1 },
    money: { Jupiter_MC: 3, Jupiter_ASC: 2.5, Venus_MC: 2.5, Sun_MC: 1.5, Venus_ASC: 1.5, Jupiter_IC: 1.5, Saturn_MC: -1, Neptune_MC: -1.5 },
    love: { Venus_DSC: 3, Venus_ASC: 2.5, Moon_DSC: 2, Jupiter_DSC: 2, Venus_IC: 1.5, Saturn_DSC: -2.5, Pluto_DSC: -2, Mars_DSC: -1.5, Uranus_DSC: -1.5 },
    life: { Jupiter_IC: 3, Moon_IC: 2.5, Venus_IC: 2.5, Jupiter_ASC: 2, Moon_ASC: 1.5, Venus_ASC: 1.5, Saturn_ASC: -2, Saturn_IC: -2, Pluto_IC: -2, Mars_ASC: -1.5, Neptune_IC: -1, Uranus_IC: -1 }
  };
  var ANGLE_TEXT = { ASC: 'на Асценденте — проявляется в вас самих', MC: 'на MC — в карьере и признании', DSC: 'на Десценденте — в отношениях и партнёрах', IC: 'на IC — в доме и чувстве корней' };
  var PLANET_PLACE = { Sun: 'уверенность и яркость', Moon: 'эмоциональный комфорт', Mercury: 'идеи и общение', Venus: 'любовь, красота и деньги', Mars: 'энергия и напор', Jupiter: 'удача и рост', Saturn: 'труд и медленный, но прочный результат', Uranus: 'перемены и неожиданности', Neptune: 'вдохновение, но и иллюзии', Pluto: 'сила и глубокие перемены' };
  function bearing(a, b) {
    var f1 = a[3] * Math.PI / 180, f2 = b[3] * Math.PI / 180, dl = (b[4] - a[4]) * Math.PI / 180;
    var y = Math.sin(dl) * Math.cos(f2), x = Math.cos(f1) * Math.sin(f2) - Math.sin(f1) * Math.cos(f2) * Math.cos(dl);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }
  function distKm(a, b) {
    var r = Math.PI / 180, d = Math.sin(a[3] * r) * Math.sin(b[3] * r) + Math.cos(a[3] * r) * Math.cos(b[3] * r) * Math.cos((b[4] - a[4]) * r);
    return 6371 * Math.acos(Math.max(-1, Math.min(1, d)));
  }
  function dirEl(home, c) {
    if (distKm(home, c) < 500) return 'earth';
    var b = bearing(home, c);
    return b >= 45 && b < 135 ? 'wood' : b >= 135 && b < 225 ? 'fire' : b >= 225 && b < 315 ? 'metal' : 'water';
  }
  function cities(chart, home) {
    var res = {}, useful = chart.bazi.useful;
    Object.keys(ACG_W).forEach(function (cat) {
      var scored = chart.acg.map(function (row) {
        var sc = 0, why = [];
        row.hits.forEach(function (h) {
          var w = ACG_W[cat][h.planet + '_' + h.angle]; if (!w) return;
          var k = w * Math.max(0, 1 - h.km / 900); sc += k;
          if (w > 0 && k > 0.4) why.push(PLANET[h.planet][0] + ' ' + ANGLE_TEXT[h.angle] + ' (' + h.km + ' км): ' + PLANET_PLACE[h.planet]);
          if (w < 0 && k < -0.3) why.push('осторожно: ' + PLANET[h.planet][0] + ' ' + ANGLE_TEXT[h.angle].split(' — ')[0] + ' — ' + PLANET_PLACE[h.planet]);
        });
        var de = dirEl(home, row.city);
        if (sc > 0.4 && useful.indexOf(de) >= 0) { sc += 0.6; why.push('направление «' + DIRECTION[de] + '» от места рождения — это ваша полезная стихия ' + EL[de]); }
        return { city: row.city, score: sc, why: why };
      });
      var good = scored.filter(function (x) { return x.score > 0.5 && x.why.length; }).sort(function (a, b) { return b.score - a.score; });
      res[cat] = good.slice(0, 3);
    });
    var careful = chart.acg.map(function (row) {
      var bad = row.hits.filter(function (h) { return ['Saturn', 'Pluto', 'Mars', 'Neptune'].indexOf(h.planet) >= 0 && (h.angle === 'ASC' || h.angle === 'IC') && h.km < 350; });
      return { city: row.city, bad: bad };
    }).filter(function (x) { return x.bad.length; }).slice(0, 4);
    res.careful = careful;
    return res;
  }

  // ---------- Колесо карты ----------
  function wheel(chart) {
    var asc = chart.angles ? chart.angles.asc : 0, R = 160, C = 180;
    function xy(lon, r) { var a = (180 + (lon - asc)) * Math.PI / 180; return [C + r * Math.cos(a), C - r * Math.sin(a)]; }
    var out = '<svg class="astro-wheel" viewBox="0 0 360 360" role="img" aria-label="Натальная карта">';
    out += '<circle cx="180" cy="180" r="160" class="w-ring"/><circle cx="180" cy="180" r="132" class="w-ring"/><circle cx="180" cy="180" r="70" class="w-ring w-inner"/>';
    for (var s = 0; s < 12; s++) {
      var a = xy(s * 30, 160), b = xy(s * 30, 132), t = xy(s * 30 + 15, 146);
      out += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" class="w-tick"/>';
      out += '<text x="' + t[0] + '" y="' + t[1] + '" class="w-sign">' + SIGNS[s].slice(0, 3) + '</text>';
    }
    if (chart.cusps) chart.cusps.forEach(function (c, i) {
      var a = xy(c, 132), b = xy(c, 70), n = xy(c + 4, 78);
      out += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" class="w-house' + (i % 3 === 0 ? ' w-angle' : '') + '"/>';
      out += '<text x="' + n[0] + '" y="' + n[1] + '" class="w-num">' + (i + 1) + '</text>';
    });
    chart.aspects.forEach(function (x) {
      var pa = chart.planets.filter(function (p) { return p.key === x.a; })[0], pb = chart.planets.filter(function (p) { return p.key === x.b; })[0];
      if (!pa || !pb || x.type === 'соединение') return;
      var a = xy(pa.lon, 68), b = xy(pb.lon, 68);
      out += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" class="w-asp ' + (HARMONY[x.type] > 0 ? 'w-good' : 'w-hard') + '"/>';
    });
    var placed = [];
    chart.planets.forEach(function (p) {
      if (p.key === 'SouthNode') return;
      var lon = p.lon;
      placed.forEach(function (q) { if (Math.abs(S.diff(lon, q)) < 7) lon = q + 7; });
      placed.push(lon);
      var g = xy(lon, 112);
      out += '<text x="' + g[0] + '" y="' + g[1] + '" class="w-planet">' + PLANET[p.key][1] + '︎</text>';
    });
    return out + '</svg>';
  }

  // ---------- Отчёт ----------
  function renderReport() {
    var f = state.form, c = CITIES[f.city], dp = f.date.split('-').map(Number), tp = (f.time || '12:00').split(':').map(Number);
    var acgCities = CITIES.filter(function (x) { return x[6]; });
    var chart = S.chart({ y: dp[0], m: dp[1], d: dp[2], h: tp[0], mi: tp[1], hasTime: !f.noTime, lat: c[3], lon: c[4], tz: c[5], gender: f.gender, cities: acgCities });
    var p = psych(), jobs = professions(p, chart), bz = chart.bazi, ved = chart.vedic, open = unlocked(), test = open ? 0 : freeTest();
    if (test) open = true;
    var P = {}; chart.planets.forEach(function (x) { P[x.key] = x; });
    var birth = chart.utc.ms, now = Date.now();
    var A1 = DIAG.ARCH[p.arch[0]], A2 = DIAG.ARCH[p.arch[1]];
    var hello = f.name ? esc(f.name) + ', ваш' : 'Ваш';
    var tzH = chart.utc.offset / 60;
    var sunS = SIGNS[P.Sun.sign], moonS = SIGNS[P.Moon.sign], ascS = chart.angles ? SIGNS[Math.floor(chart.angles.asc / 30)] : null;
    var dm = bz.dayStem, dmName = STEM_RU[dm] + ' (' + EL[bz.dmEl] + ')';
    var code3 = p.code.slice(0, 3);

    // Текущие периоды
    var md = ved.dashas.list.filter(function (d) { return d.start <= now && d.end > now; })[0];
    var ad = md ? md.subs.filter(function (d) { return d.start <= now && d.end > now; })[0] : null;
    var curLuck = bz.luck.filter(function (l, i) { var next = bz.luck[i + 1]; return l.from <= now && (!next || next.from > now); })[0];
    var bestYears = bz.years.filter(function (y) { return y.score > 0.5; }).map(function (y) { return y.year; });
    function rateWord(s) { return s > 0.5 ? 'благоприятный' : s < -0.5 ? 'требует осторожности' : 'смешанный'; }

    // --- Сводка
    var big = p.big, trait = Object.keys(big).filter(function (k) { return k !== 'N'; }).sort(function (a, b) { return big[b] - big[a]; })[0];
    var acgRes = chart.acg ? cities(chart, c) : null;
    function cityList(arr) { return arr && arr.length ? arr.map(function (x) { return cityName(x.city); }).join(', ') : '—'; }
    var summary = '<ul class="astro-summary">' +
      '<li><b>Кто вы.</b> Архетип <em>' + A1.name + '</em>, Солнце в знаке ' + sunS + (ascS ? ', Асцендент в знаке ' + ascS : '') + ', Хозяин дня в бацзы — ' + dmName + '. Самая сильная черта по тесту — ' + BIG5[trait][1] + '.</li>' +
      (p.childText ? '<li><b>Ключ из детства.</b> «' + esc(p.childText) + '» — ' + (code3.indexOf(p.childCode[0]) >= 0 ? 'это совпадает с вашим взрослым кодом и подтверждает призвание.' : 'верните это в жизнь: детская радость подсказывает, где ваша сила.') + '</li>' : '') +
      '<li><b>Дело.</b> Ваш код профориентации — ' + code3.map(function (k) { return RIASEC[k][0]; }).join(' · ') + '. Лучше всего подходит: ' + jobs.slice(0, 3).map(function (j) { return j.name.toLowerCase(); }).join('; ') + '.</li>' +
      '<li><b>Деньги.</b> Вы — ' + EL[bz.dmEl] + ', ваша стихия денег — ' + EL[bz.wealthEl] + ': ' + ACTIVITIES[bz.wealthEl].slice(0, 4).join(', ') + '. Юпитер (удача) в знаке ' + SIGNS[P.Jupiter.sign] + (P.Jupiter.house ? ', ' + P.Jupiter.house + ' дом — ' + HOUSE[P.Jupiter.house - 1] : '') + '.</li>' +
      '<li><b>Любовь.</b> Венера в знаке ' + SIGNS[P.Venus.sign] + ': вы любите ' + SIGN_STYLE[P.Venus.sign] + (chart.angles ? '. Партнёр по Десценденту — ' + SIGN_QUALITY[(Math.floor(chart.angles.asc / 30) + 6) % 12] : '') + (bz.stars.peach ? '. В карте есть Персиковый цветок — сильное обаяние' : '') + '.</li>' +
      (acgRes ? '<li><b>Где.</b> Для карьеры — ' + cityList(acgRes.career) + '; для любви — ' + cityList(acgRes.love) + '.</li>' : '') +
      '<li><b>Сейчас.</b> ' + (md ? 'Махадаша ' + pname(md.lord) + (ad ? ' / ' + pname(ad.lord) : '') + ': ' + DASHA_TEXT[md.lord] + '. ' : '') + (curLuck ? 'Такт удачи бацзы ' + rateWord(curLuck.score) + '.' : '') + (bestYears.length ? ' Лучшие годы для действий: ' + bestYears.slice(0, 5).join(', ') + '.' : '') + '</li></ul>';

    // --- Психология
    var b5 = Object.keys(BIG5).map(function (k) {
      var v = big[k], hi = v >= 11, lo = v <= 5, txt = hi ? BIG5[k][3] : lo ? BIG5[k][4] : 'Баланс: в вас есть и ' + BIG5[k][1] + ', и ' + BIG5[k][2] + ' — вы проявляете то одно, то другое по ситуации.';
      return '<li><span>' + BIG5[k][0] + '</span><b><i style="width:' + Math.round((v / 16) * 100) + '%"></i></b><p>' + txt + '</p></li>';
    }).join('');
    var psychSec = sec(1, 'Психологический портрет',
      '<div class="diag-two"><div><p class="diag-small">«Большая пятёрка»</p><ul class="astro-b5">' + b5 + '</ul></div>' +
      '<div><p class="diag-small">Архетип Юнга</p><p class="diag-big">' + A1.name + '</p><p>' + A1.essence + ' ' + A1.gift + '</p><p class="diag-note"><b>Тень:</b> ' + A1.shadow + '</p>' +
      '<p class="diag-note"><b>Второй архетип — ' + A2.name + ':</b> ' + A2.gift + '</p>' +
      '<p class="diag-small" style="margin-top:20px">Астрологическая основа характера</p>' +
      '<p>Солнце в знаке ' + sunS + ' — ' + PLANET.Sun[2] + ' проявляются ' + SIGN_STYLE[P.Sun.sign] + '. ' +
      (f.noTime && Math.floor(S.norm(P.Moon.lon - 6.5) / 30) !== Math.floor(S.norm(P.Moon.lon + 6.5) / 30) ? 'Луна в этот день переходила из знака в знак, поэтому без времени рождения её знак неточен. ' : 'Луна в знаке ' + moonS + ' — чувства живут ' + SIGN_STYLE[P.Moon.sign] + '. ') +
      (ascS ? 'Асцендент в знаке ' + ascS + ' — люди видят вас через ' + SIGN_QUALITY[Math.floor(chart.angles.asc / 30)] + '.' : '') + '</p></div></div>');

    // --- Профориентация
    var maxR = Math.max.apply(null, Object.keys(p.rs).map(function (k) { return p.rs[k]; })) || 1;
    var childTop = p.childCode[0], childMatch = code3.indexOf(childTop) >= 0;
    var childBlock = '<div class="astro-key"><p class="diag-small">Ключ из детства</p>' +
      (p.childText ? '<p class="astro-quote">«' + esc(p.childText) + '»</p>' : '') +
      (p.child[childTop] > 0 ? '<p>В детстве ярче всего проявлялся тип <b>' + RIASEC[childTop][0] + '</b>: ' + RIASEC[childTop][1] + '. ' +
        (childMatch ? 'Он совпадает с вашим взрослым кодом — значит, призвание пронесено через всю жизнь и его стоит сделать основой дела.' : 'Во взрослом коде его нет на первых местах — скорее всего, эту радость пришлось отложить. Верните её хотя бы как часть работы или хобби: там спрятана ваша сила.') + '</p>'
        : '<p>Детские увлечения не проявились ярко — опирайтесь на взрослый код профориентации.</p>') + '</div>';
    var riBars = '<ul class="diag-bars">' + p.code.map(function (k) { return '<li><span>' + RIASEC[k][0] + '</span><b><i style="width:' + Math.round(p.rs[k] / maxR * 100) + '%"></i></b></li>'; }).join('') + '</ul>';
    var jobsList = '<ol class="astro-jobs">' + jobs.map(function (j) { return '<li><b>' + j.name + '</b><span>' + j.why.join(' · ') + '</span></li>'; }).join('') + '</ol>';
    var proSec = sec(2, 'Профориентация',
      '<div class="diag-two"><div><p class="diag-big">' + code3.map(function (k) { return RIASEC[k][0]; }).join(' · ') + '</p><p>Главное: ' + RIASEC[code3[0]][1] + '; дополнительно — ' + RIASEC[code3[1]][1] + '.</p>' +
      childBlock + '<p class="diag-small">Профессии, где сходятся все методы</p>' + jobsList + '</div><div>' + riBars +
      '<p class="diag-note" style="margin-top:16px">Список собран так, чтобы не противоречить ни тесту, ни карте: в основе — ваш код профориентации, детские увлечения весят в полтора раза больше, а стихия денег по бацзы, архетип и MC поднимают выше совпадающие профессии.</p></div></div>');

    // --- Западная астрология
    var rows = chart.planets.map(function (x) {
      return '<tr><td>' + PLANET[x.key][1] + '︎ ' + PLANET[x.key][0] + '</td><td>' + pos(x.lon) + (x.retro && x.key.indexOf('Node') < 0 ? ' R' : '') + '</td><td>' + (x.house || '—') + '</td></tr>';
    }).join('') + (chart.angles ? '<tr><td>AC Асцендент</td><td>' + pos(chart.angles.asc) + '</td><td>1</td></tr><tr><td>MC Середина неба</td><td>' + pos(chart.angles.mc) + '</td><td>10</td></tr>' : '');
    var keyAsp = chart.aspects.filter(function (x) { return x.a !== 'ASC' || x.b !== 'MC'; }).slice(0, 7).map(function (x) {
      return '<li><b>' + PLANET[x.a][0] + ' — ' + x.type + ' — ' + PLANET[x.b][0] + '.</b> ' + cap(PLANET[x.a][3]) + ' и ' + PLANET[x.b][3] + ' ' + ASPECT_TEXT[x.type] + '.</li>';
    }).join('');
    function placeText(k) { var x = P[k]; return PLANET[x.key][0] + ' в знаке ' + SIGNS[x.sign] + (x.house ? ', ' + x.house + ' дом (' + HOUSE[x.house - 1] + ')' : '') + ': ' + PLANET[x.key][2] + ' проявляются ' + SIGN_STYLE[x.sign] + '.'; }
    var mcSign = chart.angles ? Math.floor(chart.angles.mc / 30) : null;
    var westSec = sec(3, 'Западная астрология',
      '<div class="diag-two"><div>' + wheel(chart) + '<p class="diag-note">Дома: ' + (chart.houseSystem || 'без времени рождения дома не строятся') + '. Узлы — истинные, Лилит — средняя.</p></div>' +
      '<div class="astro-table-wrap"><table class="astro-table"><thead><tr><th>Точка</th><th>Положение</th><th>Дом</th></tr></thead><tbody>' + rows + '</tbody></table></div></div>' +
      '<div class="diag-two" style="margin-top:28px"><div><p class="diag-small">Главные темы</p><ul class="astro-points">' +
      (mcSign !== null ? '<li><b>Призвание (MC в знаке ' + SIGNS[mcSign] + ').</b> Вершина карьеры — там, где нужны ' + SIGN_QUALITY[mcSign] + '.</li>' : '') +
      '<li><b>Любовь.</b> ' + placeText('Venus') + '</li><li><b>Удача.</b> ' + placeText('Jupiter') + '</li><li><b>Уроки.</b> ' + placeText('Saturn') + '</li>' +
      '<li><b>Кармическая задача.</b> Северный узел в знаке ' + SIGNS[P.NorthNode.sign] + (P.NorthNode.house ? ' (' + P.NorthNode.house + ' дом — ' + HOUSE[P.NorthNode.house - 1] + ')' : '') + ': развивать ' + SIGN_QUALITY[P.NorthNode.sign] + '. Южный узел в знаке ' + SIGNS[P.SouthNode.sign] + ': из прошлого вы принесли ' + SIGN_QUALITY[P.SouthNode.sign] + ' — опирайтесь на это, но не застревайте.</li>' +
      '<li><b>Лилит в знаке ' + SIGNS[P.Lilith.sign] + (P.Lilith.house ? ', ' + P.Lilith.house + ' дом' : '') + '.</b> Тень проявляется через ' + SIGN_QUALITY[P.Lilith.sign] + ' — в избытке или под запретом. Признайте это желание, и оно станет силой.</li>' +
      '</ul></div><div><p class="diag-small">Ключевые аспекты</p><ul class="astro-points">' + keyAsp + '</ul></div></div>');

    // --- Ведическая астрология
    var nak = NAK[P.Moon.nak], lagnaS = ved.lagnaSign;
    function dignity(x) {
      if (EXALT[x.key] === undefined) return '';
      if (EXALT[x.key] === x.sidSign) return 'экзальтация';
      if ((EXALT[x.key] + 6) % 12 === x.sidSign) return 'падение';
      if (OWN[x.key].indexOf(x.sidSign) >= 0) return 'свой знак';
      return '';
    }
    var vRowsUnused = chart.planets.filter(function (x) { return x.key !== 'Lilith' && ['Uranus', 'Neptune', 'Pluto'].indexOf(x.key) < 0; }).map(function (x) {
      var name = x.key === 'NorthNode' ? 'Раху' : x.key === 'SouthNode' ? 'Кету' : GRAHA[x.key];
      return '<tr><td>' + name + '</td><td>' + SIGNS[x.sidSign] + ' ' + deg(x.sidDeg) + '</td><td>' + NAK[x.nak][0] + '</td><td>' + (x.vhouse || '—') + '</td><td>' + dignity(x) + '</td></tr>';
    }).join('');
    var dashaRows = ved.dashas.list.filter(function (d) { return d.end > birth && ageAt(d.start, birth) < 95; }).map(function (d) {
      var cur = d.start <= now && d.end > now;
      return '<li' + (cur ? ' class="is-now"' : '') + '><span>' + year(d.start) + '–' + year(d.end) + '</span><b>' + pname(d.lord) + '</b><p>' + DASHA_TEXT[d.lord] + '</p></li>';
    }).join('');
    var rahu = P.NorthNode, ketu = P.SouthNode;
    var vedSec = sec(4, 'Ведическая астрология (джйотиш)',
      '<div class="astro-vedic"><div>' +
      (lagnaS !== undefined ? '<p class="diag-small">Лагна (восходящий знак)</p><p class="diag-big">' + SIGNS[lagnaS] + '</p><p>Тело и судьба строятся через ' + SIGN_QUALITY[lagnaS] + '.</p>' : '<p class="diag-note">Без времени рождения лагна и дома не определяются — ниже разбор по Луне.</p>') +
      '<p class="diag-small">Атмакарака — планета души</p><p>' + GRAHA[ved.atmakaraka] + ': ' + AK_TEXT[ved.atmakaraka] + '.</p>' +
      '<p class="diag-small">Ось Раху — Кету</p><p>Раху в знаке ' + SIGNS[rahu.sidSign] + (rahu.vhouse ? ', ' + rahu.vhouse + ' дом' : '') + ' — жажда роста через ' + (rahu.vhouse ? HOUSE[rahu.vhouse - 1] : SIGN_QUALITY[rahu.sidSign]) + '. Кету в знаке ' + SIGNS[ketu.sidSign] + (ketu.vhouse ? ', ' + ketu.vhouse + ' дом' : '') + ' — врождённое знание и отрешённость в сфере «' + (ketu.vhouse ? HOUSE[ketu.vhouse - 1] : SIGN_QUALITY[ketu.sidSign]) + '».</p>' +
      '<p class="diag-note">Сидерический зодиак, айанамша Лахири ' + deg(ved.ayanamsa) + ', дома по знакам.</p></div></div>' +
      '<p class="diag-small" style="margin-top:28px">Вимшоттари-даши — большие периоды жизни</p><ul class="astro-timeline">' + dashaRows + '</ul>');

    // --- Бацзы
    var pillarNames = ['Год', 'Месяц', 'День', 'Час'];
    var pillarsHtml = '<div class="astro-pillars">' + bz.pillars.map(function (pp, i) {
      return '<div><span>' + pillarNames[i] + '</span><b>' + STEM_CH[pp[0]] + BRANCH_CH[pp[1]] + '</b><em>' + STEM_RU[pp[0]] + ' · ' + EL[S.STEM_EL[pp[0]]] + '</em><em>' + BRANCH_RU[pp[1]] + ' · ' + EL[S.STEM_EL[S.BRANCH_MAIN[pp[1]]]] + '</em></div>';
    }).join('') + (bz.pillars.length < 4 ? '<div class="is-empty"><span>Час</span><b>？</b><em>нужно время</em></div>' : '') + '</div>';
    var godsTop = Object.keys(bz.gods).filter(function (g) { return g !== 'companion'; }).sort(function (a, b) { return bz.gods[b] - bz.gods[a]; }).slice(0, 3);
    var stars = Object.keys(STAR).filter(function (k) { return bz.stars[k]; });
    var luckRows = bz.luck.filter(function (l) { return l.age < 90; }).map(function (l, i) {
      var next = bz.luck[i + 1], cur = l.from <= now && (!next || next.from > now);
      return '<li class="r' + (l.score > 0.5 ? 'good' : l.score < -0.5 ? 'hard' : 'mid') + (cur ? ' is-now' : '') + '"><span>' + Math.round(l.age) + '–' + Math.round(l.age + 10) + ' лет · ' + year(l.from) + '</span><b>' + STEM_CH[l.stem] + BRANCH_CH[l.branch] + ' ' + EL[S.STEM_EL[l.stem]] + ' ' + BRANCH_RU[l.branch] + '</b><p>' + cap(rateWord(l.score)) + ' · ' + GOD[l.god][0] + ': ' + GOD[l.god][1] + '</p></li>';
    }).join('');
    var spouse = f.gender === 'm' ? 'звезда жены — стихия ' + EL[bz.spouseEl] : 'звезда мужа — стихия ' + EL[bz.spouseEl];
    var baziSec = sec(5, 'Китайская астрология бацзы',
      pillarsHtml +
      '<p class="diag-note">' + (bz.solarTime ? 'Расчёт по истинному солнечному времени места рождения: ' + String(bz.solarTime.getUTCHours()).padStart(2, '0') + ':' + String(bz.solarTime.getUTCMinutes()).padStart(2, '0') + '.' : 'Без времени рождения столп часа не строится.') + '</p>' +
      '<div class="diag-two" style="margin-top:24px"><div><p class="diag-small">Хозяин дня</p><p class="diag-big">' + dmName + '</p><p>' + DM_TEXT[dm] + '. Хозяин дня ' + (bz.strong ? 'сильный: вам нужно направлять энергию вовне — в результат, деньги и ответственность.' : 'мягкий: вам важны поддержка, учёба и опора на союзников.') + '</p>' +
      '<p><b>Полезные стихии:</b> ' + bz.useful.map(function (e) { return EL[e]; }).join(', ') + '. <b>Ослабляющие:</b> ' + bz.unfavorable.map(function (e) { return EL[e]; }).join(', ') + '.</p>' +
      '<p><b>Сфера наибольшего дохода.</b> Вы — ' + EL[bz.dmEl] + ', а ' + EL[bz.dmEl] + ' управляет стихией ' + EL[bz.wealthEl] + ': это и есть ваша стихия денег. Доход приносят занятия стихии ' + EL_GEN[bz.wealthEl] + ':</p><ul class="diag-list">' + ACTIVITIES[bz.wealthEl].map(function (a) { return '<li>' + a + '</li>'; }).join('') + '</ul>' +
      '<p><b>Любовь:</b> дворец супруга — ' + BRANCH_RU[bz.dayBranch] + ' (' + EL[S.STEM_EL[S.BRANCH_MAIN[bz.dayBranch]]] + '), ' + spouse + '. Отношения крепнут, когда в жизни много ' + EL_GEN[bz.useful[0]] + '.</p>' +
      '<p><b>Благоприятное направление:</b> ' + DIRECTION[bz.useful[0]] + '.</p></div>' +
      '<div><p class="diag-small">Таланты по десяти божествам</p><ul class="astro-points">' + godsTop.map(function (g) { return '<li><b>' + GOD[g][0] + '.</b> ' + cap(GOD[g][1]) + '.</li>'; }).join('') + '</ul>' +
      '<p class="diag-small">Символические звёзды</p><ul class="astro-points">' + (stars.length ? stars.map(function (k) { return '<li><b>' + STAR[k][0] + '.</b> ' + cap(STAR[k][1]) + '.</li>'; }).join('') : '<li>Ярко выраженных символических звёзд нет — судьба строится трудом и выбором.</li>') + '</ul></div></div>' +
      '<p class="diag-small" style="margin-top:28px">Такты удачи (по 10 лет)</p><ul class="astro-timeline astro-luck">' + luckRows + '</ul>' +
      '<p class="diag-small" style="margin-top:20px">Ближайшие годы</p><div class="astro-years">' + bz.years.map(function (y) { return '<span class="r' + (y.score > 0.5 ? 'good' : y.score < -0.5 ? 'hard' : 'mid') + '"><b>' + y.year + '</b>' + EL[S.STEM_EL[y.stem]] + ' ' + BRANCH_RU[y.branch] + '</span>'; }).join('') + '</div>');

    // --- Астрокартография
    var acgSec;
    if (acgRes) {
      var CAT = [['career', 'Реализация и карьера'], ['money', 'Деньги и удача'], ['love', 'Любовь и отношения'], ['life', 'Жизнь и дом']];
      acgSec = sec(6, 'Астрокартография: лучшие города', '<div class="astro-acg">' + CAT.map(function (ct) {
        var list = acgRes[ct[0]];
        return '<div><p class="diag-small">' + ct[1] + '</p>' + (list.length ? '<ol>' + list.map(function (x) { return '<li><b>' + esc(cityName(x.city)) + '</b> <span>' + (x.city[2] !== cityName(x.city) ? esc(x.city[2]) : '') + '</span><p>' + x.why.slice(0, 2).join('; ') + '.</p></li>'; }).join('') + '</ol>'
          : '<p class="diag-note">Сильных линий над крупными городами нет. Опирайтесь на направление «' + DIRECTION[bz.useful[0]] + '» от места рождения.</p>') + '</div>';
      }).join('') + '</div>' + (acgRes.careful.length ? '<p class="diag-note" style="margin-top:16px"><b>С осторожностью:</b> ' + acgRes.careful.map(function (x) { return cityName(x.city) + ' (' + PLANET[x.bad[0].planet][0] + ' ' + ANGLE_TEXT[x.bad[0].angle].split(' — ')[0] + ')'; }).join(', ') + ' — там труднее отдыхать и чувствовать себя дома.</p>' : '') +
      '<p class="diag-note">Линии планет считаются для момента рождения: где планета стоит на Асценденте, MC, Десценденте или IC, её тема звучит сильнее. Влияние ощущается в радиусе 700–900 км.</p>');
    } else {
      acgSec = sec(6, 'Астрокартография', '<p>Для линий планет нужно точное время рождения: за час они сдвигаются на тысячу километров. Пока опирайтесь на направление бацзы — <b>' + DIRECTION[bz.useful[0]] + '</b> от места рождения.</p>');
    }

    // --- Периоды жизни
    var cycles = [[12, 'возвращение Юпитера — новый цикл роста'], [18.6, 'возвращение лунных узлов — поворот судьбы'], [24, 'возвращение Юпитера'], [29.5, 'первое возвращение Сатурна — экзамен на взрослость'], [36, 'возвращение Юпитера'], [37.2, 'второе возвращение узлов'], [42, 'оппозиция Урана — кризис середины жизни и освобождение'], [48, 'возвращение Юпитера'], [50, 'возвращение Хирона — исцеление старых ран, время учить других'], [55.8, 'третье возвращение узлов'], [59, 'второе возвращение Сатурна — мудрость и итоги'], [60, 'возвращение Юпитера'], [72, 'возвращение Юпитера']];
    var periodRows = bz.luck.filter(function (l) { return l.age < 80; }).map(function (l, i) {
      var from = l.from, to = l.from + 10 * 31557600000, cur = from <= now && to > now;
      var dk = ved.dashas.list.filter(function (d) { return d.start < to && d.end > from; }).map(function (d) { return d.lord; });
      var dl = dk.map(pname);
      var cy = cycles.filter(function (x) { return x[0] >= l.age && x[0] < l.age + 10; }).map(function (x) { return Math.round(x[0]) + ' лет: ' + x[1]; });
      var tone = l.score + dk.reduce(function (s, k) { return s + (DASHA_TONE[k] || 0) * 0.4; }, 0);
      var advice = tone > 0.6 ? 'Время расширяться: начинать дело, переезжать, вкладываться в главное.' : tone < -0.4 ? 'Время укреплять основу: учиться, беречь силы, не рисковать деньгами.' : 'Время выбирать: действовать там, где поддерживают полезные стихии, и не распыляться.';
      return '<li class="r' + (tone > 0.6 ? 'good' : tone < -0.4 ? 'hard' : 'mid') + (cur ? ' is-now' : '') + '"><span>' + Math.round(l.age) + '–' + Math.round(l.age + 10) + ' лет · ' + year(from) + '–' + year(to) + (cur ? ' · сейчас' : '') + '</span><b>' + advice + '</b><p>Даши: ' + dl.join(', ') + '. ' + (cy.length ? 'Циклы: ' + cy.join('; ') + '.' : '') + '</p></li>';
    }).join('');
    var periodSec = sec(7, 'Периоды жизни', '<p class="diag-note">Каждое десятилетие сведено из тактов удачи бацзы, ведических даш и больших планетных циклов. Оценка общая: где методы расходятся, период отмечен как смешанный.</p><ul class="astro-timeline astro-periods">' + periodRows + '</ul>');

    // --- Рекомендации
    var recs = [
      'Стройте дело вокруг профессии «' + jobs[0].name.toLowerCase() + '»: в ней сходятся ' + jobs[0].why.join(', ') + '.',
      'Ищите доход в занятиях стихии ' + EL_GEN[bz.wealthEl] + ' — это ваша стихия денег: ' + ACTIVITIES[bz.wealthEl].slice(0, 3).join(', ') + '.',
      'Окружайте себя стихией ' + EL_GEN[bz.useful[0]] + ': цвета, материалы, занятия и люди этой стихии добавляют вам сил.',
      'Ваш архетип ' + A1.name + ' раскрывается, когда вы ' + A1.gift.replace(/^Вы /, '').replace(/^\S+/, function (w) { return w.toLowerCase(); }),
      'Помните о тени архетипа: ' + A1.shadow.charAt(0).toLowerCase() + A1.shadow.slice(1),
      'Кармическая задача — развивать ' + SIGN_QUALITY[P.NorthNode.sign] + '. Выбирайте решения, которые ведут в эту сторону, даже если привычнее старое.',
      big.N >= 11 ? 'Берегите ресурс: вы тонко чувствуете и быстро устаёте от лишних людей и шума.' : 'Ваша устойчивость — опора для других; не берите на себя слишком много чужого.',
      bestYears.length ? 'Главные шаги планируйте на благоприятные годы: ' + bestYears.slice(0, 4).join(', ') + '.' : 'Ближайшие годы спокойные — время учиться и готовить почву.'
    ];
    var recSec = sec(8, 'Рекомендации', '<ol class="diag-list astro-recs">' + recs.map(function (r) { return '<li>' + r + '</li>'; }).join('') + '</ol>');

    // --- Итог
    var finalSec = sec(9, 'Итог',
      '<p class="astro-final">' + (f.name ? esc(f.name) + ', вы' : 'Вы') + ' — <em>' + A1.name + '</em> с Солнцем в знаке ' + sunS + ' и Хозяином дня ' + dmName + '. ' +
      'Ваше дело — «' + jobs[0].name.toLowerCase() + '» и близкие к нему занятия; деньги приходят через стихию ' + EL_GEN[bz.wealthEl] + '; ' +
      'душа растёт, когда вы развиваете ' + SIGN_QUALITY[P.NorthNode.sign] + '.</p>' + summary +
      '<p>Все методы — тесты, западная и ведическая астрология, бацзы и астрокартография — смотрят на вас с разных сторон, но говорят об одном: ваша сила там, где совпадают детская радость, характер и стихия денег. Начните с одного шага в эту сторону уже сейчас.</p>');

    // --- Бесплатная часть: открывает главное и показывает, что ещё найдено
    function mask(t) { return String(t).split(' ').map(function (w) { return w.length > 1 ? w.charAt(0) + new Array(w.length).join('•') : w; }).join(' '); }
    var hooks = [
      'Профессия №1, где сходятся все методы: <b>' + jobs[0].name + '</b>. Ещё ' + (jobs.length - 1) + ' профессий и почему именно они — в полном разборе.',
      'Ваша стихия денег по бацзы — <b>' + EL[bz.wealthEl] + '</b>. Список из ' + ACTIVITIES[bz.wealthEl].length + ' занятий, которые приносят вам доход: <span class="astro-mask">' + mask(ACTIVITIES[bz.wealthEl][0]) + ', ' + mask(ACTIVITIES[bz.wealthEl][1]) + '…</span>',
      acgRes && acgRes.love.length ? 'Лучший город для любви: <span class="astro-mask">' + mask(cityName(acgRes.love[0].city)) + '</span>, для карьеры: <span class="astro-mask">' + mask(acgRes.career.length ? cityName(acgRes.career[0].city) : 'город') + '</span>' : 'Лучшее направление для жизни и дела по вашей карте',
      bestYears.length ? 'Лучшие годы для действий: <span class="astro-mask">' + bestYears.slice(0, 3).map(function () { return '20••'; }).join(', ') + '</span>' : 'Какие годы впереди лучше для решительных шагов',
      'Кармическая задача по лунным узлам: развивать <span class="astro-mask">' + mask(SIGN_QUALITY[P.NorthNode.sign]) + '</span>',
      md ? 'Сейчас идёт ваш большой период (махадаша) — <b>' + pname(md.lord) + '</b>, до ' + year(md.end) + ' года. Что он несёт и как его использовать' : 'Ваш текущий большой период и что он несёт',
      'Периоды жизни по десятилетиям: какие из них благоприятные, а где нужна осторожность'
    ];
    var teaser = sec('0', 'Первый взгляд — бесплатно',
      '<div class="diag-two"><div><p class="diag-small">Архетип</p><p class="diag-big">' + A1.name + '</p><p>' + A1.essence + ' ' + A1.gift + '</p>' +
      '<p class="diag-small">Хозяин дня в бацзы</p><p class="diag-mid">' + dmName + '</p><p>' + DM_TEXT[dm] + '.</p></div>' +
      '<div><p class="diag-small">Солнце</p><p class="diag-mid">' + sunS + '</p><p>Ваше ядро и воля проявляются ' + SIGN_STYLE[P.Sun.sign] + '.</p>' +
      '<p class="diag-small">Ведущий тип по профориентации</p><p class="diag-mid">' + RIASEC[code3[0]][0] + '</p><p>' + cap(RIASEC[code3[0]][1]) + '.' +
      (p.childText ? ' А в детстве вы любили: «' + esc(p.childText) + '». Как это связано с призванием — в полном разборе.' : '') + '</p></div></div>' +
      '<p class="diag-small" style="margin-top:28px">Что ещё мы нашли в вашей карте</p><ul class="astro-hooks">' + hooks.map(function (h) { return '<li>' + h + '</li>'; }).join('') + '</ul>');

    var disclaimer = '<p class="astro-disclaimer">Этот разбор даёт возможности для изучения себя и раскрытия своих потенциалов. Автор тестирования не даёт гарантий, а лишь делится инструментами, которыми пользуется сам и результаты которых увидел на себе.</p>';

    var waMsg = 'Здравствуйте! Хочу полный астрологический разбор.\nИмя: ' + (f.name || '—') + '\nДата: ' + f.date + (f.noTime ? ' (время неизвестно)' : ', ' + f.time) + '\nМесто: ' + cityName(c);
    var gate = '<div class="astro-gate"><p class="diag-small">Полный разбор — платный</p><h4>Откройте полный разбор</h4>' +
      '<ul class="astro-includes"><li><sup>/1</sup>Психологический портрет и архетипы</li><li><sup>/2</sup>Профориентация с ключом из детства и 6 профессий</li><li><sup>/3</sup>Западная карта: планеты, дома, аспекты, узлы, Лилит</li><li><sup>/4</sup>Ведическая карта и большие периоды-даши</li><li><sup>/5</sup>Бацзы: стихия денег, такты удачи, лучшие годы</li><li><sup>/6</sup>Лучшие города для карьеры, денег, любви и жизни</li><li><sup>/7</sup>Периоды жизни по десятилетиям</li><li><sup>/8</sup>Рекомендации и <sup>/9</sup>итог</li></ul>' +
      '<p>Чтобы получить код доступа, напишите шаману.</p>' +
      '<div class="diag-actions"><a class="btn btn-lime" target="_blank" rel="noopener" href="https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(waMsg) + '">Оплатить и получить код</a></div>' +
      '<form class="astro-code"><label for="as-code">Код доступа</label><div><input id="as-code" type="text" placeholder="UO-XXXX-XXXX" autocomplete="off"><button class="btn btn-ghost" type="submit">Открыть</button></div><p class="diag-error" hidden>Код не подошёл. Проверьте написание или напишите шаману.</p></form></div>';

    scrollTop();
    swap(
      (test ? '<p class="astro-test">Тестовый доступ: разбор ' + test + ' из ' + FREE_TESTS + ' открыт без кода</p>' : '') +
      '<p class="diag-kicker">Астрологический разбор · авторский метод</p>' +
      '<h3 class="diag-formula">' + hello + ' разбор: <em>' + A1.name + '</em>, ' + sunS + ', Хозяин дня ' + STEM_RU[dm] + '</h3>' +
      '<p class="diag-note">' + dp[2] + '.' + String(dp[1]).padStart(2, '0') + '.' + dp[0] + (f.noTime ? ', время неизвестно' : ', ' + f.time) + ' · ' + esc(cityName(c)) + ' (' + c[3].toFixed(2) + '°, ' + c[4].toFixed(2) + '°) · UTC' + (tzH >= 0 ? '+' : '') + tzH + '</p>' +
      (open ? psychSec + proSec + westSec + vedSec + baziSec + acgSec + periodSec + recSec + finalSec : teaser + gate) +
      disclaimer +
      '<div class="diag-actions"><a class="btn btn-ghost" target="_blank" rel="noopener" href="https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('Здравствуйте! Я получил(а) астрологический разбор на сайте и хочу обсудить его лично.') + '">Обсудить с шаманом</a>' +
      '<button class="btn btn-ghost" type="button" data-act="restart">Новый разбор</button></div>',
      function (card) {
        card.querySelector('[data-act="restart"]').addEventListener('click', function () { state = { form: state.form, answers: [], step: 0 }; save(); renderForm(); });
        var codeForm = card.querySelector('.astro-code');
        if (codeForm) codeForm.addEventListener('submit', function (e) {
          e.preventDefault();
          var v = card.querySelector('#as-code').value.trim().toUpperCase(), err = codeForm.querySelector('.diag-error');
          sha(v).then(function (h) {
            if (CODE_HASHES.indexOf(h.slice(0, 24)) >= 0) { openReport(); renderReport(); }
            else err.hidden = false;
          });
        });
      }
    );
  }
  function sec(n, title, body) { return '<section class="diag-sec"><h4><sup>/' + n + '</sup>' + title + '</h4>' + body + '</section>'; }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function sha(text) {
    return crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
    });
  }

  load();
  if (state.form && state.step >= TOTAL) renderReport(); else renderForm();
})();
