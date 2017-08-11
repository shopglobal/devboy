const term = require('terminal-kit').terminal;
const figlet = require('figlet');
const path = require('path');

Array.prototype.chunk = function(x) {
    if (!this.length) {
        return [];
    }
    return [this.slice(0, x)].concat(this.slice(x).chunk(x));
}

/*
 *  Question format
 *  {
 *   name: string,
 *   description: string,
 *   password: boolean,
 *  }
 */

function createQuestion(props, errorCallback, successCallback) {
  term.cyan(`\n${props.description}: `)
  term.inputField({ echo: !props.password }, function(error, output) {
    if (error) {
      return errorCallback(error)
    }
    successCallback(output)
  })
}

function chainQuestions(questions, error, result, callback) {
  if (questions.length > 0 && Object.keys(error).length === 0) {
    let question = questions.shift();
    createQuestion(
      question,
      (e) => {
        return error[question.name] = e;
      },
      (input) => {
        if (input) {
          result[question.name] = input
        } else if(input === '' || input === undefined) {
          error[question.name] = undefined;
        }
        chainQuestions(questions, error, result, callback)
      }
    )
  } else {
    return callback(
      {
        data: result,
        error: Object.keys(error).length > 0 ? error : undefined
      }
    )
  }
}

function longList(chunks, page, selected) {
  const pagging = `Show next ${page} of ${chunks.length}`;
  term.singleColumnMenu(
    chunks[page].concat(pagging),
    { extraLines: 0 },
    function(error, response) {
      if (response.selectedIndex === chunks[page].length) {
        longList(chunks, page + 1, selected)
      } else {
        selected(chunks[page][response.selectedIndex])
      }
    }
  )
}

module.exports = {
  wizzard: function(questions, callback) {
    chainQuestions(questions, {}, {}, callback)
  },
  pagedList: function(rows, pageNum, selection) {
    let pages = rows.chunk(pageNum);
    let currentPage = 0;
    longList(pages, currentPage, selection)
  },
  banner: function(text, color = 'cyan') {
    term[color](figlet.textSync(text, { horizontalLayout: 'full'} ));
  },
  baseDirectory: function() {
    return path.basename(process.cwd());
  }
}
