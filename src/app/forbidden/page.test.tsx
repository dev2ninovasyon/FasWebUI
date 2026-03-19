import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import Page from './page'

vi.mock('next/image', () => ({
    default: ({ priority: _priority, ...props }: any) => <img {...props} />,
}))

vi.mock('next/link', () => ({
    default: ({ href, children, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}))

describe('Forbidden Page', () => {
    it('renders forbidden message and home link', () => {
        render(<Page />)

        expect(screen.getByText('Hay Aksi!!!')).toBeInTheDocument()
        expect(screen.getByText('Bu sayfaya giriş izniniz bulunmamaktadır.')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Anasayfaya Dön' })).toHaveAttribute('href', '/Anasayfa')
    })
})
