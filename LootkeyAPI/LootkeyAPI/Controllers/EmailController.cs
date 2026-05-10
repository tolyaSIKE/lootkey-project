using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LootkeyAPI.Data;
using LootkeyAPI.DTOs;
using LootkeyAPI.Services;

namespace LootkeyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public EmailController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [Authorize(Roles = "Admin")]
        [HttpPost("broadcast")]
        public async Task<IActionResult> Broadcast(AdminEmailDto dto)
        {
            var users = await _context.Users
                .Where(u => !string.IsNullOrEmpty(u.Email))
                .ToListAsync();

            foreach (var user in users)
            {
                var html = $@"
                    <div style='font-family: Arial, sans-serif;'>
                        <h2>{dto.Subject}</h2>
                        <p>{dto.Message}</p>
                        <hr />
                        <p style='color: gray;'>LootKey Store notification</p>
                    </div>";

                await _emailService.SendEmailAsync(user.Email, dto.Subject, html);
            }

            return Ok(new { message = "Emails sent successfully." });
        }
    }
}