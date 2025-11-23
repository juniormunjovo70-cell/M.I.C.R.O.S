
import { GoogleGenAI, Schema, Type } from "@google/genai";
import { NodeType, ReportData, Language, MentorAdvice } from '../types';

const apiKey = process.env.API_KEY || '';
// Initialize properly with named parameter
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Use Gemini 2.5 Flash for speed and efficiency
const MODEL_ID = 'gemini-2.5-flash';

export const checkApiKey = (): boolean => {
  return !!apiKey;
};

// --- Schemas ---

const nodeResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    items: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 4-5 concise, ACTIONABLE insights. Focus on 'How to execute' or 'What to build'."
    },
    sub_niches: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 highly specific, profitable sub-niches within this market (Root Node Only)."
    },
    metric_label: { type: Type.STRING, description: "A relevant execution metric" },
    metric_value: { type: Type.NUMBER, description: "Value from 0-100" },
    summary: { type: Type.STRING, description: "A strategic directive. Speak directly to the user with empathy and authority." },
    // Fields for Market Audit
    demand_score: { type: Type.NUMBER, description: "0-100 Demand Score (Audit only)" },
    supply_score: { type: Type.NUMBER, description: "0-100 Supply Score (Audit only)" },
    opportunity_score: { type: Type.NUMBER, description: "Calculated Opportunity Score (Audit only)" },
    audit_verdict: { type: Type.STRING, description: "Short verdict string e.g., 'High Potential' (Audit only)" },
    growth_rate: { type: Type.STRING, description: "e.g., '+25% YoY' (Audit only)" },
    saturation_risk: { type: Type.STRING, description: "e.g., 'High in 6 months' (Audit only)" }
  },
  required: ["items", "summary"]
};

const reportResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    verdict: {
      type: Type.STRING,
      enum: ["GO", "NO-GO", "PIVOT"],
      description: "The final strategic decision."
    },
    summary: { type: Type.STRING, description: "Deep, empathetic executive summary. Connect with the founder's anxiety and ambition." },
    subNichesHighlights: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "The top 3 sub-niches the user should specifically target to avoid saturation."
    },
    opportunities: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Short unique string id e.g. 'opp_1'" },
          title: { type: Type.STRING },
          score: { type: Type.NUMBER, description: "0-100 viability score" },
          description: { type: Type.STRING, description: "Strategic justification." }
        },
        required: ["title", "score", "description", "id"]
      }
    },
    viabilityScore: { type: Type.NUMBER, description: "Overall project viability 0-100" },
    recommendedStack: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Recommended MVP features or Tech Stack."
    }
  },
  required: ["verdict", "summary", "opportunities", "viabilityScore", "recommendedStack", "subNichesHighlights"]
};

const mentorAdviceSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stepTitle: { type: Type.STRING, description: "Title of the Day 1 Plan" },
    empatheticIntro: { type: Type.STRING, description: "A warm, understanding sentence acknowledging the difficulty of starting." },
    steps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3-4 concrete, micro-steps to take RIGHT NOW to start solving the problem."
    },
    motivation: { type: Type.STRING, description: "A closing sentence of encouragement." }
  },
  required: ["stepTitle", "empatheticIntro", "steps", "motivation"]
};

// --- Generators ---

export const generateNodeInsights = async (
  nodeType: NodeType,
  niche: string,
  language: Language,
  contextData: string = "" 
): Promise<{ 
  items: string[]; 
  subNiches?: string[];
  stats: { label: string; value: number; color?: string }[]; 
  description?: string;
  auditData?: any;
}> => {
  if (!ai) {
    console.error("API Key missing");
    throw new Error("API Key missing");
  }

  const langInstruction = language === 'pt' 
    ? "IMPORTANT: Responda estritamente em Português do Brasil (pt-BR). Use um tom de mentor experiente, empático e direto." 
    : "IMPORTANT: Respond strictly in English. Use the tone of an experienced, empathetic, and direct mentor.";

  // Refined System Instruction for Empathy and Connection
  const systemInstruction = `You are M.I.C.R.O.S., a Co-founder AI. 
  Your goal is to connect with the user, calm their anxiety about market validation, and give clear, hard-hitting advice.
  Don't just output data. Speak to the user. Use phrases like "I found this for you", "Be careful here", "This is your winning angle".
  ${langInstruction}
  Context provided from previous analysis: ${contextData || "None"}.`;

  let prompt = "";

  switch (nodeType) {
    case NodeType.TRENDS:
      prompt = `My friend, let's look at "${niche}". I need you to find 5 emerging micro-trends. Don't list generic stuff. Tell me how to ride these waves before they crash.`;
      break;
    case NodeType.PROBLEMS:
      prompt = `We need to find the money in "${niche}". List 5 burning, expensive pains users are screaming about. Show me where they are suffering so we can help them.`;
      break;
    case NodeType.ADS:
      prompt = `Let's sell to "${niche}". Act as a world-class copywriter. Give me 5 hooks that would stop the scroll immediately. Make them feel understood.`;
      break;
    case NodeType.COMPETITORS:
      prompt = `Look at the giants in "${niche}". They are slow and generic. Find 5 specific weaknesses we can exploit to steal their unhappy customers.`;
      break;
    case NodeType.GAPS:
      prompt = `Where is the blue ocean in "${niche}"? Find 5 gaps where no one is serving the audience well. This is where we will win.`;
      break;
    case NodeType.ROOT:
       prompt = `I want to dominate the "${niche}" market. First, map the ecosystem. 
       Most importantly: Suggest 3 highly specific SUB-NICHES (e.g., if niche is 'Fitness', sub-niche is 'Post-partum yoga for busy moms').
       Then list 5 key pillars of this market.`;
       break;
    case NodeType.MARKET_AUDIT:
       prompt = `Be honest with me about "${niche}". Perform a harsh Market Audit.
       1. Demand Score (0-100).
       2. Supply Score (0-100).
       3. Opportunity Score.
       4. Psychological triggers (e.g., "Growth +25%", "Saturation in 3 months").
       5. Verdict.
       `;
       break;
    default:
      return { items: ["No data"], stats: [] };
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: nodeResponseSchema,
        systemInstruction: systemInstruction,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response");
    
    const data = JSON.parse(text);

    // Handle Market Audit Special Data
    if (nodeType === NodeType.MARKET_AUDIT) {
      return {
        items: data.items || [],
        stats: [],
        description: data.summary,
        auditData: {
          demandScore: data.demand_score || 0,
          supplyScore: data.supply_score || 0,
          opportunityScore: data.opportunity_score || 0,
          verdict: data.audit_verdict || "Analysis",
          growthRate: data.growth_rate || "N/A",
          saturationRisk: data.saturation_risk || "Unknown"
        }
      };
    }

    return {
      items: data.items || [],
      subNiches: data.sub_niches || [],
      stats: data.metric_value ? [{ label: data.metric_label || 'Score', value: data.metric_value }] : [],
      description: data.summary
    };

  } catch (error) {
    console.error("Gemini Node Error:", error);
    return { 
      items: ["Error analyzing data. Check connection."], 
      stats: [{ label: "Error", value: 0 }],
      description: "Failed to fetch insights."
    };
  }
};

export const generateFinalReport = async (niche: string, aggregatedData: string, language: Language): Promise<ReportData> => {
  if (!ai) throw new Error("API Key not found");

  const langPrompt = language === 'pt' ? 'Portuguese (pt-BR)' : 'English';

  const prompt = `
    You are a specialized Startup Mentor. Create a Strategic Market Execution Plan for: "${niche}".
    Language: ${langPrompt}.
    
    Base your analysis on:
    ${aggregatedData}
    
    Structure:
    1. VERDICT: "GO", "NO-GO", or "PIVOT". Be brutally honest but supportive.
    2. SUMMARY: Connect with the user. "Look, I analyzed X and here is the truth...". Make them feel you understand the risk.
    3. SUB-NICHES: Identify the top 3 sub-niches to start small and dominate.
    4. OPPORTUNITIES: Specific business ideas.
    5. TECH STACK: Tools to build MVP.
    
    Return strictly JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: reportResponseSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty report response");
    
    const data = JSON.parse(text);
    
    return {
      ...data,
      niche,
      generatedAt: new Date()
    };

  } catch (error) {
    console.error("Report Generation Error", error);
    throw error;
  }
};

export const generateMentorAdvice = async (opportunity: string, language: Language): Promise<MentorAdvice> => {
  if (!ai) throw new Error("API Key not found");
  
  const langPrompt = language === 'pt' ? 'Portuguese (pt-BR)' : 'English';

  const prompt = `
    The user has decided to tackle this opportunity: "${opportunity}".
    Act as a supportive, wise Co-founder.
    
    1. Acknowledge their fear/excitement (Empathetic Intro).
    2. Give them a "Day 1 Plan". Just 3-4 very specific steps to start NOW. Not "Do market research", but "Go to Reddit r/marketing and search for X".
    3. Motivate them to take action.
    
    Language: ${langPrompt}.
    Return strictly JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_ID,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: mentorAdviceSchema,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty advice response");
    return JSON.parse(text);
  } catch (e) {
    return {
      stepTitle: "Connection Error",
      empatheticIntro: "I'm having trouble connecting to the strategy core.",
      steps: ["Check internet", "Try again"],
      motivation: "We can fix this."
    }
  }
}
