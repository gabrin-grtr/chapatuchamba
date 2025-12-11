# ✅ Checklist de Verificación Pre-Despliegue

## 📋 Antes de Desplegar

### Archivos y Estructura

- [ ] Verificar que `functions/src/` contiene todos los servicios
- [ ] Confirmair que `functions/chapatuchamba-cdd3a-545236e49c03.json` existe
- [ ] Verificar que `package.json` tiene todas las dependencias actualizadas
- [ ] Confirmar que TypeScript compila sin errores: `npm run build`
- [ ] Verificar que `.env.local` tiene las credenciales de Firebase

### Variables de Entorno

- [ ] `VITE_FIREBASE_API_KEY` - presente en `.env.local`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - presente en `.env.local`
- [ ] `VITE_FIREBASE_PROJECT_ID` - debe ser `chapatuchamba-cdd3a`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - presente en `.env.local`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - presente en `.env.local`
- [ ] `VITE_FIREBASE_APP_ID` - presente en `.env.local`
- [ ] `VITE_RESEND_API_KEY` - presente en `.env.local`
- [ ] `RESEND_API_KEY` - será configurado en Firebase via CLI

### Google Cloud

- [ ] Verificar que Google Cloud Talent Solution API está **habilitada**
- [ ] Verificar que el service account tiene permisos de Talent Solution
- [ ] Verificar que el service account tiene permisos de Firestore

### Firebase

- [ ] Proyecto `chapatuchamba-cdd3a` existe
- [ ] Firestore está habilitado en el proyecto
- [ ] Cloud Functions están habilitadas
- [ ] Cloud Pub/Sub está habilitado (para funciones programadas)
- [ ] Se ejecutó `firebase login`

### Firestore

- [ ] Las siguientes colecciones estarán creadas automáticamente:
  - `jobs_raw`
  - `jobs_clean`
  - `jobs_matched`
  - `user_preferences`
  - `notification_logs`
  - `users`
  - `sync_status`

---

## 🚀 Proceso de Despliegue

### Paso 1: Preparación

```bash
# Ir a la carpeta de funciones
cd functions

# Instalar dependencias (si es primera vez)
npm install

# Compilar TypeScript
npm run build

# Verificar que no hay errores
```

- [ ] `npm run build` compiló sin errores

### Paso 2: Configurar Variables en Firebase

```bash
# Desde la raíz del proyecto
firebase functions:config:set resend.api_key="re_ABZCSZ5w_EQ2shfJ7h8Vpvt64Sja6wQma"

# Verificar configuración guardada
firebase functions:config:get
```

- [ ] RESEND_API_KEY está configurada en Firebase

### Paso 3: Desplegar

```bash
# Desde la raíz del proyecto
firebase deploy --only functions
```

- [ ] Deployment completó exitosamente
- [ ] Ver en Firebase Console > Cloud Functions
- [ ] Todas las funciones aparecen con status ✅

### Paso 4: Verificación Post-Despliegue

#### Test de syncJobsFromTalentSolution

```bash
curl -X POST https://us-central1-chapatuchamba-cdd3a.cloudfunctions.net/syncJobsFromTalentSolution \
  -H "Content-Type: application/json" \
  -d '{"query":"software engineer","location":"USA","pageSize":10}'
```

- [ ] API responde con status 200
- [ ] Respuesta contiene `stats` con conteos

#### Test de getSyncStatus

```bash
curl https://us-central1-chapatuchamba-cdd3a.cloudfunctions.net/getSyncStatus
```

- [ ] API responde con status 200
- [ ] Contiene `status: "operational"`

#### Ver Logs

```bash
firebase functions:log
```

- [ ] No hay errores en los logs
- [ ] Ves logs de las funciones desplegadas

#### Verificar Firestore

En Firebase Console > Firestore:

- [ ] Aparecen documentos en `jobs_raw`
- [ ] Aparecen documentos en `jobs_clean`
- [ ] Documentos tienen estructura correcta

---

## 🔧 Troubleshooting Durante Despliegue

### Error: "Service account file not found"

```bash
# Verificar que el archivo existe
ls -la functions/chapatuchamba-cdd3a-545236e49c03.json

# Si falta, copiar desde descargas
cp ~/Downloads/chapatuchamba-cdd3a-545236e49c03.json functions/
```

### Error: "API not enabled"

1. Ve a Google Cloud Console
2. Busca "Cloud Talent Solution API"
3. Click "Enable"
4. Espera 2-3 minutos y vuelve a desplegar

### Error: "Permission denied"

1. Ve a Google Cloud Console > IAM
2. Asegúrate que el service account tenga estos roles:
   - Cloud Functions Developer
   - Cloud Firestore Editor
   - Talent Solution API User

### Error: "Timeout"

- Las validaciones de sitios web pueden tardar
- Aumentar timeout en jobValidationService.ts a 5000ms
- O usar Promise.race() para límite de tiempo

### Error: "TypeError: Cannot read property 'toDate'"

- Verificar que usas `admin.firestore.Timestamp` en functions
- Y `Timestamp` de `firebase/firestore` en frontend

---

## 📊 Verificación de Funcionalidad

### Función: syncJobsFromTalentSolution

```
✅ Recibe query, location, pageSize
✅ Llama Google Cloud Talent Solution API
✅ Guarda resultados en jobs_raw
✅ Valida empleos
✅ Guarda limpios en jobs_clean
✅ Retorna estadísticas
```

### Función: sendJobNotifications

```
✅ Se ejecuta cada 6 horas automáticamente
✅ Obtiene todos los usuarios
✅ Para cada usuario:
  ✅ Lee sus preferencias
  ✅ Obtiene empleos válidos
  ✅ Calcula matching
  ✅ Filtra por score mínimo
  ✅ Ordena por relevancia
✅ Envía email a través de Resend
✅ Registra notificación en notification_logs
```

### Función: sendWeeklyJobReport

```
✅ Se ejecuta lunes a las 9 AM
✅ Obtiene todos los usuarios con frecuencia semanal
✅ Calcula estadísticas
✅ Genera HTML con reporte
✅ Envía email a través de Resend
```

### Función: sendMonthlyJobReport

```
✅ Se ejecuta 1° de mes a las 9 AM
✅ Obtiene todos los usuarios con frecuencia mensual
✅ Calcula estadísticas del mes
✅ Genera HTML con reporte
✅ Envía email a través de Resend
```

---

## 🎯 Test de Integración Completa

### Simulación del Flujo Completo

1. **Crear usuario de prueba**

   ```bash
   # En Firebase Console > Authentication
   # Crear usuario: test@chapatuchamba.com / password123
   ```

   - [ ] Usuario creado

2. **Guardar preferencias**

   ```bash
   # Manualmente en Firestore o via función
   # Colección: user_preferences
   # Documento: test@chapatuchamba.com
   ```

   - [ ] Preferencias guardadas

3. **Sincronizar empleos**

   ```bash
   curl -X POST https://us-central1-chapatuchamba-cdd3a.cloudfunctions.net/syncJobsFromTalentSolution \
     -H "Content-Type: application/json" \
     -d '{"query":"technology","location":"USA","pageSize":50}'
   ```

   - [ ] Empleos sincronizados
   - [ ] Aparecen en `jobs_raw`
   - [ ] Aparecen validados en `jobs_clean`

4. **Disparar notificación (para testing)**

   ```bash
   # Crear un documento de prueba en user_preferences con email real
   # Esperar 6 horas O ejecutar función manualmente
   ```

   - [ ] Email recibido en inbox del usuario
   - [ ] Contiene ofertas personalizadas
   - [ ] Tiene score de relevancia
   - [ ] Tiene razones del match

5. **Verificar Firestore**
   - [ ] `jobs_matched` contiene documentos
   - [ ] `notification_logs` contiene registros
   - [ ] `sync_status` actualizado

---

## 🔐 Verificación de Seguridad

- [ ] No hay credenciales hardcodeadas en código
- [ ] Service account JSON está en `.gitignore`
- [ ] Resend API key está en variables de entorno (NO en código)
- [ ] Firestore Security Rules están configuradas
- [ ] Cloud Functions tienen autenticación si es necesario

---

## 📞 Checklits Finales

### Antes de Producción

- [ ] Todos los tests pasan
- [ ] Logs muestran ejecuciones sin errores
- [ ] Emails se envían exitosamente
- [ ] Firestore tiene datos correctos
- [ ] Performance es aceptable

### Para Usuarios

- [ ] Usuarios pueden configurar preferencias
- [ ] Usuarios reciben emails personalizados
- [ ] UI muestra ofertas con scores
- [ ] Puedes ver historial de emails en notification_logs

---

## 📝 Notas Importantes

1. **Primera sincronización puede tardar**
   - Validar sitios web toma tiempo
   - Aumentar timeout si es necesario

2. **Límites de Google Cloud Talent Solution**
   - Verificar cuota asignada
   - Puede haber límites de request

3. **Límites de Resend**
   - Plan gratuito: 3,000 emails/día
   - Verificar límites según plan

4. **Firestore Limits**
   - 25 escrituras/segundo por colección
   - Puede afectar si hay muchos usuarios simultáneamente

---

## ✨ ¡Listo para Producción!

Cuando todos los items estén marcados ✅, tu sistema está:

- ✅ Completamente integrado
- ✅ Testeado
- ✅ Listo para usuarios reales
- ✅ Monitoreado y logging
- ✅ Seguro

¡Felicidades! 🎉
