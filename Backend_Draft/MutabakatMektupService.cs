using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using FasWebUI.Models;
using FasWebUI.DTOs;
using FasWebUI.Repositories;

namespace FasWebUI.Services
{
    /// <summary>
    /// Service implementation for Mutabakat Mektup operations
    /// </summary>
    public class MutabakatMektupService : IMutabakatMektupService
    {
        private readonly IMutabakatMektupRepository _mektupRepository;
        private readonly IMutabakatUploadTokenRepository _tokenRepository;
        private readonly string _baseUrl; // Configuration'dan alınacak

        public MutabakatMektupService(
            IMutabakatMektupRepository mektupRepository,
            IMutabakatUploadTokenRepository tokenRepository,
            string baseUrl = "https://betaverigirisi.fasmart.app")
        {
            _mektupRepository = mektupRepository;
            _tokenRepository = tokenRepository;
            _baseUrl = baseUrl;
        }

        #region Mektup Operations

        public async Task<MutabakatMektupBelgeDto?> GetMektupByIdAsync(int id)
        {
            var belge = await _mektupRepository.GetByIdAsync(id);
            return belge == null ? null : MapToDto(belge);
        }

        public async Task<MutabakatMektupBelgeDto?> GetMektupByRecordAsync(int denetciId, int denetlenenId, int yil, string detayKodu)
        {
            var belge = await _mektupRepository.GetByRecordAsync(denetciId, denetlenenId, yil, detayKodu);
            return belge == null ? null : MapToDto(belge);
        }

        public async Task<List<MutabakatMektupBelgeDto>> GetAllMektuplarAsync(int denetciId, int denetlenenId, int yil)
        {
            var belgeler = await _mektupRepository.GetAllByDenetciAsync(denetciId, denetlenenId, yil);
            return belgeler.Select(MapToDto).ToList();
        }

        public async Task<MutabakatMektupBelge?> GetMektupWithContentAsync(int id)
        {
            return await _mektupRepository.GetByIdAsync(id);
        }

        public async Task<MutabakatMektupBelgeDto> UploadMektupAsync(IFormFile file, MutabakatMektupUploadRequest request)
        {
            // Dosya validation
            ValidateFile(file);

            // Mevcut mektup var mı kontrol et
            var existing = await _mektupRepository.GetByRecordAsync(
                request.DenetciId,
                request.DenetlenenId,
                request.Yil,
                request.DetayKodu);

            MutabakatMektupBelge belge;

            if (existing != null)
            {
                // Güncelleme
                existing.OrijinalDosyaAdi = file.FileName;
                existing.ContentType = file.ContentType;
                existing.DosyaBoyutu = file.Length;
                existing.DosyaIcerigi = await ReadFileBytes(file);
                existing.GuncellenmeTarihi = DateTime.Now;
                existing.Aciklama = request.Aciklama;

                belge = await _mektupRepository.UpdateAsync(existing);
            }
            else
            {
                // Yeni ekleme
                belge = new MutabakatMektupBelge
                {
                    DenetciId = request.DenetciId,
                    DenetlenenId = request.DenetlenenId,
                    Yil = request.Yil,
                    DetayKodu = request.DetayKodu,
                    DosyaAdi = GenerateFileName(file.FileName),
                    OrijinalDosyaAdi = file.FileName,
                    ContentType = file.ContentType,
                    DosyaBoyutu = file.Length,
                    DosyaIcerigi = await ReadFileBytes(file),
                    YukleyenKullaniciId = request.KullaniciId,
                    Aciklama = request.Aciklama
                };

                belge = await _mektupRepository.AddAsync(belge);
            }

            return MapToDto(belge);
        }

        public async Task<bool> DeleteMektupAsync(int id, int kullaniciId)
        {
            var belge = await _mektupRepository.GetByIdAsync(id);
            if (belge == null)
                return false;

            // Yetki kontrolü yapılabilir (örn: sadece yükleyen veya admin silebilir)
            
            return await _mektupRepository.DeleteAsync(id);
        }

        #endregion

        #region Token Operations

        public async Task<GenerateMutabakatLinkResponse> GenerateUploadLinkAsync(GenerateMutabakatLinkRequest request)
        {
            // Yeni GUID token oluştur
            var token = Guid.NewGuid().ToString("N"); // 32 karakter, tire yok

            var uploadToken = new MutabakatUploadToken
            {
                Token = token,
                DenetciId = request.DenetciId,
                DenetlenenId = request.DenetlenenId,
                Yil = request.Yil,
                DetayKodu = request.DetayKodu,
                OlusturanKullaniciId = request.KullaniciId,
                SonKullanmaTarihi = DateTime.Now.AddDays(request.GecerlilikGunSayisi),
                AliciAdi = request.AliciAdi,
                HesapAdi = request.HesapAdi,
                Aciklama = request.Aciklama
            };

            uploadToken = await _tokenRepository.AddAsync(uploadToken);

            var uploadUrl = $"{_baseUrl}/mutabakat-upload/{token}";

            return new GenerateMutabakatLinkResponse
            {
                Token = token,
                UploadUrl = uploadUrl,
                OlusturmaTarihi = uploadToken.OlusturmaTarihi,
                SonKullanmaTarihi = uploadToken.SonKullanmaTarihi
            };
        }

        public async Task<ValidateMutabakatTokenResponse> ValidateTokenAsync(string token)
        {
            var uploadToken = await _tokenRepository.GetByTokenAsync(token);

            if (uploadToken == null)
            {
                return new ValidateMutabakatTokenResponse
                {
                    IsValid = false,
                    Message = "Geçersiz token. Token bulunamadı."
                };
            }

            var now = DateTime.Now;

            if (uploadToken.SonKullanmaTarihi < now)
            {
                return new ValidateMutabakatTokenResponse
                {
                    IsValid = false,
                    Message = "Token süresi dolmuş. Lütfen yeni bir link talep edin."
                };
            }

            // Mektup yüklenmiş mi kontrol et
            var mektupVar = await _mektupRepository.ExistsAsync(
                uploadToken.DenetciId,
                uploadToken.DenetlenenId,
                uploadToken.Yil,
                uploadToken.DetayKodu);

            return new ValidateMutabakatTokenResponse
            {
                IsValid = true,
                Message = "Token geçerli",
                DenetciId = uploadToken.DenetciId,
                DenetlenenId = uploadToken.DenetlenenId,
                Yil = uploadToken.Yil,
                DetayKodu = uploadToken.DetayKodu,
                SonKullanmaTarihi = uploadToken.SonKullanmaTarihi,
                AliciAdi = uploadToken.AliciAdi,
                HesapAdi = uploadToken.HesapAdi,
                MektupYuklendi = mektupVar
            };
        }

        public async Task<MutabakatMektupBelgeDto> UploadViaTokenAsync(string token, IFormFile file)
        {
            // Token validate et
            var validation = await ValidateTokenAsync(token);
            if (!validation.IsValid)
            {
                throw new InvalidOperationException(validation.Message);
            }

            // Token bilgilerini kullanarak mektubu yükle
            var request = new MutabakatMektupUploadRequest
            {
                DenetciId = validation.DenetciId!.Value,
                DenetlenenId = validation.DenetlenenId!.Value,
                Yil = validation.Yil!.Value,
                DetayKodu = validation.DetayKodu!,
                KullaniciId = 0, // Harici kullanıcı, kullanıcı ID yok
                Aciklama = $"Token üzerinden yüklendi: {token.Substring(0, 8)}..."
            };

            var result = await UploadMektupAsync(file, request);

            // Token'ı kullanıldı olarak işaretle
            await MarkTokenAsUsedAsync(token);

            return result;
        }

        public async Task<List<MutabakatUploadToken>> GetActiveTokensByRecordAsync(int denetciId, int denetlenenId, int yil, string detayKodu)
        {
            return await _tokenRepository.GetActiveTokensByRecordAsync(denetciId, denetlenenId, yil, detayKodu);
        }

        public async Task<bool> MarkTokenAsUsedAsync(string token)
        {
            var uploadToken = await _tokenRepository.GetByTokenAsync(token);
            if (uploadToken == null)
                return false;

            uploadToken.Kullanildi = true;
            uploadToken.KullanilmaTarihi = DateTime.Now;
            await _tokenRepository.UpdateAsync(uploadToken);
            return true;
        }

        public async Task<int> CleanupExpiredTokensAsync()
        {
            return await _tokenRepository.DeleteExpiredTokensAsync();
        }

        #endregion

        #region Helper Methods

        private void ValidateFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                throw new ArgumentException("Dosya boş olamaz.");
            }

            // Dosya boyutu kontrolü (max 10MB)
            const long maxSize = 10 * 1024 * 1024;
            if (file.Length > maxSize)
            {
                throw new ArgumentException($"Dosya boyutu çok büyük. Maksimum {maxSize / 1024 / 1024}MB olmalıdır.");
            }

            // İzin verilen dosya tipleri
            var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".png", ".jpg", ".jpeg" };
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

            if (!allowedExtensions.Contains(extension))
            {
                throw new ArgumentException($"Desteklenmeyen dosya tipi. İzin verilen tipler: {string.Join(", ", allowedExtensions)}");
            }

            // MIME type kontrolü
            var allowedMimeTypes = new[]
            {
                "application/pdf",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "image/png",
                "image/jpeg"
            };

            if (!allowedMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
            {
                throw new ArgumentException("Geçersiz dosya tipi.");
            }
        }

        private async Task<byte[]> ReadFileBytes(IFormFile file)
        {
            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            return memoryStream.ToArray();
        }

        private string GenerateFileName(string originalFileName)
        {
            var extension = Path.GetExtension(originalFileName);
            return $"mutabakat_mektup_{Guid.NewGuid():N}{extension}";
        }

        private MutabakatMektupBelgeDto MapToDto(MutabakatMektupBelge belge)
        {
            return new MutabakatMektupBelgeDto
            {
                Id = belge.Id,
                DenetciId = belge.DenetciId,
                DenetlenenId = belge.DenetlenenId,
                Yil = belge.Yil,
                DetayKodu = belge.DetayKodu,
                OrijinalDosyaAdi = belge.OrijinalDosyaAdi,
                ContentType = belge.ContentType,
                DosyaBoyutu = belge.DosyaBoyutu,
                YuklemeTarihi = belge.YuklemeTarihi,
                YukleyenKullaniciId = belge.YukleyenKullaniciId,
                GuncellenmeTarihi = belge.GuncellenmeTarihi,
                Aciklama = belge.Aciklama
            };
        }

        #endregion
    }
}
