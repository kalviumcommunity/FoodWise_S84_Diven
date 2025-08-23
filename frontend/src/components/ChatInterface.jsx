import React, { useState } from 'react'
import { Send, Bot, User, Settings, Sparkles } from 'lucide-react'
import axios from 'axios'

function ChatInterface() {
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [aiParams, setAiParams] = useState({
    temperature: 0.7,
    top_p: 0.9,
    max_tokens: 1000
  })
  const [showParams, setShowParams] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: input,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await axios.post('/api/generate', {
        contents: [
          {
            parts: [
              {
                text: input
              }
            ]
          }
        ],
        ...aiParams
      })

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: response.data,
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: 'Sorry, something went wrong. Please try again.',
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const quickPrompts = [
    "Compare banana vs apple for diabetic diet",
    "Analyze my breakfast: oatmeal with berries",
    "Recommend a meal plan for weight loss",
    "What's the difference between white and brown rice?"
  ]

  const handleQuickPrompt = (prompt) => {
    setInput(prompt)
  }

  return (
    <div className="space-y-6">
      {/* AI Parameters Panel */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Settings size={20} className="text-primary-600" />
            AI Parameters
          </h2>
          <button
            onClick={() => setShowParams(!showParams)}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            {showParams ? 'Hide' : 'Show'} Parameters
          </button>
        </div>

        {showParams && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature: {aiParams.temperature}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={aiParams.temperature}
                onChange={(e) => setAiParams(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Controls randomness (0 = focused, 1 = creative)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Top-P: {aiParams.top_p}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={aiParams.top_p}
                onChange={(e) => setAiParams(prev => ({ ...prev, top_p: parseFloat(e.target.value) }))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Nucleus sampling parameter</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Tokens: {aiParams.max_tokens}
              </label>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={aiParams.max_tokens}
                onChange={(e) => setAiParams(prev => ({ ...prev, max_tokens: parseInt(e.target.value) }))}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">Maximum response length</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-primary-600" />
          Quick Prompts (Zero-shot Examples)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {quickPrompts.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleQuickPrompt(prompt)}
              className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors text-sm text-gray-700"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">AI Chat Interface</h3>
        
        {/* Messages */}
        <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Bot size={48} className="mx-auto mb-2 text-gray-300" />
              <p>Start a conversation with your AI nutritionist!</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.type === 'ai' && (
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Bot size={16} className="text-primary-600" />
                </div>
              )}
              
              <div
                className={`max-w-xs lg:max-w-md p-3 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.type === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {message.type === 'ai' ? (
                  <div className="space-y-2">
                    <div className="text-sm">
                      <strong>Input:</strong> {message.text.input}
                    </div>
                    <div className="text-sm">
                      <strong>Zero-shot Type:</strong> {message.text.zero_shot_response.type}
                    </div>
                    <div className="text-sm">
                      <strong>Confidence:</strong> {(message.text.zero_shot_response.confidence * 100).toFixed(0)}%
                    </div>
                    {message.text.detected_function && (
                      <div className="text-sm">
                        <strong>Function:</strong> {message.text.detected_function.function_name}
                      </div>
                    )}
                  </div>
                ) : (
                  <p>{message.text}</p>
                )}
              </div>
              
              {message.type === 'user' && (
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <Bot size={16} className="text-primary-600" />
              </div>
              <div className="bg-gray-100 p-3 rounded-lg">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your AI nutritionist anything..."
            className="input-field flex-1"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default ChatInterface
