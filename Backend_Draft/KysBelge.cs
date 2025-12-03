using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FasBackend.Entities
{
    [Table("KysBelgeler")]
    public class KysBelge
    {
        [Key]
        public int Id { get; set; }

        public int DenetciId { get; set; }
        public int DenetlenenId { get; set; }
        public int Yil { get; set; }

        [Required]
        [StringLength(100)]
        public string FormKodu { get; set; } // Örn: "KaynaklarPolitikasi"

        [StringLength(250)]
        public string Baslik { get; set; }

        public string Icerik { get; set; } // Rich Text HTML içeriği

        public string KontrolListesiJson { get; set; } // JSON formatında checklist: [{"label": "...", "checked": true}, ...]

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? UpdatedDate { get; set; }
        
        public bool StandartMi { get; set; } // Standart şablon mu, yoksa kullanıcı spesifik mi?
    }
}
