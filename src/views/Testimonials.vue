<template>
  <div class="testimonials">
    <div class="page-header">
      <div class="container">
        <h1>Testimonials Management</h1>
        <p>Manage patient reviews and testimonials</p>
      </div>
    </div>

    <div class="testimonials-section">
      <div class="container">
        <!-- Testimonials List -->
        <div class="testimonials-list-section">
          <div class="section-header">
            <h2>Testimonials List</h2>
            <div class="header-actions">
              <button class="btn btn-secondary" @click="debugCheckCollections">
                🔍 Check Collections
              </button>
              <button class="btn btn-primary" @click="showAddModal = true">
                ➕ Add Testimonial
              </button>
              <div class="search-bar">
                <span class="search-icon">🔍</span>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search testimonials..." 
                  class="search-input"
                />
              </div>
            </div>
          </div>

          <div class="testimonials-table">
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading testimonials from Firebase...</p>
              <small>If this takes too long, check your internet connection and Firebase configuration.</small>
            </div>
            <div v-else-if="testimonials.length === 0" class="empty-state">
              <p>No testimonials found. Add your first testimonial using the form above.</p>
            </div>
            <table v-else>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="testimonial in filteredTestimonials" :key="testimonial.id">
                  <td>
                    <img 
                      :src="testimonial.imageUrl || 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=50&h=50&fit=crop&crop=face'" 
                      :alt="testimonial.name" 
                      class="testimonial-thumbnail"
                    />
                  </td>
                  <td>
                    <div class="testimonial-info">
                      <div class="testimonial-name">{{ testimonial.name }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="rating-display">
                      <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= testimonial.rating }">
                        ★
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="review-preview">
                      {{ testimonial.review ? testimonial.review.substring(0, 100) + (testimonial.review.length > 100 ? '...' : '') : 'No review' }}
                    </div>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-sm btn-primary" @click="editTestimonial(testimonial)">
                        ✏️ Edit
                      </button>
                      <button class="btn btn-sm btn-danger" @click="deleteTestimonial(testimonial)">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Add Testimonial Modal -->
        <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
          <div class="modal" @click.stop>
            <div class="modal-header">
              <h3>Add New Testimonial</h3>
              <button class="close-btn" @click="closeAddModal">×</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="addTestimonialHandler">
                <div class="form-row">
                  <div class="form-group">
                    <label>Name *</label>
                    <input type="text" v-model="newTestimonial.name" required placeholder="Enter reviewer name" />
                  </div>
                  <div class="form-group">
                    <label>Rating *</label>
                    <select v-model="newTestimonial.rating" required>
                      <option value="">Select Rating</option>
                      <option value="1">1 Star</option>
                      <option value="2">2 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Review *</label>
                  <textarea v-model="newTestimonial.review" rows="4" required placeholder="Enter testimonial review..."></textarea>
                </div>
                
                <div class="form-group">
                  <label>Profile Image</label>
                  <input type="file" @change="handleImageUpload" accept="image/*" />
                  <small>Note: Maximum upload size is 2 MB.</small>
                </div>
                
                <div class="modal-actions">
                  <button type="button" class="btn btn-secondary" @click="closeAddModal">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                    {{ isSubmitting ? 'Adding...' : 'Add Testimonial' }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Edit Testimonial Modal -->
        <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
          <div class="modal" @click.stop>
            <div class="modal-header">
              <h3>Edit Testimonial</h3>
              <button class="close-btn" @click="closeEditModal">×</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="updateTestimonialHandler">
                <div class="form-row">
                  <div class="form-group">
                    <label>Name *</label>
                    <input type="text" v-model="editingTestimonial.name" required />
                  </div>
                  <div class="form-group">
                    <label>Rating *</label>
                    <select v-model="editingTestimonial.rating" required>
                      <option value="1">1 Star</option>
                      <option value="2">2 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="5">5 Stars</option>
                    </select>
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Review *</label>
                  <textarea v-model="editingTestimonial.review" rows="4" required></textarea>
                </div>
                
                <div class="form-group">
                  <label>Update Profile Image</label>
                  <input type="file" @change="handleEditImageUpload" accept="image/*" />
                  <small>Leave empty to keep current image. Note: Maximum upload size is 2 MB.</small>
                </div>
                
                <div class="modal-actions">
                  <button type="button" class="btn btn-secondary" @click="closeEditModal">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="isUpdating">
                    {{ isUpdating ? 'Updating...' : 'Update Testimonial' }}
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
  addTestimonial, 
  getTestimonials, 
  updateTestimonial, 
  deleteTestimonial, 
  uploadTestimonialImage, 
  subscribeToTestimonials,
  checkExistingCollections
} from '../firebase/testimonialsService.js'

export default {
  name: 'Testimonials',
  setup() {
    const testimonials = ref([])
    const searchQuery = ref('')
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const isSubmitting = ref(false)
    const isUpdating = ref(false)
    const isLoading = ref(true)
    const selectedImage = ref(null)
    const selectedEditImage = ref(null)

    const newTestimonial = reactive({
      name: '',
      rating: '',
      review: '',
      imageUrl: ''
    })

    const editingTestimonial = reactive({
      id: '',
      name: '',
      rating: '',
      review: '',
      imageUrl: ''
    })

    const filteredTestimonials = computed(() => {
      if (!searchQuery.value) return testimonials.value
      return testimonials.value.filter(testimonial => 
        testimonial.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (testimonial.review && testimonial.review.toLowerCase().includes(searchQuery.value.toLowerCase()))
      )
    })

    const handleImageUpload = (event) => {
      selectedImage.value = event.target.files[0]
    }

    const handleEditImageUpload = (event) => {
      selectedEditImage.value = event.target.files[0]
    }

    const addTestimonialHandler = async () => {
      if (!newTestimonial.name || !newTestimonial.rating || !newTestimonial.review) {
        alert('Please fill out all required fields.')
        return
      }

      isSubmitting.value = true

      try {
        let imageUrl = ''

        // Upload image if provided
        if (selectedImage.value) {
          imageUrl = await uploadTestimonialImage(selectedImage.value, 'temp')
        }

        // Prepare testimonial data
        const testimonialData = {
          name: newTestimonial.name,
          rating: parseInt(newTestimonial.rating),
          review: newTestimonial.review,
          imageUrl: imageUrl
        }

        await addTestimonial(testimonialData)
        
        alert('Testimonial added successfully!')
        closeAddModal()
      } catch (error) {
        console.error('Error adding testimonial:', error)
        alert('Failed to add testimonial. Please try again.')
      } finally {
        isSubmitting.value = false
      }
    }

    const editTestimonial = (testimonial) => {
      editingTestimonial.id = testimonial.id
      editingTestimonial.name = testimonial.name
      editingTestimonial.rating = testimonial.rating
      editingTestimonial.review = testimonial.review
      editingTestimonial.imageUrl = testimonial.imageUrl || ''
      showEditModal.value = true
    }

    const updateTestimonialHandler = async () => {
      if (!editingTestimonial.name || !editingTestimonial.rating || !editingTestimonial.review) {
        alert('Please fill out all required fields.')
        return
      }

      isUpdating.value = true

      try {
        const updateData = {
          name: editingTestimonial.name,
          rating: parseInt(editingTestimonial.rating),
          review: editingTestimonial.review
        }

        // Upload new image if provided
        if (selectedEditImage.value) {
          updateData.imageUrl = await uploadTestimonialImage(selectedEditImage.value, editingTestimonial.id)
        }

        await updateTestimonial(editingTestimonial.id, updateData)
        
        alert('Testimonial updated successfully!')
        closeEditModal()
      } catch (error) {
        console.error('Error updating testimonial:', error)
        alert('Failed to update testimonial. Please try again.')
      } finally {
        isUpdating.value = false
      }
    }

    const deleteTestimonialHandler = async (testimonial) => {
      if (confirm(`Are you sure you want to delete "${testimonial.name}"'s testimonial?`)) {
        try {
          await deleteTestimonial(testimonial.id)
          alert('Testimonial deleted successfully!')
        } catch (error) {
          console.error('Error deleting testimonial:', error)
          alert('Failed to delete testimonial. Please try again.')
        }
      }
    }

    const closeAddModal = () => {
      showAddModal.value = false
      Object.keys(newTestimonial).forEach(key => {
        newTestimonial[key] = ''
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

    // Load testimonials on component mount
    onMounted(async () => {
      console.log('Component mounted, starting to load testimonials...')
      
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
        
        // Find the collection with the most data or use 'reviews' as default
        let bestCollection = 'reviews'
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
          testimonials.value = allCollections[bestCollection]
          isLoading.value = false
          clearTimeout(loadingTimeout)
          console.log('Successfully loaded existing testimonials from', bestCollection, ':', testimonials.value)
        } else {
          // No existing data found, try the default getTestimonials function
          console.log('No existing data found, trying default getTestimonials...')
          const existingTestimonials = await getTestimonials()
          testimonials.value = existingTestimonials
          isLoading.value = false
          clearTimeout(loadingTimeout)
          console.log('Successfully loaded existing testimonials:', existingTestimonials)
        }
      } catch (error) {
        console.error('Error loading existing testimonials:', error)
        isLoading.value = false
        clearTimeout(loadingTimeout)
      }
      
      // Then set up real-time listener
      try {
        console.log('Setting up real-time listener...')
        subscribeToTestimonials((testimonialsList) => {
          testimonials.value = testimonialsList
          isLoading.value = false
          clearTimeout(loadingTimeout)
          console.log('Real-time update received:', testimonialsList)
        })
      } catch (error) {
        console.error('Error setting up real-time listener:', error)
        isLoading.value = false
        clearTimeout(loadingTimeout)
      }
    })

    return {
      testimonials,
      searchQuery,
      showAddModal,
      showEditModal,
      isSubmitting,
      isUpdating,
      isLoading,
      newTestimonial,
      editingTestimonial,
      filteredTestimonials,
      handleImageUpload,
      handleEditImageUpload,
      addTestimonial: addTestimonialHandler,
      editTestimonial,
      updateTestimonial: updateTestimonialHandler,
      deleteTestimonial: deleteTestimonialHandler,
      closeAddModal,
      closeEditModal,
      debugCheckCollections
    }
  }
}
</script>

<style scoped>
.testimonials {
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

.testimonials-section {
  padding: 3rem 0;
}

.testimonials-list-section {
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

.testimonials-table {
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

.testimonial-thumbnail {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 50%;
}

.testimonial-info {
  display: flex;
  flex-direction: column;
}

.testimonial-name {
  font-weight: 600;
  color: #2c3e50;
}

.rating-display {
  display: flex;
  gap: 0.2rem;
}

.star {
  color: #ddd;
  font-size: 1.2rem;
}

.star.filled {
  color: #ffc107;
}

.review-preview {
  max-width: 300px;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
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

input, textarea, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

input:focus, textarea:focus, select:focus {
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