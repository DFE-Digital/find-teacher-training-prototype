Number.prototype.formatMoney = function(c, d, t){
var n = this,
    c = isNaN(c = Math.abs(c)) ? 2 : c,
    d = d == undefined ? "." : d,
    t = t == undefined ? "," : t,
    s = n < 0 ? "-" : "",
    i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
    j = (j = i.length) > 3 ? j % 3 : 0;
   return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
 };

module.exports = function (env) {
  /**
   * Instantiate object used to store the methods registered as a
   * 'filter' (of the same name) within nunjucks. You can override
   * gov.uk core filters by creating filter methods of the same name.
   * @type {Object}
   */
  var filters = {}

  /* ------------------------------------------------------------------
    add your methods to the filters obj below this comment block:
    @example:

    filters.sayHi = function(name) {
        return 'Hi ' + name + '!'
    }

    Which in your templates would be used as:

    {{ 'Paul' | sayHi }} => 'Hi Paul'

    Notice the first argument of your filters method is whatever
    gets 'piped' via '|' to the filter.

    Filters can take additional arguments, for example:

    filters.sayHi = function(name,tone) {
      return (tone == 'formal' ? 'Greetings' : 'Hi') + ' ' + name + '!'
    }

    Which would be used like this:

    {{ 'Joel' | sayHi('formal') }} => 'Greetings Joel!'
    {{ 'Gemma' | sayHi }} => 'Hi Gemma!'

    For more on filters and how to write them see the Nunjucks
    documentation.

  ------------------------------------------------------------------ */

  var data = [
    {
      "Subject": "Mathematics",
      "PhD": 20000,
      "first": 20000,
      "Masters": 20000,
      "twoone": 20000,
      "twotwo": 20000
    },
    {
      "Subject": "Primary (general with mathematics)",
      "PhD": 6000,
      "first": 6000,
      "Masters": 6000,
      "twoone": 6000,
      "twotwo": 6000
    },
    {
      "Subject": "Primary mathematics specialist",
      "PhD": 6000,
      "first": 6000,
      "Masters": 6000,
      "twoone": 6000,
      "twotwo": 6000
    },
    {
      "Subject": "Physics",
      "PhD": 26000,
      "first": 26000,
      "Masters": 26000,
      "twoone": 26000,
      "twotwo": 26000
    },
    {
      "Subject": "Physics with mathematics",
      "PhD": 26000,
      "first": 26000,
      "Masters": 26000,
      "twoone": 26000,
      "twotwo": 26000
    },
    {
      "Subject": "Chemistry",
      "PhD": 26000,
      "first": 26000,
      "Masters": 26000,
      "twoone": 26000,
      "twotwo": 26000
    },
    {
      "Subject": "Computing",
      "PhD": 26000,
      "first": 26000,
      "Masters": 26000,
      "twoone": 26000,
      "twotwo": 26000
    },
    {
      "Subject": "Geography",
      "PhD": 26000,
      "first": 26000,
      "Masters": 26000,
      "twoone": 26000,
      "twotwo": 26000
    },
    {
      "Subject": "Biology",
      "PhD": 26000,
      "first": 26000,
      "Masters": 26000,
      "twoone": 26000,
      "twotwo": 26000
    },
    {
      "Subject": "Classics",
      "PhD": 26000,
      "first": 26000,
      "Masters": 26000,
      "twoone": 26000,
      "twotwo": 26000
    },
    {
      "Subject": "English",
      "PhD": 15000,
      "first": 15000,
      "Masters": 15000,
      "twoone": 15000,
      "twotwo": 15000
    },
    {
      "Subject": "Design and technology",
      "PhD": 12000,
      "first": 12000,
      "Masters": 9000,
      "twoone": 9000,
      "twotwo": 0
    },
    {
      "Subject": "History",
      "PhD": 9000,
      "first": 9000,
      "Masters": 4000,
      "twoone": 4000,
      "twotwo": 0
    },
    {
      "Subject": "Music",
      "PhD": 9000,
      "first": 9000,
      "Masters": 4000,
      "twoone": 4000,
      "twotwo": 0
    },
    {
      "Subject": "Religious education",
      "PhD": 9000,
      "first": 9000,
      "Masters": 4000,
      "twoone": 4000,
      "twotwo": 0
    },
    {
      "Subject": "Primary mathematics",
      "PhD": 6000,
      "first": 6000,
      "Masters": 6000,
      "twoone": 6000,
      "twotwo": 6000
    },
    {
      "Subject": "Modern foreign languages",
      "PhD": 26000,
      "first": 26000,
      "Masters": 26000,
      "twoone": 26000,
      "twotwo": 26000
    },
  ];

  filters.bursaryCost = function(subject, degree) {
      function matchesSubject(element) {
        return element["Subject"] == subject;
      };
      matchingSubject = data.find(matchesSubject);
      if (matchingSubject && matchingSubject[degree]) {
        return " £" + (matchingSubject[degree]).formatMoney(0)
      } else {
        return ''
      }
  }

  /* ------------------------------------------------------------------
    keep the following line to return your filters to the app
  ------------------------------------------------------------------ */
  return filters
}
