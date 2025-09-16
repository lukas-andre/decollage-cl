'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '24px',
        maxWidth: '400px'
      }}>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '16px'
        }}>
          Algo salió mal
        </h2>
        <p style={{
          color: '#6b7280',
          marginBottom: '24px'
        }}>
          {error.message || 'Ha ocurrido un error inesperado'}
        </p>
        <button
          onClick={reset}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '6px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  )
}