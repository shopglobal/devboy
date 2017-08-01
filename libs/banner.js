const clear  = require('clear');
const chalk  = require('chalk');
const figlet = require('figlet');

module.exports = {
  intro: function() {
    clear();
    console.log(chalk.yellow(
      figlet.textSync('Devboy', { horizontalLayout: 'full' })
    ));
  }
}
