using System;

namespace FasWebUI.Models
{
    /// <summary>
    /// Harici kullanıcılar için mektup yükleme linklerini yöneten token modeli
    /// </summary>
    public class MutabakatUploadToken
    {
        /// <summary>
        /// Benzersiz kimlik
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// GUID tabanlı benzersiz token
        /// </summary>
        public string Token { get; set; } = string.Empty;

        /// <summary>
        /// Denetçi firma ID
        /// </summary>
        public int DenetciId { get; set; }

        /// <summary>
        /// Denetlenen firma ID
        /// </summary>
        public int DenetlenenId { get; set; }

        /// <summary>
        /// Denetim yılı
        /// </summary>
        public int Yil { get; set; }

        /// <summary>
        /// İlgili mutabakat detay kodu
        /// </summary>
        public string DetayKodu { get; set; } = string.Empty;

        /// <summary>
        /// Token oluşturulma tarihi
        /// </summary>
        public DateTime OlusturmaTarihi { get; set; }

        /// <summary>
        /// Token son kullanma tarihi
        /// </summary>
        public DateTime SonKullanmaTarihi { get; set; }

        /// <summary>
        /// Token kullanıldı mı?
        /// </summary>
        public bool Kullanildi { get; set; }

        /// <summary>
        /// Token kullanılma tarihi (nullable)
        /// </summary>
        public DateTime? KullanilmaTarihi { get; set; }

        /// <summary>
        /// Token'ı oluşturan kullanıcı ID
        /// </summary>
        public int OlusturanKullaniciId { get; set; }

        /// <summary>
        /// İlgili firma/kişi adı (opsiyonel, görüntüleme için)
        /// </summary>
        public string? AliciAdi { get; set; }

        /// <summary>
        /// Mutabakat yapılacak hesap adı (opsiyonel)
        /// </summary>
        public string? HesapAdi { get; set; }

        /// <summary>
        /// Token ile ilgili açıklama/notlar
        /// </summary>
        public string? Aciklama { get; set; }
    }
}
