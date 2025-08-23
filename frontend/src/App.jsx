import React, { useState } from 'react'
import Header from './components/Header'
import ChatInterface from './components/ChatInterface'
import FunctionCalling from './components/FunctionCalling'
import HealthCheck from './components/HealthCheck'
import { Brain, MessageCircle, Zap, Activity } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('chat')

  const tabs = [
    { id: 'chat', name: 'AI Chat', icon: MessageCircle, description: 'Zero-shot prompting with Gemini-like input' },
    { id: 'functions', name: 'Function Calling', icon: Zap, description: 'Structured function execution' },
    { id: 'health', name: 'System Health', icon: Activity, description: 'Backend status and AI concepts' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4 justify-center">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-102'
                  }`}
                >
                  <Icon size={20} />
                  {tab.name}
                </button>
              )
            })}
          </div>
          
          {/* Tab Description */}
          <div className="text-center mt-4">
            <p className="text-gray-600 max-w-2xl mx-auto">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'functions' && <FunctionCalling />}
          {activeTab === 'health' && <HealthCheck />}
        </div>
      </main>

      {/* AI Concepts Badge */}
      <div className="fixed bottom-6 right-6">
        <div className="bg-white rounded-full shadow-lg p-3 border border-gray-200">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Brain size={16} className="text-primary-600" />
            <span>AI Concepts</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
