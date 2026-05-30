'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

function DocumentsTab({ staffId, supabase }: { staffId: string, supabase: any }) {
  const [documents, setDocuments] = useState<any[]>([])
  const [uploading, setUploading] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('standard')
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [newDocName, setNewDocName] = useState('')
  const [customDocs, setCustomDocs] = useState<any>({ standard: [], policy: [] })

  const defaultDocs: any = {
    standard: ['ID / Passport', 'Contract', 'New Employee Form', 'Degree', 'PGCE (Varsa)', 'SACE', 'Certificate (Varsa)', 'Curriculum Vitae', 'Police Clearance Certificate', 'Other'],
    policy: ['Code of Conduct', 'İletişim Policy', 'Leave Policy', 'Other'],
  }

  const categories: any = { standard: 'Standart Belgeler', policy: 'Onaylanan Politikalar' }
  const statusColors: any = { uploaded: 'bg-blue-100 text-blue-700', approved: 'bg-green-100 text-green-700', rejected: 'bg-red-100 text-red-700' }

  useEffect(() => {
    const fetchDocs = async () => {
      const { data } = await supabase.from('staff_documents').select('*').eq('staff_id', staffId).order('created_at', { ascending: false })
      setDocuments(data || [])
    }
    fetchDocs()
  }, [staffId])

  const handleUpload = async (documentType: string, file: File) => {
    setUploading(documentType)
    const fileExt = file.name.split('.').pop()
    const filePath = `staff/${staffId}/${documentType.replace(/\s/g, '_')}_${Date.now()}.${fileExt}`
    const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, file)
    if (!uploadError) {
      await supabase.from('staff_documents').insert({ staff_id: staffId, category: selectedCategory, document_type: documentType, file_url: filePath, status: 'uploaded', upload_date: new Date().toISOString() })
      const { data } = await supabase.from('staff_documents').select('*').eq('staff_id', staffId).order('created_at', { ascending: false })
      setDocuments(data || [])
    }
    setUploading(null)
  }

  const handleAddDoc = () => {
    if (!newDocName.trim()) return
    setCustomDocs((prev: any) => ({ ...prev, [selectedCategory]: [...prev[selectedCategory], newDocName.trim()] }))
    setNewDocName('')
    setShowAddDoc(false)
  }

  const allDocs = [...defaultDocs[selectedCategory], ...customDocs[selectedCategory]]

  return (
    <div>
      <div className="flex gap-2 mb-6">
        {Object.keys(categories).map((cat) => (
          <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {categories[cat]}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {allDocs.map((docType: string) => {
          const uploaded = documents.filter(d => d.document_type === docType)
          return (
            <div key={docType} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-700">{docType}</p>
                  {uploaded.length > 0 && <p className="text-xs text-gray-400 mt-1">{uploaded.length} belge yüklendi</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${uploaded.length > 0 ? (statusColors[uploaded[0].status] || 'bg-blue-100 text-blue-700') : 'bg-gray-100 text-gray-500'}`}>
                    {uploaded.length > 0 ? uploaded[0].status : 'Yüklenmedi'}
                  </span>
                  <label className={`px-3 py-1.5 rounded-lg text-xs cursor-pointer transition text-white ${uploading === docType ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                    {uploading === docType ? 'Yükleniyor...' : 'Yükle'}
                    <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" disabled={!!uploading} onChange={(e) => { if (e.target.files?.[0]) handleUpload(docType, e.target.files[0]) }} />
                  </label>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      {showAddDoc ? (
        <div className="mt-4 flex gap-2">
          <input value={newDocName} onChange={(e) => setNewDocName(e.target.value)} placeholder="Belge adını girin..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" onKeyDown={(e) => e.key === 'Enter' && handleAddDoc()} />
          <button onClick={handleAddDoc} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">Ekle</button>
          <button onClick={() => setShowAddDoc(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition">İptal</button>
        </div>
      ) : (
        <button onClick={() => setShowAddDoc(true)} className="mt-4 text-blue-600 text-sm hover:underline">+ Belge Ekle</button>
      )}
    </div>
  )
}

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
      const { data } = await supabase.from('staff').select('*').eq('id', params.id).single()
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

  const statusColors: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    active: 'bg-green-100 text-green-700',
    resigned: 'bg-gray-100 text-gray-600',
    terminated: 'bg-red-100 text-red-700',
    suspended: 'bg-orange-100 text-orange-700',
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Yükleniyor...</p></div>
  if (!staff) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Personel bulunamadı.</p></div>

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
        <div className="flex items-center gap-4 mb-6">
          <Link href="/dashboard/staff" className="text-gray-500 hover:text-gray-700 text-sm">← Personel Listesi</Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{staff.first_name} {staff.surname}</h2>
              <p className="text-gray-500 mt-1">{staff.position}</p>
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

        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b flex">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-6 py-4 text-sm font-medium transition border-b-2 ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Kişisel Bilgiler</h3>
                  <dl className="space-y-3">
                    {[
                      { label: 'Cinsiyet', value: staff.gender },
                      { label: 'Doğum Tarihi', value: staff.date_of_birth },
                      { label: 'TC / Pasaport No', value: staff.id_passport_number },
                      { label: 'Uyruk', value: staff.nationality },
                      { label: 'Medeni Durum', value: staff.marital_status },
                      { label: 'Cep Telefonu', value: staff.mobile },
                      { label: 'E-posta', value: staff.email },
                      { label: 'Adres', value: staff.address },
                    ].map(item => (
                      <div key={item.label}>
                        <dt className="text-xs text-gray-400">{item.label}</dt>
                        <dd className="text-sm text-gray-700">{item.value || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">İstihdam Bilgileri</h3>
                  <dl className="space-y-3">
                    {[
                      { label: 'İstihdam Türü', value: staff.employment_type },
                      { label: 'İşe Başlama', value: staff.contract_start_date },
                      { label: 'Sözleşme Bitiş', value: staff.contract_end_date },
                      { label: 'Deneme Süresi', value: staff.probation_months ? `${staff.probation_months} ay` : null },
                      { label: 'Yıllık İzin', value: staff.annual_leave_eligible ? 'Evet' : 'Hayır' },
                    ].map(item => (
                      <div key={item.label}>
                        <dt className="text-xs text-gray-400">{item.label}</dt>
                        <dd className="text-sm text-gray-700">{item.value || '—'}</dd>
                      </div>
                    ))}
                  </dl>

                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 mt-8">Acil İletişim</h3>
                  <dl className="space-y-3">
                    {[
                      { label: 'Ad Soyad', value: staff.emergency_contact_name },
                      { label: 'Yakınlık', value: staff.emergency_contact_relationship },
                      { label: 'Telefon', value: staff.emergency_contact_number },
                    ].map(item => (
                      <div key={item.label}>
                        <dt className="text-xs text-gray-400">{item.label}</dt>
                        <dd className="text-sm text-gray-700">{item.value || '—'}</dd>
                      </div>
                    ))}
                  </dl>

                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4 mt-8">Banka Bilgileri</h3>
                  <dl className="space-y-3">
                    {[
                      { label: 'Banka', value: staff.bank_name },
                      { label: 'Hesap Sahibi', value: staff.account_holder },
                      { label: 'Hesap No', value: staff.account_number },
                      { label: 'Branch Code', value: staff.branch_code },
                    ].map(item => (
                      <div key={item.label}>
                        <dt className="text-xs text-gray-400">{item.label}</dt>
                        <dd className="text-sm text-gray-700">{item.value || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            )}

            {activeTab === 'documents' && (
              <DocumentsTab staffId={params.id as string} supabase={supabase} />
            )}

            {activeTab === 'leave' && (
              <div><p className="text-gray-400 text-center py-12">İzin modülü yakında eklenecek.</p></div>
            )}

            {activeTab === 'history' && (
              <div><p className="text-gray-400 text-center py-12">Geçmiş modülü yakında eklenecek.</p></div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}