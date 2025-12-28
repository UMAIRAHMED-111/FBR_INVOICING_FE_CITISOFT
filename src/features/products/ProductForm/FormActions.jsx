import { Save } from 'lucide-react'

export default function FormActions({ onBack }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-black text-white font-medium rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black flex items-center gap-2"
        >
          <Save size={18} />
          Save Product
        </button>
      </div>
    </div>
  )
}

