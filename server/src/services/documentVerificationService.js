const { spawn } = require("child_process");
const path = require("path");

const analyzeDocument = (filePath) => {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(
      __dirname,
      "../../../document_verification/run_verification.py"
    );

    const python = spawn("python3", [
      pythonScript,
      filePath,
    ]);

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    python.on("close", (code) => {
      if (code !== 0) {
        console.error("Python verification error:");
        console.error(stderr);

        return reject(
          new Error(
            stderr ||
              "Document verification process failed."
          )
        );
      }

      try {
        const result = JSON.parse(stdout);
        resolve(result);
      } catch (error) {
        console.error("Invalid Python JSON:");
        console.error(stdout);

        reject(
          new Error(
            "Python verification returned invalid JSON."
          )
        );
      }
    });
  });
};

module.exports = {
  analyzeDocument,
};