import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || process.env.API_KEY });

// Standard US sentiment analysis model
const MODEL = "llama-3.3-70b-versatile";

export async function getSentimentAnalysis(ticker, newsContext) {
  const prompt = `You are a Senior Hedge Fund Principal. 
Analyze the following raw institutional news for "${ticker}". 
Do NOT just summarize. Instead, identify the "Alpha":
1. What is the market-moving implication of this news?
2. What are the "hidden" risks or "bull traps" that a retail investor might miss?
3. Provide a definitive stance (Bullish/Bearish/Cautious).

Provide a strictly formatted JSON response with the following keys:
- "sentiment": A string (e.g., "Bullish", "Bearish", "Cautious")
- "summary": A 2-sentence sharp analytical take on the *implication* of the news.
- "bullCase": An array of 2 bullet points explaining why smart money might be buying.
- "bearCase": An array of 2 bullet points identifying structural risks or downside triggers.

News Context:
${newsContext}

JSON Response:`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: MODEL,
      response_format: { type: "json_object" }
    });

    return JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error("Groq Sentiment Analysis Error:", error);
    return {
      sentiment: "Neutral",
      summary: "Sentiment analysis unavailable at this time.",
      bullCase: ["N/A"],
      bearCase: ["N/A"]
    };
  }
}

// Fallback for ticker resolving if needed (legacy)
export default async function getGroqChatCompletion(symbol) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "user",
        content: `Find the US stock ticker symbol for "${symbol}". Return ONLY the ticker symbol in plain text (e.g., "AAPL").`,
      },
    ],
    model: MODEL,
  });
}
