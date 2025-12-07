import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,

} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Firebase Auth
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../services/firebase"; // 👈 tu archivo firebase.js

export default function LoginScreen({ navigation }) {
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);


  async function ingresar() {
    setErrorMsg("");

    if (!usuario || !password) {
      setErrorMsg("Debes ingresar correo y contraseña.");
      return;
    }

    try {
      setLoading(true);

      // Firebase login
      await signInWithEmailAndPassword(auth, usuario.trim(), password);

      // Login OK → vamos a Tabs
      //navigation.replace("Tabs");

    } catch (error) {
      console.log("⚠️ Error de Firebase:", error.code);

      switch (error.code) {
        case "auth/invalid-email":
          setErrorMsg("El correo no es válido.");
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
          setErrorMsg("Usuario o contraseña incorrectos.");
          break;
        default:
          setErrorMsg("Ocurrió un error. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <ImageBackground
      source={require("../../../assets/Material/fotogym1.jpg")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      {/* LOGO */}
      <Text style={styles.logo}>
        Journal<Text style={styles.logoRed}>Fit</Text>
      </Text>

      {/* Frase motivacional */}
      <Text style={styles.subtitle}>
        El orden es fundamental {"\n"}para resultados reales
      </Text>

      {/* FORM */}
      <View style={styles.form}>
        <TextInput
          value={usuario}
          onChangeText={setUsuario}
          placeholder="Usuario (correo)"
          placeholderTextColor="#999"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

<View style={styles.inputPasswordContainer}>
  <TextInput
    value={password}
    onChangeText={setPassword}
    placeholder="Contraseña"
    placeholderTextColor="#999"
    secureTextEntry={!showPassword}
    style={styles.inputPassword}
  />

  <TouchableOpacity
    onPress={() => setShowPassword(!showPassword)}
    style={styles.eyeButton}
  >
    <Ionicons
      name={showPassword ? "eye-off" : "eye"}
      size={22}
      color="#ccc"
    />
  </TouchableOpacity>
</View>


        {/* Error */}
        {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

        {/* Botón */}
        <TouchableOpacity
          style={styles.button}
          onPress={ingresar}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Ingresar</Text>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.terms}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 25,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },

  logo: {
    fontSize: 42,
    fontWeight: "700",
    color: "#F2F2F2",
    alignSelf: "center",
    marginBottom: 10,
  },

  logoRed: {
    color: "#E02424",
  },

  subtitle: {
    alignSelf: "center",
    color: "#F2F2F2",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
  },
inputPasswordContainer: {
  backgroundColor: "rgba(26,26,26,0.8)",
  borderRadius: 10,
  paddingHorizontal: 15,
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 15,
},

inputPassword: {
  flex: 1,
  color: "#F2F2F2",
  fontSize: 16,
  paddingVertical: 15,
},

eyeButton: {
  paddingHorizontal: 6,
},

  form: {
    width: "100%",
  },

  input: {
    backgroundColor: "rgba(26,26,26,0.8)",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    color: "#F2F2F2",
    fontSize: 16,
  },

  button: {
    backgroundColor: "#E02424",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 5,
    shadowColor: "#E02424",
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },

  buttonText: {
    color: "#F2F2F2",
    fontSize: 19,
    fontWeight: "600",
  },

  error: {
    color: "#ff7777",
    textAlign: "center",
    marginBottom: 10,
    fontSize: 14,
  },

  terms: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 30,
    alignSelf: "center",
  },
});
