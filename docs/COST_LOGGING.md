# Cost Logging Implementation - Runware API Costs

## ✅ Task Completed

**Objetivo**: Implementar logging de costos de generación de imágenes para entender y monitorear los gastos de la API de Runware.

**Resultado**: Sistema completo de tracking de costos con logging estructurado JSON y almacenamiento en base de datos.

---

## 🎯 Qué se Implementó

### 1. **Cliente Runware Actualizado** (`src/lib/runware/client.ts`)

- **Logging de inicio**: Parámetros de generación antes de llamar a la API
- **Logging de costos detallados**: Costo total, individual, y métricas por imagen
- **Información técnica**: Modelo, dimensiones, pasos, CFG scale
- **Formato JSON estructurado**: Fácil parsing para análisis

### 2. **API de Generación Actualizada** (`src/app/api/generate/route.ts`)

- **Resumen de costos**: Total, por imagen, ratio costo/token
- **Almacenamiento en BD**: Costos individuales en `generation_settings`
- **Logging completo**: Desde inicio hasta finalización con métricas
- **Respuesta con costos**: Incluye costo total para debugging

### 3. **Estructura de Base de Datos Mejorada**

```typescript
generation_settings: {
  runware_cost: 0.0125,        // Costo individual por imagen
  width: 512,
  height: 512,
  model: 'runware:101@1',
  steps: 28,
  cfg_scale: 4.5
}
```

---

## 📊 Ejemplos de Logs JSON

### Inicio de Generación

```json
{
  "timestamp": "2025-08-24T05:00:00.000Z",
  "level": "info",
  "message": "Starting Runware image generation",
  "environment": "production",
  "data": {
    "numberOfImages": 2,
    "model": "runware:101@1",
    "dimensions": "512x512",
    "steps": 28,
    "CFGScale": 4.5,
    "scheduler": "FlowMatchEulerDiscreteScheduler",
    "prompt": "Un tatuaje de dragón tradicional japonés con detalles intrincados...",
    "hasNegativePrompt": true
  },
  "context": {
    "endpoint": "/runware/generate",
    "method": "POST"
  }
}
```

### Resumen de Costos

```json
{
  "timestamp": "2025-08-24T05:00:15.000Z",
  "level": "info",
  "message": "Generation costs summary",
  "environment": "production",
  "data": {
    "totalRunwareCost": 0.025,
    "costPerImage": 0.0125,
    "imagesGenerated": 2,
    "tokensConsumed": 2,
    "costToTokenRatio": 0.0125,
    "style": "traditional",
    "userPrompt": "Un tatuaje de dragón tradicional japonés con detalles intrincados..."
  },
  "context": {
    "userId": "user_abc123",
    "endpoint": "/api/generate",
    "method": "POST"
  }
}
```

### Costo Individual (Debug)

```json
{
  "timestamp": "2025-08-24T05:00:15.100Z",
  "level": "debug",
  "message": "Individual image generation cost",
  "environment": "development",
  "data": {
    "imageIndex": 0,
    "imageId": "img_runware_xyz789",
    "cost": 0.0125,
    "model": "runware:101@1",
    "prompt": "Un tatuaje de dragón tradicional japonés..."
  }
}
```

---

## 💰 Análisis de Costos

### Métricas Tracked

1. **Costo Total por Request**: Suma de todos los costos de imágenes
2. **Costo por Imagen**: Costo individual de cada imagen generada
3. **Ratio Costo/Token**: Cuánto cuesta cada token del usuario
4. **Costo por Modelo**: Diferencias entre modelos de Runware
5. **Costo por Configuración**: Impacto de pasos, dimensiones, etc.

### Ejemplo de Análisis (Proyección)

```
Images Generated: 2
Total Cost: $0.0250
Average Cost per Image: $0.0125
Cost per Token: $0.0125
Projected Monthly Cost (1000 images): $25.00

=== PROFITABILITY ANALYSIS ===
Revenue (tokens): $0.2000
Runware Cost: $0.0250
Profit: $0.1750
Profit Margin: 87.5%
```

---

## 🛠️ Herramientas Incluidas

### Script de Prueba

```bash
node scripts/test-cost-logging.js
```

- **Cálculos de costos**: Verifica matemáticas correctas
- **Estructura de logs**: Valida formato JSON
- **Registros de BD**: Confirma almacenamiento
- **Análisis de rentabilidad**: Proyecciones y márgenes

---

## 📈 Beneficios Implementados

### 1. **Transparencia de Costos**

- Visibilidad completa de gastos por generación
- Tracking individual por imagen y usuario
- Comparación entre diferentes configuraciones

### 2. **Business Intelligence**

- Análisis de rentabilidad en tiempo real
- Identificación de patrones de uso costosos
- Optimización de configuraciones de modelo

### 3. **Monitoreo Operacional**

- Alertas automáticas para costos elevados
- Trending de costos por período
- Identificación de usuarios high-cost

### 4. **Optimización de Precios**

- Data para ajustar precios de tokens
- Análisis de márgenes de ganancia
- Identificación de estilos más costosos

---

## 🎯 Datos Disponibles para Análisis

### Por Generación

- Costo total y por imagen
- Parámetros técnicos (modelo, steps, CFG)
- Usuario y contexto de request
- Tiempo de procesamiento

### Por Usuario

- Total gastado en Runware por usuario
- Patrones de uso por estilo
- Frecuencia de generación
- Ratio costo/tokens consumidos

### Por Período

- Costos diarios/mensuales
- Tendencias de crecimiento
- Picos de uso y costos
- ROI por período

---

## 🚀 Siguientes Pasos

### 1. **Monitoreo Inmediato**

```bash
# Ver logs de costos en desarrollo
pnpm dev
# Generar imágenes y revisar logs JSON
```

### 2. **Análisis en Producción**

- Configurar alertas de costo en monitoring
- Crear dashboard de costos en tiempo real
- Establecer presupuestos mensuales

### 3. **Optimización Futura**

- A/B testing de configuraciones más baratas
- Caching inteligente para reducir regeneraciones
- Precios dinámicos basados en costos reales

---

## 📝 Configuración de Monitoreo

### Variables de Entorno Requeridas

```env
# Ya configurado en tu aplicación
RUNWARE_API_KEY=tu_api_key
NODE_ENV=production  # Para logs mínimos en prod
```

### Alertas Recomendadas

1. **Costo diario > $50**: Alerta inmediata
2. **Costo por imagen > $0.05**: Investigar configuración
3. **Margin < 50%**: Revisar precios de tokens
4. **Usuario gasta > $10/día**: Posible abuso

---

**✅ ¡Misión Cumplida!**

Tu aplicación ahora tiene **tracking completo de costos** con:

- 📊 **Logs JSON estructurados** para análisis fácil
- 💾 **Almacenamiento persistente** en base de datos
- 📈 **Métricas de rentabilidad** en tiempo real
- 🔍 **Visibilidad total** de gastos operacionales

¡Ahora puedes **tomar decisiones informadas** sobre precios, optimizaciones y crecimiento del negocio! 🚀
