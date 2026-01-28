import { http, HttpResponse } from 'msw'

export const handlers = [
    // Mock Auth endpoints
    http.post('/api/Auth/Login', async ({ request }) => {
        const body = await request.json() as { email: string; password: string; CaptchaToken: string }

        if (body.email === 'test@test.com' && body.password === 'test123') {
            return HttpResponse.json({
                success: true,
                data: {
                    token: 'mock-jwt-token',
                    refreshToken: 'mock-refresh-token',
                    kullaniciAdi: 'Test User',
                    yetki: 'Admin',
                    mail: 'test@test.com',
                },
            })
        }

        return HttpResponse.json(
            { success: false, message: 'Kullanıcı adı veya şifre hatalı' },
            { status: 401 }
        )
    }),

    http.post('/api/Auth/refresh', () => {
        return HttpResponse.json({
            success: true,
            data: {
                token: 'new-mock-jwt-token',
                refreshToken: 'new-mock-refresh-token',
            },
        })
    }),

    // Mock Audit endpoints
    http.get('/api/Audit/UserRecentActions', ({ request }) => {
        const url = new URL(request.url)
        const count = parseInt(url.searchParams.get('count') || '10')

        return HttpResponse.json(
            Array.from({ length: count }, (_, i) => ({
                id: i + 1,
                userId: 1,
                userName: 'Test User',
                actionName: `Action ${i + 1}`,
                createdAt: new Date().toISOString(),
                statusCode: 200,
                isError: false,
            }))
        )
    }),

    // Add more mock handlers as needed
]
