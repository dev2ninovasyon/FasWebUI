using FasBackend.DTOs;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FasBackend.Services
{
    public interface IKysBelgeService
    {
        Task<KysBelgeDto> GetByFormKoduAsync(int denetlenenId, int yil, string formKodu);
        Task<KysBelgeDto> UpdateAsync(int denetlenenId, int yil, KysBelgeUpdateDto dto);
        Task<KysBelgeDto> UpdateChecklistAsync(int id, List<KysChecklistItemDto> checklist);
    }
}
