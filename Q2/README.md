# Q2 Blog API

REST API for a simple blogging platform with MongoDB relationships between users, posts, and comments.

## Run It

1. Set `MONGODB_URI` in `.env`.
2. Start the server from `Q2`:
   - `npm install`
   - `npm run dev`

The API runs on `http://localhost:5002` by default.

## Required Endpoints

### Users

- `POST /api/users/register`
- `GET /api/users`
- `GET /api/users/:id`

### Posts

- `POST /api/posts`
- `GET /api/posts`
- `GET /api/posts/:id`
- `GET /api/posts/tag/:tag`
- `PUT /api/posts/:id`
- `DELETE /api/posts/:id`

### Comments

- `POST /api/posts/:postId/comments`
- `GET /api/posts/:postId/comments`
- `DELETE /api/comments/:id`

## Postman Collection

Import [postman/q2-blog-api.postman_collection.json](postman/q2-blog-api.postman_collection.json) into Postman.

Set these collection variables before sending requests:

- `baseUrl` = `http://localhost:5002`
- `userId` = a valid user ObjectId
- `postId` = a valid post ObjectId
- `commentId` = a valid comment ObjectId
- `tag` = one of the tags stored on a post, for example `mongodb`

## Sample Create Post Body

```json
{
  "title": "Getting Started with REST APIs",
  "content": "REST stands for Representational State Transfer...",
  "author": "65f1a2b8c9d4e5f6a7b8c9d0",
  "tags": ["nodejs", "express", "mongodb"]
}
```
