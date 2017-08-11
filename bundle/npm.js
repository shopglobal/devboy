const term = require('terminal-kit').terminal;
const Spinner = require('clui').Spinner
const npmKeyword = require('npm-keyword');

const UI = require('../libs/ui/form')

const PS = `\n>>> Bundle`;

const interface = {
    install: function(params, next, app) {
      term.red(`${PS} not ready yet.`)
      next();
    },
    search: function(params, next, app) {
      const status = new Spinner('Loading bundles');
      status.start();

      npmKeyword('devboy').then(packages => {
        status.stop();
        if (packages.length === 0) {
          term.yellow(`${PS} nothing found...`)
          return next();
        }
        const list = packages.map((p) => {
          return ` ✒︎ ${p.name} - ${p.description}`
        });

        UI.pagedList(list, 15, (selection) => {
          console.log('Now use it ', selection)
          next();
        })

      });
    }
}

module.exports = {
    name: 'bundle',
    commands: ['install', 'search'],
    parser: function(command, params, next, app) {
        switch(command.join(' ')) {
            case 'install':
                return interface.install(params, next, app);
            case 'search':
                return interface.search(params, next, app);
            default:
                term(`${PS} Unknown command: ${command}`)
                return next();
        }
    }
}
