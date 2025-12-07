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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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


const NOVATO_ROUTINE = [
  {
    id: "day1",
    label: "Día 1",
    description: "Cuerpo completo – énfasis técnica",
    exercises: [
      {
        id: "squat",
        name: "Sentadilla con barra o mancuernas",
        area: "Piernas / Glúteos",
        sets: 3,
        reps: "10-12",
      },
      {
        id: "bench",
        name: "Press de pecho (barra o mancuernas)",
        area: "Pecho",
        sets: 3,
        reps: "10-12",
      },
      {
        id: "row",
        name: "Remo con mancuernas o dominadas asistidas",
        area: "Espalda",
        sets: 3,
        reps: "10-12",
      },
      {
        id: "military",
        name: "Press militar",
        area: "Hombros",
        sets: 3,
        reps: "10-12",
      },
      {
        id: "plank",
        name: "Plancha",
        area: "Core",
        sets: 3,
        reps: "30-60 segundos",
      },
    ],
  },
  {
    id: "day2",
    label: "Día 2",
    description: "Cuerpo completo – variación",
    exercises: [
      {
        id: "rdl",
        name: "Peso muerto rumano o zancadas",
        area: "Piernas / Glúteos",
        sets: 3,
        reps: "10-12",
      },
      {
        id: "pushups",
        name: "Flexiones",
        area: "Pecho",
        sets: 3,
        reps: "Al fallo o máximo posible",
      },
      {
        id: "pulldown",
        name: "Remo al mentón o jalón al pecho",
        area: "Espalda",
        sets: 3,
        reps: "10-12",
      },
      {
        id: "lateral",
        name: "Elevaciones laterales con mancuerna",
        area: "Hombros",
        sets: 3,
        reps: "12-15",
      },
      {
        id: "legraises",
        name: "Elevación de piernas",
        area: "Core",
        sets: 3,
        reps: "15",
      },
    ],
  },
  {
    id: "day3",
    label: "Día 3",
    description: "Repetición Día 1",
    exercises: [
      {
        id: "squat3",
        name: "Sentadilla con barra o mancuernas",
        area: "Piernas / Glúteos",
        sets: 3,
        reps: "10-12",
      },
      {
        id: "bench3",
        name: "Press de pecho (barra o mancuernas)",
        area: "Pecho",
        sets: 3,
        reps: "10-12",
      },
      {
        id: "row3",
        name: "Remo con mancuernas o dominadas asistidas",
        area: "Espalda",
        sets: 3,
        reps: "10-12",
      },
      {
        id: "military3",
        name: "Press militar",
        area: "Hombros",
        sets: 3,
        reps: "10-12",
      },
      {
        id: "plank3",
        name: "Plancha",
        area: "Core",
        sets: 3,
        reps: "30-60 segundos",
      },
    ],
  },
];

function createInitialProgress() {
  const result = {};
  NOVATO_ROUTINE.forEach((day) => {
    result[day.id] = {};
    day.exercises.forEach((ex) => {
      result[day.id][ex.id] = Array(ex.sets).fill(false);
    });
  });
  return result;
}

export default function RutinaNovatoScreen({ navigation }) {
    const { user, profile, refreshProfile } = useContext(AuthContext);

    const [selectedDayId, setSelectedDayId] = useState("day1");
    const [progress, setProgress] = useState(createInitialProgress);
    const [saving, setSaving] = useState(false);
    const insets = useSafeAreaInsets();
    const [completedDates, setCompletedDates] = useState([]);

    useEffect(() => {
        if (profile?.novatoCompletedDates) {
        setCompletedDates(profile.novatoCompletedDates);
        }
    }, [profile]);

    const currentDay = useMemo(
        () => NOVATO_ROUTINE.find((d) => d.id === selectedDayId),
        [selectedDayId]
    );

    const handleResetRoutine = () => {
    if (!user) {
        Alert.alert("Sesión expirada", "Vuelve a iniciar sesión.");
        return;
        }

        Alert.alert(
        "Reiniciar rutina",
        "Esto borrará el calendario y reseteará todo el progreso de la rutina de novato. ¿Quieres continuar?",
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
                    novatoCompletedDates: [],
                });

                // Limpiar en la app
                setCompletedDates([]);
                setProgress(createInitialProgress());
                await refreshProfile?.();

                Alert.alert(
                    "Rutina reiniciada",
                    "Se borraron los datos de la rutina de novato."
                );
                } catch (error) {
                console.log(
                    "Error reseteando rutina de novato:",
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

const todayString = () => {
  const d = new Date();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};
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
        novatoCompletedDates: updated,
      });

      setCompletedDates(updated);
      await refreshProfile?.();

      Alert.alert(
        "¡Buen trabajo!",
        "Entrenamiento de hoy registrado en tu calendario."
      );

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
      console.log("Error guardando entrenamiento novato:", error);
      Alert.alert("Error", "No se pudo registrar el entrenamiento.");
    } finally {
      setSaving(false);
    }
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

        <Text style={styles.title}>Novato</Text>
        <Text style={styles.subtitle}>
          Rutina de cuerpo completo (3 días / semana)
        </Text>

        <View style={styles.daysRow}>
          {NOVATO_ROUTINE.map((day) => {
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

        {/* Ejercicios del día */}
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
            • Calentamiento: 5-10 minutos de movilidad y
            estiramientos dinámicos.
          </Text>
          <Text style={styles.noteItem}>
            • Descanso: 30-60 segundos entre series.
          </Text>
          <Text style={styles.noteItem}>
            • Técnica primero: cuida la forma antes que el peso.
          </Text>
          <Text style={styles.noteItem}>
            • Progresión: aumenta peso/reps/series poco a poco.
          </Text>
          <Text style={styles.noteItem}>
            • Sueño y alimentación: claves para recuperar y crecer.
          </Text>
        </View>

        <Text style={styles.calendarTitle}>
          Calendario de entrenamientos completados
        </Text>
        <Calendar
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
            {saving ? "Procesando..." : "Resetear rutina de novato"}
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
    marginTop:"8%",
  },
  subtitle: {
    marginTop: 4,
    color: "#ccc",
    marginBottom: 16,
  },
  daysRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#444",
    marginRight: 8,
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
