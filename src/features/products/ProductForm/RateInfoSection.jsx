import { Search } from 'lucide-react'

export default function RateInfoSection({ formData, onChange, onSearchSchedule }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 items-end">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rate Id
        </label>
        <input
          type="text"
          name="rateId"
          value={formData.rateId}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          readOnly
        />
      </div>
      
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rate Description
        </label>
        <input
          type="text"
          name="rateDescription"
          value={formData.rateDescription}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-600"
          readOnly
        />
      </div>
      
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Rate Value
        </label>
        <input
          type="text"
          name="rateValue"
          value={formData.rateValue}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          readOnly
        />
      </div>
      
      <div className="md:col-span-2">
        <button
          type="button"
          onClick={onSearchSchedule}
          className="w-full px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center gap-2"
        >
          <Search size={18} />
          Search Schedule #
        </button>
      </div>
      
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SrO Id
        </label>
        <input
          type="text"
          name="sroId"
          value={formData.sroId}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          readOnly
        />
      </div>
      
      <div className="md:col-span-1">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SrO Ser No
        </label>
        <input
          type="text"
          name="sroSerNo"
          value={formData.sroSerNo}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          readOnly
        />
      </div>
      
      <div className="md:col-span-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SrO Description
        </label>
        <input
          type="text"
          name="sroDescription"
          value={formData.sroDescription}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          readOnly
        />
      </div>
    </div>
  )
}

