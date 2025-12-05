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
    /// Repository implementation for MutabakatUploadToken operations
    /// </summary>
    public class MutabakatUploadTokenRepository : IMutabakatUploadTokenRepository
    {
        private readonly ApplicationDbContext _context;

        public MutabakatUploadTokenRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<MutabakatUploadToken?> GetByIdAsync(int id)
        {
            return await _context.MutabakatUploadToken
                .FirstOrDefaultAsync(t => t.Id == id);
        }

        public async Task<MutabakatUploadToken?> GetByTokenAsync(string token)
        {
            return await _context.MutabakatUploadToken
                .FirstOrDefaultAsync(t => t.Token == token);
        }

        public async Task<List<MutabakatUploadToken>> GetActiveTokensByRecordAsync(int denetciId, int denetlenenId, int yil, string detayKodu)
        {
            var now = DateTime.Now;
            return await _context.MutabakatUploadToken
                .Where(t =>
                    t.DenetciId == denetciId &&
                    t.DenetlenenId == denetlenenId &&
                    t.Yil == yil &&
                    t.DetayKodu == detayKodu &&
                    t.SonKullanmaTarihi > now)
                .OrderByDescending(t => t.OlusturmaTarihi)
                .ToListAsync();
        }

        public async Task<List<MutabakatUploadToken>> GetAllByDenetciAsync(int denetciId, int denetlenenId, int yil)
        {
            return await _context.MutabakatUploadToken
                .Where(t =>
                    t.DenetciId == denetciId &&
                    t.DenetlenenId == denetlenenId &&
                    t.Yil == yil)
                .OrderByDescending(t => t.OlusturmaTarihi)
                .ToListAsync();
        }

        public async Task<MutabakatUploadToken> AddAsync(MutabakatUploadToken token)
        {
            token.OlusturmaTarihi = DateTime.Now;
            token.Kullanildi = false;
            _context.MutabakatUploadToken.Add(token);
            await _context.SaveChangesAsync();
            return token;
        }

        public async Task<MutabakatUploadToken> UpdateAsync(MutabakatUploadToken token)
        {
            _context.MutabakatUploadToken.Update(token);
            await _context.SaveChangesAsync();
            return token;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var token = await GetByIdAsync(id);
            if (token == null)
                return false;

            _context.MutabakatUploadToken.Remove(token);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> DeleteExpiredTokensAsync()
        {
            var now = DateTime.Now;
            var expiredTokens = await _context.MutabakatUploadToken
                .Where(t => t.SonKullanmaTarihi < now)
                .ToListAsync();

            _context.MutabakatUploadToken.RemoveRange(expiredTokens);
            await _context.SaveChangesAsync();
            return expiredTokens.Count;
        }

        public async Task<bool> IsTokenValidAsync(string token)
        {
            var now = DateTime.Now;
            return await _context.MutabakatUploadToken
                .AnyAsync(t =>
                    t.Token == token &&
                    t.SonKullanmaTarihi > now);
        }
    }
}
