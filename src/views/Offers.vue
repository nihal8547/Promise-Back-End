<template>
  <div class="offers">
    <div class="page-header">
      <div class="container">
        <h1>Gallery Management</h1>
        <p>Manage image gallery with titles and uploads</p>
      </div>
    </div>

    <div class="offers-section">
      <div class="container">
        <!-- Gallery List -->
        <div class="offers-list-section">
          <div class="section-header">
            <h2>Gallery List</h2>
            <div class="header-actions">
              <button class="btn btn-secondary" @click="debugCheckCollections">
                🔍 Check Collections
              </button>
              <button class="btn btn-primary" @click="showAddModal = true">
                ➕ Add Image
              </button>
              <div class="search-bar">
                <span class="search-icon">🔍</span>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search gallery items..." 
                  class="search-input"
                />
              </div>
            </div>
          </div>

          <div class="offers-table">
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading gallery items from Firebase...</p>
              <small>If this takes too long, check your internet connection and Firebase configuration.</small>
            </div>
            <div v-else-if="offers.length === 0" class="empty-state">
              <p>No gallery items found. Add your first image using the form above.</p>
            </div>
            <table v-else>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Image Title</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="offer in filteredOffers" :key="offer.id">
                  <td>
                    <img 
                      :src="offer.imageUrl || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=50&h=50&fit=crop'" 
                      :alt="offer.title" 
                      class="offer-thumbnail"
                    />
                  </td>
                  <td>
                    <div class="offer-info">
                      <div class="offer-name">{{ offer.title }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-sm btn-primary" @click="editOffer(offer)">
                        ✏️ Edit
                      </button>
                      <button class="btn btn-sm btn-danger" @click="deleteOffer(offer)">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Add Gallery Item Modal -->
        <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
          <div class="modal" @click.stop>
            <div class="modal-header">
              <h3>Add New Gallery Item</h3>
              <button class="close-btn" @click="closeAddModal">×</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="addOfferHandler">
                <div class="form-group">
                  <label>Image Title *</label>
                  <input type="text" v-model="newOffer.title" required placeholder="Enter image title" />
                </div>
                
                <div class="form-group">
                  <label>Select Image *</label>
                  <input type="file" @change="handleImageUpload" accept="image/*" required />
                  <small>Note: Maximum upload size is 2 MB.</small>
                </div>
                
                <div class="modal-actions">
                  <button type="button" class="btn btn-secondary" @click="closeAddModal">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                    {{ isSubmitting ? 'Adding...' : 'Add Gallery Item' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Edit Gallery Item Modal -->
        <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
          <div class="modal" @click.stop>
            <div class="modal-header">
              <h3>Edit Gallery Item</h3>
              <button class="close-btn" @click="closeEditModal">×</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="updateOfferHandler">
                <div class="form-group">
                  <label>Image Title *</label>
                  <input type="text" v-model="editingOffer.title" required placeholder="Enter image title" />
                </div>
                
                <div class="form-group">
                  <label>Update Image</label>
                  <input type="file" @change="handleEditImageUpload" accept="image/*" />
                  <small>Leave empty to keep current image. Note: Maximum upload size is 2 MB.</small>
                </div>
                
                <div class="modal-actions">
                  <button type="button" class="btn btn-secondary" @click="closeEditModal">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="isUpdating">
                    {{ isUpdating ? 'Updating...' : 'Update Gallery Item' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  addOffer, 
  getOffers, 
  updateOffer, 
  deleteOffer, 
  uploadOfferImage, 
  subscribeToOffers,
  checkExistingCollections
} from '../firebase/offersService.js'

export default {
  name: 'Offers',
  setup() {
    const offers = ref([])
    const searchQuery = ref('')
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const isSubmitting = ref(false)
    const isUpdating = ref(false)
    const isLoading = ref(true)
    const selectedImage = ref(null)
    const selectedEditImage = ref(null)

    const newOffer = reactive({
      title: '',
      imageUrl: ''
    })

    const editingOffer = reactive({
      id: '',
      title: '',
      imageUrl: ''
    })

    const filteredOffers = computed(() => {
      if (!searchQuery.value) return offers.value
      return offers.value.filter(offer => 
        offer.title.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    const handleImageUpload = (event) => {
      selectedImage.value = event.target.files[0]
    }

    const handleEditImageUpload = (event) => {
      selectedEditImage.value = event.target.files[0]
    }

    const addOfferHandler = async () => {
      if (!newOffer.title || !selectedImage.value) {
        alert('Please provide both image title and select an image.')
        return
      }

      isSubmitting.value = true

      try {
        let imageUrl = ''

        // Upload image if provided
        if (selectedImage.value) {
          imageUrl = await uploadOfferImage(selectedImage.value, 'temp')
        }

        // Prepare offer data
        const offerData = {
          title: newOffer.title,
          imageUrl: imageUrl
        }

        await addOffer(offerData)
        
        alert('Offer added successfully!')
        closeAddModal()
      } catch (error) {
        console.error('Error adding offer:', error)
        alert('Failed to add offer. Please try again.')
      } finally {
        isSubmitting.value = false
      }
    }

    const editOffer = (offer) => {
      editingOffer.id = offer.id
      editingOffer.title = offer.title
      editingOffer.imageUrl = offer.imageUrl || ''
      showEditModal.value = true
    }

    const updateOfferHandler = async () => {
      if (!editingOffer.title) {
        alert('Please provide image title.')
        return
      }

      isUpdating.value = true

      try {
        const updateData = {
          title: editingOffer.title
        }

        // Upload new image if provided
        if (selectedEditImage.value) {
          updateData.imageUrl = await uploadOfferImage(selectedEditImage.value, editingOffer.id)
        }

        await updateOffer(editingOffer.id, updateData)
        
        alert('Offer updated successfully!')
        closeEditModal()
      } catch (error) {
        console.error('Error updating offer:', error)
        alert('Failed to update offer. Please try again.')
      } finally {
        isUpdating.value = false
      }
    }

    const deleteOfferHandler = async (offer) => {
      if (confirm(`Are you sure you want to delete "${offer.title}"?`)) {
        try {
          await deleteOffer(offer.id)
          alert('Offer deleted successfully!')
        } catch (error) {
          console.error('Error deleting offer:', error)
          alert('Failed to delete offer. Please try again.')
        }
      }
    }

    const closeAddModal = () => {
      showAddModal.value = false
      Object.keys(newOffer).forEach(key => {
        newOffer[key] = ''
      })
      selectedImage.value = null
    }

    const closeEditModal = () => {
      showEditModal.value = false
      selectedEditImage.value = null
    }

    const debugCheckCollections = async () => {
      try {
        console.log('Manually checking all collections...')
        const allCollections = await checkExistingCollections()
        
        let message = 'Collection Check Results:\n\n'
        for (const [collectionName, docs] of Object.entries(allCollections)) {
          message += `${collectionName}: ${docs.length} documents\n`
          if (docs.length > 0) {
            message += `  Sample data: ${JSON.stringify(docs[0], null, 2)}\n`
          }
        }
        
        alert(message)
        console.log('All collections:', allCollections)
      } catch (error) {
        console.error('Error checking collections:', error)
        alert('Error checking collections. See console for details.')
      }
    }

    // Load offers on component mount
    onMounted(async () => {
      console.log('Component mounted, starting to load offers...')
      
      // Set a timeout to prevent infinite loading
      const loadingTimeout = setTimeout(() => {
        if (isLoading.value) {
          console.log('Loading timeout reached, setting loading to false')
          isLoading.value = false
        }
      }, 10000) // 10 second timeout
      
      try {
        console.log('Checking all possible collections for existing data...')
        const allCollections = await checkExistingCollections()
        
        // Find the collection with the most data or use 'offers' as default
        let bestCollection = 'offers'
        let maxDocs = 0
        
        for (const [collectionName, docs] of Object.entries(allCollections)) {
          console.log(`Collection '${collectionName}': ${docs.length} documents`)
          if (docs.length > maxDocs) {
            maxDocs = docs.length
            bestCollection = collectionName
          }
        }
        
        console.log(`Using collection '${bestCollection}' with ${maxDocs} documents`)
        
        // If we found data in a different collection, use that data
        if (maxDocs > 0) {
          offers.value = allCollections[bestCollection]
          isLoading.value = false
          clearTimeout(loadingTimeout)
          console.log('Successfully loaded existing offers from', bestCollection, ':', offers.value)
        } else {
          // No existing data found, try the default getOffers function
          console.log('No existing data found, trying default getOffers...')
          const existingOffers = await getOffers()
          offers.value = existingOffers
          isLoading.value = false
          clearTimeout(loadingTimeout)
          console.log('Successfully loaded existing offers:', existingOffers)
        }
      } catch (error) {
        console.error('Error loading existing offers:', error)
        isLoading.value = false
        clearTimeout(loadingTimeout)
      }
      
      // Then set up real-time listener
      try {
        console.log('Setting up real-time listener...')
        subscribeToOffers((offersList) => {
          offers.value = offersList
          isLoading.value = false
          clearTimeout(loadingTimeout)
          console.log('Real-time update received:', offersList)
        })
      } catch (error) {
        console.error('Error setting up real-time listener:', error)
        isLoading.value = false
        clearTimeout(loadingTimeout)
      }
    })

    return {
      offers,
      searchQuery,
      showAddModal,
      showEditModal,
      isSubmitting,
      isUpdating,
      isLoading,
      newOffer,
      editingOffer,
      filteredOffers,
      handleImageUpload,
      handleEditImageUpload,
      addOffer: addOfferHandler,
      editOffer,
      updateOffer: updateOfferHandler,
      deleteOffer: deleteOfferHandler,
      closeAddModal,
      closeEditModal,
      debugCheckCollections
    }
  }
}
</script>

<style scoped>
.offers {
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.page-header h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  font-weight: 300;
}

.page-header p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.container {
  width: 100%;
  padding: 0 2rem;
  max-width: none;
}

.offers-section {
  padding: 3rem 0;
}

.offers-list-section {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.section-header h2 {
  color: #2c3e50;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-bar {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 8px;
  padding: 0.5rem;
  max-width: 300px;
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  padding: 0.5rem;
  flex: 1;
}

.offers-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
}

.offer-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 8px;
}

.offer-info {
  display: flex;
  flex-direction: column;
}

.offer-name {
  font-weight: 600;
  color: #2c3e50;
}

.price-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.current-price {
  font-weight: 600;
  color: #667eea;
  font-size: 1.1rem;
}

.original-price {
  font-size: 0.9rem;
  color: #999;
  text-decoration: line-through;
}

.description-preview {
  max-width: 300px;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.featured-badge {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.not-featured {
  color: #999;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
}

.btn-secondary {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-secondary:hover {
  background: #667eea;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.checkbox-label {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0 !important;
}

.checkbox-label input[type="checkbox"] {
  margin: 0;
}

input, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus, textarea:focus {
  outline: none;
  border-color: #667eea;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

@media (max-width: 768px) {
  .page-header h1 {
    font-size: 2rem;
  }
  
  .section-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  th, td {
    padding: 0.5rem;
  }
}
</style>