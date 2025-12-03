using FasBackend.Data;
using FasBackend.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FasBackend.Repositories
{
    public class KysBelgelerRepository
    {
        private readonly ApplicationDbContext _context;

        public KysBelgelerRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<KysBelgeler>> GetByFormKoduAndDenetlenenYilAsync(string formKodu, int denetlenenId, int yil)
        {
            // Fetch standard documents (DenetlenenId is null) AND documents specific to this Denetlenen/Yil
            // Or maybe we copy standard docs to specific ones on first access?
            // For now, let's just fetch what matches.
            // If the user wants to see "seed" data which has null DenetlenenId, we should include those.
            
            return await _context.KysBelgeler
                .Where(x => x.FormKodu == formKodu && (x.DenetlenenId == null || (x.DenetlenenId == denetlenenId))) // Simplified logic, usually we filter by Yil too if it's specific
                .ToListAsync();
        }

        public async Task<KysBelgeler> GetByIdAsync(int id)
        {
            return await _context.KysBelgeler.FindAsync(id);
        }

        public async Task AddAsync(KysBelgeler entity)
        {
            await _context.KysBelgeler.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(KysBelgeler entity)
        {
            _context.KysBelgeler.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var entity = await _context.KysBelgeler.FindAsync(id);
            if (entity != null)
            {
                _context.KysBelgeler.Remove(entity);
                await _context.SaveChangesAsync();
            }
        }
    }
}
