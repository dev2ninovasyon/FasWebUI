using FasWebApi.Dto;
using FasWebApi.Model;
using FasWebApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FasWebApi.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class KysBelgeController : ControllerBase
    {
        private readonly IKysBelgeService _service;

        public KysBelgeController(IKysBelgeService service)
        {
            _service = service;
        }

        [HttpGet("GetByFormKoduAsync")]
        public async Task<IActionResult> GetByFormKoduAsync(string formKodu, int denetlenenId, int yil)
        {
            var result = await _service.GetByFormKoduAsync(denetlenenId, yil, formKodu);
            return Ok(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(
          int id,
          [FromQuery] int denetlenenId,
          [FromQuery] int yil,
          [FromBody] KysBelgeUpdateDto dto)
        {
            if (id != dto.Id) return BadRequest();
            var result = await _service.UpdateAsync(denetlenenId, yil, dto);
            return Ok(result);
        }
        [HttpPut("{id}/checklist")]
        public async Task<IActionResult> UpdateChecklist(int id, [FromBody] List<KysChecklistItemDto> checklist)
        {
            var result = await _service.UpdateChecklistAsync(id, checklist);
            return Ok(result);
        }
    }
}
