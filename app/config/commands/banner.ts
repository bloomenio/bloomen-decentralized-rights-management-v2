import chalk from 'chalk';
import * as figlet from 'figlet';
import * as Q from 'q';

const config = require('../../package.json');

Q.spread<string, any>([appNameBanner()], (name: string) => {
  console.log(chalk.blue(name));
  console.log('');
  return process.exit(0);
});

function appNameBanner(): Q.Promise<string> {
  return Q.Promise<string>((resolve, reject) => {
    figlet.text(
      config.displayName || config.name,
      {
        font: 'Standard',
        horizontalLayout: 'default',
        verticalLayout: 'default'
      },
      (error: any, data: any) => {
        if (error) {
          return reject(error);
        }
        return resolve(data);
      }
    );
  });
}
