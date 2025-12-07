import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { AuthContext } from "../../context/AuthContext";
import { getUserData, saveUserData } from "../../services/firebase"; // asumiendo que ya los tienes

export default function PerfilScreen() {
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);

  // Estados del formulario para el modal
  const [modalVisible, setModalVisible] = useState(false);
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");
  const [saving, setSaving] = useState(false);

  // Cargar datos desde Firestore al entrar a la pantalla
  useEffect(() => {
    const cargarPerfil = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserData(user.uid);
        if (data) {
          setPerfil(data);
          setNombre(data.name || "");
          setEdad(data.age != null ? String(data.age) : "");
          setAltura(data.height != null ? String(data.height) : "");
          setPeso(data.weight != null ? String(data.weight) : "");
        }
      } catch (error) {
        console.log("Error cargando perfil:", error);
      } finally {
        setLoading(false);
      }
    };

    cargarPerfil();
  }, [user]);

  const abrirModal = () => {
    // Sincronizamos otra vez con lo que haya en perfil por si cambió algo
    if (perfil) {
      setNombre(perfil.name || "");
      setEdad(perfil.age != null ? String(perfil.age) : "");
      setAltura(perfil.height != null ? String(perfil.height) : "");
      setPeso(perfil.weight != null ? String(perfil.weight) : "");
    }
    setModalVisible(true);
  };

  const guardarCambios = async () => {
    if (!user) {
      Alert.alert("Error", "Debes iniciar sesión nuevamente.");
      return;
    }

    if (!nombre.trim()) {
      Alert.alert("Datos incompletos", "El nombre es obligatorio.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: nombre.trim(),
        age: edad ? Number(edad) : null,
        height: altura ? Number(altura) : null,
        weight: peso ? Number(peso) : null,
      };

      await saveUserData(user.uid, payload); // usa setDoc con merge en firebase.js

      // Actualizamos el estado local para que se vea al tiro
      setPerfil(payload);
      setModalVisible(false);
      Alert.alert("Perfil", "Tu perfil se ha actualizado correctamente.");
    } catch (error) {
      console.log("Error guardando perfil:", error);
      Alert.alert("Error", "No se pudo guardar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const formatValue = (value, suffix = "") => {
    if (value === null || value === undefined || value === "") return "-";
    return suffix ? `${value} ${suffix}` : String(value);
  };

  return (
    <ImageBackground
      source={require("../../../assets/Material/fotogym1.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Mi perfil</Text>
        {!!user?.email && (
          // <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.email}>Hola {perfil?.name}!</Text>
        )}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos personales</Text>

          {loading ? (
            <Text style={styles.loadingText}>Cargando datos...</Text>
          ) : (
            <>
              <View style={styles.row}>
                <Text style={styles.label}>Nombre</Text>
                <Text style={styles.value}>
                  {perfil?.name || "-"}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Edad</Text>
                <Text style={styles.value}>
                  {formatValue(perfil?.age, "años")}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Altura</Text>
                <Text style={styles.value}>
                  {formatValue(perfil?.height, "cm")}
                </Text>
              </View>

              <View style={styles.row}>
                <Text style={styles.label}>Peso</Text>
                <Text style={styles.value}>
                  {formatValue(perfil?.weight, "kg")}
                </Text>
              </View>
            </>
          )}

          <TouchableOpacity
            style={styles.editButton}
            onPress={abrirModal}
            disabled={loading}
          >
            <Text style={styles.editButtonText}>Editar datos</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL PARA EDITAR DATOS */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Editar datos</Text>

            <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
              <Text style={styles.inputLabel}>Nombre</Text>
              <TextInput
                style={styles.input}
                placeholder="Tu nombre"
                placeholderTextColor="#aaa"
                value={nombre}
                onChangeText={setNombre}
              />

              <Text style={styles.inputLabel}>Edad (años)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 25"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={edad}
                onChangeText={setEdad}
              />

              <Text style={styles.inputLabel}>Altura (cm)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 170"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={altura}
                onChangeText={setAltura}
              />

              <Text style={styles.inputLabel}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 70"
                placeholderTextColor="#aaa"
                keyboardType="numeric"
                value={peso}
                onChangeText={setPeso}
              />

              <View style={styles.modalButtonsRow}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                  disabled={saving}
                >
                  <Text style={styles.modalButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton]}
                  onPress={guardarCambios}
                  disabled={saving}
                >
                  <Text style={styles.modalButtonText}>
                    {saving ? "Guardando..." : "Guardar"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#F2F2F2",
  },
  email: {
    marginTop: 4,
    color: "#ddd",
  },
  card: {
    marginTop: 30,
    backgroundColor: "rgba(18,18,18,0.92)",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  sectionTitle: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  loadingText: {
    color: "#bbb",
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  label: {
    color: "#aaa",
    fontSize: 14,
  },
  value: {
    color: "#F2F2F2",
    fontSize: 15,
    fontWeight: "500",
  },
  editButton: {
    marginTop: 18,
    alignSelf: "center",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#E02424",
  },
  editButtonText: {
    color: "#F2F2F2",
    fontSize: 15,
    fontWeight: "600",
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: "#121212",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    maxHeight: "80%",
  },
  modalTitle: {
    color: "#F2F2F2",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 10,
    textAlign: "center",
  },
  inputLabel: {
    color: "#bbb",
    fontSize: 13,
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F2F2F2",
    borderWidth: 1,
    borderColor: "#333",
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#444",
  },
  saveButton: {
    backgroundColor: "#E02424",
  },
  modalButtonText: {
    color: "#F2F2F2",
    fontWeight: "600",
  },
});
