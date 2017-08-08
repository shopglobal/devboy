const term = require('terminal-kit').terminal;
const Configstore = require('configstore');
const pkg = require('./../package.json')

const conf = new Configstore(pkg.name, {});

const PS = `\n>>> Store`

const store = {
  all: function(params, next) {
    term.yellow(`${PS} select element`); 

    const listItems = function(list, cb) {
      term.gridMenu(list, function(error, response) {
        if (!error) {
          return cb(response.selectedText)
        }
      })
    }

    const ask = function(yes, no) {
      term.yellow(`${PS} do you want to continue [Y|n]\n`)
      term.yesOrNo({ 
        yes: [ 'y' , 'ENTER' ], 
        no: [ 'n' ] 
      }, function( error , result ) {
        return result ? yes(): no();
      })
    }

    const items = Object.keys(conf.get('bundles'));

    listItems(items, (selection) => {
      console.log(conf.get(selection))
      ask(
        () => { next() },
        () => { next() }
      )
    })

  }
}

module.exports = {
  name: 'store',
  commands: [
    'all',
    'get',
    'set',
    'delete'
  ],
  parser: function(command, params, next, app) {
    switch (command.join(' ')) {
      case 'all':
        return store.all(params, next)
      default:
        term.red(`${PS} Unknown command: ${command}`)
        return next()
    }
  }
}
