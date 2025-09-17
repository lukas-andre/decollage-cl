import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { shareService } from '@/lib/services/share.service'
import { shareAnalyticsService } from '@/lib/services/share-analytics.service'
import { PublicShareView } from '@/components/share/PublicShareView'
import type { PublicShareData } from '@/types/sharing'

// Enable ISR with 1 hour revalidation
export const revalidate = 3600

interface SharePageProps {
  params: Promise<{
    token: string
  }>
  searchParams: Promise<{
    password?: string
  }>
}

// Generate metadata for SEO and OG tags
export async function generateMetadata({ params }: SharePageProps): Promise<Metadata> {
  try {
    const { token } = await params
    const shareData = await shareService.getShareByToken(token)
    
    const title = shareData.share.title || `${shareData.project.name} | Decollage.cl`
    const description = shareData.share.description || 
      `Descubre esta increíble transformación de espacios realizada con Decollage.cl. ${shareData.project.userDisplayName} creó un diseño único utilizando inteligencia artificial.`
    
    const ogImageUrl = shareData.share.og_image_url || `/api/og?token=${token}`
    
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: title,
          }
        ],
        type: 'website',
        locale: 'es_CL',
        siteName: 'Decollage.cl',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
      },
      robots: {
        index: shareData.share.visibility === 'public',
        follow: true,
      },
      alternates: {
        canonical: `https://decollage.cl/share/${token}`,
      }
    }
  } catch (error) {
    return {
      title: 'Transformación de Espacios | Decollage.cl',
      description: 'Descubre increíbles transformaciones de espacios con inteligencia artificial.',
    }
  }
}

// Pre-render popular shares at build time
export async function generateStaticParams() {
  try {
    const supabase = await createClient()

    // Get most viewed shares from the last 30 days
    const { data: popularShares } = await supabase
      .from('project_shares')
      .select('share_token')
      .eq('visibility', 'public')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('current_views', { ascending: false })
      .limit(50)

    return (popularShares || []).map((share) => ({
      token: share.share_token,
    }))
  } catch (error) {
    console.error('Error generating static params:', error)
    return []
  }
}

export default async function SharePage({ params, searchParams }: SharePageProps) {
  try {
    const { token } = await params
    const search = await searchParams

    // Validate share password if required
    if (search.password) {
      const isValidPassword = await shareService.validateSharePassword(
        token,
        search.password
      )
      if (!isValidPassword) {
        return <PasswordProtectedView token={token} error="Contraseña incorrecta" />
      }
    }

    // Get share data
    const shareData = await shareService.getShareByToken(token)

    // Check if password is required but not provided
    if (shareData.share.password_hash && !search.password) {
      return <PasswordProtectedView token={token} />
    }

    // Track the view (server-side for ISR)
    await shareAnalyticsService.trackShareView(
      shareData.share.id,
      'project'
    )

    return <PublicShareView shareData={shareData} />
  } catch (error) {
    console.error('Error loading share:', error)
    notFound()
  }
}

// Password protected view component
function PasswordProtectedView({ token, error }: { token: string; error?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Contenido Protegido
            </h1>
            <p className="text-gray-600">
              Esta transformación está protegida con contraseña.
            </p>
          </div>

          <form method="GET" className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ingresa la contraseña"
              />
            </div>
            
            {error && (
              <div className="text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Acceder
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Hecho con{' '}
              <a 
                href="https://decollage.cl" 
                className="text-blue-600 hover:text-blue-800 font-medium"
                target="_blank"
                rel="noopener noreferrer"
              >
                Decollage.cl
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}