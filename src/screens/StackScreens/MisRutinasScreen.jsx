import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../utils/colors";

export default function MisRutinasScreen({ navigation }) {
const rutinas = [
{
    id: "novato",
    titulo: "NOVATO",
    subtitulo: "Entrenamientos suaves",
    descripcion: "Movilidad, cardio, técnica básica.",
    icono: "walk-outline",
    chip1: "3 días / semana",
    chip2: "Full body",
    imagen: require("../../../assets/Material/sentadillafoto.png"), 
    onPress: () => navigation.navigate("RutinaNovato"),
},
{
    id: "intermedio",
    titulo: "INTERMEDIO",
    subtitulo: "Entrenamientos normales",
    descripcion: "Calistenia, HIIT, fuerza moderada.",
    icono: "fitness-outline",
    chip1: "4 días / semana",
    chip2: "Upper / Lower",
    imagen: require("../../../assets/Material/sentadillafoto.png"),
    onPress: () => navigation.navigate("RutinaIntermedioScreen"),
},
{
    id: "avanzado",
    titulo: "AVANZADO",
    subtitulo: "Entrenamientos intensos",
    descripcion: "Pesos libres, streetlifting, fuerza máxima.",
    icono: "flame-outline",
    chip1: "5 días / semana",
    chip2: "Push / Pull / Legs",
    imagen: require("../../../assets/Material/sentadillafoto.png"),
    onPress: () => navigation.navigate("RutinaAvanzado"),
},
{
    id: "personalizado",
    titulo: "PERSONALIZADO",
    subtitulo: "Tú eres responsable.",
    descripcion: "Crea tu rutina con la Guía de Ejercicios.",
    icono: "construct-outline",
    chip1: "Totalmente editable",
    chip2: "Tus ejercicios",
    imagen: require("../../../assets/Material/sentadillafoto.png"),
    onPress: () => navigation.navigate("RutinasPersonalizadas"),
    // luego ahí usamos la GuiaEjercicios para elegir ejercicios
},
];

return (
<ImageBackground
    source={require("../../../assets/Material/fotogym1.jpg")}
    style={styles.bg}
    resizeMode="cover"
>
    <View style={styles.overlay} />

    <SafeAreaView style={styles.safe}>
    <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
    >
        <Text style={styles.logo}>
        Journal<Text style={styles.logoRed}>Fit</Text>
        </Text>
        <Text style={styles.subtitle}>Elige el tipo de rutina que quieres seguir</Text>

        {rutinas.map((item) => (
        <TouchableOpacity
            key={item.id}
            style={styles.card}
            activeOpacity={0.9}
            onPress={item.onPress}
        >
            <View style={styles.cardTextArea}>
            <Text style={styles.cardTitle}>{item.titulo}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitulo}</Text>
            <Text style={styles.cardDesc}>{item.descripcion}</Text>

            <View style={styles.chipsRow}>
                <View style={styles.chip}>
                <Ionicons
                    name={item.icono}
                    size={16}
                    color="#fff"
                    style={{ marginRight: 6 }}
                />
                <Text style={styles.chipText}>{item.chip1}</Text>
                </View>
                <View style={styles.chip}>
                <Ionicons
                    name="time-outline"
                    size={16}
                    color="#fff"
                    style={{ marginRight: 6 }}
                />
                <Text style={styles.chipText}>{item.chip2}</Text>
                </View>
            </View>
            </View>

            <View style={styles.imageContainer}>
            <Image source={item.imagen} style={styles.cardImage} />
            </View>
        </TouchableOpacity>
        ))}
    </ScrollView>
    </SafeAreaView>
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
safe: {
flex: 1,
paddingHorizontal: 16,
},
scrollContent: {
paddingTop: 40,
paddingBottom: 30,
},
logo: {
fontSize: 34,
fontWeight: "800",
color: COLORS.text,
textAlign: "center",
},
logoRed: {
color: COLORS.primary,
},
subtitle: {
marginTop: 8,
color: "#ddd",
textAlign: "center",
marginBottom: 25,
},

card: {
flexDirection: "row",
backgroundColor: "rgba(20,20,20,0.9)",
borderRadius: 26,
padding: 16,
marginBottom: 16,
alignItems: "center",
borderWidth: 1,
borderColor: "rgba(255,255,255,0.08)",
},
cardTextArea: {
flex: 1,
paddingRight: 10,
},
cardTitle: {
color: "#fff",
fontSize: 16,
letterSpacing: 1.2,
fontWeight: "800",
},
cardSubtitle: {
color: "#ccc",
fontSize: 12,
marginTop: 4,
textTransform: "uppercase",
},
cardDesc: {
color: "#aaa",
fontSize: 12,
marginTop: 6,
},
chipsRow: {
flexDirection: "row",
marginTop: 10,
},
chip: {
flexDirection: "row",
alignItems: "center",
backgroundColor: "rgba(255,255,255,0.08)",
borderRadius: 20,
paddingHorizontal: 10,
paddingVertical: 4,
marginRight: 8,
},
chipText: {
color: "#fff",
fontSize: 11,
},

imageContainer: {
width: 70,
height: 70,
borderRadius: 40,
overflow: "hidden",
borderWidth: 2,
borderColor: "#fff",
},
cardImage: {
width: "100%",
height: "100%",
},
});
