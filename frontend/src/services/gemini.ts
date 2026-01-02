import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

export const initGemini = (apiKey: string) => {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
};

export const generateLessonPlan = async (
    prompt: string,
    contextFiles: { name: string; content: string }[],
    lehrplanText: string,
    apiKey?: string,
    options?: {
        cycle?: string;
        wishes?: string;
    }
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

    const { cycle, wishes } = options || {};

    // Construct a rich prompt with context
    // ... (unchanged prompt construction) ...
    const fullPrompt = `You are an expert educational assistant for Swiss teachers (Lehrplan 21).
    Per user request, you MUST show your thinking process before giving the final answer.
    Wrap your thinking process in <thinking> tags.
    IMPORTANT: You must ALWAYS respond in German (High German, formatted for Swiss teachers).

    STRICT GROUNDING RULES:
    1. You must answer strictly based on the provided CONTEXT MATERIALS (User uploaded) and MANDATORY CURRICULUM (Lehrplan 21).
    2. Do NOT use outside knowledge unless it is common educational knowledge (e.g. methods like "Think-Pair-Share") that supports the provided content.
    3. If the answer cannot be found in the materials, state that you cannot find the information in the provided sources.

    CITATION RULES:
    1. You must cite your sources in the text.
    2. Format: [Quelle: Dateiname] or [Lehrplan 21: Modulname].
    3. At the end of the response, add a "Quellenverzeichnis" section listing the used sources.

    TARGET AUDIENCE:
    ${cycle ? `- Cycle/Class: ${cycle}` : '- General / Not specified'}
    
    USER WISHES / INSTRUCTIONS:
    ${wishes ? `- ${wishes}` : '- None'}

    USER REQUEST: "${prompt}"

    CONTEXT MATERIALS (User uploaded):
    ${contextFiles.map(f => `--- FILE: ${f.name} ---\n${f.content.substring(0, 20000)}... (truncated if too long)\n`).join('\n')}

    MANDATORY CURRICULUM (Lehrplan 21 Context):
    ${lehrplanText ? lehrplanText.substring(0, 30000) : "No specific Lehrplan module selected."} ... (truncated)

    OUTPUT FORMAT:
    1. Start with a <thinking> block where you analyze the request, checking against the curriculum (Lehrplan 21) and materials. Plan the lesson structure here.
    2. Close the </thinking> block.
    3. Provide the final Lesson Plan in Markdown.

    Structure the lesson plan clearly with:
    1. Title & Topic
    2. Competencies (Lehrplan 21 references with citations)
    3. Learning Objectives
    4. Duration
    5. Materials needed
    6. Step-by-step Lesson Flow (Introduction, Core Activity, Conclusion)
    7. Differentiation options (easy/hard)
    8. Quellenverzeichnis (List of used sources)

    Tone: Professional, encouraging, and practical for teachers.
    
    LANGUAGE: The final output (including the thinking block) MUST BE IN GERMAN.
    
    Safe: Allow flash cards, slide deck specific content creation if asked.
    `;

    try {

        const result = await model!.generateContent(fullPrompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini generation error:", error);
        throw error;
    }
};

export const generateDossier = async (
    lessonPlanText: string,
    apiKey?: string
): Promise<string> => {
    if (apiKey) {
        initGemini(apiKey);
    }

    if (!model) {
        if (import.meta.env.VITE_GEMINI_API_KEY) {
            initGemini(import.meta.env.VITE_GEMINI_API_KEY);
        } else {
            throw new Error("Gemini API Key is missing.");
        }
    }

    const prompt = `
    You are an expert educational consultant.
    Your task is to convert the following LESSON PLAN into a PROFESSIONAL DOSSIER / SLIDE DECK structure.

    INPUT LESSON PLAN:
    ${lessonPlanText}

    INSTRUCTIONS:
    1. Create a structured document suitable for download (Markdown format).
    2. It should serve as a complete package for the teacher to take into the classroom or present.
    3. Include the following sections:
        - **Cover Page Details**: Title, Subject, Duration, Date (placeholder).
        - **Management Summary**: Brief overview of the lesson goals.
        - **Slides / Content**: Break down the lesson into logical "Slides" or "Boards". Content should be bulleted and clear.
        - **Teacher Notes**: Specific reminders or hidden details for the teacher (not for students).
        - **Material Checklist**: Clear list of what is needed.

    OUTPUT FORMAT:
    - Pure Markdown.
    - Use clear headings (#, ##).
    - Use Horizontal Rules (---) to separate "Slides" or major sections.
    - Tone: Professional, clean, and structured.
    - Language: German (Swiss Standard German context).

    DO NOT output <thinking> tags for this specific task, just the document content.
    `;

    try {

        const result = await model!.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini dossier generation error:", error);
        throw error;
    }
};

export const generateStudentHandout = async (
    lessonPlanText: string,
    apiKey?: string
): Promise<string> => {
    if (apiKey) {
        initGemini(apiKey);
    }

    if (!model) {
        if (import.meta.env.VITE_GEMINI_API_KEY) {
            initGemini(import.meta.env.VITE_GEMINI_API_KEY);
        } else {
            throw new Error("Gemini API Key is missing.");
        }
    }

    const prompt = `
    You are an expert educational assistant.
    Create a STUDENT HANDOUT (Arbeitsblatt/Handout) based on this LESSON PLAN.

    INPUT LESSON PLAN:
    ${lessonPlanText}

    INSTRUCTIONS:
    1. The output must be valid JSON content.
    2. Structure:
    {
      "title": "Title of the Handout",
      "sections": [
        { "title": "Section Title", "content": "Text content, instructions, or questions." }
      ]
    }
    3. Content should be suitable for students (simple language, clear instructions).
    4. Language: German.

    OUTPUT ONLY THE JSON. No code fences around it if possible, or simple json code block.
    `;

    try {
        const result = await model!.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return text;
    } catch (error) {
        console.error("Gemini handout generation error:", error);
        throw error;
    }
};

export const generatePresentation = async (
    lessonPlanText: string,
    apiKey?: string
): Promise<string> => {
    if (apiKey) {
        initGemini(apiKey);
    }

    if (!model) {
        if (import.meta.env.VITE_GEMINI_API_KEY) {
            initGemini(import.meta.env.VITE_GEMINI_API_KEY);
        } else {
            throw new Error("Gemini API Key is missing.");
        }
    }

    const prompt = `
    You are an expert educational assistant.
    Create a PRESENTATION STRUCTURE (Slides) based on this LESSON PLAN.

    INPUT LESSON PLAN:
    ${lessonPlanText}

    INSTRUCTIONS:
    1. The output must be valid JSON content.
    2. Structure:
    {
      "title": "Presentation Title",
      "slides": [
        { "title": "Slide Title", "bullets": ["Point 1", "Point 2"], "speakerNotes": "Notes for the teacher" }
      ]
    }
    3. 16:9 aspect ratio suitable content.
    4. Language: German.

    OUTPUT ONLY THE JSON. No code fences around it if possible, or simple json code block.
    `;

    try {
        const result = await model!.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        // Clean up markdown code blocks if present
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return text;
    } catch (error) {
        console.error("Gemini presentation generation error:", error);
        throw error;
    }
};
