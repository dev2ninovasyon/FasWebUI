'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body>
                <div style={{ padding: '20px', textAlign: 'center' }}>
                    <h2>Kritik bir hata oluştu!</h2>
                    <p>{error.message}</p>
                    <button onClick={() => reset()}>Tekrar Dene</button>
                </div>
            </body>
        </html>
    )
}
