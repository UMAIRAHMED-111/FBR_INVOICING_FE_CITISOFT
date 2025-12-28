import { Search } from 'lucide-react'
import Spinner from '../../../components/Spinner'
import SearchableSelect from '../../../components/SearchableSelect'

export default function PricingRatesSection({ formData, onChange, onSearchSro, transactionTypes, onSelectTransactionType, rateLoading, errors = {} }) {
  // Format transaction types for SearchableSelect
  const transactionTypeOptions = transactionTypes.map(type => ({
    value: type.transaction_id,
    label: type.transaction_desc,
  }))

  const selectedTransactionType = transactionTypeOptions.find(
    opt => Number(opt.value) === Number(formData.transactionTypeId)
  ) || null

  const handleTransactionTypeChange = (selectedValue) => {
    const event = {
      target: {
        value: selectedValue || ''
      }
    }
    onSelectTransactionType(event)
  }
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-base font-semibold text-gray-900 mb-3">Pricing & Rates</h2>

      {/* Transaction Type */}
      <div className="mb-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Transaction Type <span className="text-red-500">*</span>
          </label>
          <SearchableSelect
            options={transactionTypeOptions}
            value={formData.transactionTypeId}
            onChange={handleTransactionTypeChange}
            placeholder="Select transaction type"
            isClearable
            className={errors.transactionTypeId ? 'border-red-500' : ''}
          />
          {errors.transactionTypeId && <p className="text-red-500 text-sm mt-1">{errors.transactionTypeId}</p>}
        </div>
      </div>

      {/* Rate Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rate ID <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="rateId"
            value={formData.rateId}
            onChange={onChange}
            className={`w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-800 ${errors.rateId ? 'border-red-500' : 'border-gray-300'}`}
            readOnly
          />
          {errors.rateId && <p className="text-red-500 text-sm mt-1">{errors.rateId}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rate Description <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="rateDescription"
            value={formData.rateDescription}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rate Value <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="rateValue"
            value={formData.rateValue}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800"
            readOnly
          />
        </div>
      </div>

      {/* Search SRO (below Rate, above SRO) */}
      <div className="mb-3 flex items-stretch gap-2">
        <button
          type="button"
          onClick={onSearchSro}
          disabled={!formData.rateId}
          className="px-4 py-2 bg-black text-white font-medium rounded-md hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Search size={18} />
          Search SRO
        </button>
        {rateLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Spinner size={18} /> Fetching rates…
          </div>
        )}
      </div>

      {/* SRO Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SrO Id
          </label>
          <input
            type="text"
            name="sroId"
            value={formData.sroId}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SrO Ser No
          </label>
          <input
            type="text"
            name="sroSerNo"
            value={formData.sroSerNo}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800"
            readOnly
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SrO Description
          </label>
          <input
            type="text"
            name="sroDescription"
            value={formData.sroDescription}
            onChange={onChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-800"
            readOnly
          />
        </div>
      </div>

      {/* SrO Item Description */}
      <div>
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
    </div>
  )
}

