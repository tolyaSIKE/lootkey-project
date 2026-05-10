namespace LootkeyAPI.Models
{
    public class GameKey
    {
        public int Id { get; set; }
        public int GameId { get; set; }
        public Game Game { get; set; }
        public string? KeyName { get; set; }
        public string KeyCode { get; set; }
        public bool IsSold { get; set; }
        public DateTime? SoldAt { get; set; }
    }
}