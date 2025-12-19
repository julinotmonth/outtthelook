import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import {
  Plus, Search, Edit, Trash2, Star, ToggleLeft, ToggleRight, Upload, Users, Clock, Loader2,
} from 'lucide-react'
import { Card, CardContent } from '../../components/common/Card'
import Button from '../../components/common/Button'
import { Input, Textarea, FormField } from '../../components/common/Input'
import { Modal, DialogFooter } from '../../components/common/Modal'
import { barberSchema } from '../../utils/validators'
import { useTeamStore } from '../../store/useStore'
import { TIME_SLOTS } from '../../utils/constants'
import { cn } from '../../lib/utils'

const ROLE_OPTIONS = [
  { value: 'Master Barber', label: 'Master Barber' },
  { value: 'Senior Barber', label: 'Senior Barber' },
  { value: 'Barber', label: 'Barber' },
]

const SPECS = ['Fade', 'Pompadour', 'Classic Cut', 'Beard Styling', 'Skin Fade', 'Hair Design', 'Modern Styles', 'Kids Haircut']

const ManageTeam = () => {
  const { barbers, loading, fetchBarbers, addBarber, updateBarber, deleteBarber } = useTeamStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBarber, setEditingBarber] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [specs, setSpecs] = useState([])
  const [imageUrl, setImageUrl] = useState('')
  const [schedule, setSchedule] = useState({ start: '09:00', end: '20:00' })
  const [available, setAvailable] = useState(true)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(barberSchema) })

  useEffect(() => { fetchBarbers() }, [fetchBarbers])

  const filtered = barbers.filter((b) => b.name?.toLowerCase().includes(searchQuery.toLowerCase()))

  const openModal = (barber = null) => {
    if (barber) {
      setEditingBarber(barber)
      setSpecs(barber.specialties ? (typeof barber.specialties === 'string' ? barber.specialties.split(',').map(s => s.trim()) : barber.specialties) : [])
      setImageUrl(barber.image || '')
      setSchedule({ start: barber.work_start_time || '09:00', end: barber.work_end_time || '20:00' })
      setAvailable(barber.is_available ?? true)
      reset({ name: barber.name, role: barber.role, phone: barber.phone || '', experience: barber.experience, bio: barber.bio || '' })
    } else {
      setEditingBarber(null)
      setSpecs([])
      setImageUrl('')
      setSchedule({ start: '09:00', end: '20:00' })
      setAvailable(true)
      reset({ name: '', role: '', phone: '', experience: '', bio: '' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingBarber(null); setSpecs([]); setImageUrl(''); reset() }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const barberData = {
        name: data.name, role: data.role, phone: data.phone || '', experience: parseInt(data.experience) || 0,
        bio: data.bio || '', specialties: specs.join(', '),
        image: imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
        is_available: available, work_start_time: schedule.start, work_end_time: schedule.end,
      }
      const result = editingBarber ? await updateBarber(editingBarber.id, barberData) : await addBarber(barberData)
      if (result.success) { toast.success(editingBarber ? 'Barber diupdate' : 'Barber ditambahkan'); closeModal() }
      else toast.error(result.message || 'Gagal')
    } catch { toast.error('Terjadi kesalahan') }
    finally { setIsSubmitting(false) }
  }

  const toggleAvail = async (b) => {
    const r = await updateBarber(b.id, { is_available: !b.is_available })
    if (r.success) toast.success('Status diubah')
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    const r = await deleteBarber(deleteConfirm.id)
    if (r.success) toast.success('Barber dihapus')
    setDeleteConfirm(null)
  }

  if (loading && barbers.length === 0) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-heading text-2xl font-bold text-cream">Kelola Tim</h1><p className="text-cream/60 text-sm">Kelola data barber</p></div>
        <Button onClick={() => openModal()}><Plus className="w-4 h-4 mr-2" />Tambah Barber</Button>
      </div>

      <Card><CardContent className="p-4">
        <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" />
        <Input placeholder="Cari barber..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
      </CardContent></Card>

      {filtered.length === 0 ? (
        <Card className="p-12"><div className="text-center"><Users className="w-16 h-16 text-cream/20 mx-auto mb-4" /><h3 className="text-cream">Tidak ada barber</h3></div></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((barber, i) => (
            <motion.div key={barber.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={cn(!barber.is_available && 'opacity-60')}>
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <img src={barber.image || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'} alt={barber.name} className="w-16 h-16 rounded-full object-cover border-2 border-gold/30" />
                      <button onClick={() => toggleAvail(barber)} className="absolute -bottom-1 -right-1 bg-charcoal rounded-full p-0.5">
                        {barber.is_available ? <ToggleRight className="w-5 h-5 text-green-500" /> : <ToggleLeft className="w-5 h-5 text-cream/50" />}
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-cream font-semibold truncate">{barber.name}</h3>
                      <p className="text-gold text-sm">{barber.role}</p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-cream/60">
                        <Star className="w-3 h-3 text-gold fill-gold" /><span>{barber.rating || 0}</span><span>•</span><span>{barber.experience || 0} thn</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-cream/50"><Clock className="w-3 h-3" /><span>{barber.work_start_time || '09:00'} - {barber.work_end_time || '20:00'}</span></div>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openModal(barber)}><Edit className="w-3 h-3 mr-1" />Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10" onClick={() => setDeleteConfirm(barber)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingBarber ? 'Edit Barber' : 'Tambah Barber'}>
        <form onSubmit={handleSubmit(onSubmit)} className="py-4 space-y-4">
          <div className="flex justify-center"><img src={imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200'} alt="" className="w-20 h-20 rounded-full object-cover border-2 border-gold/30" /></div>
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL Foto" />
          <FormField label="Nama" error={errors.name?.message}><Input {...register('name')} placeholder="Nama barber" /></FormField>
          <div><label className="block text-cream text-sm mb-1">Role</label>
            <select {...register('role')} className="w-full px-3 py-2 bg-charcoal-dark border border-gold/30 rounded-lg text-cream"><option value="">Pilih role</option>{ROLE_OPTIONS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}</select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Pengalaman (thn)"><Input {...register('experience')} type="number" /></FormField>
            <FormField label="Telepon"><Input {...register('phone')} /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-cream text-sm">Mulai</label><select value={schedule.start} onChange={(e) => setSchedule(p => ({...p, start: e.target.value}))} className="w-full px-3 py-2 bg-charcoal-dark border border-gold/30 rounded-lg text-cream">{TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="text-cream text-sm">Selesai</label><select value={schedule.end} onChange={(e) => setSchedule(p => ({...p, end: e.target.value}))} className="w-full px-3 py-2 bg-charcoal-dark border border-gold/30 rounded-lg text-cream">{TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
          </div>
          <div className="flex items-center justify-between"><span className="text-cream text-sm">Tersedia</span><button type="button" onClick={() => setAvailable(!available)}>{available ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-cream/50" />}</button></div>
          <div><label className="text-cream text-sm mb-2 block">Spesialisasi</label><div className="flex flex-wrap gap-2">{SPECS.map(s => <button key={s} type="button" onClick={() => setSpecs(p => p.includes(s) ? p.filter(x => x !== s) : [...p, s])} className={cn('px-2 py-1 rounded text-xs', specs.includes(s) ? 'bg-gold text-charcoal-dark' : 'bg-charcoal-dark border border-gold/30 text-cream/70')}>{s}</button>)}</div></div>
          <FormField label="Bio"><Textarea {...register('bio')} rows={2} /></FormField>
        </form>
        <DialogFooter><Button variant="ghost" onClick={closeModal}>Batal</Button><Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>{editingBarber ? 'Simpan' : 'Tambah'}</Button></DialogFooter>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Hapus Barber">
        <div className="py-4"><p className="text-cream/70">Hapus barber <strong>{deleteConfirm?.name}</strong>?</p></div>
        <DialogFooter><Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Batal</Button><Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Hapus</Button></DialogFooter>
      </Modal>
    </div>
  )
}

export default ManageTeam