
import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME } from "../constants.ts";

export const generateWelcomeMessage = async (name: string, company: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Tu es le Directeur de la Communication d'Assirou Sécurité. Rédige un message de bienvenue institutionnel, court (max 2-3 phrases) et très prestigieux pour M./Mme ${name} de l'organisation ${company}, qui vient de s'inscrire au Forum Assirou Sécurité 2026. Le ton doit être solennel, professionnel et chaleureux.`,
    });

    return response.text || getDefaultFallbackMessage(name);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return getDefaultFallbackMessage(name);
  }
};

const getDefaultFallbackMessage = (name: string): string => {
  return `Monsieur/Madame ${name}, Assirou Sécurité est honorée de vous compter parmi les participants de notre forum 2026. Nous nous réjouissons de votre présence pour échanger sur les enjeux critiques de la sécurité globale.`;
};
