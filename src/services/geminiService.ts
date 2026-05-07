import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const geminiService = {
  async summarize(content: string, type: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize the following ${type} content and extract key tags (comma separated). Also provide a concise, professional title for this content. Return as JSON with "title", "summary" and "tags" fields. Content: ${content}`,
      config: {
        responseMimeType: "application/json",
      }
    });
    return JSON.parse(response.text);
  },

  async getEmbedding(text: string) {
    const model = "gemini-embedding-2-preview";
    const result = await ai.models.embedContent({
      model,
      contents: [{ parts: [{ text }] }]
    });
    return result.embeddings[0].values;
  },

  async classify(content: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Classify the following content into one of these categories: AI Prompt, Design Inspiration, Startup Idea, Coding, Recipe, Productivity, Video, Tutorial, Other. Return only the category name. Content: ${content}`,
    });
    return response.text.trim();
  }
};
