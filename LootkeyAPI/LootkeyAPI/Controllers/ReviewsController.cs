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
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ReviewsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("game/{gameId}")]
        public async Task<IActionResult> GetGameReviews(int gameId)
        {
            var currentEmail = User.Identity?.IsAuthenticated == true
                ? User.Identity.Name
                : null;

            var currentUser = currentEmail == null
                ? null
                : await _context.Users.FirstOrDefaultAsync(u => u.Email == currentEmail);

            var reviews = await _context.Reviews
                .Where(r => r.GameId == gameId)
                .Include(r => r.User)
                .Include(r => r.Reactions)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    id = r.Id,
                    gameId = r.GameId,
                    userId = r.UserId,
                    username = r.User.Username ?? r.User.Email,
                    avatarUrl = r.User.AvatarUrl,
                    rating = r.Rating,
                    comment = r.Comment,
                    createdAt = r.CreatedAt,
                    likes = r.Reactions.Count(x => x.ReactionType == "Like"),
                    dislikes = r.Reactions.Count(x => x.ReactionType == "Dislike"),
                    canDelete = currentUser != null && currentUser.Id == r.UserId,
                    myReaction = currentUser == null
                        ? null
                        : r.Reactions
                            .Where(x => x.UserId == currentUser.Id)
                            .Select(x => x.ReactionType)
                            .FirstOrDefault()
                })
                .ToListAsync();

            return Ok(reviews);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateReview(CreateReviewDto dto)
        {
            var email = User.Identity?.Name;

            if (email == null)
                return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return Unauthorized();

            var gameExists = await _context.Games.AnyAsync(g => g.Id == dto.GameId);

            if (!gameExists)
                return BadRequest("Game not found.");

            if (dto.Rating < 1 || dto.Rating > 5)
                return BadRequest("Rating must be between 1 and 5.");

            if (string.IsNullOrWhiteSpace(dto.Comment))
                return BadRequest("Comment cannot be empty.");

            var review = new Review
            {
                GameId = dto.GameId,
                UserId = user.Id,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.Now
            };

            _context.Reviews.Add(review);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Review added successfully." });
        }

        [Authorize]
        [HttpPost("{reviewId}/reaction")]
        public async Task<IActionResult> ToggleReaction(int reviewId, ToggleReviewReactionDto dto)
        {
            var email = User.Identity?.Name;

            if (email == null)
                return Unauthorized();

            if (dto.ReactionType != "Like" && dto.ReactionType != "Dislike")
                return BadRequest("Reaction must be Like or Dislike.");

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return Unauthorized();

            var reviewExists = await _context.Reviews.AnyAsync(r => r.Id == reviewId);

            if (!reviewExists)
                return NotFound("Review not found.");

            var existingReaction = await _context.ReviewReactions
                .FirstOrDefaultAsync(r => r.ReviewId == reviewId && r.UserId == user.Id);

            if (existingReaction == null)
            {
                _context.ReviewReactions.Add(new ReviewReaction
                {
                    ReviewId = reviewId,
                    UserId = user.Id,
                    ReactionType = dto.ReactionType
                });
            }
            else if (existingReaction.ReactionType == dto.ReactionType)
            {
                _context.ReviewReactions.Remove(existingReaction);
            }
            else
            {
                existingReaction.ReactionType = dto.ReactionType;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Reaction updated." });
        }

        [Authorize]
        [HttpDelete("my/{reviewId}")]
        public async Task<IActionResult> DeleteOwnReview(int reviewId)
        {
            var email = User.Identity?.Name;

            if (email == null)
                return Unauthorized();

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return Unauthorized();

            var review = await _context.Reviews
                .Include(r => r.Reactions)
                .FirstOrDefaultAsync(r => r.Id == reviewId);

            if (review == null)
                return NotFound("Review not found.");

            if (review.UserId != user.Id)
                return Forbid();

            _context.ReviewReactions.RemoveRange(review.Reactions);
            _context.Reviews.Remove(review);

            await _context.SaveChangesAsync();

            return NoContent();
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin/all")]
        public async Task<IActionResult> GetAllReviewsForAdmin()
        {
            var reviews = await _context.Reviews
                .Include(r => r.User)
                .Include(r => r.Game)
                .Include(r => r.Reactions)
                .OrderByDescending(r => r.CreatedAt)
                .Select(r => new
                {
                    id = r.Id,
                    gameId = r.GameId,
                    gameTitle = r.Game.Title,
                    userId = r.UserId,
                    username = r.User.Username ?? r.User.Email,
                    userEmail = r.User.Email,
                    rating = r.Rating,
                    comment = r.Comment,
                    createdAt = r.CreatedAt,
                    likes = r.Reactions.Count(x => x.ReactionType == "Like"),
                    dislikes = r.Reactions.Count(x => x.ReactionType == "Dislike")
                })
                .ToListAsync();

            return Ok(reviews);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{reviewId}")]
        public async Task<IActionResult> DeleteReviewByAdmin(int reviewId)
        {
            var review = await _context.Reviews
                .Include(r => r.Reactions)
                .FirstOrDefaultAsync(r => r.Id == reviewId);

            if (review == null)
                return NotFound("Review not found.");

            _context.ReviewReactions.RemoveRange(review.Reactions);
            _context.Reviews.Remove(review);

            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}