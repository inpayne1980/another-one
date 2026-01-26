
import { GoogleGenAI, Type } from "@google/genai";
import { ClipSuggestion } from "../types";

// Always use process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const optimizeBio = async (currentBio: string, name: string): Promise<string> => {
  try {
    // Basic text task uses gemini-3-flash-preview
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are a world-class social media strategist. Rewrite this "link in bio" bio to be more engaging and professional. 
      Name: ${name}. Current bio: ${currentBio}. 
      Constraint: Max 150 characters. Tone: Punchy and Modern. Return ONLY the new bio.`,
    });
    // Use .text property directly
    return response.text?.trim() || currentBio;
  } catch (error) {
    console.error("Gemini optimization failed", error);
    return currentBio;
  }
};

export const rewriteLinkTitle = async (currentTitle: string): Promise<string> => {
  try {
    // Basic text task uses gemini-3-flash-preview
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Rewrite this link button title to be a high-converting call to action. 
      Current Title: "${currentTitle}". 
      Return ONLY the new title (max 4 words).`,
    });
    // Use .text property directly
    return response.text?.trim().replace(/"/g, '') || currentTitle;
  } catch {
    return currentTitle;
  }
};

export const suggestLinks = async (bio: string): Promise<{title: string, placeholderUrl: string, type: any}[]> => {
  try {
    // Basic extraction task uses gemini-3-flash-preview
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this bio: "${bio}". Suggest 4 essential link blocks (standard, shop, newsletter, or tip). Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              placeholderUrl: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['standard', 'shop', 'newsletter', 'tip'] }
            },
            required: ['title', 'placeholderUrl', 'type']
          }
        }
      }
    });
    // Use .text property directly and trim
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr || '[]');
  } catch (error) {
    return [];
  }
};

export async function getClipSuggestions(
  youtubeUrl: string, 
  transcript: string, 
  images: { data: string, mimeType: string }[] = []
): Promise<ClipSuggestion[]> {
  // Advanced reasoning tasks (identifying viral segments) should use gemini-3-pro-preview
  const imageParts = images.map(img => ({
    inlineData: {
      data: img.data.split(',')[1] || img.data,
      mimeType: img.mimeType,
    },
  }));

  const textPart = {
    text: `Identify the most viral, high-conversion 15-60s segments for short-form video.
    YouTube URL: ${youtubeUrl}
    Transcript: ${transcript}
    Refer to any attached images for visual context. Provide exactly 3 suggestions in a JSON array.`
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: { parts: [...imageParts, textPart] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            start: { type: Type.INTEGER },
            end: { type: Type.INTEGER },
            caption: { type: Type.STRING },
            reasoning: { type: Type.STRING },
          },
          required: ["id", "start", "end", "caption", "reasoning"],
        },
      },
    },
  });

  try {
    // Use .text property directly and trim
    const jsonStr = response.text.trim();
    return JSON.parse(jsonStr || '[]');
  } catch {
    return [];
  }
}
