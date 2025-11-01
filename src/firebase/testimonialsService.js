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

// Collection name for testimonials - try multiple possible names
const POSSIBLE_COLLECTIONS = ['reviews', 'testimonials', 'testimonials-data']
const COLLECTION_NAME = 'reviews' // Default collection name based on your code

// Check all possible collections for existing data
export const checkExistingCollections = async () => {
  const results = {}
  
  for (const collectionName of POSSIBLE_COLLECTIONS) {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName))
      const docs = []
      querySnapshot.forEach((doc) => {
        docs.push({
          id: doc.id,
          ...doc.data()
        })
      })
      results[collectionName] = docs
      console.log(`Collection '${collectionName}' has ${docs.length} documents:`, docs)
    } catch (error) {
      console.log(`Collection '${collectionName}' error:`, error.message)
      results[collectionName] = []
    }
  }
  
  return results
}

// Add a new testimonial
export const addTestimonial = async (testimonialData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...testimonialData,
      timestamp: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding testimonial:', error)
    throw error
  }
}

// Get all testimonials
export const getTestimonials = async () => {
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
    const testimonials = []
    querySnapshot.forEach((doc) => {
      testimonials.push({
        id: doc.id,
        ...doc.data()
      })
    })
    return testimonials
  } catch (error) {
    console.error('Error getting testimonials:', error)
    throw error
  }
}

// Update a testimonial
export const updateTestimonial = async (testimonialId, updateData) => {
  try {
    const testimonialRef = doc(db, COLLECTION_NAME, testimonialId)
    await updateDoc(testimonialRef, updateData)
  } catch (error) {
    console.error('Error updating testimonial:', error)
    throw error
  }
}

// Delete a testimonial
export const deleteTestimonial = async (testimonialId) => {
  try {
    const testimonialRef = doc(db, COLLECTION_NAME, testimonialId)
    await deleteDoc(testimonialRef)
  } catch (error) {
    console.error('Error deleting testimonial:', error)
    throw error
  }
}

// Upload image to Firebase Storage
export const uploadTestimonialImage = async (file, testimonialId) => {
  try {
    // Check file size (2 MB = 2 * 1024 * 1024 bytes)
    const maxSizeInBytes = 2 * 1024 * 1024 // 2 MB
    if (file.size > maxSizeInBytes) {
      throw new Error('File size exceeds 2 MB. Please select a smaller file.')
    }

    const imageRef = ref(storage, `reviews/${testimonialId}/${Date.now()}_${file.name}`)
    const snapshot = await uploadBytes(imageRef, file)
    const imageUrl = await getDownloadURL(snapshot.ref)
    return imageUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Listen to real-time updates
export const subscribeToTestimonials = (callback) => {
  try {
    // Try with timestamp ordering first
    const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'))
    return onSnapshot(q, (snapshot) => {
      const testimonials = []
      snapshot.forEach((doc) => {
        testimonials.push({
          id: doc.id,
          ...doc.data()
        })
      })
      callback(testimonials)
    })
  } catch (error) {
    // If timestamp field doesn't exist, listen without ordering
    console.log('Timestamp field not found, listening without ordering')
    return onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
      const testimonials = []
      snapshot.forEach((doc) => {
        testimonials.push({
          id: doc.id,
          ...doc.data()
        })
      })
      callback(testimonials)
    })
  }
}
