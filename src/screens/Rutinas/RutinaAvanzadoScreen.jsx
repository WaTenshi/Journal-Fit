import React, {
    useState,
    useEffect,
    useMemo,
    useContext,
} from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert,
} from "react-native";
import { Calendar, LocaleConfig } from "react-native-calendars";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";
import { COLORS } from "../../utils/colors";
import { AuthContext } from "../../context/AuthContext";
import { updateUserData } from "../../services/firebase";
import { Ionicons } from "@expo/vector-icons";

LocaleConfig.locales["es"] = {
    monthNames: [
        "Enero",
        "Febrero",
        "Marzo",
        "Abril",
        "Mayo",
        "Junio",
        "Julio",
        "Agosto",
        "Septiembre",
        "Octubre",
        "Noviembre",
        "Diciembre",
    ],
    monthNamesShort: [
        "Ene",
        "Feb",
        "Mar",
        "Abr",
        "May",
        "Jun",
        "Jul",
        "Ago",
        "Sep",
        "Oct",
        "Nov",
        "Dic",
    ],
    dayNames: [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
    ],
    dayNamesShort: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
    today: "Hoy",
    };
    LocaleConfig.defaultLocale = "es";

    const AVANZADO_ROUTINE = [
    {
        id: "day1",
        label: "Día 1",
        description: "Push pesado – Pecho / Hombros / Tríceps",
        exercises: [
        {
            id: "benchHeavy",
            name: "Press banca plano pesado (barra)",
            area: "Pecho",
            sets: 5,
            reps: "5-6",
        },
        {
            id: "ohp",
            name: "Press militar de pie (barra o mancuernas)",
            area: "Hombros",
            sets: 4,
            reps: "6-8",
        },
        {
            id: "inclineDb",
            name: "Press inclinado con mancuernas",
            area: "Pecho / Hombros",
            sets: 3,
            reps: "8-10",
        },
        {
            id: "dips",
            name: "Fondos en paralelas (asistidos si es necesario)",
            area: "Pecho / Tríceps",
            sets: 3,
            reps: "8-10",
        },
        {
            id: "lateralRaises",
            name: "Elevaciones laterales pesadas",
            area: "Hombros",
            sets: 4,
            reps: "10-12",
        },
        {
            id: "tricepsRope",
            name: "Extensión de tríceps en polea (cuerda)",
            area: "Tríceps",
            sets: 3,
            reps: "10-12",
        },
        ],
    },
    {
        id: "day2",
        label: "Día 2",
        description: "Pull pesado – Espalda / Bíceps",
        exercises: [
        {
            id: "deadlift",
            name: "Peso muerto convencional o sumo",
            area: "Espalda baja / Piernas",
            sets: 4,
            reps: "4-6",
        },
        {
            id: "weightedPullups",
            name: "Dominadas lastradas o jalón pesado",
            area: "Espalda",
            sets: 4,
            reps: "6-8",
        },
        {
            id: "barbellRow",
            name: "Remo con barra Pendlay o Yates",
            area: "Espalda media",
            sets: 4,
            reps: "6-8",
        },
        {
            id: "chestSupportedRow",
            name: "Remo en banco inclinado o máquina",
            area: "Espalda",
            sets: 3,
            reps: "8-10",
        },
        {
            id: "facePull",
            name: "Face pull en polea",
            area: "Hombro posterior",
            sets: 3,
            reps: "12-15",
        },
        {
            id: "heavyCurl",
            name: "Curl de bíceps con barra (pesado)",
            area: "Bíceps",
            sets: 3,
            reps: "6-8",
        },
        ],
    },
    {
        id: "day3",
        label: "Día 3",
        description: "Piernas pesadas – Fuerza y volumen",
        exercises: [
        {
            id: "backSquat",
            name: "Sentadilla trasera pesada",
            area: "Piernas / Glúteos",
            sets: 5,
            reps: "5-6",
        },
        {
            id: "frontSquat",
            name: "Sentadilla frontal o goblet squat pesado",
            area: "Piernas / Core",
            sets: 3,
            reps: "6-8",
        },
        {
            id: "rdlHeavy",
            name: "Peso muerto rumano pesado",
            area: "Isquios / Glúteos",
            sets: 3,
            reps: "6-8",
        },
        {
            id: "legPress",
            name: "Prensa de piernas profunda",
            area: "Piernas",
            sets: 3,
            reps: "10-12",
        },
        {
            id: "legCurl",
            name: "Curl femoral tumbado o sentado",
            area: "Isquios",
            sets: 3,
            reps: "10-12",
        },
        {
            id: "calves",
            name: "Elevaciones de talones en máquina",
            area: "Pantorrillas",
            sets: 4,
            reps: "12-15",
        },
        {
            id: "coreHeavy",
            name: "Plancha con peso / rueda abdominal",
            area: "Core",
            sets: 3,
            reps: "10-15 repeticiones o 30-45 seg",
        },
        ],
    },
    {
        id: "day4",
        label: "Día 4",
        description: "Push volumen – Hipertrofia",
        exercises: [
        {
            id: "inclineBar",
            name: "Press inclinado con barra",
            area: "Pecho / Hombros",
            sets: 4,
            reps: "8-10",
        },
        {
            id: "dbShoulderPress",
            name: "Press de hombros con mancuernas sentado",
            area: "Hombros",
            sets: 3,
            reps: "8-10",
        },
        {
            id: "flyes",
            name: "Aperturas con mancuernas o en máquina",
            area: "Pecho",
            sets: 3,
            reps: "12-15",
        },
        {
            id: "pushups",
            name: "Flexiones lastadas o declinadas",
            area: "Pecho / Hombros / Tríceps",
            sets: 3,
            reps: "Al fallo técnico",
        },
        {
            id: "lateralHighRep",
            name: "Elevaciones laterales altas repeticiones",
            area: "Hombros",
            sets: 4,
            reps: "15-20",
        },
        {
            id: "tricepsDip",
            name: "Fondos en paralelas o en banco",
            area: "Tríceps",
            sets: 3,
            reps: "10-12",
        },
        ],
    },
    {
        id: "day5",
        label: "Día 5",
        description: "Pull + Piernas ligeras – Volumen y detalles",
        exercises: [
        {
            id: "pulldownVolume",
            name: "Jalón al pecho agarre amplio",
            area: "Espalda",
            sets: 4,
            reps: "10-12",
        },
        {
            id: "rowCable",
            name: "Remo en polea baja",
            area: "Espalda",
            sets: 4,
            reps: "10-12",
        },
        {
            id: "rearDelt",
            name: "Pájaros con mancuernas o en peck deck",
            area: "Hombro posterior",
            sets: 3,
            reps: "12-15",
        },
        {
            id: "preacher",
            name: "Curl de bíceps en banco Scott",
            area: "Bíceps",
            sets: 3,
            reps: "10-12",
        },
        {
            id: "walkingLunge",
            name: "Zancadas caminando ligeras",
            area: "Piernas / Glúteos",
            sets: 3,
            reps: "12-15 por pierna",
        },
        {
            id: "coreVolume",
            name: "Elevaciones de piernas colgado o en banco",
            area: "Core",
            sets: 3,
            reps: "12-15",
        },
        ],
    },
];

function createInitialProgress() {
    const result = {};
    AVANZADO_ROUTINE.forEach((day) => {
        result[day.id] = {};
        day.exercises.forEach((ex) => {
        result[day.id][ex.id] = Array(ex.sets).fill(false);
        });
    });
    return result;
}

const todayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export default function RutinaAvanzadoScreen({ navigation }) {
const { user, profile, refreshProfile } = useContext(AuthContext);

const [selectedDayId, setSelectedDayId] = useState("day1");
const [progress, setProgress] = useState(createInitialProgress);
const [saving, setSaving] = useState(false);
const [completedDates, setCompletedDates] = useState([]);
const insets = useSafeAreaInsets();

useEffect(() => {
if (profile?.avanzadoCompletedDates) {
    setCompletedDates(profile.avanzadoCompletedDates);
}
}, [profile]);

const currentDay = useMemo(
() => AVANZADO_ROUTINE.find((d) => d.id === selectedDayId),
[selectedDayId]
);

const handleToggleSet = (exerciseId, setIndex) => {
setProgress((prev) => {
    const copy = { ...prev };
    const dayCopy = { ...copy[selectedDayId] };
    const setsCopy = [...dayCopy[exerciseId]];
    setsCopy[setIndex] = !setsCopy[setIndex];
    dayCopy[exerciseId] = setsCopy;
    copy[selectedDayId] = dayCopy;
    return copy;
});
};

const isExerciseDone = (exercise) => {
const sets = progress[selectedDayId][exercise.id];
return sets.every(Boolean);
};

const isWorkoutDone = useMemo(() => {
const dayProg = progress[selectedDayId];
return currentDay.exercises.every((ex) =>
    dayProg[ex.id].every((v) => v)
);
}, [currentDay, progress, selectedDayId]);

const handleFinishWorkout = async () => {
if (!user) {
    Alert.alert("Sesión expirada", "Vuelve a iniciar sesión.");
    return;
}

if (!isWorkoutDone) {
    Alert.alert(
    "Aún te quedan series",
    "Completa todas las series de todos los ejercicios para finalizar el entrenamiento."
    );
    return;
}

const today = todayString();
if (completedDates.includes(today)) {
    Alert.alert(
    "Ya registrado",
    "Este entrenamiento ya fue marcado como completado hoy."
    );
    return;
}

try {
    setSaving(true);
    const updated = [...completedDates, today];

    await updateUserData(user.uid, {
    avanzadoCompletedDates: updated,
    });

    setCompletedDates(updated);
    await refreshProfile?.();

    Alert.alert(
    "¡Modo bestia!",
    "Entrenamiento avanzado registrado en tu calendario."
    );

    // Resetea solo el día actual
    setProgress((prev) => {
    const copy = { ...prev };
    const dayCopy = { ...copy[selectedDayId] };
    currentDay.exercises.forEach((ex) => {
        dayCopy[ex.id] = Array(ex.sets).fill(false);
    });
    copy[selectedDayId] = dayCopy;
    return copy;
    });
} catch (error) {
    console.log("Error guardando entrenamiento avanzado:", error);
    Alert.alert("Error", "No se pudo registrar el entrenamiento.");
} finally {
    setSaving(false);
}
};

const handleResetRoutine = () => {
if (!user) {
    Alert.alert("Sesión expirada", "Vuelve a iniciar sesión.");
    return;
}

Alert.alert(
    "Reiniciar rutina",
    "Esto borrará el calendario y reseteará todo el progreso de la rutina avanzada. ¿Quieres continuar?",
    [
    { text: "Cancelar", style: "cancel" },
    {
        text: "Sí, resetear",
        style: "destructive",
        onPress: async () => {
        try {
            setSaving(true);

            // Limpiar en Firestore
            await updateUserData(user.uid, {
            avanzadoCompletedDates: [],
            });

            // Limpiar en la app
            setCompletedDates([]);
            setProgress(createInitialProgress());
            await refreshProfile?.();

            Alert.alert(
            "Rutina reiniciada",
            "Se borraron los datos de la rutina avanzada."
            );
        } catch (error) {
            console.log(
            "Error reseteando rutina avanzada:",
            error
            );
            Alert.alert(
            "Error",
            "No se pudo resetear la rutina."
            );
        } finally {
            setSaving(false);
        }
        },
    },
    ]
);
};

const markedDates = useMemo(() => {
const marks = {};
completedDates.forEach((date) => {
    marks[date] = {
    selected: true,
    selectedColor: "#7BE495",
    };
});
return marks;
}, [completedDates]);

return (
<SafeAreaView style={styles.container}>
    <TouchableOpacity
    style={[styles.backButton, { top: insets.top + 10 }]}
    onPress={() => navigation.goBack()}
    >
    <Ionicons name="arrow-back" size={26} color="#fff" />
    </TouchableOpacity>

    <ScrollView
    style={{ flex: 1 }}
    contentContainerStyle={styles.content}
    showsVerticalScrollIndicator={false}
    >
    <Text style={styles.title}>Avanzado</Text>
    <Text style={styles.subtitle}>
        Rutina Push / Pull / Legs (5 días / semana)
    </Text>

    <View style={styles.daysRow}>
        {AVANZADO_ROUTINE.map((day) => {
        const active = day.id === selectedDayId;
        return (
            <TouchableOpacity
            key={day.id}
            style={[
                styles.dayChip,
                active && styles.dayChipActive,
            ]}
            onPress={() => setSelectedDayId(day.id)}
            >
            <Text
                style={[
                styles.dayChipText,
                active && styles.dayChipTextActive,
                ]}
            >
                {day.label}
            </Text>
            </TouchableOpacity>
        );
        })}
    </View>

    <Text style={styles.dayDescription}>
        {currentDay.description}
    </Text>

    {currentDay.exercises.map((ex) => {
        const done = isExerciseDone(ex);
        const sets = progress[selectedDayId][ex.id];

        return (
        <View
            key={ex.id}
            style={[
            styles.exerciseCard,
            done && styles.exerciseCardDone,
            ]}
        >
            <View style={styles.exerciseHeader}>
            <View>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <Text style={styles.exerciseArea}>{ex.area}</Text>
                <Text style={styles.exerciseInfo}>
                {ex.sets} series · {ex.reps}
                </Text>
            </View>
            {done && (
                <Text style={styles.completedText}>Completado</Text>
            )}
            </View>

            <View style={styles.setsRow}>
            {sets.map((checked, index) => (
                <TouchableOpacity
                key={index}
                style={[
                    styles.setCircle,
                    checked && styles.setCircleChecked,
                ]}
                onPress={() =>
                    handleToggleSet(ex.id, index)
                }
                >
                <Text
                    style={[
                    styles.setCircleText,
                    checked && styles.setCircleTextChecked,
                    ]}
                >
                    {index + 1}
                </Text>
                </TouchableOpacity>
            ))}
            </View>
        </View>
        );
    })}

    <TouchableOpacity
        style={[
        styles.finishButton,
        !isWorkoutDone && { opacity: 0.5 },
        ]}
        onPress={handleFinishWorkout}
        disabled={!isWorkoutDone || saving}
    >
        <Text style={styles.finishButtonText}>
        {saving
            ? "Guardando..."
            : "Finalizar entrenamiento de hoy"}
        </Text>
    </TouchableOpacity>

    <View style={styles.notesCard}>
        <Text style={styles.notesTitle}>Pautas importantes</Text>
        <Text style={styles.noteItem}>
        • Calentamiento: 10 minutos de movilidad y activación específica.
        </Text>
        <Text style={styles.noteItem}>
        • Descanso: 90-120 segundos en ejercicios pesados, 60-90 en accesorios.
        </Text>
        <Text style={styles.noteItem}>
        • Técnica: controla la fase excéntrica y evita “rebotar” el peso.
        </Text>
        <Text style={styles.noteItem}>
        • Progresión: aplica sobrecarga progresiva semana a semana (peso o reps).
        </Text>
        <Text style={styles.noteItem}>
        • Gestión de fatiga: si te sientes muy agotado, reduce volumen un 20% una semana.
        </Text>
    </View>

    <Text style={styles.calendarTitle}>
        Calendario de entrenamientos completados
    </Text>
    <Calendar
        firstDay={1}
        markedDates={markedDates}
        theme={{
        calendarBackground: "#111",
        dayTextColor: "#fff",
        monthTextColor: "#fff",
        textSectionTitleColor: "#bbb",
        selectedDayBackgroundColor: "#7BE495",
        todayTextColor: COLORS.primary,
        arrowColor: COLORS.primary,
        }}
    />

    <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetRoutine}
        disabled={saving}
    >
        <Text style={styles.resetButtonText}>
        {saving ? "Procesando..." : "Resetear rutina avanzada"}
        </Text>
    </TouchableOpacity>
    </ScrollView>
</SafeAreaView>
);
}

const styles = StyleSheet.create({
container: {
flex: 1,
backgroundColor: "#050505",
},
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
content: {
paddingHorizontal: 16,
paddingTop: 40,
paddingBottom: 40,
},
title: {
fontSize: 26,
fontWeight: "800",
color: COLORS.text,
marginTop: "8%",
},
subtitle: {
marginTop: 4,
color: "#ccc",
marginBottom: 16,
},
daysRow: {
flexDirection: "row",
flexWrap: "wrap",
marginBottom: 10,
},
dayChip: {
paddingHorizontal: 12,
paddingVertical: 6,
borderRadius: 20,
borderWidth: 1,
borderColor: "#444",
marginRight: 8,
marginBottom: 6,
},
dayChipActive: {
backgroundColor: COLORS.primary,
borderColor: COLORS.primary,
},
dayChipText: {
color: "#ccc",
fontSize: 13,
},
dayChipTextActive: {
color: "#fff",
fontWeight: "600",
},
dayDescription: {
color: "#aaa",
marginBottom: 12,
},
exerciseCard: {
backgroundColor: "#151515",
borderRadius: 16,
padding: 12,
marginBottom: 10,
borderWidth: 1,
borderColor: "#333",
},
exerciseCardDone: {
borderColor: "#7BE495",
},
exerciseHeader: {
flexDirection: "row",
justifyContent: "space-between",
alignItems: "flex-start",
},
exerciseName: {
color: "#fff",
fontWeight: "600",
fontSize: 15,
},
exerciseArea: {
color: "#bbb",
fontSize: 12,
marginTop: 2,
},
exerciseInfo: {
color: "#888",
fontSize: 12,
marginTop: 4,
},
completedText: {
color: "#7BE495",
fontSize: 12,
fontWeight: "600",
},
setsRow: {
flexDirection: "row",
flexWrap: "wrap",
marginTop: 10,
},
setCircle: {
width: 32,
height: 32,
borderRadius: 16,
borderWidth: 1,
borderColor: "#666",
alignItems: "center",
justifyContent: "center",
marginRight: 8,
marginBottom: 8,
backgroundColor: "#111",
},
setCircleChecked: {
backgroundColor: "#7BE495",
borderColor: "#7BE495",
},
setCircleText: {
color: "#ccc",
fontSize: 13,
},
setCircleTextChecked: {
color: "#111",
fontWeight: "700",
},
finishButton: {
marginTop: 18,
backgroundColor: COLORS.primary,
borderRadius: 14,
paddingVertical: 12,
alignItems: "center",
},
finishButtonText: {
color: "#fff",
fontWeight: "600",
fontSize: 15,
},
notesCard: {
marginTop: 24,
backgroundColor: "#111",
borderRadius: 12,
padding: 12,
borderWidth: 1,
borderColor: "#222",
},
notesTitle: {
color: "#fff",
fontWeight: "600",
marginBottom: 6,
},
noteItem: {
color: "#bbb",
fontSize: 12,
marginBottom: 2,
},
calendarTitle: {
marginTop: 24,
marginBottom: 8,
color: "#fff",
fontWeight: "600",
},
resetButton: {
marginTop: 16,
borderRadius: 14,
paddingVertical: 10,
alignItems: "center",
borderWidth: 1,
borderColor: "#ff5c5c",
backgroundColor: "rgba(255,92,92,0.08)",
},
resetButtonText: {
color: "#ff8a8a",
fontWeight: "600",
fontSize: 14,
},
});
