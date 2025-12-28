import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import ProductForm from './ProductForm'

export default function NewProductPage() {
  const navigate = useNavigate()

  const handleSave = (savedProduct) => {
    console.log('Product saved:', savedProduct)
    // Navigate back to products list after successful save
    navigate('/product')
  }

  const handleBack = () => {
    navigate('/product')
  }

  return (
    <div className="p-4 lg:p-6">
      {/* Header with Back Button */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold text-black">Add New Product</h1>
      </div>

      {/* Product Form */}
      <ProductForm onSave={handleSave} onBack={handleBack} />
    </div>
  )
}

