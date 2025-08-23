import React, { useEffect, useState } from 'react'
import axios from 'axios'

function HealthCheck() {
  const [health, setHealth] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await axios.get('/api/health')
        setHealth(res.data)
      } catch (e) {
        setError('Backend not reachable. Is it running on port 5000?')
      }
    }
    fetchHealth()
  }, [])

  if (error) {
    return <div className="card text-red-600">{error}</div>
  }

  if (!health) {
    return <div className="card">Loading...</div>
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Backend Health</h3>
      <pre className="text-sm bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto">{JSON.stringify(health, null, 2)}</pre>
    </div>
  )
}

export default HealthCheck
