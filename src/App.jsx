import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Calendar, Home, Plus, Settings } from 'lucide-react'
import './App.css'

// Import components (we'll create these)
import Dashboard from './components/Dashboard'
import NewRevision from './components/NewRevision'
import CalendarView from './components/CalendarView'
import SettingsView from './components/SettingsView'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'new-revision':
        return <NewRevision onBack={() => setCurrentView('dashboard')} />
      case 'calendar':
        return <CalendarView />
      case 'settings':
        return <SettingsView />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Settings className="w-6 h-6" />
          <h1 className="text-xl font-bold">Synapse</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentView('calendar')}
            className="text-white hover:bg-gray-800"
          >
            <Calendar className="w-6 h-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCurrentView('new-revision')}
            className="text-white hover:bg-gray-800"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-gray-800 p-4">
        <div className="flex justify-around">
          <Button
            variant="ghost"
            className={`flex flex-col items-center gap-1 text-xs ${
              currentView === 'dashboard' ? 'text-white' : 'text-gray-500'
            }`}
            onClick={() => setCurrentView('dashboard')}
          >
            <Home className="w-5 h-5" />
            Upcoming
          </Button>
          <Button
            variant="ghost"
            className={`flex flex-col items-center gap-1 text-xs ${
              currentView === 'to-revise' ? 'text-white' : 'text-gray-500'
            }`}
            onClick={() => setCurrentView('dashboard')}
          >
            <Calendar className="w-5 h-5" />
            To revise
          </Button>
        </div>
      </nav>
    </div>
  )
}

export default App

