'use client'

// Force dynamic rendering to avoid build issues
export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Heart,
  ArrowRight,
  Leaf,
  Home,
  Shield,
  Award,
  Star,
  Quote,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Twitter,
  ChevronRight,
  Search,
  ShoppingBag,
  User
} from 'lucide-react'


export default function HomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [hoveredBenefit, setHoveredBenefit] = useState<number | null>(null)

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(interval)
  }, [])

  // Auto-rotate hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#F8F8F8]">
      {/* Elegant Magazine Header */}
      <header className="fixed top-0 w-full bg-white/95 backdrop-blur-xl z-50 border-b border-[#A3B1A1]/10">
        <div className="max-w-8xl mx-auto px-8">
          <div className="flex h-24 items-center justify-between">
            {/* Logo - More Elegant */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#A3B1A1]/10 flex items-center justify-center">
                <Leaf className="h-7 w-7 text-[#A3B1A1]" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-cormorant font-light text-[#333333] leading-none">Decollage</span>
              </div>
            </div>

            {/* Refined Navigation */}
            <nav className="hidden lg:flex items-center gap-12">
              <Link href="#beneficios" className="relative group">
                <span className="text-sm font-lato font-light text-[#333333] tracking-wide transition-colors duration-300 group-hover:text-[#A3B1A1]">
                  Descubre Tu Potencial
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-px bg-[#A3B1A1] transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="#proceso" className="relative group">
                <span className="text-sm font-lato font-light text-[#333333] tracking-wide transition-colors duration-300 group-hover:text-[#A3B1A1]">
                  Cómo Funciona la Magia
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-px bg-[#A3B1A1] transition-all duration-300 group-hover:w-full" />
              </Link>
              <Link href="#transformaciones" className="relative group">
                <span className="text-sm font-lato font-light text-[#333333] tracking-wide transition-colors duration-300 group-hover:text-[#A3B1A1]">
                  Historias Reales
                </span>
                <div className="absolute -bottom-1 left-0 w-0 h-px bg-[#A3B1A1] transition-all duration-300 group-hover:w-full" />
              </Link>
            </nav>

            {/* Aspirational CTA */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                className="hidden md:flex items-center gap-2 px-0 text-[#333333] hover:text-[#A3B1A1] font-lato font-light transition-all duration-300"
              >
                <User className="h-4 w-4" />
                <span className="text-sm tracking-wide">Mi Cuenta</span>
              </Button>
              <Button className="bg-[#333333] hover:bg-[#A3B1A1] text-white px-6 py-2 font-lato font-light text-sm tracking-wide transition-all duration-500 hover:scale-105 rounded-none">
                Comenzar Gratis
                <ArrowRight className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Full Screen Hero with Slider */}
        <section className="relative h-screen overflow-hidden">
          {/* Background Slider */}
          <div className="absolute inset-0">
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1500 ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  className="object-cover"
                  priority={index === 0}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />
              </div>
            ))}
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex items-center justify-center text-center px-4">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-cormorant font-light text-white mb-6 leading-[0.9]">
                {heroSlides[currentSlide].title.split(' ').map((word, i) => (
                  <span key={i}>
                    {word}{' '}
                    {i === 2 && <br />}
                  </span>
                ))}
              </h1>

              <p className="text-xl md:text-2xl text-white/90 font-lato font-light mb-12 max-w-2xl mx-auto leading-relaxed">
                {heroSlides[currentSlide].subtitle}
              </p>

              <Button
                size="lg"
                className="bg-white/95 hover:bg-white text-[#333333] px-12 py-6 text-lg font-lato rounded-none backdrop-blur-sm transition-all hover:scale-105"
              >
                Comienza Tu Transformación
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Slide Indicators */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {heroSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentSlide
                    ? 'w-12 bg-white'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronRight className="h-6 w-6 text-white/70 rotate-90" />
          </div>
        </section>

        {/* Benefits Moodboard Section */}
        <section id="beneficios" className="relative bg-[#F8F8F8] overflow-hidden">
          <div className="grid lg:grid-cols-2 min-h-screen">
            {/* Left: Staggered Image Collage */}
            <div className="relative p-8 lg:p-12">
              <div className="sticky top-24 grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                {dreamBenefits.slice(0, 4).map((benefit, index) => (
                  <div
                    key={index}
                    className={`relative overflow-hidden cursor-pointer transition-all duration-500 ${
                      index === 0 ? 'col-span-2 h-72' :
                      index === 1 ? 'h-64 mt-8' :
                      index === 2 ? 'h-80 -mt-16' :
                      'col-span-2 h-60'
                    } ${hoveredBenefit === index ? 'scale-105 z-10' : ''}`}
                    onMouseEnter={() => setHoveredBenefit(index)}
                    onMouseLeave={() => setHoveredBenefit(null)}
                  >
                    <Image
                      src={benefit.image}
                      alt={benefit.dream}
                      fill
                      className="object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
                      hoveredBenefit === index ? 'opacity-100' : 'opacity-0'
                    }`}>
                      <div className="absolute bottom-6 left-6 right-6">
                        <p className="text-white font-cormorant text-2xl font-light leading-tight">
                          {benefit.dream}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Scrollable Benefits */}
            <div className="bg-white p-8 lg:p-16 flex items-center">
              <div className="max-w-xl">
                <Badge className="mb-6 bg-[#A3B1A1]/10 text-[#A3B1A1] border-[#A3B1A1]/20 font-lato rounded-none">
                  Tu Visión, Nuestra Magia
                </Badge>

                <h2 className="text-4xl lg:text-6xl font-cormorant font-light text-[#333333] mb-8 leading-[1.1]">
                  Deja de soñar.<br/>
                  <span className="text-[#A3B1A1] font-normal">Empieza a vivir.</span>
                </h2>

                <div className="space-y-8">
                  {dreamBenefits.map((benefit, index) => (
                    <div
                      key={index}
                      className="group cursor-pointer"
                      onMouseEnter={() => setHoveredBenefit(index)}
                      onMouseLeave={() => setHoveredBenefit(null)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-1 h-16 bg-[#A3B1A1]/20 group-hover:bg-[#A3B1A1] transition-colors" />
                        <div className="flex-1">
                          <h3 className="font-cormorant text-2xl font-light text-[#333333] mb-2">
                            {benefit.dream}
                          </h3>
                          <p className="text-[#333333]/70 font-lato leading-relaxed">
                            {benefit.reality}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="mt-12 bg-[#333333] hover:bg-[#333333]/90 text-white px-8 font-lato rounded-none w-full"
                >
                  Descubre Tu Potencial
                  <Heart className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Transformation Gallery - Full Width */}
        <section className="relative bg-white py-0">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {transformationStories.map((story, index) => (
              <div
                key={index}
                className="relative h-[70vh] group overflow-hidden cursor-pointer"
              >
                {/* Before Image */}
                <Image
                  src={story.before}
                  alt={story.title}
                  fill
                  className="object-cover transition-opacity duration-700 group-hover:opacity-0"
                />
                {/* After Image */}
                <Image
                  src={story.after}
                  alt={story.title}
                  fill
                  className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                />

                {/* Overlay Content */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div className="absolute bottom-0 left-0 right-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <Badge className="mb-4 bg-white/20 text-white border-white/30 font-lato rounded-none backdrop-blur-sm">
                      {story.tag}
                    </Badge>
                    <h3 className="text-3xl font-cormorant font-light text-white mb-3">
                      {story.title}
                    </h3>
                    <p className="text-white/90 font-lato leading-relaxed mb-4">
                      {story.description}
                    </p>
                    <div className="flex items-center text-white font-lato">
                      <span className="text-sm">Ver transformación completa</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Hover Indicator */}
                <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <span className="text-xs font-lato text-[#333333] uppercase tracking-wider">Antes → Después</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Interactive Process Section */}
        <section id="proceso" className="relative py-20 bg-[#F8F8F8] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <Badge className="mb-6 bg-[#C4886F]/10 text-[#C4886F] border-[#C4886F]/20 font-lato rounded-none">
                Tan Simple Como Soñar
              </Badge>
              <h2 className="text-5xl lg:text-7xl font-cormorant font-light text-[#333333] mb-6">
                Tu visión cobra vida
                <span className="block text-[#A3B1A1] font-normal mt-2">en segundos</span>
              </h2>
            </div>

            {/* Horizontal Scroll Process */}
            <div className="relative">
              <div className="flex gap-8 overflow-x-auto scrollbar-hide pb-8">
                {magicProcess.map((step, index) => (
                  <div
                    key={index}
                    className="flex-none w-[400px] group"
                  >
                    <div className="relative h-[500px] overflow-hidden mb-6">
                      <Image
                        src={step.image}
                        alt={step.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Floating number */}
                      <div className="absolute top-6 left-6 w-16 h-16 bg-white/90 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-2xl font-cormorant font-light text-[#333333]">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="absolute bottom-0 left-0 right-0 p-8">
                        <h3 className="text-2xl font-cormorant font-light text-white mb-3">
                          {step.title}
                        </h3>
                        <p className="text-white/90 font-lato leading-relaxed">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Emotional Testimonials - Magazine Style */}
        <section className="relative bg-white py-20">
          <div className="max-w-8xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Left: Large Quote */}
              <div className="relative">
                <Quote className="absolute -top-8 -left-8 h-24 w-24 text-[#A3B1A1]/10" />
                <div className="pl-8">
                  <h2 className="text-6xl lg:text-7xl font-cormorant font-light text-[#333333] mb-8 leading-[0.95]">
                    Ellas ya viven<br/>
                    <span className="text-[#A3B1A1]">su sueño</span>
                  </h2>
                  <p className="text-2xl font-cormorant font-light text-[#333333]/80 italic leading-relaxed mb-8">
                    "{testimonials[activeTestimonial].quote}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-[#A3B1A1]/10 flex items-center justify-center">
                      <span className="text-xl font-cormorant text-[#A3B1A1]">
                        {testimonials[activeTestimonial].author[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-cormorant text-xl text-[#333333]">
                        {testimonials[activeTestimonial].author}
                      </p>
                      <p className="text-sm text-[#333333]/60 font-lato">
                        {testimonials[activeTestimonial].location}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Image Grid */}
              <div className="grid grid-cols-2 gap-4">
                {testimonialImages.map((img, index) => (
                  <div
                    key={index}
                    className={`relative overflow-hidden cursor-pointer group ${
                      index === 0 ? 'col-span-2 h-64' : 'h-48'
                    }`}
                    onClick={() => setActiveTestimonial(index % testimonials.length)}
                  >
                    <Image
                      src={img.src}
                      alt={img.alt}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                ))}
              </div>
            </div>

            {/* Testimonial Navigation */}
            <div className="flex justify-center mt-12 gap-3">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === activeTestimonial
                      ? 'w-8 bg-[#A3B1A1]'
                      : 'bg-[#A3B1A1]/30 hover:bg-[#A3B1A1]/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-12 bg-white">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <Badge className="mb-6 bg-[#A3B1A1]/10 text-[#A3B1A1] border-[#A3B1A1]/20 font-lato rounded-none">
              Newsletter
            </Badge>

            <h2 className="text-4xl lg:text-5xl font-cormorant font-bold text-[#333333] mb-6">
              Únete a la revolución del diseño
            </h2>

            <p className="text-xl text-[#333333]/70 font-lato mb-6 max-w-2xl mx-auto">
              Sé la primera en acceder a nuevas funciones, tips de diseño con IA y historias de transformación que te inspirarán a crear sin límites.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6 max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-6 py-3 border border-[#A3B1A1]/30 focus:outline-none focus:border-[#A3B1A1] font-lato"
              />
              <Button className="bg-[#A3B1A1] hover:bg-[#A3B1A1]/90 text-white px-8 font-lato rounded-none">
                Suscríbete
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <p className="text-sm text-[#333333]/60 font-lato">
              Sin spam, solo inspiración para tu hogar • Cancela cuando quieras
            </p>
          </div>
        </section>

        {/* Editorial Footer */}
        <footer id="contacto" className="relative bg-[#F8F8F8] pt-20 pb-12 overflow-hidden">
          {/* Elegant Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="grid grid-cols-12 h-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="border-r border-[#A3B1A1]" />
              ))}
            </div>
          </div>

          <div className="relative max-w-8xl mx-auto px-8">
            {/* Header Section */}
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#A3B1A1]/10 flex items-center justify-center">
                  <Leaf className="h-8 w-8 text-[#A3B1A1]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-3xl font-cormorant font-light text-[#333333] leading-none">Decollage</span>
                </div>
              </div>
              <p className="text-xl font-cormorant font-light text-[#333333]/80 max-w-2xl mx-auto leading-relaxed">
                "La confianza para diseñar el hogar que amas."
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-4 gap-12 mb-16">
              {/* Mission Statement */}
              <div className="lg:col-span-2">
                <h3 className="text-2xl font-cormorant font-light text-[#333333] mb-6">Nuestra Misión</h3>
                <p className="text-[#333333]/80 font-lato leading-relaxed mb-8">
                  Transformamos la manera en que las chilenas y chilenos se relacionan con sus espacios.
                  Cada visualización es un paso hacia la confianza creativa, cada diseño es una invitación
                  a enamorarse del hogar que siempre soñaste.
                </p>

                {/* Social Links - Elegant */}
                <div className="flex gap-4">
                  <Link href="#" className="group">
                    <div className="w-12 h-12 border border-[#A3B1A1]/30 flex items-center justify-center transition-all duration-500 group-hover:border-[#A3B1A1] group-hover:bg-[#A3B1A1]/10">
                      <Instagram className="h-5 w-5 text-[#A3B1A1]/70 group-hover:text-[#A3B1A1] transition-colors" />
                    </div>
                  </Link>
                  <Link href="#" className="group">
                    <div className="w-12 h-12 border border-[#A3B1A1]/30 flex items-center justify-center transition-all duration-500 group-hover:border-[#A3B1A1] group-hover:bg-[#A3B1A1]/10">
                      <Facebook className="h-5 w-5 text-[#A3B1A1]/70 group-hover:text-[#A3B1A1] transition-colors" />
                    </div>
                  </Link>
                  <Link href="#" className="group">
                    <div className="w-12 h-12 border border-[#A3B1A1]/30 flex items-center justify-center transition-all duration-500 group-hover:border-[#A3B1A1] group-hover:bg-[#A3B1A1]/10">
                      <Twitter className="h-5 w-5 text-[#A3B1A1]/70 group-hover:text-[#A3B1A1] transition-colors" />
                    </div>
                  </Link>
                </div>
              </div>

              {/* Navigation */}
              <div>
                <h3 className="text-lg font-cormorant text-[#333333] mb-6 tracking-wide">Explorar</h3>
                <ul className="space-y-4 font-lato">
                  <li>
                    <Link href="#beneficios" className="text-[#333333]/70 hover:text-[#A3B1A1] transition-colors duration-300 text-sm tracking-wide">
                      Descubre Tu Potencial
                    </Link>
                  </li>
                  <li>
                    <Link href="#proceso" className="text-[#333333]/70 hover:text-[#A3B1A1] transition-colors duration-300 text-sm tracking-wide">
                      El Proceso Mágico
                    </Link>
                  </li>
                  <li>
                    <Link href="#transformaciones" className="text-[#333333]/70 hover:text-[#A3B1A1] transition-colors duration-300 text-sm tracking-wide">
                      Historias de Éxito
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-[#333333]/70 hover:text-[#A3B1A1] transition-colors duration-300 text-sm tracking-wide">
                      Comunidad
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Contact */}
              <div>
                <h3 className="text-lg font-cormorant text-[#333333] mb-6 tracking-wide">Conversemos</h3>
                <ul className="space-y-4 font-lato">
                  <li className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-[#A3B1A1] mt-1 flex-shrink-0" />
                    <span className="text-[#333333]/70 text-sm leading-relaxed">
                      Las Condes<br/>Santiago, Chile
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail className="h-4 w-4 text-[#A3B1A1] mt-1 flex-shrink-0" />
                    <span className="text-[#333333]/70 text-sm">
                      hola@decollage.cl
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-[#A3B1A1] mt-1 flex-shrink-0" />
                    <span className="text-[#333333]/70 text-sm">
                      +56 9 8765 4321
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-[#A3B1A1]/20 flex flex-col lg:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <p className="text-[#333333]/60 font-lato text-sm">
                  © 2024 Decollage
                </p>
                <div className="w-px h-4 bg-[#A3B1A1]/20" />
                <p className="text-[#333333]/60 font-lato text-sm italic">
                  "Diseñado con ♡ en Santiago"
                </p>
              </div>

              <div className="flex items-center gap-8">
                <Link href="#" className="text-[#333333]/60 hover:text-[#A3B1A1] text-sm font-lato transition-colors duration-300 tracking-wide">
                  Privacidad
                </Link>
                <Link href="#" className="text-[#333333]/60 hover:text-[#A3B1A1] text-sm font-lato transition-colors duration-300 tracking-wide">
                  Términos
                </Link>
                <Button
                  size="sm"
                  className="bg-[#A3B1A1] hover:bg-[#333333] text-white px-4 py-2 font-lato text-xs tracking-wide transition-all duration-500 rounded-none"
                >
                  Crear Mi Hogar Soñado
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}

// Data
const heroSlides = [
  {
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=3000&auto=format&fit=crop',
    title: 'Tu hogar soñado te está esperando',
    subtitle: 'Descubre cómo se vería tu espacio con el diseño perfecto, antes de cambiar una sola cosa',
    alt: 'Elegante interior moderno'
  },
  {
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=3000&auto=format&fit=crop',
    title: 'Atrévete a imaginar sin límites',
    subtitle: 'La confianza para experimentar con infinitas posibilidades, sin gastar un peso',
    alt: 'Living room acogedor'
  },
  {
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=3000&auto=format&fit=crop',
    title: 'El poder de crear está en tus manos',
    subtitle: 'Transforma tu casa en ese refugio que mereces, con la magia de Decollage',
    alt: 'Dormitorio sereno'
  }
]

const dreamBenefits = [
  {
    dream: 'Dile adiós al miedo de equivocarte',
    reality: 'Experimenta infinitas veces hasta encontrar exactamente lo que amas. Sin compromisos, sin arrepentimientos.',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=2000&auto=format&fit=crop'
  },
  {
    dream: 'Tu Pinterest cobra vida',
    reality: 'Todas esas ideas guardadas ahora pueden verse en tu propio espacio. Ve exactamente cómo quedarían antes de decidir.',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=2000&auto=format&fit=crop'
  },
  {
    dream: 'Convence sin palabras',
    reality: 'Muéstrale a tu pareja o al maestro exactamente lo que quieres. Una imagen vale más que mil explicaciones.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000&auto=format&fit=crop'
  },
  {
    dream: 'Tu estilo, tu identidad',
    reality: 'Descubre qué estilos resuenan realmente contigo. Encuentra tu voz en el diseño y crea un hogar que te represente.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000&auto=format&fit=crop'
  },
  {
    dream: 'Ahorra miles en errores costosos',
    reality: 'Visualiza antes de comprar. Evita ese sofá que no cabe o ese color que no combina. Invierte con total seguridad.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop'
  }
]

const transformationStories = [
  {
    before: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=2000&auto=format&fit=crop',
    after: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000&auto=format&fit=crop',
    title: 'De vacío a vibrante',
    description: 'María transformó su living vacío en un espacio lleno de vida y personalidad en solo minutos.',
    tag: 'Living Room'
  },
  {
    before: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=2000&auto=format&fit=crop',
    after: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000&auto=format&fit=crop',
    title: 'El dormitorio de sus sueños',
    description: 'Carla finalmente encontró la paleta perfecta para su santuario personal.',
    tag: 'Bedroom'
  },
  {
    before: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?q=80&w=2000&auto=format&fit=crop',
    after: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=2000&auto=format&fit=crop',
    title: 'Elegancia sin esfuerzo',
    description: 'Andrea descubrió su estilo único y lo llevó a la realidad con confianza total.',
    tag: 'Dining Room'
  }
]

const magicProcess = [
  {
    title: 'Captura tu espacio',
    description: 'Una simple foto desde tu celular es todo lo que necesitas. La magia comienza aquí.',
    image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?q=80&w=2000&auto=format&fit=crop'
  },
  {
    title: 'Elige tu inspiración',
    description: 'Estilos curados especialmente para el gusto chileno. Encuentra el que habla a tu corazón.',
    image: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=2000&auto=format&fit=crop'
  },
  {
    title: 'Observa la transformación',
    description: 'En segundos, tu visión cobra vida. Es como magia, pero mejor: es real y es tuyo.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000&auto=format&fit=crop'
  },
  {
    title: 'Experimenta sin límites',
    description: 'Prueba otro estilo, otro color, otra versión. Tu creatividad no tiene límites aquí.',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=2000&auto=format&fit=crop'
  }
]

const testimonialImages = [
  {
    src: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2000&auto=format&fit=crop',
    alt: 'Transformación de living'
  },
  {
    src: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?q=80&w=2000&auto=format&fit=crop',
    alt: 'Dormitorio renovado'
  },
  {
    src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=2000&auto=format&fit=crop',
    alt: 'Comedor elegante'
  }
]


const testimonials = [
  {
    quote: "Nunca pensé que podría decorar mi casa con tanta confianza. Decollage me quitó el miedo a equivocarme y ahora amo cada rincón de mi hogar.",
    author: "Sofía Mendoza",
    location: "Las Condes, Santiago"
  },
  {
    quote: "La app es mágica. En minutos pude ver 10 versiones diferentes de mi living y elegir la perfecta antes de comprar un solo mueble.",
    author: "Camila Herrera",
    location: "Providencia, Santiago"
  },
  {
    quote: "Por fin una app que entiende el estilo chileno. Los diseños son realistas y alcanzables, no sueños imposibles de revistas extranjeras.",
    author: "Valentina Rojas",
    location: "Ñuñoa, Santiago"
  }
]