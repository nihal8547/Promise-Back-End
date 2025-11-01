<template>
  <div class="contact">
    <div class="page-header">
      <div class="container">
        <h1>Contact Form Responses</h1>
        <p>Manage contact form submissions and responses</p>
      </div>
    </div>

    <div class="contact-section">
      <div class="container">
        <!-- Contact Responses List -->
        <div class="responses-list-section">
          <div class="section-header">
            <h2>Contact Form Responses</h2>
            <div class="header-actions">
              <div class="clinic-filter">
                <select v-model="clinicFilter" class="filter-select">
                  <option value="">All Clinics</option>
                  <option v-for="clinic in uniqueClinics" :key="clinic" :value="clinic">
                    {{ clinic }}
                  </option>
                </select>
              </div>
              <div class="search-bar">
                <span class="search-icon">🔍</span>
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Search responses..." 
                  class="search-input"
                />
              </div>
            </div>
          </div>

          <div class="responses-table">
            <div v-if="isLoading" class="loading-state">
              <div class="loading-spinner"></div>
              <p>Loading contact responses from Firebase...</p>
              <small>If this takes too long, check your internet connection and Firebase configuration.</small>
            </div>
            <div v-else-if="responses.length === 0" class="empty-state">
              <p>No contact responses found.</p>
            </div>
            <table v-else>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Number</th>
                  <th>Email</th>
                  <th>Clinic</th>
                  <th>Message</th>
                  <th>Collection</th>
                  <th>Status</th>
                  <th>Remark</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="response in filteredResponses" :key="response.id">
                  <td>
                    <div class="response-info">
                      <div class="response-name">{{ response.name }}</div>
                    </div>
                  </td>
                  <td>{{ response.number || 'N/A' }}</td>
                  <td>{{ response.email }}</td>
                  <td>{{ response.clinic || 'N/A' }}</td>
                  <td>
                    <div class="message-preview">
                      {{ response.message ? response.message.substring(0, 100) + (response.message.length > 100 ? '...' : '') : 'No message' }}
                    </div>
                  </td>
                  <td>
                    <span class="collection-badge">{{ response.collection || 'Unknown' }}</span>
                  </td>
                  <td>
                    <span v-if="response.markAsRead" class="status-read">Read</span>
                    <span v-else class="status-unread">Unread</span>
                  </td>
                  <td>
                    <div class="remark-section">
                      <input 
                        v-if="!response.remark" 
                        type="text" 
                        v-model="response.tempRemark" 
                        placeholder="Add remark..."
                        class="remark-input"
                      />
                      <span v-else class="remark-text">{{ response.remark }}</span>
                      <div class="remark-actions">
                        <button 
                          v-if="!response.remark" 
                          class="btn btn-sm btn-primary" 
                          @click="saveRemark(response)"
                          :disabled="!response.tempRemark"
                        >
                          Save
                        </button>
                        <button 
                          v-else 
                          class="btn btn-sm btn-secondary" 
                          @click="editRemark(response)"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button 
                        v-if="!response.markAsRead" 
                        class="btn btn-sm btn-success" 
                        @click="markAsRead(response)"
                      >
                        Mark Read
                      </button>
                      <button 
                        v-else 
                        class="btn btn-sm btn-info" 
                        @click="markAsUnread(response)"
                      >
                        Mark Unread
                      </button>
                      <button class="btn btn-sm btn-danger" @click="deleteResponse(response)">
                        🗑️ Delete
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
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { 
  getContactResponses, 
  updateContactResponse, 
  deleteContactResponse, 
  markAsRead,
  addRemark,
  subscribeToContactResponses,
  checkExistingCollections,
  addContactResponse
} from '../firebase/contactService.js'

export default {
  name: 'Contact',
  setup() {
    const responses = ref([])
    const searchQuery = ref('')
    const clinicFilter = ref('')
    const isLoading = ref(true)

    const filteredResponses = computed(() => {
      let filtered = responses.value
      
      // Filter by clinic
      if (clinicFilter.value) {
        filtered = filtered.filter(response => response.clinic === clinicFilter.value)
      } else {
        // When "All Clinics" is selected, only show Clinic 1 and Clinic 2
        filtered = filtered.filter(response => 
          response.clinic && (
            response.clinic.toLowerCase().includes('clinic 1') || 
            response.clinic.toLowerCase().includes('clinic 2') ||
            response.clinic.toLowerCase().includes('clinic1') || 
            response.clinic.toLowerCase().includes('clinic2')
          )
        )
      }
      
      // Filter by search query
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(response => 
          response.name.toLowerCase().includes(query) ||
          response.email.toLowerCase().includes(query) ||
          (response.message && response.message.toLowerCase().includes(query)) ||
          (response.clinic && response.clinic.toLowerCase().includes(query))
        )
      }
      
      return filtered
    })

    // Extract unique clinics from contact data
    const uniqueClinics = computed(() => {
      const clinics = [...new Set(responses.value.map(response => response.clinic).filter(Boolean))]
      
      // Filter to only show Clinic 1 and Clinic 2
      const filteredClinics = clinics.filter(clinic => 
        clinic.toLowerCase().includes('clinic 1') || 
        clinic.toLowerCase().includes('clinic 2') ||
        clinic.toLowerCase().includes('clinic1') || 
        clinic.toLowerCase().includes('clinic2')
      )
      
      return filteredClinics.sort()
    })

    const markAsReadHandler = async (response) => {
      try {
        await markAsRead(response.id, response.collection)
        alert('Marked as read')
      } catch (error) {
        console.error('Error marking as read:', error)
        alert('Failed to mark as read. Please try again.')
      }
    }

    const markAsUnread = async (response) => {
      try {
        await updateContactResponse(response.id, { markAsRead: false }, response.collection)
        alert('Marked as unread')
      } catch (error) {
        console.error('Error marking as unread:', error)
        alert('Failed to mark as unread. Please try again.')
      }
    }

    const saveRemark = async (response) => {
      if (!response.tempRemark) return
      
      try {
        await addRemark(response.id, response.tempRemark, response.collection)
        response.remark = response.tempRemark
        response.tempRemark = ''
        alert('Remark saved successfully!')
      } catch (error) {
        console.error('Error saving remark:', error)
        alert('Failed to save remark. Please try again.')
      }
    }

    const editRemark = (response) => {
      response.tempRemark = response.remark
      response.remark = ''
    }

    const deleteResponseHandler = async (response) => {
      if (confirm(`Are you sure you want to delete "${response.name}"'s response?`)) {
        try {
          await deleteContactResponse(response.id, response.collection)
          alert('Response deleted successfully!')
        } catch (error) {
          console.error('Error deleting response:', error)
          alert('Failed to delete response. Please try again.')
        }
      }
    }

    // Load responses on component mount
    onMounted(async () => {
      console.log('Component mounted, starting to load contact responses...')
      
      // Set a timeout to prevent infinite loading
      const loadingTimeout = setTimeout(() => {
        if (isLoading.value) {
          console.log('Loading timeout reached, setting loading to false')
          isLoading.value = false
        }
      }, 10000) // 10 second timeout
      
      try {
        isLoading.value = true
        console.log('Fetching contact responses from all collections...')
        const fetchedResponses = await getContactResponses()
        console.log('Fetched responses:', fetchedResponses)
        console.log('Number of responses:', fetchedResponses.length)
        
        if (fetchedResponses.length === 0) {
          console.warn('No responses found in any collection')
        }
        
        responses.value = fetchedResponses
        console.log('Contact responses loaded successfully:', responses.value)
      } catch (error) {
        console.error('Error loading contact responses:', error)
        alert('Failed to load contact responses. Check console for details.')
      } finally {
        isLoading.value = false
        clearTimeout(loadingTimeout)
      }
    })

    return {
      responses,
      searchQuery,
      clinicFilter,
      uniqueClinics,
      isLoading,
      filteredResponses,
      markAsRead: markAsReadHandler,
      markAsUnread,
      saveRemark,
      editRemark,
      deleteResponse: deleteResponseHandler
    }
  }
}
</script>

<style scoped>
.contact {
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

.contact-section {
  padding: 3rem 0;
}

.responses-list-section {
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
  min-width: 150px;
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

.responses-table {
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

.response-info {
  display: flex;
  flex-direction: column;
}

.response-name {
  font-weight: 600;
  color: #2c3e50;
}

.message-preview {
  max-width: 200px;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.status-read {
  color: #28a745;
  font-weight: 600;
}

.status-unread {
  color: #dc3545;
  font-weight: 600;
}

.remark-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 200px;
}

.remark-input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
}

.remark-text {
  font-size: 0.9rem;
  color: #666;
  background: #f8f9fa;
  padding: 0.5rem;
  border-radius: 4px;
}

.remark-actions {
  display: flex;
  gap: 0.25rem;
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

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
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

.btn-success {
  background: #28a745;
  color: white;
}

.btn-success:hover {
  background: #218838;
}

.btn-info {
  background: #17a2b8;
  color: white;
}

.btn-info:hover {
  background: #138496;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
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
  
  .header-actions {
    flex-direction: column;
    gap: 1rem;
  }
  
  .clinic-filter {
    width: 100%;
  }
  
  .filter-select {
    width: 100%;
    min-width: auto;
  }
  
  .search-bar {
    width: 100%;
    max-width: none;
  }
  
  th, td {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
  }
  
  th {
    font-size: 0.75rem;
  }
  
  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.7rem;
    min-width: 50px;
  }
  
  table {
    font-size: 0.8rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Collection Badge Styles */
.collection-badge {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
</style>