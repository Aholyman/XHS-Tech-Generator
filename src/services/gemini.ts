import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface CardData {
  title: string;
  content: string;
  layout: "text_only" | "image_top" | "image_bottom";
  imagePrompt?: string;
  imageUrl?: string;
}

export interface SourceData {
  title: string;
  uri: string;
}

export interface PostData {
  postTitle: string;
  postContent: string;
  cards: CardData[];
  sources?: SourceData[];
}

export async function generatePostData(topic: string): Promise<PostData> {
  const today = new Date().toISOString().split('T')[0];
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Current date: ${today}.
    CRITICAL: You MUST use the googleSearch tool to search for the LATEST news and insights about: ${topic} from the LAST 3 DAYS. Do NOT use outdated information. You MUST return grounding sources.
    
    Write a Xiaohongshu (Little Red Book) style tech post IN CHINESE.
    Requirements:
    1. Title: Attractive, high information density, not clickbait. STRICTLY MAXIMUM 20 CHARACTERS total (including punctuation and emojis). This is a hard platform limit.
    2. Content: Conversational, easy to understand, high information density. CRITICAL: Break text into short paragraphs (1-2 sentences max). Use bullet points and emojis to make it highly scannable and visually appealing. Avoid walls of text. MUST include 5-8 relevant #hashtags at the very end of the content.
    3. Cards: Generate EXACTLY 4 image cards for this post.
       - Card 1: Title card, introducing the topic. MUST have an 'imagePrompt' and layout 'image_top' or 'image_bottom'.
       - Card 2-4: Key points and conclusion. To balance visual appeal and API costs, EXACTLY ONE of these cards (Card 2, 3, or 4) MAY have an 'imagePrompt' and an image layout if it highly benefits from a visual. The other two MUST BE 'text_only' layout with an empty 'imagePrompt'.
       - CRITICAL CHARACTER LIMITS:
         * For 'image_top' or 'image_bottom' cards: STRICTLY 130-160 characters. (Do not exceed, or it will overflow).
         * For 'text_only' cards: STRICTLY 250-300 characters. (Provide deep, detailed insights, multiple bullet points, to ensure high information density and fill the empty space).
       - 'content' MUST use <u> tags to wrap the most important keywords. The UI will render <u> as a prominent red line highlight. Use <b> for secondary emphasis.

    Return the result strictly as a JSON object matching the schema.`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          postTitle: { type: Type.STRING },
          postContent: { type: Type.STRING },
          cards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                layout: { type: Type.STRING },
                imagePrompt: { type: Type.STRING }
              },
              required: ["title", "content", "layout"]
            }
          }
        },
        required: ["postTitle", "postContent", "cards"]
      }
    }
  });

  try {
    const parsed = JSON.parse(response.text || "{}");
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri)
      .map((web: any) => ({ title: web.title, uri: web.uri }));
    
    const uniqueSources = Array.from(new Map(sources.map((item: any) => [item.uri, item])).values()) as SourceData[];

    return { ...parsed, sources: uniqueSources };
  } catch (e) {
    console.error("Failed to parse JSON", response.text);
    throw new Error("Failed to generate valid JSON");
  }
}

export async function generateCardImage(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          text: prompt + ", ultra-realistic, photorealistic photography, shot on 35mm lens, cinematic lighting, highly detailed, 8k resolution, award-winning photojournalism, natural colors",
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image generated");
}
