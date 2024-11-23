using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using OpenAI;
using OpenAI.Chat;
using OpenAI.Models;

namespace JobReadyAI.API.Services
{
    public interface IOpenAIService
    {
        Task<string> GetChatResponseAsync(List<ChatMessage> conversationHistory);
    }

    public class OpenAIService : IOpenAIService
    {
        private readonly ChatClient _chatClient;
        private readonly string _systemPrompt = @"You are an experienced recruiter and interview specialist with expertise in creating targeted interview questions for a variety of roles and industries. Your task is to generate high-quality interview questions based on the job description provided by the user.
        ### Instructions:
        1. Analyze the job description thoroughly to identify key skills, responsibilities, and qualifications.
        2. Generate interview questions in the following categories:
         - **Technical Questions**: Assess the candidate's job-specific technical skills.
         - **Behavioral Questions**: Evaluate the candidate's soft skills, such as teamwork, leadership, and communication.
         - **Situational Questions**: Explore how the candidate would handle specific challenges or scenarios related to the role.
        3. Provide a brief explanation for each question to clarify its relevance to the role.
        4. If the user provides additional preferences (e.g., focus on leadership or coding skills), customize the questions accordingly.
        ### Important Rules:
        - **Relevance**: Refuse to answer queries unrelated to job interviews or question generation. Respond politely and inform the user of the tool's intended purpose.
        - **Format**: Deliver the output in a clear and organized format, categorized by question type.
        - **Customization**: Be flexible to refine the questions based on user feedback or specific role requirements.";

        public OpenAIService(string apiKey)
        {
            _chatClient = new ChatClient("gpt-4", apiKey);
        }

        public async Task<string> GetChatResponseAsync(List<ChatMessage> conversationHistory)
        {
            var messages = new List<ChatMessage>
            {
                // Add system message first
                new SystemChatMessage(_systemPrompt)
            };
            
            // Add the conversation history
            messages.AddRange(conversationHistory);

            ChatCompletion completion = await _chatClient.CompleteChatAsync(messages);
            return completion.Content[0].Text;
        }
    }
}