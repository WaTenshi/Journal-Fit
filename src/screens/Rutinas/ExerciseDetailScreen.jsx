import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  getCustomRoutine, 
  updateCustomRoutine 
} from '../../services/firebaseCustomRoutines';

export default function ExerciseDetailScreen({ route, navigation }) {
  const { userId, routineId, exerciseId, exerciseName } = route.params;
  const [routine, setRoutine] = useState(null);
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addSetModalVisible, setAddSetModalVisible] = useState(false);
  const [editSetModalVisible, setEditSetModalVisible] = useState(false);
  const [editingSet, setEditingSet] = useState(null);
  
  const [newSet, setNewSet] = useState({
    reps: '',
    weight: '',
    rir: '',
    notes: '',
  });

  useEffect(() => {
    loadExercise();
  }, []);

  const loadExercise = async () => {
    setLoading(true);
    try {
      const data = await getCustomRoutine(userId, routineId);
      setRoutine(data);
      
      const foundExercise = data.exercises?.find(ex => ex.id === exerciseId);
      if (foundExercise) {
        setExercise(foundExercise);
      } else {
        Alert.alert('Error', 'Ejercicio no encontrado');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error cargando ejercicio:', error);
      Alert.alert('Error', 'No se pudo cargar el ejercicio');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSet = async () => {
    if (!newSet.reps || !newSet.weight) {
      Alert.alert('Error', 'Repeticiones y peso son requeridos');
      return;
    }

    try {
      const updatedExercises = routine.exercises.map(ex => {
        if (ex.id === exerciseId) {
          const newSetObj = {
            id: `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            setNumber: (ex.sets?.length || 0) + 1,
            reps: parseInt(newSet.reps) || 0,
            weight: parseFloat(newSet.weight) || 0,
            rir: newSet.rir ? parseInt(newSet.rir) : null,
            notes: newSet.notes || '',
            completed: true,
            date: new Date().toISOString(),
          };
          
          return {
            ...ex,
            sets: [...(ex.sets || []), newSetObj]
          };
        }
        return ex;
      });

      await updateCustomRoutine(userId, routineId, { exercises: updatedExercises });
      
      setNewSet({ reps: '', weight: '', rir: '', notes: '' });
      setAddSetModalVisible(false);
      loadExercise();
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar la serie');
    }
  };

  const handleEditSet = async () => {
    if (!editingSet || !editingSet.reps || !editingSet.weight) {
      Alert.alert('Error', 'Repeticiones y peso son requeridos');
      return;
    }

    try {
      const updatedExercises = routine.exercises.map(ex => {
        if (ex.id === exerciseId) {
          const updatedSets = ex.sets.map(set => 
            set.id === editingSet.id ? editingSet : set
          );
          return { ...ex, sets: updatedSets };
        }
        return ex;
      });

      await updateCustomRoutine(userId, routineId, { exercises: updatedExercises });
      
      setEditSetModalVisible(false);
      setEditingSet(null);
      loadExercise();
      
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la serie');
    }
  };

  const handleDeleteSet = (setId) => {
    Alert.alert(
      'Eliminar serie',
      '¿Seguro que quieres eliminar esta serie?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedExercises = routine.exercises.map(ex => {
                if (ex.id === exerciseId) {
                  const filteredSets = ex.sets.filter(set => set.id !== setId);
                  // Re-numerar las series
                  const renumberedSets = filteredSets.map((set, index) => ({
                    ...set,
                    setNumber: index + 1
                  }));
                  return { ...ex, sets: renumberedSets };
                }
                return ex;
              });

              await updateCustomRoutine(userId, routineId, { exercises: updatedExercises });
              loadExercise();
              
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la serie');
            }
          },
        },
      ]
    );
  };

  const openEditSetModal = (set) => {
    setEditingSet({ ...set });
    setEditSetModalVisible(true);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.loadingText}>Cargando ejercicio...</Text>
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Ejercicio no encontrado</Text>
      </SafeAreaView>
    );
  }

  const totalVolume = exercise.sets?.reduce((total, set) => {
    return total + (set.weight * set.reps);
  }, 0) || 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.exerciseTitle}>{exercise.name}</Text>
          <Text style={styles.exerciseSubtitle}>
            {exercise.sets?.length || 0} series • Volumen total: {totalVolume} kg
          </Text>
        </View>
      </View>

      <ScrollView style={styles.content}>
        {exercise.sets?.length === 0 ? (
          <View style={styles.emptySets}>
            <Ionicons name="list-outline" size={50} color="#444" />
            <Text style={styles.emptySetsText}>No hay series registradas</Text>
            <Text style={styles.emptySetsSubtext}>
              Agrega series para registrar tu progreso en este ejercicio
            </Text>
          </View>
        ) : (
          <View>
            <View style={styles.setsHeader}>
              <Text style={styles.setsHeaderText}>Series registradas:</Text>
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={() => {
                  if (exercise.sets?.length > 0) {
                    Alert.alert(
                      'Eliminar todas las series',
                      '¿Seguro que quieres eliminar todas las series?',
                      [
                        { text: 'Cancelar', style: 'cancel' },
                        {
                          text: 'Eliminar todas',
                          style: 'destructive',
                          onPress: async () => {
                            try {
                              const updatedExercises = routine.exercises.map(ex => 
                                ex.id === exerciseId ? { ...ex, sets: [] } : ex
                              );
                              await updateCustomRoutine(userId, routineId, { exercises: updatedExercises });
                              loadExercise();
                            } catch (error) {
                              Alert.alert('Error', 'No se pudieron eliminar las series');
                            }
                          },
                        },
                      ]
                    );
                  }
                }}
              >
                <Text style={styles.clearAllButtonText}>Limpiar todo</Text>
              </TouchableOpacity>
            </View>
            
            {exercise.sets?.map((set, index) => (
              <TouchableOpacity
                key={set.id}
                style={styles.setCard}
                onPress={() => openEditSetModal(set)}
              >
                <View style={styles.setHeader}>
                  <View style={styles.setNumberContainer}>
                    <Text style={styles.setNumber}>Serie {set.setNumber}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDeleteSet(set.id);
                    }}
                    style={styles.setDeleteButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
                  </TouchableOpacity>
                </View>
                
                <View style={styles.setDetails}>
                  <View style={styles.setDetailItem}>
                    <Text style={styles.setDetailLabel}>Reps:</Text>
                    <Text style={styles.setDetailValue}>{set.reps}</Text>
                  </View>
                  <View style={styles.setDetailItem}>
                    <Text style={styles.setDetailLabel}>Peso:</Text>
                    <Text style={styles.setDetailValue}>{set.weight} kg</Text>
                  </View>
                  {set.rir !== null && (
                    <View style={styles.setDetailItem}>
                      <Text style={styles.setDetailLabel}>RIR:</Text>
                      <Text style={styles.setDetailValue}>{set.rir}</Text>
                    </View>
                  )}
                </View>
                
                {set.notes ? (
                  <View style={styles.setNotes}>
                    <Text style={styles.setNotesLabel}>Nota:</Text>
                    <Text style={styles.setNotesText}>{set.notes}</Text>
                  </View>
                ) : null}
                
                <View style={styles.setVolume}>
                  <Text style={styles.setVolumeText}>
                    Volumen: {set.weight * set.reps} kg
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.addSetButton}
        onPress={() => setAddSetModalVisible(true)}
      >
        <Ionicons name="add" size={24} color="#fff" />
        <Text style={styles.addSetButtonText}>Agregar Serie</Text>
      </TouchableOpacity>

      {/* Modal para agregar nueva serie */}
      <Modal visible={addSetModalVisible} animationType="slide" transparent={true}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Agregar Serie</Text>
            <TouchableOpacity onPress={() => setAddSetModalVisible(false)}>
              <Ionicons name="close" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Repeticiones *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="10"
                  placeholderTextColor="#666"
                  value={newSet.reps}
                  onChangeText={(text) => setNewSet({ ...newSet, reps: text })}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Peso (kg) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="100"
                  placeholderTextColor="#666"
                  value={newSet.weight}
                  onChangeText={(text) => setNewSet({ ...newSet, weight: text })}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>RIR (Reps in Reserve)</Text>
              <TextInput
                style={styles.input}
                placeholder="0-10 (opcional)"
                placeholderTextColor="#666"
                value={newSet.rir}
                onChangeText={(text) => setNewSet({ ...newSet, rir: text })}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Notas (opcional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Ej: Técnica perfecta, último rep difícil..."
                placeholderTextColor="#666"
                value={newSet.notes}
                onChangeText={(text) => setNewSet({ ...newSet, notes: text })}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, (!newSet.reps || !newSet.weight) && styles.saveButtonDisabled]} 
              onPress={handleAddSet}
              disabled={!newSet.reps || !newSet.weight}
            >
              <Text style={styles.saveButtonText}>Guardar Serie</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal para editar serie */}
      <Modal visible={editSetModalVisible} animationType="slide" transparent={true}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Serie</Text>
            <TouchableOpacity onPress={() => setEditSetModalVisible(false)}>
              <Ionicons name="close" size={24} color="#ccc" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {editingSet && (
              <>
                <View style={styles.inputRow}>
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Repeticiones *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="10"
                      placeholderTextColor="#666"
                      value={editingSet.reps?.toString()}
                      onChangeText={(text) => setEditingSet({ 
                        ...editingSet, 
                        reps: parseInt(text) || 0 
                      })}
                      keyboardType="numeric"
                    />
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Peso (kg) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="100"
                      placeholderTextColor="#666"
                      value={editingSet.weight?.toString()}
                      onChangeText={(text) => setEditingSet({ 
                        ...editingSet, 
                        weight: parseFloat(text) || 0 
                      })}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>RIR (Reps in Reserve)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0-10 (opcional)"
                    placeholderTextColor="#666"
                    value={editingSet.rir?.toString() || ''}
                    onChangeText={(text) => setEditingSet({ 
                      ...editingSet, 
                      rir: text ? parseInt(text) : null 
                    })}
                    keyboardType="numeric"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Notas (opcional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Ej: Técnica perfecta, último rep difícil..."
                    placeholderTextColor="#666"
                    value={editingSet.notes || ''}
                    onChangeText={(text) => setEditingSet({ ...editingSet, notes: text })}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.saveButton, (!editingSet.reps || !editingSet.weight) && styles.saveButtonDisabled]} 
                  onPress={handleEditSet}
                  disabled={!editingSet.reps || !editingSet.weight}
                >
                  <Text style={styles.saveButtonText}>Actualizar Serie</Text>
                </TouchableOpacity>
              </>
            )}
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
  exerciseTitle: { color: '#fff', fontSize: 22, fontWeight: '700' },
  exerciseSubtitle: { color: '#aaa', fontSize: 14, marginTop: 4 },
  content: { flex: 1, padding: 16 },
  emptySets: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptySetsText: { color: '#fff', fontSize: 18, fontWeight: '600', marginTop: 20 },
  emptySetsSubtext: { color: '#888', textAlign: 'center', marginTop: 10, fontSize: 14, lineHeight: 20 },
  setsHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 16 
  },
  setsHeaderText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  clearAllButton: { padding: 8 },
  clearAllButtonText: { color: '#ff6b6b', fontSize: 14 },
  setCard: {
    backgroundColor: '#151515',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  setHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 12 
  },
  setNumberContainer: { flexDirection: 'row', alignItems: 'center' },
  setNumber: { color: '#E02424', fontSize: 16, fontWeight: '700', marginRight: 8 },
  setDeleteButton: { padding: 4 },
  setDetails: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    marginBottom: 12 
  },
  setDetailItem: { flex: 1 },
  setDetailLabel: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  setDetailValue: { color: '#fff', fontSize: 18, fontWeight: '600' },
  setNotes: { 
    backgroundColor: '#1a1a1a', 
    borderRadius: 8, 
    padding: 10,
    marginBottom: 12 
  },
  setNotesLabel: { color: '#888', fontSize: 11, marginBottom: 4 },
  setNotesText: { color: '#ccc', fontSize: 13 },
  setVolume: { 
    borderTopWidth: 1, 
    borderTopColor: '#333', 
    paddingTop: 10 
  },
  setVolumeText: { color: '#7BE495', fontSize: 14, fontWeight: '600' },
  addSetButton: {
    flexDirection: 'row',
    backgroundColor: '#E02424',
    margin: 16,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addSetButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', marginLeft: 8 },
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
  inputRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 15 
  },
  inputGroup: { flex: 1, marginBottom: 15 },
  inputLabel: { color: '#ccc', fontSize: 14, marginBottom: 8 },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#E02424',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#444',
    opacity: 0.6,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});