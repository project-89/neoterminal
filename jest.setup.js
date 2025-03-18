// Mock axios for all tests
jest.mock("axios", () => ({
  post: jest.fn().mockImplementation((url, data) => {
    // Return different mock responses based on the endpoint
    if (url.includes("anthropic")) {
      return Promise.resolve({
        data: {
          content: [{ text: "Claude mock response for testing" }],
          model: "claude-3-sonnet-20240229",
          usage: { input_tokens: 10, output_tokens: 20 },
        },
      });
    } else if (url.includes("generativelanguage.googleapis.com")) {
      return Promise.resolve({
        data: {
          candidates: [
            {
              content: {
                parts: [{ text: "Gemini mock response for testing" }],
              },
              finishReason: "STOP",
            },
          ],
        },
      });
    }
    throw new Error(`Unrecognized endpoint: ${url}`);
  }),
  isAxiosError: jest.fn().mockReturnValue(false),
}));
