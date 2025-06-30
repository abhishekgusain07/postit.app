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
-   **`worker` (New):** This service will be responsible for processing jobs from the queue (i.e., actually posting to Twitter), make it nestjs application only .
-   **`scheduler` (New):** This service will run on a schedule to queue up posts that are ready to be published, this also nestjs application.

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

---

## Schema Extensions for Scheduled Posts

Based on the Postaheap app architecture, here are the essential table additions needed for your existing Drizzle schema:

```typescript
// Add these enums for post management
export const postStateEnum = pgEnum('post_state', [
  'DRAFT',
  'QUEUE', 
  'PUBLISHED',
  'ERROR'
]);

export const mediaTypeEnum = pgEnum('media_type', [
  'IMAGE',
  'VIDEO',
  'GIF'
]);

// Posts table - core table for scheduled posts
export const posts = pgTable('posts', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  state: postStateEnum('state').default('QUEUE').notNull(),
  publishDate: timestamp('publish_date', { withTimezone: true }).notNull(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  integrationId: varchar('integration_id', { length: 36 }).notNull().references(() => integration.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  group: varchar('group', { length: 36 }).notNull(), // For grouping related posts
  title: varchar('title', { length: 255 }),
  description: text('description'),
  parentPostId: varchar('parent_post_id', { length: 36 }),
  releaseId: varchar('release_id', { length: 255 }), // Platform-specific post ID
  releaseURL: text('release_url'), // URL of published post
  settings: jsonb('settings').default('{}').notNull(), // Platform-specific settings
  image: jsonb('image').default('[]').notNull(), // Array of media IDs
  intervalInDays: integer('interval_in_days'), // For recurring posts
  error: text('error'), // Error message if posting failed
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => {
  return {
    userIdx: index('posts_user_idx').on(table.userId),
    integrationIdx: index('posts_integration_idx').on(table.integrationId),
    publishDateIdx: index('posts_publish_date_idx').on(table.publishDate),
    stateIdx: index('posts_state_idx').on(table.state),
    groupIdx: index('posts_group_idx').on(table.group),
    parentPostIdx: index('posts_parent_post_idx').on(table.parentPostId),
  };
});

// Media table - for storing uploaded images/videos
export const media = pgTable('media', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 255 }).notNull(),
  path: varchar('path', { length: 500 }).notNull(), // File path or URL
  type: mediaTypeEnum('type').notNull(),
  size: integer('size'), // File size in bytes
  width: integer('width'),
  height: integer('height'),
  duration: integer('duration'), // For videos, in seconds
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => {
  return {
    userIdx: index('media_user_idx').on(table.userId),
    typeIdx: index('media_type_idx').on(table.type),
  };
});

// Tags table - for organizing posts (optional but useful)
export const tags = pgTable('tags', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 7 }).notNull(), // Hex color code
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => {
  return {
    userIdx: index('tags_user_idx').on(table.userId),
    nameIdx: index('tags_name_idx').on(table.name),
  };
});

// Junction table for posts and tags (many-to-many)
export const postTags = pgTable('post_tags', {
  postId: varchar('post_id', { length: 36 }).notNull().references(() => posts.id, { onDelete: 'cascade' }),
  tagId: varchar('tag_id', { length: 36 }).notNull().references(() => tags.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    pk: unique('post_tags_pk').on(table.postId, table.tagId),
    postIdx: index('post_tags_post_idx').on(table.postId),
    tagIdx: index('post_tags_tag_idx').on(table.tagId),
  };
});

// Notifications table - for user notifications
export const notifications = pgTable('notifications', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  link: varchar('link', { length: 500 }), // Optional link
  read: boolean('read').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => {
  return {
    userIdx: index('notifications_user_idx').on(table.userId),
    readIdx: index('notifications_read_idx').on(table.read),
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt),
  };
});

// Job queue tracking table (optional - for monitoring BullMQ jobs)
export const jobQueue = pgTable('job_queue', {
  id: varchar('id', { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar('job_id', { length: 255 }).notNull().unique(), // BullMQ job ID
  postId: varchar('post_id', { length: 36 }).references(() => posts.id, { onDelete: 'cascade' }),
  jobType: varchar('job_type', { length: 50 }).notNull(), // 'publish_post', 'retry_post', etc.
  status: varchar('status', { length: 20 }).default('pending').notNull(), // 'pending', 'completed', 'failed'
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
  error: text('error'),
  retryCount: integer('retry_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => {
  return {
    jobIdIdx: index('job_queue_job_id_idx').on(table.jobId),
    postIdx: index('job_queue_post_idx').on(table.postId),
    statusIdx: index('job_queue_status_idx').on(table.status),
    scheduledAtIdx: index('job_queue_scheduled_at_idx').on(table.scheduledAt),
  };
});

// Define relations
export const postsRelations = relations(posts, ({ one, many }) => ({
  user: one(user, {
    fields: [posts.userId],
    references: [user.id],
  }),
  integration: one(integration, {
    fields: [posts.integrationId],
    references: [integration.id],
  }),
  parentPost: one(posts, {
    fields: [posts.parentPostId],
    references: [posts.id],
  }),
  childPosts: many(posts, {
    relationName: 'parentChild'
  }),
  postTags: many(postTags),
}));

export const mediaRelations = relations(media, ({ one }) => ({
  user: one(user, {
    fields: [media.userId],
    references: [user.id],
  }),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  user: one(user, {
    fields: [tags.userId],
    references: [user.id],
  }),
  postTags: many(postTags),
}));

export const postTagsRelations = relations(postTags, ({ one }) => ({
  post: one(posts, {
    fields: [postTags.postId],
    references: [posts.id],
  }),
  tag: one(tags, {
    fields: [postTags.tagId],
    references: [tags.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
}));

export const jobQueueRelations = relations(jobQueue, ({ one }) => ({
  post: one(posts, {
    fields: [jobQueue.postId],
    references: [posts.id],
  }),
}));
```

## Key Implementation Requirements

After adding these tables, you'll need to implement:

### 1. **Job Queue System**
```bash
npm install bullmq ioredis
```

### 2. **Worker Service** 
Create a separate worker process to handle scheduled posts:
```typescript
// worker.ts
import { Worker } from 'bullmq';
import { processScheduledPost } from './services/postService';

const worker = new Worker('post-queue', async (job) => {
  await processScheduledPost(job.data.postId);
}, { connection: redisConnection });
```

### 3. **API Endpoints**
- `POST /posts` - Create scheduled post
- `GET /posts` - List user's posts
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/reschedule` - Change schedule time

### 4. **Background Services**
- **Post Publisher**: Processes jobs from queue
- **Token Refresh**: Keeps OAuth tokens fresh
- **Cleanup**: Removes old completed jobs

### 5. **Frontend Integration**
- Calendar view for scheduled posts
- Post composer with scheduling
- Status monitoring dashboard

This schema provides the foundation for a robust social media scheduling system similar to Postiz, with proper separation of concerns and scalability built in.
