const fs = require('fs');
const message = require('./../libs/messages.js');

function task(name, readme) {
  message.h1(`Creating new project: ${name}`);
  fs.mkdir(`./${name}`, (error, folder) => {
    if (error) {
      if (error.code === 'EEXIST') {
        message.info('Directory already exist skipping');
      } else {
        message.error('Problem creating directory');
        throw error;
      }
    } else {
      message.success(`Creating directory ${name}`);
    }

    createPackageJson(name)
    if (readme) {
      createReadme(name);
    }
  })
}

function createPackageJson(name) {
  const content = `
    {
      "name": "${name}",
      "version": "1.0.0",
      "description": "",
      "main": "index.js",
      "scripts": {
        "test": "echo \"Error: no test specified\" && exit 1"
      },
      "author": "Bozhidar Dryanovski <bozhidar.dryanovski@gmail.com>",
      "license": "MIT",
      "dependencies": {}
    }
  `

  createFile(
    `./${name}/package.json`,
    content,
    () => {
      message.success('package.json is created');
    },
    (err) => {
      if (err.code == 'EEXIST') {
        message.info('package.json already exist will not overwrite it');
        return;
      }
      message.error('could not crete package.json')
    })
}

function createFile(path = '', content = '', successCallback = function() {}, errorCallback = function() {}) {
  fs.open(path, 'wx', (e, fd) => {
    if (e) {
      errorCallback(e)
      return;
    }

    const buffer = new Buffer(content);
    fs.write(fd, buffer, 0, buffer.length, null, (writeError) => {
      if (writeError) {
        errorCallback(writeError);
        throw writeError;
      }
      fs.close(fd, () => {
        successCallback()
      })
    })
  })
}

function createReadme(name) {
  const content = `
# ${name}

TODO: Write a project description

## Installation

TODO: Describe the installation process

## Usage

TODO: Write usage instructions

## Contributing

1. Fork it!
2. Create your feature branch: \`git checkout -b my-new-feature\`
3. Commit your changes: \`git commit -am 'Add some feature'\`
4. Push to the branch: \`git push origin my-new-feature\`
5. Submit a pull request :D

## History

TODO: Write history

## Credits

TODO: Write credits

## License

TODO: Write license
`;

  createFile(
    `./${name}/README.md`,
    content,
    () => {
      message.success('README.md was created');
    },
    (error) => {
      if (error.code === 'EEXIST') {
        message.info('README.md already exist will not overwrite it');
        return;
      }
      message.error('There was problem creating README.md')
    }
  )
}

module.exports = {
  command: 'init <name>',
  description: 'setup new opensource project by creating few files and directories',
  options: [
    { param: '-r, --readme', description: 'Add README file' }
  ],
  action: (name, options) => {
    task(name, options.readme)
  }
}
