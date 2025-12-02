namespace FasBackend.Dtos
{
    public class KysBelgelerDto
    {
        public int Id { get; set; }
        public string? BelgeAdi { get; set; }
        public string? FormKodu { get; set; }
        public string? Islem { get; set; }
        public string? Tespit { get; set; }
        public int? DenetlenenId { get; set; }
        public int Yil { get; set; }
    }

    public class CreateKysBelgeDto
    {
        public string? BelgeAdi { get; set; }
        public string? FormKodu { get; set; }
        public string? Islem { get; set; }
        public string? Tespit { get; set; }
        public int? DenetlenenId { get; set; }
        public int Yil { get; set; }
    }

    public class UpdateKysBelgeDto
    {
        public string? Islem { get; set; }
        public string? Tespit { get; set; }
    }
}
