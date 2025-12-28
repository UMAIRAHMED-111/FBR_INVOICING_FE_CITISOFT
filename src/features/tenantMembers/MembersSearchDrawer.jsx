import { useEffect, useState } from 'react'
import SearchableSelect from '../../components/SearchableSelect'

export default function MembersSearchDrawer({ open, initialFilters, onClose, onApply }) {
	const [query, setQuery] = useState('')

	useEffect(() => {
		setQuery(initialFilters.query || '')
	}, [initialFilters, open])

	if (!open) return null
	return (
		<div className="fixed inset-0 z-[1000]">
			<div className="absolute inset-0 bg-black/30" onClick={onClose} />
			<aside className="absolute right-0 top-0 h-full w-96 max-w-[90%] bg-white border-l border-gray-200 shadow-xl p-4">
				<div className="flex items-center justify-between">
					<h3 className="text-lg font-semibold text-black">Search & Filter Members</h3>
					<button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50">✕</button>
				</div>
				<div className="mt-4 grid gap-3 text-sm">
					<div>
						<label className="block text-sm font-medium text-gray-800">Search</label>
						<input className="mt-1 w-full rounded-xl border border-gray-300 bg-white py-2.5 px-3" placeholder="Name or email..." value={query} onChange={(e) => setQuery(e.target.value)} />
					</div>
					<div className="flex gap-2 pt-2">
						<button onClick={() => onApply({ query })} className="rounded-xl bg-black text-white px-3 py-2 text-sm">Apply</button>
						<button onClick={() => onApply({ query: '' })} className="rounded-xl border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50">Reset</button>
					</div>
				</div>
			</aside>
		</div>
	)
}


