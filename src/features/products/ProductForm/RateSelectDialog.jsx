export default function RateSelectDialog({ open, rates, onClose, onSelect }) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Select Rate</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {(!rates || rates.length === 0) ? (
              <div className="text-sm text-gray-600">No rates available.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-700">
                    <th className="px-3 py-2">Rate ID</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Value</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {rates?.map((r, idx) => {
                    const id = r.rate_id ?? r.ratE_ID ?? r.RATE_ID
                    const desc = r.rate_desc ?? r.ratE_DESC ?? r.RATE_DESC
                    const val = r.rate_value ?? r.ratE_VALUE ?? r.RATE_VALUE
                    return (
                      <tr key={idx}>
                        <td className="px-3 py-2">{id}</td>
                        <td className="px-3 py-2">{desc}</td>
                        <td className="px-3 py-2">{val}%</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => onSelect(r)}
                            className="px-3 py-1 text-sm rounded-md bg-black text-white hover:bg-gray-900"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-gray-200 flex justify-end">
            <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50">Close</button>
          </div>
        </div>
      </div>
    </>
  )
}
