import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Navigate from "./src/navigation/Navigate";
import { AuthProvider } from "./src/context/AuthContext";

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
      <StatusBar style="light" translucent={true} />
      <Navigate />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
