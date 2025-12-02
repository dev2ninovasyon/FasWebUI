using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FasBackend.Entities
{
    public class BaseEntityCalismaKagitlari
    {
        [Key]
        public int Id { get; set; }
        public int? DenetlenenId { get; set; }
        public DateTime CreatedDate { get; set; } = DateTime.Now;
    }

    public class KysBelgeler : BaseEntityCalismaKagitlari
    {
        public string? BelgeAdi { get; set; }
        public string? FormKodu { get; set; }
        public string? Islem { get; set; }
        public string? Tespit { get; set; }
        
        [ForeignKey("DenetlenenId")]
        public virtual Denetlenen Denetlenen { get; set; }
    }

    // Dummy Denetlenen class for compilation context
    public class Denetlenen
    {
        public int Id { get; set; }
    }
}
