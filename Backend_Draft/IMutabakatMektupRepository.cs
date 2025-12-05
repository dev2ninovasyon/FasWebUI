using System.Collections.Generic;
using System.Threading.Tasks;
using FasWebUI.Models;

namespace FasWebUI.Repositories
{
    /// <summary>
    /// Repository interface for MutabakatMektupBelge operations
    /// </summary>
    public interface IMutabakatMektupRepository
    {
        /// <summary>
        /// Mektup belgesini ID ile getir
        /// </summary>
        Task<MutabakatMektupBelge?> GetByIdAsync(int id);

        /// <summary>
        /// Belirli bir kayıt için mektup belgesini getir
        /// </summary>
        Task<MutabakatMektupBelge?> GetByRecordAsync(int denetciId, int denetlenenId, int yil, string detayKodu);

        /// <summary>
        /// Denetçi için tüm mektup belgelerini getir (dosya içeriği hariç)
        /// </summary>
        Task<List<MutabakatMektupBelge>> GetAllByDenetciAsync(int denetciId, int denetlenenId, int yil);

        /// <summary>
        /// Yeni mektup belgesi ekle
        /// </summary>
        Task<MutabakatMektupBelge> AddAsync(MutabakatMektupBelge belge);

        /// <summary>
        /// Mevcut mektup belgesini güncelle
        /// </summary>
        Task<MutabakatMektupBelge> UpdateAsync(MutabakatMektupBelge belge);

        /// <summary>
        /// Mektup belgesini sil
        /// </summary>
        Task<bool> DeleteAsync(int id);

        /// <summary>
        /// Belirli bir kayıt için mektup var mı kontrol et
        /// </summary>
        Task<bool> ExistsAsync(int denetciId, int denetlenenId, int yil, string detayKodu);
    }
}
