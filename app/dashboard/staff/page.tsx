'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function StaffPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [staff, setStaff] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUser(user)

      const { data: profile } = await supabase
        .from('users')
        .select('*, roles(name, permissions)')
        .eq('id', user.id)
        .single()
      setUserProfile(profile)

      const { data: staffData } = await supabase
        .from('staff')
        .select('*')
        .order('first_name')
      setStaff(staffData || [])
      setLoading(false)
    }
    getData()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const roleName = userProfile?.roles?.name || ''
  const isManagement = ['Director', 'Finance Manager', 'Management Admin Staff'].includes(roleName)

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { label: 'Personel', href: '/dashboard/staff', icon: '👥' },
    { label: 'Öğrenciler', href: '/dashboard/students', icon: '🎓' },
    { label: 'Aileler', href: '/dashboard/families', icon: '👨‍👩‍👧' },
    { label: 'Finans', href: '/dashboard/finance', icon: '💰' },
    ...(isManagement ? [{ label: 'Yönetim', href: '/dashboard/admin', icon: '⚙️' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-sm min-h-screen flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-lg font-bold text-gray-800">Maarif School</h1>
          <p className="text-xs text-gray-500 mt-1">System</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                    item.href === '/dashboard/staff'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <p className="text-sm font-medium text-gray-700">{userProfile?.first_name} {userProfile?.surname}</p>
          <p className="text-xs text-gray-500 mb-3">{roleName}</p>
          <button onClick={handleLogout} className="w-full bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600 transition">
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Personel</h2>
          <Link href="/dashboard/staff/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
            + Yeni Personel
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Yükleniyor...</p>
        ) : staff.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-400 text-lg">Henüz personel kaydı yok</p>
            <p className="text-gray-400 text-sm mt-2">Yeni personel eklemek için yukarıdaki butonu kullanın</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Ad Soyad</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Pozisyon</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Durum</th>
                  <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staff.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-700">{s.first_name} {s.surname}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{s.position}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        s.employment_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {s.employment_status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-blue-600 hover:underline cursor-pointer">Görüntüle</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}