'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUser(user)

      const { data: profile } = await supabase
        .from('users')
        .select('*, roles(name, permissions)')
        .eq('id', user.id)
        .single()

      setUserProfile(profile)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Yükleniyor...</p>
    </div>
  )

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
      {/* Sidebar */}
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
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition text-sm font-medium"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t">
          <div className="mb-3">
            <p className="text-sm font-medium text-gray-700">{userProfile?.first_name} {userProfile?.surname}</p>
            <p className="text-xs text-gray-500">{roleName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded-lg text-sm hover:bg-red-600 transition"
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          {isManagement ? 'Yönetim Paneli' : 'Okul Paneli'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition cursor-pointer">
            <div className="text-3xl mb-3">👥</div>
            <h3 className="text-lg font-medium text-gray-700">Personel</h3>
            <p className="text-gray-500 text-sm mt-1">Personel kayıtları ve belgeler</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition cursor-pointer">
            <div className="text-3xl mb-3">🎓</div>
            <h3 className="text-lg font-medium text-gray-700">Öğrenciler</h3>
            <p className="text-gray-500 text-sm mt-1">Öğrenci kayıtları ve belgeler</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition cursor-pointer">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-lg font-medium text-gray-700">Finans</h3>
            <p className="text-gray-500 text-sm mt-1">Ödemeler ve takip</p>
          </div>
        </div>
      </main>
    </div>
  )
}