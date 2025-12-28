import { useEffect, useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

import { invoicesApi } from '../api/invoices'
import toast from 'react-hot-toast'

const STATUS_COLORS = {
  CREATED: '#2563eb',
  SUBMITTED: '#0ea5e9',
  VALIDATED: '#14b8a6',
  PAID: '#10b981',
  DEFAULT: '#a855f7',
}

const STATUS_BADGE_CLASSES = {
  CREATED: 'bg-blue-50 text-blue-700 border-blue-100',
  SUBMITTED: 'bg-sky-50 text-sky-700 border-sky-100',
  VALIDATED: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  PAID: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  UNKNOWN: 'bg-slate-50 text-slate-700 border-slate-100',
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'PKR',
  minimumFractionDigits: 2,
})

function StatCard({ title, value, sub, accent = 'indigo' }) {
  const accentStyles = {
    indigo: {
      border: 'border-indigo-100',
      glow: 'shadow-indigo-200/50',
      gradient: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
    },
    emerald: {
      border: 'border-emerald-100',
      glow: 'shadow-emerald-200/50',
      gradient: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
    },
    amber: {
      border: 'border-amber-100',
      glow: 'shadow-amber-200/50',
      gradient: 'from-amber-500/10 via-amber-500/5 to-transparent',
    },
    sky: {
      border: 'border-sky-100',
      glow: 'shadow-sky-200/50',
      gradient: 'from-sky-500/10 via-sky-500/5 to-transparent',
    },
  }

  const styles = accentStyles[accent] || accentStyles.indigo

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white/90 p-4 shadow-sm ${styles.border} ${styles.glow} ring-1 ring-white/60 backdrop-blur-sm transition-transform duration-150 hover:-translate-y-0.5`}
    >
      <div className={`pointer-events-none absolute inset-0 bg-linear-to-br ${styles.gradient}`} />
      <div className="relative flex flex-col gap-1">
        <div className="text-[11px] font-medium uppercase tracking-wide text-gray-500">{title}</div>
        <div className="text-2xl font-semibold text-slate-900">{value}</div>
        {sub && <div className="text-xs text-gray-500">{sub}</div>}
      </div>
    </div>
  )
}

function formatDateLabel(date, period = 'daily') {
  if (!date) return ''
  
  switch (period) {
    case 'daily':
      const d = new Date(date)
      return `${d.getDate()}/${d.getMonth() + 1}`
    case 'weekly':
      // Show week start date
      const w = new Date(date)
      return `${w.getDate()}/${w.getMonth() + 1}`
    case 'monthly':
      const m = new Date(date)
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      return `${monthNames[m.getMonth()]} ${m.getFullYear()}`
    case 'quarterly':
      // date is like "2025-Q1"
      return date
    case 'yearly':
      const y = new Date(date)
      return `${y.getFullYear()}`
    default:
      const def = new Date(date)
      return `${def.getDate()}/${def.getMonth() + 1}`
  }
}

function getWeekKey(date) {
  const d = new Date(date)
  const startOfWeek = new Date(d)
  startOfWeek.setDate(d.getDate() - d.getDay()) // Set to Sunday
  return startOfWeek.toISOString().slice(0, 10)
}

function getQuarterKey(date) {
  const d = new Date(date)
  const quarter = Math.floor(d.getMonth() / 3) + 1
  return `${d.getFullYear()}-Q${quarter}`
}

function ShimmerBlock({ height = 16, width = '100%', rounded = 'rounded', className = '' }) {
  return (
    <div
      className={`bg-linear-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse ${rounded} ${className}`}
      style={{ height, width }}
      aria-hidden="true"
    />
  )
}

function ShimmerLineChart() {
  return (
    <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-4 h-80">
      <ShimmerBlock height={16} width="35%" className="mb-3" />
      <ShimmerBlock height="calc(100% - 24px)" width="100%" rounded="rounded-xl" />
    </div>
  )
}

function ShimmerPieChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 h-80">
      <ShimmerBlock height={16} width="45%" className="mb-3" />
      <div className="h-4/5 flex items-center justify-center">
        <ShimmerBlock height={160} width={160} rounded="rounded-full" />
      </div>
    </div>
  )
}

export default function Home() {
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [timePeriod, setTimePeriod] = useState('daily')
  const tenantId = useSelector((state) => state.tenant.id)
  const me = useSelector((state) => state.user.me)
  const token = useSelector((state) => state.auth.token)
  const isTenantUser = me?.user_type === 'tenant_user'
  const navigate = useNavigate()

  useEffect(() => {
    // Don't fetch if not authenticated
    if (!token) {
      setLoading(false)
      return
    }
    const abortController = new AbortController()
    let active = true
    async function fetchExpanded() {
      setLoading(true)
      try {
        const params = {}
        if (isTenantUser && tenantId) {
          params.tenant_id = tenantId
        }
        const data = await invoicesApi.listExpanded(params, abortController.signal)
        if (active) setInvoices(Array.isArray(data) ? data : [])
      } catch (err) {
        // Ignore aborted requests
        if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
          return
        }
        // Only show error if still active and authenticated
        if (active && token) {
          toast.error(err.response?.data?.detail || 'Failed to load invoices')
        }
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchExpanded()
    return () => {
      active = false
      abortController.abort()
    }
  }, [isTenantUser, tenantId, token])

  const totalSales = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (parseFloat(inv.invoice_amount) || 0), 0)
  }, [invoices])

  const totalInvoices = invoices.length

  const statusDistribution = useMemo(() => {
    const map = new Map()
    invoices.forEach((inv) => {
      const key = inv.invoice_status || 'UNKNOWN'
      map.set(key, (map.get(key) || 0) + 1)
    })
    return Array.from(map.entries()).map(([status, value]) => ({
      name: status,
      value,
      color: STATUS_COLORS[status] || STATUS_COLORS.DEFAULT,
    }))
  }, [invoices])

  const lineData = useMemo(() => {
    const buckets = new Map()
    invoices.forEach((inv) => {
      const date = inv.invoice_date || inv.created_at
      if (!date) return
      
      let key
      switch (timePeriod) {
        case 'daily':
          key = date.slice(0, 10)
          break
        case 'weekly':
          key = getWeekKey(date)
          break
        case 'monthly':
          key = date.slice(0, 7) // YYYY-MM
          break
        case 'quarterly':
          key = getQuarterKey(date)
          break
        case 'yearly':
          key = date.slice(0, 4) // YYYY
          break
        default:
          key = date.slice(0, 10)
      }
      
      buckets.set(key, (buckets.get(key) || 0) + (parseFloat(inv.invoice_amount) || 0))
    })
    return Array.from(buckets.entries())
      .sort(([a], [b]) => {
        // For quarterly, we need custom sorting
        if (timePeriod === 'quarterly') {
          return a.localeCompare(b)
        }
        return new Date(a) - new Date(b)
      })
      .map(([key, total]) => {
        let displayDate
        if (timePeriod === 'quarterly') {
          // key is like "2025-Q1"
          displayDate = key
        } else if (timePeriod === 'yearly') {
          displayDate = key + '-01-01'
        } else if (timePeriod === 'monthly') {
          displayDate = key + '-01'
        } else {
          displayDate = key
        }
        
        return { 
          date: formatDateLabel(displayDate, timePeriod), 
          total 
        }
      })
  }, [invoices, timePeriod])

  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
  }, [invoices])

  const averageInvoice = totalInvoices ? totalSales / totalInvoices : 0

  const topBuyerStats = useMemo(() => {
    const agg = invoices.reduce((acc, invoice) => {
      const buyerName = invoice.buyer?.business_name || invoice.description_buyer || 'Unknown'
      acc[buyerName] = (acc[buyerName] || 0) + (parseFloat(invoice.invoice_amount) || 0)
      return acc
    }, {})
    const entries = Object.entries(agg)
    if (entries.length === 0) return []
    const totalValue = entries.reduce((sum, [, v]) => sum + v, 0)
    return entries
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, value]) => ({
        name,
        value,
        share: totalValue ? Math.round((value / totalValue) * 100) : 0,
      }))
  }, [invoices])

  if (loading) {
    return (
      <div className="space-y-4 mt-8">
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <ShimmerBlock key={idx} height={80} />
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <ShimmerLineChart />
            <ShimmerPieChart />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-white border border-gray-200 rounded-xl p-4">
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <ShimmerBlock key={idx} height={28} width="100%" className="rounded-lg" />
                ))}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, idx) => (
                  <ShimmerBlock key={idx} height={20} width="100%" className="rounded-lg" />
                ))}
              </div>
            </div>
          </div>
        </div>
    )
  }

  return (
      <div className="space-y-4">
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            title="Total Sales (last 60 days)"
            value={currencyFormatter.format(totalSales)}
            sub={`${totalInvoices} invoices`}
            accent="indigo"
          />
          <StatCard
            title="Average Invoice"
            value={currencyFormatter.format(averageInvoice)}
            sub="Based on expanded data"
            accent="emerald"
          />
          <StatCard
            title="Pending / Created"
            value={statusDistribution.find((s) => s.name === 'CREATED')?.value ?? 0}
            sub="Awaiting submission"
            accent="amber"
          />
          <StatCard
            title="Validated / Paid"
            value={
              (statusDistribution.find((s) => s.name === 'VALIDATED')?.value ?? 0) +
              (statusDistribution.find((s) => s.name === 'PAID')?.value ?? 0)
            }
            sub="Ready for reconciliation"
            accent="sky"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-4 h-80 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-medium text-gray-800">Sales Trend (PKR)</div>
                <div className="text-xs text-gray-500">By invoice date</div>
              </div>
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                {['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].map((period) => (
                  <button
                    key={period}
                    onClick={() => setTimePeriod(period)}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                      timePeriod === period
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {period.charAt(0).toUpperCase() + period.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart
              data={lineData}
              margin={{ 
                top: 8, 
                right: 16, 
                left: 8, 
                bottom: timePeriod === 'monthly' ? 50 : 16 
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
                angle={timePeriod === 'monthly' ? -45 : 0}
                textAnchor={timePeriod === 'monthly' ? 'end' : 'middle'}
                height={timePeriod === 'monthly' ? 60 : 30}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={80}
                domain={[0, (dataMax) => (dataMax ? Math.ceil(dataMax * 1.2) : 1000)]}
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
                  return value
                }}
                tick={{ fontSize: 11 }}
              />
              <Tooltip
                formatter={(value) => currencyFormatter.format(value)}
                contentStyle={{ fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#2563eb"
                strokeWidth={2}
                dot={{ r: 3 }}
                activeDot={{ r: 5 }}
              />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 h-80 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-sm font-medium text-gray-800">Status Breakdown</div>
                <div className="text-xs text-gray-500">Share of invoices by status</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <PieChart>
                <Pie data={statusDistribution} dataKey="value" nameKey="name" innerRadius={55} outerRadius={70} paddingAngle={3}>
                  {statusDistribution.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="text-sm text-gray-700 mb-3 flex items-center justify-between">
              <span>Recent Expanded Invoices</span>
              <Link to="/invoices" className="text-xs text-blue-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y divide-gray-100">
              {recentInvoices.map((invoice) => {
                const status = invoice.invoice_status || 'UNKNOWN'
                const badgeClass =
                  STATUS_BADGE_CLASSES[status] || STATUS_BADGE_CLASSES.UNKNOWN
                return (
                  <div
                    key={invoice.id}
                    className="py-3 px-2 -mx-2 flex items-center justify-between gap-4 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-slate-900 truncate">
                          {invoice.usin_no || invoice.fbr_invoice_no}
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${badgeClass}`}
                        >
                          {status}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-gray-500 truncate">
                        {invoice.customer?.name || invoice.description_seller || 'Unknown seller'} •{' '}
                        {invoice.invoice_date || invoice.created_at}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-sm">
                      <div className="font-semibold text-slate-900">
                        {currencyFormatter.format(invoice.invoice_amount || 0)}
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/invoices/${invoice.id}/edit`)}
                        className="text-[11px] font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        View invoice
                      </button>
                    </div>
                  </div>
                )
              })}
              {recentInvoices.length === 0 && (
                <div className="py-6 text-center text-xs text-gray-500">No invoices in the last 60 days.</div>
              )}
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
            <div className="text-sm font-medium text-gray-800 mb-1">Top Buyers</div>
            <div className="text-xs text-gray-500 mb-3">Based on invoice amount in last 60 days</div>
            <div className="space-y-3 text-sm text-gray-600">
              {topBuyerStats.map((buyer) => (
                <div key={buyer.name} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium text-gray-800">{buyer.name}</span>
                    <span className="text-xs text-gray-500">{buyer.share}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.min(buyer.share, 100)}%` }}
                      />
                    </div>
                    <span className="ml-2 text-xs font-semibold text-slate-900">
                      {currencyFormatter.format(buyer.value)}
                    </span>
                  </div>
                </div>
              ))}
              {topBuyerStats.length === 0 && (
                <div className="py-4 text-xs text-gray-500 text-center">No buyer data available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}
