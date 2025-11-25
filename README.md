# Video Management API

This is a production-grade RESTful API for managing videos, playlists, and genres. It's built with Node.js, Express, and features a swappable storage architecture.

## Node.js Version

This project requires Node.js version `18.8.0`.

## Project Structure

```
.
├── data/                  # JSON files for metadata storage
├── public/                # Publicly accessible files
│   └── videos/            # Video file storage
├── src/                   # Source code
│   ├── config/            # Environment configuration
│   ├── controllers/       # Express controllers
│   ├── middleware/        # Express middleware
│   ├── models/            # Zod validation schemas
│   ├── routes/            # Express routers
│   ├── services/          # Business logic
│   ├── storage/           # Storage implementations (MongoDB, S3)
│   └── utils/             # Utility functions
├── .env                   # Environment variables (gitignored)
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore file
├── app.js                 # Express app setup
├── index.js               # Server entry point
└── package.json           # Project dependencies and scripts
```

## Setup Instructions

1.  **Install System Dependencies:**
    This application requires `ffmpeg` for video processing. Please install it using your system's package manager.
    - **macOS (Homebrew):** `brew install ffmpeg`
    - **Ubuntu/Debian:** `sudo apt update && sudo apt install ffmpeg`
2.  **Clone the repository and navigate to the project directory.**
3.  **Install Node.js dependencies:** `npm install`
4.  **Set up environment variables:**
    Create a `.env` file and copy the contents of `.env.example`. Update the variables as needed.
5.  **Start the server:**
    - For development: `npm run dev`
    - For production: `npm start`

## Data Model Schemas

### Video
- `id` (string, uuid)
- `creator` (string)
- `language` (string)
- `title` (string)
- `genres` (array of genre `id`s)
- `videoFile` (string, filename on disk)
- `fileName` (string, original uploaded filename)
- `uploadTime` (string, ISO 8601 datetime)
- `lastModified` (string, ISO 8601 datetime)

### Playlist & Genre
(No changes)

## Advanced Features

### Video Search
The `GET /api/videos` endpoint supports advanced searching:
- **Field-based search:** `?creator=JohnDoe&language=en`
- **Range search:** `?uploadDateFrom=2023-01-01&uploadDateTo=2023-12-31`
- **Fuzzy search:** `?fuzzy=MyAwesomVidio` (will match "My Awesome Video")

### Deep Video Validation
The API performs deep validation on uploaded video files. It checks the file extension and uses `ffmpeg` to probe the file, ensuring it's a valid, non-corrupted video file.

### Swappable Storage
The application uses an abstracted storage layer. You can swap out the default `JsonStorage` and `LocalStorage` with `MongoStorage` and `S3Storage` by changing the dependency injection in the route files.

## Example API Requests

### Advanced Video Search
`GET /api/videos?fuzzy=TechReview&creator=TechGuru&uploadDateFrom=2023-01-01`

### Cross-Resource Validation Error
If you try to create a video with an invalid genre ID, you will receive a detailed error message:
`POST /api/videos`
```json
{
  "creator": "Test",
  "language": "en",
  "title": "Test Video",
  "genres": ["invalid-genre-id"]
}
```
**Response (400 Bad Request):**
```json
{
  "error": {
    "message": "Invalid genre IDs: invalid-genre-id",
    "statusCode": 400
  }
}
```

(Other CRUD operations remain the same as before)

## Deployment & Troubleshooting
- The application will automatically create the necessary storage directories on startup.
- The API is protected against duplicate keys in JSON request bodies.
- For production, it is highly recommended to switch to `MongoStorage` and `S3Storage`. You will need to set the corresponding environment variables in your `.env` file.
- **Note on `fluent-ffmpeg`:** The `fluent-ffmpeg` package used for deep video validation is deprecated. For a real-world production system, consider migrating to a maintained alternative.
