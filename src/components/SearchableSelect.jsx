import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X } from 'lucide-react'

export default function SearchableSelect({
  value,
  onChange,
	options = [], 
  placeholder = 'Select...',
	label,
	required = false,
	disabled = false,
	getOptionLabel = (option) => option.label || option.name || String(option),
	getOptionValue = (option) => option.value || option.id || option,
}) {
	const [isOpen, setIsOpen] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')
	const containerRef = useRef(null)
	const inputRef = useRef(null)

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setIsOpen(false)
				setSearchTerm('')
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	// Focus search input when dropdown opens
	useEffect(() => {
		if (isOpen && inputRef.current) {
			inputRef.current.focus()
		}
	}, [isOpen])

	const filteredOptions = options.filter(option => {
		const label = getOptionLabel(option).toLowerCase()
		return label.includes(searchTerm.toLowerCase())
	})

	const selectedOption = options.find(opt => getOptionValue(opt) === value)
	const displayText = selectedOption ? getOptionLabel(selectedOption) : placeholder

	function handleSelect(option) {
		onChange(getOptionValue(option))
		setIsOpen(false)
		setSearchTerm('')
	}

	function handleClear(e) {
		e.stopPropagation()
		onChange('')
		setSearchTerm('')
	}

  return (
		<div ref={containerRef} className="relative">
			{label && (
				<label className="block text-sm font-medium text-gray-700 mb-1.5">
					{label} {required && <span className="text-red-500">*</span>}
				</label>
			)}
			
			<button
				type="button"
				onClick={() => !disabled && setIsOpen(!isOpen)}
				disabled={disabled}
				className={`w-full flex items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-sm text-left transition-colors ${
					disabled 
						? 'bg-gray-100 cursor-not-allowed text-gray-500' 
						: 'bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
				} ${!selectedOption && !disabled ? 'text-gray-500' : 'text-gray-900'}`}
			>
				<span className="truncate">{displayText}</span>
				<div className="flex items-center gap-1 ml-2">
					{value && !disabled && (
						<X 
							size={16} 
							className="text-gray-400 hover:text-gray-600 flex-shrink-0" 
							onClick={handleClear}
						/>
					)}
					<ChevronDown 
						size={16} 
						className={`text-gray-400 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
					/>
				</div>
			</button>

			{isOpen && (
				<div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 flex flex-col">
					{/* Search Input */}
					<div className="p-2 border-b border-gray-200">
						<div className="relative">
							<Search size={16} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
							<input
								ref={inputRef}
								type="text"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								placeholder="Search..."
								className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
								onClick={(e) => e.stopPropagation()}
							/>
						</div>
					</div>

					{/* Options List */}
					<div className="overflow-y-auto flex-1">
						{filteredOptions.length === 0 ? (
							<div className="px-3 py-6 text-sm text-gray-500 text-center">
								No options found
							</div>
						) : (
							filteredOptions.map((option, idx) => {
								const optionValue = getOptionValue(option)
								const isSelected = optionValue === value
								return (
									<button
										key={idx}
										type="button"
										onClick={() => handleSelect(option)}
										className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors ${
											isSelected ? 'bg-gray-50 font-medium text-gray-900' : 'text-gray-700'
										}`}
									>
										{getOptionLabel(option)}
									</button>
  )
							})
						)}
					</div>
				</div>
			)}
		</div>
	)
}
