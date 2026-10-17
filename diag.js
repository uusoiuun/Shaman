// Диагностика предназначения: 5 блоков по 20 вопросов + расчёт по дате рождения
// (нумерология, знак зодиака, китайский знак года и бацзы — стихия дня рождения).
(function () {
  var root = document.getElementById('diag');
  if (!root) return;
  var WHATSAPP = '79148286969';
  var STORE = 'sakha-diag-v1';

  // Шкала для утверждений
  var SCALE = [['Точно да', 4], ['Скорее да', 3], ['Не знаю', 2], ['Скорее нет', 1], ['Нет', 0]];

  // ---------- Справочники ----------
  var INTERESTS = {
    people: { name: 'Люди', text: 'Вас наполняет работа с людьми: помогать, объяснять, вести за собой.', jobs: ['психолог, консультант, коуч', 'преподаватель, наставник', 'ведущий групп, практик, проводник ретритов', 'специалист по работе с людьми (HR, сопровождение)'] },
    art: { name: 'Творчество', text: 'Ваша сила в образах, красоте и новых идеях.', jobs: ['художник, дизайнер, фотограф', 'мастер одежды, украшений, этнических вещей', 'музыкант, автор, сценарист', 'оформитель пространств и праздников'] },
    mind: { name: 'Знания', text: 'Вам интересно докапываться до сути, изучать и систематизировать.', jobs: ['исследователь, аналитик', 'автор книг, статей и курсов', 'знаток традиций, истории, культуры', 'астролог, нумеролог, консультант по системам'] },
    deal: { name: 'Дело', text: 'Вы видите цель, умеете организовать людей и превратить идею в результат.', jobs: ['собственный бизнес', 'продюсер, организатор событий и туров', 'руководитель проектов', 'продажи и переговоры'] },
    hands: { name: 'Руки и природа', text: 'Вам важно чувствовать материал, тело, землю — и видеть результат своего труда.', jobs: ['мастер ремёсел', 'травник, специалист по природным практикам', 'массажист, инструктор, тренер', 'гид по природе, хозяйство на земле'] }
  };
  var MONEY = {
    expert: { name: 'Эксперт и наставник', text: 'Вы зарабатываете знаниями: консультации, обучение, сопровождение.', steps: ['Опишите одну тему, в которой вы сильнее большинства', 'Проведите 3–5 бесплатных консультаций и соберите отзывы', 'Сделайте платный формат: личная встреча, курс или группа'] },
    maker: { name: 'Мастер-создатель', text: 'Вы зарабатываете тем, что делаете руками: вещи, изделия, услуги мастера.', steps: ['Выберите одно изделие или услугу, которые получаются лучше всего', 'Сфотографируйте работы и покажите их людям', 'Назначьте честную цену и принимайте заказы'] },
    founder: { name: 'Предприниматель', text: 'Вы зарабатываете, собирая людей и ресурсы вокруг идеи.', steps: ['Найдите, за что люди уже готовы платить', 'Соберите небольшую команду или партнёров', 'Запустите пробную версию и считайте деньги с первого дня'] },
    media: { name: 'Творец и голос', text: 'Вы зарабатываете вниманием людей: контент, выступления, авторские проекты.', steps: ['Выберите площадку и тему, о которой готовы говорить годами', 'Публикуйтесь регулярно хотя бы три месяца', 'Предложите аудитории продукт: курс, встречу, изделие'] },
    pillar: { name: 'Специалист-опора', text: 'Вам подходит стабильный доход в сильной команде, где ценят надёжность.', steps: ['Определите профессию, где ваши таланты нужнее всего', 'Вложитесь в обучение и подтвердите уровень', 'Растите внутри команды и берите больше ответственности'] }
  };
  var ARCH = [
    { name: 'Невинный', essence: 'Вера в добро, чистота и простота.', gift: 'Вы возвращаете людям надежду и чувство безопасности.', shadow: 'Наивность и бегство от трудностей.', money: 'Детские и семейные проекты, натуральные продукты, практики спокойствия.' },
    { name: 'Мудрец', essence: 'Поиск истины и понимания.', gift: 'Вы объясняете сложное и помогаете людям увидеть суть.', shadow: 'Уход в теорию без действия.', money: 'Обучение, консультации, авторские курсы, книги.' },
    { name: 'Искатель', essence: 'Свобода, путь и открытие нового.', gift: 'Вы вдохновляете людей выйти за привычные границы.', shadow: 'Неумение остановиться и укорениться.', money: 'Путешествия, туры, ретриты, проекты о пути и поиске себя.' },
    { name: 'Бунтарь', essence: 'Перемены и смелость ломать отжившее.', gift: 'Вы освобождаете людей от чужих правил.', shadow: 'Разрушение без созидания.', money: 'Новые подходы, смелые проекты, работа с теми, кто хочет перемен.' },
    { name: 'Маг', essence: 'Преображение и сила намерения.', gift: 'Вы помогаете людям менять жизнь и видеть чудо в обычном.', shadow: 'Манипуляция и игра силой.', money: 'Практики трансформации, обряды, глубинная работа с людьми.' },
    { name: 'Герой', essence: 'Преодоление, сила и победа.', gift: 'Вы показываете, что трудности можно пройти.', shadow: 'Жизнь в вечной борьбе и выгорание.', money: 'Спорт, тренерство, проекты, где нужна смелость и результат.' },
    { name: 'Любящий', essence: 'Красота, чувства и близость.', gift: 'Вы наполняете жизнь людей теплом и красотой.', shadow: 'Растворение в других, зависимость от одобрения.', money: 'Красота, эстетика, телесные практики, работа с парами и отношениями.' },
    { name: 'Шут', essence: 'Радость, игра и лёгкость.', gift: 'Вы снимаете напряжение и учите не бояться жизни.', shadow: 'Несерьёзность там, где нужна ответственность.', money: 'Праздники, ведение событий, игровые форматы, творческие шоу.' },
    { name: 'Свой человек', essence: 'Простота, принадлежность и честность.', gift: 'Рядом с вами люди чувствуют себя своими.', shadow: 'Страх выделиться и потеряться в толпе.', money: 'Сообщества, клубы, народные и семейные проекты.' },
    { name: 'Заботливый', essence: 'Помощь, забота и защита.', gift: 'Вы лечите, кормите, поддерживаете и бережёте.', shadow: 'Самопожертвование и забота о себе в последнюю очередь.', money: 'Помогающие профессии, восстановление, забота о здоровье и доме.' },
    { name: 'Правитель', essence: 'Порядок, ответственность и власть.', gift: 'Вы создаёте устойчивые системы и ведёте людей.', shadow: 'Жёсткий контроль и страх потерять власть.', money: 'Руководство, собственное дело, управление проектами и людьми.' },
    { name: 'Творец', essence: 'Создание нового и воплощение замысла.', gift: 'Вы приносите в мир то, чего раньше не было.', shadow: 'Перфекционизм и незавершённые замыслы.', money: 'Авторские изделия, дизайн, искусство, создание собственного продукта.' }
  ];
  var AXES = [
    { a: 'Внешняя энергия', b: 'Внутренняя энергия', ta: 'Вы заряжаетесь от людей и действия. Вам подходят живые встречи, группы, публичность.', tb: 'Вы заряжаетесь в тишине и уединении. Вам подходит глубокая работа один на один и время на восстановление.' },
    { a: 'Факты и опыт', b: 'Смыслы и предчувствия', ta: 'Вы опираетесь на опыт и детали. Ваша сила — практичность и точность.', tb: 'Вы видите связи, знаки и возможности. Ваша сила — интуиция и видение будущего.' },
    { a: 'Логика', b: 'Сердце', ta: 'Вы решаете головой и цените честность. Вам доверяют сложные решения.', tb: 'Вы решаете сердцем и тонко чувствуете людей. Вам доверяют самое сокровенное.' },
    { a: 'План', b: 'Поток', ta: 'Вам нужна ясность и порядок: планы, сроки, завершённые дела.', tb: 'Вам нужна свобода: вы лучше работаете по вдохновению и легко подстраиваетесь.' }
  ];
  var ELEMENTS = {
    wood: { name: 'Дерево', text: 'Рост, развитие и устремлённость вперёд. Вы начинаете новое и растёте сами.' },
    fire: { name: 'Огонь', text: 'Яркость, вдохновение и тепло. Вы зажигаете людей и ведёте за собой.' },
    earth: { name: 'Земля', text: 'Опора, забота и надёжность. На вас держатся семья и дело.' },
    metal: { name: 'Металл', text: 'Точность, порядок и справедливость. Вы доводите дело до совершенства.' },
    water: { name: 'Вода', text: 'Мудрость, интуиция и глубина. Вы видите то, что скрыто от других.' }
  };
  var ELEMENT_ORDER = ['wood', 'fire', 'earth', 'metal', 'water'];

  // Нумерология: число жизненного пути
  var NUM = {
    1: 'Лидер и первопроходец. Ваш путь — самостоятельность и начинание нового.',
    2: 'Дипломат и партнёр. Ваш путь — сотрудничество, чуткость и соединение людей.',
    3: 'Творец и вдохновитель. Ваш путь — самовыражение, слово и радость.',
    4: 'Строитель. Ваш путь — надёжность, труд и создание прочной основы.',
    5: 'Искатель свободы. Ваш путь — перемены, движение и новый опыт.',
    6: 'Хранитель. Ваш путь — забота, семья, ответственность за близких.',
    7: 'Мудрец и мистик. Ваш путь — познание, глубина и духовный поиск.',
    8: 'Управляющий силой. Ваш путь — дело, деньги и влияние.',
    9: 'Служитель. Ваш путь — помощь людям, мудрость и завершение циклов.',
    11: 'Мастер-число 11: проводник. Ваш путь — интуиция, вдохновение и духовное учительство.',
    22: 'Мастер-число 22: великий строитель. Ваш путь — воплощать большие замыслы для многих людей.',
    33: 'Мастер-число 33: учитель-целитель. Ваш путь — любовь, служение и исцеление.'
  };
  // Западный зодиак: [месяц, последний день знака, название, стихия]
  var ZODIAC = [
    [1, 19, 'Козерог', 'Земля'], [2, 18, 'Водолей', 'Воздух'], [3, 20, 'Рыбы', 'Вода'], [4, 19, 'Овен', 'Огонь'],
    [5, 20, 'Телец', 'Земля'], [6, 20, 'Близнецы', 'Воздух'], [7, 22, 'Рак', 'Вода'], [8, 22, 'Лев', 'Огонь'],
    [9, 22, 'Дева', 'Земля'], [10, 22, 'Весы', 'Воздух'], [11, 21, 'Скорпион', 'Вода'], [12, 21, 'Стрелец', 'Огонь']
  ];
  var ZODIAC_NEXT = ['Водолей', 'Рыбы', 'Овен', 'Телец', 'Близнецы', 'Рак', 'Лев', 'Дева', 'Весы', 'Скорпион', 'Стрелец', 'Козерог'];
  var ZODIAC_ELEMENT = { 'Овен': 'Огонь', 'Лев': 'Огонь', 'Стрелец': 'Огонь', 'Телец': 'Земля', 'Дева': 'Земля', 'Козерог': 'Земля', 'Близнецы': 'Воздух', 'Весы': 'Воздух', 'Водолей': 'Воздух', 'Рак': 'Вода', 'Скорпион': 'Вода', 'Рыбы': 'Вода' };
  var ZODIAC_TEXT = { 'Огонь': 'знак огня: энергия, смелость, жажда действия', 'Земля': 'знак земли: практичность, терпение, умение создавать ощутимое', 'Воздух': 'знак воздуха: общение, идеи, лёгкость мысли', 'Вода': 'знак воды: чувства, интуиция, глубина' };
  // Бацзы: небесные стволы и земные ветви
  var STEMS = [
    ['Цзя', 'wood', 'ян', 'Могучее дерево — прямота, рост, покровительство'], ['И', 'wood', 'инь', 'Гибкая трава — приспособляемость, дипломатия, упорство'],
    ['Бин', 'fire', 'ян', 'Солнце — щедрость, открытость, свет для других'], ['Дин', 'fire', 'инь', 'Пламя свечи — тонкость, тепло, внутренний свет'],
    ['У', 'earth', 'ян', 'Гора — надёжность, сила, устойчивость'], ['Цзи', 'earth', 'инь', 'Плодородная почва — забота, питание, терпение'],
    ['Гэн', 'metal', 'ян', 'Меч — решительность, справедливость, прямота'], ['Синь', 'metal', 'инь', 'Драгоценность — изящество, ценность, тонкий вкус'],
    ['Жэнь', 'water', 'ян', 'Река и океан — размах, мудрость, свобода'], ['Гуй', 'water', 'инь', 'Роса и дождь — интуиция, мягкость, проникновенность']
  ];
  var ANIMALS = ['Крыса', 'Бык', 'Тигр', 'Кролик', 'Дракон', 'Змея', 'Лошадь', 'Коза', 'Обезьяна', 'Петух', 'Собака', 'Свинья'];

  // ---------- Вопросы ----------
  function likert(cat, text) { return { type: 'scale', cat: cat, text: text }; }
  function pole(axis, dir, text) { return { type: 'scale', axis: axis, dir: dir, text: text }; }
  function choice(text, opts) { return { type: 'choice', text: text, opts: opts }; }

  var BLOCKS = [
    {
      title: 'Интересы', lead: 'Что вам нравится делать', score: 'interest',
      qs: [
        likert('people', 'Мне нравится помогать людям разбираться в их жизни'),
        likert('art', 'Я люблю рисовать, петь, писать или создавать красоту'),
        likert('mind', 'Я люблю докапываться до сути вещей'),
        likert('deal', 'Мне нравится организовывать людей и процессы'),
        likert('hands', 'Мне нравится работать руками и видеть результат'),
        likert('people', 'Я легко нахожу общий язык с незнакомыми людьми'),
        likert('art', 'У меня часто появляются необычные идеи'),
        likert('mind', 'Я читаю книги и статьи для удовольствия'),
        likert('deal', 'Я замечаю, на чём можно заработать'),
        likert('hands', 'Лучше всего я отдыхаю на природе'),
        likert('people', 'Мне интересно, почему люди поступают так, а не иначе'),
        likert('art', 'Мне важно, чтобы вокруг было красиво'),
        likert('mind', 'Мне интересны история, философия и древние знания'),
        likert('deal', 'Я люблю ставить цели и добиваться их'),
        likert('hands', 'Мне интересны травы, животные, земля'),
        likert('people', 'Я с удовольствием учу и объясняю'),
        likert('art', 'Я теряю счёт времени, когда творю'),
        likert('mind', 'Я люблю анализировать и раскладывать всё по полочкам'),
        likert('deal', 'Мне нравится вести переговоры и продавать'),
        likert('hands', 'Я люблю движение, спорт, работу с телом')
      ]
    },
    {
      title: 'Архетипы личности', lead: 'Выберите вариант, который ближе всего', score: 'arch',
      qs: [
        choice('Что для вас самое ценное в жизни?', [[0, 'Чистое сердце и вера в лучшее'], [4, 'Способность менять реальность'], [8, 'Близкие, рядом с которыми можно быть собой']]),
        choice('Как вы чаще помогаете другим?', [[1, 'Объясняю и даю мудрый совет'], [5, 'Беру трудное на себя и решаю'], [9, 'Поддерживаю, забочусь, выслушиваю']]),
        choice('Идеальный отдых для вас —', [[2, 'Новое место, куда мало кто добирался'], [6, 'Красивое место рядом с любимым человеком'], [10, 'Хорошо продуманная поездка, где всё под контролем']]),
        choice('Как вы относитесь к скучным правилам?', [[3, 'Нарушаю, если они бессмысленны'], [7, 'Шучу и превращаю всё в игру'], [11, 'Придумываю свой, лучший способ']]),
        choice('Что вас больше всего вдохновляет?', [[0, 'Добрые поступки и простые радости'], [1, 'Глубокие книги и мудрые люди'], [2, 'Дорога и неизведанное']]),
        choice('Ваша сила в трудный момент —', [[3, 'Смело ломаю то, что не работает'], [4, 'Вижу скрытый смысл и шанс на перемену'], [5, 'Собираюсь и иду до победы']]),
        choice('Каким вас чаще видят друзья?', [[6, 'Тёплым, чувственным, страстным'], [7, 'Весёлым и лёгким, душой компании'], [8, 'Надёжным, простым, своим']]),
        choice('В команде вы чаще всего —', [[9, 'Тот, кто следит, чтобы всем было хорошо'], [10, 'Тот, кто руководит и распределяет'], [11, 'Тот, кто придумывает идеи']]),
        choice('Чего вы боитесь больше всего?', [[0, 'Сделать что-то плохое'], [5, 'Оказаться слабым'], [10, 'Хаоса и потери контроля']]),
        choice('Какой подарок вас обрадует?', [[1, 'Редкая книга или обучение у мастера'], [6, 'Красивая вещь, которая радует чувства'], [11, 'Инструменты и материалы для творчества']]),
        choice('Как вы относитесь к традициям?', [[2, 'Уважаю, но ищу свой путь'], [3, 'Многое пора менять'], [8, 'Они объединяют людей, я их храню']]),
        choice('Что вы чаще всего делаете для близких?', [[4, 'Помогаю увидеть ситуацию по-новому'], [7, 'Поднимаю настроение'], [9, 'Забочусь о здоровье, еде, уюте']]),
        choice('Какое слово вам ближе?', [[0, 'Вера'], [6, 'Любовь'], [9, 'Забота']]),
        choice('Какое слово вам ближе?', [[1, 'Истина'], [3, 'Перемены'], [10, 'Порядок']]),
        choice('Какое слово вам ближе?', [[2, 'Путь'], [4, 'Чудо'], [11, 'Создание']]),
        choice('Какое слово вам ближе?', [[5, 'Победа'], [7, 'Радость'], [8, 'Дружба']]),
        choice('Как вы проведёте свободный день?', [[0, 'Спокойно, на природе, без суеты'], [7, 'С друзьями, смехом и сюрпризами'], [11, 'За творческим делом, которое давно хотелось начать']]),
        choice('Чему вам хочется научить других?', [[1, 'Понимать мир и себя'], [4, 'Видеть знаки и менять свою судьбу'], [10, 'Брать ответственность за свою жизнь']]),
        choice('Какой фильм вы выберете?', [[2, 'О путешествии и открытиях'], [5, 'О подвиге и борьбе'], [8, 'О дружбе и простых людях']]),
        choice('Что вас задевает сильнее всего?', [[3, 'Несправедливость и лицемерие'], [6, 'Холодность и равнодушие'], [9, 'Когда человеку плохо, а никто не помогает']])
      ]
    },
    {
      title: 'Психологический портрет', lead: 'Насколько это про вас', score: 'axes',
      qs: [
        pole(0, 1, 'После общения с людьми я чувствую прилив сил'),
        pole(1, 1, 'Я доверяю опыту и фактам больше, чем предчувствиям'),
        pole(2, 1, 'Принимая решение, я опираюсь на логику'),
        pole(3, 1, 'Я люблю планировать заранее'),
        pole(0, -1, 'Чтобы восстановиться, мне нужны тишина и уединение'),
        pole(1, -1, 'Меня больше интересуют будущее и возможности, чем то, что есть сейчас'),
        pole(2, -1, 'Мне важно, что почувствуют другие после моего решения'),
        pole(3, -1, 'Я легко меняю планы по ходу дела'),
        pole(0, 1, 'Мне легче думать вслух, разговаривая с кем-то'),
        pole(1, 1, 'Я замечаю детали, которые другие пропускают'),
        pole(2, 1, 'Я могу сказать правду, даже если она неприятна'),
        pole(3, 1, 'Незавершённые дела меня беспокоят'),
        pole(0, -1, 'Я сначала долго обдумываю, а потом говорю'),
        pole(1, -1, 'Я часто вижу знаки и связи между событиями'),
        pole(2, -1, 'Я легко сопереживаю и чувствую чужую боль'),
        pole(3, -1, 'Я лучше работаю по вдохновению, чем по расписанию'),
        pole(0, 1, 'Я быстро знакомлюсь и легко начинаю разговор'),
        pole(1, 1, 'Мне спокойнее, когда есть чёткие инструкции'),
        pole(2, 1, 'В споре для меня истина важнее, чем мир'),
        pole(3, 1, 'У меня есть свой распорядок дня, и я его держу')
      ]
    },
    {
      title: 'Деньги и дело', lead: 'Как вам естественно зарабатывать', score: 'money',
      qs: [
        likert('expert', 'Ко мне часто обращаются за советом'),
        likert('maker', 'Мне нравится делать вещи, которые можно потрогать'),
        likert('founder', 'Я готов(а) рисковать ради большего дохода'),
        likert('media', 'Мне нравится делиться жизнью и мыслями с другими'),
        likert('pillar', 'Мне спокойнее со стабильной зарплатой'),
        likert('expert', 'Я готов(а) учить других тому, что умею сам(а)'),
        likert('maker', 'Люди хвалят то, что я делаю своими руками'),
        likert('founder', 'Я вижу, как превратить идею в дело'),
        likert('media', 'Я умею красиво рассказывать истории'),
        likert('pillar', 'Я хорошо справляюсь, когда задача понятна'),
        likert('expert', 'Мне нравится выступать и объяснять'),
        likert('maker', 'Я готов(а) годами оттачивать мастерство'),
        likert('founder', 'Мне нравится управлять деньгами и людьми'),
        likert('media', 'Меня вдохновляет внимание людей'),
        likert('pillar', 'Мне важно быть частью большой команды'),
        likert('expert', 'Я могу часами говорить о любимой теме'),
        likert('maker', 'Мне приятно, когда покупают сделанное мной'),
        likert('founder', 'Я не боюсь продавать'),
        likert('media', 'Я легко снимаю, пишу или фотографирую'),
        likert('pillar', 'Я ценю надёжность больше, чем риск')
      ]
    },
    {
      title: 'Стихии', lead: 'Насколько это про вас', score: 'element',
      qs: [
        likert('wood', 'Мне нравится начинать новое и расти'),
        likert('fire', 'Я легко зажигаю людей своими идеями'),
        likert('earth', 'Ко мне идут за поддержкой'),
        likert('metal', 'Я ценю порядок, точность и чёткие правила'),
        likert('water', 'Я доверяю интуиции больше, чем логике'),
        likert('wood', 'Я легко строю планы на годы вперёд'),
        likert('fire', 'Мне важно быть на виду'),
        likert('earth', 'Мне важны дом, уют и стабильность'),
        likert('metal', 'Я легко отказываюсь от лишнего'),
        likert('water', 'Мне нужно время наедине с собой'),
        likert('wood', 'Меня тяготит, когда ничего не меняется'),
        likert('fire', 'Я быстро загораюсь и живу эмоциями'),
        likert('earth', 'Я терпелив(а) и надёжен(а)'),
        likert('metal', 'Справедливость для меня важнее чувств'),
        likert('water', 'Я вижу скрытые мотивы людей'),
        likert('wood', 'Я постоянно учусь чему-то новому'),
        likert('fire', 'Я люблю праздники, сцену, выступления'),
        likert('earth', 'Я люблю кормить и заботиться'),
        likert('metal', 'Я довожу дела до конца'),
        likert('water', 'Мне снятся яркие или вещие сны')
      ]
    }
  ];
  // Архетипы и их вопросы используются и в платном астрологическом разборе
  window.SAKHA_DIAG = { ARCH: ARCH, ARCH_QS: BLOCKS[1].qs };
  var TOTAL = BLOCKS.reduce(function (n, b) { return n + b.qs.length; }, 0);
  var FLAT = [];
  BLOCKS.forEach(function (b, bi) { b.qs.forEach(function (q, qi) { FLAT.push({ b: bi, q: q, n: qi }); }); });

  // ---------- Состояние ----------
  var state = { name: '', dob: '', answers: [], step: 0 };
  function save() { try { localStorage.setItem(STORE, JSON.stringify(state)); } catch (e) {} }
  function load() {
    try { var s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (s && s.answers) state = s; } catch (e) {}
  }
  function reset() { state = { name: '', dob: '', answers: [], step: 0 }; try { localStorage.removeItem(STORE); } catch (e) {} }

  // ---------- Расчёты ----------
  function score() {
    var r = { interest: {}, money: {}, element: {}, arch: ARCH.map(function () { return 0; }), axes: [0, 0, 0, 0] };
    FLAT.forEach(function (item, i) {
      var a = state.answers[i]; if (a === undefined || a === null) return;
      var q = item.q, kind = BLOCKS[item.b].score;
      if (q.type === 'choice') { r.arch[a] += 1; return; }
      if (kind === 'axes') { r.axes[q.axis] += (a - 2) * q.dir; return; }
      r[kind][q.cat] = (r[kind][q.cat] || 0) + a;
    });
    return r;
  }
  function ranked(obj) { return Object.keys(obj).sort(function (a, b) { return obj[b] - obj[a]; }); }

  function lifePath(d) {
    var digits = d.replace(/\D/g, '').split('').map(Number);
    var n = digits.reduce(function (s, x) { return s + x; }, 0);
    while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
      n = String(n).split('').reduce(function (s, x) { return s + Number(x); }, 0);
    }
    return n;
  }
  function zodiac(m, day) {
    var z = ZODIAC[m - 1];
    var name = day <= z[1] ? z[2] : ZODIAC_NEXT[m - 1];
    return { name: name, element: ZODIAC_ELEMENT[name] };
  }
  function jdn(y, m, d) {
    var a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mm = m + 12 * a - 3;
    return d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045;
  }
  function bazi(y, m, d) {
    var dayStem = (jdn(y, m, d) + 9) % 10;
    // Китайский год начинается с Личунь — около 4 февраля
    var cy = (m < 2 || (m === 2 && d < 4)) ? y - 1 : y;
    var yStem = ((cy - 4) % 10 + 10) % 10, yBranch = ((cy - 4) % 12 + 12) % 12;
    return {
      day: STEMS[dayStem],
      animal: ANIMALS[yBranch],
      yearElement: ELEMENTS[STEMS[yStem][1]].name,
      nearLichun: m === 2 && d >= 3 && d <= 5
    };
  }
  function relation(a, b) {
    if (a === b) return 'same';
    var ia = ELEMENT_ORDER.indexOf(a), ib = ELEMENT_ORDER.indexOf(b);
    if ((ia + 1) % 5 === ib || (ib + 1) % 5 === ia) return 'support';
    return 'tension';
  }

  // ---------- Отрисовка ----------
  var stage = root.querySelector('.diag-stage');
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function swap(html, after) {
    var old = stage.firstElementChild;
    function show() {
      stage.innerHTML = '<div class="diag-card">' + html + '</div>';
      if (after) after(stage.firstElementChild);
      var f = stage.querySelector('[data-focus]') || stage.querySelector('button, input');
      if (f) f.focus({ preventScroll: true });
    }
    if (!old) return show();
    old.classList.add('leaving');
    setTimeout(show, 200);
  }
  function scrollTop() {
    var y = root.getBoundingClientRect().top + window.pageYOffset - 80;
    if (window.pageYOffset > y) window.scrollTo(0, y);
  }

  function renderIntro() {
    var has = state.answers.length > 0 && state.step < TOTAL;
    var blocks = BLOCKS.map(function (b, i) { return '<li><sup>/' + (i + 1) + '</sup>' + esc(b.title) + '</li>'; }).join('');
    swap(
      '<ol class="diag-blocks">' + blocks + '</ol>' +
      '<form class="diag-form" novalidate>' +
      '<label for="diag-name">Ваше имя</label><input id="diag-name" type="text" autocomplete="given-name" value="' + esc(state.name) + '">' +
      '<label for="diag-dob">Дата рождения</label><input id="diag-dob" type="date" required min="1920-01-01" max="2015-12-31" value="' + esc(state.dob) + '">' +
      '<p class="diag-error" hidden>Укажите дату рождения: по ней считаются нумерология, зодиак и бацзы.</p>' +
      '<div class="diag-actions">' +
      (has ? '<button class="btn btn-lime" type="button" data-act="continue">Продолжить с вопроса ' + (state.step + 1) + '</button><button class="btn btn-ghost" type="submit">Начать заново</button>'
           : '<button class="btn btn-lime" type="submit">Начать диагностику</button>') +
      '</div></form>',
      function (card) {
        var form = card.querySelector('form'), err = card.querySelector('.diag-error');
        function take() {
          var dob = card.querySelector('#diag-dob').value;
          if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) { err.hidden = false; return false; }
          state.name = card.querySelector('#diag-name').value.trim();
          state.dob = dob; return true;
        }
        form.addEventListener('submit', function (e) {
          e.preventDefault(); if (!take()) return;
          state.answers = []; state.step = 0; save(); renderBlockStart();
        });
        var cont = card.querySelector('[data-act="continue"]');
        if (cont) cont.addEventListener('click', function () { if (!take()) return; save(); renderQuestion(); });
      }
    );
  }

  function progress() {
    return '<div class="diag-progress" aria-hidden="true">' + BLOCKS.map(function (b, bi) {
      var start = bi * 20, done = Math.max(0, Math.min(20, state.step - start));
      return '<span><i style="width:' + (done / 20 * 100) + '%"></i></span>';
    }).join('') + '</div>';
  }

  function renderBlockStart() {
    var bi = FLAT[state.step].b, b = BLOCKS[bi];
    scrollTop();
    swap(progress() +
      '<p class="diag-kicker">Блок ' + (bi + 1) + ' из 5 · 20 вопросов</p>' +
      '<h3 class="diag-block-title">' + esc(b.title) + '</h3>' +
      '<p class="diag-lead">' + esc(b.lead) + '</p>' +
      '<div class="diag-actions"><button class="btn btn-lime" type="button" data-focus>Начать блок</button></div>',
      function (card) { card.querySelector('button').addEventListener('click', renderQuestion); }
    );
  }

  function renderQuestion() {
    if (state.step >= TOTAL) return renderResult();
    var item = FLAT[state.step], q = item.q, b = BLOCKS[item.b];
    var opts = q.type === 'choice' ? q.opts.map(function (o) { return [o[1], o[0]]; }) : SCALE;
    var current = state.answers[state.step];
    swap(progress() +
      '<p class="diag-kicker"><span>/' + (item.b + 1) + ' ' + esc(b.title) + '</span><span>Вопрос ' + (state.step + 1) + ' из ' + TOTAL + '</span></p>' +
      '<h3 class="diag-q">' + esc(q.text) + '</h3>' +
      '<div class="diag-answers' + (q.type === 'scale' ? ' is-scale' : '') + '">' +
      opts.map(function (o, i) {
        return '<button type="button" class="diag-answer' + (current === o[1] ? ' is-picked' : '') + '" data-v="' + o[1] + '">' + esc(o[0]) + '</button>';
      }).join('') + '</div>' +
      (state.step > 0 ? '<button type="button" class="diag-back">← Назад</button>' : ''),
      function (card) {
        card.querySelectorAll('.diag-answer').forEach(function (btn) {
          btn.addEventListener('click', function () {
            state.answers[state.step] = Number(btn.getAttribute('data-v'));
            state.step++; save();
            if (state.step >= TOTAL) return renderResult();
            if (FLAT[state.step].b !== item.b) return renderBlockStart();
            renderQuestion();
          });
        });
        var back = card.querySelector('.diag-back');
        if (back) back.addEventListener('click', function () { state.step--; save(); renderQuestion(); });
      }
    );
  }

  function bars(obj, dict, max) {
    return '<ul class="diag-bars">' + ranked(obj).map(function (k) {
      return '<li><span>' + esc(dict[k].name) + '</span><b><i style="width:' + Math.round(obj[k] / max * 100) + '%"></i></b></li>';
    }).join('') + '</ul>';
  }

  function renderResult() {
    var r = score();
    var p = state.dob.split('-').map(Number);
    var num = lifePath(state.dob), z = zodiac(p[1], p[2]), bz = bazi(p[0], p[1], p[2]);
    var topI = ranked(r.interest), topM = ranked(r.money), topE = ranked(r.element);
    var archIdx = r.arch.map(function (v, i) { return i; }).sort(function (a, b) { return r.arch[b] - r.arch[a]; });
    var a1 = ARCH[archIdx[0]], a2 = ARCH[archIdx[1]];
    var I = INTERESTS[topI[0]], I2 = INTERESTS[topI[1]], M = MONEY[topM[0]];
    var E = ELEMENTS[topE[0]], dayEl = bz.day[1], rel = relation(topE[0], dayEl);
    var relText = {
      same: 'Ваш характер совпадает с природой по рождению — это большая сила: вы живёте в согласии с собой.',
      support: 'Стихия характера и стихия рождения питают друг друга — вам легко развиваться в своём направлении.',
      tension: 'Стихия характера и стихия рождения спорят между собой — в этом напряжении скрыт ваш главный урок и рост.'
    }[rel];
    var hello = state.name ? esc(state.name) + ', ваша' : 'Ваша';

    var axes = AXES.map(function (ax, i) {
      var v = r.axes[i], pct = Math.round((v + 10) / 20 * 100), side = v >= 0 ? 'a' : 'b';
      return '<li><div class="diag-axis-labels"><span' + (side === 'a' ? ' class="is-on"' : '') + '>' + ax.a + '</span><span' + (side === 'b' ? ' class="is-on"' : '') + '>' + ax.b + '</span></div>' +
        '<div class="diag-axis"><i style="left:' + (100 - pct) + '%"></i></div><p>' + (side === 'a' ? ax.ta : ax.tb) + '</p></li>';
    }).join('');

    var waMsg = 'Здравствуйте! Я прошёл(а) диагностику предназначения на сайте.' +
      '\nАрхетип: ' + a1.name + ' и ' + a2.name +
      '\nСфера: ' + I.name + ', формат дохода: ' + M.name +
      '\nСтихия: ' + E.name + ', по рождению: ' + ELEMENTS[dayEl].name +
      '\nЧисло пути: ' + num + ', знак: ' + z.name + ', год ' + bz.animal +
      '\nХочу записаться на подробный разбор.';

    scrollTop();
    swap(
      '<p class="diag-kicker">Распаковка личности</p>' +
      '<h3 class="diag-formula">' + hello + ' формула предназначения: <em>' + esc(a1.name) + '</em> в сфере «' + esc(I.name) + '» через формат «' + esc(M.name) + '»</h3>' +

      '<section class="diag-sec"><h4><sup>/1</sup>Архетип</h4>' +
      '<div class="diag-two"><div><p class="diag-big">' + esc(a1.name) + '</p><p>' + a1.essence + ' ' + a1.gift + '</p>' +
      '<p class="diag-note"><b>Тень:</b> ' + a1.shadow + '</p><p class="diag-note"><b>Где проявить и заработать:</b> ' + a1.money + '</p></div>' +
      '<div><p class="diag-small">Второй архетип</p><p class="diag-mid">' + esc(a2.name) + '</p><p>' + a2.essence + ' ' + a2.gift + '</p></div></div></section>' +

      '<section class="diag-sec"><h4><sup>/2</sup>Интересы и таланты</h4>' +
      '<div class="diag-two"><div><p class="diag-big">' + esc(I.name) + '</p><p>' + I.text + '</p><p class="diag-small">Подходящие направления</p><ul class="diag-list">' +
      I.jobs.concat(I2.jobs.slice(0, 2)).map(function (j) { return '<li>' + j + '</li>'; }).join('') + '</ul></div>' +
      '<div>' + bars(r.interest, INTERESTS, 16) + '</div></div></section>' +

      '<section class="diag-sec"><h4><sup>/3</sup>Психологический портрет</h4><ul class="diag-axes">' + axes + '</ul></section>' +

      '<section class="diag-sec"><h4><sup>/4</sup>Деньги и дело</h4>' +
      '<div class="diag-two"><div><p class="diag-big">' + esc(M.name) + '</p><p>' + M.text + '</p><p class="diag-small">Первые шаги</p><ol class="diag-list">' +
      M.steps.map(function (s) { return '<li>' + s + '</li>'; }).join('') + '</ol></div>' +
      '<div>' + bars(r.money, MONEY, 16) + '</div></div></section>' +

      '<section class="diag-sec"><h4><sup>/5</sup>Стихии и бацзы</h4>' +
      '<div class="diag-two"><div><p class="diag-small">По вашим ответам</p><p class="diag-big">' + E.name + '</p><p>' + E.text + '</p>' +
      bars(r.element, ELEMENTS, 16) + '</div>' +
      '<div><p class="diag-small">По дню рождения (Хозяин дня в бацзы)</p><p class="diag-big">' + ELEMENTS[dayEl].name + ' · ' + bz.day[0] + '</p>' +
      '<p>' + bz.day[3] + ' (' + bz.day[2] + ').</p><p class="diag-note">' + relText + '</p>' +
      '<p class="diag-note">Китайский знак года: <b>' + bz.yearElement + ' ' + bz.animal + '</b>' +
      (bz.nearLichun ? ' (вы родились рядом с границей китайского года, точный знак уточняется по времени рождения)' : '') + '.</p></div></div></section>' +

      '<section class="diag-sec"><h4><sup>/6</sup>Нумерология и астрология</h4>' +
      '<div class="diag-two"><div><p class="diag-small">Число жизненного пути</p><p class="diag-num">' + num + '</p><p>' + NUM[num] + '</p></div>' +
      '<div><p class="diag-small">Знак зодиака</p><p class="diag-big">' + z.name + '</p><p>' + z.name + ' — ' + ZODIAC_TEXT[z.element] + '.</p></div></div></section>' +

      '<div class="diag-cta"><p>Это общая картина. На личном разборе шаман соединит её с вашим родом и подскажет следующий шаг.</p>' +
      '<div class="diag-actions"><a class="btn btn-lime" target="_blank" rel="noopener" href="https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(waMsg) + '">Записаться на разбор</a>' +
      '<button class="btn btn-ghost" type="button" data-act="pdf">Скачать PDF</button>' +
      '<button class="btn btn-ghost" type="button" data-act="restart">Пройти заново</button></div>' +
      '<p class="diag-small">Результат — повод задуматься и лучше узнать себя, а не окончательный приговор.</p></div>',
      function (card) {
        card.querySelector('[data-act="pdf"]').addEventListener('click', function (e) {
          if (window.SakhaPDF) window.SakhaPDF.download(card, 'Диагностика предназначения', state.name, e.currentTarget);
        });
        card.querySelector('[data-act="restart"]').addEventListener('click', function () {
          var name = state.name, dob = state.dob; reset(); state.name = name; state.dob = dob; renderIntro();
        });
      }
    );
  }
  load();
  if (state.step >= TOTAL && state.dob) renderResult(); else renderIntro();
})();
