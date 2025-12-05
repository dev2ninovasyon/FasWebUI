using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using FasWebUI.Models;
using FasWebUI.DTOs;

namespace FasWebUI.Services
{
    /// <summary>
    /// Service interface for Mutabakat Mektup operations
    /// </summary>
    public interface IMutabakatMektupService
    {
        // Mektup CRUD Operations
        Task<MutabakatMektupBelgeDto?> GetMektupByIdAsync(int id);
        Task<MutabakatMektupBelgeDto?> GetMektupByRecordAsync(int denetciId, int denetlenenId, int yil, string detayKodu);
        Task<List<MutabakatMektupBelgeDto>> GetAllMektuplarAsync(int denetciId, int denetlenenId, int yil);
        Task<MutabakatMektupBelge?> GetMektupWithContentAsync(int id);
        Task<MutabakatMektupBelgeDto> UploadMektupAsync(IFormFile file, MutabakatMektupUploadRequest request);
        Task<bool> DeleteMektupAsync(int id, int kullaniciId);
        
        // Token Operations
        Task<GenerateMutabakatLinkResponse> GenerateUploadLinkAsync(GenerateMutabakatLinkRequest request);
        Task<ValidateMutabakatTokenResponse> ValidateTokenAsync(string token);
        Task<MutabakatMektupBelgeDto> UploadViaTokenAsync(string token, IFormFile file);
        Task<List<MutabakatUploadToken>> GetActiveTokensByRecordAsync(int denetciId, int denetlenenId, int yil, string detayKodu);
        Task<bool> MarkTokenAsUsedAsync(string token);
        Task<int> CleanupExpiredTokensAsync();
    }
}
