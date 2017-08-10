const term = require('terminal-kit').terminal;
const SimpleGit = require('simple-git');
const Spinner = require('clui').Spinner

const PS = `\n>>> Git`;

function isGitExist(path) {

}

function gitStatus(response) {
    term.yellow(`${PS} Status for ${response.current}, ahead/behind ${response.ahead}/${response.behind} from ${response.tracking}\n`)
    const filters = [
        { t: 'modified', c: 'yellow', p: 'M' },
        { t: 'created', c: 'green', p: 'A' },
        { t: 'conflicted', c: 'pink', p: '!' },
        { t: 'deleted', c: 'red', p: 'D' },
        { t: 'not_added', c: 'cyan', p: '?'}
    ].forEach((filter) => {
        response[filter.t].forEach((file) => {
            term[filter.c](`\n${filter.p} ${file}`)
        })
    })
}

const interface = {
    init: function(params, next, app) {
        const status = new Spinner('Setting up the repository');
        status.start();
        const git = SimpleGit(app.cwd);
        git
            .init()
            .add('./*')
            .commit('[INIT]')
            .exec(function (eror, response) {
                status.stop()
                term.cyan(`${PS} init\n`)
                next();
            })
    },
    sync: function(params, next, app) {
        const status = new Spinner('Syncing repository');
        status.start();
        const git = SimpleGit(app.cwd);
        // If status is clear 
        // Pull from current branch 
        // Push to current branch

        status.stop();
        next();
    },
    status: function(params, next, app) {
        const status = new Spinner('Fetching status');
        const git = SimpleGit(app.cwd);
        status.start();
        git.status((error, response) => {
            status.stop();
            gitStatus(response);
            next();
        })
    }
}

module.exports = {
    name: 'git',
    commands: ['init', 'sync', 'status'],
    parser: function(command, params, next, app) {
        switch(command.join(' ')) {
            case 'init':
                return interface.init(params, next, app);
            case 'sync':
                return interface.sync(params, next, app);
            case 'status':
                return interface.status(params, next, app);
            default:
                term(`${PS} Unknown command: ${command}`)
                return next();
        }
    }
}