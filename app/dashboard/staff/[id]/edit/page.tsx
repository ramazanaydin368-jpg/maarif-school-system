'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

const nationalities = [
  'South African', 'Turkish', 'Afghan', 'Albanian', 'Algerian', 'American',
  'Angolan', 'Argentine', 'Australian', 'Austrian', 'Azerbaijani', 'Bangladeshi',
  'Belgian', 'Bolivian', 'Bosnian', 'Brazilian', 'British', 'Bulgarian',
  'Cameroonian', 'Canadian', 'Chilean', 'Chinese', 'Colombian', 'Congolese',
  'Croatian', 'Cuban', 'Czech', 'Danish', 'Dutch', 'Egyptian', 'Ethiopian',
  'Finnish', 'French', 'Gambian', 'Georgian', 'German', 'Ghanaian', 'Greek',
  'Guinean', 'Hungarian', 'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish',
  'Israeli', 'Italian', 'Ivorian', 'Japanese', 'Jordanian', 'Kazakh', 'Kenyan',
  'Kyrgyz', 'Lebanese', 'Libyan', 'Malawian', 'Malaysian', 'Malian', 'Mexican',
  'Moroccan', 'Mozambican', 'Namibian', 'Nigerian', 'Norwegian', 'Pakistani',
  'Palestinian', 'Peruvian', 'Philippine', 'Polish', 'Portuguese', 'Romanian',
  'Russian', 'Rwandan', 'Saudi', 'Senegalese', 'Serbian', 'Sierra Leonean',
  'Singaporean', 'Somali', 'Spanish', 'Sudanese', 'Swedish', 'Swiss', 'Syrian',
  'Tajik', 'Tanzanian', 'Thai', 'Togolese', 'Tunisian', 'Turkmen', 'Ugandan',
  'Ukrainian', 'Uzbek', 'Venezuelan', 'Vietnamese', 'Yemeni', 'Zambian',
  'Zimbabwean', 'Other'
]

export default function EditStaffPage() {
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    first_name: '', surname: '', gender: '', date_of_birth: '',
    id_passport_number: '', nationality: '', marital_status: '',
    mobile: '', secondary_phone: '', email: '', address: '',
    emergency_contact_name: '', emergency_contact_relationship: '',
    emergency_contact_number: '', bank_name: '', account_holder: '',
    account_number: '', branch_code: '', position: '', position_custom: '',
    employment_type: '', contract_start_date: '', contract_end_date: '',
    probation_months: '3', annual_leave_eligible: 'false',
    annual_leave_method: '', annual_leave_fixed_days: '',
    employment_status: 'pending',
  })

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('staff')
        .select('*')
        .eq('id', params.id)
        .single()

      if (data) {
        setForm({
          first_name: data.first_name || '',
          surname: data.surname || '',
          gender: data.gender || '',
          date_of_birth: data.date_of_birth || '',
          id_passport_number: data.id_passport_number || '',
          nationality: data.nationality || '',
          marital_status: data.marital_status || '',
          mobile: data.mobile || '',
          secondary_phone: data.secondary_phone || '',
          email: data.email || '',
          address: data.address || '',
          emergency_contact_name: data.emergency_contact_name || '',
          emergency_contact_relationship: data.emergency_contact_relationship || '',
          emergency_contact_number: data.emergency_contact_number || '',
          bank_name: data.bank_name || '',
          account_holder: data.account_holder || '',
          account_number: data.account_number || '',
          branch_code: data.branch_code || '',
          position: data.position || '',
          position_custom: data.position_custom || '',
          employment_type: data.employment_type || '',
          contract_start_date: data.contract_start_date || '',
          contract_end_date: data.contract_end_date || '',
          probation_months: data.probation_months?.toString() || '3',
          annual_leave_eligible: data.annual_leave_eligible ? 'true' : 'false',
          annual_leave_method: data.annual_leave_method || '',
          annual_leave_fixed_days: data.annual_leave_fixed_days?.toString() || '',
          employment_status: data.employment_status || 'pending',
        })
      }
      setFetching(false)
    }
    getData()
  }, [params.id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.from('staff').update({
      ...form,
      probation_months: parseInt(form.probation_months) || 3,
      annual_leave_eligible: form.annual_leave_eligible === 'true',
      annual_leave_fixed_days: form.annual_leave_fixed_days ? parseInt(form.annual_leave_fixed_days) : null,
      contract_end_date: form.contract_end_date || null,
      updated_at: new Date().toISOString(),
    }).eq('id', params.id)

    if (error) { setError('Hata: ' + error.message); setLoading(false) }
    else router.push(`/dashboard/staff/${params.id}`)
  }

  const inputClass = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
  const labelClass = "block text-sm font-medium text-gray-700 mb-1"

  if (fetching) return <div className="min-h-screen flex items-center justify-center"><p className="text-gray-500">Yükleniyor...</p></div>

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-white shadow-sm min-h-screen flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-lg font-bold text-gray-800">Maarif School</h1>
          <p className="text-xs text-gray-500 mt-1">System</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {[
              { label: 'Dashboard', href: '/dashboard', icon: '🏠' },
              { label: 'Personel', href: '/dashboard/staff', icon: '👥' },
              { label: 'Öğrenciler', href: '/dashboard/students', icon: '🎓' },
              { label: 'Aileler', href: '/dashboard/families', icon: '👨‍👩‍👧' },
              { label: 'Finans', href: '/dashboard/finance', icon: '💰' },
              { label: 'Yönetim', href: '/dashboard/admin', icon: '⚙️' },
            ].map((item) => (
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
          <Link href={`/dashboard/staff/${params.id}`} className="text-gray-500 hover:text-gray-700 text-sm">← Geri</Link>
          <h2 className="text-2xl font-semibold text-gray-700">Personel Düzenle</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Kişisel Bilgiler */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Kişisel Bilgiler</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Ad *</label>
                <input name="first_name" value={form.first_name} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Soyad *</label>
                <input name="surname" value={form.surname} onChange={handleChange} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Cinsiyet</label>
                <select name="gender" value={form.gender} onChange={handleChange} className={inputClass}>
                  <option value="">Seçin</option>
                  <option value="male">Erkek</option>
                  <option value="female">Kadın</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Doğum Tarihi</label>
                <input type="date" name="date_of_birth" value={form.date_of_birth} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>TC / Pasaport No</label>
                <input name="id_passport_number" value={form.id_passport_number} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Uyruk</label>
                <select name="nationality" value={form.nationality} onChange={handleChange} className={inputClass}>
                  <option value="">Seçin</option>
                  {nationalities.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Medeni Durum</label>
                <select name="marital_status" value={form.marital_status} onChange={handleChange} className={inputClass}>
                  <option value="">Seçin</option>
                  <option value="single">Bekar</option>
                  <option value="married">Evli</option>
                  <option value="divorced">Boşanmış</option>
                  <option value="widowed">Dul</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Cep Telefonu</label>
                <input name="mobile" value={form.mobile} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>İkinci Telefon</label>
                <input name="secondary_phone" value={form.secondary_phone} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>E-posta</label>
                <input type="email" name="email" value={form.email} onChange={handleChange} className={inputClass} />
              </div>
              <div className="col-span-2">
                <label className={labelClass}>Adres</label>
                <textarea name="address" value={form.address} onChange={handleChange} rows={2} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Acil İletişim */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Acil İletişim</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Ad Soyad</label>
                <input name="emergency_contact_name" value={form.emergency_contact_name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Yakınlık</label>
                <input name="emergency_contact_relationship" value={form.emergency_contact_relationship} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Telefon</label>
                <input name="emergency_contact_number" value={form.emergency_contact_number} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Banka Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Banka Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Banka Adı</label>
                <input name="bank_name" value={form.bank_name} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hesap Sahibi</label>
                <input name="account_holder" value={form.account_holder} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Hesap No</label>
                <input name="account_number" value={form.account_number} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Branch Code</label>
                <input name="branch_code" value={form.branch_code} onChange={handleChange} className={inputClass} />
              </div>
            </div>
          </div>

          {/* İstihdam Bilgileri */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-700 mb-4">İstihdam Bilgileri</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Durum</label>
                <select name="employment_status" value={form.employment_status} onChange={handleChange} className={inputClass}>
                  <option value="pending">Onay Bekliyor</option>
                  <option value="active">Aktif</option>
                  <option value="suspended">Askıya Alındı</option>
                  <option value="resigned">İstifa Etti</option>
                  <option value="terminated">İşten Çıkarıldı</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Pozisyon</label>
                <select name="position" value={form.position} onChange={handleChange} className={inputClass}>
                  <option value="">Seçin</option>
                  <option value="Principal">Müdür</option>
                  <option value="Teacher">Öğretmen</option>
                  <option value="Admin Staff">İdari Personel</option>
                  <option value="Finance Staff">Finans Personeli</option>
                  <option value="Finance Manager">Finans Müdürü</option>
                  <option value="Marketing Officer">Pazarlama</option>
                  <option value="Counsellor">Danışman</option>
                  <option value="Support Staff">Destek Personeli</option>
                  <option value="Cleaner">Temizlik</option>
                  <option value="Driver">Şoför</option>
                  <option value="Other">Diğer</option>
                </select>
              </div>
              {form.position === 'Other' && (
                <div>
                  <label className={labelClass}>Pozisyon (Diğer)</label>
                  <input name="position_custom" value={form.position_custom} onChange={handleChange} className={inputClass} />
                </div>
              )}
              <div>
                <label className={labelClass}>İstihdam Türü</label>
                <select name="employment_type" value={form.employment_type} onChange={handleChange} className={inputClass}>
                  <option value="">Seçin</option>
                  <option value="Permanent">Daimi / Belirsiz Süreli</option>
                  <option value="Fixed-Term">Belirli Süreli Tam Zamanlı</option>
                  <option value="Part-Time">Yarı Zamanlı</option>
                  <option value="Hourly">Saatlik</option>
                  <option value="Daily">Günlük / Geçici</option>
                  <option value="Other">Diğer</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>İşe Başlama Tarihi *</label>
                <input type="date" name="contract_start_date" value={form.contract_start_date} onChange={handleChange} required className={inputClass} />
              </div>
              {form.employment_type !== 'Permanent' && form.employment_type !== '' && (
                <div>
                  <label className={labelClass}>Sözleşme Bitiş Tarihi</label>
                  <input type="date" name="contract_end_date" value={form.contract_end_date} onChange={handleChange} className={inputClass} />
                </div>
              )}
              <div>
                <label className={labelClass}>Deneme Süresi (Ay)</label>
                <input type="number" name="probation_months" value={form.probation_months} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Yıllık İzin Hakkı</label>
                <select name="annual_leave_eligible" value={form.annual_leave_eligible} onChange={handleChange} className={inputClass}>
                  <option value="false">Hayır</option>
                  <option value="true">Evet</option>
                </select>
              </div>
              {form.annual_leave_eligible === 'true' && (
                <>
                  <div>
                    <label className={labelClass}>İzin Hesaplama Yöntemi</label>
                    <select name="annual_leave_method" value={form.annual_leave_method} onChange={handleChange} className={inputClass}>
                      <option value="">Seçin</option>
                      <option value="fixed">Sabit (Yıllık Gün)</option>
                      <option value="accrual">Tahakkuk (17 iş günü = 1 gün)</option>
                    </select>
                  </div>
                  {form.annual_leave_method === 'fixed' && (
                    <div>
                      <label className={labelClass}>Yıllık İzin Günü</label>
                      <input type="number" name="annual_leave_fixed_days" value={form.annual_leave_fixed_days} onChange={handleChange} className={inputClass} />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex gap-4 pb-8">
            <button type="submit" disabled={loading} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50">
              {loading ? 'Kaydediliyor...' : 'Güncelle'}
            </button>
            <Link href={`/dashboard/staff/${params.id}`} className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-300 transition">
              İptal
            </Link>
          </div>
        </form>
      </main>
    </div>
  )
}