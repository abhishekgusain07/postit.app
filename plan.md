# Plan: Implementing Scheduled Posts Feature

This document provides a step-by-step guide to add post-scheduling functionality to your existing application. It is based on the architecture of the `postiz-app-main` project, which uses a robust, scalable model with separate services for handling API requests, background jobs, and scheduled tasks.

We will use **Redis** and **BullMQ** to create a reliable job queue system for scheduling and publishing posts.

---

## Prerequisites

Before you begin, ensure you have the following installed and running:

1.  **Redis:** A running Redis instance. You can install it locally or use a cloud-based service.
2.  **Docker (Recommended):** For running Redis and, eventually, your entire application stack in a containerized environment.

---

## Step 1: Project Structure & Setup

Your current application likely has a single backend service. To prepare for this new feature, we will adopt a more modular structure, similar to the `postiz-app-main` example.

### 1.1. Install Dependencies

First, add BullMQ and the Redis client library (`ioredis`) to your backend's `package.json`:

```bash
npm install bullmq ioredis
```

### 1.2. Create New Application Modules

Instead of keeping everything in one service, we will separate concerns into three main components. If you are using a framework like NestJS, you can create these as new "apps" within your monorepo. If not, you can create new directories:

-   **`backend` (Your Existing App):** This will continue to handle incoming API requests from your frontend.
-   **`worker` (New):** This service will be responsible for processing jobs from the queue (i.e., actually posting to Twitter).
-   **`scheduler` (New):** This service will run on a schedule to queue up posts that are ready to be published.

---

## Step 2: The `backend` - Scheduling the Post

The `backend`'s role is to receive the request to schedule a post and add a job to the queue. The key is that the `backend` **does not** post to Twitter directly. It only schedules the job.

### 2.1. Create a BullMQ Queue

In a new file (e.g., `queues/postQueue.ts`), define your BullMQ queue:

```typescript
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Create a new connection to Redis
const redisConnection = new IORedis({
  host: 'localhost', // Your Redis host
  port: 6379,        // Your Redis port
  maxRetriesPerRequest: null,
});

// Create a new queue
export const postQueue = new Queue('post-queue', { connection: redisConnection });
```

### 2.2. Update Your "Create Post" Endpoint

Modify your existing endpoint that handles post creation. It should now accept a `scheduledAt` timestamp.

```typescript
// In your post-creation controller/service
import { postQueue } from '../queues/postQueue';

app.post('/posts', async (req, res) => {
  const { content, scheduledAt, twitterCredentials } = req.body;

  // 1. Save the post to your database with a "scheduled" status
  const post = await db.posts.create({
    content,
    scheduledAt,
    status: 'scheduled',
  });

  // 2. Calculate the delay until the post should be published
  const delay = new Date(scheduledAt).getTime() - Date.now();

  // 3. Add a job to the queue with the calculated delay
  if (delay > 0) {
    await postQueue.add('publish-post', {
      postId: post.id,
      twitterCredentials, // Pass the necessary credentials
    }, {
      delay, // This is the key part for scheduling
      jobId: `post-${post.id}`, // Optional: a unique ID to prevent duplicates
    });
  }

  res.status(201).json(post);
});
```

**Important:** The `backend`'s responsibility ends here. It has saved the post and scheduled the job.

---

## Step 3: The `worker` - Publishing the Post

The `worker`'s only job is to listen for and process jobs from the `post-queue`.

### 3.1. Create the Worker

Create a new file for your worker (e.g., `worker.ts`):

```typescript
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { publishTweet } from '../services/twitterService'; // Your existing Twitter logic

const redisConnection = new IORedis({
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
});

// Create a new worker
const worker = new Worker('post-queue', async (job) => {
  const { postId, twitterCredentials } = job.data;

  console.log(`Processing job for post: ${postId}`);

  // 1. Fetch the post content from your database
  const post = await db.posts.find(postId);

  if (!post) {
    throw new Error(`Post ${postId} not found.`);
  }

  // 2. Use your existing logic to publish the tweet
  await publishTweet(post.content, twitterCredentials);

  // 3. Update the post's status in the database to "published"
  await db.posts.update(postId, { status: 'published' });

  console.log(`Successfully published post: ${postId}`);
}, { connection: redisConnection });

console.log('Worker started...');
```

### 3.2. Run the Worker

This worker needs to be run as a separate process:

```bash
node worker.ts
```

---

## Step 4: The `scheduler` (Optional but Recommended)

The above implementation works perfectly for scheduling posts from the `backend`. However, a dedicated `scheduler` service provides more robustness. For example, if your server restarts, the `scheduler` can ensure that any missed posts are re-queued.

This is a more advanced step, but the basic logic would be:

1.  **Create a `scheduler.ts` file.**
2.  **Use a library like `node-cron`** to run a function every minute.
3.  **In that function:**
    -   Query your database for posts that have `status: 'scheduled'` and `scheduledAt <= NOW()`.
    -   For each post found, add it to the `post-queue` with a delay of `0`.
    -   Update the post's status to `status: 'queued'`.

This ensures that even if a job is lost for some reason, the system will self-heal.

---

## Summary & Next Steps

By following these steps, you will have a robust system for scheduling posts that separates concerns and is built to scale.

1.  **Refactor:** Move your existing Twitter-posting logic into a reusable service that can be called by the `worker`.
2.  **Database:** Add `status` and `scheduledAt` columns to your `posts` table.
3.  **Run the Services:** You will now have at least two services to run: your `backend` and your `worker`.
4.  **Future Platforms:** When you add a new platform (e.g., LinkedIn), you will simply need to:
    -   Add a new job type to the queue (e.g., `publish-linkedin-post`).
    -   Update your `worker` to handle this new job type.

This architecture provides a solid foundation for building a full-featured social media scheduling application.
