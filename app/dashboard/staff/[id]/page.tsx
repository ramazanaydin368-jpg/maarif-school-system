'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

export default function StaffProfilePage() {
  const [staff, setStaff] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('staff')
        .select('*')
        .eq('id', params.id)
        .single()

      setStaff(data)
      setLoading(false)
    }
    getData()
  }, [params.id])

  const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
    { label: 'Personel', href: '/dashboard/staff', icon: '👥' },
    { label: 'Öğrenciler', href: '/dashboard/students', icon: '🎓' },
    { label: 'Aileler', href: '/dashboard/families', icon: '👨‍👩‍👧' },
    { label: 'Finans', href: '/dashboard/finance', icon: '💰' },
    { label: 'Yönetim', href: '/dashboard/admin', icon: '⚙️' },
  ]

  const tabs = [
    { id: 'profile', label: 'Profil' },
    { id: 'documents', label: 'Belgeler' },
    { id: 'leave', label: 'İzinler' },
    { id: 'history', label: 'Geçmiş' },
  ]

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Yükleniyor...</p></div>
  if (!staff) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Personel bulunamadı.</p></div>

  const statusColors: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    resigned: 'bg-gray-100 text-gray-600',
    terminated: 'bg-red-100 text-red-700',
    suspended: 'bg-orange-100 text-orange-700',
  }

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
                <Link href={item.href} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${item.href === '/dashboard/staff' ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'}`}>
                  <span>{item.icon}</span><span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/staff" className="text-gray-500 hover:text-gray-700 text-sm">← Personel Listesi</Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{staff.first_name} {staff.surname}</h2>
              <p className="text-gray-500 mt-1">{staff.position} {staff.position_custom && `(${staff.position_custom})`}</p>
              <p className="text-gray-400 text-sm mt-1">{staff.staff_code || 'Kod atanmadı'}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[staff.employment_status] || 'bg-gray-100 text-gray-600'}`}>
                {staff.employment_status}
              </span>
              <Link href={`/dashboard/staff/${staff.id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
                Düzenle
              </Link>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium transition border-b-2 ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Profil Sekmesi */}
            {activeTab === 'profile' && (
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Kişisel Bilgiler</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs text-gray-400">Cinsiyet</dt>
                      <dd className="text-sm text-gray-700">{staff.gender || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Doğum Tarihi</dt>
                      <dd className="text-sm text-gray-700">{staff.date_of_birth || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">TC / Pasaport No</dt>
                      <dd className="text-sm text-gray-700">{staff.id_passport_number || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Uyruk</dt>
                      <dd className="text-sm text-gray-700">{staff.nationality || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Medeni Durum</dt>
                      <dd className="text-sm text-gray-700">{staff.marital_status || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Cep Telefonu</dt>
                      <dd className="text-sm text-gray-700">{staff.mobile || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">E-posta</dt>
                      <dd className="text-sm text-gray-700">{staff.email || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Adres</dt>
                      <dd className="text-sm text-gray-700">{staff.address || '—'}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">İstihdam Bilgileri</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs text-gray-400">İstihdam Türü</dt>
                      <dd className="text-sm text-gray-700">{staff.employment_type || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">İşe Başlama</dt>
                      <dd className="text-sm text-gray-700">{staff.contract_start_date || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Sözleşme Bitiş</dt>
                      <dd className="text-sm text-gray-700">{staff.contract_end_date || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Deneme Süresi</dt>
                      <dd className="text-sm text-gray-700">{staff.probation_months ? `${staff.probation_months} ay` : '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Yıllık İzin</dt>
                      <dd className="text-sm text-gray-700">{staff.annual_leave_eligible ? 'Evet' : 'Hayır'}</dd>
                    </div>
                  </dl>

                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 mt-8">Acil İletişim</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs text-gray-400">Ad Soyad</dt>
                      <dd className="text-sm text-gray-700">{staff.emergency_contact_name || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Yakınlık</dt>
                      <dd className="text-sm text-gray-700">{staff.emergency_contact_relationship || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Telefon</dt>
                      <dd className="text-sm text-gray-700">{staff.emergency_contact_number || '—'}</dd>
                    </div>
                  </dl>

                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 mt-8">Banka Bilgileri</h3>
                  <dl className="space-y-3">
                    <div>
                      <dt className="text-xs text-gray-400">Banka</dt>
                      <dd className="text-sm text-gray-700">{staff.bank_name || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Hesap Sahibi</dt>
                      <dd className="text-sm text-gray-700">{staff.account_holder || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Hesap No</dt>
                      <dd className="text-sm text-gray-700">{staff.account_number || '—'}</dd>
                    </div>
                    <div>
                      <dt className="text-xs text-gray-400">Branch Code</dt>
                      <dd className="text-sm text-gray-700">{staff.branch_code || '—'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <p className="text-gray-400 text-center py-12">Belgeler modülü yakında eklenecek.</p>
              </div>
            )}

            {activeTab === 'leave' && (
              <div>
                <p className="text-gray-400 text-center py-12">İzin modülü yakında eklenecek.</p>
              </div>
            )}

            {activeTab === 'history' && (
              <div>
                <p className="text-gray-400 text-center py-12">Geçmiş modülü yakında eklenecek.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}