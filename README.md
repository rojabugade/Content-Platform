# Content Platform - Single Spring Boot Application

## ✅ Application Status
**ALL SYSTEMS OPERATIONAL**

- **App**: Running on http://localhost:8080
- **Database**: PostgreSQL (port 5432) 
- **Cache**: Redis (port 6379)
- **Status**: ✅ Healthy

## Quick Start

### Start Application
```bash
docker compose up -d
```

### Stop Application
```bash
docker compose down
```

### View Logs
```bash
docker compose logs -f app
```

## API Endpoints

All endpoints are on `http://localhost:8080`

### Authentication (No token required)
- **POST** `/oauth2/token` - Get JWT token
  - Client: `content-platform-client`
  - Secret: `secret`
  - Scopes: `content.read`, `content.write`

### Content Management (Token required)
- **POST** `/api/v1/content` - Create content
- **GET** `/api/v1/content` - Get all content
- **GET** `/api/v1/content/{id}` - Get content by ID
- **PUT** `/api/v1/content/{id}` - Update content
- **DELETE** `/api/v1/content/{id}` - Delete content

### Health & Info
- **GET** `/actuator/health` - Health check
- **GET** `/oauth2/jwks` - JWT validation keys

## Testing with Postman

### Import Collection
1. Open Postman
2. Click **Import** → Select `Content-Platform-API.postman_collection.json`
3. Follow the requests in order

### Manual Testing Flow
1. **Get Token**
   ```bash
   POST http://localhost:8080/oauth2/token
   Authorization: Basic Y29udGVudC1wbGF0Zm9ybS1jbGllbnQ6c2VjcmV0
   Content-Type: application/x-www-form-urlencoded
   
   Body:
   grant_type=client_credentials&scope=content.read content.write
   ```

2. **Create Content** (Use token from step 1)
   ```bash
   POST http://localhost:8080/api/v1/content
   Authorization: Bearer {YOUR_TOKEN}
   Content-Type: application/json
   
   Body:
   {
     "title": "My Article",
     "body": "Article content here",
     "status": "DRAFT"
   }
   ```

3. **Get All Content**
   ```bash
   GET http://localhost:8080/api/v1/content
   Authorization: Bearer {YOUR_TOKEN}
   ```

4. **Update Content**
   ```bash
   PUT http://localhost:8080/api/v1/content/1
   Authorization: Bearer {YOUR_TOKEN}
   Content-Type: application/json
   
   Body:
   {
     "title": "Updated Title",
     "body": "Updated content",
     "status": "PUBLISHED"
   }
   ```

5. **Delete Content**
   ```bash
   DELETE http://localhost:8080/api/v1/content/1
   Authorization: Bearer {YOUR_TOKEN}
   ```

## 📁 Project Structure

```
Content-Platform/
├── pom.xml                          # Single Maven POM - all dependencies
├── Dockerfile                       # Single Docker image
├── docker-compose.yml              # 3 containers: app, postgres, redis
├── Content-Platform-API.postman_collection.json  # Import into Postman
│
└── src/main/java/com/roja/contentplatform/
    ├── ContentPlatformApplication.java     # Main entry point
    │
    ├── controller/
    │   ├── ContentController.java          # CRUD endpoints
    │   └── HealthController.java           # Health endpoint
    │
    ├── model/
    │   └── Content.java                    # Database entity
    │
    ├── repository/
    │   └── ContentRepository.java          # JPA repository
    │
    └── config/
        └── SecurityConfig.java             # OAuth2 + JWT configuration
        
└── src/main/resources/
    └── application.yml               # Configuration file
```

## 🔐 Security

- **OAuth2 Authorization Server**: Issues JWT tokens
- **JWT Validation**: All protected endpoints validate tokens
- **Scopes**: 
  - `content.read` - Read access
  - `content.write` - Write/Delete access
- **Issuer**: http://localhost:8080
- **JWK Endpoint**: http://localhost:8080/oauth2/jwks

## Database

- **Type**: PostgreSQL 16
- **Database**: contentdb
- **Username**: app
- **Password**: app
- **Port**: 5432
- **Table**: content

### Content Entity Fields
```json
{
  "id": "Long (auto-generated)",
  "title": "String (required)",
  "body": "Text (optional)",
  "status": "String (default: DRAFT)",
  "createdAt": "Instant (auto-set)"
}
```

## 🔧 Environment Variables

All configured in `docker-compose.yml`:
- `SPRING_DATASOURCE_URL`: PostgreSQL connection string
- `SPRING_DATASOURCE_USERNAME`: DB username
- `SPRING_DATASOURCE_PASSWORD`: DB password
- `SPRING_DATA_REDIS_HOST`: Redis hostname
- `SPRING_DATA_REDIS_PORT`: Redis port

## Technology Stack

- **Framework**: Spring Boot 3.3.2
- **Language**: Java 17
- **Build**: Maven 3.9.8
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Security**: Spring Security + OAuth2 Authorization Server
- **Container**: Docker & Docker Compose

## Features

✅ Single Spring Boot application (no microservices complexity)  
✅ OAuth2 token-based authentication  
✅ JWT validation via JWK endpoint  
✅ Complete CRUD operations  
✅ PostgreSQL persistence  
✅ Redis caching ready  
✅ Health checks  
✅ Postman collection included  

## Troubleshooting

### App won't start
```bash
docker compose logs app --tail 50
```

### Connection refused
- Check if containers are running: `docker compose ps`
- Verify ports: 8080 (app), 5432 (postgres), 6379 (redis)

### Database errors
- Check database connection: `docker compose logs postgres`
- Verify credentials in `docker-compose.yml`

### Token validation fails
- Ensure token is in format: `Bearer {token}`
- Check token hasn't expired (default: 1 hour)
- Verify JWT issuer matches: `http://localhost:8080`

## 📝 Notes

- This is a **single monolithic application**, not microservices
- OAuth2 and Content CRUD are in the same app
- Perfect for learning and testing
- Easy to scale horizontally with load balancing
- Ready for production with minor configuration changes

---

**Ready to test in Postman!** 
