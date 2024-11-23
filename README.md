# JobReadyAI Interview Assistant 🤖

An AI-powered interview preparation tool that generates tailored interview questions based on job descriptions. Built with Angular and .NET Core, featuring OpenAI's GPT-4 for intelligent question generation.

## 🌟 Features

- **Smart Question Generation**: Analyzes job descriptions to create relevant interview questions
- **Multiple Question Categories**:
  - Technical Questions
  - Behavioral Questions
  - Situational Questions
- **Interactive Chat Interface**: Clean and responsive design
- **Export Functionality**: Save your interview questions in PDF or text format
- **Conversation History**: Maintains context for follow-up questions
- **Real-time Responses**: Immediate AI-generated feedback

## 🚀 Tech Stack

- **Frontend**:
  - Angular 17
  - TailwindCSS
  - TypeScript
  - RxJS

- **Backend**:
  - .NET Core 7.0
  - OpenAI API
  - C#

## 📋 Prerequisites

- Node.js (v18 or higher)
- .NET Core SDK 7.0
- OpenAI API Key
- Angular CLI

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Rubayet19/JobReadyAI-Interview-Assistant.git
   cd JobReadyAI-Interview-Assistant
   ```

2. **Frontend Setup**
   ```bash
   cd ClientApp
   npm install
   ```

3. **Backend Setup**
   ```bash
   cd ../API
   dotnet restore
   ```

4. **Configure Environment**
   - Create `appsettings.json` in the API project
   ```json
   {
     "OpenAI": {
       "ApiKey": "your-api-key-here"
     }
   }
   ```

## 🚦 Running the Application

1. **Start the Backend**
   ```bash
   cd API
   dotnet run
   ```
   The API will be available at `http://localhost:5001`

2. **Start the Frontend**
   ```bash
   cd ClientApp
   ng serve
   ```
   Navigate to `http://localhost:4200`

## 💡 Usage

1. Enter a job description in the chat input
2. Receive tailored interview questions based on the job requirements
3. Ask follow-up questions for clarification or additional scenarios
4. Export your questions using the export button
5. Clear chat history when needed

## 🖼️ Screenshots

![image](https://github.com/user-attachments/assets/8acdd970-1134-45c0-a38a-da0a8f425f5a)


## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/Rubayet19/JobReadyAI-Interview-Assistant/issues).

## 📝 License

This project is [MIT](LICENSE) licensed.

## 👨‍💻 Author

**Rubayet Mujahid**
- GitHub: [@Rubayet19](https://github.com/Rubayet19)


💼 **Note**: Make sure to keep your API keys secure and never commit them to the repository.
