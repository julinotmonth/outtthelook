import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { Plus, Search, Edit, Trash2, Clock, ToggleLeft, ToggleRight, Filter, Scissors, Loader2 } from 'lucide-react'
import { Card, CardContent } from '../../components/common/Card'
import Button from '../../components/common/Button'
import { Input, Textarea, FormField } from '../../components/common/Input'
import { Modal, DialogFooter } from '../../components/common/Modal'
import { Badge } from '../../components/common/Badge'
import { serviceSchema } from '../../utils/validators'
import { formatCurrency, formatDuration } from '../../utils/formatters'
import { SERVICE_CATEGORIES } from '../../utils/constants'
import { useServicesStore } from '../../store/useStore'
import { cn } from '../../lib/utils'

const ManageServices = () => {
  const { services, loading, fetchServices, addService, updateService, deleteService } = useServicesStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [isActive, setIsActive] = useState(true)

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: zodResolver(serviceSchema) })

  useEffect(() => { fetchServices() }, [fetchServices])

  const filtered = services.filter((s) => {
    const matchSearch = s.name?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchCat = selectedCategory === 'all' || s.category === selectedCategory
    return matchSearch && matchCat
  })

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service)
      setImageUrl(service.image || '')
      setIsActive(service.is_active ?? true)
      reset({ name: service.name, description: service.description, price: service.price, duration: service.duration, category: service.category })
    } else {
      setEditingService(null)
      setImageUrl('')
      setIsActive(true)
      reset({ name: '', description: '', price: '', duration: '', category: '' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => { setIsModalOpen(false); setEditingService(null); setImageUrl(''); reset() }

  const onSubmit = async (data) => {
    setIsSubmitting(true)
    try {
      const serviceData = {
        name: data.name, description: data.description, price: parseInt(data.price), duration: parseInt(data.duration),
        category: data.category, image: imageUrl || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400', is_active: isActive,
      }
      const result = editingService ? await updateService(editingService.id, serviceData) : await addService(serviceData)
      if (result.success) { toast.success(editingService ? 'Layanan diupdate' : 'Layanan ditambahkan'); closeModal() }
      else toast.error(result.message || 'Gagal')
    } catch { toast.error('Terjadi kesalahan') }
    finally { setIsSubmitting(false) }
  }

  const toggleActive = async (s) => {
    const r = await updateService(s.id, { is_active: !s.is_active })
    if (r.success) toast.success('Status diubah')
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    const r = await deleteService(deleteConfirm.id)
    if (r.success) toast.success('Layanan dihapus')
    setDeleteConfirm(null)
  }

  if (loading && services.length === 0) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-gold" /></div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-heading text-2xl font-bold text-cream">Kelola Layanan</h1><p className="text-cream/60 text-sm">Kelola layanan barbershop</p></div>
        <Button onClick={() => openModal()}><Plus className="w-4 h-4 mr-2" />Tambah Layanan</Button>
      </div>

      <Card><CardContent className="p-4 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cream/40" /><Input placeholder="Cari layanan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" /></div>
          <Button variant="outline" className="sm:hidden" onClick={() => setShowFilters(!showFilters)}><Filter className="w-4 h-4" /></Button>
        </div>
        <div className={cn('flex gap-2 flex-wrap', showFilters ? 'block' : 'hidden sm:flex')}>
          {SERVICE_CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setSelectedCategory(c.id)} className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-all', selectedCategory === c.id ? 'bg-gold text-charcoal-dark' : 'bg-charcoal-dark border border-gold/30 text-cream/70 hover:border-gold')}>{c.label}</button>
          ))}
        </div>
      </CardContent></Card>

      {filtered.length === 0 ? (
        <Card className="p-12"><div className="text-center"><Scissors className="w-16 h-16 text-cream/20 mx-auto mb-4" /><h3 className="text-cream">Tidak ada layanan</h3></div></Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((service, i) => (
            <motion.div key={service.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className={cn('overflow-hidden', !service.is_active && 'opacity-60')}>
                <div className="aspect-video relative">
                  <img src={service.image || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400'} alt={service.name} className="w-full h-full object-cover" />
                  <button onClick={() => toggleActive(service)} className="absolute top-2 right-2">
                    {service.is_active ? <ToggleRight className="w-6 h-6 text-green-500" /> : <ToggleLeft className="w-6 h-6 text-cream/50" />}
                  </button>
                  <Badge className="absolute top-2 left-2 capitalize">{service.category}</Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="text-cream font-semibold mb-1">{service.name}</h3>
                  <p className="text-cream/60 text-sm line-clamp-2 mb-3">{service.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gold font-semibold">{formatCurrency(service.price)}</span>
                    <span className="text-cream/60 flex items-center gap-1"><Clock className="w-4 h-4" />{formatDuration(service.duration)}</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1" onClick={() => openModal(service)}><Edit className="w-3 h-3 mr-1" />Edit</Button>
                    <Button variant="ghost" size="sm" className="text-red-400 hover:bg-red-500/10" onClick={() => setDeleteConfirm(service)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingService ? 'Edit Layanan' : 'Tambah Layanan'}>
        <form onSubmit={handleSubmit(onSubmit)} className="py-4 space-y-4">
          <div className="aspect-video bg-charcoal-dark border border-dashed border-gold/30 rounded-lg overflow-hidden">
            {imageUrl ? <img src={imageUrl} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-cream/30">Preview Gambar</div>}
          </div>
          <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="URL Gambar" />
          <FormField label="Nama Layanan" error={errors.name?.message}><Input {...register('name')} /></FormField>
          <FormField label="Deskripsi" error={errors.description?.message}><Textarea {...register('description')} rows={2} /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Harga (Rp)" error={errors.price?.message}><Input {...register('price')} type="number" /></FormField>
            <FormField label="Durasi (menit)" error={errors.duration?.message}><Input {...register('duration')} type="number" /></FormField>
          </div>
          <div><label className="text-cream text-sm mb-1 block">Kategori</label>
            <select {...register('category')} className="w-full px-3 py-2 bg-charcoal-dark border border-gold/30 rounded-lg text-cream">
              <option value="">Pilih kategori</option>
              {SERVICE_CATEGORIES.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <div className="flex items-center justify-between"><span className="text-cream text-sm">Status Aktif</span>
            <button type="button" onClick={() => setIsActive(!isActive)}>{isActive ? <ToggleRight className="w-8 h-8 text-green-500" /> : <ToggleLeft className="w-8 h-8 text-cream/50" />}</button>
          </div>
        </form>
        <DialogFooter><Button variant="ghost" onClick={closeModal}>Batal</Button><Button onClick={handleSubmit(onSubmit)} isLoading={isSubmitting}>{editingService ? 'Simpan' : 'Tambah'}</Button></DialogFooter>
      </Modal>

      <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Hapus Layanan">
        <div className="py-4"><p className="text-cream/70">Hapus layanan <strong>{deleteConfirm?.name}</strong>?</p></div>
        <DialogFooter><Button variant="ghost" onClick={() => setDeleteConfirm(null)}>Batal</Button><Button onClick={handleDelete} className="bg-red-500 hover:bg-red-600">Hapus</Button></DialogFooter>
      </Modal>
    </div>
  )
}

export default ManageServices
