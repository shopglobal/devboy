#!/usr/bin/env node --harmony

"use strict";

const inquirer = require('inquirer');
const banner = require('./libs/banner');

banner.intro();

const tasks = [
  'github',
]

const query = {
  type: 'list',
  name: 'tasks',
  message: 'What task do you want to run',
  choices: tasks
}

inquirer
  .prompt(query)
  .then((response) => {
    const t = require(`./tasks/${response.tasks}`);
    if (t) {
      t.task();
    }
  })
/*


const program = require('commander');

const tasks = [
  'init'
]

program
  .version('1.0.0')

tasks.forEach((task) => {

  const t = require(`./tasks/${task}`);
  program
    .command(t.command)
    .description(t.description)
    .action(t.action);

  if (t.options) {
    t.options.forEach((option) => {
      program.option(option.param, option.description, option.default)
    })
  }
})

program.parse(process.argv);
*/
