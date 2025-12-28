import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import RequireAuth from './components/RequireAuth'
import DashboardLayout from './layouts/DashboardLayout'
import RequireNonTenant from './components/RequireNonTenant'

// New feature pages
import LoginPage from './features/auth/LoginPage'
import PasswordResetRequestPage from './features/auth/PasswordResetRequestPage'
import PasswordResetConfirmPage from './features/auth/PasswordResetConfirmPage'
import InviteAcceptPage from './features/tenant/InviteAcceptPage'
import CreateTenantPage from './features/tenant/CreateTenantPage'
import InviteUserPage from './features/tenant/InviteUserPage'
import ProfilePage from './features/account/ProfilePage'
import TenantsPage from './features/tenants/TenantsPage'
import TenantMembersPage from './features/tenantMembers/TenantMembersPage'
import InvoicesPage from './features/invoices/InvoicesPage'
import NewInvoicePage from './features/invoices/NewInvoicePage'
import EditInvoicePage from './features/invoices/EditInvoicePage'

// Existing app pages (kept, now behind auth)
import Home from './pages/Home'
import Users from './pages/Users'
import Product from './pages/Product'
import Buyers from './pages/Buyers'

// Products feature
import ProductsPage from './features/products/ProductsPage'
import NewProductPage from './features/products/NewProductPage'
import EditProductPage from './features/products/EditProductPage'

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/login" element={<Navigate to="/" replace />} />
        <Route path="/auth/reset" element={<PasswordResetRequestPage />} />
        <Route path="/auth/reset/confirm" element={<PasswordResetConfirmPage />} />
        <Route path="/auth/reset-password" element={<PasswordResetConfirmPage />} />
        <Route path="/invites/accept" element={<InviteAcceptPage />} />

        <Route
          path="/tenant/create"
          element={
            <RequireAuth>
              <CreateTenantPage />
            </RequireAuth>
          }
        />
        <Route
          path="/tenant/invite"
          element={
            <RequireAuth>
              <InviteUserPage />
            </RequireAuth>
          }
        />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardLayout>
                <Home />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/users"
          element={
            <RequireAuth>
              <DashboardLayout>
                <RequireNonTenant>
                  <Users />
                </RequireNonTenant>
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/company"
          element={
            <RequireAuth>
              <DashboardLayout>
                <RequireNonTenant>
                  <TenantsPage />
                </RequireNonTenant>
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/company/:tenantId/members"
          element={
            <RequireAuth>
              <DashboardLayout>
                  <TenantMembersPage />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/product"
          element={
            <RequireAuth>
              <DashboardLayout>
                <ProductsPage />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/buyers"
          element={
            <RequireAuth>
              <DashboardLayout>
                <Buyers />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/invoices"
          element={
            <RequireAuth>
              <DashboardLayout>
                <InvoicesPage />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/invoices/new"
          element={
            <RequireAuth>
              <DashboardLayout>
                <NewInvoicePage />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/invoices/:id/edit"
          element={
            <RequireAuth>
              <DashboardLayout>
                <EditInvoicePage />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/product/new"
          element={
            <RequireAuth>
              <DashboardLayout>
                <NewProductPage />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/product/:id/edit"
          element={
            <RequireAuth>
              <DashboardLayout>
                <EditProductPage />
              </DashboardLayout>
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <DashboardLayout>
                <ProfilePage />
              </DashboardLayout>
            </RequireAuth>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
