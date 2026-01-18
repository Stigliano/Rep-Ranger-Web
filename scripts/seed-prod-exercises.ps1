$baseUrl = "https://rapranger-backend-prod-6911179946.europe-west1.run.app"
$email = "test@example.com"
$password = "Test123!"

# 1. Login
Write-Host "Logging in..."
$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.accessToken
    Write-Host "Login successful. Token obtained."
} catch {
    Write-Host "Login failed. Trying to register..."
    # Se login fallisce, provo a registrare
    $registerBody = @{
        name = "Test Seed User"
        email = $email
        password = $password
    } | ConvertTo-Json
    
    try {
        $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
        $token = $registerResponse.accessToken
        Write-Host "Registration successful. Token obtained."
    } catch {
        Write-Error "Failed to login and register. $_"
        exit 1
    }
}

# 2. Seed Exercises
Write-Host "Seeding exercises..."
$headers = @{
    Authorization = "Bearer $token"
}

try {
    Invoke-RestMethod -Uri "$baseUrl/api/exercises/seed" -Method POST -Headers $headers
    Write-Host "Exercises seeded successfully!"
} catch {
    Write-Error "Failed to seed exercises. $_"
    exit 1
}
