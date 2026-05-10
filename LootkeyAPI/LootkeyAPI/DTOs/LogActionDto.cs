namespace LootkeyAPI.DTOs
{
    public class LogActionDto
    {
        public string Action { get; set; } = string.Empty;
        public string? Page { get; set; }
        public string? Details { get; set; }
    }
}