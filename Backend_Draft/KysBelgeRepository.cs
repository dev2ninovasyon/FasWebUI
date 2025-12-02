using FasBackend.Data;
using FasBackend.Entities;
using Microsoft.EntityFrameworkCore;
using System.Threading.Tasks;

namespace FasBackend.Repositories
{
    public class KysBelgeRepository : IKysBelgeRepository
    {
        private readonly DataContext _context;

        public KysBelgeRepository(DataContext context)
        {
            _context = context;
        }

        public async Task<KysBelge> GetByFormKoduAsync(int denetlenenId, int yil, string formKodu)
        {
            return await _context.KysBelgeler
                .FirstOrDefaultAsync(x => x.DenetlenenId == denetlenenId && x.Yil == yil && x.FormKodu == formKodu);
        }

        public async Task<KysBelge> GetByIdAsync(int id)
        {
            return await _context.KysBelgeler.FindAsync(id);
        }

        public async Task AddAsync(KysBelge kysBelge)
        {
            await _context.KysBelgeler.AddAsync(kysBelge);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(KysBelge kysBelge)
        {
            _context.KysBelgeler.Update(kysBelge);
            await _context.SaveChangesAsync();
        }
    }
}
