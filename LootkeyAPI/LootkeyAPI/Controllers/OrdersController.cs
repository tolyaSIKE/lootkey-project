using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LootkeyAPI.Data;
using LootkeyAPI.DTOs;
using LootkeyAPI.Models;
using LootkeyAPI.Services;

namespace LootkeyAPI.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly EmailService _emailService;

        public OrdersController(AppDbContext context, EmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        [Authorize]
        [HttpPost("checkout")]
        public async Task<IActionResult> Checkout(CheckoutRequestDto dto)
        {
            var email = User.Identity?.Name;

            if (email == null)
                return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return Unauthorized();

            if (dto.Items.Count == 0)
                return BadRequest("Cart is empty.");

            Order? order = null;
            var purchasedItems = new List<object>();
            var emailRows = "";
            decimal total = 0;

            await using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                order = new Order
                {
                    UserId = user.Id,
                    TotalPrice = 0,
                    Status = "Paid",
                    CreatedAt = DateTime.Now
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                foreach (var item in dto.Items)
                {
                    var game = await _context.Games.FirstOrDefaultAsync(g => g.Id == item.GameId);

                    if (game == null)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest($"Game with id {item.GameId} not found.");
                    }

                    var availableKeys = await _context.GameKeys
                        .Where(k => k.GameId == item.GameId && !k.IsSold)
                        .Take(item.Quantity)
                        .ToListAsync();

                    if (availableKeys.Count < item.Quantity)
                    {
                        await transaction.RollbackAsync();
                        return BadRequest($"Not enough keys for {game.Title}.");
                    }

                    var finalPrice = game.DiscountPrice ?? game.Price;

                    foreach (var key in availableKeys)
                    {
                        key.IsSold = true;
                        key.SoldAt = DateTime.Now;

                        var orderItem = new OrderItem
                        {
                            OrderId = order.Id,
                            GameId = game.Id,
                            GameKeyId = key.Id,
                            Price = finalPrice,
                            KeyCode = key.KeyCode
                        };

                        _context.OrderItems.Add(orderItem);

                        total += finalPrice;

                        purchasedItems.Add(new
                        {
                            gameId = game.Id,
                            title = game.Title,
                            imageUrl = game.ImageUrl,
                            price = finalPrice,
                            originalPrice = game.Price,
                            discountPrice = game.DiscountPrice,
                            keyCode = key.KeyCode
                        });

                        var priceHtml = game.DiscountPrice.HasValue
                            ? $"<span style='text-decoration: line-through; color: gray;'>€{game.Price:F2}</span> <b style='color: red;'>€{finalPrice:F2}</b>"
                            : $"€{game.Price:F2}";

                        emailRows += $@"
                            <tr>
                                <td style='padding: 8px; border: 1px solid #ddd;'>{game.Title}</td>
                                <td style='padding: 8px; border: 1px solid #ddd;'>{priceHtml}</td>
                                <td style='padding: 8px; border: 1px solid #ddd; font-family: monospace;'>{key.KeyCode}</td>
                            </tr>";
                    }
                }

                order.TotalPrice = total;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return StatusCode(500, $"Checkout database error: {ex.Message}");
            }

            try
            {
                var emailBody = $@"
                    <div style='font-family: Arial, sans-serif;'>
                        <h2>Thank you for your purchase in LootKey!</h2>
                        <p>Your order <b>#{order!.Id}</b> has been successfully paid.</p>

                        <table style='border-collapse: collapse; width: 100%;'>
                            <thead>
                                <tr>
                                    <th style='padding: 8px; border: 1px solid #ddd;'>Game</th>
                                    <th style='padding: 8px; border: 1px solid #ddd;'>Price</th>
                                    <th style='padding: 8px; border: 1px solid #ddd;'>Key</th>
                                </tr>
                            </thead>
                            <tbody>
                                {emailRows}
                            </tbody>
                        </table>

                        <h3>Total: €{total:F2}</h3>
                        <p>You can also find your purchased keys in your LootKey profile.</p>
                    </div>";

                await _emailService.SendEmailAsync(
                    user.Email,
                    $"LootKey Order #{order!.Id}",
                    emailBody
                );
            }
            catch (Exception ex)
            {
                return Ok(new
                {
                    message = $"Payment successful, but email was not sent: {ex.Message}",
                    orderId = order!.Id,
                    totalPrice = order.TotalPrice,
                    items = purchasedItems
                });
            }

            return Ok(new
            {
                message = "Payment successful. Receipt and keys were sent to your email.",
                orderId = order!.Id,
                totalPrice = order.TotalPrice,
                items = purchasedItems
            });
        }

        [Authorize]
        [HttpGet("my-purchases")]
        public async Task<IActionResult> MyPurchases()
        {
            var email = User.Identity?.Name;

            if (email == null)
                return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return Unauthorized();

            var purchases = await _context.OrderItems
                .Include(i => i.Game)
                .Include(i => i.Order)
                .Where(i => i.Order.UserId == user.Id)
                .OrderByDescending(i => i.Order.CreatedAt)
                .Select(i => new
                {
                    orderId = i.OrderId,
                    gameId = i.GameId,
                    title = i.Game.Title,
                    imageUrl = i.Game.ImageUrl,
                    keyCode = i.KeyCode,
                    price = i.Price,
                    purchasedAt = i.Order.CreatedAt
                })
                .ToListAsync();

            return Ok(purchases);
        }

        [Authorize(Roles = "Admin")]
        [HttpGet]
        public async Task<IActionResult> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Items)
                .ThenInclude(i => i.Game)
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new
                {
                    id = o.Id,
                    userEmail = o.User.Email,
                    totalPrice = o.TotalPrice,
                    status = o.Status,
                    createdAt = o.CreatedAt,
                    items = o.Items.Select(i => new
                    {
                        gameTitle = i.Game.Title,
                        keyCode = i.KeyCode,
                        price = i.Price
                    })
                })
                .ToListAsync();

            return Ok(orders);
        }
    }
}