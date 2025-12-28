export default function ProductInfoSection({ formData, onChange, errors = {} }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Product Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="productName"
            value={formData.productName}
            onChange={onChange}
            placeholder="Enter product name"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${errors.productName ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.productName && <p className="text-red-500 text-sm mt-1">{errors.productName}</p>}
        </div>
      </div>
    </div>
  )
}

