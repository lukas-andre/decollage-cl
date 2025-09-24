import { Metadata } from 'next'
import { SecuritySettings } from '@/components/dashboard/security-settings'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Seguridad | Decollage',
  description: 'Administra la seguridad de tu cuenta'
}

export default async function SecurityPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-cormorant font-light text-[#333333] mb-2">
          Configuración de Seguridad
        </h1>
        <p className="text-[#333333]/70 font-lato">
          Administra la seguridad de tu cuenta y métodos de autenticación
        </p>
      </div>

      <SecuritySettings userEmail={user.email!} />
    </div>
  )
}