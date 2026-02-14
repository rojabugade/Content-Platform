# RB Bank Content Platform

A modern content management system for creating, editing, and publishing banking and financial content. Built with Spring Boot backend and Next.js frontend.

## ✅ Application Status
**ALL SYSTEMS OPERATIONAL**

- **Frontend**: Running on http://localhost:3000
- **Backend API**: Running on http://localhost:8080
- **Database**: PostgreSQL (port 5432)
- **Cache**: Redis (port 6379)
- **Status**: ✅ Healthy

## Quick Start

### Start Application
```bash
docker compose up -d
npm run dev  # In web/ directory for Next.js frontend
```

### Stop Application
```bash
docker compose down
```

### View Logs
```bash
docker compose logs -f app
docker compose logs -f postgres
```

## 🎨 Features

### Core Functionality
- **Multi-Language Support**: Create content in multiple languages (EN, JP, RU) with variant management
- **Rich Text Content**: Full HTML support with formatted content storage
- **Draft to Approval Workflow**: Content moves through DRAFT → PENDING_APPROVAL → APPROVED states
- **Content Versioning**: Track version history and content evolution
- **Region-Based Isolation**: Content segregated by region (US, JP, RU) with proper access control
- **Scheduled Publishing**: Set future publish dates for content
- **Full-Text Search**: Query content by title across regions and languages
- **Content Categorization**: 13 category types (TRADES, MARKETS, COMPLIANCE, RISK_MANAGEMENT, POLICY, OPERATIONS, RESEARCH, ALERTS, PRODUCT_NEWS, TRAINING, CLIENT_SERVICES, TECHNOLOGY, REGULATORY)
- **Priority Management**: Content prioritization (Low, Medium, High)
- **Internal Flag**: Mark content as internal-only or public
- **Tagging System**: Multi-tag support for content classification
- **OAuth2 Token-Based Auth**: Secure API access with JWT validation
- **Cover Image Management**: Base64 or URL-based image storage with aspect ratio handling
- **Content Metadata**: Comprehensive metadata including creator, approver, timestamps

## 🔐 Security

- **OAuth2 Authorization Server**: Issues JWT tokens
- **JWT Validation**: All protected endpoints validate tokens
- **Scopes**: 
  - `content.read` - Read access
  - `content.write` - Write/Delete access
- **Region-based Access**: Multi-region support with proper isolation

## 📁 Project Structure

```
Content-Platform/
├── pom.xml                           # Backend Maven dependencies
├── docker-compose.yml               # Docker orchestration
├── Dockerfile                       # Backend image
│
├── src/main/java/com/roja/contentplatform/
│   ├── ContentPlatformApplication.java
│   ├── controller/
│   │   ├── ContentController.java       # Content CRUD endpoints
│   │   ├── HealthController.java        # Health check
│   │   └── FeedController.java          # Feed/published content
│   ├── model/
│   │   ├── ContentItem.java             # Main content entity
│   │   └── ContentVariant.java          # Content translations/variants
│   ├── repository/
│   │   ├── ContentItemRepository.java
│   │   └── ContentVariantRepository.java
│   ├── services/
│   │   └── ContentQueryService.java
│   ├── api/dto/                         # Data transfer objects
│   ├── auth/config/
│   │   ├── SecurityConfig.java
│   │   ├── TokenCustomizerConfig.java
│   │   └── CorsConfig.java
│   └── config/
│       └── DataInitializer.java
│
├── web/                             # Next.js Frontend
│   ├── src/app/
│   │   ├── page.tsx                 # Published content dashboard
│   │   ├── content/[id]/
│   │   │   └── page.tsx             # Content detail view
│   │   ├── drafts/
│   │   │   └── page.tsx             # Draft management hub
│   │   ├── globals.css              # Global styles & design system
│   │   └── layout.tsx
│   ├── src/lib/
│   │   ├── api.ts                   # API client
│   │   └── token.ts                 # OAuth2 token management
│   └── package.json
│
└── src/main/resources/
    ├── application.yml              # Development config
    └── application-prod.yml         # Production config
```

## 🛠 Technology Stack

### Backend
- **Framework**: Spring Boot 3.3.2
- **Language**: Java 17
- **Build**: Maven
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Security**: Spring Security + OAuth2 Authorization Server
- **API**: RESTful with OpenAPI support

### Frontend
- **Framework**: Next.js 16.1.6
- **Runtime**: React 19.2.3
- **Language**: TypeScript
- **Styling**: CSS modules + custom design system
- **Editor**: Rich text editor (contentEditable with document.execCommand)

### Deployment
- **Container**: Docker & Docker Compose
- **Ports**: Frontend (3000), Backend (8080), Database (5432), Cache (6379)

## API Endpoints

All backend endpoints on `http://localhost:8080`

### Authentication
- **POST** `/oauth2/token` - Get JWT token
  - Client: `content-platform-client`
  - Secret: `secret`
  - Scopes: `content.read`, `content.write`

### Content Management
- **POST** `/api/v1/content` - Create content
- **GET** `/api/v1/content` - Get all content
- **GET** `/api/v1/content/{id}` - Get content by ID
- **POST** `/api/v1/content/{id}/variant` - Create/update content variant (translation)
- **DELETE** `/api/v1/content/{id}` - Delete content

### Feed (Published Content)
- **GET** `/api/v1/feed` - Get published content by region & language

### Health
- **GET** `/actuator/health` - Health check
- **GET** `/oauth2/jwks` - JWT validation keys

## Data Models

### DraftEntry (Frontend localStorage)
```typescript
{
  id: number;
  title: string;
  region: string;
  language: string;
  status: "DRAFT" | "PENDING_APPROVAL" | "APPROVED";
  createdAt: string;
  contentType: string;
  category: string;
  priority: string;
  tags: string;
  internal: boolean;
  body: string;              // HTML from rich text editor
  coverImage?: string;       // Base64 or URL
  scheduledPublishAt?: string;
}
```

### ContentItem (Backend)
```json
{
  "id": "Long",
  "contentType": "String",
  "region": "String",
  "category": "String",
  "tags": "String[]",
  "priority": "String",
  "pinned": "Boolean",
  "status": "String",
  "publishedAt": "Instant",
  "internal": "Boolean",
  "variants": "ContentVariant[]"
}
```

## 🎨 Design System

**RB Bank Branding**
- **Accent Color**: #0f5b57 (Teal)
- **Gold Accent**: #c6a45d
- **Primary Background**: #f6f2ed
- **Text Color**: #0b1220

**UI Components**
- Sticky topbar with gradient background
- Grid-based tile layout with 16:6 aspect ratio images
- Rich text editor with formatting toolbar
- Modal-based preview
- Responsive design

## 📝 Workflow

1. **Create Draft**: Go to Dashboard → Create Draft
2. **Add Metadata**: Select type, region, category, etc.
3. **Write Content**: Use rich text editor with formatting
4. **Upload Cover**: Support file upload or URL input
5. **Preview**: Click Preview to see 16:6 aspect ratio
6. **Save or Submit**:
   - Save as Draft: Keep editing locally
   - Submit for Approval: Send to review (PENDING_APPROVAL status)
7. **Manage**: Track drafts in Recent/Manage & Review sections
8. **Approve**: Admin approves and publishes to live feed
9. **View**: Published content appears in Published dashboard

## 🔧 Environment Setup

### Backend (Spring Boot)
```bash
cd Content-Platform
mvn clean install
mvn spring-boot:run
```

### Frontend (Next.js)
```bash
cd web
npm install
npm run dev  # Development server
npm run build  # Production build
npm run start  # Production server
```

### Docker (Recommended)
```bash
docker compose up -d      # Start all services
docker compose ps         # View status
docker compose logs app   # View backend logs
```

## Testing Workflow

### Through UI
1. Go to http://localhost:3000
2. Create a draft with content and cover image
3. Preview to see exact layout
4. Submit for approval
5. Go to Manage & Review tab
6. Click Approve to publish
7. View in Published section

### Through Postman
1. Import `Content-Platform-API.postman_collection.json`
2. Get OAuth2 token
3. Create content with POST `/api/v1/content`
4. Add variant with POST `/api/v1/content/{id}/variant`
5. Query feed with GET `/api/v1/feed`

## 📊 Database

- **Type**: PostgreSQL 16
- **Database**: contentdb
- **Tables**: content_item, content_variant, oauth2_* tables
- **Seed Data**: Automatic initialization with sample content

## 🚀 Deployment

The application is containerized and ready for:
- Docker Hub deployment
- AWS ECS / EC2
- Azure Container Apps
- Kubernetes
- Local development with Docker Compose

## 📝 Notes

- All drafts are stored in browser localStorage for instant access
- Cover images persist through the approval workflow
- Rich text formatting maintained across edit/preview/publish
- Region-based content isolation with multi-language support
- Production-ready with proper error handling and validation

---

**Ready to use!** Start with `docker compose up -d` and navigate to http://localhost:3000 
