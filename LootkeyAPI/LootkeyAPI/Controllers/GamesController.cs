using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LootkeyAPI.Data;
using LootkeyAPI.Models;
using LootkeyAPI.DTOs;
using LootkeyAPI.Services;
using Microsoft.AspNetCore.Authorization;

namespace LootkeyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GamesController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public GamesController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Game>>> GetGames()
        {
            return await _context.Games
                .Include(g => g.Category)
                .ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Game>> GetGame(int id)
        {
            var game = await _context.Games
                .Include(g => g.Category)
                .FirstOrDefaultAsync(g => g.Id == id);

            if (game == null)
                return NotFound();

            return game;
        }

        [HttpGet("search")]
        public async Task<ActionResult<IEnumerable<Game>>> Search(
            [FromQuery] string? query,
            [FromQuery] decimal? minPrice,
            [FromQuery] decimal? maxPrice,
            [FromQuery] string? genre,
            [FromQuery] int? year
        )
        {
            var games = _context.Games
                .Include(g => g.Category)
                .AsQueryable();

            if (!string.IsNullOrEmpty(query))
                games = games.Where(g => g.Title.Contains(query));

            if (minPrice.HasValue)
                games = games.Where(g => (g.DiscountPrice ?? g.Price) >= minPrice);

            if (maxPrice.HasValue)
                games = games.Where(g => (g.DiscountPrice ?? g.Price) <= maxPrice);

            if (!string.IsNullOrEmpty(genre))
                games = games.Where(g => g.Category.Name == genre);

            if (year.HasValue)
                games = games.Where(g => g.Year == year);

            return await games.ToListAsync();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Game>> CreateGame(Game game)
        {
            if (!string.IsNullOrEmpty(game.Genre))
            {
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Name == game.Genre);

                if (category == null)
                {
                    category = new Category
                    {
                        Name = game.Genre
                    };

                    _context.Categories.Add(category);
                    await _context.SaveChangesAsync();
                }

                game.CategoryId = category.Id;
            }

            _context.Games.Add(game);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetGame), new { id = game.Id }, game);
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateGame(int id, Game updatedGame)
        {
            var game = await _context.Games.FindAsync(id);

            if (game == null)
                return NotFound();

            if (!string.IsNullOrEmpty(updatedGame.Genre))
            {
                var category = await _context.Categories
                    .FirstOrDefaultAsync(c => c.Name == updatedGame.Genre);

                if (category == null)
                {
                    category = new Category
                    {
                        Name = updatedGame.Genre
                    };

                    _context.Categories.Add(category);
                    await _context.SaveChangesAsync();
                }

                game.CategoryId = category.Id;
            }

            game.Title = updatedGame.Title;
            game.Price = updatedGame.Price;
            game.DiscountPrice = updatedGame.DiscountPrice;
            game.ImageUrl = updatedGame.ImageUrl;
            game.Description = updatedGame.Description;
            game.MinRequirements = updatedGame.MinRequirements;
            game.RecRequirements = updatedGame.RecRequirements;
            game.Year = updatedGame.Year;
            game.SteamUrl = updatedGame.SteamUrl;
            game.EpicUrl = updatedGame.EpicUrl;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("{id}/discount")]
        public async Task<IActionResult> SetDiscount(int id, DiscountDto dto)
        {
            var game = await _context.Games.FindAsync(id);

            if (game == null)
                return NotFound();

            if (dto.DiscountPrice <= 0)
                return BadRequest("Discount price must be greater than 0.");

            if (dto.DiscountPrice >= game.Price)
                return BadRequest("Discount price must be lower than original price.");

            game.DiscountPrice = dto.DiscountPrice;

            await _context.SaveChangesAsync();

            var users = await _context.Users.ToListAsync();

            foreach (var user in users)
            {
                var html = $@"
                    <div style='font-family: Arial, sans-serif;'>
                        <h2>New discount on LootKey!</h2>
                        <p>Game: <b>{game.Title}</b></p>
                        <p>Old price: <s>€{game.Price:F2}</s></p>
                        <p>New price: <b style='color: red;'>€{game.DiscountPrice:F2}</b></p>
                        <p>Visit LootKey to buy this game at a special price.</p>
                    </div>";

                await _emailService.SendEmailAsync(
                    user.Email,
                    $"LootKey discount: {game.Title}",
                    html
                );
            }

            return Ok(new { message = "Discount added and emails sent." });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}/discount")]
        public async Task<IActionResult> RemoveDiscount(int id)
        {
            var game = await _context.Games.FindAsync(id);

            if (game == null)
                return NotFound();

            game.DiscountPrice = null;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Discount removed." });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteGame(int id)
        {
            var game = await _context.Games.FindAsync(id);

            if (game == null)
                return NotFound();

            _context.Games.Remove(game);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize]
        [HttpPost("buy/{id}")]
        public IActionResult BuyGame(int id)
        {
            return Ok($"Game {id} purchased");
        }
    }
}