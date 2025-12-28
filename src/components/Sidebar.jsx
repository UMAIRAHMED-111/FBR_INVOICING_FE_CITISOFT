import BrandLogo from './BrandLogo'
import { NavLink } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  ShoppingCart,
  FileText,
  UserCheck,
} from 'lucide-react'

function NavItem({ label, icon, to, collapsed = false }) {
  return (
    <NavLink
      to={to}
      title={label}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${isActive ? 'bg-gray-100 text-black' : 'text-gray-700 hover:bg-gray-100'}`
      }
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </NavLink>
  )
}

export default function Sidebar({ open = true }) {
  const me = useSelector(s => s.user.me)
  const tenantId = useSelector(s => s.tenant.id)
  const isTenantUser = me?.user_type === 'tenant_user'
  const widthLg = open ? 'lg:w-64' : 'lg:w-16'
  const logoSize = open ? 22 : 21
  const translateClass = open ? 'translate-x-0' : '-translate-x-full'
  return (
    <aside className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 flex flex-col
      transform transition-transform duration-300 w-64 ${translateClass} lg:translate-x-0 ${widthLg}`}>
      <div className="px-4 py-3 border-b border-gray-200">
        <BrandLogo size={logoSize} showText={false} />
      </div>
      <nav className="p-3 space-y-1 overflow-y-auto">
        <NavItem
          to="/dashboard"
          label="Dashboard"
          icon={<LayoutDashboard size={18} className="text-gray-600" />}
          collapsed={!open}
        />
        {!isTenantUser && (
          <NavItem
            to="/users"
            label="Users"
            icon={<Users size={18} className="text-gray-600" />}
            collapsed={!open}
          />
        )}
        {!isTenantUser && (
          <NavItem
            to="/company"
            label="Company"
            icon={<Building2 size={18} className="text-gray-600" />}
            collapsed={!open}
          />
        )}
        {isTenantUser && tenantId && (
          <NavItem
            to={`/company/${tenantId}/members`}
            label="Members"
            icon={<UserCheck size={18} className="text-gray-600" />}
            collapsed={!open}
          />
        )}
        <NavItem
          to="/product"
          label="Product"
          icon={<Package size={18} className="text-gray-600" />}
          collapsed={!open}
        />
        <NavItem
          to="/buyers"
          label="Buyers"
          icon={<ShoppingCart size={18} className="text-gray-600" />}
          collapsed={!open}
        />
        <NavItem
          to="/invoices"
          label="Invoices"
          icon={<FileText size={18} className="text-gray-600" />}
          collapsed={!open}
        />
      </nav>
    </aside>
  )
}


