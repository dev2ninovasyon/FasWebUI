using FasBackend.Dtos;
using FasBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FasBackend.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class KysBelgelerController : ControllerBase
    {
        private readonly KysBelgelerService _service;

        public KysBelgelerController(KysBelgelerService service)
        {
            _service = service;
        }

        [HttpGet("GetByFormKodu")]
        public async Task<ActionResult<List<KysBelgelerDto>>> GetByFormKodu(string formKodu, int denetlenenId, int yil)
        {
            var result = await _service.GetListAsync(formKodu, denetlenenId, yil);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateKysBelgeDto dto)
        {
            await _service.CreateAsync(dto);
            return Ok(true);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateKysBelgeDto dto)
        {
            await _service.UpdateAsync(id, dto);
            return Ok(true);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return Ok(true);
        }
    }
}
