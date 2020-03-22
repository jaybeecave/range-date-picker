/*!
 * vue-date-picker-with-range v1.0.3
 * (c) Joshua Cave
 * Released under the ISC License.
 */
'use strict';

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var parseTime_1 = createCommonjsModule(function (module, exports) {
/* * * * * * * * * *
 *  parseTime .js  *
 *  Version 0.2.9  *
 *  License:  MIT  *
 * Simon  Waldherr *
 * * * * * * * * * */

/*jslint browser: true, indent: 2, forin: true */
/*exported parseTime              */

var parseTimeObject = {
  words: {
    en: {
      currently: ['now'],
      clockwords: [
        'oclock',
        'o\'clock'
      ],
      numbers: {
        'zero' : 0,
        'one' : 1,
        'two' : 2,
        'three' : 3,
        'a few' : 3.5,
        'some' : 3.5,
        'four' : 4,
        'five' : 5,
        'six' : 6,
        'seven' : 7,
        'eight' : 8,
        'nine' : 9,
        'ten' : 10,
        'eleven' : 11,
        'twelve' : 12,
        'thirteen' : 13,
        'fourteen' : 14,
        'fifteen' : 15,
        'sixteen' : 16,
        'seventeen' : 17,
        'eighteen' : 18,
        'nineteen' : 19,
        'twenty' : 20,
        'thirty' : 30,
        'forty' : 40,
        'fifty' : 50,
        'sixty' : 60,
        'seventy' : 70,
        'eighty' : 80,
        'ninety' : 90,
        'hundred' : 100,
        'thousend' : 1000,
        'million' : 1000000
      },
      unit: {
        'millisecond' : 1,
        'second' : 1000,
        'minute' : 60000,
        'hour' : 3600000,
        'day' : 86400000,
        'week' : 604800000,
        'month' : 2592000000,
        'quarter' : 7776000000,
        'year' : 31536000000,
        'decade' : 315360000000
      },
      countable: {
        'before yesterday' : -17280000,
        'yesterday' : -8640000,
        'today' : 1,
        'day after tomorrow' : 17280000,
        'tomorrow' : 8640000,
        'in a week' : 60480000,
        'last week' : -60480000
      },
      month: {
        'jan' : '01',
        'feb' : '02',
        'mar' : '03',
        'apr' : '04',
        'may' : '05',
        'jun' : '06',
        'jul' : '07',
        'aug' : '08',
        'sep' : '09',
        'oct' : '10',
        'nov' : '11',
        'dec' : '12'
      },
      daytime: {
        'dawn': '04:00',
        'morning': '06:00',
        'afternoon': '15:00',
        'noon': '12:00',
        'midday': '12:00',
        'pre-evening': '17:00',
        'preevening': '17:00',
        'evening': '19:00',
        'dusk': '20:00',
        'midnight': '24:00',
        'night': '22:00'
      },
      fillwords: {
        'ago' : '-',
        'in' : '+'
      },
      fillfoo: {
        's' : '',
        '\\-' : '',
        '\\ ' : '',
        '\\.' : ''
      }
    }
  },
  regexes: {}
}, parseTime = function (string, now) {
  var re,
    lang,
    encoded,
    timedif,
    integer,
    pbint,
    unit,
    word,
    val,
    hhmmss,
    hhmmss2,
    tzoffset,
    timeregex,
    word_for_now,
    cur_lang,
    implicit_date,
    clockwords = '',
    ddmmyyyy = {},
    dateO = {},
    adWordsToRegex = function (fillfoo, first) {
      var returnval = '',
        i;

      for (i in parseTimeObject.words[lang][fillfoo]) {
        if (parseTimeObject.words[lang][fillfoo][i] !== undefined) {
          if (first === false) {
            returnval += '|';
          } else {
            first = false;
          }
          returnval += i;
        }
      }
      return returnval;
    },
    objectKeyInString = function (obj, str) {
      var i,
        ret = {},
        retbool,
        keys = Object.keys(obj);

      for (i = 0; i < keys.length; i += 1) {
        if (str.indexOf(keys[i]) !== -1) {
          ret[keys[i]] = str.indexOf(keys[i]);
          retbool = true;
        }
      }
      if (retbool) {
        return ret;
      }
      return false;
    };

  if (now === undefined) {
    now = new Date().getTime();
  } else if (typeof now === 'object') {
    now = now.getTime();
  }
  string = string.toLowerCase().replace(/["'<>\(\)]/gm, '').replace(/(\d)([A-Za-z])/, "$1 $2", "gm");
  string = string.replace(/([^\x00-\x7F])/gm, encodeURIComponent);

  now = parseInt(now, 10);

  for (lang in parseTimeObject.words) {
    if (parseTimeObject.words.length !== 0) {
      cur_lang = parseTimeObject.words[lang];
      for (implicit_date in cur_lang.countable) {
        if (string === implicit_date) {
          val = cur_lang.countable[implicit_date];
          if (val > 0) {
            string = 'in ' + (val / 100) + ' seconds';
          } else {
            string = (val / 100) + ' seconds ago';
          }
        }
      }
      for (word_for_now in cur_lang.currently) {
        if (string === cur_lang.currently[word_for_now]) {
          return {
            'absolute': Date.now(),
            'relative': 0,
            'mode': 'now',
            'pb': 1
          };
        }
      }
    }
  }
  dateO.parsed = new Date();
  dateO.parsed = new Date(Date.parse(string.replace(/((\d{1,2})(th |rd |ter ))/, "$2 ", "gm")));
  if (!isNaN(dateO.parsed)) {
    if (string.indexOf(dateO.parsed.getFullYear()) === -1) {
      dateO.now = new Date();
      dateO.now = Date.parse(now);
      if (!isNaN(dateO.now)) {
        dateO.parsed.setFullYear(dateO.now.getFullYear());
        dateO.parsed.setTime(dateO.parsed.getTime() + 86400000);
      }
    }
    dateO.parsed = dateO.parsed.getTime();
    return {
      'absolute': dateO.parsed,
      'relative': (dateO.parsed - now),
      'mode': 'absolute',
      'pb': 2
    };
  }

  for (lang in parseTimeObject.words) {
    if (clockwords !== '') {
      clockwords += '|';
    }
    clockwords += ' ' + parseTimeObject.words[lang].clockwords.join('| ');
  }

  timeregex = new RegExp('((\\S+\\s){0,4}(\\d{1,2})((:(\\d{1,2})(:(\\d{1,2})(\\.(\\d{1,4}))?)?)|(' + clockwords + ')))');

  hhmmss = /((\d\d)\.(\d\d)\.(\d\d\d\d)[ \D]+(\d\d(:\d\d(:\d\d)?)?(\s\S+)?))/.exec(string);
  // [0]  : full
  // [1]  : full
  // [2]  : day
  // [3]  : month
  // [4]  : year
  // [5]  : hour
  // [6]  : minute
  // [7]  : second
  if (hhmmss !== null) {
    hhmmss2 =  timeregex.exec(hhmmss[5]) || hhmmss;
    dateO.day = hhmmss[2].length === 1 ? '0' + hhmmss[2] : hhmmss[2];
    dateO.month = hhmmss[3].length === 1 ? '0' + hhmmss[3] : hhmmss[3];
    dateO.year = hhmmss[4].length === 2 ? '20' + hhmmss[4] : hhmmss[4];
    dateO.hour = hhmmss2[3] === undefined ? '12' : hhmmss2[3].length === 1 ? '0' + hhmmss2[3] : hhmmss2[3];
    dateO.minute = hhmmss2[6] === undefined ? '00' : hhmmss2[6].length === 1 ? '0' + hhmmss2[6] : hhmmss2[6];
    dateO.second = hhmmss2[7] === undefined ? '00' : hhmmss2[7].length === 1 ? '0' + hhmmss2[7] : hhmmss2[7];
    dateO.second = dateO.second.replace(':', '');
    pbint = 3;
  } else {
    hhmmss = timeregex.exec(string);
    // [0]  : full
    // [1]  : full
    // [2]  : countable (yesterday)
    // [3]  : hour
    // [4]  : o'clock | :min:sec
    // [5]  : :min:sec
    // [6]  : minute
    // [7]  : :second
    // [8]  : second
    if (hhmmss !== null) {
      dateO.countable = hhmmss[0];
      dateO.hour = hhmmss[3] === undefined ? '12' : hhmmss[3].length === 1 ? '0' + hhmmss[3] : hhmmss[3];
      dateO.minute = hhmmss[6] === undefined ? '00' : hhmmss[6].length === 1 ? '0' + hhmmss[6] : hhmmss[6];
      dateO.second = hhmmss[7] === undefined ? '00' : hhmmss[7].length === 1 ? '0' + hhmmss[7] : hhmmss[7];
      dateO.second = dateO.second.replace(':', '');
      pbint = 4;
    } else {
      hhmmss = /((\d\d)[\.:,\/](\d\d)[\.:,\/](\d\d\d\d)(\s\S+){0,4})/.exec(string);
      // [0]  : full
      // [1]  : full
      // [2]  : day
      // [3]  : month
      // [4]  : year
      // [5]  : daytime (evening)
      if (hhmmss !== null) {
        dateO.day = hhmmss[2].length === 1 ? '0' + hhmmss[2] : hhmmss[2];
        dateO.month = hhmmss[3].length === 1 ? '0' + hhmmss[3] : hhmmss[3];
        dateO.year = hhmmss[4].length === 2 ? '20' + hhmmss[4] : hhmmss[4];
        dateO.countable = hhmmss[5];
        pbint = 5;
      }
    }
  }

  string = ' ' + string + ' ';

  if (dateO.hour !== undefined) {
    for (lang in parseTimeObject.words) {
      if (parseTimeObject.words[lang] !== undefined) {
        for (word in parseTimeObject.words[lang].countable) {
          if (parseTimeObject.words[lang].countable[word] !== undefined) {
            if (dateO.countable !== undefined) {
              if (dateO.countable.indexOf(word) !== -1 && dateO.countableint === undefined) {
                dateO.countableint = parseTimeObject.words[lang].countable[word];
              }
            }
          }
        }
      }
    }
  } else {
    for (lang in parseTimeObject.words) {
      if (parseTimeObject.words[lang] !== undefined) {
        for (word in parseTimeObject.words[lang].daytime) {
          if (parseTimeObject.words[lang].daytime[word] !== undefined) {
            if (dateO.countable !== undefined) {
              dateO.countable = dateO.countable.trim();
              if ((dateO.countable.indexOf(word) !== -1) && (dateO.countableint === undefined)) {
                dateO.countableint = 0;
                dateO.hour = parseTimeObject.words[lang].daytime[word].split(':')[0];
                dateO.minute = parseTimeObject.words[lang].daytime[word].split(':')[1];
                dateO.second = '00';
                pbint = 6;
              }
            } else if ((string.indexOf(word) !== -1) && (objectKeyInString(parseTimeObject.words[lang].countable, string) !== false)) {
              hhmmss = word;
              word = objectKeyInString(parseTimeObject.words[lang].countable, string);
              word = Object.keys(word)[0];
              if (word !== undefined) {
                if (word !== hhmmss) {
                  dateO.countable = word;
                  dateO.countableint = parseTimeObject.words[lang].countable[word];
                  hhmmss = parseTimeObject.words[lang].daytime[hhmmss];
                  dateO.hour = hhmmss.split(':')[0];
                  dateO.minute = hhmmss.split(':')[1];
                  dateO.second = '00';
                  pbint = 7;
                }
              }
            }
          }
        }
      }
    }
  }
  if (dateO.countableint !== undefined) {
    dateO.now = new Date(now + dateO.countableint).getTime();
  } else {
    dateO.now = new Date(now).getTime();
  }
  if (dateO.year === undefined) {
    dateO.parsed = new Date();
    dateO.parsed.setTime(dateO.now);
    dateO.day = dateO.parsed.getDate().toString();
    dateO.month = (dateO.parsed.getMonth() + 1).toString();
    dateO.year = (dateO.parsed.getFullYear()).toString();
    dateO.day = dateO.day.length === 1 ? '0' + dateO.day : dateO.day;
    dateO.month = dateO.month.length === 1 ? '0' + dateO.month : dateO.month;
    dateO.today = dateO.year + '-' + dateO.month + '-' + dateO.day;
  } else {
    dateO.today = dateO.year + '-' + dateO.month + '-' + dateO.day;
  }
  if (dateO.hour !== undefined) {
    dateO.string = dateO.today + 'T' + dateO.hour + ':' + dateO.minute + ':' + dateO.second + '+00:00';
    dateO.parsed = new Date();
    dateO.parsed = Date.parse(dateO.string);
  } else if ((dateO.day !== undefined) && (dateO.today !== undefined)) {
    dateO.string = dateO.today + 'T12:00:00+00:00';
    dateO.parsed = new Date();
    dateO.parsed = Date.parse(dateO.string);
  }

  if ((typeof dateO.parsed === 'number') && (pbint !== undefined)) {
    if (!isNaN(dateO.parsed)) {
      tzoffset = new Date().getTimezoneOffset() * -30000;
      if ((pbint === 3) || (pbint === 5)) {
        dateO.parsed = dateO.parsed - tzoffset;
      } else if (pbint === 4) {
        dateO.parsed = dateO.parsed - tzoffset * 2;
      }
      return {
        'absolute': dateO.parsed,
        'relative': dateO.parsed - now,
        'mode': 'absolute',
        'pb': pbint
      };
    }
  }

  for (lang in parseTimeObject.words) {
    if (parseTimeObject.words[lang] !== undefined) {
      parseTimeObject.regexes[lang] = '((';
      parseTimeObject.regexes[lang] += adWordsToRegex('fillfoo', true);
      parseTimeObject.regexes[lang] += ')+(';
      parseTimeObject.regexes[lang] += adWordsToRegex('fillwords', true);
      parseTimeObject.regexes[lang] += ')*(';
      parseTimeObject.regexes[lang] += adWordsToRegex('fillfoo', true);
      parseTimeObject.regexes[lang] += ')*(\\d+';
      parseTimeObject.regexes[lang] += adWordsToRegex('numbers', false);
      parseTimeObject.regexes[lang] += ')+(';
      parseTimeObject.regexes[lang] += adWordsToRegex('fillfoo', true);
      parseTimeObject.regexes[lang] += ')*((';
      parseTimeObject.regexes[lang] += adWordsToRegex('unit', true);
      parseTimeObject.regexes[lang] += ')(';
      parseTimeObject.regexes[lang] += adWordsToRegex('fillfoo', true);
      parseTimeObject.regexes[lang] += ')*';
      parseTimeObject.regexes[lang] += adWordsToRegex('fillfoo', false);
      parseTimeObject.regexes[lang] += ')*(';
      parseTimeObject.regexes[lang] += adWordsToRegex('fillwords', true);
      parseTimeObject.regexes[lang] += ')*(';
      parseTimeObject.regexes[lang] += adWordsToRegex('fillfoo', true);
      parseTimeObject.regexes[lang] += ')+)';
    }
  }
  // [0]  : unimportant
  // [1]  : unimportant
  // [2]  : unimportant
  // [3]  : fillwords (mostly future)
  // [4]  : unimportant
  // [5]  : numbers (string or int)
  // [6]  : unimportant
  // [7]  : unit (multiple)
  // [8]  : unit
  // [9]  : fillwords (mostly past)
  // [10] : unimportant

  for (lang in parseTimeObject.regexes) {
    // if regexes is builded
    if (parseTimeObject.regexes[lang] !== undefined) {
      re = new RegExp(parseTimeObject.regexes[lang]);
      encoded = re.exec(string);
      timedif = 0;
      // if regex matches
      if (encoded !== null) {
        // if unit matches
        if (encoded[8] !== undefined) {
          integer = (isNaN(parseInt(encoded[5], 10))) ? parseTimeObject.words[lang].numbers[encoded[5]] : parseInt(encoded[5], 10);
          unit = parseTimeObject.words[lang].unit[encoded[8].toLowerCase()];
          timedif = integer * unit;
          // if fillwords can be found in match-array
          if (encoded.indexOf(Object.keys(parseTimeObject.words[lang].fillwords)[0]) !== -1) {
            dateO.parsed = -timedif;
            return {
              'absolute': (now - timedif),
              'relative': dateO.parsed,
              'mode': 'relative',
              'pb': 8
            };
          }
          return {
            'absolute': (now + timedif),
            'relative': timedif,
            'mode': 'relative',
            'pb': 9
          };
        }
      }
    }
  }
  ddmmyyyy.match = /(\d\d?)[,\.](\d\d?)[,\.](\d\d(\d\d)?)/.exec(string);
  if (ddmmyyyy.match !== null) {
    ddmmyyyy.day = ddmmyyyy.match[1];
    ddmmyyyy.month = ddmmyyyy.match[2];
    ddmmyyyy.year = ddmmyyyy.match[3];
    pbint = 10;
  } else {
    ddmmyyyy.match = /(\d\d(\d\d)?)[\/\-](\d\d?)[\/\-](\d\d?)/.exec(string);
    if (ddmmyyyy.match !== null) {
      ddmmyyyy.day = ddmmyyyy.match[4];
      ddmmyyyy.month = ddmmyyyy.match[3];
      ddmmyyyy.year = ddmmyyyy.match[1];
      pbint = 11;
    }
  }
  if (ddmmyyyy.day !== undefined) {
    ddmmyyyy.day = ddmmyyyy.day.length === 1 ? '0' + ddmmyyyy.day : ddmmyyyy.day;
    ddmmyyyy.month = ddmmyyyy.month.length === 1 ? '0' + ddmmyyyy.month : ddmmyyyy.month;
    ddmmyyyy.year = ddmmyyyy.year.length === 2 ? parseInt(ddmmyyyy.year, 10) > 70 ? '19' + ddmmyyyy.year : '20' + ddmmyyyy.year : ddmmyyyy.year;
    dateO.today = ddmmyyyy.year + '-' + ddmmyyyy.month + '-' + ddmmyyyy.day;
    dateO.string = dateO.today + 'T12:00:00+00:00';
    dateO.parsed = new Date();
    dateO.parsed = Date.parse(dateO.string);
    return {
      'absolute': dateO.parsed,
      'relative': dateO.parsed - now,
      'mode': 'absolute',
      'pb': pbint
    };
  }

  return {
    'absolute': false,
    'relative': false,
    'mode': 'error',
    'pb': false
  };
};

(function (root, factory) {
  {
    module.exports = factory();
  }
}(commonjsGlobal, function () {
  return parseTime;
}));


parseTimeObject.words.de = {
  currently: ['jetzt'],
  clockwords: ['uhr'],
  numbers: {
    'null' : 0,
    'ein' : 1,
    'zwei' : 2,
    'drei' : 3,
    'ein paar' : 3.5,
    'einigen' : 3.5,
    'vier' : 4,
    'f%C3%BCnf' : 5,
    'sechs' : 6,
    'sieben' : 7,
    'acht' : 8,
    'neun' : 9,
    'zehn' : 10,
    'elf' : 11,
    'zw%C3%B6lf' : 12,
    'dreizehn' : 13,
    'vierzehn' : 14,
    'f%C3%BCnfzehn' : 15,
    'sechzehn' : 16,
    'siebzehn' : 17,
    'achzehn' : 18,
    'neinzehn' : 19,
    'zwanzig' : 20,
    'dreißig' : 30,
    'vierzig' : 40,
    'f%C3%BCnfzig' : 50,
    'sechzig' : 60,
    'siebzig' : 70,
    'achtzig' : 80,
    'neunzig' : 90,
    'hundert' : 100,
    'tausend' : 1000,
    'million' : 1000000
  },
  countable: {
    'vorgestern' : -17280000,
    'gestern' : -8640000,
    'heute' : 1,
    '%C3%BCbermorgen' : 17280000,
    'morgen' : 8640000,
    'n%C3%A4chste woche' : 60480000,
    'kommende woche' : 60480000,
    'letzte woche' : -60480000,
    'vorherige woche' : -60480000
  },
  daytime: {
    'morgend%C3%A4mmerung': '04:00',
    'tagesanbruch': '04:00',
    'morgen': '06:00',
    'vormittag': '09:00',
    'nachmittag': '15:00',
    'mittag': '12:00',
    'pr%C3%A4abend': '17:00',
    'abend': '19:00',
    'd%C3%A4mmerung': '20:00',
    'mitternacht': '24:00',
    'nacht': '22:00'
  },
  unit: {
    'millisekunde' : 1,
    'sekunde' : 1000,
    'minute' : 60000,
    'stunde' : 3600000,
    'tag' : 8640000,
    'woche' : 604800000,
    'monat' : 2592000000,
    'quartal' : 7776000000,
    'jahr' : 31536000000,
    'dekade' : 315360000000
  },
  fillwords: {
    'vor' : '-',
    'in' : '+'
  },
  fillfoo: {
    '\\-' : '',
    '\\ ' : '',
    'e' : '',
    'en' : '',
    'er' : '',
    'n' : ''
  }
};


parseTimeObject.words.fr = {
  currently: ['maintenant'],
  clockwords: [
    'horloge',
    'heures'
  ],
  numbers: {
    'z%C3%A9ro' : 0,
    'un' : 1,
    'deux' : 2,
    'trois' : 3,
    'peu de' : 3.5,
    'quelques' : 3.5,
    'quatre' : 4,
    'cinq' : 5,
    'six' : 6,
    'sept' : 7,
    'huit' : 8,
    'neuf' : 9,
    'dix' : 10,
    'onze' : 11,
    'douze' : 12,
    'treize' : 13,
    'quatorze' : 14,
    'quinze' : 15,
    'seize' : 16,
    'dix-sept' : 17,
    'dix-huit' : 18,
    'dix-neuf' : 19,
    'vingt' : 20,
    'trente' : 30,
    'quarante' : 40,
    'cinquante' : 50,
    'soixante' : 60,
    'soixante-dix' : 70,
    'quatre-vingt' : 80,
    'quatre-vingt-dix' : 90,
    'cent' : 100,
    'mille' : 1000,
    'million' : 1000000
  },
  unit: {
    'milliseconde' : 1,
    'seconde' : 1000,
    'minute' : 60000,
    'heure' : 3600000,
    'jour' : 86400000,
    'semaine' : 604800000,
    'mois' : 2592000000,
    'trimestre' : 7776000000,
    'an' : 31536000000,
    'd%C3%A9cennie' : 315360000000
  },
  countable: {
    'avant-hier' : -17280000,
    'hier' : -8640000,
    'aujourd\'hui' : 1,
    'ajd' : 1,
    'apr%C3%A8s-demain' : 17280000,
    'demain' : 8640000,
    'dans une semaine' : 60480000,
    'la semaine prochaine' : 60480000,
    'la semaine derni%C3%A8re' : -60480000,
    'la semaine pass%C3%A9e' : -60480000
  },
  month: {
    'jan' : '01',
    'fev' : '02',
    'mar' : '03',
    'avr' : '04',
    'mai' : '05',
    'juin' : '06',
    'juil' : '07',
    'aou' : '08',
    'sep' : '09',
    'oct' : '10',
    'nov' : '11',
    'dec' : '12'
  },
  daytime: {
    'aube': '04:00',
    'matin': '06:00',
    'apr%C3%A8s-midi': '15:00',
    'apr%C3%A8m': '15:00',
    'midi': '12:00',
    'go%C3%BBter': '17:00',
    'quatre-heure': '16:00',
    'd%C3%A9but de soir%C3%A9e': '17:00',
    'soir%C3%A9e': '19:00',
    'repas': '20:00',
    'minuit': '24:00',
    'nuit': '22:00'
  },
  fillwords: {
    'il y a' : '-',
    'dans' : '+'
  },
  fillfoo: {
    's' : '',
    '\\-' : '',
    '\\ ' : '',
    '\\.' : ''
  }
};


parseTimeObject.words.pt = {
  currently : ['agora'],
  clockwords: ['relógio'],
  numbers: {
    'zero' : 0,
    'e meio' : 0.5,
    'um' : 1,
    'dois' : 2,
    'tr%C3%AAs' : 3,
    'poucos' : 3.5,
    'alguns' : 3.5,
    'quatro' : 4,
    'cinco' : 5,
    'seis' : 6,
    'sete' : 7,
    'oito' : 8,
    'nove' : 9,
    'dez' : 10,
    'onze' : 11,
    'doze' : 12,
    'treze' : 13,
    'catorze' : 14,
    'quinze' : 15,
    'dezesseis' : 16,
    'dezessete' : 17,
    'dezoito' : 18,
    'dezenove' : 19,
    'vinte' : 20,
    'trinta' : 30,
    'quarenta' : 40,
    'cinquenta' : 50,
    'sessenta' : 60,
    'setenta' : 70,
    'oitenta' : 80,
    'noventa' : 90,
    'cem' : 100,
    'mil' : 1000,
    'milh%C3%A3o' : 1000000
  },
  unit: {
    'milissegundo' : 1,
    'segundo' : 1000,
    'minuto' : 60000,
    'hora' : 3600000,
    'dia' : 86400000,
    'semana' : 604800000,
    'm%C3%AAs' : 2592000000,
    'trimestre' : 7776000000,
    'ano' : 31536000000,
    'd%C3%A9cada' : 315360000000
  },
  countable: {
    'antes de ontem' : -17280000,
    'ontem' : -8640000,
    'hoje' : 1,
    'depois de amanh%C3%A3' : 17280000,
    'amanh%C3%A3' : 8640000,
    'em uma semana' : 60480000,
    '%C3%BAltima semana' : -60480000
  },
  month: {
    'jan'   : '01',
    'fev'   : '02',
    'mar'   : '03',
    'abril' : '04',
    'mai'   : '05',
    'jun'   : '06',
    'jul'   : '07',
    'ago'   : '08',
    'set'   : '09',
    'out'   : '10',
    'nov'   : '11',
    'dez'   : '12'
  },
  daytime: {
    'madrugada': '04:00',
    'manh%C3%A3': '06:00',
    'tarde': '15:00',
    'meio-dia': '12:00',
    'pr%C3%A9-noite': '17:00',
    'crep%C3%BAsculo': '20:00',
    'meia-noite': '24:00',
    'noite': '22:00'
  },
  fillwords: {
    'atr%C3%A1s' : '-',
    'em' : '+'
  },
  fillfoo: {
    's' : '',
    '\\-' : '',
    '\\ ' : '',
    '\\.' : ''
  }
};
});

//
var month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function rd_getDOY(now) {
  var start = new Date(now.getFullYear(), 0, 0);
  var diff = now - start + (start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000;
  var oneDay = 1000 * 60 * 60 * 24;
  var day = Math.floor(diff / oneDay);
  return day;
}

function rd_fmt(date) {
  var day = date.getDate();
  var month_index = date.getMonth();
  var year = date.getFullYear();
  return "" + day + " " + month_names[month_index] + " " + year;
}

function rd_fmttime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var amPm = 'AM';

  if (hours > 11) {
    amPm = 'PM';
  }

  if (hours === 0) {
    hours = 12;
  }

  if (hours > 12) {
    hours = hours - 12;
  }

  if (minutes < 10) {
    minutes = '0' + minutes;
  }

  return hours + ':' + minutes + ' ' + amPm;
}

var script = {
  // COMPONENT
  // ______________________________________
  name: 'RangeDatePicker',
  props: {
    type: {
      type: String,
      required: true,
      validator: function validator(value) {
        // The value must match one of these strings
        return ['date', 'datetime', 'rangedate'].indexOf(value) !== -1;
      }
    },
    cssPrefix: {
      type: String,
      "default": ''
    },
    startDate: Date,
    endDate: Date,
    from: Date,
    to: Date,
    isRange: Boolean
  },
  components: {},
  computed: {
    isRangePicker: function isRangePicker() {
      return this.type.indexOf('range') >= 0;
    },
    fmttedRangeDate: function fmttedRangeDate() {
      var fmt = '';

      if (this.innerFrom) {
        fmt += rd_fmt(this.innerFrom);
      }

      if (this.innerTo) {
        fmt += ' - ' + rd_fmt(this.innerTo);
      }

      return fmt;
    },
    selectedDate: function selectedDate() {
      return new Date(this.selectedYear, this.selectedMonth, 1);
    },
    selectedDateDayOfYear: function selectedDateDayOfYear() {
      return rd_getDOY(this.selectedDate);
    },
    yearRange: function yearRange() {
      var start = new Date().getFullYear();
      var end = new Date(new Date().getFullYear() + 10);

      if (this.startDate) {
        start = new Date(this.startDate);
      }

      if (this.endDate) {
        end = new Date(this.endDate);
      }

      var years = [];

      while (start < end) {
        years.push(start);
        start++;
      }

      return years;
    },
    dayRows: function dayRows() {
      // THIS always starts on sunday.. so if your month starts on a monday then sunday will be a 0 array item
      var days = [];
      var i = 0;
      var selectedDay = this.selectedDate.getDay();
      var monthEnd = new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, 0).getDate(); //padd start of month

      while (i < selectedDay && i < 32) {
        days.push(0);
        i++;
      }

      i = 1; // one based cause dates don't start at 0

      while (i <= monthEnd && i < 32) {
        days.push(i);
        i++;
      }

      var dayRows = [];
      var dayRow = [];

      for (var _i = 0; _i < days.length; _i++) {
        if (_i % 7 == 0 && _i !== 0) {
          dayRows.push(dayRow);
          dayRow = [];
        }

        dayRow.push({
          dayNum: days[_i],
          date: new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth(), _i - selectedDay + 1) //+1 for 0 based index with offset of padded days

        });
      } //padd end of month


      var padEnd = 7 - dayRow.length;
      i = 1;

      while (i <= padEnd && i < 32) {
        dayRow.push({
          dayNum: 0,
          date: new Date(this.selectedDate.getFullYear(), this.selectedDate.getMonth() + 1, i)
        });
        i++;
      }

      dayRows.push(dayRow);
      return dayRows;
    },
    pfx: function pfx() {
      return this.cssPrefix;
    },
    hasFrom: function hasFrom() {
      return this.innerFrom !== null;
    },
    hasTo: function hasTo() {
      return this.innerTo !== null;
    }
  },
  methods: {
    parseDate: function parseDate(ev) {
      var val = ev.target.value;
      var parsed = parseTime_1(val);

      if (parsed.absolute) {
        this.setFrom(new Date(parsed.absolute));
      }

      if (val.indexOf('-') > 0) {
        var toVal = val.split('-');

        if (toVal.length > 0) {
          val = toVal[1];
        }

        var _parsed = parseTime_1(val);

        if (_parsed.absolute) {
          this.setTo(new Date(_parsed.absolute));
        }
      }

      this.closePicker();
    },
    dateClicked: function dateClicked(day) {
      this.hoverDate = null;

      if (this.isRangePicker) {
        if (this.hasTo) {
          this.setFrom(day.date);
          this.setTo(null);
          return;
        }

        if (this.hasFrom && this.innerFrom.getTime() < day.date.getTime()) {
          this.setTo(day.date);
          this.isPickerActive = false;
          this.$emit('input', {
            from: this.innerFrom,
            to: this.innerTo
          });
          return;
        }
      }

      this.setFrom(day.date);

      if (this.isRangePicker) {
        this.$emit('input', {
          from: this.innerFrom,
          to: this.innerTo
        });
      } else {
        this.$emit('input', this.innerFrom);

        if (this.type !== 'datetime') {
          this.isPickerActive = false;
        }
      }
    },
    updateStartDate: function updateStartDate(day) {
      this.startDate = day.date;
    },
    updateHoverDate: function updateHoverDate(day) {
      if (!this.isRangePicker) {
        return;
      }

      if (this.innerFrom !== null && this.innerTo === null) {
        this.hoverDate = day.date;
      }
    },
    closePicker: function closePicker() {
      this.isPickerActive = false;
    },
    togglePicker: function togglePicker() {
      this.isPickerActive = !this.isPickerActive;
    },
    setFrom: function setFrom(val) {
      this.innerFrom = val;

      if (this.type === 'datetime') {
        this.setTimeOnFrom();
      }

      this.$emit('from-changed', this.innerFrom);
      this.formatField();
    },
    setTimeOnFrom: function setTimeOnFrom() {
      var dt = this.innerFrom ? new Date(this.innerFrom) : new Date();
      var hours = this.selectedHour;

      if (this.selectedAMPM === 0 && hours === 12) {
        hours = 0;
      } else if (this.selectedAMPM === 12 && hours < 12) {
        hours = this.selectedHour + this.selectedAMPM;
      }

      dt.setHours(hours);
      dt.setMinutes(this.selectedMinute);
      this.innerFrom = dt;
    },
    setTo: function setTo(val) {
      this.innerTo = val;
      this.$emit('to-changed', this.innerTo);
      this.formatField();
    },
    formatField: function formatField() {
      var result = '';

      if (this.innerFrom) {
        result = rd_fmt(this.innerFrom);

        if (this.type.indexOf('time') > -1) {
          result += ' ' + rd_fmttime(this.innerFrom);
        }
      }

      if (this.isRangePicker) {
        result += ' - ';
      }

      if (this.innerTo) {
        result += rd_fmt(this.innerTo);

        if (this.type.indexOf('time') > -1) {
          result += ' ' + rd_fmttime(this.innerTo);
        }
      }

      this.$refs.inp.value = result;
    }
  },
  watch: {},
  data: function data() {
    return {
      selectedMonth: new Date().getMonth(),
      selectedYear: new Date().getFullYear(),
      selectedHour: 1,
      selectedMinute: 0,
      selectedAMPM: 0,
      start: null,
      hoverDate: null,
      isPickerActive: false,
      innerFrom: null,
      innerTo: null
    };
  },
  // LIFECYCLE METHODS
  // ______________________________________
  beforeCreate: function beforeCreate() {},
  created: function created() {
    if (Object.hasOwnProperty(this.value, 'to')) {
      this.innerFrom = this.value.from;
      this.innerTo = this.value.to;
    }

    if (this.from || this.value) {
      this.innerFrom = this.from || this.value;
    }

    if (this.to) {
      this.innerTo = this.to;
    }
  },
  beforeMount: function beforeMount() {},
  mounted: function mounted() {},
  beforeUpdate: function beforeUpdate() {},
  updated: function updated() {},
  beforeDestroy: function beforeDestroy() {},
  destroyed: function destroyed() {}
};

function styleInject(css, ref) {
  if ( ref === void 0 ) ref = {};
  var insertAt = ref.insertAt;

  if (!css || typeof document === 'undefined') { return; }

  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';

  if (insertAt === 'top') {
    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else {
    head.appendChild(style);
  }

  if (style.styleSheet) {
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
}

var css = ".dp-range-date .dp-click-overlay{position:fixed;background:rgba(0,0,0,.2);top:0;left:0;bottom:0;right:0;z-index:1}.dp-range-date{position:relative;width:100%}.dp-range-date .dp-input{position:relative;width:100%}.dp-range-date .dp-picker{background:#fff;position:absolute;margin-top:.5rem;margin-left:.5rem;padding:.5rem;z-index:2}.dp-range-date .dp-month-year{display:flex}.dp-range-date .dp-month-year .dp-month-year-spacer{display:block;width:.5rem}.dp-range-date .dp-days .dp-day-row{display:flex;flex-direction:row;justify-content:space-between}.dp-range-date .dp-days .dp-day-row .dp-day{cursor:pointer;width:14.25%;text-align:center;padding:.25rem .5rem;margin-left:-1px}.dp-range-date .dp-days .dp-day-row .dp-day.is-diff-month{color:grey}.dp-range-date .dp-days .dp-day-row .dp-day.is-hovered,.dp-range-date .dp-days .dp-day-row .dp-day:hover{background:red}.dp-range-date .dp-days .dp-day-row .dp-day.is-active-one{background:purple}.dp-range-date .dp-days .dp-day-row .dp-day.is-active-two{background:orange}.dp-range-date .dp-days .dp-day-row .dp-day.is-active-between{background:#ff0}.dp-range-date .dp-days .dp-day-row .dp-day.dp-day-text{font-size:.7rem;color:grey;text-transform:uppercase;background:#fff!important}";
styleInject(css);

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

/* script */
var __vue_script__ = script;
/* template */

var __vue_render__ = function __vue_render__() {
  var _vm = this;

  var _h = _vm.$createElement;

  var _c = _vm._self._c || _h;

  return _c('div', {
    staticClass: "dp-range-date override",
    "class": {
      'is-range': _vm.isRangePicker
    }
  }, [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.isPickerActive,
      expression: "isPickerActive"
    }],
    staticClass: "dp-click-overlay",
    on: {
      "click": _vm.closePicker
    }
  }), _vm._v(" "), _c('input', {
    ref: "inp",
    staticClass: "dp-input",
    on: {
      "blur": _vm.parseDate
    }
  }), _vm._v(" "), _vm._t("buttons", [_c('button', {
    staticClass: "dp-open-button button is-primary",
    on: {
      "click": _vm.togglePicker
    }
  }, [_c('i', {
    staticClass: "far fa-calendar"
  })])]), _vm._v(" "), _c('transition', [_c('div', {
    directives: [{
      name: "show",
      rawName: "v-show",
      value: _vm.isPickerActive,
      expression: "isPickerActive"
    }],
    staticClass: "dp-picker"
  }, [_c('div', {
    staticClass: "dp-month-year field has-addons"
  }, [_c('div', {
    staticClass: "control"
  }, [_c('div', {
    staticClass: "select is-medium"
  }, [_c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.selectedMonth,
      expression: "selectedMonth"
    }],
    on: {
      "change": function change($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function (o) {
          return o.selected;
        }).map(function (o) {
          var val = "_value" in o ? o._value : o.value;
          return val;
        });
        _vm.selectedMonth = $event.target.multiple ? $$selectedVal : $$selectedVal[0];
      }
    }
  }, [_c('option', {
    domProps: {
      "value": 0
    }
  }, [_vm._v("Jan")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 1
    }
  }, [_vm._v("Feb")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 2
    }
  }, [_vm._v("Mar")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 3
    }
  }, [_vm._v("Apr")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 4
    }
  }, [_vm._v("May")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 5
    }
  }, [_vm._v("Jun")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 6
    }
  }, [_vm._v("Jul")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 7
    }
  }, [_vm._v("Aug")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 8
    }
  }, [_vm._v("Sept")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 9
    }
  }, [_vm._v("Oct")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 10
    }
  }, [_vm._v("Nov")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 11
    }
  }, [_vm._v("Dec")])])])]), _vm._v(" "), _c('div', {
    staticClass: "control"
  }, [_c('div', {
    staticClass: "select is-medium"
  }, [_c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.selectedYear,
      expression: "selectedYear"
    }],
    on: {
      "change": function change($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function (o) {
          return o.selected;
        }).map(function (o) {
          var val = "_value" in o ? o._value : o.value;
          return val;
        });
        _vm.selectedYear = $event.target.multiple ? $$selectedVal : $$selectedVal[0];
      }
    }
  }, _vm._l(_vm.yearRange, function (year, index) {
    return _c('option', {
      key: index,
      domProps: {
        "value": year
      }
    }, [_vm._v(_vm._s(year))]);
  }), 0)])])]), _vm._v(" "), _c('div', {
    staticClass: "dp-days"
  }, [_c('div', {
    staticClass: "dp-day-row dp-day-header"
  }, _vm._l(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], function (dayText, index) {
    return _c('div', {
      key: index,
      staticClass: "dp-day dp-day-text"
    }, [_vm._v("\n            " + _vm._s(dayText) + "\n          ")]);
  }), 0), _vm._v(" "), _vm._l(_vm.dayRows, function (dayrow, index) {
    return _c('div', {
      key: index,
      staticClass: "dp-day-row"
    }, _vm._l(dayrow, function (day, index) {
      return _c('div', {
        key: index,
        staticClass: "dp-day",
        "class": {
          'is-diff-month': day.date.getMonth() !== _vm.selectedMonth,
          'is-hovered': _vm.hoverDate != null && _vm.innerFrom != null && day.date.getTime() > _vm.innerFrom && day.date.getTime() < _vm.hoverDate,
          'is-active-one': _vm.innerFrom != null && day.date.getTime() === _vm.innerFrom.getTime(),
          'is-active-two': _vm.innerTo != null && day.date.getTime() === _vm.innerTo.getTime(),
          'is-active-between': _vm.innerFrom != null && _vm.innerTo != null && day.date.getTime() > _vm.innerFrom && day.date.getTime() < _vm.innerTo
        },
        on: {
          "click": function click($event) {
            return _vm.dateClicked(day);
          },
          "mouseover": function mouseover($event) {
            return _vm.updateHoverDate(day);
          }
        }
      }, [_vm._v("\n            " + _vm._s(day.date.getDate()) + "\n          ")]);
    }), 0);
  })], 2), _vm._v(" "), _vm.type === 'datetime' ? _c('div', {
    staticClass: "dp-month-year field has-addons"
  }, [_c('div', {
    staticClass: "control"
  }, [_c('div', {
    staticClass: "select is-medium"
  }, [_c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.selectedHour,
      expression: "selectedHour"
    }],
    on: {
      "change": [function ($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function (o) {
          return o.selected;
        }).map(function (o) {
          var val = "_value" in o ? o._value : o.value;
          return val;
        });
        _vm.selectedHour = $event.target.multiple ? $$selectedVal : $$selectedVal[0];
      }, _vm.setTimeOnFrom]
    }
  }, [_c('option', {
    domProps: {
      "value": 1
    }
  }, [_vm._v("1")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 2
    }
  }, [_vm._v("2")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 3
    }
  }, [_vm._v("3")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 4
    }
  }, [_vm._v("4")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 5
    }
  }, [_vm._v("5")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 6
    }
  }, [_vm._v("6")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 7
    }
  }, [_vm._v("7")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 8
    }
  }, [_vm._v("8")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 9
    }
  }, [_vm._v("9")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 10
    }
  }, [_vm._v("10")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 11
    }
  }, [_vm._v("11")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 12
    }
  }, [_vm._v("12")])])])]), _vm._v(" "), _c('div', {
    staticClass: "control"
  }, [_c('div', {
    staticClass: "select is-medium"
  }, [_c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.selectedMinute,
      expression: "selectedMinute"
    }],
    on: {
      "change": [function ($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function (o) {
          return o.selected;
        }).map(function (o) {
          var val = "_value" in o ? o._value : o.value;
          return val;
        });
        _vm.selectedMinute = $event.target.multiple ? $$selectedVal : $$selectedVal[0];
      }, _vm.setTimeOnFrom]
    }
  }, [_c('option', {
    domProps: {
      "value": 0
    }
  }, [_vm._v("00")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 15
    }
  }, [_vm._v("15")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 30
    }
  }, [_vm._v("30")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 45
    }
  }, [_vm._v("45")])])])]), _vm._v(" "), _c('div', {
    staticClass: "control"
  }, [_c('div', {
    staticClass: "select is-medium"
  }, [_c('select', {
    directives: [{
      name: "model",
      rawName: "v-model",
      value: _vm.selectedAMPM,
      expression: "selectedAMPM"
    }],
    on: {
      "change": [function ($event) {
        var $$selectedVal = Array.prototype.filter.call($event.target.options, function (o) {
          return o.selected;
        }).map(function (o) {
          var val = "_value" in o ? o._value : o.value;
          return val;
        });
        _vm.selectedAMPM = $event.target.multiple ? $$selectedVal : $$selectedVal[0];
      }, _vm.setTimeOnFrom]
    }
  }, [_c('option', {
    domProps: {
      "value": 0
    }
  }, [_vm._v("AM")]), _vm._v(" "), _c('option', {
    domProps: {
      "value": 12
    }
  }, [_vm._v("PM")])])])]), _vm._v(" "), _c('div', {
    staticClass: "control"
  }, [_c('button', {
    staticClass: "button is-success"
  }, [_vm._v("Set")])])]) : _vm._e()])])], 2);
};

var __vue_staticRenderFns__ = [];
/* style */

var __vue_inject_styles__ = undefined;
/* scoped */

var __vue_scope_id__ = undefined;
/* module identifier */

var __vue_module_identifier__ = undefined;
/* functional template */

var __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

var __vue_component__ = normalizeComponent({
  render: __vue_render__,
  staticRenderFns: __vue_staticRenderFns__
}, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

var index = {
  install: function install(Vue, options) {
    // Let's register our component globally
    // https://vuejs.org/v2/guide/components-registration.html
    Vue.component("range-date-picker", __vue_component__);
  }
};

module.exports = index;
