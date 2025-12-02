using FasBackend.Entities;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FasBackend.Repositories
{
    public interface IKysRiskMatrisiRepository
    {
        Task<KysRiskMatrisi> GetByKategoriKoduAsync(string kategoriKodu, int? denetciId, int? denetlenenId, int? yil);
        Task<KysRiskMatrisi> GetByIdAsync(int id);
        Task<IEnumerable<KysRiskMatrisi>> GetAllAsync(int? denetciId, int? denetlenenId, int? yil);
        Task<KysRiskMatrisi> CreateAsync(KysRiskMatrisi entity);
        Task<KysRiskMatrisi> UpdateAsync(KysRiskMatrisi entity);
        Task<bool> DeleteAsync(int id);
    }
}
