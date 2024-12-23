$uri = "https://jobready-ai-api.azurewebsites.net/api/chat"
$body = @{
    message = "Hello, how are you?"
    conversationHistory = @()
} | ConvertTo-Json

Write-Host "Testing API endpoint: $uri"
Write-Host "Request body:"
Write-Host $body

$response = Invoke-RestMethod -Uri $uri -Method Post -ContentType "application/json" -Body $body

Write-Host "`nResponse:"
Write-Host $response | ConvertTo-Json -Depth 10
