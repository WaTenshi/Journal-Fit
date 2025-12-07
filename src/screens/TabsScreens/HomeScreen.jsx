import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../utils/colors";
import { AuthContext } from "../../context/AuthContext";

export default function HomeScreen({ navigation }) {
  const { user, profile } = useContext(AuthContext);

  // Nombre a mostrar: primero el del perfil, si no hay usamos el email o algo genérico
  const displayName =
    (profile && profile.name) ||
    (user && user.email) ||
    "atleta";

  return (
    <ImageBackground
      source={require("../../../assets/Material/fotogym1.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.header}>
        <Text style={styles.logo}>
          Journal<Text style={styles.red}>Fit</Text>
        </Text>
        <Text style={styles.welcome}>Bienvenido {displayName}!</Text>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("MisRutinas")}>
          <Ionicons name="barbell" size={40} color={COLORS.primary} />
          <Text style={styles.cardText}>Mis Rutinas</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Calculadora1RM")}
        >
          <Ionicons name="calculator" size={40} color={COLORS.primary} />
          <Text style={styles.cardText}>Calculadora 1RM</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("GuiaEjercicios")}
        >
          <Ionicons name="book" size={40} color={COLORS.primary} />
          <Text style={styles.cardText}>Guía de ejercicios</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("Configuracion")}
        >
          <Ionicons name="settings" size={40} color={COLORS.primary} />
          <Text style={styles.cardText}>Configuración</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('MiProgreso')}
        >
          <Ionicons name="trending-up" size={40} color={COLORS.primary} />
          <Text style={styles.cardText}>Mi Progreso</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    fontSize: 34,
    fontWeight: "bold",
    color: COLORS.text,
  },
  red: {
    color: COLORS.primary,
  },
  welcome: {
    marginTop: 15,
    fontSize: 20,
    color: COLORS.text,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    height: 160,
    backgroundColor: "#1A1A1A",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardText: {
    color: COLORS.text,
    marginTop: 15,
    fontSize: 16,
    textAlign: "center",
  },
});
