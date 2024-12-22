using JobReadyAI.API.Services;
using Microsoft.AspNetCore.Cors;

var builder = WebApplication.CreateBuilder(args);

// Add CORS first
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAngular", builder =>
    {
        builder.WithOrigins(
                "http://localhost:4200",
                "https://job-ready-ai.vercel.app",
                "https://job-ready-ai-git-master-rubayet19.vercel.app",
                "https://job-ready-ai-rubayet19.vercel.app"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials();
    });
});

// Add other services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Register OpenAI Service
builder.Services.AddSingleton<IOpenAIService>(provider =>
    new OpenAIService(builder.Configuration["OpenAI:ApiKey"]!));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Add CORS before routing and after any authentication/authorization middleware
app.UseCors("AllowAngular");

app.UseHttpsRedirection();
app.MapControllers();

// Add some logging middleware to debug CORS issues
app.Use(async (context, next) =>
{
    Console.WriteLine($"Request from: {context.Request.Headers["Origin"]}");
    Console.WriteLine($"Method: {context.Request.Method}");
    Console.WriteLine($"Path: {context.Request.Path}");
    await next();
});

app.Run();