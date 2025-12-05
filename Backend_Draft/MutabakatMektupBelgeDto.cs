using System;

namespace FasWebUI.DTOs
{
    /// <summary>
    /// Mutabakat mektup belgesi DTO (dosya içeriği hariç, liste görünümü için)
    /// </summary>
    public class MutabakatMektupBelgeDto
    {
        public int Id { get; set; }
        public int DenetciId { get; set; }
        public int DenetlenenId { get; set; }
        public int Yil { get; set; }
        public string DetayKodu { get; set; } = string.Empty;
        public string OrijinalDosyaAdi { get; set; } = string.Empty;
        public string ContentType { get; set; } = string.Empty;
        public long DosyaBoyutu { get; set; }
        public DateTime YuklemeTarihi { get; set; }
        public int YukleyenKullaniciId { get; set; }
        public DateTime? GuncellenmeTarihi { get; set; }
        public string? Aciklama { get; set; }
    }

    /// <summary>
    /// Mektup yükleme için request DTO
    /// </summary>
    public class MutabakatMektupUploadRequest
    {
        public int DenetciId { get; set; }
        public int DenetlenenId { get; set; }
        public int Yil { get; set; }
        public string DetayKodu { get; set; } = string.Empty;
        public int KullaniciId { get; set; }
        public string? Aciklama { get; set; }
    }

    /// <summary>
    /// Token üretme request DTO
    /// </summary>
    public class GenerateMutabakatLinkRequest
    {
        public int DenetciId { get; set; }
        public int DenetlenenId { get; set; }
        public int Yil { get; set; }
        public string DetayKodu { get; set; } = string.Empty;
        public int KullaniciId { get; set; }
        public int GecerlilikGunSayisi { get; set; } = 7; // Varsayılan 7 gün
        public string? AliciAdi { get; set; }
        public string? HesapAdi { get; set; }
        public string? Aciklama { get; set; }
    }

    /// <summary>
    /// Token üretme response DTO
    /// </summary>
    public class GenerateMutabakatLinkResponse
    {
        public string Token { get; set; } = string.Empty;
        public string UploadUrl { get; set; } = string.Empty;
        public DateTime OlusturmaTarihi { get; set; }
        public DateTime SonKullanmaTarihi { get; set; }
    }

    /// <summary>
    /// Token validation request DTO
    /// </summary>
    public class ValidateMutabakatTokenRequest
    {
        public string Token { get; set; } = string.Empty;
    }

    /// <summary>
    /// Token validation response DTO
    /// </summary>
    public class ValidateMutabakatTokenResponse
    {
        public bool IsValid { get; set; }
        public string Message { get; set; } = string.Empty;
        public int? DenetciId { get; set; }
        public int? DenetlenenId { get; set; }
        public int? Yil { get; set; }
        public string? DetayKodu { get; set; }
        public DateTime? SonKullanmaTarihi { get; set; }
        public string? AliciAdi { get; set; }
        public string? HesapAdi { get; set; }
        public bool? MektupYuklendi { get; set; }
    }

    /// <summary>
    /// Token ile mektup yükleme request DTO
    /// </summary>
    public class UploadViaMutabakatTokenRequest
    {
        public string Token { get; set; } = string.Empty;
    }
}
