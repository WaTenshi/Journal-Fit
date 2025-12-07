import React, { useState, useEffect, useContext } from 'react';
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
import { AuthContext } from '../../context/AuthContext';
import { getCustomRoutines, createCustomRoutine, deleteCustomRoutine } from '../../services/firebaseCustomRoutines';

const COLOR_OPTIONS = [
  '#E02424', '#4DA6FF', '#7BE495', '#FFD166', '#A663CC',
  '#06D6A0', '#118AB2', '#EF476F', '#FF9E00', '#073B4C'
];

export default function RutinasPersonalizadasScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    name: '',
    description: '',
    color: COLOR_OPTIONS[0],
  });

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const userRoutines = await getCustomRoutines(user.uid);
      setRoutines(userRoutines || []);
    } catch (error) {
      console.error('Error cargando rutinas:', error);
      Alert.alert('Error', 'No se pudieron cargar las rutinas');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoutine = async () => {
    if (!user) {
      Alert.alert('Error', 'Debes iniciar sesión');
      return;
    }
    if (!newRoutine.name.trim()) {
      Alert.alert('Nombre requerido', 'Ponle un nombre a tu rutina');
      return;
    }
    if (routines.length >= 10) {
      Alert.alert('Límite alcanzado', 'Solo puedes tener hasta 10 rutinas personalizadas');
      return;
    }
    try {
      setLoading(true);
      const routineId = await createCustomRoutine(user.uid, newRoutine);
      Alert.alert('¡Creada!', 'Rutina personalizada creada');
      setModalVisible(false);
      setNewRoutine({ name: '', description: '', color: COLOR_OPTIONS[0] });
      navigation.navigate('CustomRoutineDetail', { routineId });
    } catch (error) {
      console.error('Error creando rutina:', error);
      Alert.alert('Error', 'No se pudo crear la rutina');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoutine = (routineId, routineName) => {
    Alert.alert(
      'Eliminar rutina',
      `¿Seguro que quieres eliminar "${routineName}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomRoutine(user.uid, routineId);
              loadRoutines();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar');
            }
          },
        },
      ]
    );
  };

  const RoutineCard = ({ routine }) => (
    <TouchableOpacity
      style={[styles.routineCard, { borderColor: routine.color }]}
      onPress={() => navigation.navigate('CustomRoutineDetail', { routineId: routine.id })}
    >
      <View style={styles.routineHeader}>
        <View style={[styles.colorIndicator, { backgroundColor: routine.color }]} />
        <View style={styles.routineInfo}>
          <Text style={styles.routineName}>{routine.name}</Text>
          {routine.description ? (
            <Text style={styles.routineDescription} numberOfLines={2}>
              {routine.description}
            </Text>
          ) : null}
          <Text style={styles.routineStats}>
            {routine.exercises?.length || 0} ejercicios
          </Text>
        </View>
        <TouchableOpacity
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteRoutine(routine.id, routine.name);
          }}
          style={styles.deleteButton}
        >
          <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Mis Rutinas Personalizadas</Text>
      </View>

      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>{routines.length}/10 rutinas creadas</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${(routines.length / 10) * 100}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <Text style={styles.loadingText}>Cargando rutinas...</Text>
        ) : routines.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="barbell-outline" size={60} color="#444" />
            <Text style={styles.emptyTitle}>No hay rutinas aún</Text>
            <Text style={styles.emptyText}>
              Crea tu primera rutina personalizada para empezar a entrenar a tu manera
            </Text>
          </View>
        ) : (
          routines.map((routine) => <RoutineCard key={routine.id} routine={routine} />)
        )}
      </ScrollView>

      {routines.length < 10 && (
        <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nueva Rutina Personalizada</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#ccc" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Nombre de la rutina"
              placeholderTextColor="#666"
              value={newRoutine.name}
              onChangeText={(text) => setNewRoutine({ ...newRoutine, name: text })}
              maxLength={30}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descripción (opcional)"
              placeholderTextColor="#666"
              value={newRoutine.description}
              onChangeText={(text) => setNewRoutine({ ...newRoutine, description: text })}
              multiline
              numberOfLines={3}
              maxLength={100}
            />

            <Text style={styles.colorLabel}>Color de identificación:</Text>
            <View style={styles.colorGrid}>
              {COLOR_OPTIONS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorOption,
                    { backgroundColor: color },
                    newRoutine.color === color && styles.colorSelected,
                  ]}
                  onPress={() => setNewRoutine({ ...newRoutine, color })}
                >
                  {newRoutine.color === color && <Ionicons name="checkmark" size={20} color="#fff" />}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.createButton, !newRoutine.name.trim() && styles.createButtonDisabled]}
              onPress={handleCreateRoutine}
              disabled={!newRoutine.name.trim() || loading}
            >
              <Text style={styles.createButtonText}>{loading ? 'Creando...' : 'Crear Rutina'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050505' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 10 },
  backButton: { marginRight: 15, padding: 5 },
  title: { fontSize: 22, fontWeight: '700', color: '#fff', flex: 1 },
  counterContainer: { paddingHorizontal: 16, marginBottom: 20 },
  counterText: { color: '#ccc', fontSize: 14, marginBottom: 5 },
  progressBar: { height: 4, backgroundColor: '#333', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#E02424' },
  content: { flex: 1, paddingHorizontal: 16 },
  routineCard: {
    backgroundColor: '#151515',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
  },
  routineHeader: { flexDirection: 'row', alignItems: 'flex-start' },
  colorIndicator: { width: 20, height: 20, borderRadius: 10, marginRight: 12, marginTop: 2 },
  routineInfo: { flex: 1 },
  routineName: { color: '#fff', fontSize: 18, fontWeight: '600', marginBottom: 4 },
  routineDescription: { color: '#aaa', fontSize: 14, marginBottom: 6 },
  routineStats: { color: '#666', fontSize: 12 },
  deleteButton: { padding: 5 },
  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '600', marginTop: 20, marginBottom: 10 },
  emptyText: { color: '#888', textAlign: 'center', paddingHorizontal: 40, fontSize: 14, lineHeight: 20 },
  loadingText: { color: '#ccc', textAlign: 'center', marginTop: 50 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E02424',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#E02424',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: '600' },
  input: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 14,
    color: '#fff',
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#444',
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  colorLabel: { color: '#ccc', fontSize: 14, marginBottom: 10 },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 25, gap: 10 },
  colorOption: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  colorSelected: { borderWidth: 3, borderColor: '#fff' },
  createButton: { backgroundColor: '#E02424', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  createButtonDisabled: { backgroundColor: '#444', opacity: 0.6 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});