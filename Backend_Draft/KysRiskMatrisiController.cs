using FasBackend.Entities;
using FasBackend.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;

namespace FasBackend.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class KysRiskMatrisiController : ControllerBase
    {
        private readonly IKysRiskMatrisiRepository _repository;

        public KysRiskMatrisiController(IKysRiskMatrisiRepository repository)
        {
            _repository = repository;
        }

        private int? GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }

        [HttpGet("{kategoriKodu}")]
        public async Task<ActionResult<KysRiskMatrisi>> GetByKategoriKodu(
            string kategoriKodu,
            [FromQuery] int? denetciId,
            [FromQuery] int? denetlenenId,
            [FromQuery] int? yil)
        {
            try
            {
                var result = await _repository.GetByKategoriKoduAsync(kategoriKodu, denetciId, denetlenenId, yil);
                if (result == null)
                    return NotFound();

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Veri alınırken hata oluştu", error = ex.Message });
            }
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<KysRiskMatrisi>>> GetAll(
            [FromQuery] int? denetciId,
            [FromQuery] int? denetlenenId,
            [FromQuery] int? yil)
        {
            try
            {
                var result = await _repository.GetAllAsync(denetciId, denetlenenId, yil);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Veri alınırken hata oluştu", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<ActionResult<KysRiskMatrisi>> Create([FromBody] KysRiskMatrisi entity)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _repository.CreateAsync(entity);
                return CreatedAtAction(nameof(GetByKategoriKodu), new { kategoriKodu = result.KategoriKodu }, result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Veri oluşturulurken hata oluştu", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<KysRiskMatrisi>> Update(int id, [FromBody] KysRiskMatrisi entity)
        {
            try
            {
                if (id != entity.Id)
                    return BadRequest("ID uyuşmuyor");

                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var result = await _repository.UpdateAsync(entity);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Veri güncellenirken hata oluştu", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                var success = await _repository.DeleteAsync(id);
                if (!success)
                    return NotFound();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Veri silinirken hata oluştu", error = ex.Message });
            }
        }
    }
}
