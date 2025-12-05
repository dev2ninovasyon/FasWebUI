using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using FasWebUI.Services;
using FasWebUI.DTOs;

namespace FasWebUI.Controllers
{
    /// <summary>
    /// Mutabakat mektup yükleme ve link yönetimi için API controller
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class MutabakatMektupController : ControllerBase
    {
        private readonly IMutabakatMektupService _mektupService;

        public MutabakatMektupController(IMutabakatMektupService mektupService)
        {
            _mektupService = mektupService;
        }

        /// <summary>
        /// Mektup yükle
        /// </summary>
        [HttpPost("Upload")]
        [ProducesResponseType(typeof(MutabakatMektupBelgeDto), 200)]
        [ProducesResponseType(400)]
        [ProducesResponseType(500)]
        public async Task<IActionResult> UploadMektup(
            [FromForm] IFormFile file,
            [FromForm] int denetciId,
            [FromForm] int denetlenenId,
            [FromForm] int yil,
            [FromForm] string detayKodu,
            [FromForm] int kullaniciId,
            [FromForm] string? aciklama = null)
        {
            try
            {
                var request = new MutabakatMektupUploadRequest
                {
                    DenetciId = denetciId,
                    DenetlenenId = denetlenenId,
                    Yil = yil,
                    DetayKodu = detayKodu,
                    KullaniciId = kullaniciId,
                    Aciklama = aciklama
                };

                var result = await _mektupService.UploadMektupAsync(file, request);
                return Ok(result);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Dosya yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Mektup bilgisini getir (dosya içeriği hariç)
        /// </summary>
        [HttpGet("Get")]
        [ProducesResponseType(typeof(MutabakatMektupBelgeDto), 200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> GetMektup(
            [FromQuery] int denetciId,
            [FromQuery] int denetlenenId,
            [FromQuery] int yil,
            [FromQuery] string detayKodu)
        {
            var mektup = await _mektupService.GetMektupByRecordAsync(denetciId, denetlenenId, yil, detayKodu);
            
            if (mektup == null)
                return NotFound(new { message = "Mektup bulunamadı." });

            return Ok(mektup);
        }

        /// <summary>
        /// Tüm mektupları listele
        /// </summary>
        [HttpGet("List")]
        [ProducesResponseType(typeof(List<MutabakatMektupBelgeDto>), 200)]
        public async Task<IActionResult> GetAllMektuplar(
            [FromQuery] int denetciId,
            [FromQuery] int denetlenenId,
            [FromQuery] int yil)
        {
            var mektuplar = await _mektupService.GetAllMektuplarAsync(denetciId, denetlenenId, yil);
            return Ok(mektuplar);
        }

        /// <summary>
        /// Mektubu indir
        /// </summary>
        [HttpGet("Download/{id}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DownloadMektup(int id)
        {
            var mektup = await _mektupService.GetMektupWithContentAsync(id);
            
            if (mektup == null)
                return NotFound(new { message = "Mektup bulunamadı." });

            return File(mektup.DosyaIcerigi, mektup.ContentType, mektup.OrijinalDosyaAdi);
        }

        /// <summary>
        /// Mektubu sil
        /// </summary>
        [HttpDelete("Delete/{id}")]
        [ProducesResponseType(200)]
        [ProducesResponseType(404)]
        public async Task<IActionResult> DeleteMektup(int id, [FromQuery] int kullaniciId)
        {
            var result = await _mektupService.DeleteMektupAsync(id, kullaniciId);
            
            if (!result)
                return NotFound(new { message = "Mektup bulunamadı." });

            return Ok(new { message = "Mektup başarıyla silindi." });
        }

        /// <summary>
        /// Dış kullanıcılar için yükleme linki oluştur
        /// </summary>
        [HttpPost("GenerateLink")]
        [ProducesResponseType(typeof(GenerateMutabakatLinkResponse), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> GenerateUploadLink([FromBody] GenerateMutabakatLinkRequest request)
        {
            try
            {
                var response = await _mektupService.GenerateUploadLinkAsync(request);
                return Ok(response);
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = "Link oluşturulamadı.", error = ex.Message });
            }
        }

        /// <summary>
        /// Token'ı doğrula (dış uygulama tarafından kullanılır)
        /// </summary>
        [HttpPost("ValidateToken")]
        [AllowAnonymous] // Dış uygulama için authentication gerekmez
        [ProducesResponseType(typeof(ValidateMutabakatTokenResponse), 200)]
        public async Task<IActionResult> ValidateToken([FromBody] ValidateMutabakatTokenRequest request)
        {
            var response = await _mektupService.ValidateTokenAsync(request.Token);
            return Ok(response);
        }

        /// <summary>
        /// Token ile mektup yükle (dış uygulama tarafından kullanılır)
        /// </summary>
        [HttpPost("UploadViaToken")]
        [AllowAnonymous] // Dış uygulama için authentication gerekmez
        [ProducesResponseType(typeof(MutabakatMektupBelgeDto), 200)]
        [ProducesResponseType(400)]
        public async Task<IActionResult> UploadViaToken(
            [FromForm] string token,
            [FromForm] IFormFile file)
        {
            try
            {
                var result = await _mektupService.UploadViaTokenAsync(token, file);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Dosya yüklenirken bir hata oluştu.", error = ex.Message });
            }
        }

        /// <summary>
        /// Belirli bir kayıt için aktif tokenları getir
        /// </summary>
        [HttpGet("GetActiveTokens")]
        [ProducesResponseType(typeof(List<MutabakatUploadToken>), 200)]
        public async Task<IActionResult> GetActiveTokens(
            [FromQuery] int denetciId,
            [FromQuery] int denetlenenId,
            [FromQuery] int yil,
            [FromQuery] string detayKodu)
        {
            var tokens = await _mektupService.GetActiveTokensByRecordAsync(denetciId, denetlenenId, yil, detayKodu);
            return Ok(tokens);
        }

        /// <summary>
        /// Süresi dolmuş tokenları temizle (bakım işlemi)
        /// </summary>
        [HttpPost("CleanupExpiredTokens")]
        [ProducesResponseType(typeof(int), 200)]
        public async Task<IActionResult> CleanupExpiredTokens()
        {
            var deletedCount = await _mektupService.CleanupExpiredTokensAsync();
            return Ok(new { message = $"{deletedCount} adet süresi dolmuş token silindi.", count = deletedCount });
        }
    }
}
