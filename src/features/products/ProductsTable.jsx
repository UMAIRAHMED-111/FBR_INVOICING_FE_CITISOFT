import { ChevronUp, ChevronDown, Edit, Trash2 } from 'lucide-react'

export default function ProductsTable({
  rows,
  sort,
  onSortChange,
  onEdit,
  onDelete,
  page,
  pageSize,
  total,
  onChangePage,
  onChangePageSize,
}) {
  function renderSortIcon(key) {
    if (sort.key !== key) return null
    return sort.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  const totalPages = Math.ceil(total / pageSize) || 1

  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                onClick={() => onSortChange('product_code')}
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Product Code {renderSortIcon('product_code')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('product_name')}
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Product Name {renderSortIcon('product_name')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('transaction_type')}
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Transaction Type {renderSortIcon('transaction_type')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('rate_value')}
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  Rate % {renderSortIcon('rate_value')}
                </div>
              </th>
              <th
                onClick={() => onSortChange('hs_code')}
                className="px-4 py-3 text-left font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-1">
                  HS Code {renderSortIcon('hs_code')}
                </div>
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Status
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {rows.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-4 py-6 text-center text-gray-500">
                  No products found
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-gray-900 font-medium">{row.product_code}</td>
                  <td className="px-4 py-3 text-gray-900">{row.product_name}</td>
                  <td className="px-4 py-3 text-gray-900">{row.transaction_type}</td>
                  <td className="px-4 py-3 text-gray-900">{Number(row.rate_value).toFixed(2)}%</td>
                  <td className="px-4 py-3 text-gray-900">{row.hs_code}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${row.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {row.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onEdit(row.id)}
                        className="inline-flex items-center gap-1 text-gray-700 hover:text-black"
                      >
                        <Edit size={16} />
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(row.id)}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => onChangePageSize(Number(e.target.value))}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>
            {total === 0 ? 0 : (page - 1) * pageSize + 1}-
            {Math.min(page * pageSize, total)} of {total}
          </span>
          <button
            onClick={() => onChangePage(page - 1)}
            disabled={page === 1}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronUp size={16} className="-rotate-90" />
          </button>
          <button
            onClick={() => onChangePage(page + 1)}
            disabled={page >= totalPages}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronDown size={16} className="-rotate-90" />
          </button>
        </div>
      </div>
    </div>
  )
}

