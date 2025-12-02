using FasBackend.DTOs;
using FasBackend.Entities;
using FasBackend.Helpers;
using FasBackend.Repositories;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FasBackend.Services
{
    public class KysBelgeService : IKysBelgeService
    {
        private readonly IKysBelgeRepository _repository;
        // private readonly IHttpContextAccessor _httpContextAccessor; // Kullanıcı ID'sini almak için gerekebilir

        public KysBelgeService(IKysBelgeRepository repository)
        {
            _repository = repository;
        }

        public async Task<KysBelgeDto> GetByFormKoduAsync(int denetlenenId, int yil, string formKodu)
        {
            var belge = await _repository.GetByFormKoduAsync(denetlenenId, yil, formKodu);

            if (belge == null)
            {
                // Belge yoksa varsayılan değerlerle oluştur
                var defaults = KysBelgeDefaults.GetDefaults(formKodu);
                
                belge = new KysBelge
                {
                    DenetlenenId = denetlenenId,
                    Yil = yil,
                    FormKodu = formKodu,
                    Baslik = defaults.Baslik,
                    Icerik = defaults.Icerik,
                    KontrolListesiJson = defaults.ChecklistJson,
                    // DenetciId = ... (Context'ten alınabilir)
                    DenetciId = 1 // Örnek
                };

                await _repository.AddAsync(belge);
            }

            // Manual Mapping: Entity -> DTO
            var dto = new KysBelgeDto
            {
                Id = belge.Id,
                DenetciId = belge.DenetciId,
                DenetlenenId = belge.DenetlenenId,
                Yil = belge.Yil,
                FormKodu = belge.FormKodu,
                Baslik = belge.Baslik,
                Icerik = belge.Icerik,
                Checklist = !string.IsNullOrEmpty(belge.KontrolListesiJson) 
                    ? JsonConvert.DeserializeObject<List<KysChecklistItemDto>>(belge.KontrolListesiJson)
                    : new List<KysChecklistItemDto>()
            };

            return dto;
        }

        public async Task<KysBelgeDto> UpdateAsync(int denetlenenId, int yil, KysBelgeUpdateDto dto)
        {
            var belge = await _repository.GetByIdAsync(dto.Id);
            if (belge == null) throw new Exception("Belge bulunamadı");

            // Update Entity fields
            belge.Icerik = dto.Icerik;
            if (dto.Checklist != null)
            {
                belge.KontrolListesiJson = JsonConvert.SerializeObject(dto.Checklist);
            }
            belge.UpdatedDate = DateTime.Now;

            await _repository.UpdateAsync(belge);

            // Manual Mapping: Entity -> DTO (returning updated state)
            var resultDto = new KysBelgeDto
            {
                Id = belge.Id,
                DenetciId = belge.DenetciId,
                DenetlenenId = belge.DenetlenenId,
                Yil = belge.Yil,
                FormKodu = belge.FormKodu,
                Baslik = belge.Baslik,
                Icerik = belge.Icerik,
                Checklist = dto.Checklist // Or deserialize from belge.KontrolListesiJson
            };
            
            return resultDto;
        }

        public async Task<KysBelgeDto> UpdateChecklistAsync(int id, List<KysChecklistItemDto> checklist)
        {
            var belge = await _repository.GetByIdAsync(id);
            if (belge == null) throw new Exception("Belge bulunamadı");

            belge.KontrolListesiJson = JsonConvert.SerializeObject(checklist);
            belge.UpdatedDate = DateTime.Now;

            await _repository.UpdateAsync(belge);

            // Manual Mapping: Entity -> DTO
            var resultDto = new KysBelgeDto
            {
                Id = belge.Id,
                DenetciId = belge.DenetciId,
                DenetlenenId = belge.DenetlenenId,
                Yil = belge.Yil,
                FormKodu = belge.FormKodu,
                Baslik = belge.Baslik,
                Icerik = belge.Icerik,
                Checklist = checklist
            };
            
            return resultDto;
        }
    }
}
