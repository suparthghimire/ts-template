#!/usr/bin/env node

import { program } from "commander";
import { TemplateService } from "./services/template.service";
import dotenv from "dotenv";
import prompt from "inquirer";

dotenv.config();

program.version("0.0.1");

const questions = [
  {
    type: "input",
    name: "projectDirName",
    message:
      "Name of the project directory? (Leave blank for current directory)",
    default: ".",
  },
  {
    type: "input",
    name: "entryFileName",
    message: "Name of the entry file? (Leave blank for index.ts)",
    default: "index",
  },
  {
    type: "input",
    name: "buildDirName",
    message: "Name of the build directory? (Leave blank for dist)",
    default: "dist",
  },
];

if (process.env.NODE_ENV === "development") {
  (async () => {
    const projectDirName = "output";
    const entryFileName = "index";
    const buildDirName = "dist";

    await TemplateService.GetTemplates({
      projectDirName,
      entryFileName,
      buildDirName,
    });
  })();
} else {
  program
    .command("init")
    .alias("i")
    .description("Initialize TS Project")
    .action(async () => {
      prompt.prompt(questions).then(async (answers) => {
        const { projectDirName, entryFileName, buildDirName } = answers;
        await TemplateService.GetTemplates({
          projectDirName,
          entryFileName,
          buildDirName,
        });
      });
    });

  program.parse(process.argv);
}
