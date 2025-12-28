import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { productsApi } from '../../api/products'
import ProductsTable from './ProductsTable'
import ProductsSearchDrawer from './ProductsSearchDrawer'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Plus, Search, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const defaultSort = { key: 'product_name', direction: 'asc' }
const emptyFilters = { query: '', transaction_type: '', is_active: '' }

function applyFilters(products, filters) {
  const q = (filters.query || '').trim().toLowerCase()
  const transType = (filters.transaction_type || '').trim().toLowerCase()
  const active = (filters.is_active || '').trim().toLowerCase()

  return products.filter(p => {
    const matchesQuery = !q ||
      (p.product_code && p.product_code.toLowerCase().includes(q)) ||
      (p.product_name && p.product_name.toLowerCase().includes(q)) ||
      (p.hs_code && p.hs_code.toLowerCase().includes(q))
    const matchesType = !transType || (p.transaction_type && p.transaction_type.toLowerCase() === transType)
    const matchesActive = !active || String(p.is_active).toLowerCase() === active
    return matchesQuery && matchesType && matchesActive
  })
}

function sortRows(rows, sort) {
  const { key, direction } = sort
  const dir = direction === 'desc' ? -1 : 1
  return [...rows].sort((a, b) => {
    const av = a?.[key] ?? ''
    const bv = b?.[key] ?? ''
    if (av < bv) return -1 * dir
    if (av > bv) return 1 * dir
    return 0
  })
}

export default function ProductsPage() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState(emptyFilters)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [sort, setSort] = useState(defaultSort)
  const [deleteConfirm, setDeleteConfirm] = useState(null) // { id, name }

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}

      // Add filter params if they exist
      if (filters.is_active) {
        params.is_active = filters.is_active === 'true'
      }
      if (filters.query) {
        params.search = filters.query
      }

      const data = await productsApi.listProducts(params)
      setProducts(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch products:', err)
      toast.error(err.response?.data?.detail || err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => { fetchList() }, [fetchList])

  const filtered = useMemo(() => applyFilters(products, filters), [products, filters])
  const sorted = useMemo(() => sortRows(filtered, sort), [filtered, sort])

  // Client-side pagination
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const total = sorted.length
  const pagedRows = useMemo(() => {
    const start = (page - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page, pageSize])

  // Keep page in range when filters/list change
  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(total / pageSize) || 1)
    if (page > maxPage) setPage(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, pageSize])

  function onSortChange(nextKey) {
    setSort(prev => {
      if (prev.key === nextKey) return { key: nextKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
      return { key: nextKey, direction: 'asc' }
    })
  }

  function onOpenDrawer() { setDrawerOpen(true) }
  function onCloseDrawer() { setDrawerOpen(false) }
  async function onApplyFilters(next) { setFilters(next); setDrawerOpen(false) }
  function onNewProduct() { navigate('/product/new') }
  function onEditProduct(id) { navigate(`/product/${id}/edit`) }

  function onDeleteProduct(id) {
    const product = products.find(p => p.id === id)
    const productName = product?.product_name || 'Unknown Product'
    setDeleteConfirm({ id, name: productName })
  }

  async function handleConfirmDelete() {
    if (!deleteConfirm) return

    try {
      await productsApi.deleteProduct(deleteConfirm.id, true) // hard delete
      setDeleteConfirm(null)
      await fetchList() // refresh the list
    } catch (err) {
      console.error('Failed to delete product:', err)
      toast.error(err.response?.data?.detail || err.message || 'Failed to delete product')
      setDeleteConfirm(null)
    }
  }

  function handleCancelDelete() {
    setDeleteConfirm(null)
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-black">Products</h1>
        <div className="flex gap-2">
          <button
            onClick={onNewProduct}
            className="rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm hover:bg-gray-100 flex items-center gap-2"
          >
            <Plus size={16} className="text-gray-800" />
            New Product
          </button>
          <button
            onClick={onOpenDrawer}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
          >
            <Search size={16} className="text-gray-800" />
            Search & Filter
          </button>
          <button
            onClick={fetchList}
            disabled={loading}
            className="rounded-xl bg-black text-white px-3 py-2 text-sm hover:bg-gray-900 disabled:opacity-70 flex items-center gap-2"
          >
            <RefreshCw size={16} className="text-white" />
            {loading ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-sm text-gray-600">Loading…</div>
      ) : (
        <ProductsTable
          rows={pagedRows}
          sort={sort}
          onSortChange={onSortChange}
          onEdit={onEditProduct}
          onDelete={onDeleteProduct}
          page={page}
          pageSize={pageSize}
          total={total}
          onChangePage={setPage}
          onChangePageSize={(n) => { setPageSize(n); setPage(1) }}
        />
      )}

      <ProductsSearchDrawer
        open={drawerOpen}
        initialFilters={filters}
        onClose={onCloseDrawer}
        onApply={onApplyFilters}
      />

      <ConfirmDialog
        open={!!deleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${deleteConfirm?.name}"? This action cannot be undone and the product will be removed from the database.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}
