import { generateProjectFile } from "./generateProject";
import { generateQrCodes } from "./generateQrCodes";

const dieWithError = (message: string, error: Error) => {
  console.error(message, error);
  process.exit(1);
}

(async () => {
  let project;
  try {
    project = await generateProjectFile();
  } catch (e) {
    dieWithError("Error creating project file", e);
  }

  try {
    await generateQrCodes(project);
  } catch (e) {
    dieWithError("Error creating qr code file", e);
  }
})();