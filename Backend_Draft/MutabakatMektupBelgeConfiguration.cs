using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FasWebUI.Models;

namespace FasWebUI.Data.Configurations
{
    /// <summary>
    /// MutabakatMektupBelge entity configuration
    /// </summary>
    public class MutabakatMektupBelgeConfiguration : IEntityTypeConfiguration<MutabakatMektupBelge>
    {
        public void Configure(EntityTypeBuilder<MutabakatMektupBelge> builder)
        {
            builder.ToTable("MutabakatMektupBelge");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.Id)
                .ValueGeneratedOnAdd();

            builder.Property(e => e.DenetciId)
                .IsRequired();

            builder.Property(e => e.DenetlenenId)
                .IsRequired();

            builder.Property(e => e.Yil)
                .IsRequired();

            builder.Property(e => e.DetayKodu)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(e => e.DosyaAdi)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(e => e.OrijinalDosyaAdi)
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(e => e.ContentType)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(e => e.DosyaBoyutu)
                .IsRequired();

            builder.Property(e => e.DosyaIcerigi)
                .IsRequired()
                .HasColumnType("VARBINARY(MAX)");

            builder.Property(e => e.YuklemeTarihi)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            builder.Property(e => e.YukleyenKullaniciId)
                .IsRequired();

            builder.Property(e => e.GuncellenmeTarihi)
                .IsRequired(false);

            builder.Property(e => e.Aciklama)
                .HasMaxLength(500);

            // Unique index: Her detay kodu için sadece bir mektup
            builder.HasIndex(e => new { e.DenetciId, e.DenetlenenId, e.Yil, e.DetayKodu })
                .IsUnique()
                .HasDatabaseName("IX_MutabakatMektupBelge_Unique");

            // Performance index for queries
            builder.HasIndex(e => e.YuklemeTarihi)
                .HasDatabaseName("IX_MutabakatMektupBelge_YuklemeTarihi");

            builder.HasIndex(e => e.DenetciId)
                .HasDatabaseName("IX_MutabakatMektupBelge_DenetciId");
        }
    }
}
