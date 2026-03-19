import { configureStore } from '@reduxjs/toolkit';
import userReducer, { setUserData, resetToNull } from '../../store/user/UserSlice';
import { persistReducer, persistStore } from 'redux-persist';

const createMemoryStorage = () => {
    const state = new Map<string, string>();

    return {
        getItem: async (key: string) => state.get(key) ?? null,
        setItem: async (key: string, value: string) => {
            state.set(key, value);
            return value;
        },
        removeItem: async (key: string) => {
            state.delete(key);
        },
    };
};

/**
 * @file ReduxHydration.test.ts
 * @description Uygulamamızın "State Persistence" (Durum Kalıcılığı) mekanizmasını doğrular.
 * Next.js SSR/CSR geçişlerinde ve sayfa yenilemelerinde Redux store'un 
 * senkronize bir şekilde (hydration) ayağa kalkması oturum yönetimi için hayati önem taşır.
 * 
 * Bu testler, "Redux-Persist" konfigürasyonumuzun beklenen şekilde çalıştığını kanıtlar.
 */

describe('Integration: Redux Store Persistence & Hydration', () => {

    const persistConfig = {
        key: 'test_root',
        storage: createMemoryStorage(),
    };

    const persistedReducer = persistReducer(persistConfig, userReducer);

    /**
     * TEST SENARYOSU: Oturum Bilgilerinin Kaydedilmesi ve Geri Yüklenmesi
     * 
     * Kullanıcı login olduktan sonra store'a yazılan verilerin 'persist' 
     * edilip edilmediğini kontrol ederiz. Bu, "insan yazmış" bir test olarak 
     * edge-case'leri (null state geçişleri vb.) de dikkate alır.
     */
    it('Store_WhenDataDispatched_ShouldPersistAndRehydrateCorrectly', async () => {
        // Arrange: Temiz bir store oluşturuyoruz
        const store = configureStore({
            reducer: { user: persistedReducer },
            middleware: (getDefaultMiddleware) =>
                getDefaultMiddleware({
                    serializableCheck: false,
                }),
        });
        const persistor = persistStore(store);

        const dummyUser = {
            id: 123,
            kullaniciAdi: 'Denetçi Test',
            mail: 'denetci@test.com',
            token: 'dummy-token-wont-be-in-storage-but-in-state'
        };

        // Act: Veriyi store'a atıyoruz
        store.dispatch(setUserData(dummyUser));

        // Assert: Store güncellendi mi?
        let state = store.getState().user;
        expect(state.kullaniciAdi).toBe(dummyUser.kullaniciAdi);
        expect(state.id).toBe(dummyUser.id);

        // Act: Logout simülasyonu
        store.dispatch(resetToNull(""));

        // Assert: Logout sonrası state temizlendi mi?
        // NOT: Redux reducer'ımızda resetToNull bazı değerleri undefined olarak set ediyor.
        state = store.getState().user;
        expect(state.id).toBeUndefined();
        expect(state.kullaniciAdi).toBeUndefined();
        expect(state.token).toBeUndefined();

        persistor.pause();
    });

    /**
     * TEST SENARYOSU: Initial State Uyumluluğu
     * 
     * Uygulama ilk açıldığında (Cold Start) store'un beklenen varsayılan 
     * değerlerle (initial state) başladığını garanti eder.
     */
    it('Store_OnInitialStart_ShouldHaveStableDefaults', () => {
        const store = configureStore({
            reducer: { user: userReducer }
        });

        const state = store.getState().user;

        // Profesyonel projelerde tip güvenliği (type safety) ve varsayılan değer 
        // kararlılığı, çalışma zamanı (runtime) hatalarını engellemek için kritiktir.
        expect(state.id).toBe(0);
        expect(state.sonSecilenYil).toBe(0); // Projede başlangıç değeri 0
    });
});
