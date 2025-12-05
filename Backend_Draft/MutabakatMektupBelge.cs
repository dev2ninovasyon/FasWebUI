using System;

namespace FasWebUI.Models
{
    /// <summary>
    /// Mutabakat doğrulama mektuplarını saklayan model
    /// </summary>
    public class MutabakatMektupBelge
    {
        /// <summary>
        /// Benzersiz kimlik
        /// </summary>
        public int Id { get; set; }

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
        /// Mutabakat kayıt detay kodu
        /// </summary>
        public string DetayKodu { get; set; } = string.Empty;

        /// <summary>
        /// Sistemde saklanan dosya adı
        /// </summary>
        public string DosyaAdi { get; set; } = string.Empty;

        /// <summary>
        /// Orijinal yüklenen dosya adı
        /// </summary>
        public string OrijinalDosyaAdi { get; set; } = string.Empty;

        /// <summary>
        /// Dosya MIME tipi (örn: application/pdf)
        /// </summary>
        public string ContentType { get; set; } = string.Empty;

        /// <summary>
        /// Dosya boyutu (bytes)
        /// </summary>
        public long DosyaBoyutu { get; set; }

        /// <summary>
        /// Dosya içeriği (binary)
        /// </summary>
        public byte[] DosyaIcerigi { get; set; } = Array.Empty<byte>();

        /// <summary>
        /// Dosyanın yüklenme tarihi
        /// </summary>
        public DateTime YuklemeTarihi { get; set; }

        /// <summary>
        /// Dosyayı yükleyen kullanıcı ID
        /// </summary>
        public int YukleyenKullaniciId { get; set; }

        /// <summary>
        /// Son güncellenme tarihi (nullable)
        /// </summary>
        public DateTime? GuncellenmeTarihi { get; set; }

        /// <summary>
        /// Açıklama/notlar (opsiyonel)
        /// </summary>
        public string? Aciklama { get; set; }
    }
}
