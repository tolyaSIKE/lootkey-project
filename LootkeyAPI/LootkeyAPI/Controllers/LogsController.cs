using LootkeyAPI.DTOs;
using LootkeyAPI.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LootkeyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LogsController : ControllerBase
    {
        private readonly UserActionLogger _logger;

        public LogsController(UserActionLogger logger)
        {
            _logger = logger;
        }

        [HttpPost]
        [AllowAnonymous]
        public async Task<IActionResult> CreateLog(LogActionDto dto)
        {
            var email = User.Identity?.IsAuthenticated == true
                ? User.FindFirst(ClaimTypes.Name)?.Value ?? User.Identity.Name ?? "Anonymous"
                : "Anonymous";

            var role = User.Identity?.IsAuthenticated == true
                ? User.FindFirst(ClaimTypes.Role)?.Value ?? "Unknown"
                : "Anonymous";

            var log = new
            {
                Time = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss"),
                User = email,
                Role = role,
                Action = dto.Action,
                Page = dto.Page,
                Details = dto.Details,
                Ip = HttpContext.Connection.RemoteIpAddress?.ToString(),
                UserAgent = Request.Headers.UserAgent.ToString()
            };

            await _logger.LogAsync(log);

            return Ok();
        }
    }
}