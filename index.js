#!/usr/bin/env node

const chalk = require("chalk");
const fs = require("fs");
const program = require("commander");
const download = require("download-git-repo");
const inquirer = require("inquirer");
const handlebars = require("handlebars");
const ora = require("ora");
const symbols = require("log-symbols");

const questions = [
  {
    name: "description",
    message: "Please enter project description"
  },
  {
    name: "author",
    message: "Please enter author name"
  }
];
program
  .version(require("./package").version, "-v, --version")
  .usage("<command> [project_name]")
  .command("init <name>")
  .action(name => {
    if (!fs.existsSync(name)) {
      inquirer.prompt(questions).then(answers => {
        const spinner = ora("Building Project...");
        spinner.start();
        download(
          "github:LiveRamp/select-core-project-template-fe#develop",
          name,
          { clone: true },
          err => {
            if (err) {
              spinner.fail();
              console.log(symbols.error, chalk.red(err));
            } else {
              spinner.succeed();
              const fileName = `${name}/package.json`;
              const meta = {
                description: answers.description,
                author: answers.author
              };
              if (fs.existsSync(fileName)) {
                const content = fs.readFileSync(fileName).toString();
                const result = handlebars.compile(content)(meta);
                fs.writeFileSync(fileName, result);
              }
              console.log(
                symbols.success,
                chalk.green("Built project successfully")
              );
            }
          }
        );
      });
    } else {
      console.log(symbols.error, chalk.red("Project exist with same name"));
    }
  });

program.parse(process.argv);
