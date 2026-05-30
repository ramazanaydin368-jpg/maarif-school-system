'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

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

  const roleName = userProfile?.roles?.name || 'Bilinmiyor'
  const isManagement = ['Director', 'Finance Manager', 'Management Admin Staff'].includes(roleName)

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Maarif School System</h1>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-700">{userProfile?.first_name} {userProfile?.surname}</p>
            <p className="text-xs text-gray-500">{roleName}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600"
          >
            Çıkış Yap
          </button>
        </div>
      </nav>

      <main className="p-8">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          {isManagement ? 'Yönetim Paneli' : 'Okul Paneli'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-700">Personel</h3>
            <p className="text-gray-500 text-sm mt-1">Personel kayıtları</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-700">Öğrenciler</h3>
            <p className="text-gray-500 text-sm mt-1">Öğrenci kayıtları</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-700">Finans</h3>
            <p className="text-gray-500 text-sm mt-1">Finans işlemleri</p>
          </div>
        </div>
      </main>
    </div>
  )
}