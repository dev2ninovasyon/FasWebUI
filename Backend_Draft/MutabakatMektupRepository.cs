using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using FasWebUI.Models;
using FasWebUI.Data;

namespace FasWebUI.Repositories
{
    /// <summary>
    /// Repository implementation for MutabakatMektupBelge operations
    /// </summary>
    public class MutabakatMektupRepository : IMutabakatMektupRepository
    {
        private readonly ApplicationDbContext _context;

        public MutabakatMektupRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<MutabakatMektupBelge?> GetByIdAsync(int id)
        {
            return await _context.MutabakatMektupBelge
                .FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<MutabakatMektupBelge?> GetByRecordAsync(int denetciId, int denetlenenId, int yil, string detayKodu)
        {
            return await _context.MutabakatMektupBelge
                .FirstOrDefaultAsync(m =>
                    m.DenetciId == denetciId &&
                    m.DenetlenenId == denetlenenId &&
                    m.Yil == yil &&
                    m.DetayKodu == detayKodu);
        }

        public async Task<List<MutabakatMektupBelge>> GetAllByDenetciAsync(int denetciId, int denetlenenId, int yil)
        {
            return await _context.MutabakatMektupBelge
                .Where(m =>
                    m.DenetciId == denetciId &&
                    m.DenetlenenId == denetlenenId &&
                    m.Yil == yil)
                .OrderByDescending(m => m.YuklemeTarihi)
                .ToListAsync();
        }

        public async Task<MutabakatMektupBelge> AddAsync(MutabakatMektupBelge belge)
        {
            belge.YuklemeTarihi = DateTime.Now;
            _context.MutabakatMektupBelge.Add(belge);
            await _context.SaveChangesAsync();
            return belge;
        }

        public async Task<MutabakatMektupBelge> UpdateAsync(MutabakatMektupBelge belge)
        {
            belge.GuncellenmeTarihi = DateTime.Now;
            _context.MutabakatMektupBelge.Update(belge);
            await _context.SaveChangesAsync();
            return belge;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var belge = await GetByIdAsync(id);
            if (belge == null)
                return false;

            _context.MutabakatMektupBelge.Remove(belge);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ExistsAsync(int denetciId, int denetlenenId, int yil, string detayKodu)
        {
            return await _context.MutabakatMektupBelge
                .AnyAsync(m =>
                    m.DenetciId == denetciId &&
                    m.DenetlenenId == denetlenenId &&
                    m.Yil == yil &&
                    m.DetayKodu == detayKodu);
        }
    }
}
