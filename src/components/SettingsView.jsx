import { Button } from '@/components/ui/button.jsx'

const SettingsView = () => {
  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-6">Settings</h2>
      
      <div className="space-y-4">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h3 className="text-white font-medium mb-2">Notifications</h3>
          <p className="text-gray-400 text-sm">Manage your reminder settings</p>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h3 className="text-white font-medium mb-2">Data Export</h3>
          <p className="text-gray-400 text-sm">Export your revision data</p>
        </div>
        
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
          <h3 className="text-white font-medium mb-2">About</h3>
          <p className="text-gray-400 text-sm">Synapse v1.0.0</p>
        </div>
      </div>
    </div>
  )
}

export default SettingsView

