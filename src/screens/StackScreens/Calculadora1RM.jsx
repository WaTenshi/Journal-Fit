import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../utils/colors";

export default function Calculadora1RM({ navigation }) {
  const [peso, setPeso] = useState("");
  const [reps, setReps] = useState("");
  const [rm, setRM] = useState(null);

  function calcularRM() {
    const p = parseFloat(peso);
    const r = parseFloat(reps);

    if (!p || !r || r < 1 || r > 10) return;

    const resultado = p * (36 / (37 - r));
    setRM(Math.round(resultado));
    Keyboard.dismiss();
  }

  function getPorcentaje(porc) {
    if (!rm) return "-";
    return Math.round((rm * porc) / 100);
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require("../../../assets/Material/fotogym1.jpg")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.overlay} />

        <ScrollView
          contentContainerStyle={{ paddingBottom: 120 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Botón Volver */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Logo */}
          <Text style={styles.logo}>
            Journal<Text style={styles.red}>Fit</Text>
          </Text>

          <Text style={styles.title}>Calculadora de Fuerza Máxima</Text>

          {/* Inputs */}
          <View style={styles.row}>
            <View style={styles.field}>
              <Text style={styles.label}>Peso Levantado</Text>
              <TextInput
                style={styles.input}
                value={peso}
                onChangeText={setPeso}
                placeholder="100kg"
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Repeticiones (1-10)</Text>
              <TextInput
                style={styles.input}
                value={reps}
                onChangeText={setReps}
                placeholder="5"
                placeholderTextColor="#888"
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.calcButton} onPress={calcularRM}>
            <Text style={styles.calcButtonText}>Calcular</Text>
          </TouchableOpacity>

          {/* RESULTADO EN TABLA */}
          {rm && (
            <View style={styles.resultBox}>
              <Text style={styles.resultTitle}>
                Repetición Máxima ( {rm} )
              </Text>

              <View style={styles.table}>
                <View style={styles.col}>
                  {["95", "90", "85", "80", "75"].map((por) => (
                    <View style={styles.rowTable} key={por}>
                      <Text style={styles.porcentaje}>{por}%</Text>
                      <Text style={styles.valor}>{getPorcentaje(por)}kg</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.col}>
                  {["70", "65", "60", "55", "50"].map((por) => (
                    <View style={styles.rowTable} key={por}>
                      <Text style={styles.porcentaje}>{por}%</Text>
                      <Text style={styles.valor}>{getPorcentaje(por)}kg</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* BLOQUE INFORMATIVO */}
          <View style={styles.infoBox}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={COLORS.accent}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.infoTitle}>
                ¿Por qué calcular tu 1RM?
              </Text>
            </View>

            <Text style={styles.infoText}>
              Tu 1RM (Repetición Máxima) es el peso máximo que puedes levantar
              una sola vez con técnica correcta. Conocer este valor te permite:
            </Text>

            <Text style={styles.infoPoint}>• Ajustar tus cargas con precisión.</Text>
            <Text style={styles.infoPoint}>• Entrenar por porcentajes de forma segura.</Text>
            <Text style={styles.infoPoint}>• Medir tu progreso real mes a mes.</Text>
            <Text style={styles.infoPoint}>• Evitar sobreentrenamiento y lesiones.</Text>
          </View>
        </ScrollView>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, paddingHorizontal: 25, paddingTop: 70 },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },

  backButton: {
    position: "absolute",
    bottom: 25,
    left: 25,
    backgroundColor: COLORS.primary,
    padding: 12,
    borderRadius: 50,
    zIndex: 20,
  },

  logo: {
    fontSize: 34,
    fontWeight: "700",
    color: COLORS.text,
    alignSelf: "center",
    marginBottom: 8,
  },
  red: { color: COLORS.primary },

  title: {
    fontSize: 22,
    textAlign: "center",
    color: COLORS.text,
    marginBottom: 30,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  field: { width: "48%" },

  label: { color: COLORS.text, marginBottom: 8, fontSize: 14 },

  input: {
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
  },

  calcButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    marginTop: 25,
    borderRadius: 10,
    alignItems: "center",
  },
  calcButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "600",
  },

  resultBox: {
    backgroundColor: "rgba(20,20,20,0.85)",
    padding: 20,
    borderRadius: 12,
    marginTop: 30,
  },

  resultTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },

  table: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  col: { width: "45%" },

  rowTable: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },

  porcentaje: { color: COLORS.text, fontSize: 16 },
  valor: { color: COLORS.text, fontSize: 16, fontWeight: "600" },

  infoBox: {
    marginTop: 30,
    backgroundColor: "rgba(255,255,255,0.08)",
    padding: 16,
    borderRadius: 10,
  },
  infoTitle: { color: COLORS.accent, fontSize: 16, fontWeight: "600" },
  infoText: { color: COLORS.text, marginTop: 8, lineHeight: 20 },
  infoPoint: { color: COLORS.text, marginTop: 4, marginLeft: 10 },
});
