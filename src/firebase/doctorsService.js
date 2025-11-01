import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage'
import { db, storage } from './config.js'

// Collection name for doctors - try both possible collection names
const COLLECTION_NAME = 'testimonials' // Based on your original code, it seems you're using 'testimonials' collection

// Add a new doctor
export const addDoctor = async (doctorData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...doctorData,
      timestamp: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding doctor:', error)
    throw error
  }
}

// Get all doctors
export const getDoctors = async () => {
  try {
    // Try with timestamp ordering first, fallback to no ordering if timestamp doesn't exist
    let q
    try {
      q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'))
    } catch (error) {
      // If timestamp field doesn't exist, get all documents without ordering
      console.log('Timestamp field not found, fetching without ordering')
      q = collection(db, COLLECTION_NAME)
    }
    
    const querySnapshot = await getDocs(q)
    const doctors = []
    querySnapshot.forEach((doc) => {
      doctors.push({
        id: doc.id,
        ...doc.data()
      })
    })
    return doctors
  } catch (error) {
    console.error('Error getting doctors:', error)
    throw error
  }
}

// Update a doctor
export const updateDoctor = async (doctorId, updateData) => {
  try {
    const doctorRef = doc(db, COLLECTION_NAME, doctorId)
    await updateDoc(doctorRef, updateData)
  } catch (error) {
    console.error('Error updating doctor:', error)
    throw error
  }
}

// Delete a doctor
export const deleteDoctor = async (doctorId) => {
  try {
    const doctorRef = doc(db, COLLECTION_NAME, doctorId)
    await deleteDoc(doctorRef)
  } catch (error) {
    console.error('Error deleting doctor:', error)
    throw error
  }
}

// Upload image to Firebase Storage
export const uploadDoctorImage = async (file, doctorId) => {
  try {
    // Check file size (2 MB = 2 * 1024 * 1024 bytes)
    const maxSizeInBytes = 2 * 1024 * 1024 // 2 MB
    if (file.size > maxSizeInBytes) {
      throw new Error('File size exceeds 2 MB. Please select a smaller file.')
    }

    const imageRef = ref(storage, `doctors/${doctorId}/${Date.now()}_${file.name}`)
    const snapshot = await uploadBytes(imageRef, file)
    const imageUrl = await getDownloadURL(snapshot.ref)
    return imageUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Listen to real-time updates
export const subscribeToDoctors = (callback) => {
  try {
    // Try with timestamp ordering first
    const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'))
    return onSnapshot(q, (snapshot) => {
      const doctors = []
      snapshot.forEach((doc) => {
        doctors.push({
          id: doc.id,
          ...doc.data()
        })
      })
      callback(doctors)
    })
  } catch (error) {
    // If timestamp field doesn't exist, listen without ordering
    console.log('Timestamp field not found, listening without ordering')
    return onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
      const doctors = []
      snapshot.forEach((doc) => {
        doctors.push({
          id: doc.id,
          ...doc.data()
        })
      })
      callback(doctors)
    })
  }
}
