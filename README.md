# Video Management API

This is a production-grade RESTful API for managing videos, playlists, and genres. It's built with Node.js, Express, and uses a filesystem-based storage system for metadata and video files.

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
│   └── utils/             # Utility functions
├── .env                   # Environment variables (gitignored)
├── .env.example           # Example environment variables
├── .gitignore             # Git ignore file
├── app.js                 # Express app setup
├── index.js               # Server entry point
└── package.json           # Project dependencies and scripts
```

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd video-management-api
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root of the project and add the following variables:
    ```
    # Application Configuration
    PORT=3000
    NODE_ENV=development

    # Storage Paths
    VIDEOS_METADATA_PATH=./data/videos.json
    PLAYLISTS_METADATA_PATH=./data/playlists.json
    GENRES_METADATA_PATH=./data/genres.json
    VIDEO_FILES_PATH=./public/videos
    ```

4.  **Start the server:**
    ```bash
    npm start
    ```
    For development, you can use:
    ```bash
    npm run dev
    ```

## Data Model Schemas

### Video
- `id` (string, uuid)
- `creator` (string)
- `language` (string)
- `title` (string)
- `genres` (array of genre `id`s)
- `videoFile` (string, filename)

### Playlist
- `id` (string, uuid)
- `name` (string)
- `videoIds` (array of video `id`s)

### Genre
- `id` (string, uuid)
- `name` (string)

## Example API Requests

### Genres

- **Create a new genre:**
  `POST /api/genres`
  ```json
  {
    "name": "Action"
  }
  ```

- **Get all genres:**
  `GET /api/genres`

- **Get a genre by ID:**
  `GET /api/genres/:id`

- **Update a genre:**
  `PUT /api/genres/:id`
  ```json
  {
    "name": "Adventure"
  }
  ```

- **Delete a genre:**
  `DELETE /api/genres/:id`

### Videos

- **Upload a new video:**
  `POST /api/videos`
  This endpoint expects a `multipart/form-data` request with the following fields:
  - `creator` (string)
  - `language` (string)
  - `title` (string)
  - `genres` (JSON string array of genre `id`s)
  - `videoFile` (video file)

- **Get all videos (with search):**
  `GET /api/videos?search=<search-term>`

- **Get a video by ID:**
  `GET /api/videos/:id`

- **Update a video:**
  `PUT /api/videos/:id`
  ```json
  {
    "title": "New Title"
  }
  ```

- **Delete a video:**
  `DELETE /api/videos/:id`

### Playlists

- **Create a new playlist:**
  `POST /api/playlists`
  ```json
  {
    "name": "My Favorite Videos",
    "videoIds": ["<video-id-1>", "<video-id-2>"]
  }
  ```

- **Get all playlists:**
  `GET /api/playlists`

- **Get a playlist by ID:**
  `GET /api/playlists/:id`

- **Update a playlist:**
  `PUT /api/playlists/:id`
  ```json
  {
    "name": "My Awesome Videos"
  }
  ```

- **Delete a playlist:**
  `DELETE /api/playlists/:id`

## Deployment & Troubleshooting

- This application is designed to be deployed on any platform that supports Node.js.
- Ensure that the `data` and `public/videos` directories are writable by the application.
- For production use, consider replacing the `JsonStorage` utility with a more robust database solution like MongoDB or PostgreSQL. The dependency injection pattern used in the services makes this easy to do without changing the business logic.
- All logs are sent to the console. In a production environment, you should configure a more robust logging solution.
