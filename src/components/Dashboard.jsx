import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'

const Dashboard = () => {
  const [revisions, setRevisions] = useState([])
  const [categories, setCategories] = useState(['AFM', 'CFA'])

  // Mock data for now
  useEffect(() => {
    const mockRevisions = [
      {
        id: 1,
        topic: 'ADVANCE capital budgeting',
        progress: '1/6',
        daysUntil: 2,
        category: 'AFM',
        color: '#8B5CF6'
      },
      {
        id: 2,
        topic: 'Portfolio mgt',
        progress: '0/4',
        daysUntil: 8,
        category: 'CFA',
        color: '#8B5CF6'
      },
      {
        id: 3,
        topic: 'Interest rate risk management',
        progress: '0/6',
        daysUntil: 0,
        category: 'AFM',
        color: '#8B5CF6'
      },
      {
        id: 4,
        topic: 'Cfa pf mgt',
        progress: '0/6',
        daysUntil: 0,
        category: 'CFA',
        color: '#8B5CF6'
      }
    ]
    setRevisions(mockRevisions)
  }, [])

  const formatDaysUntil = (days) => {
    if (days === 0) return 'Tomorrow'
    if (days === 1) return 'In 1 day'
    return `In ${days} days`
  }

  return (
    <div className="p-4 pb-20">
      {/* Categories */}
      <div className="flex gap-2 mb-6">
        {categories.map((category) => (
          <Badge
            key={category}
            variant="secondary"
            className="bg-gray-800 text-white border-gray-700 px-4 py-2"
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Revisions List */}
      <div className="space-y-4">
        {revisions.map((revision) => (
          <div
            key={revision.id}
            className="bg-gray-900 rounded-lg p-4 border border-gray-800"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: revision.color }}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-medium">
                    {revision.topic} - {revision.progress}
                  </h3>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {formatDaysUntil(revision.daysUntil)}
                </p>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-3 w-full bg-gray-800 rounded-full h-1">
              <div
                className="h-1 rounded-full"
                style={{
                  backgroundColor: revision.color,
                  width: `${(parseInt(revision.progress.split('/')[0]) / parseInt(revision.progress.split('/')[1])) * 100}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Empty state if no revisions */}
      {revisions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">No revisions scheduled</div>
          <Button className="bg-purple-600 hover:bg-purple-700">
            Add your first revision
          </Button>
        </div>
      )}
    </div>
  )
}

export default Dashboard

