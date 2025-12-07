import React, { createContext, useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, getUserData } from "../services/firebase";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Usuario de Firebase Auth
  const [profile, setProfile] = useState(null); // Datos en Firestore
  const [loading, setLoading] = useState(true); // Esperando estado inicial

  useEffect(() => {
    // Escucha en tiempo real si hay user logueado
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser || null);

      if (currentUser) {
        try {
          const data = await getUserData(currentUser.uid);
          setProfile(data || null);
        } catch (error) {
          console.log("Error cargando perfil:", error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    // Limpieza
    return () => unsubscribe();
  }, []);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const data = await getUserData(user.uid);
      setProfile(data || null);
    } catch (error) {
      console.log("Error refrescando perfil:", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
