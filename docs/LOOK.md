# LOOK & FEEL GUIDE
## Visual Design System for Decollage.cl

### <� **Visual Philosophy**
*"Elegancia emocional que inspira confianza creativa"*

Nuestro dise�o visual es una fusi�n sofisticada entre la aspiraci�n y la accesibilidad. Cada elemento visual debe evocar la sensaci�n de hojear una revista de dise�o premium mientras mantiene la calidez y cercan�a de un consejo de una amiga con excelente gusto.

---

## **1. Principios Visuales Core**

### **1.1 Espacio Como Lujo**
- **Respiro Generoso:** M�nimo 80px de padding en secciones principales
- **Whitespace Intencional:** El vac�o es tan importante como el contenido
- **Layouts Asim�tricos:** Romper la monoton�a con composiciones inesperadas
- **M�rgenes Dram�ticos:** Crear tensi�n visual con espacios negativos

### **1.2 Profundidad Sin Complejidad**
- **Capas Sutiles:** Overlays suaves, nunca m�s de 3 niveles de profundidad
- **Sombras Po�ticas:** `shadow-2xl` para elementos hero, `shadow-lg` para cards
- **Transparencias Elegantes:** `bg-white/95`, `bg-black/60` para overlays
- **Blur Estrat�gico:** `backdrop-blur-sm` para crear jerarqu�a

### **1.3 Movimiento Con Prop�sito**
- **Transiciones Largas:** 500-700ms para hover states importantes
- **Ease Natural:** `transition-all duration-700 ease-out`
- **Micro-interacciones:** Scale sutiles (1.05-1.10) en hover
- **Parallax Sutil:** Para secciones hero y testimoniales

---

## **2. Paleta de Color**

### **Colores Primarios**
```css
--sage-green: #A3B1A1    /* Confianza, naturaleza, serenidad */
--warm-terracotta: #C4886F    /* Calidez, hogar, feminidad */
--deep-charcoal: #333333    /* Elegancia, solidez, profesionalismo */
--soft-canvas: #F8F8F8    /* Limpieza, espacio, respiraci�n */
```

### **Aplicaci�n del Color**

#### **Jerarqu�a Crom�tica**
1. **Fondos Base:**
   - `#F8F8F8` (Secciones alternas)
   - `white` (Secciones principales)
   - `#333333` (Footer y secciones dram�ticas)

2. **Acentos Emocionales:**
   - `#A3B1A1` - CTAs principales, elementos de confianza
   - `#C4886F` - Badges aspiracionales, acentos c�lidos

3. **Overlays y Gradientes:**
   ```css
   /* Hero Gradients */
   background: linear-gradient(to bottom,
     rgba(0,0,0,0.3),
     rgba(0,0,0,0.2),
     rgba(0,0,0,0.6)
   );

   /* Card Overlays */
   background: linear-gradient(to top,
     rgba(0,0,0,0.8),
     rgba(0,0,0,0.4),
     transparent
   );
   ```

---

## **3. Tipograf�a Emocional**

### **Sistema Tipogr�fico**

```css
/* Display - Cormorant */
.headline-hero {
  font-family: 'Cormorant', serif;
  font-weight: 300; /* Light para elegancia */
  font-size: clamp(3rem, 8vw, 8rem);
  line-height: 0.9;
  letter-spacing: -0.02em;
}

/* Body - Lato */
.body-elegant {
  font-family: 'Lato', sans-serif;
  font-weight: 300-400;
  font-size: 1.125rem;
  line-height: 1.8;
  letter-spacing: 0.01em;
}
```

### **Jerarqu�a Tipogr�fica**

| Nivel | Font | Size | Weight | Use Case |
|-------|------|------|--------|----------|
| **H1 Hero** | Cormorant | 5rem-8rem | 300 | Headlines principales |
| **H2 Section** | Cormorant | 3rem-5rem | 300-400 | T�tulos de secci�n |
| **H3 Card** | Cormorant | 1.5rem-2rem | 400 | T�tulos de tarjetas |
| **Body Large** | Lato | 1.25rem | 300 | Subt�tulos, intro text |
| **Body** | Lato | 1rem | 400 | Contenido general |
| **Caption** | Lato | 0.875rem | 400 | Metadatos, labels |

---

## **4. Tratamiento de Im�genes**

### **4.1 Estilo Fotogr�fico**

#### **Mood & Tone**
- **Luz Natural:** Preferir golden hour, luz suave de ventana
- **Colores C�lidos:** Tonos tierra, beiges, verdes salvia
- **Composici�n:** �ngulos amplios que muestren el espacio completo
- **Styling:** Minimalista pero acogedor, nunca fr�o o est�ril

#### **Especificaciones T�cnicas**
```javascript
// Calidad de Im�genes
const imageSpecs = {
  hero: {
    dimensions: '3000x2000px min',
    format: 'jpg',
    quality: 80,
    aspectRatio: '16:9 o 3:2'
  },
  gallery: {
    dimensions: '2000x1500px min',
    format: 'jpg',
    quality: 75,
    aspectRatio: '4:3 o 1:1'
  },
  thumbnail: {
    dimensions: '800x800px',
    format: 'jpg',
    quality: 70,
    aspectRatio: '1:1'
  }
}
```

### **4.2 Tratamientos y Filtros**

```css
/* Overlay Dram�tico */
.image-dramatic::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(0,0,0,0.1) 50%,
    rgba(0,0,0,0.7) 100%
  );
}

/* Hover Reveal */
.image-reveal {
  transition: opacity 700ms ease-out;
}
.image-reveal:hover {
  opacity: 0; /* Reveals image underneath */
}
```

---

## **5. Layouts & Composiciones**

### **5.1 Grid Systems**

#### **Magazine Layout**
```css
.magazine-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 2rem;
}

.feature-large { grid-column: span 4; }
.feature-small { grid-column: span 2; }
.feature-full { grid-column: 1 / -1; }
```

#### **Moodboard Collage**
```css
.moodboard {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.moodboard-item:nth-child(1) {
  grid-column: span 2;
  height: 18rem;
}
.moodboard-item:nth-child(2) {
  height: 16rem;
  margin-top: 2rem;
}
.moodboard-item:nth-child(3) {
  height: 20rem;
  margin-top: -4rem;
}
```

### **5.2 Secciones Signature**

#### **Hero Full-Screen**
- Height: `100vh`
- Image: Full bleed con overlay gradiente
- Content: Centrado vertical y horizontal
- Typography: Ultra-light, tama�os dram�ticos

#### **Benefit Showcase**
- Layout: Split screen (50/50)
- Left: Collage asim�trico de im�genes
- Right: Contenido scrolleable con fixed images
- Interaction: Hover sincronizado entre texto e im�genes

#### **Transformation Gallery**
- Grid: 3 columnas sin gaps
- Height: `70vh` por item
- Reveal: Before/after en hover
- Overlay: Gradiente bottom con contenido

---

## **6. Componentes UI Signature**

### **6.1 Botones**

```css
/* Primary CTA */
.btn-primary {
  background: #A3B1A1;
  color: white;
  padding: 1rem 3rem;
  font-family: 'Lato', sans-serif;
  font-weight: 400;
  letter-spacing: 0.05em;
  border-radius: 0; /* Sin border radius - m�s editorial */
  transition: all 300ms ease-out;
}

.btn-primary:hover {
  background: #A3B1A1E6; /* 90% opacity */
  transform: scale(1.02);
}

/* Ghost Button */
.btn-ghost {
  background: transparent;
  border: 1px solid currentColor;
  padding: 1rem 3rem;
  transition: all 500ms ease-out;
}
```

### **6.2 Cards**

```css
/* Editorial Card */
.card-editorial {
  position: relative;
  overflow: hidden;
  aspect-ratio: 4/5;
  background: white;
  box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
  transition: all 700ms cubic-bezier(0.4, 0, 0.2, 1);
}

.card-editorial:hover {
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
  transform: translateY(-4px);
}
```

### **6.3 Badges**

```css
/* Aspirational Badge */
.badge-dream {
  background: rgba(163, 177, 161, 0.1);
  color: #A3B1A1;
  border: 1px solid rgba(163, 177, 161, 0.2);
  padding: 0.5rem 1.5rem;
  font-family: 'Lato', sans-serif;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
```

---

## **7. Interacciones & Micro-animaciones**

### **7.1 Hover States**

```javascript
// Image Zoom
const imageHover = {
  scale: 1.05-1.10,
  duration: '700ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
}

// Text Reveal
const textReveal = {
  opacity: '0 � 1',
  transform: 'translateY(20px) � translateY(0)',
  duration: '500ms',
  delay: '100ms stagger'
}
```

### **7.2 Scroll Animations**

```css
/* Fade In Up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Parallax Subtle */
.parallax-subtle {
  transform: translateY(calc(var(--scroll) * 0.3));
}
```

### **7.3 Loading States**

```css
/* Skeleton Elegante */
.skeleton {
  background: linear-gradient(
    90deg,
    #F8F8F8 25%,
    #EFEFEF 50%,
    #F8F8F8 75%
  );
  background-size: 200% 100%;
  animation: loading 1.5s ease-in-out infinite;
}
```

---

## **8. Responsive Considerations**

### **Breakpoints**
```css
/* Mobile First */
@media (min-width: 640px) { /* Tablet */ }
@media (min-width: 1024px) { /* Desktop */ }
@media (min-width: 1440px) { /* Large Desktop */ }
@media (min-width: 1920px) { /* Ultra Wide */ }
```

### **Mobile Adaptations**
- Typography: Scale down 20-30% but maintain hierarchy
- Images: Stack vertical, maintain aspect ratios
- Spacing: Reduce padding by 40% on mobile
- Interactions: Tap instead of hover, remove parallax

---

## **9. Accessibility & Performance**

### **Visual Accessibility**
- Contrast ratios: Minimum 4.5:1 for body text
- Focus states: Visible outline with 2px offset
- Motion: Respect `prefers-reduced-motion`
- Alt text: Descriptive and emotional

### **Performance Optimization**
- Images: Lazy load below fold
- Animations: Use CSS transforms only
- Fonts: Preload critical fonts
- Paint: Minimize repaints with `will-change`

---

## **10. Don'ts - Lo Que Evitamos**

L **Evitar:**
- Bordes redondeados excesivos (max 4px si es necesario)
- Sombras duras o negras puras
- Colores saturados o ne�n
- Tipograf�a pesada (bold) en textos largos
- Animaciones bouncy o cartoon-like
- Gradientes de colores m�ltiples
- Iconos gen�ricos o stock
- Espaciado uniforme y predecible
- Layouts perfectamente sim�tricos

---

## **Implementation Checklist**

- [ ] Todas las im�genes siguen el mood aspiracional
- [ ] Los espacios blancos crean respiraci�n visual
- [ ] Las transiciones son suaves y elegantes (500-700ms)
- [ ] La tipograf�a mantiene jerarqu�a clara
- [ ] Los overlays crean profundidad sin saturar
- [ ] Los CTAs invitan sin presionar
- [ ] El contenido fluye como una revista premium
- [ ] Las interacciones sorprenden sutilmente
- [ ] Mobile mantiene la elegancia del desktop

---

*"Cada pixel debe susurrar elegancia, cada interacci�n debe sentirse como magia."*

**�ltima actualizaci�n:** Diciembre 2024
**Versi�n:** 1.0.0