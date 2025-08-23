import React from 'react'
import { Apple, Brain } from 'lucide-react'

function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-green-500 to-blue-600 rounded-lg">
                <Apple className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  FoodWise
                </h1>
                <p className="text-sm text-gray-600 -mt-1">AI Nutrition Assistant</p>
              </div>
            </div>
          </div>

          {/* AI Concepts Indicator */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Brain size={16} className="text-primary-600" />
            <span>Powered by AI Concepts</span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-gray-600 hover:text-primary-600 transition-colors">
              Features
            </a>
            <a href="#about" className="text-gray-600 hover:text-primary-600 transition-colors">
              About
            </a>
            <a href="#contact" className="text-gray-600 hover:text-primary-600 transition-colors">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
