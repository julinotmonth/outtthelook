import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Image,
  Upload,
  X,
  Eye,
  Filter,
  Loader2,
} from 'lucide-react'
import { Card, CardContent } from '../../components/common/Card'
import Button from '../../components/common/Button'
import { Input } from '../../components/common/Input'
import { Modal, DialogFooter } from '../../components/common/Modal'
import { GALLERY_CATEGORIES } from '../../utils/constants'
import { cn } from '../../lib/utils'
import { useGalleryStore } from '../../store/useStore'

const ManageGallery = () => {
  const { 
    items: gallery, 
    loading,
    fetchGallery, 
    addItem, 
    updateItem, 
    deleteItem 
  } = useGalleryStore()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [previewItem, setPreviewItem] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    image: '',
  })

  // Fetch gallery on mount
  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  // Filter gallery
  const filteredGallery = gallery.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Open modal for add/edit
  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item)
      setFormData({
        title: item.title,
        category: item.category,
        image: item.image,
      })
    } else {
      setEditingItem(null)
      setFormData({
        title: '',
        category: '',
        image: '',
      })
    }
    setIsModalOpen(true)
  }

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false)
    setEditingItem(null)
    setFormData({ title: '', category: '', image: '' })
  }

  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.category) {
      toast.error('Mohon lengkapi semua field')
      return
    }

    setIsSubmitting(true)
    
    try {
      const data = {
        ...formData,
        image: formData.image || 'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=400&h=400&fit=crop',
      }

      let result
      if (editingItem) {
        result = await updateItem(editingItem.id, data)
        if (result.success) {
          toast.success('Gambar berhasil diupdate')
        } else {
          toast.error(result.message || 'Gagal mengupdate gambar')
        }
      } else {
        result = await addItem(data)
        if (result.success) {
          toast.success('Gambar berhasil ditambahkan')
        } else {
          toast.error(result.message || 'Gagal menambahkan gambar')
        }
      }
      
      if (result.success) {
        closeModal()
      }
    } catch (error) {
      toast.error('Terjadi kesalahan')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete item
  const handleDelete = async () => {
    if (!deleteConfirm) return
    
    const result = await deleteItem(deleteConfirm.id)
    if (result.success) {
      toast.success('Gambar berhasil dihapus')
    } else {
      toast.error(result.message || 'Gagal menghapus gambar')
    }
    setDeleteConfirm(null)
  }

  if (loading && gallery.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-cream">Kelola Galeri</h1>
          <p className="text-cream/60 text-sm sm:text-base">Kelola foto-foto galeri barbershop</p>
        </div>
        <Button onClick={() => openModal()} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Gambar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-cream/40" />
                <Input
                  type="text"
                  placeholder="Cari gambar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 sm:pl-10 text-sm"
                />
              </div>
              <Button
                variant="outline"
                className="sm:hidden"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-4 h-4" />
              </Button>
            </div>

            <div className={cn(
              'overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0',
              showFilters ? 'block' : 'hidden sm:block'
            )}>
              <div className="flex gap-2 pb-1 sm:pb-0 sm:flex-wrap">
                {GALLERY_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      'px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap flex-shrink-0',
                      selectedCategory === category.id
                        ? 'bg-gold text-charcoal-dark'
                        : 'bg-charcoal-dark border border-gold/30 text-cream/70 hover:border-gold'
                    )}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      {filteredGallery.length === 0 ? (
        <Card className="p-8 sm:p-12">
          <div className="text-center">
            <Image className="w-12 h-12 sm:w-16 sm:h-16 text-cream/20 mx-auto mb-4" />
            <h3 className="text-cream font-medium mb-1 text-sm sm:text-base">Tidak ada gambar</h3>
            <p className="text-cream/50 text-xs sm:text-sm">
              {searchQuery || selectedCategory !== 'all'
                ? 'Coba ubah filter pencarian'
                : 'Mulai tambahkan gambar ke galeri'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {filteredGallery.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden group">
                <div className="aspect-square relative">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-charcoal-dark/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    <button
                      onClick={() => setPreviewItem(item)}
                      className="p-2 bg-gold/20 hover:bg-gold/30 rounded-full text-gold transition-colors"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openModal(item)}
                        className="p-1.5 bg-charcoal/50 hover:bg-gold/20 rounded text-cream/70 hover:text-gold transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(item)}
                        className="p-1.5 bg-charcoal/50 hover:bg-red-500/20 rounded text-cream/70 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
                
                <CardContent className="p-2 sm:p-3">
                  <h3 className="text-cream font-medium text-xs sm:text-sm truncate">{item.title}</h3>
                  <p className="text-gold text-xs capitalize">{item.category?.replace('-', ' ')}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Edit Gambar' : 'Tambah Gambar'}
      >
        <form onSubmit={handleSubmit} className="py-4 space-y-4">
          <div className="aspect-[16/9] sm:aspect-video bg-charcoal-dark border-2 border-dashed border-gold/30 rounded-lg flex flex-col items-center justify-center max-h-[150px] sm:max-h-[200px] overflow-hidden">
            {formData.image ? (
              <img
                src={formData.image}
                alt=""
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <>
                <Upload className="w-6 h-6 sm:w-10 sm:h-10 text-cream/30 mb-2" />
                <p className="text-cream/50 text-xs sm:text-sm">Masukkan URL gambar di bawah</p>
              </>
            )}
          </div>

          <div>
            <label className="block text-cream text-sm font-medium mb-1.5">Judul</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Judul gambar"
              className="text-sm"
            />
          </div>

          <div>
            <label className="block text-cream text-sm font-medium mb-1.5">Kategori</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleFormChange}
              className="w-full px-3 py-2.5 bg-charcoal-dark border border-gold/30 rounded-lg text-cream text-sm focus:outline-none focus:border-gold transition-colors"
            >
              <option value="">Pilih kategori</option>
              {GALLERY_CATEGORIES.filter(c => c.id !== 'all').map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-cream text-sm font-medium mb-1.5">URL Gambar</label>
            <Input
              name="image"
              value={formData.image}
              onChange={handleFormChange}
              placeholder="https://..."
              className="text-sm"
            />
          </div>
        </form>
        
        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={closeModal}>
            Batal
          </Button>
          <Button size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
            {editingItem ? 'Simpan' : 'Tambah'}
          </Button>
        </DialogFooter>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Hapus Gambar"
      >
        <div className="py-4">
          <p className="text-cream/70 text-sm">
            Apakah Anda yakin ingin menghapus gambar ini?
          </p>
          {deleteConfirm && (
            <div className="mt-4 aspect-video max-w-[200px] mx-auto rounded-lg overflow-hidden">
              <img
                src={deleteConfirm.image}
                alt={deleteConfirm.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>
            Batal
          </Button>
          <Button
            size="sm"
            onClick={handleDelete}
            className="bg-red-500 hover:bg-red-600"
          >
            Hapus
          </Button>
        </DialogFooter>
      </Modal>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewItem(null)}
          >
            <div className="absolute inset-0 bg-charcoal-dark/95" />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-3xl max-h-[90vh] z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPreviewItem(null)}
                className="absolute -top-10 right-0 p-2 text-cream/50 hover:text-gold transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={previewItem.image}
                alt={previewItem.title}
                className="w-full h-auto rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-charcoal-dark to-transparent">
                <h3 className="text-cream font-medium">{previewItem.title}</h3>
                <p className="text-gold text-sm capitalize">{previewItem.category?.replace('-', ' ')}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ManageGallery
