# Club Vitalife - Backend API

Backend API for Club Vitalife product management with PostgreSQL, MinIO (S3), and Firebase Authentication.

## 🚀 Stack

- **Server**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (via Prisma ORM)
- **Storage**: MinIO (S3-compatible)
- **Authentication**: Firebase Admin SDK
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

1. **Firebase Service Account Key**
   - Download `serviceAccountKey.json` from Firebase Console
   - Place it in the root directory of this project

2. **Dependencies installed** (already done via `npm install`)

## ⚙️ Setup

### 1. Initialize Prisma

```bash
npm run prisma:generate
npm run prisma:migrate
```

This will:
- Generate Prisma Client
- Create database tables from schema
- Apply migrations to PostgreSQL

### 2. Start Development Server

```bash
npm run dev
```

Server will run on `http://localhost:5000`

## 📡 API Endpoints

### Public Endpoints

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /health` - Health check

### Protected Endpoints (Require Firebase Auth Token)

- `POST /api/products` - Create product (with image upload)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

**Authentication Header**:
```
Authorization: Bearer <firebase-id-token>
```

## 📦 Database Schema

### Product
- `id` (UUID)
- `name` (String)
- `description` (String)
- `shortDescription` (String)
- `fullDescription` (String)
- `categories` (String[])
- `isFeatured` (Boolean)
- Relations: images, flavors, benefits

### ProductImage
- `id` (UUID)
- `url` (String)
- `isMain` (Boolean)  
- `productId` (FK)

### ProductFlavor
- `id` (UUID)
- `name` (String)
- `productId` (FK)

### ProductBenefit
- `id` (UUID)
- `text` (String)
- `productId` (FK)

## 🔐 Security

- **Firebase Auth**: All write operations require valid Firebase ID token
- **CORS**: Restricted to `http://localhost:3001` in development
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Helmet**: Security headers
- **Input Validation**: File upload restrictions (10MB, images only)

## 📤 File Upload

POST /PUT requests with images use `multipart/form-data`:

```javascript
const formData = new FormData();
formData.append('name', 'Product Name');
formData.append('shortDescription', 'Short desc');
formData.append('images', file1);
formData.append('images', file2);
// ... other fields
```

Images are uploaded to MinIO and URLs are stored in the database.

## 🛠️ Development Commands

```bash
npm run dev              # Start dev server with hot reload
npm run build            # Compile TypeScript
npm run start            # Run compiled code
npm run prisma:generate  # Generate Prisma Client
npm run prisma:migrate   # Run database migrations
npm run prisma:studio    # Open Prisma Studio (DB GUI)
```

## 🌐 Environment Variables

See `.env` file (already configured):

- `PORT`: Server port (5000)
- `DATABASE_URL`: PostgreSQL connection string
- `AWS_*`: MinIO/S3 credentials
- Firebase config via `serviceAccountKey.json`

## 📝 Notes

- First image uploaded is automatically set as main image (`isMain: true`)
- Product deletion cascades to related images, flavors, and benefits
- Old images are deleted from MinIO when updating product images
- All timestamps are UTC

## ⚠️ Next Steps

1. **Add Firebase serviceAccountKey.json**
2. **Run Prisma migrations**: `npm run prisma:migrate`
3. **Start server**: `npm run dev`
4. **Update frontend to connect to this API**
