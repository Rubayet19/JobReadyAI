using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using JobReadyAI.API.Models;
using JobReadyAI.API.Services;
using Microsoft.AspNetCore.Cors;
using OpenAI.Chat;

namespace JobReadyAI.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableCors("AllowAngular")]
    public class ChatController : ControllerBase
    {
        private readonly IOpenAIService _openAIService;

        public ChatController(IOpenAIService openAIService)
        {
            _openAIService = openAIService;
        }

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

        [HttpPost]
        public async Task<IActionResult> GetResponse([FromBody] ChatRequest request)
        {
            try
            {
                if (request == null || string.IsNullOrEmpty(request.Message))
                {
                    return BadRequest("Message cannot be empty");
                }

                var messages = new List<ChatMessage>();
                foreach (var msg in request.ConversationHistory ?? new List<MessageHistory>())
                {
                    messages.Add(msg.Role == "user" 
                        ? new UserChatMessage(msg.Content)
                        : new AssistantChatMessage(msg.Content));
                }

                messages.Add(new UserChatMessage(request.Message));

                var response = await _openAIService.GetChatResponseAsync(messages);
                return Ok(new { response });
            }
            catch (Exception ex)
            {

                Console.WriteLine($"Error: {ex.Message}");
                return BadRequest(new { error = ex.Message });
            }
        }
    }
}