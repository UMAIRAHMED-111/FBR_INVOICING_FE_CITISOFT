import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import SearchableSelect from '../../components/SearchableSelect'

export default function ProductsSearchDrawer({ open, initialFilters, onClose, onApply }) {
  const [filters, setFilters] = useState(initialFilters)

  useEffect(() => {
    if (open) setFilters(initialFilters)
  }, [open, initialFilters])

  function handleChange(e) {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  function handleSelectChange(name, value) {
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  function handleApply() {
    onApply(filters)
  }

  function handleReset() {
    const empty = { query: '', transaction_type: '', is_active: '' }
    setFilters(empty)
    onApply(empty)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[1000]">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-96 max-w-[90%] bg-white border-l border-gray-200 shadow-xl p-4 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-black">Search & Filter</h3>
          <button
            onClick={onClose}
            className="h-9 w-9 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50"
          >
            <X size={18} />
          </button>
        </div>
        <div className="mt-4 grid gap-3 text-sm flex-1 overflow-y-auto content-start auto-rows-min">
          <div>
            <label className="block text-sm font-medium text-gray-800">Search</label>
            <input
              type="text"
              name="query"
              value={filters.query}
              onChange={handleChange}
              placeholder="Product code, name, HS code..."
              className="mt-1 w-full rounded-xl border border-gray-300 bg-white py-2.5 px-3"
            />
          </div>
          <div>
            <SearchableSelect
              label="Transaction Type"
              value={filters.transaction_type}
              onChange={(value) => handleSelectChange('transaction_type', value)}
              options={[
                { label: 'All Types', value: '' },
                { label: 'Exempt goods', value: 'exempt goods' },
                { label: 'Standard rated', value: 'standard rated' },
                { label: 'Zero rated', value: 'zero rated' }
              ]}
              placeholder="All Types"
            />
          </div>
          <div>
            <SearchableSelect
              label="Status"
              value={filters.is_active}
              onChange={(value) => handleSelectChange('is_active', value)}
              options={[
                { label: 'All', value: '' },
                { label: 'Active', value: 'true' },
                { label: 'Inactive', value: 'false' }
              ]}
              placeholder="All"
            />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleApply}
            className="rounded-xl bg-black text-white px-3 py-2 text-sm"
          >
            Apply
          </button>
          <button
            onClick={handleReset}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </aside>
    </div>
  )
}

