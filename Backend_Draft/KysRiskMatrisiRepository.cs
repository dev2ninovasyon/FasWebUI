using FasBackend.Entities;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FasBackend.Repositories
{
    public class KysRiskMatrisiRepository : IKysRiskMatrisiRepository
    {
        private readonly ApplicationDbContext _context;

        public KysRiskMatrisiRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<KysRiskMatrisi> GetByKategoriKoduAsync(string kategoriKodu, int? denetciId, int? denetlenenId, int? yil)
        {
            // Önce kullanıcıya özel veriyi ara
            if (denetciId.HasValue && denetlenenId.HasValue && yil.HasValue)
            {
                var userSpecific = await _context.KysRiskMatrisleri
                    .FirstOrDefaultAsync(x => x.KategoriKodu == kategoriKodu && 
                                            x.DenetciId == denetciId && 
                                            x.DenetlenenId == denetlenenId && 
                                            x.Yil == yil);
                if (userSpecific != null) return userSpecific;
            }

            // Bulunamazsa standart veriyi döndür
            return await _context.KysRiskMatrisleri
                .FirstOrDefaultAsync(x => x.KategoriKodu == kategoriKodu && x.StandartMi == true);
        }

        public async Task<KysRiskMatrisi> GetByIdAsync(int id)
        {
            return await _context.KysRiskMatrisleri.FindAsync(id);
        }

        public async Task<IEnumerable<KysRiskMatrisi>> GetAllAsync(int? denetciId, int? denetlenenId, int? yil)
        {
            var query = _context.KysRiskMatrisleri.AsQueryable();

            if (denetciId.HasValue && denetlenenId.HasValue && yil.HasValue)
            {
                query = query.Where(x => (x.DenetciId == denetciId && x.DenetlenenId == denetlenenId && x.Yil == yil) ||
                                        x.StandartMi == true);
            }
            else
            {
                query = query.Where(x => x.StandartMi == true);
            }

            return await query.ToListAsync();
        }

        public async Task<KysRiskMatrisi> CreateAsync(KysRiskMatrisi entity)
        {
            _context.KysRiskMatrisleri.Add(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<KysRiskMatrisi> UpdateAsync(KysRiskMatrisi entity)
        {
            entity.UpdatedDate = DateTime.Now;
            _context.KysRiskMatrisleri.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var entity = await _context.KysRiskMatrisleri.FindAsync(id);
            if (entity == null) return false;

            _context.KysRiskMatrisleri.Remove(entity);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
