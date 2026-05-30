'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (!user) return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Maarif School System</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 text-sm">{user.email}</span>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600"
          >
            Çıkış Yap
          </button>
        </div>
      </nav>
      <main className="p-8">
        <h2 className="text-2xl font-semibold text-gray-700">Dashboard</h2>
        <p className="text-gray-500 mt-2">Hoş geldiniz. Sistem hazırlanıyor...</p>
      </main>
    </div>
  )
}