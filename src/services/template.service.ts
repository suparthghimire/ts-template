import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import prompt from "inquirer";

export const TemplateService = {
  async GetTemplates({
    buildDirName,
    entryFileName,
    projectDirName = ".",
  }: {
    projectDirName?: string;
    buildDirName: string;
    entryFileName: string;
  }) {
    const templateDir = path.join(__dirname, "templates");
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
          message: `Directory ${projectDirName} already exists. Overwrite its Contents?`,
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
      path.join(savePath, "src", `${entryFileName}.ts`),
      `console.log("Hello World!")`
    );
  },
};
