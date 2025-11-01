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
import { db } from './config.js'

// Collection name for contact form responses
const COLLECTION_NAME = 'formResponses'

// Check all possible collections for existing data
export const checkExistingCollections = async () => {
  const possibleCollections = ['formResponses', 'contacts', 'contact-form', 'messages']
  const results = {}
  
  for (const collectionName of possibleCollections) {
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

// Add a new contact form response
export const addContactResponse = async (responseData) => {
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...responseData,
      timestamp: new Date(),
      markAsRead: false
    })
    return docRef.id
  } catch (error) {
    console.error('Error adding contact response:', error)
    throw error
  }
}

// Get all contact responses from all collections
export const getContactResponses = async () => {
  try {
    console.log('Fetching contact responses from all collections...')
    
    const collections = [
      'formResponses', 
      'clinic1Responses', 
      'clinic2Responses', 
      'clinic3Responses', 
      'clinic4Responses',
      'contactResponses', // Keep the original collection as fallback
      'contacts',
      'contact-form',
      'messages'
    ]
    
    let allResponses = []
    
    for (const collectionName of collections) {
      try {
        console.log(`Fetching from collection: ${collectionName}`)
        const querySnapshot = await getDocs(collection(db, collectionName))
        console.log(`Query snapshot size: ${querySnapshot.size} for ${collectionName}`)
        
        const responses = querySnapshot.docs.map(doc => {
          const data = doc.data()
          console.log(`Document ${doc.id} from ${collectionName}:`, data)
          
          // Normalize data structure for different collection formats
          const normalizedData = {
            id: doc.id,
            name: data.name || data.fullName || data.patientName || 'Unknown',
            email: data.email || data.emailAddress || '',
            number: data.number || data.phone || data.phoneNumber || data.mobile || '',
            clinic: data.clinic || data.clinicName || data.location || 'N/A',
            message: data.message || data.comment || data.notes || data.description || '',
            timestamp: data.timestamp || data.createdAt || data.date || new Date(),
            markAsRead: data.markAsRead || data.isRead || false,
            remark: data.remark || data.notes || '',
            collection: collectionName
          }
          
          return normalizedData
        })
        
        allResponses = allResponses.concat(responses)
        console.log(`Found ${responses.length} responses in ${collectionName}`)
      } catch (error) {
        console.log(`Collection ${collectionName} not found or error:`, error.message)
        // Continue with other collections even if one fails
      }
    }
    
    // Sort by timestamp (newest first)
    allResponses.sort((a, b) => {
      const timestampA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp || 0)
      const timestampB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp || 0)
      return timestampB - timestampA
    })
    
    console.log(`Total responses fetched: ${allResponses.length}`)
    console.log('Sample responses:', allResponses.slice(0, 3))
    return allResponses
  } catch (error) {
    console.error('Error fetching contact responses:', error)
    throw error
  }
}

// Update a contact response
export const updateContactResponse = async (responseId, updateData, collectionName = COLLECTION_NAME) => {
  try {
    const responseRef = doc(db, collectionName, responseId)
    await updateDoc(responseRef, updateData)
  } catch (error) {
    console.error('Error updating contact response:', error)
    throw error
  }
}

// Mark response as read
export const markAsRead = async (responseId, collectionName = COLLECTION_NAME) => {
  try {
    const responseRef = doc(db, collectionName, responseId)
    await updateDoc(responseRef, { markAsRead: true })
  } catch (error) {
    console.error('Error marking response as read:', error)
    throw error
  }
}

// Add remark to response
export const addRemark = async (responseId, remark, collectionName = COLLECTION_NAME) => {
  try {
    const responseRef = doc(db, collectionName, responseId)
    await updateDoc(responseRef, { remark: remark })
  } catch (error) {
    console.error('Error adding remark:', error)
    throw error
  }
}

// Delete a contact response
export const deleteContactResponse = async (responseId, collectionName = COLLECTION_NAME) => {
  try {
    const responseRef = doc(db, collectionName, responseId)
    await deleteDoc(responseRef)
  } catch (error) {
    console.error('Error deleting contact response:', error)
    throw error
  }
}

// Listen to real-time updates
export const subscribeToContactResponses = (callback) => {
  try {
    // Try with timestamp ordering first
    const q = query(collection(db, COLLECTION_NAME), orderBy('timestamp', 'desc'))
    return onSnapshot(q, (snapshot) => {
      const responses = []
      snapshot.forEach((doc) => {
        responses.push({
          id: doc.id,
          ...doc.data()
        })
      })
      callback(responses)
    })
  } catch (error) {
    // If timestamp field doesn't exist, listen without ordering
    console.log('Timestamp field not found, listening without ordering')
    return onSnapshot(collection(db, COLLECTION_NAME), (snapshot) => {
      const responses = []
      snapshot.forEach((doc) => {
        responses.push({
          id: doc.id,
          ...doc.data()
        })
      })
      callback(responses)
    })
  }
}
