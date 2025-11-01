<template>
  <div class="treatments">
    <div class="page-header">
      <div class="container">
        <h1>Manage Treatments</h1>
        <p>Add, edit, and manage dental treatments and services</p>
      </div>
    </div>

    <div class="treatments-section">
      <div class="container">
        <!-- Treatments List -->
        <div class="treatments-list-section">
          <div class="section-header">
            <h2>Treatments List</h2>
            <div class="header-actions">
              <button class="btn btn-primary" @click="showAddForm = true">
                ➕ Add Treatment
              </button>
              <button class="btn btn-danger" @click="clearAllTreatments">
                🗑️ Clear All
              </button>
              <div class="search-bar">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search treatments..." 
                  class="search-input"
                />
              </div>
            </div>
          </div>

          <div class="treatments-table">
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading treatments from Firebase...</p>
            </div>
            <div v-else-if="filteredTreatments.length === 0" class="empty-state">
              <p>No treatments found.</p>
            </div>
            <table v-else>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Title</th>
                  <th>Description</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Recovery</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="treatment in filteredTreatments" :key="treatment.id">
                  <td>
                    <div class="treatment-image">
                      <img 
                        v-if="treatment.image" 
                        :src="treatment.image" 
                        :alt="treatment.title"
                        @error="handleImageError"
                      />
                      <div v-else class="no-image">
                        <i class="fas fa-image"></i>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="treatment-title">{{ treatment.title }}</div>
                  </td>
                  <td>
                    <div class="treatment-description">
                      {{ truncateText(treatment.description, 100) }}
                    </div>
                  </td>
                  <td>{{ treatment.duration }}</td>
                  <td>${{ treatment.price }}</td>
                  <td>{{ treatment.recovery }}</td>
                  <td>
                    <div class="action-buttons">
                      <button 
                        class="btn btn-sm btn-primary" 
                        @click="viewTreatment(treatment)"
                      >
                        <i class="fas fa-eye"></i> View
                      </button>
                      <button 
                        class="btn btn-sm btn-secondary" 
                        @click="editTreatment(treatment)"
                      >
                        <i class="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        class="btn btn-sm btn-danger" 
                        @click="deleteTreatment(treatment)"
                      >
                        <i class="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Treatment Modal -->
    <div v-if="showAddForm" class="modal-overlay" @click="closeAddForm">
      <div class="modal-content add-modal" @click.stop>
        <div class="modal-header">
          <h3>Add New Treatment</h3>
          <button class="modal-close" @click="closeAddForm">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleAddTreatment">
            <div class="form-row">
              <div class="form-group">
                <label for="title">Treatment Title *</label>
                <input
                  type="text"
                  id="title"
                  v-model="newTreatment.title"
                  placeholder="Enter treatment title"
                  required
                />
              </div>
              <div class="form-group">
                <label for="duration">Duration *</label>
                <input
                  type="text"
                  id="duration"
                  v-model="newTreatment.duration"
                  placeholder="e.g., 2 hours, 30 minutes"
                  required
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="price">Price *</label>
                <input
                  type="number"
                  id="price"
                  v-model="newTreatment.price"
                  placeholder="Enter price"
                  step="0.01"
                  required
                />
              </div>
              <div class="form-group">
                <label for="recovery">Recovery Time *</label>
                <input
                  type="text"
                  id="recovery"
                  v-model="newTreatment.recovery"
                  placeholder="e.g., 1-2 weeks, 3 days"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description *</label>
              <textarea
                id="description"
                v-model="newTreatment.description"
                placeholder="Enter treatment description"
                rows="4"
                required
              ></textarea>
            </div>

            <div class="benefits-section">
              <h3>Benefits</h3>
              <div class="form-row">
                <div class="form-group">
                  <label for="benefit1">Benefit 1</label>
                  <input
                    type="text"
                    id="benefit1"
                    v-model="newTreatment.benefit1"
                    placeholder="Enter benefit"
                  />
                </div>
                <div class="form-group">
                  <label for="benefit2">Benefit 2</label>
                  <input
                    type="text"
                    id="benefit2"
                    v-model="newTreatment.benefit2"
                    placeholder="Enter benefit"
                  />
                </div>
                <div class="form-group">
                  <label for="benefit3">Benefit 3</label>
                  <input
                    type="text"
                    id="benefit3"
                    v-model="newTreatment.benefit3"
                    placeholder="Enter benefit"
                  />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="image">Treatment Image</label>
              <div class="image-upload-section">
                <input
                  type="file"
                  id="image"
                  ref="imageInput"
                  @change="handleImageSelect"
                  accept="image/*"
                  class="image-input"
                />
                <div class="image-preview" v-if="imagePreview">
                  <img :src="imagePreview" alt="Preview" />
                  <button type="button" @click="removeImage" class="remove-image-btn">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div v-if="uploadProgress > 0" class="upload-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
                  </div>
                  <span>{{ uploadProgress }}% uploaded</span>
                </div>
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeAddForm">Cancel</button>
          <button class="btn btn-primary" @click="handleAddTreatment" :disabled="isAdding">
            <span v-if="isAdding" class="loading-spinner"></span>
            {{ isAdding ? 'Adding...' : 'Add Treatment' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Treatment Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ selectedTreatment?.title }}</h3>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="selectedTreatment" class="treatment-details">
            <div class="treatment-image-large">
              <img 
                v-if="selectedTreatment.image" 
                :src="selectedTreatment.image" 
                :alt="selectedTreatment.title"
              />
              <div v-else class="no-image-large">
                <i class="fas fa-image"></i>
              </div>
            </div>
            <div class="treatment-info">
              <div class="info-row">
                <strong>Description:</strong>
                <p>{{ selectedTreatment.description }}</p>
              </div>
              <div class="info-row">
                <strong>Duration:</strong>
                <span>{{ selectedTreatment.duration }}</span>
              </div>
              <div class="info-row">
                <strong>Price:</strong>
                <span>${{ selectedTreatment.price }}</span>
              </div>
              <div class="info-row">
                <strong>Recovery Time:</strong>
                <span>{{ selectedTreatment.recovery }}</span>
              </div>
              <div v-if="selectedTreatment.benefits && selectedTreatment.benefits.length > 0" class="info-row">
                <strong>Benefits:</strong>
                <ul>
                  <li v-for="benefit in selectedTreatment.benefits" :key="benefit">
                    {{ benefit }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Close</button>
          <button class="btn btn-primary" @click="editTreatment(selectedTreatment)">Edit</button>
        </div>
      </div>
    </div>

    <!-- Edit Treatment Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content edit-modal" @click.stop>
        <div class="modal-header">
          <h3>Edit Treatment</h3>
          <button class="modal-close" @click="closeEditModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleUpdateTreatment">
            <div class="form-group">
              <label for="editTitle">Title *</label>
              <input
                type="text"
                id="editTitle"
                v-model="editForm.title"
                required
              />
            </div>
            <div class="form-group">
              <label for="editDescription">Description *</label>
              <textarea
                id="editDescription"
                v-model="editForm.description"
                rows="4"
                required
              ></textarea>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="editDuration">Duration *</label>
                <input
                  type="text"
                  id="editDuration"
                  v-model="editForm.duration"
                  required
                />
              </div>
              <div class="form-group">
                <label for="editPrice">Price *</label>
                <input
                  type="number"
                  id="editPrice"
                  v-model="editForm.price"
                  step="0.01"
                  required
                />
              </div>
            </div>
            <div class="form-group">
              <label for="editRecovery">Recovery Time *</label>
              <input
                type="text"
                id="editRecovery"
                v-model="editForm.recovery"
                required
              />
            </div>
            <div class="form-group">
              <label for="editImage">New Image (optional)</label>
              <input
                type="file"
                id="editImage"
                @change="handleEditImageSelect"
                accept="image/*"
              />
              <div v-if="editImagePreview" class="image-preview">
                <img :src="editImagePreview" alt="Preview" />
              </div>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEditModal">Cancel</button>
          <button class="btn btn-primary" @click="handleUpdateTreatment" :disabled="isUpdating">
            <span v-if="isUpdating" class="loading-spinner"></span>
            {{ isUpdating ? 'Updating...' : 'Update Treatment' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { 
  getTreatments, 
  addTreatment, 
  updateTreatment, 
  deleteTreatment, 
  clearAllTreatments,
  subscribeToTreatments
} from '../firebase/treatmentsService.js'

export default {
  name: 'Treatments',
  setup() {
    const treatments = ref([])
    const searchQuery = ref('')
    const isLoading = ref(true)
    const showAddForm = ref(false)
    const showModal = ref(false)
    const showEditModal = ref(false)
    const selectedTreatment = ref(null)
    const isAdding = ref(false)
    const isUpdating = ref(false)
    const uploadProgress = ref(0)
    const imagePreview = ref('')
    const editImagePreview = ref('')
    
    let unsubscribe = null

    const newTreatment = reactive({
      title: '',
      description: '',
      duration: '',
      price: '',
      recovery: '',
      benefit1: '',
      benefit2: '',
      benefit3: '',
      imageFile: null
    })

    const editForm = reactive({
      id: '',
      title: '',
      description: '',
      duration: '',
      price: '',
      recovery: '',
      imageFile: null
    })

    const filteredTreatments = computed(() => {
      if (!searchQuery.value) return treatments.value
      return treatments.value.filter(treatment => 
        treatment.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        treatment.description.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        treatment.duration.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        treatment.recovery.toLowerCase().includes(searchQuery.value.toLowerCase())
      )
    })

    const handleImageSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        newTreatment.imageFile = file
        const reader = new FileReader()
        reader.onload = (e) => {
          imagePreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    const handleEditImageSelect = (event) => {
      const file = event.target.files[0]
      if (file) {
        editForm.imageFile = file
        const reader = new FileReader()
        reader.onload = (e) => {
          editImagePreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    const removeImage = () => {
      imagePreview.value = ''
      newTreatment.imageFile = null
    }

    const handleAddTreatment = async () => {
      isAdding.value = true
      uploadProgress.value = 0

      try {
        const result = await addTreatment(newTreatment)
        
        if (result.success) {
          alert(result.message)
          resetForm()
          closeAddForm()
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error('Error adding treatment:', error)
        alert('Failed to add treatment. Please try again.')
      } finally {
        isAdding.value = false
        uploadProgress.value = 0
      }
    }

    const handleUpdateTreatment = async () => {
      isUpdating.value = true

      try {
        const result = await updateTreatment(editForm.id, editForm)
        
        if (result.success) {
          alert(result.message)
          closeEditModal()
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error('Error updating treatment:', error)
        alert('Failed to update treatment. Please try again.')
      } finally {
        isUpdating.value = false
      }
    }

    const viewTreatment = (treatment) => {
      selectedTreatment.value = treatment
      showModal.value = true
    }

    const editTreatment = (treatment) => {
      editForm.id = treatment.id
      editForm.title = treatment.title
      editForm.description = treatment.description
      editForm.duration = treatment.duration
      editForm.price = treatment.price
      editForm.recovery = treatment.recovery
      editForm.imageFile = null
      editImagePreview.value = ''
      
      showEditModal.value = true
      showModal.value = false
    }

    const deleteTreatmentHandler = async (treatment) => {
      if (confirm(`Are you sure you want to delete "${treatment.title}"?`)) {
        try {
          const result = await deleteTreatment(treatment.id)
          if (result.success) {
            alert(result.message)
          } else {
            alert(result.message)
          }
        } catch (error) {
          console.error('Error deleting treatment:', error)
          alert('Failed to delete treatment. Please try again.')
        }
      }
    }

    const clearAllTreatmentsHandler = async () => {
      if (confirm('Are you sure you want to delete ALL treatments? This action cannot be undone.')) {
        try {
          const result = await clearAllTreatments()
          if (result.success) {
            alert(result.message)
          } else {
            alert(result.message)
          }
        } catch (error) {
          console.error('Error clearing all treatments:', error)
          alert('Failed to clear all treatments. Please try again.')
        }
      }
    }

    const resetForm = () => {
      Object.keys(newTreatment).forEach(key => {
        if (key === 'imageFile') {
          newTreatment[key] = null
        } else {
          newTreatment[key] = ''
        }
      })
      imagePreview.value = ''
      uploadProgress.value = 0
    }

    const closeAddForm = () => {
      showAddForm.value = false
      resetForm()
    }

    const toggleAddForm = () => {
      showAddForm.value = !showAddForm.value
      if (!showAddForm.value) {
        resetForm()
      }
    }

    const closeModal = () => {
      showModal.value = false
      selectedTreatment.value = null
    }

    const closeEditModal = () => {
      showEditModal.value = false
      editImagePreview.value = ''
    }

    const truncateText = (text, maxLength) => {
      return text && text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    }

    const handleImageError = (event) => {
      event.target.style.display = 'none'
    }

    // Load treatments on component mount
    onMounted(async () => {
      console.log('Treatments component mounted')
      
      try {
        // Set up real-time listener
        unsubscribe = subscribeToTreatments((treatmentsList) => {
          treatments.value = treatmentsList
          isLoading.value = false
          console.log('Real-time treatments update:', treatmentsList)
        })
      } catch (error) {
        console.error('Error setting up treatments listener:', error)
        isLoading.value = false
      }
    })

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
    })

    return {
      treatments,
      searchQuery,
      isLoading,
      showAddForm,
      showModal,
      showEditModal,
      selectedTreatment,
      isAdding,
      isUpdating,
      uploadProgress,
      imagePreview,
      editImagePreview,
      newTreatment,
      editForm,
      filteredTreatments,
      handleImageSelect,
      handleEditImageSelect,
      removeImage,
      handleAddTreatment,
      handleUpdateTreatment,
      viewTreatment,
      editTreatment,
      deleteTreatment: deleteTreatmentHandler,
      clearAllTreatments: clearAllTreatmentsHandler,
      resetForm,
      toggleAddForm,
      closeAddForm,
      closeModal,
      closeEditModal,
      truncateText,
      handleImageError
    }
  }
}
</script>

<style scoped>
.treatments {
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

.treatments-section {
  padding: 3rem 0;
}

.treatments-list-section {
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

.search-icon {
  color: #6c757d;
  margin-right: 0.5rem;
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  padding: 0.5rem;
  flex: 1;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.benefits-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.benefits-section h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.image-upload-section {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 1rem;
  text-align: center;
}

.image-input {
  margin-bottom: 1rem;
}

.image-preview {
  position: relative;
  display: inline-block;
  margin-top: 1rem;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
}

.remove-image-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  cursor: pointer;
}

.upload-progress {
  margin-top: 1rem;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.treatments-table {
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

.treatment-image {
  width: 60px;
  height: 60px;
}

.treatment-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 6px;
}

.no-image {
  width: 100%;
  height: 100%;
  background: #f8f9fa;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
}

.treatment-title {
  font-weight: 600;
  color: #2c3e50;
}

.treatment-description {
  max-width: 200px;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.8rem;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover:not(:disabled) {
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.loading-state .loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  margin: 0 auto 1rem;
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
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.edit-modal {
  max-width: 800px;
}

.add-modal {
  max-width: 900px;
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

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
}

.modal-body {
  padding: 1.5rem;
}

.treatment-details {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
}

.treatment-image-large {
  text-align: center;
}

.treatment-image-large img {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
}

.no-image-large {
  width: 200px;
  height: 200px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  font-size: 3rem;
  margin: 0 auto;
}

.treatment-info {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-row strong {
  color: #2c3e50;
  font-weight: 600;
}

.info-row ul {
  margin: 0;
  padding-left: 1.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
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
  
  .header-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .treatment-details {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  th, td {
    padding: 0.5rem;
  }
}
</style>
