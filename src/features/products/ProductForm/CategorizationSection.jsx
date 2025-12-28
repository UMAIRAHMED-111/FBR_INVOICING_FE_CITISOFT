import SearchableSelect from '../../../components/SearchableSelect'

export default function CategorizationSection({ formData, onChange, hsCodes, onHsCodeChange, errors = {} }) {
  // Format HS codes for SearchableSelect
  const hsCodeOptions = hsCodes.map(code => ({
    value: code.hs_code,
    label: `${code.hs_code} - ${code.hs_desc.substring(0, 50)}${code.hs_desc.length > 50 ? '...' : ''}`,
  }))

  const selectedHsCode = hsCodeOptions.find(
    opt => opt.value === formData.hsCode
  ) || null

  const handleHsCodeChange = (selectedValue) => {
    const event = {
      target: {
        value: selectedValue || ''
      }
    }
    onHsCodeChange(event)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Categorization</h2>

      {/* HS Code, UOM ID, UOM Description */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            HS Code <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            options={hsCodeOptions}
            value={formData.hsCode}
            onChange={handleHsCodeChange}
            placeholder="Select HS Code"
            isClearable
            isLoading={hsCodes.length === 0}
            className={errors.hsCode ? 'border-red-500' : ''}
          />
          {errors.hsCode && <p className="text-red-500 text-sm mt-1">{errors.hsCode}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            UOM Id <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="uomId"
            value={formData.uomId}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-700 ${errors.uomId ? 'border-red-500' : 'border-gray-300'}`}
            readOnly
          />
          {errors.uomId && <p className="text-red-500 text-sm mt-1">{errors.uomId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            UOM Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="uomDescription"
            value={formData.uomDescription}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
            readOnly
          />
        </div>
      </div>

      {/* HS Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          HS Description <span className="text-red-500">*</span>
        </label>
        <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700">
          {formData.hsDescription}
        </div>
      </div>

      {/* Is Active Checkbox */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          name="isActive"
          checked={formData.isActive}
          onChange={onChange}
          className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
        />
        <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
          Is Active
        </label>
      </div>
    </div>
  )
}

