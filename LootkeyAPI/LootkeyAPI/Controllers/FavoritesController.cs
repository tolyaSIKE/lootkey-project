using LootkeyAPI.Data;
using LootkeyAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LootkeyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FavoritesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FavoritesController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpPost("{gameId}")]
        public async Task<IActionResult> Toggle(int gameId)
        {
            var email = User.Identity?.Name;

            if (email == null)
                return Unauthorized();

            var user = await _context.Users.FirstAsync(u => u.Email == email);

            var existing = await _context.Favorites
                .FirstOrDefaultAsync(f => f.UserId == user.Id && f.GameId == gameId);

            if (existing != null)
            {
                _context.Favorites.Remove(existing);
                await _context.SaveChangesAsync();

                return Ok(new { status = "removed", message = "Game removed from favourites" });
            }

            _context.Favorites.Add(new Favorite
            {
                UserId = user.Id,
                GameId = gameId
            });

            await _context.SaveChangesAsync();

            return Ok(new { status = "added", message = "Game added to favourites" });
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetFavorites()
        {
            var email = User.Identity?.Name;

            if (email == null)
                return Unauthorized();

            var user = await _context.Users.FirstAsync(u => u.Email == email);

            var favorites = await _context.Favorites
                .Where(f => f.UserId == user.Id)
                .Include(f => f.Game)
                .Select(f => f.Game)
                .ToListAsync();

            return Ok(favorites);
        }

        [Authorize]
        [HttpGet("ids")]
        public async Task<IActionResult> GetFavoriteIds()
        {
            var email = User.Identity?.Name;

            if (email == null)
                return Unauthorized();

            var user = await _context.Users.FirstAsync(u => u.Email == email);

            var ids = await _context.Favorites
                .Where(f => f.UserId == user.Id)
                .Select(f => f.GameId)
                .ToListAsync();

            return Ok(ids);
        }
    }
}