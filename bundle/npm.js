const term = require('terminal-kit').terminal;
const Spinner = require('clui').Spinner
const npmKeyword = require('npm-keyword');

const PS = `\n>>> Bundle`;

function listPackage(pkg) {
}

Array.prototype.chunk = function(x) {
    if (!this.length) {
        return [];
    }
    return [this.slice(0, x)].concat(this.slice(x).chunk(x));
}

const interface = {
    install: function(params, next, app) {
        next();
    },
    search: function(params, next, app) {
        const status = new Spinner('Loading bundles');
        status.start();
        const currentPage = 0;
        npmKeyword('gulpplugin').then(packages => {
            status.stop();
            const list = packages.map((p) => {
                return `${p.name} - ${p.description}`
            }).chunk(5);
            term.singleColumnMenu(
              list[currentPage],
              function(error, response) {
                if (response) {
                  console.log('sl',response)
                }
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
