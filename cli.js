#!/usr/bin/env node --harmony
'use strict'

/**
 * IMPORTS
 */
const pkg = require('./package.json');
const term = require('terminal-kit').terminal;
const parser = require('yargs-parser')
const Configstore = require('configstore')

/**
 * Helper functions 
 */
function isFunction(obj) {
  return !!(obj && obj.constructor && obj.call && obj.apply);
};

/*
 * List of bundles to include 
 */
const bundles = ['string', 'github', 'store'];

/*
 * Variables 
 */
const autoComplete = [];
const commands = {};
const conf = new Configstore(pkg.name, {});

/* always update version */
conf.set('version', pkg.version);
/* create bundle keystore */
if (!conf.has('bundles')) {
  conf.set('bundles', {});
}

/**
 * Load all bundles
 */
bundles.forEach((bundle) => {
  const b = require(`./bundle/${bundle}`);
  (b.commands || []).forEach((command) => {
    autoComplete.push(`${b.name} ${command}`);
    commands[b.name] = b.parser;
  })
})

function cwd(p) {
  var path = require('path');
  term.cwd('file://' + path.resolve(process.cwd()));
}

function commandContext(name) {
  const confPath = `bundles.${name}`
  if (!conf.has(confPath)) {
    conf.set(confPath, {});
  }
  const app = {
    config: {
      get: function(key) {
        return conf.get(`${confPath}.${key}`)
      },
      set: function(key, value) {
        return conf.set(`${confPath}.${key}`, value)
      },
      delete: function(key) {
        return conf.delete(`${confPath}.${key}`);
      },
      all: function() { return conf.get(confPath) }
    }
  };
  return app;
}

/**
 * REPL loop
 */
function loop() {
 

  term("\n> ");
  term.inputField(
    {
      autoComplete: autoComplete ,
      autoCompleteHint: true ,
      autoCompleteMenu: true ,
    },
    function( error , input ) {
      const argv = parser(input);
      const bundle = argv['_'].shift();
      const command = argv['_'];
      delete argv['_'];
      const params = argv;
      const executable = commands[bundle];
      if (isFunction(executable)) {
        
        executable(command, params, loop, commandContext(bundle));
      } else {
        loop();
      }
    }
  );
}

/**
 * Handlers
 */
term.on('key', function(key) {
	if (key === 'CTRL_C') {
		term.green('CTRL-C detected...\n') ;
		terminate() ;
	}
}) ;

function terminate() {
	term.grabInput( false ) ;
  // Add a 100ms delay, so the terminal will be ready when the process effectively
  // exit, preventing bad escape sequences drop
	setTimeout(function() { process.exit(); }, 100);
}

/* START */
loop();