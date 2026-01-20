
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const optimizeBio = async (currentBio: string, name: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a punchy, professional, and engaging bio for a "link in bio" profile. 
      Name: ${name}. Current idea: ${currentBio}. 
      Keep it under 150 characters. Return only the bio text.`,
      config: {
        temperature: 0.7,
        topP: 0.8,
      }
    });
    return response.text || currentBio;
  } catch (error) {
    console.error("Gemini optimization failed", error);
    return currentBio;
  }
};

export const suggestLinks = async (bio: string): Promise<{title: string, placeholderUrl: string, type: any}[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this bio: "${bio}", suggest 4 essential blocks this person should have on their profile. Include standard links, maybe a "Shop" item or a "Newsletter" block. Return as JSON.`,
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
    return JSON.parse(response.text || '[]');
  } catch (error) {
    return [];
  }
};

export const suggestBrandMessage = async (name: string): Promise<string> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a unique 3-word branding slogan for a user named "${name}" to use on their landing page.`,
    });
    return response.text || "Create. Share. Grow.";
  } catch {
    return "Your Digital Home.";
  }
};
