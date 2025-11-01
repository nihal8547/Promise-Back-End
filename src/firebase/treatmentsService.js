import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  onSnapshot,
  query,
  orderBy 
} from 'firebase/firestore'
import { 
  ref, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage'
import { db, storage } from './config.js'

// Treatments service for managing treatment data

// Get all treatments
export const getTreatments = async () => {
  try {
    console.log('Fetching treatments from Firebase...')
    const treatmentsRef = collection(db, 'treatments')
    const q = query(treatmentsRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const treatments = []
    querySnapshot.forEach((doc) => {
      treatments.push({
        id: doc.id,
        ...doc.data()
      })
    })
    
    console.log('Treatments fetched successfully:', treatments)
    return treatments
  } catch (error) {
    console.error('Error fetching treatments:', error)
    throw error
  }
}

// Add new treatment
export const addTreatment = async (treatmentData) => {
  try {
    console.log('Adding new treatment:', treatmentData)
    
    // Upload image to Firebase Storage if provided
    let imageUrl = ''
    if (treatmentData.imageFile) {
      imageUrl = await uploadTreatmentImage(treatmentData.imageFile)
    }
    
    // Prepare treatment data for Firestore
    const treatmentDoc = {
      title: treatmentData.title,
      description: treatmentData.description,
      duration: treatmentData.duration,
      price: parseFloat(treatmentData.price),
      recovery: treatmentData.recovery,
      benefits: [
        treatmentData.benefit1,
        treatmentData.benefit2,
        treatmentData.benefit3
      ].filter(benefit => benefit && benefit.trim() !== ''),
      image: imageUrl,
      createdAt: new Date()
    }
    
    const docRef = await addDoc(collection(db, 'treatments'), treatmentDoc)
    console.log('Treatment added successfully with ID:', docRef.id)
    
    return {
      success: true,
      id: docRef.id,
      message: 'Treatment added successfully!'
    }
  } catch (error) {
    console.error('Error adding treatment:', error)
    return {
      success: false,
      error: error.message,
      message: 'Failed to add treatment'
    }
  }
}

// Update treatment
export const updateTreatment = async (treatmentId, updateData) => {
  try {
    console.log('Updating treatment:', treatmentId, updateData)
    
    // Upload new image if provided
    if (updateData.imageFile) {
      updateData.image = await uploadTreatmentImage(updateData.imageFile)
      delete updateData.imageFile
    }
    
    // Prepare update data
    const updateDocData = {
      ...updateData,
      updatedAt: new Date()
    }
    
    await updateDoc(doc(db, 'treatments', treatmentId), updateDocData)
    console.log('Treatment updated successfully')
    
    return {
      success: true,
      message: 'Treatment updated successfully!'
    }
  } catch (error) {
    console.error('Error updating treatment:', error)
    return {
      success: false,
      error: error.message,
      message: 'Failed to update treatment'
    }
  }
}

// Delete treatment
export const deleteTreatment = async (treatmentId) => {
  try {
    console.log('Deleting treatment:', treatmentId)
    await deleteDoc(doc(db, 'treatments', treatmentId))
    console.log('Treatment deleted successfully')
    
    return {
      success: true,
      message: 'Treatment deleted successfully!'
    }
  } catch (error) {
    console.error('Error deleting treatment:', error)
    return {
      success: false,
      error: error.message,
      message: 'Failed to delete treatment'
    }
  }
}

// Clear all treatments
export const clearAllTreatments = async () => {
  try {
    console.log('Clearing all treatments...')
    const querySnapshot = await getDocs(collection(db, 'treatments'))
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
    
    console.log('All treatments cleared successfully')
    return {
      success: true,
      message: 'All treatments cleared successfully!'
    }
  } catch (error) {
    console.error('Error clearing all treatments:', error)
    return {
      success: false,
      error: error.message,
      message: 'Failed to clear all treatments'
    }
  }
}

// Upload treatment image to Firebase Storage
export const uploadTreatmentImage = async (file, onProgress = null) => {
  try {
    console.log('Uploading treatment image:', file.name)
    
    const storageRef = ref(storage, `treatments/${Date.now()}_${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          if (onProgress) {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            onProgress(Math.round(progress))
          }
        },
        (error) => {
          console.error('Error uploading image:', error)
          reject(error)
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
            console.log('Image uploaded successfully:', downloadURL)
            resolve(downloadURL)
          } catch (error) {
            console.error('Error getting download URL:', error)
            reject(error)
          }
        }
      )
    })
  } catch (error) {
    console.error('Error uploading treatment image:', error)
    throw error
  }
}

// Subscribe to real-time updates
export const subscribeToTreatments = (callback) => {
  try {
    console.log('Setting up real-time treatments listener...')
    const treatmentsRef = collection(db, 'treatments')
    const q = query(treatmentsRef, orderBy('createdAt', 'desc'))
    
    return onSnapshot(q, (snapshot) => {
      const treatments = []
      snapshot.forEach((doc) => {
        treatments.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      console.log('Real-time treatments update:', treatments)
      callback(treatments)
    })
  } catch (error) {
    console.error('Error setting up treatments listener:', error)
    throw error
  }
}
