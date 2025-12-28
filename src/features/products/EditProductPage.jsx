import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { productsApi } from '../../api/products'
import ProductForm from './ProductForm'
import Spinner from '../../components/Spinner'
import toast from 'react-hot-toast'

export default function EditProductPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [product, setProduct] = useState(null)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const data = await productsApi.getProduct(id)
        setProduct(data)
      } catch (err) {
        console.error('Failed to fetch product:', err)
        toast.error(err.response?.data?.detail || 'Failed to load product')
        navigate('/product')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  const handleSave = (savedProduct) => {
    console.log('Product updated:', savedProduct)
    // Navigate back to products list after successful save
    navigate('/product')
  }

  const handleBack = () => {
    navigate('/product')
  }

  if (loading) {
    return (
      <div className="p-4 lg:p-6">
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-semibold text-black">Edit Product</h1>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Spinner size={28} />
            <p className="text-sm text-gray-600">Loading product...</p>
          </div>
        </div>
      </div>
    )
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
        <h1 className="text-xl font-semibold text-black">Edit Product</h1>
      </div>

      {/* Product Form */}
      <ProductForm 
        onSave={handleSave} 
        onBack={handleBack} 
        initialData={product}
        isEdit={true}
      />
    </div>
  )
}

