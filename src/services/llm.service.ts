import { OpenAI } from "langchain/llms/openai";

export const openai = new OpenAI({
  temperature: 0,
  openAIApiKey:
    process.env.OPENAI_API_KEY ??
    "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",
});

export async function handleOpenAIRequest({
  prompt,
}: {
  prompt: string;
}): Promise<string> {
  const output = await openai.call(prompt);
  return output;
}
