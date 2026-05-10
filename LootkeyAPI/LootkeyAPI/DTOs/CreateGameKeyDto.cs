namespace LootkeyAPI.DTOs
{
    public class CreateGameKeyDto
    {
        public int GameId { get; set; }

        public string KeyName { get; set; }

        public string KeyCode { get; set; }
    }
}