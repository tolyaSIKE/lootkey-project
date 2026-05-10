using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LootkeyAPI.Data;
using LootkeyAPI.Models;

namespace LootkeyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public RecommendationsController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpPost("view/{gameId}")]
        public async Task<IActionResult> SaveView(int gameId)
        {
            var email = User.Identity?.Name;

            if (email == null)
                return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return Unauthorized();

            var gameExists = await _context.Games.AnyAsync(g => g.Id == gameId);

            if (!gameExists)
                return NotFound("Game not found.");

            var view = new UserGameView
            {
                UserId = user.Id,
                GameId = gameId,
                ViewedAt = DateTime.Now
            };

            _context.UserGameViews.Add(view);
            await _context.SaveChangesAsync();

            return Ok();
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetRecommendations()
        {
            var email = User.Identity?.Name;

            if (email == null)
                return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return Unauthorized();

            var lastViewedGame = await _context.UserGameViews
                .Where(v => v.UserId == user.Id)
                .Include(v => v.Game)
                .ThenInclude(g => g.Category)
                .OrderByDescending(v => v.ViewedAt)
                .Select(v => v.Game)
                .FirstOrDefaultAsync();

            if (lastViewedGame == null)
            {
                var defaultGames = await _context.Games
                    .Include(g => g.Category)
                    .OrderBy(g => g.Id)
                    .Take(5)
                    .ToListAsync();

                return Ok(defaultGames);
            }

            var recommendedGames = await _context.Games
                .Include(g => g.Category)
                .Where(g =>
                    g.Id == lastViewedGame.Id ||
                    g.CategoryId == lastViewedGame.CategoryId
                )
                .OrderByDescending(g => g.Id == lastViewedGame.Id)
                .ThenBy(g => g.Title)
                .Take(6)
                .ToListAsync();

            if (recommendedGames.Count < 4)
            {
                var additionalGames = await _context.Games
                    .Include(g => g.Category)
                    .Where(g => !recommendedGames.Select(r => r.Id).Contains(g.Id))
                    .Take(6 - recommendedGames.Count)
                    .ToListAsync();

                recommendedGames.AddRange(additionalGames);
            }

            return Ok(recommendedGames);
        }
    }
}