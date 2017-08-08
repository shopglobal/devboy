const term = require('terminal-kit').terminal;

const string = {
  revert: function(input, next) {
    term("\nrevert string > ");
    term.inputField({}, function(error, input) {
      const result = input.split('').reverse().join('');
      term(`\n>>> ${result}`)
      next();
    })
  }
}

module.exports = {
  name: 'string',
  commands: [
    'revert'
  ],
  parser: function(command, params, next, app) {
   // console.log('command' , command, params);
    switch (command.join(' ')) {
      case 'revert':
        return string.revert(params, next)
    }
  }
}
