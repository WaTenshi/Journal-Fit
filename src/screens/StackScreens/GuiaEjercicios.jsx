import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../utils/colors";

export default function GuiaEjercicios({ navigation }) {
  const insets = useSafeAreaInsets();

  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("Todos");

  const grupos = ["Todos", "Piernas", "Pecho", "Espalda"];

  const ejercicios = [
    {
      id: 1,
      nombre: "Sentadilla Libre con Barra",
      grupo: "Piernas",
      descripcion: "Ejercicio multiarticular para cuádriceps y glúteos.",
      imagen: require("../../../assets/Material/sentadillafoto.png"),
      data: {
        video: require("../../../assets/Material/sentadilla.mp4"),
        musculos: ["Cuádriceps", "Glúteos", "Erectores"],
        descripcionCompleta:
          "La sentadilla libre con barra es el patrón dominante de rodilla más eficiente para aumentar fuerza e hipertrofia en cuádriceps según Schoenfeld 2010–2020. Estudios biomecánicos (Escamilla 2001) confirman alta activación del glúteo en rangos profundos.",
      },
    },
    {
      id: 2,
      nombre: "Press Banca con Barra",
      grupo: "Pecho",
      descripcion: "Componente básico de empuje horizontal.",
      imagen: require("../../../assets/Material/pressbancafoto.png"),
      data: {
        video: require("../../../assets/Material/pressbanca.mp4"),
        musculos: ["Pectoral Mayor", "Tríceps", "Deltoides Anterior"],
        descripcionCompleta:
          "El press banca es el ejercicio base de empuje horizontal con mayor activación del pectoral mayor según el estudio EMG de Calatayud (2015). Es ideal para fuerza y desarrollo del pectoral.",
      },
    },
    {
      id: 3,
      nombre: "Peso Muerto con Barra",
      grupo: "Espalda",
      descripcion: "Dominante de cadera, fuerza total.",
      imagen: require("../../../assets/Material/pesomuerto.png"),
      data: {
        video: require("../../../assets/Material/pesomuerto.mp4"),
        musculos: ["Glúteos", "Isquiotibiales", "Erectores"],
        descripcionCompleta:
          "El peso muerto es el rey del patrón dominante de cadera. Estudios biomecánicos (Escamilla 2000) muestran máxima activación en glúteos y erectores espinales.",
      },
    },
  ];

  const ejerciciosFiltrados = ejercicios.filter((ej) => {
    const coincideNombre = ej.nombre.toLowerCase().includes(search.toLowerCase());
    const coincideGrupo =
      selectedGroup === "Todos" || ej.grupo === selectedGroup;
    return coincideNombre && coincideGrupo;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Botón VOLVER */}
      <TouchableOpacity
        style={[styles.backButton, { top: insets.top + 1 }]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={26} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title}>Guía de Ejercicios</Text>

      {/* Buscador */}
      <View style={styles.searchView}>
        <Ionicons name="search" size={20} color="#aaa" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar ejercicio..."
          placeholderTextColor="#888"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterContainer}
        style={styles.filterRow}
      >
        {grupos.map((g) => (
          <TouchableOpacity
            key={g}
            onPress={() => setSelectedGroup(g)}
            style={[
              styles.filterButton,
              selectedGroup === g && styles.filterButtonActive,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                selectedGroup === g && styles.filterTextActive,
              ]}
            >
              {g}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista */}
      <FlatList
        data={ejerciciosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              navigation.navigate("EjercicioDetalle", { ejercicio: item })
            }
          >
            <Image source={item.imagen} style={styles.cardImg} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.nombre}</Text>
              <Text style={styles.cardDesc}>{item.descripcion}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, padding: 20 },

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
    marginBottom: 20,
    textAlign: "center",
  },

  searchView: {
    flexDirection: "row",
    backgroundColor: "#1A1A1A",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },

  searchInput: {
    marginLeft: 10,
    color: "#fff",
    flex: 1,
  },

  /* FILTROS */
  filterContainer: {
    alignItems: "center",
    paddingHorizontal: 5,
  },

  filterRow: {
    marginBottom: 15,
    maxHeight: 50,
  },

  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    backgroundColor: "#1A1A1A",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#333",
    marginRight: 12,
    flexShrink: 0,
  },

  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filterText: {
    color: "#ccc",
    fontSize: 15,
    fontWeight: "500",
  },

  filterTextActive: {
    color: "#fff",
    fontWeight: "700",
  },

  /* CARDS */
  card: {
    flexDirection: "row",
    backgroundColor: "#141414",
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
  },

  cardImg: {
    width: 100,
    height: 100,
  },

  cardContent: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },

  cardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
  },

  cardDesc: {
    color: "#999",
    fontSize: 13,
    marginTop: 4,
  },
});
