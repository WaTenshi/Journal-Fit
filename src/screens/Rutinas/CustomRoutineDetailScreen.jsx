import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { 
  getCustomRoutine, 
  addExerciseToRoutine, 
  removeExerciseFromRoutine 
} from '../../services/firebaseCustomRoutines';

const EXERCISE_CATEGORIES = [
  { id: 'peso-libre', name: 'Peso Libre', icon: 'barbell' },
  { id: 'maquina', name: 'Máquinas', icon: 'hardware-chip' },
  { id: 'peso-corporal', name: 'Peso Corporal', icon: 'body' },
  { id: 'cardio', name: 'Cardio', icon: 'speedometer' },
  { id: 'yoga', name: 'Yoga/Estiramientos', icon: 'leaf' },
];

export default function CustomRoutineDetailScreen({ route, navigation }) {
  const { routineId } = route.params;
  const { user } = useContext(AuthContext);
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
  const [newExercise, setNewExercise] = useState({
    name: '',
    category: 'peso-libre',
  });

  useEffect(() => {
    loadRoutine();
  }, [routineId]);

  const loadRoutine = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getCustomRoutine(user.uid, routineId);
      setRoutine(data);
    } catch (error) {
      console.error('Error cargando rutina:', error);
      Alert.alert('Error', 'No se pudo cargar la rutina');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExercise = async () => {
    if (!newExercise.name.trim()) {
      Alert.alert('Error', 'El nombre del ejercicio es requerido');
      return;
    }
    try {
      await addExerciseToRoutine(user.uid, routineId, {
        ...newExercise,
        sets: [] // Inicializar con array vacío de series
      });
      setExerciseModalVisible(false);
      setNewExercise({ name: '', category: 'peso-libre' });
      loadRoutine();
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar el ejercicio');
    }
  };

  const handleRemoveExercise = (exerciseId) => {
    Alert.alert(
      'Eliminar ejercicio',
      '¿Quieres eliminar este ejercicio de la rutina?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          onPress: async () => {
            try {
              await removeExerciseFromRoutine(user.uid, routineId, exerciseId);
              loadRoutine();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el ejercicio');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Cargando rutina...</Text>
      </SafeAreaView>
    );
  }

  if (!routine) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Rutina no encontrada</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.routineName}>{routine.name}</Text>
          {routine.description ? (
            <Text style={styles.routineDescription}>{routine.description}</Text>
          ) : null}
        </View>
      </View>

      <ScrollView style={styles.content}>
        {routine.exercises?.length === 0 ? (
          <View style={styles.emptyExercises}>
            <Ionicons name="fitness-outline" size={50} color="#444" />
            <Text style={styles.emptyExercisesText}>No hay ejercicios en esta rutina</Text>
            <Text style={styles.emptyExercisesSubtext}>
              Agrega ejercicios para comenzar a personalizar tu entrenamiento
            </Text>
          </View>
        ) : (
          routine.exercises?.map((exercise, index) => (
            <TouchableOpacity
              key={exercise.id}
              style={styles.exerciseCard}
              onPress={() => navigation.navigate('ExerciseDetail', {
                userId: user.uid,
                routineId,
                exerciseId: exercise.id,
                exerciseName: exercise.name
              })}
            >
              <View style={styles.exerciseHeader}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <Text style={styles.exerciseCategory}>
                    {EXERCISE_CATEGORIES.find(cat => cat.id === exercise.category)?.name || exercise.category}
                  </Text>
                  <Text style={styles.exerciseDetails}>
                    {exercise.sets?.length || 0} series registradas
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={(e) => {
                    e.stopPropagation();
                    handleRemoveExercise(exercise.id);
                  }}
                  style={styles.exerciseDeleteButton}
                >
                  <Ionicons name="close-circle" size={24} color="#ff6b6b" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addExerciseButton}
        onPress={() => setExerciseModalVisible(true)}
      >
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addExerciseButtonText}>Agregar Ejercicio</Text>
      </TouchableOpacity>

      <Modal visible={exerciseModalVisible} animationType="slide" transparent={true}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Agregar Ejercicio</Text>
            <TouchableOpacity onPress={() => setExerciseModalVisible(false)}>
              <Ionicons name="close" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Nombre del ejercicio (ej: Press Banca)"
              placeholderTextColor="#666"
              value={newExercise.name}
              onChangeText={(text) => setNewExercise({ ...newExercise, name: text })}
            />

            <Text style={styles.inputLabel}>Tipo de ejercicio</Text>
            <View style={styles.categoryButtons}>
              {EXERCISE_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryButton,
                    newExercise.category === cat.id && styles.categoryButtonActive,
                  ]}
                  onPress={() => setNewExercise({ ...newExercise, category: cat.id })}
                >
                  <Ionicons 
                    name={cat.icon} 
                    size={20} 
                    color={newExercise.category === cat.id ? '#fff' : '#ccc'} 
                  />
                  <Text
                    style={[
                      styles.categoryButtonText,
                      newExercise.category === cat.id && styles.categoryButtonTextActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.addButton} onPress={handleAddExercise}>
              <Text style={styles.addButtonText}>Agregar Ejercicio</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  backButton: { marginRight: 15, padding: 5 },
  headerInfo: { flex: 1 },
  routineName: { color: '#fff', fontSize: 22, fontWeight: '700' },
  routineDescription: { color: '#aaa', fontSize: 14, marginTop: 4 },
  content: { flex: 1, padding: 16 },
  emptyExercises: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyExercisesText: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 20 },
  emptyExercisesSubtext: { color: '#888', textAlign: 'center', marginTop: 10, fontSize: 14, lineHeight: 20 },
  exerciseCard: {
    backgroundColor: '#151515',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  exerciseNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E02424',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  exerciseNumberText: { color: '#fff', fontWeight: 'bold' },
  exerciseInfo: { flex: 1 },
  exerciseName: { color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  exerciseCategory: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  exerciseDetails: { color: '#666', fontSize: 12 },
  exerciseDeleteButton: { padding: 5 },
  addExerciseButton: {
    flexDirection: 'row',
    backgroundColor: '#E02424',
    margin: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addExerciseButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  loadingText: { color: '#ccc', textAlign: 'center', marginTop: 50 },
  errorText: { color: '#ff6b6b', textAlign: 'center', marginTop: 50 },
  modalContainer: { flex: 1, backgroundColor: '#0a0a0a' },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  modalContent: { flex: 1, padding: 16 },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputLabel: { color: '#ccc', fontSize: 14, marginBottom: 10, marginTop: 5 },
  categoryButtons: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 15, gap: 8 },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#E02424',
    borderColor: '#E02424',
  },
  categoryButtonText: { color: '#ccc', fontSize: 12 },
  categoryButtonTextActive: { color: '#fff', fontWeight: '600' },
  addButton: {
    backgroundColor: '#E02424',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  addButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});