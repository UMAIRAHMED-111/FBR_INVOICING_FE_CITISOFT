import SearchableSelect from '../../../components/SearchableSelect'

export default function BasicInfoSection({ formData, onChange }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Code
        </label>
        <input
          type="text"
          name="productCode"
          value={formData.productCode}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter product code"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Product Name
        </label>
        <input
          type="text"
          name="productName"
          value={formData.productName}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter product name"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Price
        </label>
        <input
          type="number"
          step="0.01"
          name="price"
          value={formData.price}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div>
        <SearchableSelect
          label="Transaction Type"
          value={formData.transactionType}
          onChange={(value) => onChange({ target: { name: 'transactionType', value } })}
          options={['Exempt goods', 'Standard rated', 'Zero rated']}
          placeholder="Select type"
        />
      </div>
    </div>
  )
}

