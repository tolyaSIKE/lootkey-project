namespace LootkeyAPI.DTOs
{
    public class CheckoutRequestDto
    {
        public List<CheckoutItemDto> Items { get; set; } = new();
    }

    public class CheckoutItemDto
    {
        public int GameId { get; set; }
        public int Quantity { get; set; }
    }
}