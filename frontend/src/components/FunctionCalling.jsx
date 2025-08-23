import React, { useState } from 'react'
import axios from 'axios'

function FunctionCalling() {
  const [food1, setFood1] = useState('banana')
  const [food2, setFood2] = useState('apple')
  const [goal, setGoal] = useState('diabetic diet')
  const [compareResult, setCompareResult] = useState(null)
  const [planGoal, setPlanGoal] = useState('general')
  const [calories, setCalories] = useState(1800)
  const [duration, setDuration] = useState(1)
  const [unit, setUnit] = useState('days')
  const [planResult, setPlanResult] = useState(null)
  const [loading, setLoading] = useState(false)

  // Helpers: quick portion suggestions to meet macros using foods from our DB
  const portions = {
    protein: [
      { name: 'chicken', per100: 31 },
      { name: 'yogurt (greek)', per100: 10 },
      { name: 'egg', per100: 13 },
    ],
    carbs: [
      { name: 'rice (cooked)', per100: 28 },
      { name: 'oats (dry)', per100: 66 },
      { name: 'banana', per100: 23 },
    ],
    fat: [
      { name: 'almond', per100: 50 },
      { name: 'egg', per100: 11 },
    ],
  }

  const portionFor = (target, per100) => Math.round((target / per100) * 100)

  const handleCompare = async () => {
    setLoading(true)
    setCompareResult(null)
    try {
      const res = await axios.post('/api/compare', { food1, food2, goal })
      setCompareResult(res.data)
    } catch (e) {
      setCompareResult({ error: 'Failed to compare foods' })
    } finally {
      setLoading(false)
    }
  }

  const handlePlan = async () => {
    setLoading(true)
    setPlanResult(null)
    try {
      const res = await axios.post('/api/plan', { goal: planGoal, calories: Number(calories), duration: Number(duration), unit })
      setPlanResult(res.data)
    } catch (e) {
      console.error('Plan generation failed:', e)
      setPlanResult({ error: 'Failed to generate plan', details: e?.response?.data || String(e) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Compare Foods */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Compare Two Foods</h3>
        <p className="text-sm text-gray-600 mb-4">Enter any food names - we'll use our database or estimate nutrition values!</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input value={food1} onChange={(e)=>setFood1(e.target.value)} className="input-field" placeholder="Enter first food (e.g., banana)" />
          <input value={food2} onChange={(e)=>setFood2(e.target.value)} className="input-field" placeholder="Enter second food (e.g., apple)" />
          <input value={goal} onChange={(e)=>setGoal(e.target.value)} className="input-field" placeholder="goal e.g., diabetic diet" />
          <button onClick={handleCompare} className="btn-primary" disabled={loading}>Compare</button>
        </div>
        
        {/* Quick Examples */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-xs text-gray-500">Quick examples:</span>
          <button onClick={() => {setFood1('banana'); setFood2('apple'); setGoal('diabetic diet')}} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">banana vs apple</button>
          <button onClick={() => {setFood1('chicken'); setFood2('salmon'); setGoal('muscle gain')}} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">chicken vs salmon</button>
          <button onClick={() => {setFood1('oats'); setFood2('rice'); setGoal('weight loss')}} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded">oats vs rice</button>
        </div>

        {compareResult && !compareResult.error && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-base">
              <thead>
                <tr className="text-left text-gray-700">
                  <th className="py-3 pr-6">Nutrient</th>
                  <th className="py-3 pr-6 capitalize">{food1}</th>
                  <th className="py-3 pr-6 capitalize">{food2}</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(compareResult.comparison[food1]).filter(k => k !== 'source').map((k)=> (
                  <tr key={k} className="border-t">
                    <td className="py-3 pr-6 capitalize">{k}</td>
                    <td className="py-3 pr-6">{compareResult.comparison[food1][k]}</td>
                    <td className="py-3 pr-6">{compareResult.comparison[food2][k]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 space-y-2">
              <p className="font-semibold text-gray-900 text-lg">Verdict: {compareResult.comparison.verdict}</p>
              <div className="text-sm text-gray-600">
                <p>Data source for {food1}: {compareResult.comparison[food1].source}</p>
                <p>Data source for {food2}: {compareResult.comparison[food2].source}</p>
              </div>
            </div>
          </div>
        )}
        {compareResult && compareResult.error && (
          <p className="text-red-600">{compareResult.error}</p>
        )}
      </div>

      {/* Meal Plan */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Generate Food Plan</h3>
        <p className="text-sm text-gray-600 mb-4">Choose goal, calories (step 100), and duration (days or months).</p>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <select value={planGoal} onChange={(e)=>setPlanGoal(e.target.value)} className="input-field h-10">
            {['general','weight loss','muscle gain','diabetic'].map(g=> <option key={g} value={g}>{g}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <button type="button" className="btn-secondary h-10 px-3" onClick={()=> setCalories(c => Math.max(800, c - 100))}>-100</button>
            <input type="number" step="100" value={calories} onChange={(e)=>setCalories(Number(e.target.value))} className="input-field h-10 w-32" placeholder="Calories" />
            <button type="button" className="btn-secondary h-10 px-3" onClick={()=> setCalories(c => c + 100)}>+100</button>
          </div>
          <input type="number" min="1" value={duration} onChange={(e)=>setDuration(e.target.value)} className="input-field h-10 w-24" placeholder="Days" />
          <select value={unit} onChange={(e)=>setUnit(e.target.value)} className="input-field h-10 w-32">
            {['days','months'].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <button onClick={handlePlan} className="btn-primary h-10" disabled={loading}>Generate Plan</button>
        </div>

        {planResult && !planResult.error && planResult.plan && (
          <div className="space-y-4">
            <div className="text-base text-gray-800 font-medium">Duration: {planResult.days} day(s) · Macros/day: P {planResult?.plan?.macros?.protein_g}g · C {planResult?.plan?.macros?.carbs_g}g · F {planResult?.plan?.macros?.fat_g}g</div>
            {Array.isArray(planResult?.plan?.days) && planResult.plan.days.map((d) => (
              <div key={d.day} className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
                <div className="font-semibold text-gray-900 text-lg">Day {d.day}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {Array.isArray(d.meals) && d.meals.map((m)=> (
                    <div key={m.name} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="font-semibold text-gray-800 text-base">{m.name}</div>
                      <ul className="mt-2 text-base text-gray-800 list-disc list-inside space-y-1.5">
                        {Array.isArray(m.items) && m.items.map((it, idx) => (
                          <li key={idx}>{it.name}: {it.grams} g (~{it.approx_calories} kcal)</li>
                        ))}
                      </ul>
                      <div className="text-sm text-gray-600 mt-2">{m.note}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Macro completion suggestions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
              <div className="font-semibold text-gray-900 text-lg">Complete Your Macros (per day)</div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="font-medium text-gray-800 mb-2">Protein target ≈ {planResult?.plan?.macros?.protein_g} g</div>
                  <ul className="text-sm text-gray-800 space-y-1">
                    <li>Chicken: ~{portionFor(planResult?.plan?.macros?.protein_g, portions.protein[0].per100)} g</li>
                    <li>Greek yogurt: ~{portionFor(planResult?.plan?.macros?.protein_g, portions.protein[1].per100)} g</li>
                    <li>Eggs: ~{portionFor(planResult?.plan?.macros?.protein_g, portions.protein[2].per100)} g</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="font-medium text-gray-800 mb-2">Carbs target ≈ {planResult?.plan?.macros?.carbs_g} g</div>
                  <ul className="text-sm text-gray-800 space-y-1">
                    <li>Rice (cooked): ~{portionFor(planResult?.plan?.macros?.carbs_g, portions.carbs[0].per100)} g</li>
                    <li>Oats (dry): ~{portionFor(planResult?.plan?.macros?.carbs_g, portions.carbs[1].per100)} g</li>
                    <li>Banana: ~{portionFor(planResult?.plan?.macros?.carbs_g, portions.carbs[2].per100)} g</li>
                  </ul>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="font-medium text-gray-800 mb-2">Fat target ≈ {planResult?.plan?.macros?.fat_g} g</div>
                  <ul className="text-sm text-gray-800 space-y-1">
                    <li>Almonds: ~{portionFor(planResult?.plan?.macros?.fat_g, portions.fat[0].per100)} g</li>
                    <li>Eggs: ~{portionFor(planResult?.plan?.macros?.fat_g, portions.fat[1].per100)} g</li>
                  </ul>
                </div>
              </div>
              <div className="text-xs text-gray-500">Estimates assume grams of macronutrient per 100 g food; adjust to taste and specific brands.</div>
            </div>
          </div>
        )}
        {planResult && !planResult.error && !planResult.plan && (
          <div className="text-sm text-red-600">Unexpected response. Details:
            <pre className="bg-gray-50 p-2 border rounded mt-2 overflow-x-auto">{JSON.stringify(planResult, null, 2)}</pre>
          </div>
        )}
        {planResult && planResult.error && (
          <div className="text-red-600 text-sm">
            {planResult.error}
            {planResult.details && (
              <pre className="bg-red-50 p-2 border rounded mt-2 overflow-x-auto">{JSON.stringify(planResult.details, null, 2)}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default FunctionCalling
