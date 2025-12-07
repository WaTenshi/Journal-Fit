import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { VideoView, useVideoPlayer } from "expo-video";
import { COLORS } from "../../utils/colors";

export default function EjercicioDetalle({ route, navigation }) {
  const { ejercicio } = route.params;

  // Crear reproductor solo si existe el video
  const player = ejercicio?.data?.video
    ? useVideoPlayer(ejercicio.data.video, (player) => {
        player.loop = true;
        player.play();
      })
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* Volver */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        {/* Título */}
        <Text style={styles.title}>{ejercicio.nombre}</Text>

        {/* Video */}
        <View style={styles.videoContainer}>
          {player ? (
            <VideoView
              style={styles.video}
              player={player}
              contentFit="cover"
              fullscreenOptions={{
                enabled: true,
              }}
              pictureInPicture={{
                enabled: true,
              }}
            />
          ) : (
            <View style={styles.videoPlaceholder}>
              <Ionicons name="play-circle-outline" size={60} color="#aaa" />
              <Text style={styles.videoPlaceholderText}>
                Próximamente video del ejercicio
              </Text>
            </View>
          )}
        </View>

        {/* Músculos trabajados */}
        <Text style={styles.sectionTitle}>Músculos Trabajados</Text>
        <View style={styles.muscleList}>
          {ejercicio.data.musculos.map((m, index) => (
            <View key={index} style={styles.muscleTag}>
              <Text style={styles.muscleTagText}>{m}</Text>
            </View>
          ))}
        </View>

        {/* Descripción completa */}
        <Text style={styles.sectionTitle}>Descripción Científica</Text>
        <Text style={styles.paragraph}>
          {ejercicio.data.descripcionCompleta}
        </Text>

        {/* Beneficios */}
        <Text style={styles.sectionTitle}>Beneficios</Text>
        <Text style={styles.paragraph}>
          • Evidencia de Schoenfeld, Escamilla, Calatayud y NCSA.{"\n"}
          • Fuerte activación muscular por EMG.{"\n"}
          • Mejora fuerza máxima y funcional.{"\n"}
          • Transferencia directa a movimientos deportivos.{"\n"}
        </Text>

        {/* Ejecución */}
        <Text style={styles.sectionTitle}>Ejecución Correcta</Text>
        <Text style={styles.paragraph}>
          1. Controla el descenso.{"\n"}
          2. Mantén la columna neutra.{"\n"}
          3. Activa el core en todo momento.{"\n"}
          4. Evita perder estabilidad.{"\n"}
        </Text>

        {/* Errores */}
        <Text style={styles.sectionTitle}>Errores Comunes</Text>
        <Text style={styles.paragraph}>
          • Técnica rápida o desordenada.{"\n"}
          • Curvar la zona lumbar.{"\n"}
          • Cargar más peso del debido.{"\n"}
          • No respetar recorrido seguro.{"\n"}
        </Text>

        {/* Variantes */}
        <Text style={styles.sectionTitle}>Variantes</Text>
        <Text style={styles.paragraph}>
          • Sentadilla frontal.{"\n"}
          • Press inclinado.{"\n"}
          • Peso muerto rumano.{"\n"}
          • Fondos en paralelas.{"\n"}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 20,
  },

  backButton: {
    backgroundColor: COLORS.primary,
    width: 48,
    height: 48,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    marginBottom: 20,
  },

  videoContainer: {
    width: "100%",
    height: 230,
    backgroundColor: "#1A1A1A",
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 25,
  },

  video: {
    flex: 1,
    width: "100%",
    height: "100%",
  },

  videoPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  videoPlaceholderText: {
    color: "#888",
    marginTop: 10,
  },

  sectionTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: "700",
    marginTop: 20,
    marginBottom: 8,
  },

  muscleList: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },

  muscleTag: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },

  muscleTagText: {
    color: "#fff",
    fontWeight: "600",
  },

  paragraph: {
    color: "#ccc",
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 6,
  },
});
