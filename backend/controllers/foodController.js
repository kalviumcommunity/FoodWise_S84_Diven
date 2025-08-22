import {
  quickGenerateGemini,
  generateComparison,
  generateDietPlan,
} from "../services/geminiServices.js";

export async function quickGenerateController(req, res, next) {
  try {
    const { text } = req.body || {};
    const result = await quickGenerateGemini({ text });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function compareFoodsController(req, res, next) {
  try {
    const { food1, food2, goal } = req.body || {};
    const result = await generateComparison({ food1, food2, goal });
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function generatePlanController(req, res, next) {
  try {
    const { preferences, allergies, calories, goal } = req.body || {};
    const result = await generateDietPlan({ preferences, allergies, calories, goal });
    res.json(result);
  } catch (error) {
    next(error);
  }
}


