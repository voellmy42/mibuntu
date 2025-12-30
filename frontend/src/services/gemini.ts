import { GoogleGenerativeAI } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

export const initGemini = (apiKey: string) => {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
};

export const generateLessonPlan = async (
    prompt: string,
    contextFiles: { name: string; content: string }[],
    lehrplanText: string,
    apiKey?: string
): Promise<string> => {
    if (apiKey) {
        initGemini(apiKey);
    }

    if (!model) {
        if (import.meta.env.VITE_GEMINI_API_KEY) {
            initGemini(import.meta.env.VITE_GEMINI_API_KEY);
        } else {
            throw new Error("Gemini API Key is missing. Please provide one.");
        }
    }

    // Construct a rich prompt with context
    let fullPrompt = `You are an expert educational assistant for Swiss teachers (Lehrplan 21).
    Create a lesson plan based on the following request and materials.

    USER REQUEST: "${prompt}"

    CONTEXT MATERIALS (User uploaded):
    ${contextFiles.map(f => `--- FILE: ${f.name} ---\n${f.content.substring(0, 20000)}... (truncated if too long)\n`).join('\n')}

    MANDATORY CURRICULUM (Lehrplan 21 Context):
    ${lehrplanText ? lehrplanText.substring(0, 30000) : "No specific Lehrplan module selected."} ... (truncated)

    OUTPUT FORMAT:
    Please verify that the lesson matches the age range/cycle if specified.
    Structure the lesson plan clearly with:
    1. Title & Topic
    2. Competencies (Lehrplan 21 references)
    3. Learning Objectives
    4. Duration
    5. Materials needed
    6. Step-by-step Lesson Flow (Introduction, Core Activity, Conclusion)
    7. Differentiation options (easy/hard)

    Tone: Professional, encouraging, and practical for teachers.
    Safe: Allow flash cards, slide deck specific content creation if asked.
    `;

    try {
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini generation error:", error);
        throw error;
    }
};
