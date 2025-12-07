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

import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, saveUserData } from "../../services/firebase";

export default function RegisterScreen({ navigation }) {
  const [nombre, setNombre] = useState("");
  const [edad, setEdad] = useState("");
  const [altura, setAltura] = useState("");
  const [peso, setPeso] = useState("");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleRegister = async () => {
    setErrorMsg("");

    if (!nombre || !edad || !altura || !peso || !email || !password || !password2) {
      setErrorMsg("Completa todos los campos.");
      return;
    }

    if (password !== password2) {
      setErrorMsg("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    try {
      // 1) Crear usuario en Auth
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      const uid = cred.user.uid;

      // 2) Guardar perfil en Firestore
      await saveUserData(uid, {
        name: nombre,
        age: Number(edad),
        height: Number(altura),
        weight: Number(peso),
      });

      // No navegamos manualmente: onAuthStateChanged se encargará
      // navigation.replace("HomeTab");
    } catch (error) {
      console.log("Error registro:", error);
      let msg = "Error al crear tu cuenta.";
      if (error.code === "auth/email-already-in-use") {
        msg = "Este correo ya está registrado.";
      } else if (error.code === "auth/invalid-email") {
        msg = "El correo no es válido.";
      } else if (error.code === "auth/weak-password") {
        msg = "La contraseña es demasiado débil.";
      }
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/Material/fotogym1.jpg")}
      style={styles.bg}
      resizeMode="cover"
    >
      <View style={styles.overlay} />

      <View style={styles.container}>
        <Text style={styles.logo}>
          Journal<Text style={styles.logoRed}>Fit</Text>
        </Text>
        <Text style={styles.subtitle}>
          Crea tu cuenta y empieza a registrar tu progreso
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Datos personales</Text>

          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor="#aaa"
            value={nombre}
            onChangeText={setNombre}
          />

          <TextInput
            style={styles.input}
            placeholder="Edad"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={edad}
            onChangeText={setEdad}
          />

          <TextInput
            style={styles.input}
            placeholder="Altura (cm)"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={altura}
            onChangeText={setAltura}
          />

          <TextInput
            style={styles.input}
            placeholder="Peso (kg)"
            placeholderTextColor="#aaa"
            keyboardType="numeric"
            value={peso}
            onChangeText={setPeso}
          />

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>
            Datos de acceso
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Correo electrónico"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Contraseña"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword((prev) => !prev)}
            >
              <Ionicons
                name={showPassword ? "eye-off" : "eye"}
                size={22}
                color="#ccc"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Repite la contraseña"
              placeholderTextColor="#aaa"
              secureTextEntry={!showPassword2}
              value={password2}
              onChangeText={setPassword2}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword2((prev) => !prev)}
            >
              <Ionicons
                name={showPassword2 ? "eye-off" : "eye"}
                size={22}
                color="#ccc"
              />
            </TouchableOpacity>
          </View>

          {errorMsg ? <Text style={styles.error}>{errorMsg}</Text> : null}

          <TouchableOpacity
            style={styles.button}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.link}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.65)",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 70,
  },
  logo: {
    fontSize: 40,
    fontWeight: "800",
    color: "#F2F2F2",
  },
  logoRed: {
    color: "#E02424",
  },
  subtitle: {
    marginTop: 4,
    color: "#ddd",
    fontSize: 14,
  },
  card: {
    marginTop: 30,
    padding: 18,
    borderRadius: 18,
    backgroundColor: "rgba(18,18,18,0.92)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  sectionTitle: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#1E1E1E",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#F2F2F2",
    borderWidth: 1,
    borderColor: "#333",
    marginBottom: 10,
  },
  passwordRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  eyeButton: {
    marginLeft: 8,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#E02424",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#E02424",
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: "#F2F2F2",
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: "#ff7777",
    textAlign: "center",
    marginBottom: 6,
    marginTop: 4,
  },
  link: {
    textAlign: "center",
    color: "#4DA6FF",
    marginTop: 10,
    fontSize: 14,
  },
});
