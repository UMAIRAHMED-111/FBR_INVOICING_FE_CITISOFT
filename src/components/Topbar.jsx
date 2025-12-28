import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { logoutThunk } from '../store/slices/authSlice'
import toast from 'react-hot-toast'
import { AlertTriangle } from 'lucide-react'

export default function Topbar({ sidebarOpen = true, onToggleSidebar }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const me = useSelector(s => s.user.me)

  useEffect(() => {
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  // Keep top bar aligned with actual sidebar width:
  // - 64 (16rem) when expanded
  // - 16 (4rem) when collapsed
  const leftClass = sidebarOpen ? 'lg:left-64 left-0' : 'lg:left-16 left-0'
  const path = location.pathname
  const pageNameMap = {
    '/dashboard': 'Dashboard',
    '/users': 'Users',
    '/company': 'Company',
    '/branch': 'Branch',
    '/product': 'Product',
    '/customers': 'Customers',
    '/suppliers': 'Suppliers',
    '/invoices': 'Invoices',
    '/export': 'Export Data',
  }
  const currentPage = pageNameMap[path] || 'Dashboard'

  // Compute upcoming payment warning based on last_payment_at (from /accounts/me)
  // Show a warning when payment is due in the next 7 days (i.e. 23-29 days since last payment).
  const paymentWarning = useMemo(() => {
    if (!me?.last_payment_at) return null
    const lastPaid = new Date(me.last_payment_at)
    if (Number.isNaN(lastPaid.getTime())) return null
    const now = new Date()
    const msPerDay = 24 * 60 * 60 * 1000
    const daysSince = Math.floor((now - lastPaid) / msPerDay)
    const daysLeft = 30 - daysSince
    if (daysLeft > 0 && daysLeft <= 7) {
      return {
        daysLeft,
        text: `Payment due in ${daysLeft} day${daysLeft === 1 ? '' : 's'}.`,
      }
    }
    return null
  }, [me?.last_payment_at])

  // Whenever a payment warning becomes available (after login/me load),
  // automatically open the payment modal once.
  useEffect(() => {
    if (paymentWarning) {
      setPaymentModalOpen(true)
    }
  }, [paymentWarning])

  return (
    <>
    <header className={`fixed top-0 ${leftClass} right-0 h-14 bg-white border-b border-gray-200 z-40 flex items-center px-4`}>
      <button
        type="button"
        onClick={onToggleSidebar}
        className="mr-3 ml-2 h-9 w-9 grid place-items-center rounded-md border border-gray-300 hover:bg-gray-50"
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-black">
          <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <div className="text-sm font-medium text-black">FBR E Invoicing Portal</div>
      <div className="ml-4 text-xs text-gray-500 hidden sm:block">/ {currentPage}</div>

      {paymentWarning && (
        <button
          type="button"
          onClick={() => setPaymentModalOpen(true)}
          className="ml-4 hidden md:inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-medium text-amber-800 hover:bg-amber-100"
        >
          <AlertTriangle size={14} className="text-amber-600 flex-shrink-0" />
          <span>{paymentWarning.text}</span>
        </button>
      )}

      <div className="ml-auto relative flex items-center gap-3" ref={menuRef}>
        <div className="hidden sm:flex flex-col items-end leading-tight">
          <div className="text-sm text-black">{me?.full_name || 'Guest'}</div>
          <div className="text-xs text-gray-500">{me?.email || ''}</div>
        </div>
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-2 pl-2 pr-2 py-1 rounded-md hover:bg-gray-50 ring-1 ring-transparent focus:ring-gray-300"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
        >
          <div className="h-9 w-9 rounded-full bg-gray-200 ring-1 ring-gray-300 grid place-items-center text-xs text-gray-600">
            {(me?.full_name || 'G').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
          </div>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-gray-600">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="px-3 py-2">
              <div className="text-sm text-black">{me?.full_name || 'Guest'}</div>
              <div className="text-xs text-gray-500">{me?.email || ''}</div>
            </div>
            <div className="h-px bg-gray-100" />
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
              onClick={() => { setMenuOpen(false); navigate('/profile') }}
            >View Profile</button>
            <div className="h-px bg-gray-100" />
            <button
              className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100"
              onClick={() => { setMenuOpen(false); dispatch(logoutThunk()); toast.success('Logged out'); navigate('/') }}
            >Logout</button>
          </div>
        )}
      </div>
    </header>
    {paymentWarning && paymentModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white shadow-xl p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5">
              <AlertTriangle size={18} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900 mb-1">Payment due soon</h2>
              <p className="text-xs text-gray-600 mb-2">
                Your subscription payment is due in {paymentWarning.daysLeft} day{paymentWarning.daysLeft === 1 ? '' : 's'}.
                If payment is not made by then, you will lose access to the portal.
              </p>
              <p className="text-xs text-gray-600">
                If you have already made the payment, please contact support to update your payment status.
              </p>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setPaymentModalOpen(false)}
              className="rounded-lg bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-900"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  )
}


