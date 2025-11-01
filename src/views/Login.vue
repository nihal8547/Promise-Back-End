<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">
            <i class="fas fa-hospital logo-icon"></i>
            <h1>Promise Healthcare</h1>
            <p>Admin Dashboard</p>
          </div>
        </div>

        <div class="login-form">
          <form @submit.prevent="handleLogin">
            <div class="form-group">
              <label for="email">
                <i class="fas fa-envelope"></i>
                Email Address
              </label>
              <input
                type="email"
                id="email"
                v-model="loginForm.email"
                placeholder="Enter your email"
                required
                :disabled="isLoading"
              />
            </div>

            <div class="form-group">
              <label for="password">
                <i class="fas fa-lock"></i>
                Password
              </label>
              <div class="password-input">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="loginForm.password"
                  placeholder="Enter your password"
                  required
                  :disabled="isLoading"
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePassword"
                  :disabled="isLoading"
                >
                  <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                </button>
              </div>
            </div>

            <div class="form-options">
              <label class="remember-me">
                <input
                  type="checkbox"
                  v-model="loginForm.rememberMe"
                  :disabled="isLoading"
                />
                <span>Remember me</span>
              </label>
              <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              class="login-btn"
              :disabled="isLoading || !isFormValid"
            >
              <span v-if="isLoading" class="loading-spinner"></span>
              <i v-else class="fas fa-sign-in-alt"></i>
              {{ isLoading ? 'Signing In...' : 'Sign In' }}
            </button>
          </form>

          <div v-if="errorMessage" class="error-message">
            <i class="fas fa-exclamation-triangle"></i>
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="success-message">
            <i class="fas fa-check-circle"></i>
            {{ successMessage }}
          </div>
        </div>

        <div class="login-footer">
          <p>Don't have an account? <a href="#" @click.prevent="handleSignUp">Contact Administrator</a></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { signIn, setAuthState, getCurrentUser } from '../firebase/authService'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    
    const isLoading = ref(false)
    const showPassword = ref(false)
    const errorMessage = ref('')
    const successMessage = ref('')

    const loginForm = reactive({
      email: '',
      password: '',
      rememberMe: false
    })

    const isFormValid = computed(() => {
      return loginForm.email && loginForm.password && loginForm.email.includes('@')
    })

    const togglePassword = () => {
      showPassword.value = !showPassword.value
    }

    const handleLogin = async () => {
      if (!isFormValid.value) return

      isLoading.value = true
      errorMessage.value = ''
      successMessage.value = ''

      try {
        console.log('Attempting login with:', loginForm.email)
        
        // Use Firebase authentication
        const result = await signIn(loginForm.email, loginForm.password)
        
        console.log('Login result:', result)
        
        if (result.success) {
          successMessage.value = 'Login successful! Redirecting...'
          
          // Store authentication state
          setAuthState(result.user)
          
          if (loginForm.rememberMe) {
            localStorage.setItem('rememberMe', 'true')
            localStorage.setItem('userEmail', loginForm.email)
          } else {
            sessionStorage.setItem('userEmail', loginForm.email)
          }
          
          // The App component will handle the redirect via auth state listener
          // No need for manual redirect here
        } else {
          errorMessage.value = result.error || 'Login failed. Please try again.'
        }
      } catch (error) {
        console.error('Login error:', error)
        errorMessage.value = 'Login failed. Please try again.'
      } finally {
        isLoading.value = false
      }
    }

    const handleForgotPassword = () => {
      alert('Please contact your system administrator to reset your password.')
    }

    const handleSignUp = () => {
      alert('Please contact your system administrator to create an account.')
    }

    // Check if user is already authenticated
    onMounted(() => {
      const currentUser = getCurrentUser()
      if (currentUser) {
        console.log('User already authenticated, redirecting to dashboard')
        router.push('/')
      }
    })

    return {
      loginForm,
      isLoading,
      showPassword,
      errorMessage,
      successMessage,
      isFormValid,
      togglePassword,
      handleLogin,
      handleForgotPassword,
      handleSignUp
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.login-container {
  width: 100%;
  max-width: 420px;
  min-width: 380px;
}

.login-card {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e1e5e9;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  font-size: 2.5rem;
  color: #2563eb;
  margin-bottom: 0.5rem;
}

.logo h1 {
  font-size: 1.75rem;
  color: #1f2937;
  margin: 0;
  font-weight: 600;
  letter-spacing: -0.025em;
}

.logo p {
  color: #6b7280;
  font-size: 0.95rem;
  margin: 0;
  font-weight: 400;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #374151;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-group label i {
  color: #6b7280;
  font-size: 0.85rem;
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  background: #ffffff;
  color: #1f2937;
}

.form-group input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.form-group input:disabled {
  background: #f9fafb;
  cursor: not-allowed;
  opacity: 0.6;
}

.form-group input::placeholder {
  color: #9ca3af;
}

.password-input {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.25rem;
  color: #6b7280;
  transition: color 0.2s ease;
}

.password-toggle:hover:not(:disabled) {
  color: #2563eb;
}

.password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #6b7280;
  cursor: pointer;
}

.remember-me input {
  width: auto;
  margin: 0;
}

.forgot-password {
  color: #2563eb;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-password:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  padding: 0.875rem 1rem;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.login-btn:hover:not(:disabled) {
  background: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  background: #fef2f2;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.9rem;
  border: 1px solid #fecaca;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message i {
  font-size: 0.85rem;
}

.success-message {
  background: #f0fdf4;
  color: #16a34a;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  font-size: 0.9rem;
  border: 1px solid #bbf7d0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.success-message i {
  font-size: 0.85rem;
}

.login-footer {
  text-align: center;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.login-footer p {
  color: #6b7280;
  font-size: 0.9rem;
  margin: 0;
}

.login-footer a {
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}

/* Responsive Design */
@media (max-width: 480px) {
  .login-page {
    padding: 1rem;
  }
  
  .login-container {
    min-width: 320px;
  }
  
  .login-card {
    padding: 2rem;
  }
  
  .logo h1 {
    font-size: 1.5rem;
  }
  
  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}

@media (max-width: 360px) {
  .login-container {
    min-width: 280px;
  }
  
  .login-card {
    padding: 1.5rem;
  }
}
</style>
