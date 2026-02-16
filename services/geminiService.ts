
import { GoogleGenAI } from "@google/genai";
import { MODEL_NAME } from "../constants.ts";

export const generateWelcomeMessage = async (salutation: string, name: string, company: string): Promise<string> => {
  const apiKey = process.env.API_KEY;
  
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    return getDefaultFallbackMessage(salutation, name);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Tu es le Directeur de la Communication d'Assirou Sécurité. Rédige un message de bienvenue institutionnel, court (max 2 sentences) et très prestigieux pour ${salutation} ${name} de l'organisation ${company}, qui s'inscrit au Forum Assirou Sécurité 2026. Le ton doit être solennel, professionnel et chaleureux. Ne mets pas de guillemets autour du message.`,
    });

    return response.text || getDefaultFallbackMessage(salutation, name);
  } catch (error) {
    console.warn("Gemini Service Error:", error);
    return getDefaultFallbackMessage(salutation, name);
  }
};

const getDefaultFallbackMessage = (salutation: string, name: string): string => {
  const label = salutation === 'Mme' ? 'Madame' : 'Monsieur';
  return `${label} ${name}, Assirou Sécurité est honorée de vous compter parmi les participants de notre forum 2026. Nous nous réjouissons de votre présence pour échanger sur les enjeux de la sécurité globale au Sénégal.`;
};
