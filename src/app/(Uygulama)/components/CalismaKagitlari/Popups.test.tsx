import { fireEvent, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ConfirmPopUpComponent } from './ConfirmPopUp'
import { CreateGroupPopUp } from './CreateGroupPopUp'
import { renderWithProviders } from '@/test/test-utils'

describe('Calisma kagitlari popups', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('shows disabled loading state while waiting for delete', () => {
        const handleClose = vi.fn()
        const handleDelete = vi.fn()

        renderWithProviders(
            <ConfirmPopUpComponent
                isConfirmPopUp
                handleClose={handleClose}
                handleDelete={handleDelete}
                isLoading
            />
        )

        expect(screen.getByRole('button', { name: 'Siliniyor...' })).toBeDisabled()
        expect(screen.getByRole('button', { name: 'Hayır, İptal Et' })).toBeDisabled()
        fireEvent.click(screen.getByRole('button', { name: 'Siliniyor...' }))
        expect(handleDelete).not.toHaveBeenCalled()
        expect(handleClose).not.toHaveBeenCalled()
    })

    it('updates group name and saves or closes create group popup', () => {
        const setIslem = vi.fn()
        const setIsPopUpOpen = vi.fn()
        const handleCreateGroup = vi.fn()

        renderWithProviders(
            <CreateGroupPopUp
                islem="Mevcut islem"
                isPopUpOpen
                setIslem={setIslem}
                setIsPopUpOpen={setIsPopUpOpen}
                handleCreateGroup={handleCreateGroup}
            />
        )

        fireEvent.change(screen.getByDisplayValue('Mevcut islem'), { target: { value: 'Yeni grup' } })
        expect(setIslem).toHaveBeenCalledWith('Yeni grup')

        fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }))
        expect(handleCreateGroup).toHaveBeenCalledWith('Mevcut islem')

        fireEvent.click(screen.getByRole('button', { name: 'Sil' }))
        expect(setIsPopUpOpen).toHaveBeenCalledWith(false)
    })
})
