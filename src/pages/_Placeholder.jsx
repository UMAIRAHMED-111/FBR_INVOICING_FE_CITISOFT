import DashboardLayout from '../layouts/DashboardLayout'

export default function Placeholder({ title }) {
  return (
    <DashboardLayout>
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="text-xl font-semibold text-black">{title}</div>
        <p className="mt-2 text-sm text-gray-600">This is a placeholder page for {title}.</p>
      </div>
    </DashboardLayout>
  )
}


