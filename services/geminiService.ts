
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function parseSmartOnboarding(text: string) {
  const schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Full name of the patient" },
      age: { type: Type.NUMBER, description: "Age in years" },
      condition: { type: Type.STRING, description: "Detailed medical history or current conditions mentioned" },
      isComplete: { type: Type.BOOLEAN, description: "True if name, age and some condition are all present" }
    },
    required: ["name", "age", "condition"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a medical receptionist. Extract patient details from this conversational input: "${text}". 
    If some details are missing, leave them null or 0 for age. 
    Language might be English, Malayalam, Hindi, Tamil or Kannada. Always return names and conditions in English.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
}

export async function parseSmartMedicine(text: string) {
  const schema = {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "Name of the medicine" },
      dosage: { type: Type.STRING, description: "Dosage like 500mg or 1 tablet" },
      schedule: { type: Type.STRING, description: "Time in HH:mm format (24hr clock)" },
      stock: { type: Type.NUMBER, description: "Quantity of medicine available" }
    },
    required: ["name", "dosage", "schedule", "stock"]
  };

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract medicine details from this input: "${text}". 
    Convert times like "8am" to "08:00". If stock isn't mentioned, assume 30. 
    Translate to English if necessary.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
}
