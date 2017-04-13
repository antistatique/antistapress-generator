#! /usr/bin/env node
const chalk = require('chalk');
const fs = require('fs');
const exec = require('child_process').exec;
const slug = require('slug');
const Spinner = require('cli-spinner').Spinner;
const spinner = new Spinner('processing.. %s');
spinner.setSpinnerString('|/-\\');

const argv = require('yargs')
  .help('h')
  .alias('h', 'help')
  .usage('Usage: $0 [options]')
  .option({
    n: {
      alias : 'name',
      describe: 'Your project name',
      type: 'string',
      nargs: 1,
      demand: true,
      demand: 'name is required',
      default: 'antistapress-new',
    },
    t: {
      alias : 'theme',
      describe: 'Your theme name',
      type: 'string',
      nargs: 1,
      demand: false,
    },
  })
  .example('$0 -n my-project -t my-project-theme', 'Generate your new Antistatique Wordpress project')
  .argv;

const executioner = (command) => {
 return new Promise((resolve, reject) => {
   exec(command, (error, stdout, stderr) => {
     if (error) reject(error);
     resolve(stderr || stdout);
   });
 });
};

const generator = async () => {
  const nameSlugified = slug(argv.name);
  const themeSlugified = argv.theme ? slug(argv.theme) : undefined;

  spinner.start();
  await executioner(`git clone git@github.com:antistatique/antistapress.git ${nameSlugified}`);
  await executioner(`rm -r ${nameSlugified}/.git`);
  await executioner(`rm ${nameSlugified}/.gitignore`);
  await executioner(`mv ${nameSlugified}/web/app/themes/antistapress ${nameSlugified}/web/app/themes/${themeSlugified || nameSlugified}`);
  const styleContent = await fs.readFileSync(`${nameSlugified}/web/app/themes/${themeSlugified || nameSlugified}/style.css`);
  await fs.writeFileSync(`${nameSlugified}/web/app/themes/${themeSlugified || nameSlugified}/style.css`, styleContent.toString('utf-8').replace(/THEME_NAME/g, argv.theme || argv.name));
  spinner.stop(true);
  console.log(chalk.magenta('Your new Antistatique Wordpress is ready 🎉 !'));
};

generator();
