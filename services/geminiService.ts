
import { GoogleGenAI, Type } from "@google/genai";
import { ClipSuggestion } from "../types";

// Helper to handle retries with exponential backoff
async function callGeminiWithRetry<T>(
  fn: (ai: GoogleGenAI) => Promise<T>,
  retries = 2,
  delay = 1000
): Promise<T> {
  let lastError: any;
  for (let i = 0; i <= retries; i++) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      return await fn(ai);
    } catch (error: any) {
      lastError = error;
      const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.message?.includes('quota');
      if (isRateLimit && i < retries) {
        // Jittered exponential backoff
        const waitTime = delay * Math.pow(2, i) + Math.random() * 100;
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

export const optimizeBio = async (currentBio: string, name: string): Promise<string> => {
  try {
    return await callGeminiWithRetry(async (ai) => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a world-class social media strategist. Rewrite this "link in bio" bio to be more engaging and professional. 
        Name: ${name}. Current bio: ${currentBio}. 
        Constraint: Max 150 characters. Tone: Punchy and Modern. Return ONLY the new bio.`,
      });
      return response.text?.trim() || currentBio;
    });
  } catch (error) {
    console.error("Gemini optimization failed", error);
    throw error; // Re-throw to handle in UI
  }
};

export const rewriteLinkTitle = async (currentTitle: string): Promise<string> => {
  try {
    return await callGeminiWithRetry(async (ai) => {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Rewrite this link button title to be a high-converting call to action. 
        Current Title: "${currentTitle}". 
        Return ONLY the new title (max 4 words).`,
      });
      return response.text?.trim().replace(/"/g, '') || currentTitle;
    });
  } catch {
    return currentTitle;
  }
};

export const suggestLinks = async (bio: string): Promise<{title: string, placeholderUrl: string, type: any}[]> => {
  try {
    return await callGeminiWithRetry(async (ai) => {
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
      return JSON.parse(response.text.trim() || '[]');
    });
  } catch (error) {
    return [];
  }
};

export async function getClipSuggestions(
  youtubeUrl: string, 
  transcript: string, 
  images: { data: string, mimeType: string }[] = []
): Promise<ClipSuggestion[]> {
  const imageParts = images.map(img => ({
    inlineData: {
      data: img.data.split(',')[1] || img.data,
      mimeType: img.mimeType,
    },
  }));

  const textPart = {
    text: `Identify the most viral, high-conversion 15-60s segments for short-form video.
    For each segment, also generate a Viral Title and a Viral Description (including keywords and hashtags).
    YouTube URL: ${youtubeUrl}
    Transcript: ${transcript}
    Refer to any attached images for visual context. Provide exactly 3 suggestions in a JSON array.`
  };

  try {
    return await callGeminiWithRetry(async (ai) => {
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
                viralTitle: { type: Type.STRING },
                viralDescription: { type: Type.STRING },
                reasoning: { type: Type.STRING },
              },
              required: ["id", "start", "end", "caption", "viralTitle", "viralDescription", "reasoning"],
            },
          },
        },
      });
      return JSON.parse(response.text.trim() || '[]');
    });
  } catch (error) {
    console.error("Clip suggestions failed", error);
    throw error;
  }
}

export async function generateViralThumbnail(
  context: string, 
  overlayText?: string, 
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" = "16:9"
): Promise<string | undefined> {
  try {
    return await callGeminiWithRetry(async (ai) => {
      let prompt = `Generate a highly professional, click-driven social media thumbnail image for a video about: ${context}. Aspect ratio is ${aspectRatio}. The aesthetic should be modern, clean, and high-contrast.`;
      
      if (overlayText && overlayText.trim().length > 0) {
        prompt += ` IMPORTANT: Include the text "${overlayText}" prominently and clearly in the image using bold, modern typography.`;
      } else {
        prompt += ` Do not include any text in the image.`;
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: prompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio
          }
        }
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return undefined;
    });
  } catch (error) {
    console.error("Thumbnail generation failed:", error);
    throw error;
  }
}
