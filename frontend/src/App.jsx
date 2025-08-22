import { useState } from 'react'
import axios from 'axios'

function Section({ title, children }) {
	return (
		<section className="max-w-4xl mx-auto my-8 p-6 bg-white rounded-lg shadow">
			<h2 className="text-xl font-semibold mb-4">{title}</h2>
			{children}
		</section>
	)
}

export default function App() {
	const [prompt, setPrompt] = useState('Explain how AI works in a few words')
	const [reply, setReply] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')

	const [compare, setCompare] = useState({ food1: '', food2: '', goal: '' })
	const [compareResult, setCompareResult] = useState(null)
	const [isCompareLoading, setIsCompareLoading] = useState(false) // 🔹 NEW

	const [planInput, setPlanInput] = useState({ preferences: '', allergies: '', calories: '', goal: '' })
	const [planResult, setPlanResult] = useState(null)

	async function submitQuick(e) {
		e.preventDefault()
		if (!prompt.trim()) {
			setError('Please enter a prompt')
			return
		}
		setError('')
		setIsLoading(true)
		setReply('')
		try {
			const res = await axios.post('/api/quick', { text: prompt })
			setReply(res.data.reply || '')
		} catch (err) {
			setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
		} finally {
			setIsLoading(false)
		}
	}

	async function submitCompare(e) {
		e.preventDefault()
		setIsCompareLoading(true) // 🔹 start loading
		try {
			const res = await axios.post('/api/compare', compare)
			setCompareResult({
				...res.data,
				food1Name: compare.food1,
				food2Name: compare.food2
			})
		} catch (err) {
			console.error(err)
		} finally {
			setIsCompareLoading(false) // 🔹 stop loading
		}
	}

	async function submitPlan(e) {
		e.preventDefault()
		const payload = {
			preferences: planInput.preferences.split(',').map(s => s.trim()).filter(Boolean),
			allergies: planInput.allergies.split(',').map(s => s.trim()).filter(Boolean),
			calories: planInput.calories ? Number(planInput.calories) : undefined,
			goal: planInput.goal
		}
		const res = await axios.post('/api/plan', payload)
		setPlanResult(res.data)
	}

	function CompareTable({ data }) {
		if (!data) return null
		const f1 = data.food1 || {}
		const f2 = data.food2 || {}
		const rows = [
			['Calories', f1.calories, f2.calories],
			['Protein', f1.protein, f2.protein],
			['Fat', f1.fat, f2.fat],
			['Sugar', f1.sugar, f2.sugar],
			['Fiber', f1.fiber, f2.fiber],
			['Sodium', f1.sodium, f2.sodium],
			['Verdict', f1.verdict, f2.verdict],
		]
		return (
			<div className="mt-4">
				{data.summary && <div className="mb-3 font-semibold">{data.summary}</div>}
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm border border-gray-200">
						<thead className="bg-gray-100">
							<tr>
								<th className="p-2 text-left border-b border-gray-200">Metric</th>
								<th className="p-2 text-left border-b border-gray-200">{data.food1Name}</th>
								<th className="p-2 text-left border-b border-gray-200">{data.food2Name}</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((r, i) => (
								<tr key={i} className="odd:bg-white even:bg-gray-50">
									<td className="p-2 font-medium border-t border-gray-100">{r[0]}</td>
									<td className="p-2 border-t border-gray-100"><strong>{r[1] ?? '-'}</strong></td>
									<td className="p-2 border-t border-gray-100"><strong>{r[2] ?? '-'}</strong></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		)
	}

	function PlanView({ data }) {
		if (!data) return null
		const day = Array.isArray(data.days) && data.days.length > 0 ? data.days[0] : null
		const meals = (day && day.meals) || {}
		const macros = (day && day.macros) || data.macros || null
		return (
			<div className="mt-4 space-y-4">
				{data.notes && <div className="font-semibold">{data.notes}</div>}
				<div className="overflow-x-auto">
					<table className="min-w-full text-sm border border-gray-200">
						<thead className="bg-gray-100">
							<tr>
								<th className="p-2 text-left border-b border-gray-200">Meal</th>
								<th className="p-2 text-left border-b border-gray-200">Items</th>
							</tr>
						</thead>
						<tbody>
							{['breakfast', 'lunch', 'dinner', 'snacks'].map((m) => (
								<tr key={m} className="odd:bg-white even:bg-gray-50">
									<td className="p-2 font-medium border-t border-gray-100 capitalize">{m}</td>
									<td className="p-2 border-t border-gray-100"><strong>{Array.isArray(meals[m]) ? meals[m].join(', ') : (meals[m] || '-')}</strong></td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
				{macros && (
					<div className="overflow-x-auto">
						<table className="min-w-full text-sm border border-gray-200">
							<thead className="bg-gray-100">
								<tr>
									<th className="p-2 text-left border-b border-gray-200">Calories</th>
									<th className="p-2 text-left border-b border-gray-200">Protein (g)</th>
									<th className="p-2 text-left border-b border-gray-200">Carbs (g)</th>
									<th className="p-2 text-left border-b border-gray-200">Fat (g)</th>
								</tr>
							</thead>
							<tbody>
								<tr className="bg-white">
									<td className="p-2 border-t border-gray-100"><strong>{macros.calories ?? '-'}</strong></td>
									<td className="p-2 border-t border-gray-100"><strong>{macros.protein_g ?? '-'}</strong></td>
									<td className="p-2 border-t border-gray-100"><strong>{macros.carbs_g ?? '-'}</strong></td>
									<td className="p-2 border-t border-gray-100"><strong>{macros.fat_g ?? '-'}</strong></td>
								</tr>
							</tbody>
						</table>
					</div>
				)}
			</div>
		)
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<header className="bg-emerald-600 text-white p-4">
				<div className="max-w-4xl mx-auto">
					<h1 className="text-2xl font-bold">FoodWise – Smart Nutrition Assistant</h1>
					<p className="text-sm opacity-90">Compare foods, set goals, generate plans, and ask quick questions.</p>
				</div>
			</header>

			<Section title="Compare Foods">
				<form className="grid grid-cols-1 md:grid-cols-4 gap-3" onSubmit={submitCompare}>
					<input className="border p-2 rounded" placeholder="Food 1" value={compare.food1} onChange={e=>setCompare({...compare, food1:e.target.value})} />
					<input className="border p-2 rounded" placeholder="Food 2" value={compare.food2} onChange={e=>setCompare({...compare, food2:e.target.value})} />
					<input className="border p-2 rounded" placeholder="Goal (e.g., diabetic)" value={compare.goal} onChange={e=>setCompare({...compare, goal:e.target.value})} />
					
					<button 
						className="bg-emerald-600 text-white rounded px-4 py-2 flex items-center justify-center gap-2"
						disabled={isCompareLoading}
					>
						{isCompareLoading ? (
							<>
								<svg
									className="animate-spin h-4 w-4 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
									/>
								</svg>
								Comparing…
							</>
						) : (
							"Compare"
						)}
					</button>
				</form>
				{compareResult && (
					<CompareTable data={compareResult} />
				)}
			</Section>

			<Section title="Generate Diet Plan">
				<form className="grid grid-cols-1 md:grid-cols-5 gap-3" onSubmit={submitPlan}>
					<input className="border p-2 rounded" placeholder="Preferences (comma)" value={planInput.preferences} onChange={e=>setPlanInput({...planInput, preferences:e.target.value})} />
					<input className="border p-2 rounded" placeholder="Allergies (comma)" value={planInput.allergies} onChange={e=>setPlanInput({...planInput, allergies:e.target.value})} />
					<input className="border p-2 rounded" placeholder="Daily Calories" value={planInput.calories} onChange={e=>setPlanInput({...planInput, calories:e.target.value})} />
					<input className="border p-2 rounded" placeholder="Goal (e.g., weight loss)" value={planInput.goal} onChange={e=>setPlanInput({...planInput, goal:e.target.value})} />
					<button className="bg-emerald-600 text-white rounded px-4 py-2">Generate</button>
				</form>
				{planResult && (
					<PlanView data={planResult} />
				)}
			</Section>

			<Section title="Quick Gemini 2.0 Flash (REST)">
				<form className="flex gap-3" onSubmit={submitQuick}>
					<input
						className="flex-1 border p-2 rounded"
						placeholder="Enter a short prompt"
						value={prompt}
						onChange={e=>setPrompt(e.target.value)}
					/>
					<button className="bg-emerald-600 text-white rounded px-4 py-2" disabled={isLoading}>
						{isLoading ? 'Asking…' : 'Ask'}
					</button>
				</form>
				{error && (
					<div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded p-3">{error}</div>
				)}
				{reply && (
					<div className="mt-4 bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">{reply}</div>
				)}
			</Section>

			<footer className="text-center text-xs text-gray-500 py-6">Built with MERN + Gemini</footer>
		</div>
	)
}
