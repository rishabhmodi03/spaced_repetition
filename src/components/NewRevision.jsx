import { useState } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { X, ChevronRight } from 'lucide-react'

const NewRevision = ({ onBack }) => {
  const [formData, setFormData] = useState({
    topic: '',
    intervals: '1, 3, 7, 15, 20, 28',
    reminder: '12:00 A.M',
    categories: [],
    notes: '',
    icon: '⚪',
    color: '#8B5CF6'
  })

  const [showIntervals, setShowIntervals] = useState(false)
  const [showCategories, setShowCategories] = useState(false)

  const predefinedIntervals = [
    '1, 4, 14, 30 days',
    '1, 7, 30, 90 days',
    '1, 4, 14, 30, 60 days',
    '3, 7, 15, 20, 27, 35, 49, 59, 69 days',
    '1, 3, 7, 15, 20, 28 days'
  ]

  const availableCategories = ['AFM', 'CFA']

  const icons = ['⚪', '▲', '⬜', '⭐', '❤️', '$', '🍃', '🌍', '💓', '⏰', '🌍', '💼', '🔧', '🎵', '🎨', '📄', '⚙️', '🚀', '⚖️', '☢️']

  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8']

  const handleSave = () => {
    // TODO: Save the revision data
    console.log('Saving revision:', formData)
    onBack()
  }

  if (showIntervals) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowIntervals(false)}
            className="text-white hover:bg-gray-800"
          >
            <ChevronRight className="w-6 h-6 rotate-180" />
          </Button>
          <h2 className="text-xl font-semibold">Intervals</h2>
        </div>

        <div className="space-y-3">
          {predefinedIntervals.map((interval, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border cursor-pointer ${
                formData.intervals === interval
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-800 bg-gray-900'
              }`}
              onClick={() => {
                setFormData({ ...formData, intervals: interval })
                setShowIntervals(false)
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-white">{interval}</span>
                <div className={`w-6 h-6 rounded-full border-2 ${
                  formData.intervals === interval
                    ? 'border-purple-500 bg-purple-500'
                    : 'border-gray-600'
                }`}>
                  {formData.intervals === interval && (
                    <div className="w-full h-full rounded-full bg-purple-500" />
                  )}
                </div>
              </div>
            </div>
          ))}

          <div className="p-4 rounded-lg border border-gray-800 bg-gray-900 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-gray-600 flex items-center justify-center">
                <span className="text-white text-lg">+</span>
              </div>
              <span className="text-white">Create custom intervals</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showCategories) {
    return (
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowCategories(false)}
            className="text-white hover:bg-gray-800"
          >
            <ChevronRight className="w-6 h-6 rotate-180" />
          </Button>
          <h2 className="text-xl font-semibold">Categories</h2>
        </div>

        <p className="text-gray-400 mb-6">Pick one or more categories that your revision fits in</p>

        <div className="space-y-3 mb-6">
          {availableCategories.map((category) => (
            <div
              key={category}
              className={`p-4 rounded-lg border cursor-pointer ${
                formData.categories.includes(category)
                  ? 'border-purple-500 bg-purple-500/10'
                  : 'border-gray-800 bg-gray-900'
              }`}
              onClick={() => {
                const newCategories = formData.categories.includes(category)
                  ? formData.categories.filter(c => c !== category)
                  : [...formData.categories, category]
                setFormData({ ...formData, categories: newCategories })
              }}
            >
              <span className="text-white">{category}</span>
            </div>
          ))}
        </div>

        <Button
          variant="outline"
          className="w-full border-gray-800 text-white hover:bg-gray-800"
        >
          + Create category
        </Button>

        <Button
          className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
          onClick={() => setShowCategories(false)}
        >
          Save
        </Button>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-white hover:bg-gray-800"
        >
          <X className="w-6 h-6" />
        </Button>
        <h2 className="text-xl font-semibold">New Revision</h2>
        <div></div>
      </div>

      <div className="space-y-6">
        {/* Topic */}
        <div>
          <label className="block text-white mb-2">Topic</label>
          <Input
            placeholder="E.g. Chapter 1, Mitochondria"
            value={formData.topic}
            onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            className="bg-gray-900 border-gray-800 text-white placeholder-gray-500"
          />
        </div>

        {/* Intervals */}
        <div>
          <label className="block text-white mb-2">Intervals</label>
          <div
            className="p-4 rounded-lg border border-gray-800 bg-gray-900 cursor-pointer flex items-center justify-between"
            onClick={() => setShowIntervals(true)}
          >
            <span className="text-white">{formData.intervals}</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Reminder */}
        <div>
          <label className="block text-white mb-2">Reminder</label>
          <div className="p-4 rounded-lg border border-gray-800 bg-gray-900 cursor-pointer flex items-center justify-between">
            <span className="text-white">{formData.reminder}</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Categories */}
        <div>
          <label className="block text-white mb-2">Categories</label>
          <div
            className="p-4 rounded-lg border border-gray-800 bg-gray-900 cursor-pointer flex items-center justify-between"
            onClick={() => setShowCategories(true)}
          >
            <span className="text-white">
              {formData.categories.length > 0 ? formData.categories.join(', ') : 'None'}
            </span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-white mb-2">Notes</label>
          <Textarea
            placeholder="Write your notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="bg-gray-900 border-gray-800 text-white placeholder-gray-500 min-h-[120px]"
          />
        </div>

        {/* Icon */}
        <div>
          <label className="block text-white mb-2">Icon</label>
          <div className="grid grid-cols-7 gap-2">
            {icons.map((icon, index) => (
              <div
                key={index}
                className={`w-12 h-12 rounded-lg border cursor-pointer flex items-center justify-center text-xl ${
                  formData.icon === icon
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-gray-800 bg-gray-900'
                }`}
                onClick={() => setFormData({ ...formData, icon })}
              >
                {icon}
              </div>
            ))}
          </div>
        </div>

        {/* Color */}
        <div>
          <label className="block text-white mb-2">Color</label>
          <div className="flex gap-2">
            {colors.map((color, index) => (
              <div
                key={index}
                className={`w-12 h-12 rounded-lg cursor-pointer border-2 ${
                  formData.color === color ? 'border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setFormData({ ...formData, color })}
              />
            ))}
          </div>
        </div>

        {/* Save Button */}
        <Button
          className="w-full bg-purple-600 hover:bg-purple-700 mt-8"
          onClick={handleSave}
        >
          Save
        </Button>
      </div>
    </div>
  )
}

export default NewRevision

