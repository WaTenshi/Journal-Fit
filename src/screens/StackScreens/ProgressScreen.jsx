import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LineChart } from 'react-native-chart-kit';
import { format, parseISO, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';

const { width: screenWidth } = Dimensions.get('window');

export default function ProgressScreen({ navigation }) {
  const [progressEntries, setProgressEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  const [newEntry, setNewEntry] = useState({
    weight: '',
    chest: '',
    waist: '',
    arms: '',
    thighs: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
    photoUri: null,
  });

  useEffect(() => {
    loadProgressEntries();
    requestGalleryPermissions();
  }, []);

  const requestGalleryPermissions = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso requerido',
          'Necesitamos acceso a tu galería para seleccionar fotos de progreso.'
        );
      }
    } catch (error) {
      console.log('Error pidiendo permisos de galería:', error);
    }
  };

  const loadProgressEntries = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem('@progress_entries');
      const entries = stored ? JSON.parse(stored) : [];

      // Ordenar por fecha (más reciente primero)
      entries.sort((a, b) => new Date(b.date) - new Date(a.date));
      setProgressEntries(entries);
    } catch (error) {
      console.error('Error cargando progreso:', error);
    } finally {
      setLoading(false);
    }
  };

  // Seleccionar foto de galería
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 0.8,
      });

      if (!result.canceled) {
        setNewEntry((prev) => ({
          ...prev,
          photoUri: result.assets[0].uri,
        }));
      }
    } catch (error) {
      console.log('Error seleccionando foto:', error);
      Alert.alert('Error', 'No se pudo seleccionar la foto');
    }
  };

  const saveProgressEntry = async () => {
    if (!newEntry.photoUri) {
      Alert.alert(
        'Foto requerida',
        'Debes seleccionar una foto para registrar tu progreso'
      );
      return;
    }

    if (!newEntry.weight) {
      Alert.alert('Peso requerido', 'Registra tu peso actual');
      return;
    }

    try {
      const entryId = Date.now().toString();
      const entry = {
        id: entryId,
        ...newEntry,
        createdAt: new Date().toISOString(),
      };

      const updatedEntries = [entry, ...progressEntries];
      await AsyncStorage.setItem(
        '@progress_entries',
        JSON.stringify(updatedEntries)
      );

      setProgressEntries(updatedEntries);
      setAddModalVisible(false);
      resetNewEntry();

      Alert.alert(
        '✅ ¡Registrado!',
        'Tu progreso ha sido guardado localmente en tu dispositivo'
      );
    } catch (error) {
      console.error('Error guardando:', error);
      Alert.alert('Error', 'No se pudo guardar el registro');
    }
  };

  const resetNewEntry = () => {
    setNewEntry({
      weight: '',
      chest: '',
      waist: '',
      arms: '',
      thighs: '',
      notes: '',
      date: new Date().toISOString().split('T')[0],
      photoUri: null,
    });
  };

  const deleteEntry = (entryId) => {
    Alert.alert(
      'Eliminar registro',
      '¿Seguro que quieres eliminar este registro de progreso?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              const filtered = progressEntries.filter(
                (entry) => entry.id !== entryId
              );
              await AsyncStorage.setItem(
                '@progress_entries',
                JSON.stringify(filtered)
              );
              setProgressEntries(filtered);
              if (selectedEntry?.id === entryId) {
                setViewModalVisible(false);
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el registro');
            }
          },
        },
      ]
    );
  };

  const openEntryDetails = (entry) => {
    setSelectedEntry(entry);
    setViewModalVisible(true);
  };

  const getProgressStats = () => {
    if (progressEntries.length < 2) return null;

    const sorted = [...progressEntries].sort(
      (a, b) => new Date(a.date) - new Date(b.date)
    );
    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    return {
      weightChange:
        parseFloat(last.weight || 0) - parseFloat(first.weight || 0),
      totalDays: Math.ceil(
        (new Date(last.date) - new Date(first.date)) /
          (1000 * 60 * 60 * 24)
      ),
      totalEntries: sorted.length,
    };
  };

  const getWeightChartData = () => {
    if (progressEntries.length === 0) return null;

    const last6Months = progressEntries
      .filter((entry) => {
        const entryDate = parseISO(entry.date);
        const sixMonthsAgo = subMonths(new Date(), 6);
        return entryDate >= sixMonthsAgo;
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    if (last6Months.length === 0) return null;

    const labels = last6Months.map((entry) => {
      const date = parseISO(entry.date);
      return format(date, 'MMM', { locale: es });
    });

    const data = last6Months.map((entry) =>
      parseFloat(entry.weight || 0)
    );

    return { labels, data };
  };

  const chartData = getWeightChartData();
  const stats = getProgressStats();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Mi Progreso</Text>
        <TouchableOpacity
          style={styles.infoButton}
          onPress={() =>
            Alert.alert(
              'Privacidad Total',
              'Todas tus fotos y datos se guardan SOLO en tu teléfono.\n\n• Se almacenan localmente\n• No se suben a internet\n• Solo tú puedes verlas\n• Requiere backup manual'
            )
          }
        >
          <Ionicons
            name="information-circle-outline"
            size={24}
            color="#4DA6FF"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Estadísticas rápidas */}
        {progressEntries.length > 0 && stats && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Resumen de Progreso</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalEntries}</Text>
                <Text style={styles.statLabel}>Registros</Text>
              </View>
              <View style={styles.statItem}>
                <Text
                  style={[
                    styles.statValue,
                    stats.weightChange < 0 && styles.statValueNegative,
                  ]}
                >
                  {stats.weightChange > 0 ? '+' : ''}
                  {stats.weightChange.toFixed(1)} kg
                </Text>
                <Text style={styles.statLabel}>Cambio de peso</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{stats.totalDays}</Text>
                <Text style={styles.statLabel}>Días totales</Text>
              </View>
            </View>
          </View>
        )}

        {/* Gráfico de peso */}
        {chartData && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>
              Evolución del Peso (últimos 6 meses)
            </Text>
            <LineChart
              data={{
                labels: chartData.labels,
                datasets: [{ data: chartData.data }],
              }}
              width={screenWidth - 48}
              height={220}
              chartConfig={{
                backgroundColor: '#151515',
                backgroundGradientFrom: '#151515',
                backgroundGradientTo: '#151515',
                decimalPlaces: 1,
                color: (opacity = 1) =>
                  `rgba(123, 228, 149, ${opacity})`,
                labelColor: (opacity = 1) =>
                  `rgba(255, 255, 255, ${opacity})`,
                style: { borderRadius: 16 },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#7BE495',
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        )}

        {/* Registros */}
        <View style={styles.entriesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Historial de Progreso</Text>
            <Text style={styles.sectionCount}>
              {progressEntries.length} registros
            </Text>
          </View>

          {loading ? (
            <Text style={styles.loadingText}>Cargando...</Text>
          ) : progressEntries.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="image-outline" size={60} color="#444" />
              <Text style={styles.emptyTitle}>
                Comienza tu transformación
              </Text>
              <Text style={styles.emptyText}>
                Registra tu primera foto de progreso para ver tu evolución con
                el tiempo.
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => setAddModalVisible(true)}
              >
                <Text style={styles.emptyButtonText}>
                  Registrar mi punto de partida
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            progressEntries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.entryCard}
                onPress={() => openEntryDetails(entry)}
              >
                {entry.photoUri && (
                  <Image
                    source={{ uri: entry.photoUri }}
                    style={styles.entryImage}
                  />
                )}
                <View style={styles.entryInfo}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.entryDate}>
                      {format(
                        parseISO(entry.date),
                        'dd MMM yyyy',
                        { locale: es }
                      )}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={20}
                      color="#666"
                    />
                  </View>
                  <Text style={styles.entryWeight}>
                    {entry.weight} kg
                  </Text>
                  {entry.notes ? (
                    <Text
                      style={styles.entryNotes}
                      numberOfLines={2}
                    >
                      {entry.notes}
                    </Text>
                  ) : null}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* FAB para agregar */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
      >
        <Ionicons name="image" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal para agregar nuevo registro */}
      <Modal visible={addModalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Registrar Progreso</Text>
              <TouchableOpacity
                onPress={() => setAddModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#ccc" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubtitle}>
              Todas las fotos se guardan solo en tu teléfono
            </Text>

            {/* Foto */}
            <View style={styles.photoSection}>
              {newEntry.photoUri ? (
                <View>
                  <Image
                    source={{ uri: newEntry.photoUri }}
                    style={styles.previewImage}
                  />
                  <View style={styles.photoActionButtons}>
                    <TouchableOpacity
                      style={styles.photoActionButton}
                      onPress={pickImage}
                    >
                      <Ionicons
                        name="image"
                        size={20}
                        color="#fff"
                      />
                      <Text style={styles.photoActionButtonText}>
                        Cambiar foto
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.addPhotoButton}
                  onPress={pickImage}
                >
                  <Ionicons name="image" size={50} color="#666" />
                  <Text style={styles.addPhotoButtonText}>
                    Selecciona una foto
                  </Text>
                  <Text style={styles.addPhotoButtonSubtext}>
                    desde tu galería
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Fecha */}
            <Text style={styles.inputLabel}>Fecha del registro</Text>
            <TextInput
              style={styles.input}
              value={newEntry.date}
              onChangeText={(text) =>
                setNewEntry((prev) => ({ ...prev, date: text }))
              }
              placeholder="AAAA-MM-DD"
            />

            {/* Peso */}
            <Text style={styles.inputLabel}>Peso (kg) *</Text>
            <TextInput
              style={styles.input}
              value={newEntry.weight}
              onChangeText={(text) =>
                setNewEntry((prev) => ({ ...prev, weight: text }))
              }
              placeholder="Ej: 75.5"
              keyboardType="decimal-pad"
            />

            {/* Medidas opcionales */}
            <Text style={styles.inputLabel}>
              Medidas corporales (opcional)
            </Text>
            <View style={styles.measurementsGrid}>
              <View style={styles.measurementInput}>
                <Text style={styles.measurementLabel}>Pecho (cm)</Text>
                <TextInput
                  style={styles.smallInput}
                  value={newEntry.chest}
                  onChangeText={(text) =>
                    setNewEntry((prev) => ({ ...prev, chest: text }))
                  }
                  placeholder="---"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.measurementInput}>
                <Text style={styles.measurementLabel}>Cintura (cm)</Text>
                <TextInput
                  style={styles.smallInput}
                  value={newEntry.waist}
                  onChangeText={(text) =>
                    setNewEntry((prev) => ({ ...prev, waist: text }))
                  }
                  placeholder="---"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.measurementInput}>
                <Text style={styles.measurementLabel}>Brazos (cm)</Text>
                <TextInput
                  style={styles.smallInput}
                  value={newEntry.arms}
                  onChangeText={(text) =>
                    setNewEntry((prev) => ({ ...prev, arms: text }))
                  }
                  placeholder="---"
                  keyboardType="decimal-pad"
                />
              </View>
              <View style={styles.measurementInput}>
                <Text style={styles.measurementLabel}>Muslos (cm)</Text>
                <TextInput
                  style={styles.smallInput}
                  value={newEntry.thighs}
                  onChangeText={(text) =>
                    setNewEntry((prev) => ({ ...prev, thighs: text }))
                  }
                  placeholder="---"
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Notas */}
            <Text style={styles.inputLabel}>Notas (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={newEntry.notes}
              onChangeText={(text) =>
                setNewEntry((prev) => ({ ...prev, notes: text }))
              }
              placeholder="Ej: Empecé nueva rutina, me siento más fuerte..."
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              style={[
                styles.saveButton,
                (!newEntry.photoUri || !newEntry.weight) &&
                  styles.saveButtonDisabled,
              ]}
              onPress={saveProgressEntry}
              disabled={!newEntry.photoUri || !newEntry.weight}
            >
              <Text style={styles.saveButtonText}>
                Guardar Progreso
              </Text>
            </TouchableOpacity>

            <Text style={styles.privacyNote}>
              Privacidad garantizada: Las fotos NO salen de tu
              dispositivo
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Modal para ver detalles */}
      <Modal visible={viewModalVisible} animationType="slide" transparent>
        <SafeAreaView style={styles.modalContainer}>
          {selectedEntry && (
            <ScrollView style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  Detalles del Registro
                </Text>
                <TouchableOpacity
                  onPress={() => setViewModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#ccc" />
                </TouchableOpacity>
              </View>

              {selectedEntry.photoUri && (
                <Image
                  source={{ uri: selectedEntry.photoUri }}
                  style={styles.fullImage}
                />
              )}

              <View style={styles.detailsGrid}>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Fecha</Text>
                  <Text style={styles.detailValue}>
                    {format(
                      parseISO(selectedEntry.date),
                      'EEEE dd MMMM yyyy',
                      { locale: es }
                    )}
                  </Text>
                </View>
                <View style={styles.detailItem}>
                  <Text style={styles.detailLabel}>Peso</Text>
                  <Text style={styles.detailValue}>
                    {selectedEntry.weight} kg
                  </Text>
                </View>
              </View>

              {(selectedEntry.chest ||
                selectedEntry.waist ||
                selectedEntry.arms ||
                selectedEntry.thighs) && (
                <View style={styles.measurementsSection}>
                  <Text style={styles.sectionTitle}>Medidas</Text>
                  <View style={styles.measurementsDetails}>
                    {selectedEntry.chest && (
                      <View style={styles.measurementDetail}>
                        <Text style={styles.measurementDetailLabel}>
                          Pecho
                        </Text>
                        <Text style={styles.measurementDetailValue}>
                          {selectedEntry.chest} cm
                        </Text>
                      </View>
                    )}
                    {selectedEntry.waist && (
                      <View style={styles.measurementDetail}>
                        <Text style={styles.measurementDetailLabel}>
                          Cintura
                        </Text>
                        <Text style={styles.measurementDetailValue}>
                          {selectedEntry.waist} cm
                        </Text>
                      </View>
                    )}
                    {selectedEntry.arms && (
                      <View style={styles.measurementDetail}>
                        <Text style={styles.measurementDetailLabel}>
                          Brazos
                        </Text>
                        <Text style={styles.measurementDetailValue}>
                          {selectedEntry.arms} cm
                        </Text>
                      </View>
                    )}
                    {selectedEntry.thighs && (
                      <View style={styles.measurementDetail}>
                        <Text style={styles.measurementDetailLabel}>
                          Muslos
                        </Text>
                        <Text style={styles.measurementDetailValue}>
                          {selectedEntry.thighs} cm
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              )}

              {selectedEntry.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.sectionTitle}>Notas</Text>
                  <Text style={styles.notesText}>
                    {selectedEntry.notes}
                  </Text>
                </View>
              )}

              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => deleteEntry(selectedEntry.id)}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color="#ff6b6b"
                  />
                  <Text style={styles.deleteButtonText}>
                    Eliminar Registro
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
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
  title: { fontSize: 22, fontWeight: '700', color: '#fff', flex: 1 },
  infoButton: { padding: 5 },

  content: { flex: 1, paddingHorizontal: 16 },

  statsCard: {
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  statsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { color: '#7BE495', fontSize: 24, fontWeight: '700' },
  statValueNegative: { color: '#4DA6FF' },
  statLabel: { color: '#aaa', fontSize: 12, marginTop: 4 },

  chartCard: {
    backgroundColor: '#151515',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  chartTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  chart: { borderRadius: 16, marginLeft: -20 },

  entriesSection: { marginBottom: 30 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: '600' },
  sectionCount: { color: '#666', fontSize: 14 },

  entryCard: {
    backgroundColor: '#151515',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#333',
  },
  entryImage: { width: 80, height: 80 },
  entryInfo: { flex: 1, padding: 12 },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryDate: { color: '#aaa', fontSize: 12 },
  entryWeight: { color: '#fff', fontSize: 20, fontWeight: '700', marginVertical: 4 },
  entryNotes: { color: '#888', fontSize: 13, marginTop: 4 },

  emptyState: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60 },
  emptyTitle: { color: '#fff', fontSize: 20, fontWeight: '600', marginTop: 20 },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyButton: {
    backgroundColor: '#E02424',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },
  emptyButtonText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  loadingText: { color: '#ccc', textAlign: 'center', marginTop: 50, fontSize: 16 },

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

  modalContainer: { flex: 1, backgroundColor: '#0a0a0a' },
  modalContent: { flex: 1, padding: 16 },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { color: '#fff', fontSize: 24, fontWeight: '700' },
  modalSubtitle: {
    color: '#4DA6FF',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },

  photoSection: { marginBottom: 20 },
  addPhotoButton: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333',
    borderStyle: 'dashed',
  },
  addPhotoButtonText: {
    color: '#ccc',
    fontSize: 18,
    marginTop: 15,
    fontWeight: '600',
  },
  addPhotoButtonSubtext: { color: '#666', marginTop: 10 },
  galleryLink: {
    color: '#4DA6FF',
    fontSize: 14,
    marginTop: 5,
    textDecorationLine: 'underline',
  },
  previewImage: { width: '100%', height: 300, borderRadius: 12, marginBottom: 10 },
  photoActionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginTop: 10,
  },
  photoActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  photoActionButtonText: { color: '#fff', fontSize: 14 },

  inputLabel: { color: '#ccc', fontSize: 14, marginBottom: 8, marginTop: 5 },
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
  textArea: { minHeight: 100, textAlignVertical: 'top' },

  measurementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  measurementInput: { width: '48%', marginBottom: 12 },
  measurementLabel: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  smallInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },

  saveButton: {
    backgroundColor: '#E02424',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: { backgroundColor: '#444', opacity: 0.6 },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },

  privacyNote: {
    color: '#7BE495',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },

  fullImage: { width: '100%', height: 400, borderRadius: 12, marginBottom: 20 },

  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailItem: { flex: 1 },
  detailLabel: { color: '#aaa', fontSize: 12, marginBottom: 4 },
  detailValue: { color: '#fff', fontSize: 18, fontWeight: '600' },

  measurementsSection: { marginBottom: 20 },
  measurementsDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  measurementDetail: {
    width: '48%',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },
  measurementDetailLabel: { color: '#aaa', fontSize: 12 },
  measurementDetailValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
  },

  notesSection: { marginBottom: 20 },
  notesText: {
    color: '#ccc',
    fontSize: 15,
    lineHeight: 22,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 10,
  },

  detailActions: { marginBottom: 30 },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#ff6b6b',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
  },
  deleteButtonText: {
    color: '#ff6b6b',
    marginLeft: 8,
    fontWeight: '600',
  },
});
