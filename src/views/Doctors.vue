<template>
  <div class="doctors">
    <div class="page-header">
      <div class="container">
        <h1>Manage Doctors</h1>
        <p>Add, edit, and manage doctor profiles</p>
      </div>
    </div>

    <div class="doctors-section">
      <div class="container">
        <!-- Doctors List -->
        <div class="doctors-list-section">
          <div class="section-header">
            <h2>Doctors List</h2>
            <div class="header-actions">
              <button class="btn btn-primary" @click="showAddModal = true">
                ➕ Add Doctor
              </button>
              <div class="search-bar">
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search doctors..." 
                  class="search-input"
                />
              </div>
            </div>
          </div>

          <div class="doctors-table">
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading doctors from Firebase...</p>
              <small>If this takes too long, check your internet connection and Firebase configuration.</small>
            </div>
            <div v-else-if="doctors.length === 0" class="empty-state">
              <p>No doctors found. Add your first doctor using the form above.</p>
            </div>
            <table v-else>
              <thead>
                <tr>
                  <th>Profile Image</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Testimonial</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="doctor in filteredDoctors" :key="doctor.id">
                  <td>
                    <img 
                      :src="doctor.imageUrl || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=50&h=50&fit=crop&crop=face'" 
                      :alt="doctor.name" 
                      class="doctor-thumbnail"
                    />
                  </td>
                  <td>
                    <div class="doctor-info">
                      <div class="doctor-name">{{ doctor.name }}</div>
                    </div>
                  </td>
                  <td>{{ doctor.designation }}</td>
                  <td>
                    <div class="testimonial-preview">
                      {{ doctor.message ? doctor.message.substring(0, 100) + (doctor.message.length > 100 ? '...' : '') : 'No testimonial' }}
                    </div>
                  </td>
                  <td>
                    <div class="status-section">
                      <span v-if="doctor.active !== false" class="status-enabled">✅ Enabled</span>
                      <span v-else class="status-disabled">❌ Disabled</span>
                    </div>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-sm btn-primary" @click="editDoctor(doctor)">
                        ✏️ Edit
                      </button>
                      <button 
                        v-if="doctor.active !== false" 
                        class="btn btn-sm btn-warning" 
                        @click="toggleDoctorStatus(doctor)"
                      >
                        ⏸️ Disable
                      </button>
                      <button 
                        v-else 
                        class="btn btn-sm btn-success" 
                        @click="toggleDoctorStatus(doctor)"
                      >
                        ▶️ Enable
                      </button>
                      <button class="btn btn-sm btn-danger" @click="deleteDoctor(doctor)">
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Add Doctor Modal -->
        <div v-if="showAddModal" class="modal-overlay" @click="closeAddModal">
          <div class="modal" @click.stop>
            <div class="modal-header">
              <h3>Add New Doctor</h3>
              <button class="close-btn" @click="closeAddModal">×</button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="addDoctorHandler">
                <div class="form-row">
                  <div class="form-group">
                    <label>Name *</label>
                    <input type="text" v-model="newDoctor.name" required />
                  </div>
                  <div class="form-group">
                    <label>Designation *</label>
                    <input type="text" v-model="newDoctor.designation" required />
                  </div>
                </div>
                
                <div class="form-group">
                  <label>Testimonial *</label>
                  <textarea v-model="newDoctor.message" rows="4" required placeholder="Enter doctor's testimonial or description..."></textarea>
                </div>
                
                <div class="form-group">
                  <label>Profile Image</label>
                  <input type="file" @change="handleImageUpload" accept="image/*" />
                  <small>Maximum upload size is 2 MB</small>
                </div>
                
                <div class="modal-actions">
                  <button type="button" class="btn btn-secondary" @click="closeAddModal">
                    Cancel
                  </button>
                  <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                    {{ isSubmitting ? 'Adding...' : 'Add Doctor' }}
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
  addDoctor, 
  getDoctors, 
  updateDoctor, 
  deleteDoctor, 
  uploadDoctorImage,
  subscribeToDoctors 
} from '../firebase/doctorsService.js'

export default {
  name: 'Doctors',
  setup() {
    const doctors = ref([])
    const searchQuery = ref('')
    const showAddModal = ref(false)
    const showEditModal = ref(false)
    const isSubmitting = ref(false)
    const isUpdating = ref(false)
    const isLoading = ref(true)
    const selectedImage = ref(null)
    const selectedEditImage = ref(null)

    const newDoctor = reactive({
      name: '',
      designation: '',
      message: '',
      imageUrl: ''
    })

    const editingDoctor = reactive({
      id: '',
      name: '',
      designation: '',
      message: '',
      imageUrl: ''
    })

    const filteredDoctors = computed(() => {
      if (!searchQuery.value) return doctors.value
      return doctors.value.filter(doctor => 
        doctor.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        (doctor.designation && doctor.designation.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        (doctor.message && doctor.message.toLowerCase().includes(searchQuery.value.toLowerCase()))
      )
    })

    const handleImageUpload = (event) => {
      selectedImage.value = event.target.files[0]
    }

    const handleEditImageUpload = (event) => {
      selectedEditImage.value = event.target.files[0]
    }

    const addDoctorHandler = async () => {
      if (!newDoctor.name || !newDoctor.designation || !newDoctor.message) {
        alert('Please fill out all required fields.')
        return
      }

      isSubmitting.value = true

      try {
        let imageUrl = ''

        // Upload image if provided
        if (selectedImage.value) {
          imageUrl = await uploadDoctorImage(selectedImage.value, 'temp')
        }

        // Prepare doctor data
        const doctorData = {
          name: newDoctor.name,
          designation: newDoctor.designation,
          message: newDoctor.message,
          imageUrl: imageUrl
        }

        await addDoctor(doctorData)
        
        alert('Doctor added successfully!')
        closeAddModal()
      } catch (error) {
        console.error('Error adding doctor:', error)
        alert('Failed to add doctor. Please try again.')
      } finally {
        isSubmitting.value = false
      }
    }

    const editDoctor = (doctor) => {
      editingDoctor.id = doctor.id
      editingDoctor.name = doctor.name
      editingDoctor.designation = doctor.designation || ''
      editingDoctor.message = doctor.message || doctor.description || ''
      editingDoctor.imageUrl = doctor.imageUrl || ''
      showEditModal.value = true
    }

    const updateDoctorHandler = async () => {
      if (!editingDoctor.name || !editingDoctor.designation || !editingDoctor.message) {
        alert('Please fill out all required fields.')
        return
      }

      isUpdating.value = true

      try {
        const updateData = {
          name: editingDoctor.name,
          designation: editingDoctor.designation,
          message: editingDoctor.message
        }

        // Upload new image if provided
        if (selectedEditImage.value) {
          updateData.imageUrl = await uploadDoctorImage(selectedEditImage.value, editingDoctor.id)
        }

        await updateDoctor(editingDoctor.id, updateData)
        
        alert('Doctor updated successfully!')
        closeEditModal()
      } catch (error) {
        console.error('Error updating doctor:', error)
        alert('Failed to update doctor. Please try again.')
      } finally {
        isUpdating.value = false
      }
    }

    const deleteDoctorHandler = async (doctor) => {
      if (confirm(`Are you sure you want to delete ${doctor.name}?`)) {
        try {
          await deleteDoctor(doctor.id)
          alert('Doctor deleted successfully!')
        } catch (error) {
          console.error('Error deleting doctor:', error)
          alert('Failed to delete doctor. Please try again.')
        }
      }
    }

    const toggleDoctorStatus = async (doctor) => {
      try {
        const updateData = { active: doctor.active === false ? true : false }
        await updateDoctor(doctor.id, updateData)
        doctor.active = doctor.active === false ? true : false
        alert(`Doctor ${doctor.active ? 'enabled' : 'disabled'} successfully!`)
      } catch (error) {
        console.error('Error toggling doctor status:', error)
        alert('Failed to toggle doctor status. Please try again.')
      }
    }

    const closeAddModal = () => {
      showAddModal.value = false
      Object.keys(newDoctor).forEach(key => {
        newDoctor[key] = ''
      })
      selectedImage.value = null
    }

    const closeEditModal = () => {
      showEditModal.value = false
      selectedEditImage.value = null
    }

    // Load doctors on component mount
    onMounted(async () => {
      console.log('Component mounted, starting to load doctors...')
      
      // Set a timeout to prevent infinite loading
      const loadingTimeout = setTimeout(() => {
        if (isLoading.value) {
          console.log('Loading timeout reached, setting loading to false')
          isLoading.value = false
        }
      }, 10000) // 10 second timeout
      
      try {
        console.log('Attempting to fetch doctors from Firebase...')
        const existingDoctors = await getDoctors()
        doctors.value = existingDoctors
        isLoading.value = false
        clearTimeout(loadingTimeout)
        console.log('Successfully loaded existing doctors:', existingDoctors)
      } catch (error) {
        console.error('Error loading existing doctors:', error)
        isLoading.value = false
        clearTimeout(loadingTimeout)
      }
      
      // Then set up real-time listener
      try {
        console.log('Setting up real-time listener...')
        subscribeToDoctors((doctorsList) => {
          doctors.value = doctorsList
          isLoading.value = false
          clearTimeout(loadingTimeout)
          console.log('Real-time update received:', doctorsList)
        })
      } catch (error) {
        console.error('Error setting up real-time listener:', error)
        isLoading.value = false
        clearTimeout(loadingTimeout)
      }
    })

    return {
      doctors,
      searchQuery,
      showAddModal,
      showEditModal,
      isSubmitting,
      isUpdating,
      isLoading,
      newDoctor,
      editingDoctor,
      filteredDoctors,
      handleImageUpload,
      handleEditImageUpload,
      addDoctor: addDoctorHandler,
      editDoctor,
      updateDoctor: updateDoctorHandler,
      deleteDoctor: deleteDoctorHandler,
      toggleDoctorStatus,
      closeAddModal,
      closeEditModal
    }
  }
}
</script>

<style scoped>
.doctors {
  min-height: 100vh;
  background: #f8f9fa;
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

.doctors-section {
  padding: 3rem 0;
}

.doctors-list-section {
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
  color: #2c3e50;
  font-weight: 600;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group small {
  color: #666;
  font-size: 0.8rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.doctors-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
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

.doctor-thumbnail {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.doctor-info {
  display: flex;
  flex-direction: column;
}

.doctor-name {
  font-weight: 600;
  color: #2c3e50;
}

.doctor-designation {
  font-size: 0.9rem;
  color: #666;
}

.testimonial-preview {
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
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-warning {
  background: #ffc107;
  color: #212529;
}

.btn-warning:hover {
  background: #e0a800;
}

.status-enabled {
  color: #28a745;
  font-weight: 600;
}

.status-disabled {
  color: #dc3545;
  font-weight: 600;
}

.status-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-sm {
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
}

.btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  color: #2c3e50;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 1.5rem;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
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
  
  .form-actions,
  .modal-actions {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .doctors-table {
    font-size: 0.9rem;
  }
  
  th, td {
    padding: 0.5rem;
  }
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
</style>
