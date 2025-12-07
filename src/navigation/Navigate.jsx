import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthContext } from "../context/AuthContext";

import LoginScreen from "../screens/Login/LoginScreens";
import HomeScreen from "../screens/TabsScreens/HomeScreen";
import PerfilScreen from "../screens/TabsScreens/ProfileScreen";
import ConfiguracionScreen from "../screens/TabsScreens/ConfigureScreen";
import BottomTabs from "./BottomTabs";
import Calculadora1RM from "../screens/StackScreens/Calculadora1RM";
import GuiaEjercicios from "../screens/StackScreens/GuiaEjercicios";
import EjercicioDetalle from "../screens/StackScreens/EjercicioDetalle";
import RegisterScreen from "../screens/Login/RegisterScreen";
import MisRutinasScreen from "../screens/StackScreens/MisRutinasScreen";
import RutinaNovatoScreen from "../screens/Rutinas/RutinaNovatoScreen";
import RutinaIntermedioScreen from "../screens/Rutinas/RutinaIntermedioScreen";
import RutinaAvanzadoScreen from "../screens/Rutinas/RutinaAvanzadoScreen";
import RutinasPersonalizadasScreen from "../screens/Rutinas/RutinasPersonalizadasScreen";
import CustomRoutineDetailScreen from '../screens/Rutinas/CustomRoutineDetailScreen';
import ExerciseDetailScreen from '../screens/Rutinas/ExerciseDetailScreen';
import ProgressScreen from '../screens/StackScreens/ProgressScreen';


const Stack = createNativeStackNavigator();

export default function Navigate() {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return null; // Aquí luego haremos un Splash bonito
    }
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
          animationDuration: 280,
        }}
      >
    {user ? (
        <>
        <Stack.Screen name="Tabs" component={BottomTabs} />
        <Stack.Screen name="Calculadora1RM" component={Calculadora1RM} />
        <Stack.Screen name="GuiaEjercicios" component={GuiaEjercicios} />
        <Stack.Screen name="EjercicioDetalle" component={EjercicioDetalle} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Perfil" component={PerfilScreen} />
        <Stack.Screen name="Configuracion" component={ConfiguracionScreen} />
        <Stack.Screen name="MisRutinas" component={MisRutinasScreen} />
        <Stack.Screen name="RutinaNovato" component={RutinaNovatoScreen} />
        <Stack.Screen name="RutinaIntermedioScreen" component={RutinaIntermedioScreen} />
        <Stack.Screen name="RutinaAvanzado" component={RutinaAvanzadoScreen} />
        <Stack.Screen name="RutinasPersonalizadas" component={RutinasPersonalizadasScreen} />
        <Stack.Screen name="CustomRoutineDetail" component={CustomRoutineDetailScreen} />
        <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
        <Stack.Screen name="MiProgreso" component={ProgressScreen} />

        </>
    ) : (

        <>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        </>
    )}
    </Stack.Navigator>
    </NavigationContainer>
    );
}
