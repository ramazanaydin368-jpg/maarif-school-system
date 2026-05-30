'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

function LeaveTab({ staffId, staffStartDate, supabase, annualLeaveEligible, annualLeaveMethod }: {
  staffId: string, staffStartDate: string, supabase: any, annualLeaveEligible: boolean, annualLeaveMethod: string
}) {
  const [leaves, setLeaves] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ leave_type: '', from_date: '', to_date: '', reason: '', document_status: 'pending' })

  const leaveTypes = ['Sick Leave', 'Family Responsibility Leave (FRL)', 'Annual Leave', 'Unauthorized / No Notice Absence', 'Maternity Leave', 'Paternity Leave', 'Special Leave']

  const leaveTypeColors: any = {
    'Sick Leave': 'bg-red-100 text-red-700',
    'Family Responsibility Leave (FRL)': 'bg-orange-100 text-orange-700',
    'Annual Leave': 'bg-blue-100 text-blue-700',
    'Unauthorized / No Notice Absence': 'bg-gray-100 text-gray-700',
    'Maternity Leave': 'bg-pink-100 text-pink-700',
    'Paternity Leave': 'bg-purple-100 text-purple-700',
    'Special Leave': 'bg-green-100 text-green-700',
  }

  useEffect(() => { fetchLeaves() }, [staffId])

  const fetchLeaves = async () => {
    const { data } = await supabase.from('staff_leave_records').select('*').eq('staff_id', staffId).order('from_date', { ascending: false })
    setLeaves(data || [])
  }

  const calculateWorkingDays = (from: string, to: string) => {
    let count = 0
    const current = new Date(from)
    const end = new Date(to)
    while (current <= end) {
      const day = current.getDay()
      if (day !== 0 && day !== 6) count++
      current.setDate(current.getDate() + 1)
    }
    return count
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const workingDays = calculateWorkingDays(form.from_date, form.to_date)
    await supabase.from('staff_leave_records').insert({ staff_id: staffId, leave_type: form.leave_type, from_date: form.from_date, to_date: form.to_date, working_days: workingDays, reason: form.reason, document_status: form.document_status })
    await fetchLeaves()
    setForm({ leave_type: '', from_date: '', to_date: '', reason: '', document_status: 'pending' })
    setShowForm(false)
    setLoading(false)
  }

  const sickLeaveUsed = leaves.filter(l => l.leave_type === 'Sick Leave').reduce((acc, l) => acc + (l.working_days || 0), 0)
  const frlUsed = leaves.filter(l => l.leave_type === 'Family Responsibility Leave (FRL)').reduce((acc, l) => acc + (l.working_days || 0), 0)
  const annualLeaveUsed = leaves.filter(l => l.leave_type === 'Annual Leave').reduce((acc, l) => acc + (l.working_days || 0), 0)
  const unauthorizedUsed = leaves.filter(l => l.leave_type === 'Unauthorized / No Notice Absence').reduce((acc, l) => acc + (l.working_days || 0), 0)

  const annualLeaveLabel = !annualLeaveEligible ? 'İzin hakkı yok' : annualLeaveMethod === 'fixed' ? 'Sabit izin' : annualLeaveMethod === 'accrual' ? '17 iş günü = 1 gün' : 'Yöntem belirsiz'

  return (
    <div>
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-xs text-red-500 font-medium">Sick Leave</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{sickLeaveUsed}</p>
          <p className="text-xs text-red-400">/ 30 gün (36 ay)</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-xs text-orange-500 font-medium">FRL</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{frlUsed}</p>
          <p className="text-xs text-orange-400">/ 3 gün (yıllık)</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-blue-500 font-medium">Annual Leave</p>
          <p className="text-2xl font-bold text-blue-700 mt-1">{annualLeaveEligible ? annualLeaveUsed : '—'}</p>
          <p className="text-xs text-blue-400">{annualLeaveLabel}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500 font-medium">Unauthorized</p>
          <p className="text-2xl font-bold text-gray-700 mt-1">{unauthorizedUsed}</p>
          <p className="text-xs text-gray-400">gün</p>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">+ İzin Ekle</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
          <h4 className="font-medium text-gray-700">Yeni İzin Kaydı</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">İzin Türü *</label>
              <select value={form.leave_type} onChange={(e) => setForm({...form, leave_type: e.target.value})} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Seçin</option>
                {leaveTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Belge Durumu</label>
              <select value={form.document_status} onChange={(e) => setForm({...form, document_status: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="pending">Belge Bekleniyor</option>
                <option value="received">Belge Alındı</option>
                <option value="not_required">Belge Gerekmez</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi *</label>
              <input type="date" value={form.from_date} onChange={(e) => setForm({...form, from_date: e.target.value})} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi *</label>
              <input type="date" value={form.to_date} onChange={(e) => setForm({...form, to_date: e.target.value})} required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            {form.from_date && form.to_date && (
              <div className="col-span-2">
                <p className="text-sm text-blue-600 font-medium">İş günü: {calculateWorkingDays(form.from_date, form.to_date)} gün</p>
              </div>
            )}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Not</label>
              <input value={form.reason} onChange={(e) => setForm({...form, reason: e.target.value})} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition disabled:opacity-50">{loading ? 'Kaydediliyor...' : 'Kaydet'}</button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition">İptal</button>
          </div>
        </form>
      )}

      {leaves.length === 0 ? (
        <div className="text-center py-12"><p className="text-gray-400">Henüz izin kaydı yok.</p></div>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave) => (
            <div key={leave.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${leaveTypeColors[leave.leave_type] || 'bg-gray-100 text-gray-600'}`}>{leave.leave_type}</span>
                  <p className="text-sm text-gray-700 mt-2">{leave.from_date} → {leave.to_date}<span className="ml-2 text-gray-500">({leave.working_days} iş günü)</span></p>
                  {leave.reason && <p className="text-xs text-gray-400 mt-1">{leave.reason}</p>}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${leave.document_status === 'received' ? 'bg-green-100 text-green-700' : leave.document_status === 'not_required' ? 'bg-gray-100 text-gray-500' : 'bg-yellow-100 text-yellow-700'}`}>
                  {leave.document_status === 'received' ? 'Belge Alındı' : leave.document_status === 'not_required' ? 'Belge Gerekmez' : 'Belge Bekleniyor'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

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
              <Link href={`/dashboard/staff/${staff.id}/edit`} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">Düzenle</Link>
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
              <LeaveTab
                staffId={params.id as string}
                staffStartDate={staff.contract_start_date}
                supabase={supabase}
                annualLeaveEligible={staff.annual_leave_eligible}
                annualLeaveMethod={staff.annual_leave_method || ''}
              />
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