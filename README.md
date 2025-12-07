# Journal Fit

Journal Fit es una app móvil hecha con React Native + Expo pensada como un diario de entrenamiento inteligente: combina rutinas guiadas, rutinas personalizadas, registro de progreso físico y seguimiento de tus entrenos.

Está diseñada para ser usada directamente en el gimnasio, reemplazando el clásico “bloc de notas” y permitiendo guardar en la nube tus rutinas y registros importantes.

---

## Características principales

### Rutinas preestablecidas

Módulo con rutinas guiadas por nivel:

- Novato: rutina de introducción, centrada en aprender técnica y generar hábito.
- Intermedio: rutina más exigente para quien ya domina lo básico.
- Avanzado: rutina desafiante para usuarios con buena experiencia de entrenamiento.

Cada rutina incluye:
- División por días / grupos musculares según el diseño que trabajamos.
- Ejercicios, series, repeticiones y descansos sugeridos.
- Progreso visual de la rutina (porcentaje completado, etc.).

---

### Rutinas personalizadas (módulo clave)

Módulo donde el usuario puede crear sus propias rutinas, con lógica de “bloc de notas mejorado”:

- El usuario puede crear hasta 10 rutinas personalizadas.
- Cada rutina tiene:
  - Nombre (ej: “Push/Pull/Legs”, “Full Body 3x”, etc.).
  - Descripción breve.
  - Color de borde personalizado (paleta predefinida de colores para las tarjetas).

Dentro de cada rutina personalizada:
- El usuario puede:
  - Elegir el orden de los ejercicios.
  - Añadir ejercicios desde una lista de ejercicios filtrable (por tipo: pesas libres, máquinas, peso corporal, cardio, estiramientos, yoga, etc.).
  - Para cada ejercicio puede registrar:
    - Series
    - Repeticiones
    - Peso utilizado
    - RIR / sensación de esfuerzo
    - Notas específicas si se desea
- Todo se guarda en Firestore, para no perder la información aunque cambie de teléfono o reinstale la app.

Toda la lógica de guardado/carga de rutinas personalizadas está encapsulada en helpers como `firebaseCustomRoutines.js`.

---

### Módulo de progreso (fotos y métricas)

Módulo “Mi Progreso” enfocado en el seguimiento físico:

- Registro de:
  - Peso corporal (obligatorio para guardar).
  - Medidas opcionales: pecho, cintura, brazos, muslos.
  - Notas (ej: “subí peso en sentadilla”, “inicié nueva rutina”, etc.).
  - Foto de progreso seleccionada desde la galería.
- Las fotos se guardan localmente en el dispositivo usando `AsyncStorage` (no se suben a internet).
- Estadísticas:
  - Número total de registros.
  - Cambio de peso entre el primer y el último registro.
  - Días totales entre el primer y el último registro.
- Gráfico de evolución del peso (últimos 6 meses) usando `react-native-chart-kit`.
- Historial de registros ordenado por fecha, con:
  - Miniatura de la foto.
  - Fecha formateada.
  - Peso.
  - Notas recortadas.
- Vista de detalle de registro:
  - Foto en grande.
  - Fecha completa (formato tipo “lunes 02 diciembre 2025”).
  - Peso y todas las medidas.
  - Notas.
  - Botón para eliminar el registro.

---

### Navegación

Se utiliza React Navigation para estructurar la app:

- `@react-navigation/native`
- `@react-navigation/native-stack`
- `@react-navigation/bottom-tabs`
- `@react-navigation/drawer`

Lo habitual:
- Bottom Tabs para secciones principales (por ejemplo: Inicio, Rutinas, Progreso, Perfil).
- Drawer para accesos secundarios / configuración adicional.

---

## Stack técnico

- Framework: Expo (`expo@~54.0.25`)
- React Native: `0.81.5`
- React: `19.1.0`

### UI y componentes

- `react-native-paper` – componentes de UI (botones, cards, etc.).
- `react-native-vector-icons` – iconografía.
- `react-native-safe-area-context`, `react-native-screens` – integración con navegación y safe areas.

### Estado, formularios y validación

- `zustand` – manejo de estado global ligero para ciertas partes de la app.
- `react-hook-form` – manejo de formularios (por ejemplo, creación de rutinas).
- `yup` – validación de formularios (reglas de campos obligatorios, formatos, etc.).

### Backend y datos

- `firebase` – conexión con Firestore para guardar rutinas personalizadas y sus ejercicios.
- `@react-native-async-storage/async-storage` – almacenamiento local (por ejemplo, progreso con fotos).
- `axios` – llamadas HTTP/REST si se integran servicios externos.

### Utilidades

- `date-fns` – manejo y formateo de fechas (incluyendo locale `es`).
- `expo-image-picker` – selección de imágenes desde la galería.
- `expo-video` – para reproducir videos (por ejemplo, demostraciones de ejercicios).
- `react-native-calendars` – vista de calendario (seguimiento de entrenos, días entrenados, etc.).
- `react-native-chart-kit` – gráficos (evolución de peso).

`expo-camera` está instalado, pero actualmente el módulo de progreso está configurado solo para seleccionar fotos desde galería (la cámara está desactivada en la UI en la versión actual).

---

## Estructura aproximada del proyecto

(Los nombres pueden variar, esta es una guía conceptual)

- `App.js` / `index.js`  
  Configuración principal de la app y navegación raíz.

- `navigation/`  
  - `RootNavigator.js`
  - `BottomTabs.js`
  - `DrawerNavigator.js`

- `screens/`
  - `HomeScreen.jsx` – resumen general / bienvenida.
  - `BeginnerRoutineScreen.jsx` – rutina novata.
  - `IntermediateRoutineScreen.jsx` – rutina intermedia.
  - `AdvancedRoutineScreen.jsx` – rutina avanzada.
  - `RutinasPersonalizadasScreen.jsx` – listado y creación de rutinas personalizadas.
  - `CustomRoutineDetailScreen.jsx` – detalle de una rutina personalizada (ejercicios, sets, etc.).
  - `ProgressScreen.jsx` – módulo “Mi Progreso”.

- `firebase/` o `services/`
  - `firebaseCustomRoutines.js` – helpers para CRUD de rutinas personalizadas en Firestore.
  - Config de Firebase (por ejemplo `firebaseConfig.js`).

- `store/`
  - Archivos de Zustand para estado global (por ejemplo, usuario, rutinas, etc.).

- `components/`
  - Componentes reutilizables (tarjetas de rutina, lista de ejercicios, modales, etc.).

---

## Configuración y ejecución

### 1. Requisitos previos

- Node.js (versión LTS recomendada).
- npm, yarn o pnpm.
- Expo CLI (opcional, se puede usar `npx expo` directamente).
- Cuenta de Firebase con un proyecto habilitado para Firestore.

### 2. Clonar e instalar

```bash
git clone <url-del-repo>
cd journal-fit

# Instalar dependencias
npm install
# o
yarn install
# o
pnpm install
