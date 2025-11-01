<template>
  <div class="appointments">
    <div class="page-header">
      <div class="container">
        <h1>Manage Appointments</h1>
        <p>View and manage patient appointment bookings</p>
      </div>
    </div>

    <div class="appointments-section">
      <div class="container">
        <!-- Appointments List -->
        <div class="appointments-list-section">
          <div class="section-header">
            <h2>Appointments List</h2>
            <div class="header-actions">
              <button class="btn btn-danger" @click="clearAllAppointments">
                🗑️ Clear All
              </button>
              <div class="status-filter">
                <select v-model="statusFilter" class="filter-select">
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div class="clinic-filter">
                <select v-model="clinicFilter" class="filter-select">
                  <option value="">All Clinics</option>
                  <option v-for="clinic in uniqueClinics" :key="clinic" :value="clinic">
                    {{ clinic }}
                  </option>
                </select>
              </div>
              <div class="search-bar">
                <i class="fas fa-search search-icon"></i>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search appointments..." 
                  class="search-input"
                />
              </div>
            </div>
          </div>

          <div class="appointments-table">
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading appointments from Firebase...</p>
            </div>
            <div v-else-if="filteredAppointments.length === 0" class="empty-state">
              <p>No appointments found.</p>
            </div>
            <table v-else>
              <thead>
                <tr>
                  <th class="number-column">No.</th>
                  <th>Patient Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Clinic</th>
                  <th>Treatment</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(appointment, index) in paginatedAppointments" :key="appointment.id">
                  <td class="number-column">
                    <span class="row-number">{{ paginationInfo.start + index }}</span>
                  </td>
                  <td>
                    <div class="patient-info">
                      <div class="patient-name">{{ appointment.name }}</div>
                    </div>
                  </td>
                  <td>{{ appointment.phone }}</td>
                  <td>{{ appointment.email || 'N/A' }}</td>
                  <td>{{ appointment.clinic }}</td>
                  <td>{{ appointment.treatment }}</td>
                  <td>
                    <div class="message-preview">
                      {{ truncateText(appointment.message || 'No message', 50) }}
                    </div>
                  </td>
                  <td>
                    <span :class="getStatusClass(appointment.status)" class="status-badge">
                      {{ appointment.status }}
                    </span>
                  </td>
                  <td>
                    <div class="date-info">
                      <div class="date">{{ formatDate(appointment.timestamp) }}</div>
                      <div class="time">{{ formatTime(appointment.timestamp) }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button 
                        class="btn btn-sm btn-secondary" 
                        @click="editAppointment(appointment)"
                      >
                        <i class="fas fa-edit"></i> Edit
                      </button>
                      <button 
                        class="btn btn-sm btn-danger" 
                        @click="deleteAppointment(appointment)"
                      >
                        <i class="fas fa-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
            
            <!-- Pagination Controls -->
            <div v-if="totalPages > 1" class="pagination-container">
              <div class="pagination-info">
                Showing {{ paginationInfo.start }} to {{ paginationInfo.end }} of {{ paginationInfo.total }} appointments
              </div>
              <div class="pagination-controls">
                <button 
                  class="pagination-btn" 
                  @click="prevPage" 
                  :disabled="currentPage === 1"
                >
                  <i class="fas fa-chevron-left"></i> Previous
                </button>
                
                <div class="page-numbers">
                  <button 
                    v-for="page in visiblePages" 
                    :key="page"
                    class="page-number"
                    :class="{ active: page === currentPage }"
                    @click="goToPage(page)"
                  >
                    {{ page }}
                  </button>
                </div>
                
                <button 
                  class="pagination-btn" 
                  @click="nextPage" 
                  :disabled="currentPage === totalPages"
                >
                  Next <i class="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Details Modal -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Appointment Details</h3>
          <button class="modal-close" @click="closeModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <div v-if="selectedAppointment" class="appointment-details">
            <div class="detail-section">
              <h4>Patient Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <strong>Name:</strong>
                  <span>{{ selectedAppointment.name }}</span>
                </div>
                <div class="detail-item">
                  <strong>Phone:</strong>
                  <span>{{ selectedAppointment.phone }}</span>
                </div>
                <div class="detail-item">
                  <strong>Email:</strong>
                  <span>{{ selectedAppointment.email || 'Not provided' }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>Appointment Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <strong>Clinic:</strong>
                  <span>{{ selectedAppointment.clinic }}</span>
                </div>
                <div class="detail-item">
                  <strong>Treatment:</strong>
                  <span>{{ selectedAppointment.treatment }}</span>
                </div>
                <div class="detail-item">
                  <strong>Status:</strong>
                  <span :class="getStatusClass(selectedAppointment.status)" class="status-badge">
                    {{ selectedAppointment.status }}
                  </span>
                </div>
                <div class="detail-item">
                  <strong>Date:</strong>
                  <span>{{ formatDateTime(selectedAppointment.timestamp) }}</span>
                </div>
              </div>
            </div>
            
            <div v-if="selectedAppointment.message" class="detail-section">
              <h4>Message</h4>
              <div class="message-content">
                {{ selectedAppointment.message }}
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Close</button>
          <button class="btn btn-primary" @click="editAppointment(selectedAppointment)">Edit</button>
        </div>
      </div>
    </div>

    <!-- Edit Appointment Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click="closeEditModal">
      <div class="modal-content edit-modal" @click.stop>
        <div class="modal-header">
          <h3>Edit Appointment</h3>
          <button class="modal-close" @click="closeEditModal">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="handleUpdateAppointment">
            <div class="form-row">
              <div class="form-group">
                <label for="editName">Patient Name *</label>
                <input
                  type="text"
                  id="editName"
                  v-model="editForm.name"
                  required
                />
              </div>
              <div class="form-group">
                <label for="editPhone">Phone *</label>
                <input
                  type="tel"
                  id="editPhone"
                  v-model="editForm.phone"
                  required
                />
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="editEmail">Email</label>
                <input
                  type="email"
                  id="editEmail"
                  v-model="editForm.email"
                />
              </div>
              <div class="form-group">
                <label for="editStatus">Status *</label>
                <select id="editStatus" v-model="editForm.status" required>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="editClinic">Clinic *</label>
                <input
                  type="text"
                  id="editClinic"
                  v-model="editForm.clinic"
                  required
                />
              </div>
              <div class="form-group">
                <label for="editTreatment">Treatment *</label>
                <input
                  type="text"
                  id="editTreatment"
                  v-model="editForm.treatment"
                  required
                />
              </div>
            </div>
            
            <div class="form-group">
              <label for="editMessage">Message</label>
              <textarea
                id="editMessage"
                v-model="editForm.message"
                rows="4"
              ></textarea>
            </div>
          </form>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeEditModal">Cancel</button>
          <button class="btn btn-primary" @click="handleUpdateAppointment" :disabled="isUpdating">
            <span v-if="isUpdating" class="loading-spinner"></span>
            {{ isUpdating ? 'Updating...' : 'Update Appointment' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { 
  getAppointments, 
  addAppointment, 
  updateAppointment, 
  deleteAppointment, 
  clearAllAppointments,
  subscribeToAppointments
} from '../firebase/appointmentsService.js'

export default {
  name: 'Appointments',
  setup() {
    const appointments = ref([])
    const searchQuery = ref('')
    const statusFilter = ref('')
    const clinicFilter = ref('')
    const isLoading = ref(true)
    const showModal = ref(false)
    const showEditModal = ref(false)
    const selectedAppointment = ref(null)
    const isUpdating = ref(false)
    
    // Pagination state
    const currentPage = ref(1)
    const itemsPerPage = ref(20)
    
    let unsubscribe = null

    const editForm = reactive({
      id: '',
      name: '',
      phone: '',
      email: '',
      clinic: '',
      treatment: '',
      message: '',
      status: 'pending'
    })

    const uniqueClinics = computed(() => {
      const clinics = [...new Set(appointments.value.map(appointment => appointment.clinic))]
      return clinics.sort()
    })

    const filteredAppointments = computed(() => {
      let filtered = appointments.value
      
      // Filter by status
      if (statusFilter.value) {
        filtered = filtered.filter(appointment => appointment.status === statusFilter.value)
      }
      
      // Filter by clinic
      if (clinicFilter.value) {
        filtered = filtered.filter(appointment => appointment.clinic === clinicFilter.value)
      }
      
      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(appointment => 
          appointment.name.toLowerCase().includes(query) ||
          appointment.phone.includes(query) ||
          (appointment.email && appointment.email.toLowerCase().includes(query)) ||
          appointment.clinic.toLowerCase().includes(query) ||
          appointment.treatment.toLowerCase().includes(query) ||
          (appointment.message && appointment.message.toLowerCase().includes(query))
        )
      }
      
      return filtered
    })

    // Pagination computed properties
    const totalPages = computed(() => {
      return Math.ceil(filteredAppointments.value.length / itemsPerPage.value)
    })

    const paginatedAppointments = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value
      const end = start + itemsPerPage.value
      return filteredAppointments.value.slice(start, end)
    })

    const paginationInfo = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value + 1
      const end = Math.min(currentPage.value * itemsPerPage.value, filteredAppointments.value.length)
      return {
        start,
        end,
        total: filteredAppointments.value.length
      }
    })

    const visiblePages = computed(() => {
      const pages = []
      const total = totalPages.value
      const current = currentPage.value
      
      if (total <= 7) {
        // Show all pages if 7 or fewer
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        // Show smart pagination
        if (current <= 4) {
          // Show first 5 pages + ellipsis + last page
          for (let i = 1; i <= 5; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          // Show first page + ellipsis + last 5 pages
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) {
            pages.push(i)
          }
        } else {
          // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) {
            pages.push(i)
          }
          pages.push('...')
          pages.push(total)
        }
      }
      
      return pages
    })

    const editAppointment = (appointment) => {
      editForm.id = appointment.id
      editForm.name = appointment.name
      editForm.phone = appointment.phone
      editForm.email = appointment.email || ''
      editForm.clinic = appointment.clinic
      editForm.treatment = appointment.treatment
      editForm.message = appointment.message || ''
      editForm.status = appointment.status
      
      showEditModal.value = true
    }

    const handleUpdateAppointment = async () => {
      isUpdating.value = true

      try {
        const result = await updateAppointment(editForm.id, editForm)
        
        if (result.success) {
          alert(result.message)
          closeEditModal()
        } else {
          alert(result.message)
        }
      } catch (error) {
        console.error('Error updating appointment:', error)
        alert('Failed to update appointment. Please try again.')
      } finally {
        isUpdating.value = false
      }
    }

    const deleteAppointmentHandler = async (appointment) => {
      if (confirm(`Are you sure you want to delete the appointment for "${appointment.name}"?`)) {
        try {
          const result = await deleteAppointment(appointment.id)
          if (result.success) {
            alert(result.message)
          } else {
            alert(result.message)
          }
        } catch (error) {
          console.error('Error deleting appointment:', error)
          alert('Failed to delete appointment. Please try again.')
        }
      }
    }

    const clearAllAppointmentsHandler = async () => {
      if (confirm('Are you sure you want to delete ALL appointments? This action cannot be undone.')) {
        try {
          const result = await clearAllAppointments()
          if (result.success) {
            alert(result.message)
          } else {
            alert(result.message)
          }
        } catch (error) {
          console.error('Error clearing all appointments:', error)
          alert('Failed to clear all appointments. Please try again.')
        }
      }
    }

    const closeModal = () => {
      showModal.value = false
      selectedAppointment.value = null
    }

    const closeEditModal = () => {
      showEditModal.value = false
    }

    const truncateText = (text, maxLength) => {
      return text && text.length > maxLength ? text.substring(0, maxLength) + '...' : text
    }

    const getStatusClass = (status) => {
      const statusClasses = {
        pending: 'status-pending',
        confirmed: 'status-confirmed',
        completed: 'status-completed',
        cancelled: 'status-cancelled'
      }
      return statusClasses[status] || 'status-pending'
    }

    const formatDate = (timestamp) => {
      if (!timestamp) return 'N/A'
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString()
    }

    const formatTime = (timestamp) => {
      if (!timestamp) return 'N/A'
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const formatDateTime = (timestamp) => {
      if (!timestamp) return 'N/A'
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleString()
    }

    // Pagination functions
    const goToPage = (page) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    }

    const resetPagination = () => {
      currentPage.value = 1
    }

    // Load appointments on component mount
    onMounted(async () => {
      console.log('Appointments component mounted')
      
      try {
        // Set up real-time listener
        unsubscribe = subscribeToAppointments((appointmentsList) => {
          appointments.value = appointmentsList
          isLoading.value = false
          console.log('Real-time appointments update:', appointmentsList)
        })
      } catch (error) {
        console.error('Error setting up appointments listener:', error)
        isLoading.value = false
      }
    })

    onUnmounted(() => {
      if (unsubscribe) {
        unsubscribe()
      }
    })

    return {
      appointments,
      searchQuery,
      statusFilter,
      clinicFilter,
      uniqueClinics,
      isLoading,
      showModal,
      showEditModal,
      selectedAppointment,
      isUpdating,
      editForm,
      filteredAppointments,
      paginatedAppointments,
      paginationInfo,
      totalPages,
      visiblePages,
      currentPage,
      editAppointment,
      handleUpdateAppointment,
      deleteAppointment: deleteAppointmentHandler,
      clearAllAppointments: clearAllAppointmentsHandler,
      closeModal,
      closeEditModal,
      truncateText,
      getStatusClass,
      formatDate,
      formatTime,
      formatDateTime,
      goToPage,
      nextPage,
      prevPage,
      resetPagination
    }
  }
}
</script>

<style scoped>
.appointments {
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

.appointments-section {
  padding: 3rem 0;
}

.appointments-list-section {
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

.status-filter,
.clinic-filter {
  display: flex;
  align-items: center;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 0.9rem;
  min-width: 120px;
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

.appointments-table {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

th, td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-right: 1px solid #dee2e6;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
}

th {
  background: #f8f9fa;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #dee2e6;
  text-transform: uppercase;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.number-column {
  width: 60px;
  text-align: center;
  background: #e9ecef !important;
}

.row-number {
  display: inline-block;
  width: 24px;
  height: 24px;
  background: #667eea;
  color: white;
  border-radius: 50%;
  text-align: center;
  line-height: 24px;
  font-size: 0.8rem;
  font-weight: 600;
}

th:last-child,
td:last-child {
  border-right: none;
}

tr:last-child td {
  border-bottom: none;
}

tr:hover {
  background-color: #f8f9fa;
}

tr:nth-child(even) {
  background-color: #ffffff;
}

tr:nth-child(odd) {
  background-color: #fafbfc;
}

.patient-info {
  display: flex;
  flex-direction: column;
}

.patient-name {
  font-weight: 600;
  color: #2c3e50;
}

.message-preview {
  max-width: 200px;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-confirmed {
  background: #d1ecf1;
  color: #0c5460;
}

.status-completed {
  background: #d4edda;
  color: #155724;
}

.status-cancelled {
  background: #f8d7da;
  color: #721c24;
}

.date-info {
  display: flex;
  flex-direction: column;
}

.date {
  font-weight: 600;
  color: #2c3e50;
}

.time {
  font-size: 0.8rem;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
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
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  min-width: 60px;
  justify-content: center;
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

.appointment-details {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.detail-section {
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.detail-section h4 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item strong {
  color: #2c3e50;
  font-weight: 600;
  font-size: 0.9rem;
}

.message-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  font-style: italic;
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
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
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
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  th, td {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
  
  th {
    font-size: 0.75rem;
  }
  
  .number-column {
    width: 50px;
  }
  
  .row-number {
    width: 20px;
    height: 20px;
    line-height: 20px;
    font-size: 0.7rem;
  }
  
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
    min-width: 50px;
  }
  
  table {
    font-size: 0.8rem;
  }
}

/* Pagination Styles */
.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.pagination-info {
  color: #6c757d;
  font-size: 0.9rem;
  font-weight: 500;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn:hover:not(:disabled) {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.25rem;
}

.page-number {
  width: 40px;
  height: 40px;
  border: 1px solid #dee2e6;
  background: white;
  color: #495057;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.page-number.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.page-number:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .pagination-container {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .pagination-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
  
  .page-number {
    width: 35px;
    height: 35px;
    font-size: 0.8rem;
  }
}
</style>
