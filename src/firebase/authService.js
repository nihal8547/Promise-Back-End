import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { auth } from './config.js'

// Authentication service for managing user login/logout

// Sign in with email and password
export const signIn = async (email, password) => {
  try {
    console.log('Firebase signIn called with email:', email)
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    console.log('Firebase signIn successful:', userCredential.user)
    return {
      success: true,
      user: userCredential.user,
      message: 'Login successful'
    }
  } catch (error) {
    console.error('Firebase signIn error:', error)
    return {
      success: false,
      error: getErrorMessage(error.code),
      message: 'Login failed'
    }
  }
}

// Sign up with email and password
export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    return {
      success: true,
      user: userCredential.user,
      message: 'Account created successfully'
    }
  } catch (error) {
    console.error('Sign up error:', error)
    return {
      success: false,
      error: getErrorMessage(error.code),
      message: 'Account creation failed'
    }
  }
}

// Sign out current user
export const signOutUser = async () => {
  try {
    await signOut(auth)
    return {
      success: true,
      message: 'Signed out successfully'
    }
  } catch (error) {
    console.error('Sign out error:', error)
    return {
      success: false,
      error: error.message,
      message: 'Sign out failed'
    }
  }
}

// Send password reset email
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email)
    return {
      success: true,
      message: 'Password reset email sent'
    }
  } catch (error) {
    console.error('Password reset error:', error)
    return {
      success: false,
      error: getErrorMessage(error.code),
      message: 'Password reset failed'
    }
  }
}

// Get current user
export const getCurrentUser = () => {
  return auth.currentUser
}

// Listen to authentication state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback)
}

// Check if user is authenticated
export const isAuthenticated = () => {
  return !!auth.currentUser
}

// Get user-friendly error messages
const getErrorMessage = (errorCode) => {
  const errorMessages = {
    'auth/user-not-found': 'No user found with this email address',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This user account has been disabled',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/network-request-failed': 'Network error. Please check your connection',
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/weak-password': 'Password should be at least 6 characters',
    'auth/invalid-credential': 'Invalid email or password',
    'auth/operation-not-allowed': 'This operation is not allowed',
    'auth/requires-recent-login': 'Please log in again to complete this action'
  }
  
  return errorMessages[errorCode] || 'An error occurred. Please try again'
}

// Store authentication state in localStorage
export const setAuthState = (user) => {
  if (user) {
    // Standard user data for email authentication
    const userData = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      providerId: 'password',
      firstName: user.displayName ? user.displayName.split(' ')[0] : '',
      lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
      fullName: user.displayName || '',
      profilePicture: user.photoURL || '',
      isGoogleUser: false,
      loginMethod: 'email'
    }
    
    console.log('Storing user data:', userData)
    localStorage.setItem('authUser', JSON.stringify(userData))
  } else {
    localStorage.removeItem('authUser')
  }
}

// Get authentication state from localStorage
export const getAuthState = () => {
  const userData = localStorage.getItem('authUser')
  return userData ? JSON.parse(userData) : null
}

// Clear authentication state
export const clearAuthState = () => {
  localStorage.removeItem('authUser')
  sessionStorage.clear()
}

// Demo authentication for development (bypasses Firebase)
export const demoSignIn = async (email, password) => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Accept any email/password for demo purposes
  if (email && password) {
    console.log('Demo signIn successful for:', email)
    return {
      success: true,
      user: {
        uid: 'demo-user-' + Date.now(),
        email: email,
        displayName: email.split('@')[0]
      },
      message: 'Demo login successful'
    }
  } else {
    console.log('Demo signIn failed - missing credentials')
    return {
      success: false,
      error: 'Please enter email and password',
      message: 'Demo login failed'
    }
  }
}

// Create a test user for development
export const createTestUser = async (email, password) => {
  try {
    console.log('Creating test user:', email)
    const result = await signUp(email, password)
    console.log('Test user creation result:', result)
    return result
  } catch (error) {
    console.error('Test user creation error:', error)
    return {
      success: false,
      error: error.message,
      message: 'Test user creation failed'
    }
  }
}