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

// Collection name for offers - try multiple possible names
const POSSIBLE_COLLECTIONS = ['offers', 'gallery', 'packages', 'special-offers']
const COLLECTION_NAME = 'offers' // Default collection name

// Add a new offer
export const addOffer = async (offerData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...offerData,
      timestamp: new Date()
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding offer:', error)
    throw error
  }
}

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

// Get all offers
export const getOffers = async () => {
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
    const offers = []
    querySnapshot.forEach((doc) => {
      offers.push({
        id: doc.id,
        ...doc.data()
      })
    })
    return offers
  } catch (error) {
    console.error('Error getting offers:', error)
    throw error
  }
}

// Update an offer
export const updateOffer = async (offerId, updateData) => {
  try {
    const offerRef = doc(db, COLLECTION_NAME, offerId)
    await updateDoc(offerRef, updateData)
  } catch (error) {
    console.error('Error updating offer:', error)
    throw error
  }
}

// Delete an offer
export const deleteOffer = async (offerId) => {
  try {
    const offerRef = doc(db, COLLECTION_NAME, offerId)
    await deleteDoc(offerRef)
  } catch (error) {
    console.error('Error deleting offer:', error)
    throw error
  }
}

// Upload image to Firebase Storage
export const uploadOfferImage = async (file, offerId) => {
  try {
    // Check file size (2 MB = 2 * 1024 * 1024 bytes)
    const maxSizeInBytes = 2 * 1024 * 1024 // 2 MB
    if (file.size > maxSizeInBytes) {
      throw new Error('File size exceeds 2 MB. Please select a smaller file.')
    }

    const imageRef = ref(storage, `offers/${offerId}/${Date.now()}_${file.name}`)
    const snapshot = await uploadBytes(imageRef, file)
    const imageUrl = await getDownloadURL(snapshot.ref)
    return imageUrl
  } catch (error) {
    console.error('Error uploading image:', error)
    throw error
  }
}

// Listen to real-time updates
export const subscribeToOffers = (callback) => {
  try {
    // Try with timestamp ordering first
    const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'))
    return onSnapshot(q, (snapshot) => {
      const offers = []
      snapshot.forEach((doc) => {
        offers.push({
          id: doc.id,
          ...doc.data()
        })
      })
      callback(offers)
    })
  } catch (error) {
    // If timestamp field doesn't exist, listen without ordering
    console.log('Timestamp field not found, listening without ordering')
    return onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
      const offers = []
      snapshot.forEach((doc) => {
        offers.push({
          id: doc.id,
          ...doc.data()
        })
      })
      callback(offers)
    })
  }
}
