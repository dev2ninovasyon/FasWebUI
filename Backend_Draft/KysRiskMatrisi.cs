using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace FasBackend.Entities
{
    public class KysRiskMatrisi : BaseEntity
    {
        public int? DenetciId { get; set; }
        public int? DenetlenenId { get; set; }
        public int? Yil { get; set; }

        [Required]
        [StringLength(100)]
        public string KategoriKodu { get; set; } // "UstYonetim", "EtikHukumler", vb.

        [StringLength(250)]
        public string Baslik { get; set; }

        public string MatrisJson { get; set; } // JSON formatında risk matrisi

        public DateTime CreatedDate { get; set; } = DateTime.Now;
        public DateTime? UpdatedDate { get; set; }
        public bool StandartMi { get; set; }
    }
}
