// Copyright James Burvel O’Callaghan III
// President Citibank Demo Business Inc.

const Gemini = {
  async processOptions(clientToken, appearanceVariables, hostname) {
    let environment;
    if (hostname.endsWith("localhost")) {
      environment = "development";
    } else if (hostname.endsWith("demo.moderntreasury.com")) {
      environment = "demo";
    }

    const options = {
      clientToken: clientToken,
      variables: appearanceVariables,
      onError: (error) => {
        console.log("Gemini-processed Error:", error);
      },
      onSuccess: (result) => {
        console.log("Gemini-processed Success:", result);
      },
    };

    if (environment) {
      options.environment = environment;
    }

    return options;
  },
};

export async function embeddableFlowCreateOptions(
  clientToken,
  appearanceVariables,
) {
  return await Gemini.processOptions(
    clientToken,
    appearanceVariables,
    window.location.hostname,
  );
}