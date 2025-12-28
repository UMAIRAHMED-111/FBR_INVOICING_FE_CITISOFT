export default function SroItemSelectDialog({ open, sroItems, onClose, onSelect }) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Select SRO Item</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {!sroItems || sroItems.length === 0 ? (
              <div className="text-sm text-gray-600">No SRO items available.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-700 border-b border-gray-200">
                    <th className="px-3 py-2">SRO Item ID</th>
                    <th className="px-3 py-2">Description</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sroItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{item.sro_item_id}</td>
                      <td className="px-3 py-2">{item.sro_item_desc}</td>
                      <td className="px-3 py-2">
                        <button
                          onClick={() => onSelect(item)}
                          className="px-3 py-1 text-sm rounded-md bg-black text-white hover:bg-gray-900"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  ))}
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

