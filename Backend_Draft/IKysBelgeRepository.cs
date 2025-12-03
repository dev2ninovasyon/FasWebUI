using FasBackend.Entities;
using System.Threading.Tasks;

namespace FasBackend.Repositories
{
    public interface IKysBelgeRepository
    {
        Task<KysBelge> GetByFormKoduAsync(int denetlenenId, int yil, string formKodu);
        Task<KysBelge> GetByIdAsync(int id);
        Task AddAsync(KysBelge kysBelge);
        Task UpdateAsync(KysBelge kysBelge);
    }
}
