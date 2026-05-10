using Microsoft.EntityFrameworkCore;
using LootkeyAPI.Models;

namespace LootkeyAPI.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Game> Games { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<Favorite> Favorites { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<GameKey> GameKeys { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<ReviewReaction> ReviewReactions { get; set; }
        public DbSet<UserGameView> UserGameViews { get; set; }
    }
}