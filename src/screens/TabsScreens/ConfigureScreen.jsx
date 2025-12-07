import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AuthContext } from "../../context/AuthContext";
import { COLORS } from "../../utils/colors";

export default function ConfigureScreen({ navigation }) {
  const { logout } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const renderModule = (icon, title, onPress) => (
    <TouchableOpacity style={styles.module} onPress={onPress}>
      <View style={styles.moduleLeft}>
        <View style={styles.iconContainer}>
          <Ionicons name={icon} size={20} color="#fff" />
        </View>
        <Text style={styles.moduleTitle}>{title}</Text>
      </View>

      <Ionicons name="chevron-forward" size={22} color="#666" />
    </TouchableOpacity>
  );

  const handleInfoApp = () => {
    Alert.alert(
      "JournalFit",
      "Versión 1.0.0\n\nApp enfocada en el registro de entrenamientos, cálculo de 1RM y guía de ejercicios basada en evidencia científica."
    );
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* 🔙 Flecha volver — MISMO estilo de GuíaEjercicios */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 10 }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Título */}
        <Text style={styles.title}>Configuración</Text>

        <Text style={styles.sectionLabel}>General</Text>

        {renderModule("information-circle-outline", "Información de la app", handleInfoApp)}
        {renderModule("exit-outline", "Cerrar Sesión", logout)}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 20,
  },

  /* ← Flecha igual que en GuíaEjercicios */
  backButton: {
    position: "absolute",
    left: 10,
    zIndex: 20,
    backgroundColor: COLORS.primary,
    width: 45,
    height: 45,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    opacity: 0.95,
  },

  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 60,
    marginBottom: 20,
  },

  sectionLabel: {
    color: "#888",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 5,
    textTransform: "uppercase",
  },

  module: {
    backgroundColor: "#1A1A1A",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  moduleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    backgroundColor: COLORS.primary,
  },

  moduleTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
