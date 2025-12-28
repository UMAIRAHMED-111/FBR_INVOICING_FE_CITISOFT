import { useState, useEffect } from 'react'
import { referenceDataApi } from '../../api/referenceData'
import { productsApi } from '../../api/products'
import ProductInfoSection from './ProductForm/ProductInfoSection'
import PricingRatesSection from './ProductForm/PricingRatesSection'
import CategorizationSection from './ProductForm/CategorizationSection'
import FormActions from './ProductForm/FormActions'
import RateSelectDialog from './ProductForm/RateSelectDialog'
import SroSelectDialog from './ProductForm/SroSelectDialog'
import SroItemSelectDialog from './ProductForm/SroItemSelectDialog'
import Spinner from '../../components/Spinner'
import toast from 'react-hot-toast'

export default function ProductForm({ onSave, onBack, initialData = null, isEdit = false }) {
  const [transactionTypes, setTransactionTypes] = useState([])
  const [hsCodes, setHsCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [rateDialogOpen, setRateDialogOpen] = useState(false)
  const [rateOptions, setRateOptions] = useState([])
  const [rateLoading, setRateLoading] = useState(false)

  const [sroDialogOpen, setSroDialogOpen] = useState(false)
  const [sroOptions, setSroOptions] = useState([])
  const [sroLoading, setSroLoading] = useState(false)

  const [sroItemDialogOpen, setSroItemDialogOpen] = useState(false)
  const [sroItemOptions, setSroItemOptions] = useState([])

  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    productName: '',
    transactionTypeId: '',
    transactionType: '',
    rateId: '',
    rateDescription: '',
    rateValue: '',
    sroId: '',
    sroSerNo: '',
    sroDescription: '',
    sroItemDescription: '',
    hsCode: '',
    hsDescription: '',
    uomId: '',
    uomDescription: '',
    isActive: true,
  })

  // Populate form with initial data when editing
  useEffect(() => {
    if (initialData && isEdit) {
      setFormData({
        productName: initialData.product_name || '',
        transactionTypeId: '',
        transactionType: initialData.transaction_type || '',
        rateId: String(initialData.rate_id || ''),
        rateDescription: initialData.rate_description || '',
        rateValue: String(initialData.rate_value || ''),
        sroId: String(initialData.sro_id || ''),
        sroSerNo: String(initialData.sro_ser_no || ''),
        sroDescription: initialData.sro_description || '',
        sroItemDescription: initialData.sro_item_description || '',
        hsCode: initialData.hs_code || '',
        hsDescription: initialData.hs_description || '',
        uomId: String(initialData.uom_id || ''),
        uomDescription: initialData.uom_description || '',
        isActive: initialData.is_active ?? true,
      })
    }
  }, [initialData, isEdit])

  useEffect(() => {
    async function fetchReferenceData() {
      try {
        setLoading(true)
        const [types, codes] = await Promise.all([
          referenceDataApi.getTransactionTypes(),
          referenceDataApi.getHSCodes()
        ])
        setTransactionTypes(types || [])
        setHsCodes(codes || [])
      } catch (error) {
        console.error('Failed to fetch reference data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReferenceData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function formatDateForApi(date) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const d = date.getDate().toString().padStart(2, '0')
    const m = months[date.getMonth()]
    const y = date.getFullYear()
    return `${d}-${m}-${y}`
  }

  function formatDateISO(date) {
    const y = date.getFullYear()
    const m = (date.getMonth() + 1).toString().padStart(2, '0')
    const d = date.getDate().toString().padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  function normalizeRate(obj) {
    const lower = Object.keys(obj).reduce((acc, k) => { acc[k.toLowerCase()] = obj[k]; return acc }, {})
    return {
      rate_id: lower['rate_id'] ?? lower['rateid'] ?? lower['ratE_ID'.toLowerCase()],
      rate_desc: lower['rate_desc'] ?? lower['ratedesc'] ?? lower['ratE_DESC'.toLowerCase()],
      rate_value: lower['rate_value'] ?? lower['ratevalue'] ?? lower['ratE_VALUE'.toLowerCase()],
    }
  }

  function normalizeSro(obj) {
    const lower = Object.keys(obj).reduce((acc, k) => { acc[k.toLowerCase()] = obj[k]; return acc }, {})
    return {
      // sro id keys: sro_id, sroid, srO_ID
      sro_id: lower['sro_id'] ?? lower['sroid'],
      // serial no keys: sro_ser_no, serno, serial_no, ser_no
      sro_ser_no: lower['sro_ser_no'] ?? lower['serno'] ?? lower['serial_no'] ?? lower['ser_no'],
      // description keys: sro_description, sro_desc, description
      sro_description: lower['sro_description'] ?? lower['sro_desc'] ?? lower['description'],
    }
  }

  function normalizeSroItem(obj) {
    const lower = Object.keys(obj).reduce((acc, k) => { acc[k.toLowerCase()] = obj[k]; return acc }, {})
    return {
      sro_item_id: lower['sro_item_id'] ?? lower['sroitemid'] ?? lower['item_id'],
      sro_item_desc: lower['sro_item_desc'] ?? lower['sroitemdesc'] ?? lower['item_desc'] ?? lower['description'],
    }
  }

  function normalizeUom(obj) {
    const lower = Object.keys(obj).reduce((acc, k) => { acc[k.toLowerCase()] = obj[k]; return acc }, {})
    return {
      uom_id: lower['uom_id'] ?? lower['uomid'],
      description: lower['description'] ?? lower['desc'],
    }
  }

  async function fetchRate(transTypeId) {
    try {
      setRateLoading(true)
      const today = formatDateForApi(new Date())
      const data = await referenceDataApi.getRate({ date: today, transTypeId })
      const arr = Array.isArray(data) ? data : []
      if (arr.length === 0) return
      if (arr.length === 1) {
        const r = normalizeRate(arr[0])
        setFormData(prev => ({ ...prev, rateId: r.rate_id, rateDescription: r.rate_desc, rateValue: r.rate_value }))
      } else {
        const normalized = arr.map(normalizeRate)
        setRateOptions(normalized)
        setRateDialogOpen(true)
      }
    } catch (err) {
      console.error('Failed to fetch rate:', err)
    } finally {
      setRateLoading(false)
    }
  }

  async function fetchSro(rateId) {
    try {
      setSroLoading(true)
      const today = formatDateForApi(new Date())
      const data = await referenceDataApi.getSro({ date: today, rate_id: rateId })
      const arr = Array.isArray(data) ? data : []
      if (arr.length === 0) return
      if (arr.length === 1) {
        const s = normalizeSro(arr[0])
        setFormData(prev => ({ ...prev, sroId: s.sro_id, sroSerNo: s.sro_ser_no, sroDescription: s.sro_description }))
        if (s?.sro_id) {
          await fetchSroItem(s.sro_id)
        }
      } else {
        const normalized = arr.map(normalizeSro)
        setSroOptions(normalized)
        setSroDialogOpen(true)
      }
    } catch (err) {
      console.error('Failed to fetch SRO:', err)
    } finally {
      setSroLoading(false)
    }
  }

  async function fetchSroItem(sroId) {
    try {
      const todayIso = formatDateISO(new Date())
      const data = await referenceDataApi.getSroItem({ date: todayIso, sro_id: sroId })
      const arr = Array.isArray(data) ? data : []
      if (arr.length === 0) return
      if (arr.length === 1) {
        const item = normalizeSroItem(arr[0])
        setFormData(prev => ({ ...prev, sroItemDescription: String(item.sro_item_desc ?? '') }))
      } else {
        const normalized = arr.map(normalizeSroItem)
        setSroItemOptions(normalized)
        setSroItemDialogOpen(true)
      }
    } catch (err) {
      console.error('Failed to fetch SRO Item:', err)
    }
  }

  function handleRateSelect(rate) {
    const r = normalizeRate(rate)
    setFormData(prev => ({ ...prev, rateId: r.rate_id, rateDescription: r.rate_desc, rateValue: r.rate_value }))
    setRateDialogOpen(false)
  }

  function handleSroSelect(sro) {
    const s = normalizeSro(sro)
    setFormData(prev => ({ ...prev, sroId: s.sro_id, sroSerNo: s.sro_ser_no, sroDescription: s.sro_description }))
    setSroDialogOpen(false)
    if (s?.sro_id) {
      fetchSroItem(s.sro_id)
    }
  }

  function handleSroItemSelect(item) {
    const i = normalizeSroItem(item)
    setFormData(prev => ({ ...prev, sroItemDescription: String(i.sro_item_desc ?? '') }))
    setSroItemDialogOpen(false)
  }

  // Auto-fetch SRO item description when SRO is filled (e.g., prefilled or after single result)
  useEffect(() => {
    if (formData.sroId && !formData.sroItemDescription) {
      fetchSroItem(Number(formData.sroId))
    }
  }, [formData.sroId])

  async function onSelectTransactionTypeInternal(transactionId, transactionDesc) {
    setFormData(prev => ({
      ...prev,
      transactionTypeId: transactionId,
      transactionType: transactionDesc,
      // reset rate and sro when changing type
      rateId: '', rateDescription: '', rateValue: '',
      sroId: '', sroSerNo: '', sroDescription: '', sroItemDescription: '',
    }))
    // Clear transaction type error when selected
    if (errors.transactionTypeId) {
      setErrors(prev => ({ ...prev, transactionTypeId: '', rateId: '' }))
    }
    if (transactionId) {
      await fetchRate(transactionId)
    }
  }

  async function onSelectTransactionType(e) {
    const selectedId = Number(e.target.value)
    const selected = transactionTypes.find(t => t.transaction_id === selectedId)
    await onSelectTransactionTypeInternal(selectedId || '', selected?.transaction_desc || '')
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  async function handleHsCodeChange(e) {
    const selectedCode = e.target.value
    setFormData(prev => ({ ...prev, hsCode: selectedCode, hsDescription: '', uomId: '', uomDescription: '' }))

    // Clear HS code error when selected
    if (errors.hsCode) {
      setErrors(prev => ({ ...prev, hsCode: '', uomId: '' }))
    }

    if (!selectedCode) return

    try {
      // Fetch HS code description
      const hsCodeData = await referenceDataApi.getHSCodeByCode(selectedCode)
      if (hsCodeData && hsCodeData.hs_desc) {
        setFormData(prev => ({ ...prev, hsDescription: hsCodeData.hs_desc }))
      }

      // Fetch UOM data from FBR
      const uomData = await referenceDataApi.getHsUom({ hs_code: selectedCode, annexure_id: 3 })
      const arr = Array.isArray(uomData) ? uomData : []
      if (arr.length > 0) {
        const uom = normalizeUom(arr[0])
        setFormData(prev => ({ ...prev, uomId: String(uom.uom_id ?? ''), uomDescription: uom.description ?? '' }))
      }
    } catch (err) {
      console.error('Failed to fetch HS code details or UOM:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    const newErrors = {}
    if (!formData.productName.trim()) {
      newErrors.productName = 'Product name is required'
    }
    if (!formData.transactionTypeId) {
      newErrors.transactionTypeId = 'Transaction type is required'
    }
    if (!formData.rateId) {
      newErrors.rateId = 'Rate is required (select a transaction type)'
    }
    if (!formData.hsCode) {
      newErrors.hsCode = 'HS Code is required'
    }
    if (!formData.uomId) {
      newErrors.uomId = 'UOM is required (select an HS Code)'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      // Prepare payload for backend (product_code is auto-generated)
      const payload = {
        product_name: formData.productName,
        transaction_type: formData.transactionType,
        rate_id: parseInt(formData.rateId) || 0,
        rate_description: formData.rateDescription,
        rate_value: parseFloat(formData.rateValue) || 0,
        sro_id: parseInt(formData.sroId) || 0,
        sro_ser_no: parseInt(formData.sroSerNo) || 0,
        sro_description: formData.sroDescription,
        sro_item_description: formData.sroItemDescription,
        hs_code: formData.hsCode,
        hs_description: formData.hsDescription,
        uom_id: parseInt(formData.uomId) || 0,
        uom_description: formData.uomDescription,
        is_active: formData.isActive,
      }

      let result
      if (isEdit && initialData?.id) {
        result = await productsApi.updateProduct(initialData.id, payload)
        toast.success('Product updated successfully!')
      } else {
        result = await productsApi.createProduct(payload)
        toast.success('Product created successfully!')
      }

      if (onSave) {
        onSave(result)
      }
    } catch (error) {
      console.error(`Failed to ${isEdit ? 'update' : 'create'} product:`, error)
      toast.error(error.response?.data?.detail || `Failed to ${isEdit ? 'update' : 'create'} product`)
    }
  }

  const handleSearchSro = () => {
    if (formData.rateId) {
      fetchSro(Number(formData.rateId))
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size={28} />
          <p className="text-sm text-gray-600">Loading form data…</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Information */}
        <ProductInfoSection
          formData={formData}
          onChange={handleChange}
          errors={errors}
        />

        {/* Pricing & Rates */}
        <PricingRatesSection
          formData={formData}
          onChange={handleChange}
          onSearchSro={handleSearchSro}
          transactionTypes={transactionTypes}
          onSelectTransactionType={onSelectTransactionType}
          rateLoading={rateLoading}
          errors={errors}
        />

        {/* Categorization */}
        <CategorizationSection
          formData={formData}
          onChange={handleChange}
          hsCodes={hsCodes}
          onHsCodeChange={handleHsCodeChange}
          errors={errors}
        />

        {/* Form Actions */}
        <FormActions
          onBack={onBack}
        />
      </form>

      {/* Rate selection dialog */}
      <RateSelectDialog
        open={rateDialogOpen}
        rates={rateOptions}
        onClose={() => setRateDialogOpen(false)}
        onSelect={handleRateSelect}
      />

      {/* SRO selection dialog */}
      <SroSelectDialog
        open={sroDialogOpen}
        sros={sroOptions}
        onClose={() => setSroDialogOpen(false)}
        onSelect={handleSroSelect}
      />

      {/* SRO Item selection dialog */}
      <SroItemSelectDialog
        open={sroItemDialogOpen}
        sroItems={sroItemOptions}
        onClose={() => setSroItemDialogOpen(false)}
        onSelect={handleSroItemSelect}
      />

      {/* Optional global SRO loading indicator */}
      {sroLoading && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow flex items-center gap-2 text-sm text-gray-700">
          <Spinner size={16} /> Loading SRO…
        </div>
      )}
    </>
  )
}

