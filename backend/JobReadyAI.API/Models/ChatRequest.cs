namespace JobReadyAI.API.Models
{
    public class ChatRequest
    {
        public string Message { get; set; }
        public List<MessageHistory> ConversationHistory { get; set; } = new List<MessageHistory>();
    }

    public class MessageHistory
    {
        public string Role { get; set; }
        public string Content { get; set; }
    }
}