const {
  spawn,
} = require("child_process");

const path =
  require("path");

const fs =
  require("fs");

const os =
  require("os");

const analyzeDocument = (
  file
) => {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const pythonScript =
        path.join(
          __dirname,
          "../../document_verification/run_verification.py"
        );

      const extension =
        path.extname(
          file.originalname
        );

      const tempFile =
        path.join(
          os.tmpdir(),
          `truthlens-${Date.now()}${extension}`
        );

      try {

        fs.writeFileSync(
          tempFile,
          file.buffer
        );

      } catch (error) {

        return reject(
          error
        );
      }

      const python =
        spawn(
          "python",
          [
            pythonScript,
            tempFile,
          ]
        );

      let stdout = "";
      let stderr = "";

      python.stdout.on(
        "data",
        (data) => {
          stdout +=
            data.toString();
        }
      );

      python.stderr.on(
        "data",
        (data) => {
          stderr +=
            data.toString();
        }
      );

      python.on(
        "close",
        (code) => {

          try {
            fs.unlinkSync(
              tempFile
            );
          } catch (error) {
            console.error(
              "Could not delete temporary document:",
              error
            );
          }

          if (code !== 0) {

            console.error(
              "Python verification error:"
            );

            console.error(
              stderr
            );

            return reject(
              new Error(
                stderr ||
                "Document verification process failed."
              )
            );
          }

          try {

            const result =
              JSON.parse(
                stdout
              );

            resolve(
              result
            );

          } catch (error) {

            console.error(
              "Invalid Python JSON:"
            );

            console.error(
              stdout
            );

            reject(
              new Error(
                "Python verification returned invalid JSON."
              )
            );
          }
        }
      );
    }
  );
};

module.exports = {
  analyzeDocument,
};