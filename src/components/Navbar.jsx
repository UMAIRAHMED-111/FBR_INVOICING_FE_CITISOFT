import { useDispatch, useSelector } from 'react-redux'
import { logoutThunk } from '../store/slices/authSlice'
import BrandLogo from './BrandLogo'

export default function Navbar() {
	const dispatch = useDispatch()
	const me = useSelector(s => s.user.me)
	const tenantId = useSelector(s => s.tenant.id)

	return (
		<div className="flex items-center gap-4 px-4 py-3 border-b border-gray-200 bg-white">
			<div className="flex items-center gap-3">
				<BrandLogo size={40} showText={false} />
				<strong className="text-black">Invoicing</strong>
			</div>
			<div className="ml-auto text-sm text-gray-700">
				{me ? `${me.full_name} (${me.email})` : 'Guest'} {tenantId ? `| Tenant: ${tenantId}` : ''}
				{me && (
					<button onClick={() => dispatch(logoutThunk())} className="ml-3 px-3 py-1 rounded-lg border border-gray-300 hover:bg-gray-50">
						Logout
					</button>
				)}
			</div>
		</div>
	)
}


