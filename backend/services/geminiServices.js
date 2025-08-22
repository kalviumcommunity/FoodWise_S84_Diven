import dotenv from "dotenv";
dotenv.config();
const apiKey = process.env.GOOGLE_API_KEY || "";

// Lightweight REST call to Gemini 2.0 Flash for quick prompts (parity with provided curl)
export async function quickGenerateGemini({ text }) {
  if (!text) {
    return { error: "text is required" };
  }
  if (!apiKey) {
    return { reply: "Set GOOGLE_API_KEY to enable AI.", model: "gemini-2.0-flash" };
  }

  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  const resp = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text,
            },
          ],
        },
      ],
    }),
  });

  if (!resp.ok) {
    const errText = await resp.text();
    return { error: `Gemini API error ${resp.status}`, details: errText };
  }
  const data = await resp.json();
  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  return { reply, raw: data, model: "gemini-2.0-flash" };
}

// Compare two foods for a goal using Flash REST; returns structured JSON
export async function compareFoodsFlash({ food1, food2, goal }) {
  if (!food1 || !food2) return { error: "food1 and food2 are required" };
  const prompt = [
    "You are a certified nutritionist. Compare the two foods based on the user's health goal.",
    "Respond with strict JSON only using keys: food1, food2, summary.",
    "Each food should include: sugar, fiber, calories, protein, fat, sodium, verdict.",
    `Inputs: food1=${food1}, food2=${food2}, goal=${goal || "general"}`,
  ].join("\n");

  const { reply } = await quickGenerateGemini({ text: prompt });
  try {
    const start = reply.indexOf("{");
    const end = reply.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(reply.slice(start, end + 1));
    }
  } catch (_) {}
  return { raw: reply };
}

// Generate a 7-day diet plan using Flash REST; returns structured JSON
export async function generatePlanFlash({ preferences = [], allergies = [], calories, goal }) {
  const prompt = [
    "You are a certified nutritionist. Create a concise 7-day plan with meals and macros.",
    "Respond with strict JSON only: {days:[{meals:{breakfast,lunch,dinner,snacks:[]},macros:{calories,protein_g,carbs_g,fat_g}}],dailyTotals,notes}",
    `preferences=${JSON.stringify(preferences)}`,
    `allergies=${JSON.stringify(allergies)}`,
    `calories=${calories || "auto"}`,
    `goal=${goal || "balanced"}`,
  ].join("\n");

  const { reply } = await quickGenerateGemini({ text: prompt });
  try {
    const start = reply.indexOf("{");
    const end = reply.lastIndexOf("}");
    if (start !== -1 && end !== -1 && end > start) {
      return JSON.parse(reply.slice(start, end + 1));
    }
  } catch (_) {}
  return { raw: reply };
}

// Back-compat aliases for existing controllers/routes
export async function generateComparison({ food1, food2, goal }) {
  return compareFoodsFlash({ food1, food2, goal });
}

export async function generateDietPlan({ preferences = [], allergies = [], calories, goal }) {
  return generatePlanFlash({ preferences, allergies, calories, goal });
}


