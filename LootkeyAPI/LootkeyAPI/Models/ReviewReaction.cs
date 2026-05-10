namespace LootkeyAPI.Models
{
    public class ReviewReaction
    {
        public int Id { get; set; }
        public int ReviewId { get; set; }
        public Review Review { get; set; }
        public int UserId { get; set; }
        public User User { get; set; }
        public string ReactionType { get; set; }
    }
}