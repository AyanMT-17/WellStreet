import Groq from "groq-sdk";
import dotenv from "dotenv";
const groq = new Groq({ apiKey: process.env.API_KEY });

export async function main() {
  const chatCompletion = await getGroqChatCompletion();
  // Print the completion returned by the LLM.
  console.log(chatCompletion.choices[0]?.message?.content || "");
}

export default async function getGroqChatCompletion(symbol) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: "Find me the ticker symbol for the company " + symbol + " in the Indian stock market. And provide ticker in one word and if the symbol is mahindra and mahindra then provide M&M.NS as ticker.",    
      },
    ],
    model: "openai/gpt-oss-20b",
  });
}
