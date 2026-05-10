using LootkeyAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LootkeyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetMe()
        {
            var email = User.Identity?.Name;

            if (email == null)
                return Unauthorized();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            return Ok(user);
        }

        [Authorize]
        [HttpPut("username")]
        public async Task<IActionResult> UpdateUsername([FromBody] string username)
        {
            var email = User.Identity?.Name;

            if (email == null)
                return Unauthorized();

            var user = await _context.Users.FirstAsync(u => u.Email == email);

            user.Username = username;

            await _context.SaveChangesAsync();

            return Ok();
        }

        [Authorize]
        [HttpPut("avatar")]
        public async Task<IActionResult> UpdateAvatar([FromBody] string avatarUrl)
        {
            var email = User.Identity?.Name;

            if (email == null)
                return Unauthorized();

            var user = await _context.Users.FirstAsync(u => u.Email == email);

            user.AvatarUrl = avatarUrl;

            await _context.SaveChangesAsync();

            return Ok();
        }
    }
}