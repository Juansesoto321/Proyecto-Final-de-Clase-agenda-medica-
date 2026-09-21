# Agenda Médica — Proyecto Final SENA

App móvil (Expo / React Native) + API propia (Node.js + Express + SQLite) para agendar citas médicas, con funcionamiento **offline** (SQLite local) que sincroniza con el servidor cuando vuelve la conexión.

## Módulos

1. **Login**
2. **Registro** (pacientes)
3. **Agendar Cita** (paciente)
4. **Gestión de Citas** — confirmar/cancelar cualquier cita (administrador)
5. **Cancelación de Cita** (paciente, solo sus propias citas)

## Estructura

```
backend/   API REST (Node.js + Express + Sequelize + SQLite)
mobile/    App Expo (React Native)
```

## 1. Backend

```bash
cd backend
npm install          # ya se hizo, solo hace falta si clonas el proyecto de nuevo
npm run seed          # crea el usuario admin y los doctores de ejemplo (una sola vez)
npm run dev           # levanta la API en http://localhost:3000 (con recarga automática)
```

Usuario admin de prueba: `admin@clinica.com` / `admin123`.

El backend guarda todo en `backend/database.sqlite` (un solo archivo, se crea solo). Si quieres empezar de cero, bórralo y vuelve a correr `npm run seed`.

### Variables de entorno (`backend/.env`)
Ya está creado con un `JWT_SECRET` generado. Si necesitas cambiar el puerto, edita `PORT` en ese archivo.

## 2. App móvil (Expo Go)

**Importante:** tu celular y tu PC deben estar conectados a la **misma red** (mismo WiFi/router). Como Expo Go corre en tu iPhone y no en el PC, la app necesita la IP de tu PC en la red local, no "localhost".

1. Encuentra la IP local de tu PC:
   ```bash
   ipconfig
   ```
   Busca el adaptador que esté realmente conectado (Ethernet o Wi-Fi) y su "Dirección IPv4".

2. Ponla en [`mobile/src/config.js`](mobile/src/config.js):
   ```js
   export const API_BASE_URL = 'http://TU_IP_LOCAL:3000/api';
   ```
   (Ya quedó configurada con la IP detectada en este equipo: `10.15.10.29`. Si cambias de red — por ejemplo llevas el portátil a otro sitio — vuelve a correr `ipconfig` y actualiza este archivo.)

3. Instala Expo Go en tu iPhone desde la App Store (gratis).

4. Levanta la app:
   ```bash
   cd mobile
   npx expo start
   ```
   Aparece un código QR en la terminal. Ábrelo con la cámara del iPhone (o desde la app Expo Go > "Enter URL manually" si el QR no funciona, escribiendo `exp://TU_IP_LOCAL:8081`).

5. Con el backend (`npm run dev`) y Expo (`npx expo start`) corriendo al mismo tiempo, ya puedes registrarte, iniciar sesión y usar la app desde tu iPhone.

### Si no conecta
- Verifica que el celular y el PC estén en la misma red WiFi (no datos móviles).
- Verifica que `backend` esté corriendo (`http://TU_IP:3000/api/health` debe responder `{"ok":true}` — pruébalo también desde el navegador del celular para descartar problemas de red).
- Windows puede pedir permiso de firewall la primera vez que corres el backend o Expo — dale "Permitir acceso" (red privada).

## 3. Probar el modo offline

1. Con conexión, inicia sesión como paciente y agenda una cita (para que el catálogo de doctores quede guardado localmente).
2. Activa el **modo avión** en el iPhone.
3. Agenda otra cita o cancela una existente — debe guardarse igual, mostrando la etiqueta "Pendiente de sincronizar" y un aviso de "Sin conexión" arriba de la lista.
4. Desactiva el modo avión. En unos segundos la app sincroniza sola (o desliza hacia abajo para forzarlo) y la etiqueta de pendiente desaparece.
5. Para probar el lado administrador: inicia sesión con `admin@clinica.com`, confirma o cancela citas — funciona igual offline/online.

## 4. APK

El entregable ya está generado: [`agenda-medica.apk`](agenda-medica.apk) (en la raíz del proyecto), compilado en la nube con EAS Build (no requiere Android Studio ni Mac).

Para instalarlo en un celular Android: pasa el archivo al celular (por cable, Drive, WhatsApp, etc.), ábrelo y permite "instalar apps de orígenes desconocidos" cuando lo pida. Al abrir la app, si el celular no está en la misma red que el backend, edita `API_BASE_URL` en `mobile/src/config.js` con la IP donde esté corriendo el backend y vuelve a generar el APK (`cd mobile && npx eas-cli build --platform android --profile preview`).
