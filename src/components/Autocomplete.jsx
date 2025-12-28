import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'

export default function Autocomplete({
	value,
	onChange,
	options = [],
	placeholder = 'Type to search...',
	label,
	required = false,
	disabled = false,
	minChars = 1,
	getOptionLabel = (option) => option.label || option.name || String(option),
	getOptionValue = (option) => option.value || option.id || option,
}) {
	const [inputValue, setInputValue] = useState('')
	const [isOpen, setIsOpen] = useState(false)
	const [isTyping, setIsTyping] = useState(false)
	const containerRef = useRef(null)
	const inputRef = useRef(null)

	// Set initial input value from selected value (only when not typing)
	useEffect(() => {
		if (!isTyping) {
			if (value) {
				const selectedOption = options.find(opt => getOptionValue(opt) === value)
				if (selectedOption) {
					setInputValue(getOptionLabel(selectedOption))
				}
			} else {
				setInputValue('')
			}
		}
	}, [value, options, getOptionLabel, getOptionValue, isTyping])

	// Close dropdown when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (containerRef.current && !containerRef.current.contains(event.target)) {
				setIsOpen(false)
			}
		}
		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [])

	// Filter options based on input
	const filteredOptions = inputValue.length >= minChars
		? options.filter(option => {
				const label = getOptionLabel(option).toLowerCase()
				return label.includes(inputValue.toLowerCase())
		  })
		: []

	function handleInputChange(e) {
		const newValue = e.target.value
		setIsTyping(true)
		setInputValue(newValue)
		
		// Open dropdown if we have enough characters
		if (newValue.length >= minChars) {
			setIsOpen(true)
		} else {
			setIsOpen(false)
		}

		// If input is cleared, clear the selection
		if (!newValue) {
			onChange('')
			setIsTyping(false)
		}
	}

	function handleSelect(option) {
		const optionValue = getOptionValue(option)
		const optionLabel = getOptionLabel(option)
		
		setIsTyping(false)
		setInputValue(optionLabel)
		onChange(optionValue)
		setIsOpen(false)
	}

	function handleClear(e) {
		e.stopPropagation()
		setIsTyping(false)
		setInputValue('')
		onChange('')
		setIsOpen(false)
		if (inputRef.current) {
			inputRef.current.focus()
		}
	}

	function handleFocus() {
		if (inputValue.length >= minChars) {
			setIsOpen(true)
		}
	}

	return (
		<div ref={containerRef} className="relative">
			{label && (
				<label className="block text-sm font-medium text-gray-700 mb-1.5">
					{label} {required && <span className="text-red-500">*</span>}
				</label>
			)}

			<div className="relative">
				<input
					ref={inputRef}
					type="text"
					value={inputValue}
					onChange={handleInputChange}
					onFocus={handleFocus}
					placeholder={placeholder}
					disabled={disabled}
					className={`w-full rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm transition-colors ${
						disabled
							? 'bg-gray-100 cursor-not-allowed text-gray-500'
							: 'bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'
					}`}
				/>
				
				{inputValue && !disabled && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
					>
						<X size={16} className="text-gray-400 hover:text-gray-600" />
					</button>
				)}
			</div>

			{isOpen && filteredOptions.length > 0 && (
				<div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
					{filteredOptions.map((option, idx) => {
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
					})}
				</div>
			)}

			{isOpen && inputValue.length >= minChars && filteredOptions.length === 0 && (
				<div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
					<div className="px-3 py-6 text-sm text-gray-500 text-center">
						No matching results
					</div>
				</div>
			)}
		</div>
	)
}

