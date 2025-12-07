import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

export const getCustomRoutines = async (userId) => {
  try {
    const routinesRef = collection(db, 'users', userId, 'customRoutines');
    const q = query(routinesRef, orderBy('updatedAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error obteniendo rutinas:', error);
    throw error;
  }
};

export const createCustomRoutine = async (userId, routineData) => {
  try {
    const routinesCollection = collection(db, 'users', userId, 'customRoutines');
    const newRoutineRef = doc(routinesCollection);
    
    const routine = {
      id: newRoutineRef.id,
      name: routineData.name,
      description: routineData.description || '',
      color: routineData.color,
      exercises: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      history: [],
      currentWorkout: null
    };
    
    await setDoc(newRoutineRef, routine);
    return newRoutineRef.id;
  } catch (error) {
    console.error('Error creando rutina:', error);
    throw error;
  }
};


export const getCustomRoutine = async (userId, routineId) => {
  try {
    const routineRef = doc(db, 'users', userId, 'customRoutines', routineId);
    const snapshot = await getDoc(routineRef);
    
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    console.error('Error obteniendo rutina:', error);
    throw error;
  }
};

export const updateCustomRoutine = async (userId, routineId, updates) => {
  try {
    const routineRef = doc(db, 'users', userId, 'customRoutines', routineId);
    
    await updateDoc(routineRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error actualizando rutina:', error);
    throw error;
  }
};

export const deleteCustomRoutine = async (userId, routineId) => {
  try {
    const routineRef = doc(db, 'users', userId, 'customRoutines', routineId);
    await deleteDoc(routineRef);
  } catch (error) {
    console.error('Error eliminando rutina:', error);
    throw error;
  }
};

const generateExerciseId = () => {
  return `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const addExerciseToRoutine = async (userId, routineId, exerciseData) => {
  try {
    const routineRef = doc(db, 'users', userId, 'customRoutines', routineId);
    const routineSnap = await getDoc(routineRef);
    
    if (!routineSnap.exists()) {
      throw new Error('Rutina no encontrada');
    }
    
    const routine = routineSnap.data();
    const newExercise = {
      id: generateExerciseId(),
      ...exerciseData,
      sets: []
    };
    
    await updateDoc(routineRef, {
      exercises: [...routine.exercises, newExercise],
      updatedAt: serverTimestamp()
    });
    
    return newExercise.id;
  } catch (error) {
    console.error('Error añadiendo ejercicio:', error);
    throw error;
  }
};

export const removeExerciseFromRoutine = async (userId, routineId, exerciseId) => {
  try {
    const routineRef = doc(db, 'users', userId, 'customRoutines', routineId);
    const routineSnap = await getDoc(routineRef);
    
    if (!routineSnap.exists()) {
      throw new Error('Rutina no encontrada');
    }
    
    const routine = routineSnap.data();
    const updatedExercises = routine.exercises.filter(ex => ex.id !== exerciseId);
    
    await updateDoc(routineRef, {
      exercises: updatedExercises,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error eliminando ejercicio:', error);
    throw error;
  }
};

// En el archivo firebaseCustomRoutines.js, agrega estas funciones:

// Función para actualizar series de un ejercicio
export const updateExerciseSets = async (userId, routineId, exerciseId, sets) => {
  try {
    const routineRef = doc(db, 'users', userId, 'customRoutines', routineId);
    const routineSnap = await getDoc(routineRef);
    
    if (!routineSnap.exists()) {
      throw new Error('Rutina no encontrada');
    }
    
    const routine = routineSnap.data();
    const updatedExercises = routine.exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, sets };
      }
      return ex;
    });
    
    await updateDoc(routineRef, {
      exercises: updatedExercises,
      updatedAt: serverTimestamp()
    });
    
  } catch (error) {
    console.error('Error actualizando series:', error.message);
    throw error;
  }
};