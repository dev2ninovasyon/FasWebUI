using System.Collections.Generic;

namespace FasBackend.DTOs
{
    public class KysBelgeDto
    {
        public int Id { get; set; }
        public int DenetciId { get; set; }
        public int DenetlenenId { get; set; }
        public int Yil { get; set; }
        public string FormKodu { get; set; }
        public string Baslik { get; set; }
        public string Icerik { get; set; }
        public List<KysChecklistItemDto> Checklist { get; set; }
    }

    public class KysBelgeUpdateDto
    {
        public int Id { get; set; }
        public string Icerik { get; set; }
        public List<KysChecklistItemDto> Checklist { get; set; }
    }

    public class KysChecklistItemDto
    {
        public string Label { get; set; }
        public bool Checked { get; set; }
    }
}
