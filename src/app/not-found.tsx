export default function NotFound() {
  return (
    <html>
      <body>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #f0fdf4, #fed7aa)'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '24px',
            maxWidth: '400px'
          }}>
            <h1 style={{
              fontSize: '96px',
              fontWeight: '300',
              color: '#4ade80',
              margin: '0'
            }}>404</h1>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '500',
              color: '#1f2937',
              marginBottom: '8px'
            }}>Página no encontrada</h2>
            <p style={{
              color: '#4b5563',
              marginBottom: '24px'
            }}>
              Lo sentimos, la página que buscas no existe.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href="/dashboard"
                style={{
                  display: 'inline-block',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  textDecoration: 'none'
                }}
              >
                Volver al dashboard
              </a>
              <a
                href="/"
                style={{
                  display: 'inline-block',
                  backgroundColor: 'white',
                  color: '#1f2937',
                  padding: '10px 16px',
                  borderRadius: '6px',
                  border: '1px solid #e5e7eb',
                  textDecoration: 'none'
                }}
              >
                Ir al inicio
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}