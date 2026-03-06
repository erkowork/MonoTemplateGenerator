import { GoogleGenAI } from "@google/genai";

export async function generateAppIcon(prompt: string): Promise<string | null> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          {
            text: `Professional app icon for a technical engineering tool called "Cylinder Angle Template". The icon should feature a stylized cylinder with technical marking lines, minimalist, modern, high contrast, gold and dark theme, 3D render style, clean background. No text.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Icon generation failed", error);
  }
  return null;
}
