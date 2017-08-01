const chalk = require('chalk');
const log = console.log;
const tab = "\t";

module.exports = {
  info: (message) => {
    log(tab + '🤓  ' + chalk.bold.yellow(message));
  },
  error: (message) => {
    log('😱  ' + chalk.bgRed.white(message));
  },
  success: (message) => {
    log(tab + '😃  ' + chalk.bold.green(message));
  },
  h1: (message, noPadding) => {
    const padding = noPadding ? '' : "\n";
    log(`${padding}${chalk.underline.magenta(message)}${padding}`);
  }
}
