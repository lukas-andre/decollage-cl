import { ImageResponse } from 'next/og'
import { shareService } from '@/lib/services/share.service'

// Route segment config
export const runtime = 'edge'
export const alt = 'Transformación de Espacios - Decollage.cl'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

interface OGImageProps {
  params: Promise<{
    token: string
  }>
}

export default async function Image({ params }: OGImageProps) {
  try {
    const { token } = await params
    // Get share data
    const shareData = await shareService.getShareByToken(token)
    
    // Get up to 4 featured images
    const featuredImages = shareData.items.slice(0, 4)
    
    const title = shareData.share.title || shareData.project.name
    const description = shareData.share.description || 
      `Transformación creada por ${shareData.project.userDisplayName}`

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8f9fa',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              padding: '40px',
              position: 'absolute',
              top: 0,
            }}
          >
            <div
              style={{
                fontSize: 32,
                fontWeight: 'bold',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              🏠 Decollage.cl
            </div>
            <div
              style={{
                fontSize: 18,
                color: 'rgba(255, 255, 255, 0.9)',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 16px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
              }}
            >
              ✨ Transformación con IA
            </div>
          </div>

          {/* Main content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              flex: 1,
              width: '100%',
              padding: '0 40px',
            }}
          >
            {/* Title */}
            <h1
              style={{
                fontSize: 48,
                fontWeight: 'bold',
                color: 'white',
                textAlign: 'center',
                marginBottom: '20px',
                maxWidth: '800px',
                lineHeight: 1.2,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}
            >
              {title}
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: 24,
                color: 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
                marginBottom: '40px',
                maxWidth: '600px',
                lineHeight: 1.4,
              }}
            >
              {description}
            </p>

            {/* Image grid */}
            {featuredImages.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  gap: '20px',
                  marginBottom: '40px',
                }}
              >
                {featuredImages.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      width: featuredImages.length === 1 ? '300px' : '140px',
                      height: featuredImages.length === 1 ? '200px' : '100px',
                      borderRadius: '12px',
                      overflow: 'hidden',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                      border: '3px solid rgba(255,255,255,0.3)',
                    }}
                  >
                    <img
                      src={item.imageUrl}
                      alt=""
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Stats */}
            <div
              style={{
                display: 'flex',
                gap: '30px',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '18px',
                }}
              >
                ❤️ {shareData.reactions.total} aplausos
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '18px',
                }}
              >
                🖼️ {shareData.items.length} transformaciones
              </div>
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: '30px',
              position: 'absolute',
              bottom: 0,
            }}
          >
            <div
              style={{
                fontSize: 16,
                color: 'rgba(255, 255, 255, 0.8)',
                textAlign: 'center',
              }}
            >
              Crea tu propia transformación en decollage.cl
            </div>
          </div>

          {/* Decorative elements */}
          <div
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              left: '20px',
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
            }}
          />
        </div>
      ),
      {
        ...size,
      }
    )
  } catch (error) {
    console.error('Error generating OG image:', error)
    
    // Fallback OG image
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#667eea',
            backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          <div
            style={{
              fontSize: 64,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              marginBottom: '20px',
            }}
          >
            🏠 Decollage.cl
          </div>
          <div
            style={{
              fontSize: 32,
              color: 'rgba(255, 255, 255, 0.9)',
              textAlign: 'center',
            }}
          >
            Transformación de Espacios con IA
          </div>
        </div>
      ),
      {
        ...size,
      }
    )
  }
}