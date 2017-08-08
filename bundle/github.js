const term = require('terminal-kit').terminal;
const GitHubApi   = require('github')
const CLI = require('clui')
const Spinner = CLI.Spinner;

const memory = {};

const PS = `\n>>> Github`;

function requireUsernameAndPassword(callback) {
    const account = {
        username: undefined,
        password: undefined
    };
    const handleError = function(error, cb) {
        term.red(`${PS} ! error `) 
        console.error(error)
        cb(account)
    }
    term(`${PS} username: `);
    term.inputField({}, function(error, input) {
        if (error) {
            handleError(error, callback);
        }
        account.username = input;

        term(`${PS} password: `);
        term.inputField({}, function(error, input) {
            if (error) {
                handleError(error, callback);
            }
            account.password = input;
            return callback(account)
        })
    })
}

function auth(config) {
    const github = new GitHubApi({
        version: '3.0.0'
    });

    const token = config.get('token');
    if (token) {
        github.authenticate({
            type: 'oauth',
            token: token
        })
        return github;
    } 
    term.red(`${PS} you need to authenticate first`);
    return undefined
}

function handleError() {
    term.red(`${PS} ! error `)
}

function displayRepository(repo) {
    term(`\nName: ${repo.full_name}\n`);
    term(`Watchers: ${repo.watchers}, Forks: ${repo.forks} \n`)
    term(`Description: ${repo.description} \n`);
    term.cyan(`${repo.clone_url}\n`);
}

const interface = {
    authenticate: function(params, next, app) {
        if (app.config.get('token')) {
            term.yellow(`${PS} You already have a token`);
            return next();
        }
        requireUsernameAndPassword((account) => {
            const status = new Spinner(`Authenticating you, please wait...`);
            status.start();

            const github = new GitHubApi({
                version: '3.0.0'
            });
            
            try {
                github.authenticate(
                    Object.assign({ type: 'basic' }, account)
                );

                github.authorization.create(
                    {
                        scope: ['user', 'public_repo', 'repo', 'repo:status'],
                        note: 'devboy, github bundle tool'
                    }, 
                    function (error, response) {
                        status.stop();
    
                        if (error) {
                            term.red(`${PS} ! error `);
                            console.error(error);
                            return next();
                        }
                        if (response.data) {
                            app.config.set('token', response.data.token);
                            app.config.set('response', response.data);
                        }
                        return next()
                    }
                )
    
            } catch(e) {
                status.stop();
                term.red(`${PS} ! catch error `)
                console.error(e);
                next();
            }
        })
    },

    logout: function(params, next, app) {
        term.red(`${PS} logouting ...`)
        app.config.delete('token');
        app.config.delete('response');
        next();
    },

    repository: function(params, next, app) {
        const g = auth(app.config)
        if (g) {
            const status = new Spinner(`requesting repositories...`);
            status.start()

            const displayMenu = (data) => {
                term.yellow(`${PS} you got ${data.length} repositories \n`);
                term.gridMenu(data.map((r) => r.name), (error, selection) => {
                    if (error) {
                        handleError();
                        console.error(error);
                        return next();
                    }

                    displayRepository(data[selection.selectedIndex]);
                    next();
                })

            }

            if (memory['getAll']) {
                status.stop();
                displayMenu(memory['getAll'])
            } else {
                g.repos.getAll({
                    affiliation: 'owner'
                }, function(error, response) {
                    status.stop();
                    if (error) {
                        handleError()
                        console.error(error)
                        return next();
                    }
                    memory['getAll'] = response.data;
                    displayMenu(response.data)
                })
            }


        } else {
            next()
        }
    }
}


module.exports = {
  name: 'github',
  commands: [
    'authenticate',
    'repository',
    'logout'
  ],
  parser: function(command, params, next, app) {
    switch (command.join(' ')) {
        case 'authenticate':
            return interface.authenticate(params, next, app)
        case 'repository':
            return interface.repository(params, next, app)
        case 'logout':
            return interface.logout(params, next, app);
        default:
            term(`${PS} Unknwon command: ${command}`)
            return next();
    }
  }
}
