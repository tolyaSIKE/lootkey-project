namespace LootkeyAPI.Models
{
    public class UserGameView
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public int GameId { get; set; }
        public Game Game { get; set; }
        public DateTime ViewedAt { get; set; } = DateTime.Now;
    }
}