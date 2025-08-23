const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Minimal nutrition data per 100g (very simplified)
const NUTRITION_DB = {
  banana: { calories: 89, protein: 1.1, carbs: 23, sugar: 12, fiber: 2.6, fat: 0.3 },
  apple: { calories: 52, protein: 0.3, carbs: 14, sugar: 10, fiber: 2.4, fat: 0.2 },
  rice: { calories: 130, protein: 2.4, carbs: 28, sugar: 0.1, fiber: 0.4, fat: 0.3 },
  oats: { calories: 389, protein: 16.9, carbs: 66.3, sugar: 0.0, fiber: 10.6, fat: 6.9 },
  egg: { calories: 155, protein: 13, carbs: 1.1, sugar: 1.1, fiber: 0, fat: 11 },
  chicken: { calories: 165, protein: 31, carbs: 0, sugar: 0, fiber: 0, fat: 3.6 },
  milk: { calories: 60, protein: 3.2, carbs: 5, sugar: 5, fiber: 0, fat: 3.3 },
  yogurt: { calories: 59, protein: 10, carbs: 3.6, sugar: 3.2, fiber: 0, fat: 0.4 },
  almond: { calories: 579, protein: 21, carbs: 22, sugar: 4.4, fiber: 12.5, fat: 50 },
  broccoli: { calories: 55, protein: 3.7, carbs: 11, sugar: 2.2, fiber: 3.8, fat: 0.6 },
};

// System prompt for nutrition context (System and User prompt concept)
const SYSTEM_PROMPT = `You are a certified nutritionist. Analyze and compare food based on health goals and nutrient content. Always give clear structured insights.`;

// Zero-shot prompting examples (Zero shot prompting concept)
const ZERO_SHOT_EXAMPLES = {
  "food_comparison": "Compare two foods based on nutrition goals",
  "meal_analysis": "Analyze a meal for nutritional balance",
  "diet_recommendation": "Recommend diet changes based on health goals"
};

// Root route (fixes 404 on Render base URL)
app.get("/", (req, res) => {
  res.send("✅ FoodWise backend is running! Use /api/* endpoints.");
});


// Function calling structure (Function calling concept)
const AVAILABLE_FUNCTIONS = {
  "compareFoods": {
    "description": "Compare two food items nutritionally",
    "parameters": {
      "food1": "string",
      "food2": "string", 
      "goal": "string"
    }
  },
  "analyzeMeal": {
    "description": "Analyze nutritional content of a meal",
    "parameters": {
      "meal": "string",
      "dietary_restrictions": "array"
    }
  }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FoodWise backend is running',
    available_functions: Object.keys(AVAILABLE_FUNCTIONS),
    concepts: ['Zero-shot prompting', 'Function calling', 'Structured output', 'System prompts']
  });
});

// Simple comparison endpoint
app.post('/api/compare', (req, res) => {
  try {
    const { food1, food2, goal = 'general' } = req.body;
    if (!food1 || !food2) {
      return res.status(400).json({ error: 'food1 and food2 are required' });
    }

    // Get nutrition data or generate estimated data for unknown foods
    const f1 = getNutritionData(String(food1).toLowerCase());
    const f2 = getNutritionData(String(food2).toLowerCase());

    // Score based on goal
    const scoreForGoal = (n) => {
      switch (String(goal).toLowerCase()) {
        case 'diabetic':
        case 'diabetic diet':
          return (n.fiber * 2 + n.protein) - (n.sugar * 1.5 + n.carbs * 0.5);
        case 'weight loss':
          return (n.protein * 2 + n.fiber * 1.5) - (n.calories * 0.05 + n.fat * 0.5);
        case 'muscle gain':
          return (n.protein * 3) - (n.fat * 0.5);
        default:
          return (n.fiber + n.protein) - (n.sugar * 0.8);
      }
    };

    const s1 = scoreForGoal(f1);
    const s2 = scoreForGoal(f2);

    const verdict = s1 === s2 ? 'Both are similar for this goal.' : (s1 > s2 ? `${food1} is better for ${goal}.` : `${food2} is better for ${goal}.`);

    return res.json({
      success: true,
      goal,
      comparison: {
        [food1]: f1,
        [food2]: f2,
        scores: { [food1]: s1, [food2]: s2 },
        verdict,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// Meal plan endpoint (supports multi-day/month and detailed quantities)
app.post('/api/plan', (req, res) => {
  try {
    const { goal = 'general', calories = 1800, duration = 1, unit = 'days' } = req.body || {};
    const cal = Number(calories) || 1800;
    const num = Math.max(1, parseInt(duration, 10) || 1);
    const totalDays = String(unit).toLowerCase().startsWith('month') ? num * 30 : num;

    const plan = buildDetailedPlan(goal.toLowerCase(), cal, totalDays);
    return res.json({ success: true, goal, calories: cal, days: totalDays, plan, timestamp: new Date().toISOString() });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Internal error' });
  }
});

// Function to get nutrition data for any food (known or estimated)
function getNutritionData(foodName) {
  // Check if we have exact data
  if (NUTRITION_DB[foodName]) {
    return { ...NUTRITION_DB[foodName], source: 'database' };
  }
  
  // Generate estimated data based on food type
  const lowerFood = foodName.toLowerCase();
  
  // Estimate based on food categories
  if (lowerFood.includes('fruit') || lowerFood.includes('berry') || lowerFood.includes('orange') || lowerFood.includes('grape')) {
    return {
      calories: 60,
      protein: 0.8,
      carbs: 15,
      sugar: 12,
      fiber: 2.5,
      fat: 0.3,
      source: 'estimated (fruit category)'
    };
  }
  
  if (lowerFood.includes('vegetable') || lowerFood.includes('leafy') || lowerFood.includes('spinach') || lowerFood.includes('kale')) {
    return {
      calories: 25,
      protein: 2.5,
      carbs: 4,
      sugar: 1.5,
      fiber: 2.8,
      fat: 0.4,
      source: 'estimated (vegetable category)'
    };
  }
  
  if (lowerFood.includes('meat') || lowerFood.includes('beef') || lowerFood.includes('pork') || lowerFood.includes('lamb')) {
    return {
      calories: 250,
      protein: 26,
      carbs: 0,
      sugar: 0,
      fiber: 0,
      fat: 15,
      source: 'estimated (meat category)'
    };
  }
  
  if (lowerFood.includes('fish') || lowerFood.includes('salmon') || lowerFood.includes('tuna') || lowerFood.includes('cod')) {
    return {
      calories: 120,
      protein: 22,
      carbs: 0,
      sugar: 0,
      fiber: 0,
      fat: 4,
      source: 'estimated (fish category)'
    };
  }
  
  if (lowerFood.includes('grain') || lowerFood.includes('wheat') || lowerFood.includes('barley') || lowerFood.includes('quinoa')) {
    return {
      calories: 120,
      protein: 4,
      carbs: 25,
      sugar: 0.5,
      fiber: 3,
      fat: 1,
      source: 'estimated (grain category)'
    };
  }
  
  if (lowerFood.includes('nut') || lowerFood.includes('seed') || lowerFood.includes('pistachio') || lowerFood.includes('walnut')) {
    return {
      calories: 600,
      protein: 20,
      carbs: 20,
      sugar: 4,
      fiber: 10,
      fat: 55,
      source: 'estimated (nut/seed category)'
    };
  }
  
  // Default fallback for unknown foods
  return {
    calories: 100,
    protein: 5,
    carbs: 15,
    sugar: 5,
    fiber: 2,
    fat: 3,
    source: 'estimated (general category)'
  };
}

function buildDetailedPlan(goal, calories, days) {
  // naive macro split and food picks
  const splits = {
    general: { proteinPct: 0.25, carbsPct: 0.45, fatPct: 0.30 },
    'weight loss': { proteinPct: 0.30, carbsPct: 0.35, fatPct: 0.35 },
    'muscle gain': { proteinPct: 0.35, carbsPct: 0.45, fatPct: 0.20 },
    diabetic: { proteinPct: 0.30, carbsPct: 0.30, fatPct: 0.40 },
  };
  const s = splits[goal] || splits.general;
  const proteinGrams = (calories * s.proteinPct) / 4;
  const carbsGrams = (calories * s.carbsPct) / 4;
  const fatGrams = (calories * s.fatPct) / 9;

  const baseMeals = [
    {
      name: 'Breakfast',
      items: goal === 'diabetic' ? ['oats', 'yogurt', 'apple'] : ['oats', 'yogurt', 'banana'],
      note: goal === 'diabetic' ? 'Lower sugar fruit used.' : 'Balanced fiber and protein.'
    },
    {
      name: 'Lunch',
      items: ['chicken', 'rice', 'broccoli'],
      note: goal === 'weight loss' ? 'Keep rice portion modest.' : 'Add extra chicken for protein if needed.'
    },
    {
      name: 'Dinner',
      items: ['egg', 'broccoli', 'almond'],
      note: goal === 'muscle gain' ? 'Add extra eggs for protein.' : 'Light dinner, keep fats moderate.'
    },
  ];

  // Distribute calories per meal: 30% breakfast, 40% lunch, 30% dinner
  const mealCalSplit = [0.30, 0.40, 0.30];

  const daysArray = Array.from({ length: days }, (_, idx) => {
    const meals = baseMeals.map((meal, i) => {
      const mealCalories = calories * mealCalSplit[i];
      const perItemCalories = mealCalories / meal.items.length;
      const detailedItems = meal.items.map((item) => {
        const n = getNutritionData(item);
        const grams = Math.round((perItemCalories / (n.calories / 100)) * 10) / 10; // grams per item
        return {
          name: item,
          grams,
          approx_calories: Math.round((n.calories / 100) * grams),
          source: n.source,
        };
      });
      return { ...meal, items: detailedItems };
    });

    return { day: idx + 1, meals };
  });

  return {
    macros: {
      protein_g: Math.round(proteinGrams),
      carbs_g: Math.round(carbsGrams),
      fat_g: Math.round(fatGrams),
    },
    days: daysArray,
  };
}

// Main endpoint with enhanced AI concepts
app.post('/api/generate', (req, res) => {
  try {
    const { contents, temperature = 0.7, top_p = 0.9, max_tokens = 1000 } = req.body;
    
    // Validate input format
    if (!contents || !Array.isArray(contents) || contents.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input format. Expected contents array.' 
      });
    }

    // Extract text from the first content part
    const firstContent = contents[0];
    if (!firstContent.parts || !Array.isArray(firstContent.parts) || firstContent.parts.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid content format. Expected parts array.' 
      });
    }

    const text = firstContent.parts[0]?.text;
    if (!text) {
      return res.status(400).json({ 
        error: 'No text found in parts.' 
      });
    }

    // Zero-shot prompting implementation
    const zeroShotResponse = processZeroShotPrompt(text);
    
    // Function calling detection
    const detectedFunction = detectFunctionCall(text);
    
    // Structured output (Structured output concept)
    const response = {
      success: true,
      input: text,
      system_prompt: SYSTEM_PROMPT,
      zero_shot_response: zeroShotResponse,
      detected_function: detectedFunction,
      ai_parameters: {
        temperature: parseFloat(temperature),
        top_p: parseFloat(top_p),
        max_tokens: parseInt(max_tokens)
      },
      timestamp: new Date().toISOString()
    };

    res.json(response);

  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ 
      error: 'Internal server error' 
    });
  }
});

// Zero-shot prompting implementation
function processZeroShotPrompt(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('compare') || lowerText.includes('vs') || lowerText.includes('difference')) {
    return {
      type: 'food_comparison',
      example: ZERO_SHOT_EXAMPLES.food_comparison,
      confidence: 0.9
    };
  }
  
  if (lowerText.includes('meal') || lowerText.includes('breakfast') || lowerText.includes('lunch') || lowerText.includes('dinner')) {
    return {
      type: 'meal_analysis',
      example: ZERO_SHOT_EXAMPLES.meal_analysis,
      confidence: 0.8
    };
  }
  
  if (lowerText.includes('diet') || lowerText.includes('recommend') || lowerText.includes('plan')) {
    return {
      type: 'diet_recommendation',
      example: ZERO_SHOT_EXAMPLES.diet_recommendation,
      confidence: 0.7
    };
  }
  
  return {
    type: 'general_nutrition',
    example: 'General nutrition advice',
    confidence: 0.5
  };
}

// Function calling detection
function detectFunctionCall(text) {
  const lowerText = text.toLowerCase();
  
  for (const [funcName, funcDetails] of Object.entries(AVAILABLE_FUNCTIONS)) {
    if (lowerText.includes(funcName.toLowerCase().replace('_', ' '))) {
      return {
        function_name: funcName,
        description: funcDetails.description,
        parameters: funcDetails.parameters,
        confidence: 0.8
      };
    }
  }
  
  return null;
}

// New endpoint for function calling (Function calling concept)
app.post('/api/function-call', (req, res) => {
  try {
    const { function_name, parameters } = req.body;
    
    if (!function_name || !AVAILABLE_FUNCTIONS[function_name]) {
      return res.status(400).json({
        error: 'Invalid function name',
        available_functions: Object.keys(AVAILABLE_FUNCTIONS)
      });
    }
    
    // Execute the function (mock implementation)
    const result = executeFunction(function_name, parameters);
    
    res.json({
      success: true,
      function_name,
      parameters,
      result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Function call error:', error);
    res.status(500).json({ error: 'Function execution failed' });
  }
});

// Function execution (mock implementation)
function executeFunction(functionName, parameters) {
  switch (functionName) {
    case 'compareFoods':
      return {
        food1_analysis: `Analysis of ${parameters.food1}`,
        food2_analysis: `Analysis of ${parameters.food2}`,
        comparison: `Comparison based on ${parameters.goal}`,
        recommendation: `Recommendation for ${parameters.goal}`
      };
      
    case 'analyzeMeal':
      return {
        meal: parameters.meal,
        nutritional_breakdown: 'Mock nutritional analysis',
        dietary_compliance: 'Mock compliance check',
        suggestions: 'Mock improvement suggestions'
      };
      
    default:
      return { error: 'Unknown function' };
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 FoodWise backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🤖 Generate endpoint: http://localhost:${PORT}/api/generate`);
  console.log(`🔧 Function calling: http://localhost:${PORT}/api/function-call`);
  console.log(`🍎 Compare foods: http://localhost:${PORT}/api/compare`);
  console.log(`📋 Generate plan: http://localhost:${PORT}/api/plan`);
  console.log(`🧠 AI Concepts: Zero-shot, Function calling, Structured output, System prompts`);
});
