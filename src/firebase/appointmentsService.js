import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './config.js'

// Appointments service for managing appointment bookings

// Get all appointments
export const getAppointments = async () => {
  try {
    console.log('Fetching appointments from Firebase...')
    const appointmentsRef = collection(db, 'appointments')
    const q = query(appointmentsRef, orderBy('timestamp', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const appointments = []
    querySnapshot.forEach((doc) => {
      appointments.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    console.log('Appointments fetched successfully:', appointments)
    return appointments
  } catch (error) {
    console.error('Error fetching appointments:', error)
    throw error
  }
}

// Add new appointment
export const addAppointment = async (appointmentData) => {
  try {
    console.log('Adding new appointment:', appointmentData)
    
    // Prepare appointment data for Firestore
    const appointmentDoc = {
      name: appointmentData.name.trim(),
      phone: appointmentData.phone.trim(),
      email: appointmentData.email ? appointmentData.email.trim() : '',
      clinic: appointmentData.clinic,
      treatment: appointmentData.treatment,
      message: appointmentData.message ? appointmentData.message.trim() : '',
      timestamp: serverTimestamp(),
      status: 'pending',
      createdAt: new Date()
    }
    
    const docRef = await addDoc(collection(db, 'appointments'), appointmentDoc)
    console.log('Appointment added successfully with ID:', docRef.id)
    
    return {
      success: true,
      id: docRef.id,
      message: 'Appointment booked successfully!'
    }
  } catch (error) {
    console.error('Error adding appointment:', error)
    return {
      success: false,
      error: error.message,
      message: 'Failed to book appointment'
    }
  }
}

// Update appointment status
export const updateAppointmentStatus = async (appointmentId, status) => {
  try {
    console.log('Updating appointment status:', appointmentId, status)
    
    const updateData = {
      status: status,
      updatedAt: new Date()
    }
    
    await updateDoc(doc(db, 'appointments', appointmentId), updateData)
    console.log('Appointment status updated successfully')
    
    return {
      success: true,
      message: 'Appointment status updated successfully!'
    }
  } catch (error) {
    console.error('Error updating appointment status:', error)
    return {
      success: false,
      error: error.message,
      message: 'Failed to update appointment status'
    }
  }
}

// Update appointment details
export const updateAppointment = async (appointmentId, updateData) => {
  try {
    console.log('Updating appointment:', appointmentId, updateData)
    
    const appointmentUpdate = {
      ...updateData,
      updatedAt: new Date()
    }
    
    await updateDoc(doc(db, 'appointments', appointmentId), appointmentUpdate)
    console.log('Appointment updated successfully')
    
    return {
      success: true,
      message: 'Appointment updated successfully!'
    }
  } catch (error) {
    console.error('Error updating appointment:', error)
    return {
      success: false,
      error: error.message,
      message: 'Failed to update appointment'
    }
  }
}

// Delete appointment
export const deleteAppointment = async (appointmentId) => {
  try {
    console.log('Deleting appointment:', appointmentId)
    await deleteDoc(doc(db, 'appointments', appointmentId))
    console.log('Appointment deleted successfully')
    
    return {
      success: true,
      message: 'Appointment deleted successfully!'
    }
  } catch (error) {
    console.error('Error deleting appointment:', error)
    return {
      success: false,
      error: error.message,
      message: 'Failed to delete appointment'
    }
  }
}

// Clear all appointments
export const clearAllAppointments = async () => {
  try {
    console.log('Clearing all appointments...')
    const querySnapshot = await getDocs(collection(db, 'appointments'))
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    
    console.log('All appointments cleared successfully')
    return {
      success: true,
      message: 'All appointments cleared successfully!'
    }
  } catch (error) {
    console.error('Error clearing all appointments:', error)
    return {
      success: false,
      error: error.message,
      message: 'Failed to clear all appointments'
    }
  }
}

// Subscribe to real-time updates
export const subscribeToAppointments = (callback) => {
  try {
    console.log('Setting up real-time appointments listener...')
    const appointmentsRef = collection(db, 'appointments')
    const q = query(appointmentsRef, orderBy('timestamp', 'desc'))
    
    return onSnapshot(q, (snapshot) => {
      const appointments = []
      snapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      console.log('Real-time appointments update:', appointments)
      callback(appointments)
    })
  } catch (error) {
    console.error('Error setting up appointments listener:', error)
    throw error
  }
}

// Get appointments by status
export const getAppointmentsByStatus = async (status) => {
  try {
    console.log('Fetching appointments by status:', status)
    const appointmentsRef = collection(db, 'appointments')
    const q = query(appointmentsRef, orderBy('timestamp', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const appointments = []
    querySnapshot.forEach((doc) => {
      const data = doc.data()
      if (data.status === status) {
        appointments.push({
          id: doc.id,
          ...data
        })
      }
    })
    
    console.log(`Appointments with status '${status}' fetched:`, appointments)
    return appointments
  } catch (error) {
    console.error('Error fetching appointments by status:', error)
    throw error
  }
}

// Form validation functions
export const validateAppointmentForm = (formData) => {
  const errors = {}
  
  // Validate name
  if (!formData.name || formData.name.trim().length < 3) {
    errors.name = 'Name must be at least 3 characters'
  }
  
  // Validate phone
  if (!formData.phone) {
    errors.phone = 'Phone number is required'
  } else {
    const phoneRegex = /^[0-9]{8,15}$/
    if (!phoneRegex.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Please enter a valid phone number'
    }
  }
  
  // Validate email (optional)
  if (formData.email && formData.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }
  }
  
  // Validate clinic
  if (!formData.clinic) {
    errors.clinic = 'Please select a clinic'
  }
  
  // Validate treatment
  if (!formData.treatment) {
    errors.treatment = 'Please select a treatment'
  }
  
  return errors
}
