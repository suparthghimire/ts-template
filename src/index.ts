#!/usr/bin/env node

import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { program } from "commander";
import prompt from "inquirer";

program.version("0.0.1");

class TemplateService {
  static async GetTemplates({
    buildDirName,
    entryFileName,
    projectDirName = ".",
  }: {
    projectDirName?: string;
    buildDirName: string;
    entryFileName: string;
  }) {
    const templateDir = path.join(process.cwd(), "templates");
    const filesNames = await fs.readdir(templateDir);
    const fileContents = await Promise.all(
      filesNames.map((fileName) => {
        const filePath = path.join(templateDir, fileName);
        return fs.readFile(filePath, "utf-8");
      })
    );
    const strippedNames = filesNames.map((fileName) => {
      return fileName.replace(".template", "");
    });

    const savePath = path.join(process.cwd(), projectDirName);

    const pathExists = fsSync.existsSync(savePath);

    if (!pathExists) await fs.mkdir(savePath, { recursive: true });
    else {
      const { overwrite } = await prompt.prompt([
        {
          type: "confirm",
          name: "overwrite",
          message: `Directory ${buildDirName} already exists. Overwrite its Contents?`,
          default: false,
        },
      ]);
      if (!overwrite) return;
    }

    const unresolvedConfigFiles = strippedNames.map((fileName, index) => {
      let fileContent = fileContents[index];
      fileContent = fileContent.replace(/{{build__dir__name}}/g, buildDirName);
      fileContent = fileContent.replace(
        /{{entry__file__name}}/g,
        entryFileName
      );
      fs.writeFile(path.join(savePath, fileName), fileContent);
    });
    await Promise.all(unresolvedConfigFiles);
    // create src directory
    await fs.mkdir(path.join(savePath, "src"), {
      recursive: true,
    });
    // create a file with the entry file name inside the src directory
    await fs.writeFile(
      path.join(savePath, "src", entryFileName + ".ts"),
      `console.log("Hello World!")`
    );
  }
}

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
