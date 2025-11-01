<template>
  <div id="app">
    <div class="app-container">
      <!-- Sidebar Navigation - Only show when not on login page -->
      <nav v-if="!isLoginPage" class="sidebar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
        <div class="sidebar-header">
          <router-link to="/" class="logo">
            <h2>Promise Admin</h2>
          </router-link>
          <button class="sidebar-toggle" @click="toggleSidebar">
            <span class="hamburger"></span>
            <span class="hamburger"></span>
            <span class="hamburger"></span>
          </button>
        </div>
        
        <div class="sidebar-menu">
          <router-link to="/" class="menu-item" @click="closeSidebar">
            <i class="menu-icon fas fa-chart-pie"></i>
            <span class="menu-text">Dashboard</span>
          </router-link>
          
          <router-link to="/doctors" class="menu-item" @click="closeSidebar">
            <i class="menu-icon fas fa-user-md"></i>
            <span class="menu-text">Manage Doctors</span>
          </router-link>
          
          <router-link to="/offers" class="menu-item" @click="closeSidebar">
            <i class="menu-icon fas fa-gift"></i>
            <span class="menu-text">Manage Offers</span>
          </router-link>
          
          <router-link to="/treatments" class="menu-item" @click="closeSidebar">
            <i class="menu-icon fas fa-stethoscope"></i>
            <span class="menu-text">Manage Treatments</span>
          </router-link>
          
          <router-link to="/appointments" class="menu-item" @click="closeSidebar">
            <i class="menu-icon fas fa-calendar-check"></i>
            <span class="menu-text">Manage Appointments</span>
          </router-link>
          
          <router-link to="/testimonials" class="menu-item" @click="closeSidebar">
            <i class="menu-icon fas fa-comments"></i>
            <span class="menu-text">Manage Reviews</span>
          </router-link>
          
          <router-link to="/contact" class="menu-item" @click="closeSidebar">
            <i class="menu-icon fas fa-envelope"></i>
            <span class="menu-text">Contact Messages</span>
          </router-link>
        </div>
        
        <!-- Sidebar Footer -->
        <div class="sidebar-footer" v-if="currentUser">
          <div class="user-profile-card">
            <div class="user-avatar-large">
              <img v-if="currentUser.profilePicture || currentUser.photoURL" :src="currentUser.profilePicture || currentUser.photoURL" :alt="currentUser.fullName || currentUser.displayName || currentUser.email" class="avatar-img">
              <span v-else class="avatar-placeholder">{{ (currentUser.fullName || currentUser.displayName || currentUser.email).charAt(0).toUpperCase() }}</span>
            </div>
            <div class="user-details-card">
              <div class="user-name">{{ currentUser.fullName || currentUser.displayName || 'User' }}</div>
              <div class="user-email">{{ currentUser.email }}</div>
              <div class="user-status">
                <span class="status-dot"></span>
                <span class="status-text">Online</span>
              </div>
            </div>
          </div>
          <button class="logout-btn-modern" @click="showLogoutModal = true" :disabled="isLoggingOut">
            <div class="logout-btn-content">
              <i class="fas fa-sign-out-alt"></i>
              <span>Logout</span>
            </div>
            <div v-if="isLoggingOut" class="logout-loading">
              <div class="loading-spinner-small"></div>
            </div>
          </button>
        </div>
        
      </nav>

      <!-- Main Content -->
      <main class="main-content" :class="{ 
        'sidebar-open': sidebarCollapsed && !isLoginPage,
        'login-page': isLoginPage 
      }">
        <router-view />
      </main>
    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutModal" class="modal-overlay" @click="showLogoutModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirm Logout</h3>
          <button class="modal-close" @click="showLogoutModal = false">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <p>Are you sure you want to logout?</p>
          <div class="user-info-modal">
            <div class="user-avatar">
              <img v-if="currentUser?.profilePicture || currentUser?.photoURL" :src="currentUser.profilePicture || currentUser.photoURL" :alt="currentUser.fullName || currentUser.displayName || currentUser.email" class="avatar-img">
              <span v-else class="avatar-placeholder">{{ (currentUser?.fullName || currentUser?.displayName || currentUser?.email)?.charAt(0)?.toUpperCase() }}</span>
            </div>
            <div class="user-details">
              <div class="user-name">{{ currentUser?.fullName || currentUser?.displayName || 'User' }}</div>
              <div class="user-email">{{ currentUser?.email }}</div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showLogoutModal = false" :disabled="isLoggingOut">
            Cancel
          </button>
          <button class="btn btn-danger" @click="confirmLogout" :disabled="isLoggingOut">
            <span v-if="isLoggingOut" class="loading-spinner"></span>
            <i v-else class="fas fa-sign-out-alt"></i>
            {{ isLoggingOut ? 'Logging out...' : 'Logout' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChange, signOutUser, clearAuthState } from './firebase/authService'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const sidebarCollapsed = ref(false)
    const currentUser = ref(null)
    const isLoggingOut = ref(false)
    const showLogoutModal = ref(false)

    // Computed property to check if we're on the login page
    const isLoginPage = computed(() => {
      return router.currentRoute.value.path === '/login'
    })

    const toggleSidebar = () => {
      sidebarCollapsed.value = !sidebarCollapsed.value
    }

    const closeSidebar = () => {
      if (window.innerWidth <= 768) {
        sidebarCollapsed.value = false
      }
    }

    const handleResize = () => {
      if (window.innerWidth > 768) {
        sidebarCollapsed.value = false
      }
    }

    const handleLogout = async () => {
      // This function is now called from the modal
      isLoggingOut.value = true
      
      try {
        // Sign out from Firebase
        await signOutUser()
        
        // Clear local state
        clearAuthState()
        currentUser.value = null
        
        // Show success message briefly
        console.log('Logout successful')
        
        // Redirect to login page
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        
        // Force logout even if Firebase fails
        clearAuthState()
        currentUser.value = null
        
        // Show error message
        alert('Logout completed (with some issues). You have been signed out.')
        
        // Redirect to login page
        router.push('/login')
      } finally {
        isLoggingOut.value = false
        showLogoutModal.value = false
      }
    }

    const confirmLogout = () => {
      handleLogout()
    }

    const checkAuthState = () => {
      // Set up Firebase auth state listener
      const unsubscribe = onAuthStateChange((user) => {
        console.log('Auth state changed:', user ? 'User logged in' : 'User logged out')
        
        if (user) {
          currentUser.value = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL
          }
          
          // If user is authenticated and on login page, redirect to dashboard
          if (router.currentRoute.value.path === '/login') {
            console.log('User authenticated, redirecting to dashboard')
            router.push('/')
          }
        } else {
          currentUser.value = null
          
          // Only redirect to login if not already on login page
          if (router.currentRoute.value.path !== '/login') {
            console.log('User not authenticated, redirecting to login')
            router.push('/login')
          }
        }
      })

      // Return unsubscribe function for cleanup
      return unsubscribe
    }

    let unsubscribeAuth = null

    onMounted(() => {
      console.log('App component mounted')
      window.addEventListener('resize', handleResize)
      handleResize()
      unsubscribeAuth = checkAuthState()
    })

    onUnmounted(() => {
      window.removeEventListener('resize', handleResize)
      if (unsubscribeAuth) {
        unsubscribeAuth()
      }
    })

    return {
      sidebarCollapsed,
      currentUser,
      isLoggingOut,
      showLogoutModal,
      isLoginPage,
      toggleSidebar,
      closeSidebar,
      handleLogout,
      confirmLogout
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background: #f8f9fa;
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
}

.app-container {
  display: flex;
  min-height: 100vh;
}

/* Sidebar Styles */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 100%);
  color: white;
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  transition: all 0.3s ease;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sidebar-collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid #34495e;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  text-decoration: none;
  color: white;
}

.logo h2 {
  color: #667eea;
  font-weight: 600;
  font-size: 1.3rem;
  transition: opacity 0.3s ease;
}

.sidebar-collapsed .logo h2 {
  opacity: 0;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.1);
}

.hamburger {
  display: block;
  width: 20px;
  height: 2px;
  background: white;
  margin: 3px 0;
  transition: 0.3s;
}

.sidebar-menu {
  padding: 1rem 0;
  flex: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.menu-item:hover,
.menu-item.router-link-active {
  background: rgba(102, 126, 234, 0.2);
  border-left-color: #667eea;
}

.menu-icon {
  font-size: 1.2rem;
  margin-right: 1rem;
  min-width: 20px;
}

.menu-text {
  transition: opacity 0.3s ease;
}

.sidebar-collapsed .menu-text {
  opacity: 0;
}

/* Sidebar Footer */
.sidebar-footer {
  margin-top: auto;
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.1);
}

.user-profile-card {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
}

.user-profile-card:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-1px);
}

.user-avatar-large {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.user-avatar-large .avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-avatar-large .avatar-placeholder {
  color: white;
  font-weight: 700;
  font-size: 1.3rem;
}

.user-details-card {
  flex: 1;
  min-width: 0;
}

.user-details-card .user-name {
  font-weight: 600;
  color: white;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-details-card .user-email {
  font-size: 0.85rem;
  color: #bdc3c7;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #28a745;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(40, 167, 69, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(40, 167, 69, 0);
  }
}

.status-text {
  font-size: 0.8rem;
  color: #28a745;
  font-weight: 500;
}

.logout-btn-modern {
  width: 100%;
  padding: 0.875rem 1rem;
  background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  border: none;
  border-radius: 10px;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
}

.logout-btn-modern:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
  background: linear-gradient(135deg, #c0392b 0%, #a93226 100%);
}

.logout-btn-modern:active:not(:disabled) {
  transform: translateY(0);
}

.logout-btn-modern:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.logout-btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: opacity 0.3s ease;
}

.logout-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loading-spinner-small {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Collapsed sidebar styles for footer */
.sidebar-collapsed .user-profile-card {
  flex-direction: column;
  text-align: center;
  padding: 0.75rem;
}

.sidebar-collapsed .user-avatar-large {
  margin-right: 0;
  margin-bottom: 0.5rem;
  width: 40px;
  height: 40px;
}

.sidebar-collapsed .user-details-card {
  display: none;
}

.sidebar-collapsed .logout-btn-modern {
  padding: 0.75rem 0.5rem;
}

.sidebar-collapsed .logout-btn-content span {
  display: none;
}

.menu-divider {
  height: 1px;
  background: #34495e;
  margin: 1rem 0;
}

/* Old user info styles removed - replaced with modern footer design */

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

.sidebar-collapsed .user-text {
  opacity: 0;
}

.sidebar-collapsed .user-text-info {
  opacity: 0;
}

.sidebar-collapsed .user-avatar {
  margin-right: 0;
}


/* Main Content Styles */
.main-content {
  flex: 1;
  margin-left: 280px;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  width: calc(100vw - 280px);
}

.sidebar-open {
  margin-left: 70px;
  width: calc(100vw - 70px);
}

.login-page {
  margin-left: 0 !important;
  width: 100vw !important;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    width: 280px;
  }
  
  .sidebar-collapsed {
    transform: translateX(0);
  }
  
  .main-content {
    margin-left: 0;
    width: 100vw;
  }
  
  .sidebar-open {
    margin-left: 0;
    width: 100vw;
  }
  
  .login-page {
    margin-left: 0 !important;
    width: 100vw !important;
  }
  
  .sidebar-toggle {
    display: block;
  }
}

@media (min-width: 769px) {
  .sidebar-toggle {
    display: none;
  }
}

/* Overlay for mobile */
@media (max-width: 768px) {
  .sidebar-collapsed::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }
}

/* Scrollbar Styling */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-track {
  background: #2c3e50;
}

.sidebar::-webkit-scrollbar-thumb {
  background: #667eea;
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: #5a6fd8;
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
  z-index: 2000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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
  font-size: 1.3rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.2rem;
  color: #666;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: #f8f9fa;
  color: #333;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0 0 1rem 0;
  color: #666;
  font-size: 1rem;
}

.user-info-modal {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  margin-top: 1rem;
}

.user-info-modal .user-avatar {
  margin-right: 1rem;
}

.user-info-modal .user-details {
  flex: 1;
}

.user-info-modal .user-name {
  color: #2c3e50;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.user-info-modal .user-email {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c82333;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>