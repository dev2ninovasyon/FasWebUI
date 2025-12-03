using FasBackend.Dtos;
using FasBackend.Entities;
using FasBackend.Repositories;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FasBackend.Services
{
    public class KysBelgelerService
    {
        private readonly KysBelgelerRepository _repository;

        public KysBelgelerService(KysBelgelerRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<KysBelgelerDto>> GetListAsync(string formKodu, int denetlenenId, int yil)
        {
            var entities = await _repository.GetByFormKoduAndDenetlenenYilAsync(formKodu, denetlenenId, yil);
            return entities.Select(x => new KysBelgelerDto
            {
                Id = x.Id,
                BelgeAdi = x.BelgeAdi,
                FormKodu = x.FormKodu,
                Islem = x.Islem,
                Tespit = x.Tespit,
                DenetlenenId = x.DenetlenenId,
                // Yil = x.Yil // Assuming Yil is in base class or we don't return it
            }).ToList();
        }

        public async Task CreateAsync(CreateKysBelgeDto dto)
        {
            var entity = new KysBelgeler
            {
                BelgeAdi = dto.BelgeAdi,
                FormKodu = dto.FormKodu,
                Islem = dto.Islem,
                Tespit = dto.Tespit,
                DenetlenenId = dto.DenetlenenId,
                // Yil = dto.Yil
            };
            await _repository.AddAsync(entity);
        }

        public async Task UpdateAsync(int id, UpdateKysBelgeDto dto)
        {
            var entity = await _repository.GetByIdAsync(id);
            if (entity != null)
            {
                entity.Islem = dto.Islem;
                entity.Tespit = dto.Tespit;
                await _repository.UpdateAsync(entity);
            }
        }

        public async Task DeleteAsync(int id)
        {
            await _repository.DeleteAsync(id);
        }
    }
}
