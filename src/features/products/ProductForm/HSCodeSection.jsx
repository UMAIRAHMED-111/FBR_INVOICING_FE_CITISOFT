import SearchableSelect from '../../../components/SearchableSelect'

export default function HSCodeSection({ formData, onChange }) {
  return (
    <>
      {/* HS Code and UOM Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-6 items-start">
        <div className="md:col-span-2">
          <SearchableSelect
            label="HS Code"
            value={formData.hsCode}
            onChange={(value) => onChange({ target: { name: 'hsCode', value } })}
            options={['0101.2900']}
            placeholder="Select HS Code"
          />
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            UOM Id
          </label>
          <input
            type="text"
            name="uomId"
            value={formData.uomId}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
            readOnly
          />
        </div>
        
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            UOM Description
          </label>
          <input
            type="text"
            name="uomDescription"
            value={formData.uomDescription}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-gray-900"
            readOnly
          />
        </div>
        
        <div className="md:col-span-2 flex items-center gap-4 pt-7">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isProduct"
              checked={formData.isProduct}
              onChange={onChange}
            className="w-4 h-4 border-gray-300 rounded focus:ring-black"
            />
            <span className="text-sm font-medium text-gray-700">Is Product</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={onChange}
            className="w-4 h-4 border-gray-300 rounded focus:ring-black"
            />
            <span className="text-sm font-medium text-gray-700">Is Active</span>
          </label>
        </div>
      </div>

      {/* HS Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          HS Description
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800 font-medium">
          {formData.hsDescription}
        </div>
      </div>

      {/* SrO Item Description */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          SrO Item Description
        </label>
        <input
          type="text"
          name="sroItemDescription"
          value={formData.sroItemDescription}
          onChange={onChange}
          className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800"
          readOnly
        />
      </div>
    </>
  )
}

