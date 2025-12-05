using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using FasWebUI.Models;

namespace FasWebUI.Data.Configurations
{
    /// <summary>
    /// MutabakatUploadToken entity configuration
    /// </summary>
    public class MutabakatUploadTokenConfiguration : IEntityTypeConfiguration<MutabakatUploadToken>
    {
        public void Configure(EntityTypeBuilder<MutabakatUploadToken> builder)
        {
            builder.ToTable("MutabakatUploadToken");

            builder.HasKey(e => e.Id);

            builder.Property(e => e.Id)
                .ValueGeneratedOnAdd();

            builder.Property(e => e.Token)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(e => e.DenetciId)
                .IsRequired();

            builder.Property(e => e.DenetlenenId)
                .IsRequired();

            builder.Property(e => e.Yil)
                .IsRequired();

            builder.Property(e => e.DetayKodu)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(e => e.OlusturmaTarihi)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            builder.Property(e => e.SonKullanmaTarihi)
                .IsRequired();

            builder.Property(e => e.Kullanildi)
                .IsRequired()
                .HasDefaultValue(false);

            builder.Property(e => e.KullanilmaTarihi)
                .IsRequired(false);

            builder.Property(e => e.OlusturanKullaniciId)
                .IsRequired();

            builder.Property(e => e.AliciAdi)
                .HasMaxLength(200);

            builder.Property(e => e.Aciklama)
                .HasMaxLength(500);

            // Unique index on Token
            builder.HasIndex(e => e.Token)
                .IsUnique()
                .HasDatabaseName("IX_MutabakatUploadToken_Token");

            // Performance index for token validation queries
            builder.HasIndex(e => new { e.Token, e.SonKullanmaTarihi })
                .HasDatabaseName("IX_MutabakatUploadToken_Token_Expiry");

            // Index for finding tokens by record
            builder.HasIndex(e => new { e.DenetciId, e.DenetlenenId, e.Yil, e.DetayKodu })
                .HasDatabaseName("IX_MutabakatUploadToken_Record");

            // Index for cleanup queries
            builder.HasIndex(e => e.SonKullanmaTarihi)
                .HasDatabaseName("IX_MutabakatUploadToken_SonKullanmaTarihi");
        }
    }
}
