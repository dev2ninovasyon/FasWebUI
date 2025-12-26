'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>Bir hata oluştu!</h2>
            <p>{error.message}</p>
            <button onClick={() => reset()}>Tekrar Dene</button>
        </div>
    )
}
