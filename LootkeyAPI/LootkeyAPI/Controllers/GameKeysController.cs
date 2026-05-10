using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LootkeyAPI.Data;
using LootkeyAPI.DTOs;
using LootkeyAPI.Models;

namespace LootkeyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GameKeysController : ControllerBase
    {
        private readonly AppDbContext _context;

        public GameKeysController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllKeys()
        {
            var keys = await _context.GameKeys
                .Include(k => k.Game)
                .OrderBy(k => k.Game.Title)
                .ThenBy(k => k.Id)
                .Select(k => new
                {
                    id = k.Id,
                    gameId = k.GameId,
                    gameTitle = k.Game.Title,
                    keyName = k.KeyName,
                    keyCode = k.KeyCode,
                    isSold = k.IsSold,
                    soldAt = k.SoldAt
                })
                .ToListAsync();

            return Ok(keys);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> CreateKey(CreateGameKeyDto dto)
        {
            var gameExists = await _context.Games.AnyAsync(g => g.Id == dto.GameId);

            if (!gameExists)
                return BadRequest("Game not found.");

            if (string.IsNullOrWhiteSpace(dto.KeyName))
                return BadRequest("Key name is required.");

            if (string.IsNullOrWhiteSpace(dto.KeyCode))
                return BadRequest("Key code is required.");

            var keyExists = await _context.GameKeys.AnyAsync(k => k.KeyCode == dto.KeyCode);

            if (keyExists)
                return BadRequest("This key code already exists.");

            var gameKey = new GameKey
            {
                GameId = dto.GameId,
                KeyName = dto.KeyName,
                KeyCode = dto.KeyCode,
                IsSold = false
            };

            _context.GameKeys.Add(gameKey);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Game key added successfully." });
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteKey(int id)
        {
            var key = await _context.GameKeys.FirstOrDefaultAsync(k => k.Id == id);

            if (key == null)
                return NotFound("Key not found.");

            if (key.IsSold)
                return BadRequest("Sold key cannot be deleted.");

            _context.GameKeys.Remove(key);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}