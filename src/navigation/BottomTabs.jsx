import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/TabsScreens/HomeScreen";
import PerfilScreen from "../screens/TabsScreens/ProfileScreen";

import { COLORS } from "../utils/colors";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0D0D0D",
          borderTopColor: "#1A1A1A",
          height: 65,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#777",
        tabBarIcon: ({ color, size }) => {
          if (route.name === "HomeTab") {
            return <Ionicons name="home" size={24} color={color} />;
          }
          if (route.name === "PerfilTab") {
            return <Ionicons name="person-circle" size={24} color={color} />;
          }
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarLabel: "Home" }}
      />

      <Tab.Screen
        name="PerfilTab"
        component={PerfilScreen}
        options={{ tabBarLabel: "Perfil" }}
      />
    </Tab.Navigator>
  );
}
