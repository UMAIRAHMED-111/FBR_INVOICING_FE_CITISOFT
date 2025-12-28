import { useSelector } from 'react-redux'

export default function RequireNonTenant({ children }) {
	const me = useSelector(s => s.user.me)
	const isTenantUser = me?.user_type === 'tenant_user'
	if (isTenantUser) {
		return (
			<div className="max-w-3xl mx-auto p-4">
				<div className="rounded-xl border border-red-200 bg-red-50 text-red-800 p-4">
					<div className="font-semibold text-red-900">Access restricted</div>
					<p className="mt-1 text-sm">
						This page is not available to company users. If you believe this is a mistake, please contact an administrator.
					</p>
				</div>
			</div>
		)
	}
	return children
}


