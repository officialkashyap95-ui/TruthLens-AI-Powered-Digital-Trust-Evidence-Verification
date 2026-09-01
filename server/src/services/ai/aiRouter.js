const {
  analyzeWithGemini,
} = require("./geminiService");

const {
  analyzeWithGroq,
} = require("./groqService");

const {
  analyzeWithOpenRouter,
} = require("./openrouterService");

const analyzeWithAI = async ({
  content,
  source = "",
  evidence = [],
}) => {
  const providers = [
    {
      name: "Gemini",

      run: () =>
        analyzeWithGemini({
          content,
          source,
          evidence,
        }),
    },

    {
      name: "Groq",

      run: () =>
        analyzeWithGroq({
          content,
          source,
          evidence,
        }),
    },

    {
      name: "OpenRouter",

      run: () =>
        analyzeWithOpenRouter({
          content,
          source,
          evidence,
        }),
    },
  ];

  const errors = [];

  for (const provider of providers) {
    try {
      console.log(
        `Trying AI provider: ${provider.name}`
      );

      const result =
        await provider.run();

      console.log(
        `AI provider succeeded: ${provider.name}`
      );

      return {
        ...result,

        provider:
          provider.name,
      };
    } catch (error) {
      console.error(
        `${provider.name} failed:`,
        error.message
      );

      errors.push({
        provider:
          provider.name,

        error:
          error.message,
      });
    }
  }

  throw new Error(
    `All AI providers failed: ${JSON.stringify(
      errors
    )}`
  );
};

module.exports = {
  analyzeWithAI,
};