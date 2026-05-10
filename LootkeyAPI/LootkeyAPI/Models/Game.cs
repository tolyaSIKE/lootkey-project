namespace LootkeyAPI.Models
{
    public class Game
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public decimal Price { get; set; }
        public decimal? DiscountPrice { get; set; }
        public string ImageUrl { get; set; }
        public int? CategoryId { get; set; }
        public Category? Category { get; set; }
        public string? Description { get; set; }
        public string? MinRequirements { get; set; }
        public string? RecRequirements { get; set; }
        public string? Genre { get; set; }
        public int? Year { get; set; }
        public string? SteamUrl { get; set; }
        public string? EpicUrl { get; set; }
    }
}