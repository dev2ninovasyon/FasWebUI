using System.Collections.Generic;
using System.Threading.Tasks;
using FasWebUI.Models;

namespace FasWebUI.Repositories
{
    /// <summary>
    /// Repository interface for MutabakatUploadToken operations
    /// </summary>
    public interface IMutabakatUploadTokenRepository
    {
        /// <summary>
        /// Token'ı ID ile getir
        /// </summary>
        Task<MutabakatUploadToken?> GetByIdAsync(int id);

        /// <summary>
        /// Token string ile getir
        /// </summary>
        Task<MutabakatUploadToken?> GetByTokenAsync(string token);

        /// <summary>
        /// Belirli bir kayıt için aktif tokenları getir
        /// </summary>
        Task<List<MutabakatUploadToken>> GetActiveTokensByRecordAsync(int denetciId, int denetlenenId, int yil, string detayKodu);

        /// <summary>
        /// Denetçi için tüm tokenları getir
        /// </summary>
        Task<List<MutabakatUploadToken>> GetAllByDenetciAsync(int denetciId, int denetlenenId, int yil);

        /// <summary>
        /// Yeni token ekle
        /// </summary>
        Task<MutabakatUploadToken> AddAsync(MutabakatUploadToken token);

        /// <summary>
        /// Token'ı güncelle (kullanıldı olarak işaretle)
        /// </summary>
        Task<MutabakatUploadToken> UpdateAsync(MutabakatUploadToken token);

        /// <summary>
        /// Token'ı sil
        /// </summary>
        Task<bool> DeleteAsync(int id);

        /// <summary>
        /// Süresi dolmuş tokenları sil
        /// </summary>
        Task<int> DeleteExpiredTokensAsync();

        /// <summary>
        /// Token geçerli mi kontrol et
        /// </summary>
        Task<bool> IsTokenValidAsync(string token);
    }
}
