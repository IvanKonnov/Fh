/* ═══ NAVLIFE · NUTRITION DATA · v4.0 ═══
   Блюда собираются из КОМПОНЕНТОВ. Каждый компонент — продукт с КБЖУ на 100г.
   Схема приёма: protein + base + veg/fruit + fats — сумма даёт блюдо.
*/
'use strict';

/* ═══ Компоненты для сборки блюд ═══
   base:        углеводная основа (крупы, картофель, хлеб)
   protein:     белок (мясо, рыба, яйца, творог, молоко)
   veg:         овощи (для обеда/ужина)
   fruit:       фрукты/ягоды (для завтрака/перекуса)
   fats:        жиры и добавки (масло, орехи, семечки, мёд, сыр, авокадо)
*/
window.MEAL_COMPONENTS = {
  base: [
    { n:'Овсянка сухая',         kcal:370, p:13,   f:6,    c:63,  unit:'г',   def:70, min:40, max:120, tag:'healthy',  tier:'budget',   contains:['gluten'], diet:['обычное','вегетарианское','веганское'] },
    { n:'Гречка сухая',          kcal:343, p:13,   f:3.4,  c:72,  unit:'г',   def:80, min:50, max:130, tag:'healthy',  tier:'budget',   contains:[],         diet:['обычное','вегетарианское','веганское'] },
    { n:'Рис сухой',             kcal:360, p:6.7,  f:1,    c:79,  unit:'г',   def:80, min:50, max:130, tag:'neutral',  tier:'budget',   contains:[],         diet:['обычное','вегетарианское','веганское'] },
    { n:'Макароны сухие',        kcal:371, p:13,   f:1.5,  c:71,  unit:'г',   def:80, min:50, max:130, tag:'neutral',  tier:'budget',   contains:['gluten'], diet:['обычное','вегетарианское','веганское'] },
    { n:'Картофель сырой',       kcal:77,  p:2,    f:0.1,  c:17,  unit:'г',   def:200,min:120,max:350, tag:'neutral',  tier:'budget',   contains:[],         diet:['обычное','вегетарианское','веганское'] },
    { n:'Хлеб цельнозерновой',   kcal:228, p:9,    f:3,    c:41,  unit:'г',   def:60, min:30, max:100, tag:'healthy',  tier:'standard', contains:['gluten'], diet:['обычное','вегетарианское','веганское'] },
    { n:'Хлеб белый',            kcal:265, p:9,    f:3,    c:49,  unit:'г',   def:60, min:30, max:100, tag:'junk',     tier:'budget',   contains:['gluten'], diet:['обычное','вегетарианское','веганское'] },
    { n:'Киноа сухая',           kcal:368, p:14,   f:6,    c:64,  unit:'г',   def:70, min:40, max:120, tag:'healthy',  tier:'premium',  contains:[],         diet:['обычное','вегетарианское','веганское'] },
    { n:'Булгур сухой',          kcal:342, p:12,   f:1.3,  c:76,  unit:'г',   def:80, min:50, max:120, tag:'healthy',  tier:'standard', contains:['gluten'], diet:['обычное','вегетарианское','веганское'] }
  ],
  protein: [
    { n:'Курица грудка',         kcal:165, p:31,   f:3.6,  c:0,   unit:'г',   def:150,min:100,max:250, tag:'healthy',  tier:'budget',   contains:['meat'],           diet:['обычное'] },
    { n:'Курица бедро',          kcal:209, p:26,   f:11,   c:0,   unit:'г',   def:150,min:100,max:220, tag:'healthy',  tier:'budget',   contains:['meat'],           diet:['обычное'] },
    { n:'Индейка филе',          kcal:189, p:29,   f:7,    c:0,   unit:'г',   def:150,min:100,max:220, tag:'healthy',  tier:'standard', contains:['meat'],           diet:['обычное'] },
    { n:'Говядина',              kcal:250, p:26,   f:16,   c:0,   unit:'г',   def:130,min:100,max:200, tag:'neutral',  tier:'standard', contains:['meat'],           diet:['обычное'] },
    { n:'Куриный фарш',          kcal:200, p:17,   f:14,   c:0,   unit:'г',   def:180,min:120,max:250, tag:'neutral',  tier:'budget',   contains:['meat'],           diet:['обычное'] },
    { n:'Треска',                kcal:82,  p:18,   f:0.7,  c:0,   unit:'г',   def:180,min:120,max:280, tag:'healthy',  tier:'budget',   contains:['fish'],           diet:['обычное'] },
    { n:'Минтай',                kcal:72,  p:16,   f:0.9,  c:0,   unit:'г',   def:200,min:130,max:300, tag:'healthy',  tier:'budget',   contains:['fish'],           diet:['обычное'] },
    { n:'Лосось',                kcal:208, p:20,   f:13,   c:0,   unit:'г',   def:140,min:100,max:200, tag:'healthy',  tier:'premium',  contains:['fish'],           diet:['обычное'] },
    { n:'Тунец консерв.',        kcal:116, p:26,   f:1,    c:0,   unit:'г',   def:150,min:100,max:220, tag:'healthy',  tier:'budget',   contains:['fish'],           diet:['обычное'] },
    { n:'Яйца куриные',          kcal:155, p:13,   f:11,   c:1.1, unit:'г',   def:120,min:60, max:200, tag:'healthy',  tier:'budget',   contains:['eggs'],           diet:['обычное','вегетарианское'] },
    { n:'Творог 5%',             kcal:121, p:17,   f:5,    c:3,   unit:'г',   def:180,min:100,max:300, tag:'healthy',  tier:'budget',   contains:['lactose'],        diet:['обычное','вегетарианское'] },
    { n:'Тофу',                  kcal:76,  p:8,    f:4.8,  c:1.9, unit:'г',   def:200,min:120,max:300, tag:'healthy',  tier:'premium',  contains:[],                 diet:['обычное','вегетарианское','веганское'] },
    { n:'Креветки',              kcal:99,  p:24,   f:0.3,  c:0.2, unit:'г',   def:150,min:100,max:220, tag:'healthy',  tier:'premium',  contains:['fish'],           diet:['обычное'] },
    { n:'Молоко 2.5%',           kcal:52,  p:2.8,  f:2.5,  c:4.7, unit:'мл',  def:200,min:100,max:300, tag:'neutral',  tier:'budget',   contains:['lactose'],        diet:['обычное','вегетарианское'] },
    { n:'Кефир 1%',              kcal:40,  p:3,    f:1,    c:4,   unit:'мл',  def:300,min:150,max:400, tag:'healthy',  tier:'budget',   contains:['lactose'],        diet:['обычное','вегетарианское'] },
    { n:'Йогурт греческий',      kcal:97,  p:9,    f:5,    c:4,   unit:'г',   def:170,min:100,max:280, tag:'healthy',  tier:'standard', contains:['lactose'],        diet:['обычное','вегетарианское'] }
  ],
  veg: [
    { n:'Овощи микс',            kcal:25,  p:1.5,  f:0.2,  c:5,   unit:'г',   def:200,min:100,max:350, tag:'healthy',  tier:'budget',   contains:[],         diet:['обычное','вегетарианское','веганское'] },
    { n:'Брокколи',              kcal:34,  p:2.8,  f:0.4,  c:7,   unit:'г',   def:200,min:120,max:350, tag:'healthy',  tier:'standard', contains:[],         diet:['обычное','вегетарианское','веганское'] },
    { n:'Огурец-помидор',        kcal:17,  p:0.8,  f:0.15, c:4,   unit:'г',   def:200,min:100,max:350, tag:'healthy',  tier:'budget',   contains:[],         diet:['обычное','вегетарианское','веганское'] },
    { n:'Салат листовой+шпинат', kcal:19,  p:2.1,  f:0.3,  c:3,   unit:'г',   def:150,min:80, max:300, tag:'healthy',  tier:'standard', contains:[],         diet:['обычное','вегетарианское','веганское'] }
  ],
  fruit: [
    { n:'Банан',                 kcal:89,  p:1.1,  f:0.3,  c:23,  unit:'г',   def:120,min:60, max:200, tag:'healthy',  tier:'budget',   contains:[],         diet:['обычное','вегетарианское','веганское'] },
    { n:'Яблоко',                kcal:52,  p:0.3,  f:0.2,  c:14,  unit:'г',   def:150,min:80, max:250, tag:'healthy',  tier:'budget',   contains:[],         diet:['обычное','вегетарианское','веганское'] },
    { n:'Ягоды',                 kcal:45,  p:0.7,  f:0.4,  c:10,  unit:'г',   def:120,min:60, max:200, tag:'healthy',  tier:'premium',  contains:[],         diet:['обычное','вегетарианское','веганское'] },
    { n:'Апельсин',              kcal:47,  p:0.9,  f:0.1,  c:12,  unit:'г',   def:150,min:80, max:250, tag:'healthy',  tier:'budget',   contains:[],         diet:['обычное','вегетарианское','веганское'] }
  ],
  fats: [
    { n:'Оливковое масло',       kcal:884, p:0,    f:100,  c:0,   unit:'г',   def:10, min:5,  max:25,  tag:'healthy',  tier:'premium',  contains:[],         diet:['обычное','вегетарианское','веганское'] },
    { n:'Сливочное масло',       kcal:717, p:0.8,  f:81,   c:0.1, unit:'г',   def:10, min:5,  max:25,  tag:'neutral',  tier:'standard', contains:['lactose'],diet:['обычное','вегетарианское'] },
    { n:'Орехи грецкие',         kcal:654, p:15,   f:65,   c:14,  unit:'г',   def:25, min:10, max:50,  tag:'healthy',  tier:'standard', contains:['nuts'],   diet:['обычное','вегетарианское','веганское'] },
    { n:'Миндаль',               kcal:579, p:21,   f:50,   c:22,  unit:'г',   def:25, min:10, max:50,  tag:'healthy',  tier:'premium',  contains:['nuts'],   diet:['обычное','вегетарианское','веганское'] },
    { n:'Арахис',                kcal:567, p:26,   f:49,   c:16,  unit:'г',   def:25, min:10, max:50,  tag:'healthy',  tier:'budget',   contains:['nuts'],   diet:['обычное','вегетарианское','веганское'] },
    { n:'Семечки подсолнечные',  kcal:584, p:21,   f:51,   c:20,  unit:'г',   def:20, min:10, max:40,  tag:'healthy',  tier:'budget',   contains:[],         diet:['обычное','вегетарианское','веганское'] },
    { n:'Авокадо',               kcal:160, p:2,    f:15,   c:9,   unit:'г',   def:80, min:40, max:150, tag:'healthy',  tier:'premium',  contains:[],         diet:['обычное','вегетарианское','веганское'] },
    { n:'Сыр твёрдый',           kcal:364, p:25,   f:29,   c:2,   unit:'г',   def:25, min:15, max:50,  tag:'neutral',  tier:'standard', contains:['lactose'],diet:['обычное','вегетарианское'] },
    { n:'Мёд',                   kcal:304, p:0.3,  f:0,    c:82,  unit:'г',   def:15, min:8,  max:30,  tag:'healthy',  tier:'standard', contains:[],         diet:['обычное','вегетарианское','веганское'] },
    { n:'Арахисовая паста',      kcal:588, p:25,   f:50,   c:20,  unit:'г',   def:20, min:10, max:40,  tag:'healthy',  tier:'standard', contains:['nuts'],   diet:['обычное','вегетарианское','веганское'] }
  ]
};

/* ═══ Схема сборки каждого приёма ═══ */
window.MEAL_SCHEMAS = {
  breakfast: ['base', 'protein', 'fruit', 'fats'],
  lunch:     ['protein', 'base', 'veg', 'fats'],
  dinner:    ['protein', 'base', 'veg', 'fats'],
  snack:     ['protein', 'fruit', 'fats']
};

/* ═══ База продуктов для РУЧНОГО добавления (плоский список) ═══ */
window.FOOD_DB = [
  {n:'Овсянка на воде',kcal:88,p:3,f:1.7,c:15,tag:'healthy',category:'grain',tier:'budget',contains:['gluten']},
  {n:'Овсянка на молоке',kcal:110,p:4.5,f:3.2,c:15,tag:'healthy',category:'grain',tier:'budget',contains:['gluten','lactose']},
  {n:'Рис белый варёный',kcal:116,p:2.2,f:0.5,c:25,tag:'neutral',category:'grain',tier:'budget',contains:[]},
  {n:'Рис бурый варёный',kcal:111,p:2.6,f:0.9,c:23,tag:'healthy',category:'grain',tier:'standard',contains:[]},
  {n:'Гречка варёная',kcal:110,p:4,f:1.2,c:21,tag:'healthy',category:'grain',tier:'budget',contains:[]},
  {n:'Макароны варёные',kcal:131,p:5,f:1.1,c:25,tag:'neutral',category:'grain',tier:'budget',contains:['gluten']},
  {n:'Перловка варёная',kcal:109,p:3.1,f:0.4,c:22,tag:'healthy',category:'grain',tier:'budget',contains:['gluten']},
  {n:'Булгур варёный',kcal:83,p:3.1,f:0.2,c:19,tag:'healthy',category:'grain',tier:'standard',contains:['gluten']},
  {n:'Киноа варёная',kcal:120,p:4.4,f:1.9,c:21,tag:'healthy',category:'grain',tier:'premium',contains:[]},
  {n:'Кускус варёный',kcal:112,p:3.8,f:0.2,c:23,tag:'neutral',category:'grain',tier:'standard',contains:['gluten']},
  {n:'Картофель варёный',kcal:87,p:2,f:0.1,c:20,tag:'neutral',category:'grain',tier:'budget',contains:[]},
  {n:'Картофельное пюре',kcal:106,p:2.5,f:4,c:15,tag:'neutral',category:'grain',tier:'budget',contains:['lactose']},
  {n:'Батат запечённый',kcal:90,p:2,f:0.1,c:21,tag:'healthy',category:'grain',tier:'standard',contains:[]},
  {n:'Куриная грудка',kcal:165,p:31,f:3.6,c:0,tag:'healthy',category:'protein',tier:'budget',contains:['meat']},
  {n:'Куриное бедро',kcal:209,p:26,f:11,c:0,tag:'healthy',category:'protein',tier:'budget',contains:['meat']},
  {n:'Индейка филе',kcal:189,p:29,f:7,c:0,tag:'healthy',category:'protein',tier:'standard',contains:['meat']},
  {n:'Говядина',kcal:250,p:26,f:16,c:0,tag:'neutral',category:'protein',tier:'standard',contains:['meat']},
  {n:'Куриный фарш',kcal:200,p:17,f:14,c:0,tag:'neutral',category:'protein',tier:'budget',contains:['meat']},
  {n:'Телятина',kcal:172,p:24,f:8,c:0,tag:'healthy',category:'protein',tier:'premium',contains:['meat']},
  {n:'Свинина',kcal:290,p:25,f:21,c:0,tag:'neutral',category:'protein',tier:'standard',contains:['meat','pork']},
  {n:'Кролик',kcal:156,p:21,f:8,c:0,tag:'healthy',category:'protein',tier:'premium',contains:['meat']},
  {n:'Печень куриная',kcal:140,p:20,f:6,c:0.7,tag:'healthy',category:'protein',tier:'budget',contains:['meat']},
  {n:'Лосось',kcal:208,p:20,f:13,c:0,tag:'healthy',category:'protein',tier:'premium',contains:['fish']},
  {n:'Скумбрия',kcal:205,p:19,f:14,c:0,tag:'healthy',category:'protein',tier:'standard',contains:['fish']},
  {n:'Сельдь',kcal:217,p:18,f:16,c:0,tag:'healthy',category:'protein',tier:'budget',contains:['fish']},
  {n:'Треска',kcal:82,p:18,f:0.7,c:0,tag:'healthy',category:'protein',tier:'budget',contains:['fish']},
  {n:'Тунец консерв.',kcal:116,p:26,f:1,c:0,tag:'healthy',category:'protein',tier:'budget',contains:['fish']},
  {n:'Минтай',kcal:72,p:16,f:0.9,c:0,tag:'healthy',category:'protein',tier:'budget',contains:['fish']},
  {n:'Сардины консерв.',kcal:208,p:25,f:11,c:0,tag:'healthy',category:'protein',tier:'budget',contains:['fish']},
  {n:'Креветки',kcal:99,p:24,f:0.3,c:0.2,tag:'healthy',category:'protein',tier:'premium',contains:['fish']},
  {n:'Кальмар',kcal:92,p:15,f:1.4,c:2,tag:'healthy',category:'protein',tier:'standard',contains:['fish']},
  {n:'Мидии',kcal:86,p:12,f:2,c:3,tag:'healthy',category:'protein',tier:'premium',contains:['fish']},
  {n:'Тофу',kcal:76,p:8,f:4.8,c:1.9,tag:'healthy',category:'protein',tier:'premium',contains:[]},
  {n:'Яйцо куриное',kcal:155,p:13,f:11,c:1.1,tag:'healthy',category:'protein',tier:'budget',contains:['eggs']},
  {n:'Яичный белок',kcal:52,p:11,f:0.2,c:0.7,tag:'healthy',category:'protein',tier:'budget',contains:['eggs']},
  {n:'Творог 5%',kcal:121,p:17,f:5,c:3,tag:'healthy',category:'dairy',tier:'budget',contains:['lactose']},
  {n:'Творог 2%',kcal:103,p:18,f:2,c:3.3,tag:'healthy',category:'dairy',tier:'budget',contains:['lactose']},
  {n:'Творог обезжиренный',kcal:79,p:18,f:0.5,c:1.5,tag:'healthy',category:'dairy',tier:'budget',contains:['lactose']},
  {n:'Молоко 2.5%',kcal:52,p:2.8,f:2.5,c:4.7,tag:'neutral',category:'dairy',tier:'budget',contains:['lactose']},
  {n:'Кефир 1%',kcal:40,p:3,f:1,c:4,tag:'healthy',category:'dairy',tier:'budget',contains:['lactose']},
  {n:'Ряженка',kcal:67,p:3,f:4,c:4.2,tag:'neutral',category:'dairy',tier:'budget',contains:['lactose']},
  {n:'Сыр твёрдый',kcal:364,p:25,f:29,c:2,tag:'neutral',category:'dairy',tier:'standard',contains:['lactose']},
  {n:'Моцарелла',kcal:240,p:22,f:16,c:2.2,tag:'neutral',category:'dairy',tier:'standard',contains:['lactose']},
  {n:'Брынза',kcal:262,p:17,f:20,c:0,tag:'neutral',category:'dairy',tier:'standard',contains:['lactose']},
  {n:'Йогурт натуральный',kcal:66,p:5,f:3.5,c:4,tag:'healthy',category:'dairy',tier:'budget',contains:['lactose']},
  {n:'Йогурт греческий',kcal:97,p:9,f:5,c:4,tag:'healthy',category:'dairy',tier:'standard',contains:['lactose']},
  {n:'Сметана 15%',kcal:158,p:2.6,f:15,c:3,tag:'neutral',category:'dairy',tier:'budget',contains:['lactose']},
  {n:'Сливочное масло',kcal:717,p:0.8,f:81,c:0.1,tag:'neutral',category:'dairy',tier:'standard',contains:['lactose']},
  {n:'Огурец',kcal:15,p:0.7,f:0.1,c:3.6,tag:'healthy',category:'veg',tier:'budget',contains:[]},
  {n:'Помидор',kcal:18,p:0.9,f:0.2,c:3.9,tag:'healthy',category:'veg',tier:'budget',contains:[]},
  {n:'Морковь',kcal:41,p:0.9,f:0.2,c:10,tag:'healthy',category:'veg',tier:'budget',contains:[]},
  {n:'Капуста белая',kcal:25,p:1.3,f:0.1,c:6,tag:'healthy',category:'veg',tier:'budget',contains:[]},
  {n:'Брокколи',kcal:34,p:2.8,f:0.4,c:7,tag:'healthy',category:'veg',tier:'standard',contains:[]},
  {n:'Цветная капуста',kcal:25,p:1.9,f:0.3,c:5,tag:'healthy',category:'veg',tier:'standard',contains:[]},
  {n:'Болгарский перец',kcal:27,p:1,f:0.2,c:6,tag:'healthy',category:'veg',tier:'standard',contains:[]},
  {n:'Кабачок',kcal:17,p:1.2,f:0.3,c:3,tag:'healthy',category:'veg',tier:'budget',contains:[]},
  {n:'Баклажан',kcal:24,p:1.2,f:0.1,c:5,tag:'healthy',category:'veg',tier:'budget',contains:[]},
  {n:'Лук репчатый',kcal:41,p:1.4,f:0.2,c:10,tag:'healthy',category:'veg',tier:'budget',contains:[]},
  {n:'Шпинат',kcal:23,p:2.9,f:0.4,c:3.6,tag:'healthy',category:'veg',tier:'standard',contains:[]},
  {n:'Свекла варёная',kcal:49,p:1.8,f:0.2,c:11,tag:'healthy',category:'veg',tier:'budget',contains:[]},
  {n:'Тыква',kcal:26,p:1,f:0.1,c:6.5,tag:'healthy',category:'veg',tier:'budget',contains:[]},
  {n:'Горошек зелёный',kcal:73,p:5,f:0.4,c:14,tag:'healthy',category:'veg',tier:'budget',contains:[]},
  {n:'Кукуруза',kcal:96,p:3.4,f:1.5,c:19,tag:'neutral',category:'veg',tier:'budget',contains:[]},
  {n:'Фасоль красная',kcal:127,p:8.7,f:0.5,c:22,tag:'healthy',category:'veg',tier:'budget',contains:[]},
  {n:'Чечевица',kcal:116,p:9,f:0.4,c:20,tag:'healthy',category:'veg',tier:'budget',contains:[]},
  {n:'Банан',kcal:89,p:1.1,f:0.3,c:23,tag:'healthy',category:'fruit',tier:'budget',contains:[]},
  {n:'Яблоко',kcal:52,p:0.3,f:0.2,c:14,tag:'healthy',category:'fruit',tier:'budget',contains:[]},
  {n:'Апельсин',kcal:47,p:0.9,f:0.1,c:12,tag:'healthy',category:'fruit',tier:'budget',contains:[]},
  {n:'Груша',kcal:57,p:0.4,f:0.1,c:15,tag:'healthy',category:'fruit',tier:'budget',contains:[]},
  {n:'Киви',kcal:61,p:1.1,f:0.5,c:15,tag:'healthy',category:'fruit',tier:'standard',contains:[]},
  {n:'Манго',kcal:60,p:0.8,f:0.4,c:15,tag:'healthy',category:'fruit',tier:'premium',contains:[]},
  {n:'Персик',kcal:39,p:0.9,f:0.3,c:10,tag:'healthy',category:'fruit',tier:'standard',contains:[]},
  {n:'Виноград',kcal:69,p:0.7,f:0.2,c:18,tag:'healthy',category:'fruit',tier:'standard',contains:[]},
  {n:'Авокадо',kcal:160,p:2,f:15,c:9,tag:'healthy',category:'fruit',tier:'premium',contains:[]},
  {n:'Клубника',kcal:32,p:0.7,f:0.3,c:7.7,tag:'healthy',category:'fruit',tier:'standard',contains:[]},
  {n:'Черника',kcal:57,p:0.7,f:0.3,c:14,tag:'healthy',category:'fruit',tier:'premium',contains:[]},
  {n:'Малина',kcal:52,p:1.2,f:0.7,c:12,tag:'healthy',category:'fruit',tier:'standard',contains:[]},
  {n:'Изюм',kcal:299,p:3.1,f:0.5,c:79,tag:'neutral',category:'fruit',tier:'budget',contains:[]},
  {n:'Орехи грецкие',kcal:654,p:15,f:65,c:14,tag:'healthy',category:'nuts',tier:'standard',contains:['nuts']},
  {n:'Миндаль',kcal:579,p:21,f:50,c:22,tag:'healthy',category:'nuts',tier:'premium',contains:['nuts']},
  {n:'Кешью',kcal:553,p:18,f:44,c:30,tag:'healthy',category:'nuts',tier:'premium',contains:['nuts']},
  {n:'Фундук',kcal:628,p:15,f:61,c:17,tag:'healthy',category:'nuts',tier:'premium',contains:['nuts']},
  {n:'Фисташки',kcal:560,p:20,f:45,c:28,tag:'healthy',category:'nuts',tier:'premium',contains:['nuts']},
  {n:'Арахис',kcal:567,p:26,f:49,c:16,tag:'healthy',category:'nuts',tier:'budget',contains:['nuts']},
  {n:'Семечки подсолнечные',kcal:584,p:21,f:51,c:20,tag:'healthy',category:'nuts',tier:'budget',contains:[]},
  {n:'Семена чиа',kcal:486,p:17,f:31,c:42,tag:'healthy',category:'nuts',tier:'premium',contains:[]},
  {n:'Семена льна',kcal:534,p:18,f:42,c:29,tag:'healthy',category:'nuts',tier:'standard',contains:[]},
  {n:'Хлеб белый',kcal:265,p:9,f:3,c:49,tag:'junk',category:'grain',tier:'budget',contains:['gluten']},
  {n:'Хлеб чёрный',kcal:210,p:7,f:1,c:40,tag:'neutral',category:'grain',tier:'budget',contains:['gluten']},
  {n:'Хлеб цельнозерновой',kcal:228,p:9,f:3,c:41,tag:'healthy',category:'grain',tier:'standard',contains:['gluten']},
  {n:'Лаваш',kcal:236,p:8,f:1,c:48,tag:'neutral',category:'grain',tier:'budget',contains:['gluten']},
  {n:'Пита',kcal:275,p:9,f:2,c:55,tag:'neutral',category:'grain',tier:'standard',contains:['gluten']},
  {n:'Шоколад тёмный 70%',kcal:598,p:7.8,f:43,c:46,tag:'junk',category:'sweet',tier:'standard',contains:[]},
  {n:'Шоколад молочный',kcal:535,p:7.6,f:30,c:59,tag:'junk',category:'sweet',tier:'budget',contains:['lactose']},
  {n:'Печенье',kcal:417,p:5,f:20,c:60,tag:'junk',category:'sweet',tier:'budget',contains:['gluten','eggs']},
  {n:'Мёд',kcal:304,p:0.3,f:0,c:82,tag:'healthy',category:'sweet',tier:'standard',contains:[]},
  {n:'Мороженое пломбир',kcal:230,p:3.7,f:15,c:20,tag:'junk',category:'sweet',tier:'standard',contains:['lactose']},
  {n:'Протеиновый батончик',kcal:180,p:20,f:6,c:15,tag:'neutral',category:'sweet',tier:'premium',contains:[]},
  {n:'Чипсы',kcal:536,p:6,f:35,c:53,tag:'junk',category:'sweet',tier:'budget',contains:[]},
  {n:'Сухарики',kcal:397,p:9,f:13,c:63,tag:'junk',category:'sweet',tier:'budget',contains:['gluten']},
  {n:'Кофе чёрный без сахара',kcal:2,p:0.2,f:0,c:0,tag:'healthy',category:'drink',tier:'budget',contains:[]},
  {n:'Кофе с молоком',kcal:35,p:1.5,f:1.5,c:4,tag:'neutral',category:'drink',tier:'budget',contains:['lactose']},
  {n:'Чай без сахара',kcal:1,p:0,f:0,c:0.2,tag:'healthy',category:'drink',tier:'budget',contains:[]},
  {n:'Сок апельсиновый',kcal:45,p:0.7,f:0.2,c:10,tag:'neutral',category:'drink',tier:'budget',contains:[]},
  {n:'Сок яблочный',kcal:46,p:0.1,f:0.1,c:11,tag:'neutral',category:'drink',tier:'budget',contains:[]},
  {n:'Кола',kcal:42,p:0,f:0,c:10.6,tag:'junk',category:'drink',tier:'budget',contains:[]},
  {n:'Какао на молоке',kcal:82,p:3.2,f:3,c:10,tag:'neutral',category:'drink',tier:'budget',contains:['lactose']},
  {n:'Оливковое масло',kcal:884,p:0,f:100,c:0,tag:'healthy',category:'other',tier:'premium',contains:[]},
  {n:'Растительное масло',kcal:899,p:0,f:99.9,c:0,tag:'neutral',category:'other',tier:'budget',contains:[]},
  {n:'Майонез',kcal:680,p:1,f:75,c:2,tag:'junk',category:'other',tier:'budget',contains:['eggs']},
  {n:'Кетчуп',kcal:97,p:1.3,f:0.1,c:23,tag:'junk',category:'other',tier:'budget',contains:[]},
  {n:'Соевый соус',kcal:53,p:8,f:0.1,c:6,tag:'neutral',category:'other',tier:'budget',contains:['gluten']},
  {n:'Хумус',kcal:166,p:8,f:10,c:14,tag:'healthy',category:'other',tier:'standard',contains:[]},
  {n:'Борщ',kcal:60,p:2.5,f:2.5,c:7,tag:'healthy',category:'other',tier:'budget',contains:[]},
  {n:'Суп куриный',kcal:45,p:3,f:2,c:3,tag:'healthy',category:'other',tier:'budget',contains:['meat']},
  {n:'Оливки',kcal:115,p:0.8,f:11,c:6,tag:'healthy',category:'other',tier:'standard',contains:[]}
];

window.NUTRITION_CATEGORIES = [
  { key:'grain',   label:'🌾 Крупы' },
  { key:'protein', label:'🍗 Мясо, рыба, белок' },
  { key:'dairy',   label:'🥛 Молочное' },
  { key:'veg',     label:'🥦 Овощи' },
  { key:'fruit',   label:'🍎 Фрукты' },
  { key:'nuts',    label:'🥜 Орехи' },
  { key:'sweet',   label:'🍫 Сладкое' },
  { key:'drink',   label:'☕ Напитки' },
  { key:'other',   label:'🍯 Соусы' }
];
window.FOOD_TIERS = [
  { key:'any',      label:'Любой бюджет' },
  { key:'budget',   label:'💰 Бюджетное' },
  { key:'standard', label:'⚖️ Стандартное' },
  { key:'premium',  label:'⭐ Дорогое' }
];