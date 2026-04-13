import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import connectDB from '../config/db.js';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Enrolment from '../models/Enrolment.js';

const seed = async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Course.deleteMany({}), Enrolment.deleteMany({})]);
  console.log('Cleared existing data.');

  const password = await bcrypt.hash('password123', 12);

  const [, instructor1, instructor2, instructor3, student1, student2] = await User.insertMany([
    { name: 'Admin User',        email: 'admin@eduflow.com',   password, role: 'admin' },
    { name: 'Alice Instructor',  email: 'alice@eduflow.com',   password, role: 'instructor', bio: 'Senior software engineer with 10 years of experience in frontend and backend development.' },
    { name: 'Bob Instructor',    email: 'bob@eduflow.com',     password, role: 'instructor', bio: 'Cloud architect and DevOps engineer. AWS & GCP certified.' },
    { name: 'Clara Instructor',  email: 'clara@eduflow.com',   password, role: 'instructor', bio: 'Data scientist and ML engineer with a background in academia and industry.' },
    { name: 'Carol Student',     email: 'carol@eduflow.com',   password, role: 'student' },
    { name: 'Dave Student',      email: 'dave@eduflow.com',    password, role: 'student' },
  ]);
  console.log('Users created.');

  // ─── FRONTEND TRACK ────────────────────────────────────────────────────────

  const frontendCourses = [
    {
      title: 'JavaScript for Beginners',
      description: 'A complete introduction to JavaScript covering variables, functions, arrays, objects, DOM manipulation, and async programming. Build three mini projects from scratch.',
      category: 'Programming', difficulty: 'beginner', price: 29.99,
      instructor: instructor1._id, status: 'published', totalStudents: 2,
      rating: { average: 4.5, count: 1 },
      lessons: [
        { title: 'Variables and Data Types',    videoUrl: 'https://example.com/js1', duration: 12, order: 1 },
        { title: 'Functions and Scope',         videoUrl: 'https://example.com/js2', duration: 15, order: 2 },
        { title: 'Arrays and Objects',          videoUrl: 'https://example.com/js3', duration: 18, order: 3 },
        { title: 'DOM Manipulation',            videoUrl: 'https://example.com/js4', duration: 20, order: 4 },
        { title: 'Promises and Async/Await',    videoUrl: 'https://example.com/js5', duration: 22, order: 5 },
        { title: 'Mini Project: Todo App',      videoUrl: 'https://example.com/js6', duration: 35, order: 6 },
      ],
    },
    {
      title: 'React 18: Build Modern UIs',
      description: 'Deep dive into React 18 with hooks, context, React Query, and performance optimisation. Build a full e-commerce product page with cart state, filters, and infinite scroll.',
      category: 'Programming', difficulty: 'intermediate', price: 49.99,
      instructor: instructor1._id, status: 'published', totalStudents: 1,
      rating: { average: 5, count: 1 },
      lessons: [
        { title: 'React Fundamentals Recap',       videoUrl: 'https://example.com/r1', duration: 10, order: 1 },
        { title: 'useState and useEffect',         videoUrl: 'https://example.com/r2', duration: 20, order: 2 },
        { title: 'useContext and useReducer',      videoUrl: 'https://example.com/r3', duration: 25, order: 3 },
        { title: 'React Query for Data Fetching',  videoUrl: 'https://example.com/r4', duration: 30, order: 4 },
        { title: 'Performance with useMemo',       videoUrl: 'https://example.com/r5', duration: 18, order: 5 },
        { title: 'Project: E-commerce Page',       videoUrl: 'https://example.com/r6', duration: 45, order: 6 },
      ],
    },
    {
      title: 'TypeScript Essentials',
      description: 'Master TypeScript from the ground up. Learn static typing, interfaces, generics, enums, decorators, and how to migrate a real JavaScript codebase to TypeScript step by step.',
      category: 'Programming', difficulty: 'intermediate', price: 44.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Why TypeScript?',                    videoUrl: 'https://example.com/ts1', duration: 10, order: 1 },
        { title: 'Types, Interfaces, and Aliases',     videoUrl: 'https://example.com/ts2', duration: 20, order: 2 },
        { title: 'Generics in Depth',                  videoUrl: 'https://example.com/ts3', duration: 22, order: 3 },
        { title: 'Enums and Literal Types',            videoUrl: 'https://example.com/ts4', duration: 15, order: 4 },
        { title: 'Decorators and Metadata',            videoUrl: 'https://example.com/ts5', duration: 18, order: 5 },
        { title: 'Migrating a JS Project to TS',       videoUrl: 'https://example.com/ts6', duration: 30, order: 6 },
      ],
    },
    {
      title: 'Next.js 14: Full-Stack React',
      description: 'Build production-grade full-stack applications with Next.js 14 App Router, Server Components, Server Actions, Suspense, and edge deployment on Vercel.',
      category: 'Programming', difficulty: 'advanced', price: 59.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'App Router Architecture',           videoUrl: 'https://example.com/nx1', duration: 18, order: 1 },
        { title: 'Server vs Client Components',       videoUrl: 'https://example.com/nx2', duration: 22, order: 2 },
        { title: 'Data Fetching Patterns',            videoUrl: 'https://example.com/nx3', duration: 25, order: 3 },
        { title: 'Server Actions & Mutations',        videoUrl: 'https://example.com/nx4', duration: 20, order: 4 },
        { title: 'Authentication with NextAuth',      videoUrl: 'https://example.com/nx5', duration: 28, order: 5 },
        { title: 'Edge Deployment on Vercel',         videoUrl: 'https://example.com/nx6', duration: 15, order: 6 },
        { title: 'Capstone: Full-Stack SaaS App',     videoUrl: 'https://example.com/nx7', duration: 55, order: 7 },
      ],
    },
    {
      title: 'Tailwind CSS Mastery',
      description: 'Go beyond utility classes. Learn Tailwind CSS design systems, custom themes, responsive layouts, dark mode, animations, and component libraries — all without writing a line of custom CSS.',
      category: 'Design', difficulty: 'beginner', price: 29.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Utility-First Fundamentals',       videoUrl: 'https://example.com/tw1', duration: 12, order: 1 },
        { title: 'Responsive Design with Tailwind',  videoUrl: 'https://example.com/tw2', duration: 18, order: 2 },
        { title: 'Custom Themes and Design Tokens',  videoUrl: 'https://example.com/tw3', duration: 20, order: 3 },
        { title: 'Dark Mode and Variants',           videoUrl: 'https://example.com/tw4', duration: 15, order: 4 },
        { title: 'Animations and Transitions',       videoUrl: 'https://example.com/tw5', duration: 16, order: 5 },
        { title: 'Building a Component Library',     videoUrl: 'https://example.com/tw6', duration: 35, order: 6 },
      ],
    },
    {
      title: 'Vue.js 3 Fundamentals',
      description: 'Learn Vue.js 3 with the Composition API, Pinia state management, Vue Router, and Vite. Build a weather dashboard and a task management app as capstone projects.',
      category: 'Programming', difficulty: 'beginner', price: 34.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Vue 3 and the Options API',        videoUrl: 'https://example.com/vue1', duration: 14, order: 1 },
        { title: 'Composition API Deep Dive',        videoUrl: 'https://example.com/vue2', duration: 22, order: 2 },
        { title: 'Pinia State Management',           videoUrl: 'https://example.com/vue3', duration: 20, order: 3 },
        { title: 'Vue Router 4',                     videoUrl: 'https://example.com/vue4', duration: 16, order: 4 },
        { title: 'Async Components & Lazy Loading',  videoUrl: 'https://example.com/vue5', duration: 14, order: 5 },
        { title: 'Capstone: Weather Dashboard',      videoUrl: 'https://example.com/vue6', duration: 40, order: 6 },
      ],
    },
    {
      title: 'Advanced CSS & Animations',
      description: 'A deep dive into modern CSS: Grid, Subgrid, Container Queries, scroll-driven animations, CSS custom properties, and rendering performance. No JavaScript required.',
      category: 'Design', difficulty: 'intermediate', price: 39.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'CSS Grid & Subgrid',               videoUrl: 'https://example.com/css1', duration: 22, order: 1 },
        { title: 'Container Queries',                videoUrl: 'https://example.com/css2', duration: 16, order: 2 },
        { title: 'CSS Custom Properties',            videoUrl: 'https://example.com/css3', duration: 18, order: 3 },
        { title: 'Keyframe & Scroll Animations',     videoUrl: 'https://example.com/css4', duration: 24, order: 4 },
        { title: 'View Transitions API',             videoUrl: 'https://example.com/css5', duration: 14, order: 5 },
        { title: 'Performance & Paint Profiling',    videoUrl: 'https://example.com/css6', duration: 18, order: 6 },
      ],
    },
    {
      title: 'Testing React Apps with Vitest',
      description: 'Write rock-solid React tests using Vitest, Testing Library, and Playwright. Covers unit tests, component tests, integration tests, mocking, and CI integration.',
      category: 'Programming', difficulty: 'intermediate', price: 39.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Why Testing Matters',              videoUrl: 'https://example.com/tst1', duration: 10, order: 1 },
        { title: 'Vitest Setup and Fundamentals',    videoUrl: 'https://example.com/tst2', duration: 18, order: 2 },
        { title: 'Testing Library Queries',          videoUrl: 'https://example.com/tst3', duration: 20, order: 3 },
        { title: 'Mocking APIs and Modules',         videoUrl: 'https://example.com/tst4', duration: 22, order: 4 },
        { title: 'Playwright E2E Tests',             videoUrl: 'https://example.com/tst5', duration: 25, order: 5 },
        { title: 'Coverage and CI Integration',      videoUrl: 'https://example.com/tst6', duration: 15, order: 6 },
      ],
    },
  ];

  // ─── BACKEND TRACK ─────────────────────────────────────────────────────────

  const backendCourses = [
    {
      title: 'Node.js & Express API Design',
      description: 'Build scalable REST APIs with Node.js, Express, and MongoDB. Covers JWT authentication, role-based access control, file uploads, rate limiting, and API versioning.',
      category: 'Programming', difficulty: 'intermediate', price: 49.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Express App Architecture',         videoUrl: 'https://example.com/be1', duration: 16, order: 1 },
        { title: 'REST Conventions and Design',      videoUrl: 'https://example.com/be2', duration: 18, order: 2 },
        { title: 'JWT Auth and Middleware',          videoUrl: 'https://example.com/be3', duration: 24, order: 3 },
        { title: 'File Uploads with Multer',         videoUrl: 'https://example.com/be4', duration: 20, order: 4 },
        { title: 'Rate Limiting and Security',       videoUrl: 'https://example.com/be5', duration: 16, order: 5 },
        { title: 'API Versioning Strategies',        videoUrl: 'https://example.com/be6', duration: 14, order: 6 },
        { title: 'Project: Full REST API',           videoUrl: 'https://example.com/be7', duration: 50, order: 7 },
      ],
    },
    {
      title: 'PostgreSQL for Developers',
      description: 'Go from SQL basics to advanced PostgreSQL: window functions, CTEs, indexing strategies, JSONB documents, full-text search, and query plan analysis with EXPLAIN.',
      category: 'Programming', difficulty: 'intermediate', price: 44.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'SQL Foundations',                  videoUrl: 'https://example.com/pg1', duration: 20, order: 1 },
        { title: 'Joins, Subqueries, and CTEs',      videoUrl: 'https://example.com/pg2', duration: 22, order: 2 },
        { title: 'Window Functions',                 videoUrl: 'https://example.com/pg3', duration: 20, order: 3 },
        { title: 'Indexing and Query Planning',      videoUrl: 'https://example.com/pg4', duration: 24, order: 4 },
        { title: 'JSONB and Full-Text Search',       videoUrl: 'https://example.com/pg5', duration: 18, order: 5 },
        { title: 'Transactions and Locking',         videoUrl: 'https://example.com/pg6', duration: 16, order: 6 },
      ],
    },
    {
      title: 'GraphQL with Apollo Server',
      description: 'Learn GraphQL schema design, resolvers, mutations, subscriptions, DataLoader batching, and Apollo Client integration. Replace over-fetching REST endpoints with a single flexible API.',
      category: 'Programming', difficulty: 'intermediate', price: 49.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'GraphQL vs REST',                  videoUrl: 'https://example.com/gql1', duration: 12, order: 1 },
        { title: 'Schema Definition Language',       videoUrl: 'https://example.com/gql2', duration: 18, order: 2 },
        { title: 'Resolvers and Context',            videoUrl: 'https://example.com/gql3', duration: 20, order: 3 },
        { title: 'Mutations and Input Types',        videoUrl: 'https://example.com/gql4', duration: 16, order: 4 },
        { title: 'DataLoader and N+1 Problem',       videoUrl: 'https://example.com/gql5', duration: 22, order: 5 },
        { title: 'Subscriptions with WebSockets',    videoUrl: 'https://example.com/gql6', duration: 20, order: 6 },
        { title: 'Apollo Client Integration',        videoUrl: 'https://example.com/gql7', duration: 28, order: 7 },
      ],
    },
    {
      title: 'Python FastAPI Bootcamp',
      description: 'Build high-performance Python APIs with FastAPI, Pydantic, SQLAlchemy, async I/O, OAuth2, background tasks, and auto-generated OpenAPI docs. Deploy to Docker and Railway.',
      category: 'Programming', difficulty: 'intermediate', price: 49.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'FastAPI Project Setup',            videoUrl: 'https://example.com/fa1', duration: 14, order: 1 },
        { title: 'Pydantic Models and Validation',   videoUrl: 'https://example.com/fa2', duration: 18, order: 2 },
        { title: 'Async Routes and Dependencies',    videoUrl: 'https://example.com/fa3', duration: 22, order: 3 },
        { title: 'SQLAlchemy ORM Integration',       videoUrl: 'https://example.com/fa4', duration: 24, order: 4 },
        { title: 'OAuth2 and JWT Security',          videoUrl: 'https://example.com/fa5', duration: 20, order: 5 },
        { title: 'Background Tasks and Celery',      videoUrl: 'https://example.com/fa6', duration: 16, order: 6 },
        { title: 'Deploying to Docker + Railway',    videoUrl: 'https://example.com/fa7', duration: 18, order: 7 },
      ],
    },
    {
      title: 'Redis: Caching and Data Structures',
      description: 'Master Redis beyond simple key-value caching. Learn sorted sets, pub/sub, streams, Lua scripting, Redis Search, and distributed locks for high-throughput backend systems.',
      category: 'Programming', difficulty: 'advanced', price: 54.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Redis Data Types Overview',        videoUrl: 'https://example.com/rd1', duration: 14, order: 1 },
        { title: 'Caching Strategies (LRU, TTL)',    videoUrl: 'https://example.com/rd2', duration: 18, order: 2 },
        { title: 'Sorted Sets and Leaderboards',     videoUrl: 'https://example.com/rd3', duration: 20, order: 3 },
        { title: 'Pub/Sub and Redis Streams',        videoUrl: 'https://example.com/rd4', duration: 22, order: 4 },
        { title: 'Distributed Locks with Redis',     videoUrl: 'https://example.com/rd5', duration: 16, order: 5 },
        { title: 'Redis Search Full-Text Index',     videoUrl: 'https://example.com/rd6', duration: 20, order: 6 },
      ],
    },
    {
      title: 'Microservices with Node.js and RabbitMQ',
      description: 'Decompose a monolith into microservices. Learn service discovery, async messaging with RabbitMQ, the saga pattern, distributed tracing with OpenTelemetry, and API gateways.',
      category: 'Programming', difficulty: 'advanced', price: 64.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Microservices Architecture Primer', videoUrl: 'https://example.com/ms1', duration: 16, order: 1 },
        { title: 'RabbitMQ Exchanges and Queues',     videoUrl: 'https://example.com/ms2', duration: 24, order: 2 },
        { title: 'The Saga Pattern',                  videoUrl: 'https://example.com/ms3', duration: 20, order: 3 },
        { title: 'API Gateway with Express',          videoUrl: 'https://example.com/ms4', duration: 18, order: 4 },
        { title: 'Distributed Tracing (OTEL)',        videoUrl: 'https://example.com/ms5', duration: 22, order: 5 },
        { title: 'Service Mesh with Envoy',           videoUrl: 'https://example.com/ms6', duration: 20, order: 6 },
        { title: 'Capstone: Decompose an App',        videoUrl: 'https://example.com/ms7', duration: 60, order: 7 },
      ],
    },
  ];

  // ─── CLOUD TRACK ────────────────────────────────────────────────────────────

  const cloudCourses = [
    {
      title: 'AWS Solutions Architect Essentials',
      description: 'Prepare for the AWS Solutions Architect Associate exam. Covers EC2, S3, RDS, VPC, IAM, Lambda, CloudFront, Route 53, and Well-Architected Framework principles.',
      category: 'Other', difficulty: 'intermediate', price: 69.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'AWS Global Infrastructure',       videoUrl: 'https://example.com/aws1', duration: 14, order: 1 },
        { title: 'IAM Roles, Policies, MFA',        videoUrl: 'https://example.com/aws2', duration: 20, order: 2 },
        { title: 'EC2, Auto Scaling, and ELB',      videoUrl: 'https://example.com/aws3', duration: 26, order: 3 },
        { title: 'S3, Glacier, and Lifecycle',      videoUrl: 'https://example.com/aws4', duration: 18, order: 4 },
        { title: 'RDS, Aurora, and DynamoDB',       videoUrl: 'https://example.com/aws5', duration: 22, order: 5 },
        { title: 'VPC, Subnets, and Security Groups',videoUrl: 'https://example.com/aws6', duration: 24, order: 6 },
        { title: 'Serverless: Lambda and API GW',   videoUrl: 'https://example.com/aws7', duration: 20, order: 7 },
        { title: 'CloudFront and Route 53',         videoUrl: 'https://example.com/aws8', duration: 16, order: 8 },
      ],
    },
    {
      title: 'Docker & Kubernetes Fundamentals',
      description: 'Container your applications with Docker, then orchestrate them at scale with Kubernetes. Learn Deployments, Services, ConfigMaps, Secrets, Helm charts, and production best practices.',
      category: 'Other', difficulty: 'intermediate', price: 59.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Docker Images and Containers',     videoUrl: 'https://example.com/dk1', duration: 18, order: 1 },
        { title: 'Dockerfile Best Practices',        videoUrl: 'https://example.com/dk2', duration: 16, order: 2 },
        { title: 'Docker Compose for Local Dev',     videoUrl: 'https://example.com/dk3', duration: 20, order: 3 },
        { title: 'Kubernetes Architecture',          videoUrl: 'https://example.com/dk4', duration: 22, order: 4 },
        { title: 'Deployments and Services',         videoUrl: 'https://example.com/dk5', duration: 24, order: 5 },
        { title: 'ConfigMaps, Secrets, and Volumes', videoUrl: 'https://example.com/dk6', duration: 20, order: 6 },
        { title: 'Helm Charts',                      videoUrl: 'https://example.com/dk7', duration: 18, order: 7 },
        { title: 'Ingress and TLS Termination',      videoUrl: 'https://example.com/dk8', duration: 16, order: 8 },
      ],
    },
    {
      title: 'CI/CD with GitHub Actions',
      description: 'Automate your entire software delivery pipeline with GitHub Actions. Build, test, lint, containerise, and deploy to Kubernetes on every push — with environments, approvals, and secrets.',
      category: 'Other', difficulty: 'intermediate', price: 44.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Workflows, Jobs, and Steps',       videoUrl: 'https://example.com/ci1', duration: 14, order: 1 },
        { title: 'Triggers: push, PR, schedule',     videoUrl: 'https://example.com/ci2', duration: 12, order: 2 },
        { title: 'Secrets and Environment Variables',videoUrl: 'https://example.com/ci3', duration: 14, order: 3 },
        { title: 'Matrix Builds and Caching',        videoUrl: 'https://example.com/ci4', duration: 16, order: 4 },
        { title: 'Publishing Docker Images',         videoUrl: 'https://example.com/ci5', duration: 18, order: 5 },
        { title: 'Deploy to Kubernetes (EKS/GKE)',   videoUrl: 'https://example.com/ci6', duration: 22, order: 6 },
        { title: 'Reusable Workflows and Actions',   videoUrl: 'https://example.com/ci7', duration: 16, order: 7 },
      ],
    },
    {
      title: 'Terraform: Infrastructure as Code',
      description: 'Provision and manage cloud infrastructure on AWS, Azure, and GCP using Terraform. Learn HCL syntax, modules, remote state, workspaces, and the full Terraform workflow.',
      category: 'Other', difficulty: 'intermediate', price: 59.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'HCL Syntax and Providers',         videoUrl: 'https://example.com/tf1', duration: 16, order: 1 },
        { title: 'Resources, Variables, and Outputs', videoUrl: 'https://example.com/tf2', duration: 18, order: 2 },
        { title: 'State Management and Remote State', videoUrl: 'https://example.com/tf3', duration: 20, order: 3 },
        { title: 'Modules and Reusability',           videoUrl: 'https://example.com/tf4', duration: 22, order: 4 },
        { title: 'Workspaces and Environments',       videoUrl: 'https://example.com/tf5', duration: 16, order: 5 },
        { title: 'Provisioning an EKS Cluster',       videoUrl: 'https://example.com/tf6', duration: 30, order: 6 },
      ],
    },
    {
      title: 'Azure for Developers',
      description: 'Accelerate cloud-native development on Azure. Learn App Service, Azure Functions, Cosmos DB, Azure DevOps Pipelines, Key Vault, and managed identities — no ops background required.',
      category: 'Other', difficulty: 'beginner', price: 54.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Azure Portal and CLI Basics',      videoUrl: 'https://example.com/az1', duration: 14, order: 1 },
        { title: 'App Service and Deployment Slots', videoUrl: 'https://example.com/az2', duration: 18, order: 2 },
        { title: 'Azure Functions and Triggers',     videoUrl: 'https://example.com/az3', duration: 20, order: 3 },
        { title: 'Cosmos DB Multi-Model API',        videoUrl: 'https://example.com/az4', duration: 22, order: 4 },
        { title: 'Key Vault and Managed Identity',   videoUrl: 'https://example.com/az5', duration: 16, order: 5 },
        { title: 'Azure DevOps Pipelines',           videoUrl: 'https://example.com/az6', duration: 24, order: 6 },
      ],
    },
  ];

  // ─── DATA SCIENCE TRACK ─────────────────────────────────────────────────────

  const dataCourses = [
    {
      title: 'UX Design Fundamentals',
      description: 'Learn the core principles of UX design including user research, wireframing, prototyping, usability testing, and accessibility. Includes hands-on Figma exercises.',
      category: 'Design', difficulty: 'beginner', price: 39.99,
      instructor: instructor2._id, status: 'published', totalStudents: 1,
      rating: { average: 4, count: 1 },
      lessons: [
        { title: 'What is UX Design?',               videoUrl: 'https://example.com/ux1', duration: 8,  order: 1 },
        { title: 'User Research Methods',            videoUrl: 'https://example.com/ux2', duration: 20, order: 2 },
        { title: 'Wireframing in Figma',             videoUrl: 'https://example.com/ux3', duration: 25, order: 3 },
        { title: 'Prototyping and Testing',          videoUrl: 'https://example.com/ux4', duration: 22, order: 4 },
        { title: 'Accessibility Best Practices',     videoUrl: 'https://example.com/ux5', duration: 15, order: 5 },
      ],
    },
    {
      title: 'Data Science with Python',
      description: 'Practical data science using Python, pandas, matplotlib, and scikit-learn. Analyse real datasets, build visualisations, and train your first machine learning models.',
      category: 'Data Science', difficulty: 'intermediate', price: 59.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Python for Data Science',          videoUrl: 'https://example.com/ds1', duration: 15, order: 1 },
        { title: 'pandas DataFrames',                videoUrl: 'https://example.com/ds2', duration: 25, order: 2 },
        { title: 'Data Visualisation',               videoUrl: 'https://example.com/ds3', duration: 20, order: 3 },
        { title: 'Intro to Machine Learning',        videoUrl: 'https://example.com/ds4', duration: 30, order: 4 },
        { title: 'Model Evaluation',                 videoUrl: 'https://example.com/ds5', duration: 20, order: 5 },
        { title: 'Capstone Project',                 videoUrl: 'https://example.com/ds6', duration: 40, order: 6 },
      ],
    },
    {
      title: 'SQL Mastery: From Basics to Analytics',
      description: 'Master SQL from SELECT fundamentals to advanced analytical queries. Covers joins, aggregations, window functions, CTEs, query optimisation, and building BI dashboards with real datasets.',
      category: 'Data Science', difficulty: 'beginner', price: 39.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'SELECT, WHERE, and ORDER BY',      videoUrl: 'https://example.com/sql1', duration: 14, order: 1 },
        { title: 'JOINs: INNER, LEFT, FULL',         videoUrl: 'https://example.com/sql2', duration: 18, order: 2 },
        { title: 'GROUP BY and Aggregations',        videoUrl: 'https://example.com/sql3', duration: 16, order: 3 },
        { title: 'Subqueries and CTEs',              videoUrl: 'https://example.com/sql4', duration: 20, order: 4 },
        { title: 'Window Functions for Analytics',   videoUrl: 'https://example.com/sql5', duration: 22, order: 5 },
        { title: 'Indexes and Performance',          videoUrl: 'https://example.com/sql6', duration: 18, order: 6 },
        { title: 'Project: Sales Analytics Report',  videoUrl: 'https://example.com/sql7', duration: 35, order: 7 },
      ],
    },
    {
      title: 'Machine Learning with PyTorch',
      description: 'Build and train neural networks from scratch using PyTorch. Covers tensors, autograd, CNNs, RNNs, transfer learning, and deployment with TorchScript and ONNX.',
      category: 'Data Science', difficulty: 'advanced', price: 74.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Tensors and Autograd',             videoUrl: 'https://example.com/pt1', duration: 18, order: 1 },
        { title: 'Building Neural Networks (nn.Module)', videoUrl: 'https://example.com/pt2', duration: 24, order: 2 },
        { title: 'Convolutional Neural Networks',    videoUrl: 'https://example.com/pt3', duration: 28, order: 3 },
        { title: 'Recurrent Networks and LSTMs',     videoUrl: 'https://example.com/pt4', duration: 26, order: 4 },
        { title: 'Transfer Learning with ResNet',    videoUrl: 'https://example.com/pt5', duration: 22, order: 5 },
        { title: 'Model Export: TorchScript & ONNX', videoUrl: 'https://example.com/pt6', duration: 18, order: 6 },
        { title: 'Capstone: Image Classifier',       videoUrl: 'https://example.com/pt7', duration: 50, order: 7 },
      ],
    },
    {
      title: 'Data Engineering with dbt and Airflow',
      description: 'Build reliable data pipelines using dbt for transformation and Apache Airflow for orchestration. Learn data modelling, incremental loads, testing, and the modern data stack.',
      category: 'Data Science', difficulty: 'advanced', price: 69.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Modern Data Stack Overview',       videoUrl: 'https://example.com/de1', duration: 14, order: 1 },
        { title: 'dbt Models and Materializations',  videoUrl: 'https://example.com/de2', duration: 22, order: 2 },
        { title: 'dbt Tests and Documentation',      videoUrl: 'https://example.com/de3', duration: 18, order: 3 },
        { title: 'Incremental Models',               videoUrl: 'https://example.com/de4', duration: 20, order: 4 },
        { title: 'Airflow DAGs and Operators',       videoUrl: 'https://example.com/de5', duration: 24, order: 5 },
        { title: 'Scheduling and Backfills',         videoUrl: 'https://example.com/de6', duration: 16, order: 6 },
        { title: 'Pipeline: Warehouse to Dashboard', videoUrl: 'https://example.com/de7', duration: 40, order: 7 },
      ],
    },
    {
      title: 'NLP Fundamentals with Transformers',
      description: 'Go from bag-of-words to large language models. Learn tokenisation, embeddings, attention, fine-tuning BERT and GPT-2 with Hugging Face Transformers, and building a semantic search engine.',
      category: 'Data Science', difficulty: 'advanced', price: 79.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'NLP Pipeline Overview',            videoUrl: 'https://example.com/nlp1', duration: 14, order: 1 },
        { title: 'Tokenisation and Embeddings',      videoUrl: 'https://example.com/nlp2', duration: 18, order: 2 },
        { title: 'Attention and Transformers',       videoUrl: 'https://example.com/nlp3', duration: 26, order: 3 },
        { title: 'Fine-Tuning BERT for Classification', videoUrl: 'https://example.com/nlp4', duration: 28, order: 4 },
        { title: 'Text Generation with GPT-2',       videoUrl: 'https://example.com/nlp5', duration: 22, order: 5 },
        { title: 'Semantic Search with FAISS',       videoUrl: 'https://example.com/nlp6', duration: 24, order: 6 },
        { title: 'Capstone: Sentiment Dashboard',    videoUrl: 'https://example.com/nlp7', duration: 45, order: 7 },
      ],
    },
    {
      title: 'Power BI: Data Visualisation & Dashboards',
      description: 'Turn raw data into compelling interactive dashboards with Microsoft Power BI. Covers data modelling, DAX measures, Power Query, and embedding reports in web applications.',
      category: 'Data Science', difficulty: 'beginner', price: 34.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Power BI Desktop Tour',            videoUrl: 'https://example.com/pbi1', duration: 12, order: 1 },
        { title: 'Importing and Transforming Data',  videoUrl: 'https://example.com/pbi2', duration: 18, order: 2 },
        { title: 'Data Modelling and Relationships', videoUrl: 'https://example.com/pbi3', duration: 20, order: 3 },
        { title: 'DAX Fundamentals',                 videoUrl: 'https://example.com/pbi4', duration: 24, order: 4 },
        { title: 'Building Interactive Reports',     videoUrl: 'https://example.com/pbi5', duration: 22, order: 5 },
        { title: 'Publishing and Embedding',         videoUrl: 'https://example.com/pbi6', duration: 14, order: 6 },
      ],
    },
    {
      title: 'Digital Marketing Strategy',
      description: 'Master SEO, content marketing, email campaigns, and paid ads. Build and measure a full-funnel marketing strategy for a digital product.',
      category: 'Marketing', difficulty: 'beginner', price: 34.99,
      instructor: instructor2._id, status: 'draft', totalStudents: 0,
      lessons: [
        { title: 'Marketing Fundamentals',           videoUrl: 'https://example.com/mkt1', duration: 10, order: 1 },
        { title: 'SEO Basics',                       videoUrl: 'https://example.com/mkt2', duration: 18, order: 2 },
        { title: 'Email Campaign Strategy',          videoUrl: 'https://example.com/mkt3', duration: 20, order: 3 },
      ],
    },
  ];

  // ─── BUSINESS TRACK ─────────────────────────────────────────────────────────

  const businessCourses = [
    {
      title: 'Project Management Essentials',
      description: 'Master the fundamentals of project management using proven frameworks. Learn scope definition, scheduling, risk management, stakeholder communication, and how to deliver projects on time and on budget.',
      category: 'Business', difficulty: 'beginner', price: 39.99,
      instructor: instructor2._id, status: 'published', totalStudents: 3,
      rating: { average: 4.6, count: 3 },
      lessons: [
        { title: 'Project Lifecycle Overview',        videoUrl: 'https://example.com/pm1', duration: 14, order: 1 },
        { title: 'Scope and Requirements',            videoUrl: 'https://example.com/pm2', duration: 18, order: 2 },
        { title: 'Scheduling with Gantt Charts',      videoUrl: 'https://example.com/pm3', duration: 20, order: 3 },
        { title: 'Risk Management',                   videoUrl: 'https://example.com/pm4', duration: 16, order: 4 },
        { title: 'Stakeholder Communication',         videoUrl: 'https://example.com/pm5', duration: 14, order: 5 },
        { title: 'Capstone: Plan a Real Project',     videoUrl: 'https://example.com/pm6', duration: 35, order: 6 },
      ],
    },
    {
      title: 'Agile & Scrum Masterclass',
      description: 'Go beyond the Scrum Guide. Learn sprint planning, backlog refinement, velocity, retrospectives, and how to scale agile with SAFe. Prepare for the PSM I certification exam.',
      category: 'Business', difficulty: 'intermediate', price: 49.99,
      instructor: instructor2._id, status: 'published', totalStudents: 2,
      rating: { average: 4.8, count: 2 },
      lessons: [
        { title: 'Agile Manifesto & Values',          videoUrl: 'https://example.com/ag1', duration: 10, order: 1 },
        { title: 'Scrum Roles and Artifacts',         videoUrl: 'https://example.com/ag2', duration: 18, order: 2 },
        { title: 'Sprint Planning & Estimation',      videoUrl: 'https://example.com/ag3', duration: 22, order: 3 },
        { title: 'Running Retrospectives',            videoUrl: 'https://example.com/ag4', duration: 16, order: 4 },
        { title: 'Kanban and Scrumban',               videoUrl: 'https://example.com/ag5', duration: 18, order: 5 },
        { title: 'Scaling with SAFe',                 videoUrl: 'https://example.com/ag6', duration: 24, order: 6 },
      ],
    },
    {
      title: 'Financial Modelling in Excel',
      description: 'Build professional three-statement financial models from scratch. Learn DCF valuation, scenario analysis, sensitivity tables, and how to present your model to investors.',
      category: 'Business', difficulty: 'intermediate', price: 59.99,
      instructor: instructor2._id, status: 'published', totalStudents: 1,
      lessons: [
        { title: 'Excel Best Practices',              videoUrl: 'https://example.com/fm1', duration: 12, order: 1 },
        { title: 'Income Statement Modelling',        videoUrl: 'https://example.com/fm2', duration: 20, order: 2 },
        { title: 'Balance Sheet & Cash Flow',         videoUrl: 'https://example.com/fm3', duration: 22, order: 3 },
        { title: 'DCF Valuation',                     videoUrl: 'https://example.com/fm4', duration: 26, order: 4 },
        { title: 'Scenario & Sensitivity Analysis',   videoUrl: 'https://example.com/fm5', duration: 20, order: 5 },
        { title: 'Investor Presentation',             videoUrl: 'https://example.com/fm6', duration: 16, order: 6 },
      ],
    },
    {
      title: 'Entrepreneurship & Lean Startup',
      description: 'Launch your startup idea with confidence. Learn customer discovery, MVP development, product-market fit validation, and how to pitch to early-stage investors using the Lean Startup framework.',
      category: 'Business', difficulty: 'beginner', price: 34.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'The Lean Startup Method',           videoUrl: 'https://example.com/ls1', duration: 12, order: 1 },
        { title: 'Customer Discovery Interviews',     videoUrl: 'https://example.com/ls2', duration: 18, order: 2 },
        { title: 'Building an MVP',                   videoUrl: 'https://example.com/ls3', duration: 22, order: 3 },
        { title: 'Measuring Product-Market Fit',      videoUrl: 'https://example.com/ls4', duration: 16, order: 4 },
        { title: 'Pitch Deck Creation',               videoUrl: 'https://example.com/ls5', duration: 20, order: 5 },
      ],
    },
    {
      title: 'Product Management Fundamentals',
      description: 'Learn the end-to-end product management process: discovery, roadmapping, prioritisation with RICE and MoSCoW, metrics, and cross-functional collaboration with engineering and design.',
      category: 'Business', difficulty: 'intermediate', price: 54.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Role of the Product Manager',       videoUrl: 'https://example.com/pdm1', duration: 12, order: 1 },
        { title: 'Product Discovery & Research',      videoUrl: 'https://example.com/pdm2', duration: 20, order: 2 },
        { title: 'Writing User Stories & PRDs',       videoUrl: 'https://example.com/pdm3', duration: 18, order: 3 },
        { title: 'Prioritisation Frameworks',         videoUrl: 'https://example.com/pdm4', duration: 16, order: 4 },
        { title: 'Metrics and OKRs',                  videoUrl: 'https://example.com/pdm5', duration: 20, order: 5 },
        { title: 'Working with Engineering',          videoUrl: 'https://example.com/pdm6', duration: 16, order: 6 },
      ],
    },
    {
      title: 'Leadership & Team Management',
      description: 'Develop essential leadership skills: giving effective feedback, running one-on-ones, building psychological safety, managing conflict, and coaching high-performing teams.',
      category: 'Business', difficulty: 'intermediate', price: 44.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Leadership Styles',                 videoUrl: 'https://example.com/ldr1', duration: 14, order: 1 },
        { title: 'Giving and Receiving Feedback',     videoUrl: 'https://example.com/ldr2', duration: 18, order: 2 },
        { title: 'Running 1-on-1s',                   videoUrl: 'https://example.com/ldr3', duration: 16, order: 3 },
        { title: 'Psychological Safety',              videoUrl: 'https://example.com/ldr4', duration: 14, order: 4 },
        { title: 'Conflict Resolution',               videoUrl: 'https://example.com/ldr5', duration: 18, order: 5 },
        { title: 'Coaching for Performance',          videoUrl: 'https://example.com/ldr6', duration: 20, order: 6 },
      ],
    },
    {
      title: 'Business Communication & Presentations',
      description: 'Communicate with impact: write clear business emails, craft executive memos, design compelling slide decks, and deliver confident presentations to stakeholders at any level.',
      category: 'Business', difficulty: 'beginner', price: 29.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Pyramid Principle Writing',         videoUrl: 'https://example.com/bc1', duration: 14, order: 1 },
        { title: 'Business Email Etiquette',          videoUrl: 'https://example.com/bc2', duration: 10, order: 2 },
        { title: 'Slide Design Principles',           videoUrl: 'https://example.com/bc3', duration: 18, order: 3 },
        { title: 'Storytelling with Data',            videoUrl: 'https://example.com/bc4', duration: 20, order: 4 },
        { title: 'Public Speaking Confidence',        videoUrl: 'https://example.com/bc5', duration: 16, order: 5 },
      ],
    },
    {
      title: 'Corporate Finance & Valuation',
      description: 'Understand how companies are valued and financed. Learn capital structure, cost of capital (WACC), M&A deal structures, LBO modelling, and how financial decisions drive shareholder value.',
      category: 'Business', difficulty: 'advanced', price: 74.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Time Value of Money',               videoUrl: 'https://example.com/cf1', duration: 16, order: 1 },
        { title: 'Capital Structure & WACC',          videoUrl: 'https://example.com/cf2', duration: 22, order: 2 },
        { title: 'Comparable Company Analysis',       videoUrl: 'https://example.com/cf3', duration: 20, order: 3 },
        { title: 'M&A Deal Structures',               videoUrl: 'https://example.com/cf4', duration: 24, order: 4 },
        { title: 'LBO Modelling',                     videoUrl: 'https://example.com/cf5', duration: 28, order: 5 },
        { title: 'Case Study: Tech Acquisition',      videoUrl: 'https://example.com/cf6', duration: 35, order: 6 },
      ],
    },
    {
      title: 'Supply Chain & Operations Management',
      description: 'Learn how global supply chains work, from procurement and inventory management to logistics, demand forecasting, and lean operations. Includes case studies from manufacturing and e-commerce.',
      category: 'Business', difficulty: 'intermediate', price: 49.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Supply Chain Fundamentals',         videoUrl: 'https://example.com/sc1', duration: 14, order: 1 },
        { title: 'Inventory Management (EOQ, JIT)',   videoUrl: 'https://example.com/sc2', duration: 18, order: 2 },
        { title: 'Demand Forecasting',                videoUrl: 'https://example.com/sc3', duration: 20, order: 3 },
        { title: 'Procurement & Vendor Relations',    videoUrl: 'https://example.com/sc4', duration: 16, order: 4 },
        { title: 'Lean & Six Sigma Basics',           videoUrl: 'https://example.com/sc5', duration: 18, order: 5 },
        { title: 'Case Study: Amazon Fulfilment',     videoUrl: 'https://example.com/sc6', duration: 25, order: 6 },
      ],
    },
    {
      title: 'Business Analytics with Python',
      description: 'Apply Python to real business problems: sales forecasting, churn prediction, customer segmentation, and cohort analysis. Bridges the gap between data science and business strategy.',
      category: 'Business', difficulty: 'intermediate', price: 54.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Python for Business Analysts',      videoUrl: 'https://example.com/ba1', duration: 14, order: 1 },
        { title: 'Sales Forecasting with pandas',     videoUrl: 'https://example.com/ba2', duration: 22, order: 2 },
        { title: 'Customer Segmentation (K-Means)',   videoUrl: 'https://example.com/ba3', duration: 20, order: 3 },
        { title: 'Churn Prediction Model',            videoUrl: 'https://example.com/ba4', duration: 24, order: 4 },
        { title: 'Cohort Analysis',                   videoUrl: 'https://example.com/ba5', duration: 18, order: 5 },
        { title: 'Dashboard with Plotly Dash',        videoUrl: 'https://example.com/ba6', duration: 22, order: 6 },
      ],
    },
  ];

  // ─── MARKETING TRACK ────────────────────────────────────────────────────────

  const marketingCourses = [
    {
      title: 'Social Media Marketing Mastery',
      description: 'Build and grow your brand on Instagram, LinkedIn, TikTok, and X. Learn content calendars, hashtag strategy, community management, and how to measure engagement and ROI.',
      category: 'Marketing', difficulty: 'beginner', price: 29.99,
      instructor: instructor2._id, status: 'published', totalStudents: 2,
      rating: { average: 4.3, count: 2 },
      lessons: [
        { title: 'Social Media Strategy Basics',     videoUrl: 'https://example.com/smm1', duration: 10, order: 1 },
        { title: 'Instagram and TikTok Growth',      videoUrl: 'https://example.com/smm2', duration: 18, order: 2 },
        { title: 'LinkedIn for B2B',                 videoUrl: 'https://example.com/smm3', duration: 16, order: 3 },
        { title: 'Content Calendar Planning',        videoUrl: 'https://example.com/smm4', duration: 14, order: 4 },
        { title: 'Analytics and Reporting',          videoUrl: 'https://example.com/smm5', duration: 16, order: 5 },
      ],
    },
    {
      title: 'Google Ads & PPC Mastery',
      description: 'Run profitable Google Search, Display, Shopping, and Performance Max campaigns. Learn keyword research, Quality Score optimisation, bid strategies, conversion tracking, and ROAS analysis.',
      category: 'Marketing', difficulty: 'intermediate', price: 54.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Google Ads Account Structure',     videoUrl: 'https://example.com/gads1', duration: 14, order: 1 },
        { title: 'Keyword Research & Match Types',   videoUrl: 'https://example.com/gads2', duration: 18, order: 2 },
        { title: 'Ad Copywriting & Extensions',      videoUrl: 'https://example.com/gads3', duration: 16, order: 3 },
        { title: 'Bid Strategies & Smart Bidding',   videoUrl: 'https://example.com/gads4', duration: 20, order: 4 },
        { title: 'Conversion Tracking (GA4)',        videoUrl: 'https://example.com/gads5', duration: 18, order: 5 },
        { title: 'Campaign Optimisation & ROAS',     videoUrl: 'https://example.com/gads6', duration: 22, order: 6 },
      ],
    },
    {
      title: 'Content Marketing & SEO',
      description: 'Create content that ranks and converts. Learn keyword research, on-page SEO, content clusters, link building, and how to measure organic traffic growth using Google Search Console and Ahrefs.',
      category: 'Marketing', difficulty: 'beginner', price: 39.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'SEO Fundamentals',                 videoUrl: 'https://example.com/seo1', duration: 14, order: 1 },
        { title: 'Keyword Research with Ahrefs',     videoUrl: 'https://example.com/seo2', duration: 20, order: 2 },
        { title: 'On-Page SEO Best Practices',       videoUrl: 'https://example.com/seo3', duration: 18, order: 3 },
        { title: 'Content Clusters & Pillar Pages',  videoUrl: 'https://example.com/seo4', duration: 16, order: 4 },
        { title: 'Link Building Strategies',         videoUrl: 'https://example.com/seo5', duration: 18, order: 5 },
        { title: 'Measuring Organic Growth',         videoUrl: 'https://example.com/seo6', duration: 14, order: 6 },
      ],
    },
    {
      title: 'Email Marketing with Mailchimp & Klaviyo',
      description: 'Build automated email funnels that convert. Learn list segmentation, welcome sequences, abandoned cart flows, A/B testing subject lines, and deliverability best practices.',
      category: 'Marketing', difficulty: 'beginner', price: 34.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Email List Building',              videoUrl: 'https://example.com/em1', duration: 12, order: 1 },
        { title: 'Welcome Sequence Design',          videoUrl: 'https://example.com/em2', duration: 16, order: 2 },
        { title: 'Segmentation Strategies',          videoUrl: 'https://example.com/em3', duration: 14, order: 3 },
        { title: 'A/B Testing Subject Lines',        videoUrl: 'https://example.com/em4', duration: 14, order: 4 },
        { title: 'Abandoned Cart Automation',        videoUrl: 'https://example.com/em5', duration: 18, order: 5 },
        { title: 'Deliverability & Anti-Spam',       videoUrl: 'https://example.com/em6', duration: 12, order: 6 },
      ],
    },
    {
      title: 'Growth Hacking for Startups',
      description: 'Learn the growth loops, viral mechanics, and rapid experimentation techniques used by companies like Airbnb, Dropbox, and Slack to achieve exponential user growth.',
      category: 'Marketing', difficulty: 'intermediate', price: 49.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'What is Growth Hacking?',          videoUrl: 'https://example.com/gh1', duration: 10, order: 1 },
        { title: 'AARRR Metrics Framework',          videoUrl: 'https://example.com/gh2', duration: 16, order: 2 },
        { title: 'Viral Loops & Referral Programs',  videoUrl: 'https://example.com/gh3', duration: 20, order: 3 },
        { title: 'Landing Page Optimisation',        videoUrl: 'https://example.com/gh4', duration: 18, order: 4 },
        { title: 'A/B Testing at Scale',             videoUrl: 'https://example.com/gh5', duration: 20, order: 5 },
        { title: 'Case Studies: Slack, Airbnb',      videoUrl: 'https://example.com/gh6', duration: 22, order: 6 },
      ],
    },
    {
      title: 'Analytics & Data-Driven Marketing',
      description: 'Use Google Analytics 4, Mixpanel, and Looker Studio to understand user behaviour, build attribution models, and make marketing decisions backed by data rather than intuition.',
      category: 'Marketing', difficulty: 'intermediate', price: 44.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'GA4 Setup and Events',             videoUrl: 'https://example.com/dam1', duration: 14, order: 1 },
        { title: 'Funnel Analysis in Mixpanel',      videoUrl: 'https://example.com/dam2', duration: 18, order: 2 },
        { title: 'Attribution Models',               videoUrl: 'https://example.com/dam3', duration: 20, order: 3 },
        { title: 'UTM Parameters & Tracking',        videoUrl: 'https://example.com/dam4', duration: 14, order: 4 },
        { title: 'Looker Studio Dashboards',         videoUrl: 'https://example.com/dam5', duration: 18, order: 5 },
        { title: 'Marketing ROI Reporting',          videoUrl: 'https://example.com/dam6', duration: 16, order: 6 },
      ],
    },
    {
      title: 'Video Marketing & YouTube Growth',
      description: 'Grow a YouTube channel from zero: scripting, filming, editing, SEO optimisation, thumbnails, and monetisation strategies. Includes a practical walkthrough of YouTube Studio analytics.',
      category: 'Marketing', difficulty: 'beginner', price: 39.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'YouTube Algorithm Explained',      videoUrl: 'https://example.com/yt1', duration: 12, order: 1 },
        { title: 'Script Writing for Video',         videoUrl: 'https://example.com/yt2', duration: 16, order: 2 },
        { title: 'Filming & Lighting Basics',        videoUrl: 'https://example.com/yt3', duration: 18, order: 3 },
        { title: 'Video SEO & Thumbnails',           videoUrl: 'https://example.com/yt4', duration: 14, order: 4 },
        { title: 'YouTube Analytics Deep Dive',      videoUrl: 'https://example.com/yt5', duration: 16, order: 5 },
        { title: 'Monetisation & Brand Deals',       videoUrl: 'https://example.com/yt6', duration: 14, order: 6 },
      ],
    },
    {
      title: 'Brand Strategy & Identity',
      description: 'Develop a powerful brand from the ground up. Learn brand positioning, competitive differentiation, messaging frameworks, visual identity systems, and brand storytelling techniques.',
      category: 'Marketing', difficulty: 'intermediate', price: 49.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'What Makes a Strong Brand?',       videoUrl: 'https://example.com/brs1', duration: 12, order: 1 },
        { title: 'Brand Positioning & Differentiation',videoUrl: 'https://example.com/brs2', duration: 18, order: 2 },
        { title: 'Brand Messaging Framework',        videoUrl: 'https://example.com/brs3', duration: 16, order: 3 },
        { title: 'Visual Identity System',           videoUrl: 'https://example.com/brs4', duration: 20, order: 4 },
        { title: 'Brand Storytelling',               videoUrl: 'https://example.com/brs5', duration: 16, order: 5 },
        { title: 'Brand Audit & Refresh',            videoUrl: 'https://example.com/brs6', duration: 18, order: 6 },
      ],
    },
  ];

  // ─── ADDITIONAL PROGRAMMING COURSES ─────────────────────────────────────────

  const extraProgrammingCourses = [
    {
      title: 'Flutter & Dart: Mobile App Development',
      description: 'Build beautiful cross-platform iOS and Android apps with Flutter 3 and Dart. Covers widgets, state management (Riverpod), navigation, REST API integration, and app store publishing.',
      category: 'Programming', difficulty: 'intermediate', price: 54.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Dart Language Fundamentals',       videoUrl: 'https://example.com/fl1', duration: 16, order: 1 },
        { title: 'Flutter Widget Tree',              videoUrl: 'https://example.com/fl2', duration: 20, order: 2 },
        { title: 'State Management with Riverpod',   videoUrl: 'https://example.com/fl3', duration: 24, order: 3 },
        { title: 'Navigation 2.0 & Deep Links',      videoUrl: 'https://example.com/fl4', duration: 18, order: 4 },
        { title: 'REST APIs & Firebase',             videoUrl: 'https://example.com/fl5', duration: 22, order: 5 },
        { title: 'Publishing to App Store & Play',   videoUrl: 'https://example.com/fl6', duration: 16, order: 6 },
      ],
    },
    {
      title: 'React Native: Build iOS & Android Apps',
      description: 'Create native mobile applications with React Native and Expo. Learn navigation, device APIs, push notifications, local storage with MMKV, and deploying to TestFlight and Play Console.',
      category: 'Programming', difficulty: 'intermediate', price: 54.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'React Native vs Flutter',          videoUrl: 'https://example.com/rn1', duration: 10, order: 1 },
        { title: 'Expo Workflow & EAS Build',        videoUrl: 'https://example.com/rn2', duration: 18, order: 2 },
        { title: 'Navigation with React Navigation', videoUrl: 'https://example.com/rn3', duration: 22, order: 3 },
        { title: 'Device APIs: Camera & Location',   videoUrl: 'https://example.com/rn4', duration: 20, order: 4 },
        { title: 'Push Notifications',               videoUrl: 'https://example.com/rn5', duration: 16, order: 5 },
        { title: 'App Store Submission',             videoUrl: 'https://example.com/rn6', duration: 14, order: 6 },
      ],
    },
    {
      title: 'Cybersecurity Fundamentals',
      description: 'Build a solid security foundation: understand the OWASP Top 10, network protocols, encryption, common attack vectors, and how to protect web applications from real-world threats.',
      category: 'Programming', difficulty: 'beginner', price: 44.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Security Mindset & CIA Triad',     videoUrl: 'https://example.com/sec1', duration: 12, order: 1 },
        { title: 'OWASP Top 10 Vulnerabilities',     videoUrl: 'https://example.com/sec2', duration: 22, order: 2 },
        { title: 'Cryptography Essentials',          videoUrl: 'https://example.com/sec3', duration: 18, order: 3 },
        { title: 'Network Security Basics',          videoUrl: 'https://example.com/sec4', duration: 16, order: 4 },
        { title: 'Authentication & Authorization',   videoUrl: 'https://example.com/sec5', duration: 20, order: 5 },
        { title: 'Security Auditing & Pen Testing',  videoUrl: 'https://example.com/sec6', duration: 18, order: 6 },
      ],
    },
    {
      title: 'Go Programming Language',
      description: 'Learn Go from scratch and build production-ready services. Covers goroutines, channels, interfaces, the standard library, REST APIs with Gin, and deploying a Go microservice to Docker.',
      category: 'Programming', difficulty: 'intermediate', price: 49.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Go Toolchain & Modules',           videoUrl: 'https://example.com/go1', duration: 14, order: 1 },
        { title: 'Types, Structs & Interfaces',      videoUrl: 'https://example.com/go2', duration: 20, order: 2 },
        { title: 'Goroutines and Channels',          videoUrl: 'https://example.com/go3', duration: 24, order: 3 },
        { title: 'Error Handling Patterns',          videoUrl: 'https://example.com/go4', duration: 16, order: 4 },
        { title: 'REST API with Gin',                videoUrl: 'https://example.com/go5', duration: 22, order: 5 },
        { title: 'Testing in Go',                    videoUrl: 'https://example.com/go6', duration: 16, order: 6 },
        { title: 'Capstone: URL Shortener Service',  videoUrl: 'https://example.com/go7', duration: 40, order: 7 },
      ],
    },
    {
      title: 'Rust Systems Programming',
      description: 'Master Rust ownership, borrowing, lifetimes, and the type system. Build a command-line tool, a concurrent file processor, and a simple HTTP server — all memory-safe without a garbage collector.',
      category: 'Programming', difficulty: 'advanced', price: 64.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Ownership and Borrowing',          videoUrl: 'https://example.com/rs1', duration: 22, order: 1 },
        { title: 'Structs, Enums, and Pattern Matching',videoUrl: 'https://example.com/rs2', duration: 20, order: 2 },
        { title: 'Traits and Generics',              videoUrl: 'https://example.com/rs3', duration: 22, order: 3 },
        { title: 'Concurrency with Threads & Async', videoUrl: 'https://example.com/rs4', duration: 26, order: 4 },
        { title: 'Error Handling (Result, ?)',       videoUrl: 'https://example.com/rs5', duration: 16, order: 5 },
        { title: 'Capstone: Concurrent File Processor',videoUrl: 'https://example.com/rs6', duration: 45, order: 6 },
      ],
    },
    {
      title: 'Java Spring Boot: REST APIs',
      description: 'Build enterprise-grade Java REST APIs with Spring Boot 3, Spring Security, JPA/Hibernate, and MySQL. Learn dependency injection, exception handling, and deploying to Railway.',
      category: 'Programming', difficulty: 'intermediate', price: 54.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Spring Boot Project Setup',        videoUrl: 'https://example.com/jv1', duration: 14, order: 1 },
        { title: 'Dependency Injection & IoC',       videoUrl: 'https://example.com/jv2', duration: 18, order: 2 },
        { title: 'JPA Entities and Repositories',    videoUrl: 'https://example.com/jv3', duration: 22, order: 3 },
        { title: 'Spring Security & JWT',            videoUrl: 'https://example.com/jv4', duration: 24, order: 4 },
        { title: 'Exception Handling & Validation',  videoUrl: 'https://example.com/jv5', duration: 16, order: 5 },
        { title: 'Testing Spring Boot Apps',         videoUrl: 'https://example.com/jv6', duration: 18, order: 6 },
        { title: 'Deploying to Railway',             videoUrl: 'https://example.com/jv7', duration: 14, order: 7 },
      ],
    },
    {
      title: 'C# & .NET 8 Web API',
      description: 'Build modern REST APIs with ASP.NET Core 8, Entity Framework Core, AutoMapper, MediatR (CQRS), and Swagger. Deploy to Azure App Service with CI/CD via GitHub Actions.',
      category: 'Programming', difficulty: 'intermediate', price: 54.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'C# Modern Features (.NET 8)',      videoUrl: 'https://example.com/cs1', duration: 16, order: 1 },
        { title: 'ASP.NET Core Middleware Pipeline', videoUrl: 'https://example.com/cs2', duration: 18, order: 2 },
        { title: 'Entity Framework Core',           videoUrl: 'https://example.com/cs3', duration: 22, order: 3 },
        { title: 'CQRS with MediatR',               videoUrl: 'https://example.com/cs4', duration: 20, order: 4 },
        { title: 'Authentication with Identity',    videoUrl: 'https://example.com/cs5', duration: 18, order: 5 },
        { title: 'Deploy to Azure App Service',     videoUrl: 'https://example.com/cs6', duration: 16, order: 6 },
      ],
    },
    {
      title: 'Angular 17: The Complete Guide',
      description: 'Master Angular 17 from the ground up: components, signals, services, RxJS, lazy loading, Angular Material, and NgRx state management. Build a fully functional task management SPA.',
      category: 'Programming', difficulty: 'intermediate', price: 54.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Angular Architecture & CLI',       videoUrl: 'https://example.com/ang1', duration: 14, order: 1 },
        { title: 'Components & Signals',             videoUrl: 'https://example.com/ang2', duration: 20, order: 2 },
        { title: 'Services, DI & HttpClient',        videoUrl: 'https://example.com/ang3', duration: 18, order: 3 },
        { title: 'RxJS Fundamentals',                videoUrl: 'https://example.com/ang4', duration: 24, order: 4 },
        { title: 'Routing & Lazy Loading',           videoUrl: 'https://example.com/ang5', duration: 18, order: 5 },
        { title: 'NgRx State Management',            videoUrl: 'https://example.com/ang6', duration: 22, order: 6 },
        { title: 'Capstone: Task Manager SPA',       videoUrl: 'https://example.com/ang7', duration: 45, order: 7 },
      ],
    },
    {
      title: 'Svelte & SvelteKit Full-Stack',
      description: 'Build fast, compiler-optimised web apps with Svelte 5 and SvelteKit. Learn runes, form actions, server-side rendering, file-based routing, and deploy a full-stack app to Vercel.',
      category: 'Programming', difficulty: 'intermediate', price: 44.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Why Svelte? Runes & Reactivity',   videoUrl: 'https://example.com/sv1', duration: 14, order: 1 },
        { title: 'SvelteKit File-Based Routing',     videoUrl: 'https://example.com/sv2', duration: 18, order: 2 },
        { title: 'Server-Side Rendering & Loads',    videoUrl: 'https://example.com/sv3', duration: 20, order: 3 },
        { title: 'Form Actions & Validation',        videoUrl: 'https://example.com/sv4', duration: 16, order: 4 },
        { title: 'Authentication with Lucia',        videoUrl: 'https://example.com/sv5', duration: 18, order: 5 },
        { title: 'Deploy to Vercel',                 videoUrl: 'https://example.com/sv6', duration: 12, order: 6 },
      ],
    },
    {
      title: 'Web Scraping with Python & Playwright',
      description: 'Extract data from any website using Python, Requests, BeautifulSoup, Scrapy, and Playwright for JavaScript-rendered pages. Covers pagination, rate limiting, proxy rotation, and data export.',
      category: 'Programming', difficulty: 'beginner', price: 39.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'HTTP & HTML Basics',               videoUrl: 'https://example.com/ws1', duration: 12, order: 1 },
        { title: 'BeautifulSoup & CSS Selectors',    videoUrl: 'https://example.com/ws2', duration: 18, order: 2 },
        { title: 'Scrapy Spiders & Pipelines',       videoUrl: 'https://example.com/ws3', duration: 22, order: 3 },
        { title: 'Playwright for Dynamic Pages',     videoUrl: 'https://example.com/ws4', duration: 20, order: 4 },
        { title: 'Rate Limiting & Proxy Rotation',   videoUrl: 'https://example.com/ws5', duration: 16, order: 5 },
        { title: 'Storing Data: CSV, JSON, DB',      videoUrl: 'https://example.com/ws6', duration: 14, order: 6 },
      ],
    },
    {
      title: 'Electron.js: Desktop Apps with Web Tech',
      description: 'Build cross-platform desktop apps for Windows, macOS, and Linux using Electron.js and React. Learn the main/renderer process model, IPC, auto-updates, and packaging with electron-builder.',
      category: 'Programming', difficulty: 'intermediate', price: 49.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Main vs Renderer Process',         videoUrl: 'https://example.com/el1', duration: 14, order: 1 },
        { title: 'IPC Communication',                videoUrl: 'https://example.com/el2', duration: 18, order: 2 },
        { title: 'Native Menus & Notifications',     videoUrl: 'https://example.com/el3', duration: 16, order: 3 },
        { title: 'File System & Shell APIs',         videoUrl: 'https://example.com/el4', duration: 18, order: 4 },
        { title: 'Auto-Updates with electron-updater',videoUrl: 'https://example.com/el5', duration: 14, order: 5 },
        { title: 'Packaging & Distribution',         videoUrl: 'https://example.com/el6', duration: 16, order: 6 },
      ],
    },
    {
      title: 'WebAssembly with Rust & WASM-Pack',
      description: 'Compile Rust to WebAssembly and run near-native performance code in the browser. Learn wasm-bindgen, web-sys, JavaScript interop, and build a real-time image processing tool.',
      category: 'Programming', difficulty: 'advanced', price: 59.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'WebAssembly Fundamentals',         videoUrl: 'https://example.com/wa1', duration: 16, order: 1 },
        { title: 'Rust to WASM with wasm-pack',      videoUrl: 'https://example.com/wa2', duration: 20, order: 2 },
        { title: 'wasm-bindgen & JavaScript Interop',videoUrl: 'https://example.com/wa3', duration: 22, order: 3 },
        { title: 'Memory & Performance',             videoUrl: 'https://example.com/wa4', duration: 18, order: 4 },
        { title: 'Capstone: Image Processor',        videoUrl: 'https://example.com/wa5', duration: 40, order: 5 },
      ],
    },
    {
      title: 'Web Accessibility (WCAG 2.2)',
      description: 'Make your web apps usable by everyone. Learn ARIA roles, keyboard navigation, colour contrast, screen reader testing, and how to audit and remediate accessibility issues with Axe and Lighthouse.',
      category: 'Programming', difficulty: 'beginner', price: 34.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Why Accessibility Matters',        videoUrl: 'https://example.com/a11y1', duration: 10, order: 1 },
        { title: 'WCAG 2.2 Principles (POUR)',       videoUrl: 'https://example.com/a11y2', duration: 16, order: 2 },
        { title: 'Semantic HTML & ARIA Roles',       videoUrl: 'https://example.com/a11y3', duration: 20, order: 3 },
        { title: 'Keyboard Navigation Patterns',     videoUrl: 'https://example.com/a11y4', duration: 16, order: 4 },
        { title: 'Screen Reader Testing',            videoUrl: 'https://example.com/a11y5', duration: 18, order: 5 },
        { title: 'Auditing with Axe & Lighthouse',   videoUrl: 'https://example.com/a11y6', duration: 14, order: 6 },
      ],
    },
    {
      title: 'AI-Powered Apps with the Claude API',
      description: 'Build production-grade AI applications using the Anthropic Claude API. Learn prompt engineering, tool use, vision, streaming, prompt caching, and how to integrate Claude into web and mobile apps.',
      category: 'Programming', difficulty: 'intermediate', price: 64.99,
      instructor: instructor1._id, status: 'published', totalStudents: 1,
      rating: { average: 5, count: 1 },
      lessons: [
        { title: 'Claude API Overview',              videoUrl: 'https://example.com/ai1', duration: 14, order: 1 },
        { title: 'Prompt Engineering Fundamentals',  videoUrl: 'https://example.com/ai2', duration: 20, order: 2 },
        { title: 'Tool Use & Function Calling',      videoUrl: 'https://example.com/ai3', duration: 24, order: 3 },
        { title: 'Vision & Multimodal Inputs',       videoUrl: 'https://example.com/ai4', duration: 18, order: 4 },
        { title: 'Streaming & Prompt Caching',       videoUrl: 'https://example.com/ai5', duration: 16, order: 5 },
        { title: 'RAG: Retrieval-Augmented Gen.',    videoUrl: 'https://example.com/ai6', duration: 22, order: 6 },
        { title: 'Capstone: AI-Powered SaaS App',    videoUrl: 'https://example.com/ai7', duration: 50, order: 7 },
      ],
    },
  ];

  // ─── ADDITIONAL DESIGN COURSES ───────────────────────────────────────────────

  const extraDesignCourses = [
    {
      title: 'Figma UI Design Masterclass',
      description: 'Go from Figma beginner to professional. Learn auto layout, components, variables, prototyping, dev mode handoff, and how to design a complete mobile app UI from scratch.',
      category: 'Design', difficulty: 'beginner', price: 44.99,
      instructor: instructor2._id, status: 'published', totalStudents: 2,
      rating: { average: 4.7, count: 2 },
      lessons: [
        { title: 'Figma Interface Tour',             videoUrl: 'https://example.com/fig1', duration: 12, order: 1 },
        { title: 'Auto Layout Deep Dive',            videoUrl: 'https://example.com/fig2', duration: 20, order: 2 },
        { title: 'Component Libraries',              videoUrl: 'https://example.com/fig3', duration: 22, order: 3 },
        { title: 'Variables & Theming',              videoUrl: 'https://example.com/fig4', duration: 18, order: 4 },
        { title: 'Prototyping & Animations',         videoUrl: 'https://example.com/fig5', duration: 16, order: 5 },
        { title: 'Dev Mode Handoff',                 videoUrl: 'https://example.com/fig6', duration: 14, order: 6 },
        { title: 'Capstone: Mobile App UI',          videoUrl: 'https://example.com/fig7', duration: 45, order: 7 },
      ],
    },
    {
      title: 'Graphic Design Fundamentals',
      description: 'Learn the timeless principles behind great graphic design: typography, colour theory, grid systems, visual hierarchy, and composition. Apply them in Canva and Adobe Illustrator.',
      category: 'Design', difficulty: 'beginner', price: 34.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Design Principles Overview',       videoUrl: 'https://example.com/gd1', duration: 12, order: 1 },
        { title: 'Typography & Type Pairing',        videoUrl: 'https://example.com/gd2', duration: 18, order: 2 },
        { title: 'Colour Theory & Palettes',         videoUrl: 'https://example.com/gd3', duration: 16, order: 3 },
        { title: 'Grid Systems & Layouts',           videoUrl: 'https://example.com/gd4', duration: 16, order: 4 },
        { title: 'Visual Hierarchy',                 videoUrl: 'https://example.com/gd5', duration: 14, order: 5 },
        { title: 'Capstone: Brand Kit Design',       videoUrl: 'https://example.com/gd6', duration: 35, order: 6 },
      ],
    },
    {
      title: '3D Modelling & Rendering with Blender',
      description: 'Master Blender 4 from zero to render-ready. Learn modelling, UV unwrapping, materials, lighting, rigging basics, and Eevee vs Cycles rendering for product visualisation.',
      category: 'Design', difficulty: 'intermediate', price: 54.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Blender Interface & Navigation',   videoUrl: 'https://example.com/bl1', duration: 14, order: 1 },
        { title: 'Modelling Fundamentals',           videoUrl: 'https://example.com/bl2', duration: 24, order: 2 },
        { title: 'UV Unwrapping & Texturing',        videoUrl: 'https://example.com/bl3', duration: 22, order: 3 },
        { title: 'Materials with Shader Editor',     videoUrl: 'https://example.com/bl4', duration: 20, order: 4 },
        { title: 'Lighting & HDRI',                  videoUrl: 'https://example.com/bl5', duration: 16, order: 5 },
        { title: 'Rendering: Eevee vs Cycles',       videoUrl: 'https://example.com/bl6', duration: 18, order: 6 },
        { title: 'Capstone: Product Visualisation',  videoUrl: 'https://example.com/bl7', duration: 40, order: 7 },
      ],
    },
    {
      title: 'Motion Design with After Effects',
      description: 'Create professional motion graphics and animated infographics with Adobe After Effects. Learn keyframing, expressions, shape animations, compositing, and export for web and social.',
      category: 'Design', difficulty: 'intermediate', price: 59.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'After Effects Workspace',          videoUrl: 'https://example.com/ae1', duration: 12, order: 1 },
        { title: 'Keyframing & Easing',              videoUrl: 'https://example.com/ae2', duration: 18, order: 2 },
        { title: 'Shape Layers & Masks',             videoUrl: 'https://example.com/ae3', duration: 20, order: 3 },
        { title: 'Expressions & Scripting',          videoUrl: 'https://example.com/ae4', duration: 22, order: 4 },
        { title: 'Text Animations',                  videoUrl: 'https://example.com/ae5', duration: 18, order: 5 },
        { title: 'Compositing & Green Screen',       videoUrl: 'https://example.com/ae6', duration: 16, order: 6 },
        { title: 'Capstone: Animated Infographic',   videoUrl: 'https://example.com/ae7', duration: 40, order: 7 },
      ],
    },
    {
      title: 'UI Animation with Framer Motion',
      description: 'Add delightful animations to your React apps with Framer Motion. Learn variants, gestures, layout animations, page transitions, and the AnimatePresence component for production-ready UIs.',
      category: 'Design', difficulty: 'intermediate', price: 44.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Framer Motion Basics',             videoUrl: 'https://example.com/fm1', duration: 12, order: 1 },
        { title: 'Variants & Orchestration',         videoUrl: 'https://example.com/fm2', duration: 18, order: 2 },
        { title: 'Gestures: Drag, Hover, Tap',       videoUrl: 'https://example.com/fm3', duration: 16, order: 3 },
        { title: 'Layout Animations',                videoUrl: 'https://example.com/fm4', duration: 18, order: 4 },
        { title: 'Page Transitions',                 videoUrl: 'https://example.com/fm5', duration: 16, order: 5 },
        { title: 'Scroll-Triggered Animations',      videoUrl: 'https://example.com/fm6', duration: 18, order: 6 },
      ],
    },
    {
      title: 'Design Systems at Scale',
      description: 'Build and maintain a design system used by multiple product teams. Learn token architecture, component documentation with Storybook, accessibility standards, and versioning strategies.',
      category: 'Design', difficulty: 'advanced', price: 64.99,
      instructor: instructor1._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'What is a Design System?',         videoUrl: 'https://example.com/dss1', duration: 12, order: 1 },
        { title: 'Design Token Architecture',        videoUrl: 'https://example.com/dss2', duration: 20, order: 2 },
        { title: 'Building Components in React',     videoUrl: 'https://example.com/dss3', duration: 24, order: 3 },
        { title: 'Storybook Documentation',          videoUrl: 'https://example.com/dss4', duration: 20, order: 4 },
        { title: 'Accessibility in Design Systems',  videoUrl: 'https://example.com/dss5', duration: 16, order: 5 },
        { title: 'Versioning & Publishing to npm',   videoUrl: 'https://example.com/dss6', duration: 18, order: 6 },
      ],
    },
    {
      title: 'Brand Identity & Logo Design',
      description: 'Learn the full brand identity process in Adobe Illustrator: logo design, colour systems, typography selection, brand guidelines, and packaging mockups. Build a portfolio-ready case study.',
      category: 'Design', difficulty: 'intermediate', price: 49.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Brand Identity Process',           videoUrl: 'https://example.com/bi1', duration: 14, order: 1 },
        { title: 'Logo Design in Illustrator',       videoUrl: 'https://example.com/bi2', duration: 24, order: 2 },
        { title: 'Colour System Development',        videoUrl: 'https://example.com/bi3', duration: 18, order: 3 },
        { title: 'Typography Selection',             videoUrl: 'https://example.com/bi4', duration: 16, order: 4 },
        { title: 'Brand Guidelines Document',        videoUrl: 'https://example.com/bi5', duration: 20, order: 5 },
        { title: 'Packaging & Mockups',              videoUrl: 'https://example.com/bi6', duration: 22, order: 6 },
      ],
    },
    {
      title: 'Typography Mastery',
      description: 'Understand type at a professional level: classification, anatomy, spacing (kerning, tracking, leading), hierarchy, pairing, and how to use variable fonts for responsive web typography.',
      category: 'Design', difficulty: 'beginner', price: 29.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Type Classification',              videoUrl: 'https://example.com/ty1', duration: 12, order: 1 },
        { title: 'Anatomy of Type',                  videoUrl: 'https://example.com/ty2', duration: 14, order: 2 },
        { title: 'Kerning, Tracking & Leading',      videoUrl: 'https://example.com/ty3', duration: 16, order: 3 },
        { title: 'Type Pairing Rules',               videoUrl: 'https://example.com/ty4', duration: 16, order: 4 },
        { title: 'Variable Fonts for the Web',       videoUrl: 'https://example.com/ty5', duration: 18, order: 5 },
      ],
    },
  ];

  // ─── ADDITIONAL DATA SCIENCE COURSES ────────────────────────────────────────

  const extraDataCourses = [
    {
      title: 'Statistics for Data Science',
      description: 'Build the statistical foundation every data scientist needs: probability, distributions, hypothesis testing, confidence intervals, regression, and Bayesian thinking — all in Python.',
      category: 'Data Science', difficulty: 'beginner', price: 44.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Probability Fundamentals',         videoUrl: 'https://example.com/sta1', duration: 16, order: 1 },
        { title: 'Distributions (Normal, Binomial)',  videoUrl: 'https://example.com/sta2', duration: 20, order: 2 },
        { title: 'Hypothesis Testing',               videoUrl: 'https://example.com/sta3', duration: 22, order: 3 },
        { title: 'Confidence Intervals & p-Values',  videoUrl: 'https://example.com/sta4', duration: 18, order: 4 },
        { title: 'Linear Regression',                videoUrl: 'https://example.com/sta5', duration: 20, order: 5 },
        { title: 'Bayesian Thinking',                videoUrl: 'https://example.com/sta6', duration: 18, order: 6 },
      ],
    },
    {
      title: 'R Programming for Analytics',
      description: 'Analyse data using R and the tidyverse. Learn ggplot2 visualisations, dplyr transformations, statistical modelling, and how to build interactive dashboards with R Shiny.',
      category: 'Data Science', difficulty: 'intermediate', price: 49.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'R and RStudio Setup',              videoUrl: 'https://example.com/r1', duration: 12, order: 1 },
        { title: 'dplyr Data Manipulation',          videoUrl: 'https://example.com/r2', duration: 20, order: 2 },
        { title: 'ggplot2 Visualisations',           videoUrl: 'https://example.com/r3', duration: 22, order: 3 },
        { title: 'Statistical Models in R',          videoUrl: 'https://example.com/r4', duration: 20, order: 4 },
        { title: 'R Markdown Reports',               videoUrl: 'https://example.com/r5', duration: 16, order: 5 },
        { title: 'Shiny Dashboards',                 videoUrl: 'https://example.com/r6', duration: 22, order: 6 },
      ],
    },
    {
      title: 'Apache Spark for Big Data',
      description: 'Process terabytes of data with Apache Spark. Learn RDDs, DataFrames, Spark SQL, streaming with Structured Streaming, MLlib, and running Spark jobs on Databricks and EMR.',
      category: 'Data Science', difficulty: 'advanced', price: 69.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Spark Architecture',               videoUrl: 'https://example.com/sp1', duration: 16, order: 1 },
        { title: 'RDDs and Transformations',         videoUrl: 'https://example.com/sp2', duration: 20, order: 2 },
        { title: 'Spark SQL & DataFrames',           videoUrl: 'https://example.com/sp3', duration: 22, order: 3 },
        { title: 'Structured Streaming',             videoUrl: 'https://example.com/sp4', duration: 20, order: 4 },
        { title: 'MLlib for Machine Learning',       videoUrl: 'https://example.com/sp5', duration: 22, order: 5 },
        { title: 'Running on Databricks & EMR',      videoUrl: 'https://example.com/sp6', duration: 18, order: 6 },
      ],
    },
    {
      title: 'Time Series Analysis & Forecasting',
      description: 'Analyse and forecast sequential data using statsmodels, Prophet, and LSTM networks. Apply these techniques to finance, energy, retail, and web traffic datasets.',
      category: 'Data Science', difficulty: 'intermediate', price: 59.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Time Series Fundamentals',         videoUrl: 'https://example.com/ts1', duration: 14, order: 1 },
        { title: 'Stationarity & Decomposition',     videoUrl: 'https://example.com/ts2', duration: 18, order: 2 },
        { title: 'ARIMA & SARIMA Models',            videoUrl: 'https://example.com/ts3', duration: 22, order: 3 },
        { title: 'Forecasting with Prophet',         videoUrl: 'https://example.com/ts4', duration: 18, order: 4 },
        { title: 'LSTM for Sequence Prediction',     videoUrl: 'https://example.com/ts5', duration: 24, order: 5 },
        { title: 'Capstone: Sales Forecast',         videoUrl: 'https://example.com/ts6', duration: 35, order: 6 },
      ],
    },
    {
      title: 'Computer Vision with OpenCV & YOLO',
      description: 'Build real-world computer vision applications: object detection, image segmentation, face recognition, and real-time video processing using OpenCV, YOLOv8, and TensorFlow.',
      category: 'Data Science', difficulty: 'advanced', price: 74.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Image Processing with OpenCV',     videoUrl: 'https://example.com/cv1', duration: 18, order: 1 },
        { title: 'Feature Detection & Matching',     videoUrl: 'https://example.com/cv2', duration: 20, order: 2 },
        { title: 'Object Detection with YOLOv8',     videoUrl: 'https://example.com/cv3', duration: 26, order: 3 },
        { title: 'Image Segmentation',               videoUrl: 'https://example.com/cv4', duration: 22, order: 4 },
        { title: 'Face Recognition',                 videoUrl: 'https://example.com/cv5', duration: 20, order: 5 },
        { title: 'Real-Time Video Processing',       videoUrl: 'https://example.com/cv6', duration: 18, order: 6 },
        { title: 'Capstone: Surveillance System',    videoUrl: 'https://example.com/cv7', duration: 45, order: 7 },
      ],
    },
    {
      title: 'Tableau for Business Intelligence',
      description: 'Build interactive BI dashboards with Tableau Desktop. Learn calculated fields, LOD expressions, data blending, geospatial maps, and how to publish dashboards to Tableau Server and Tableau Public.',
      category: 'Data Science', difficulty: 'beginner', price: 39.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Tableau Interface & Data Sources', videoUrl: 'https://example.com/tab1', duration: 12, order: 1 },
        { title: 'Visualisation Types',             videoUrl: 'https://example.com/tab2', duration: 18, order: 2 },
        { title: 'Calculated Fields & Table Calcs',  videoUrl: 'https://example.com/tab3', duration: 22, order: 3 },
        { title: 'LOD Expressions',                  videoUrl: 'https://example.com/tab4', duration: 20, order: 4 },
        { title: 'Maps & Geospatial Analysis',       videoUrl: 'https://example.com/tab5', duration: 16, order: 5 },
        { title: 'Publishing Dashboards',            videoUrl: 'https://example.com/tab6', duration: 14, order: 6 },
      ],
    },
    {
      title: 'Deep Learning with TensorFlow & Keras',
      description: 'Build and train deep neural networks with TensorFlow 2 and Keras. Covers fully connected networks, CNNs, batch normalisation, dropout, transfer learning, and model deployment with TF Serving.',
      category: 'Data Science', difficulty: 'advanced', price: 74.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'TensorFlow & Keras Basics',        videoUrl: 'https://example.com/tf1', duration: 16, order: 1 },
        { title: 'Building Dense Networks',          videoUrl: 'https://example.com/tf2', duration: 20, order: 2 },
        { title: 'Convolutional Neural Networks',    videoUrl: 'https://example.com/tf3', duration: 26, order: 3 },
        { title: 'Batch Norm & Dropout',             videoUrl: 'https://example.com/tf4', duration: 18, order: 4 },
        { title: 'Transfer Learning with ResNet50',  videoUrl: 'https://example.com/tf5', duration: 22, order: 5 },
        { title: 'Model Deployment with TF Serving', videoUrl: 'https://example.com/tf6', duration: 18, order: 6 },
        { title: 'Capstone: Multi-Class Classifier', videoUrl: 'https://example.com/tf7', duration: 45, order: 7 },
      ],
    },
    {
      title: 'A/B Testing & Experimentation',
      description: 'Design, run, and analyse experiments like the big tech companies. Learn sample size calculation, statistical significance, multi-variate testing, bandit algorithms, and building an experimentation culture.',
      category: 'Data Science', difficulty: 'intermediate', price: 54.99,
      instructor: instructor3._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Experimentation Fundamentals',     videoUrl: 'https://example.com/ab1', duration: 14, order: 1 },
        { title: 'Sample Size & Power Analysis',     videoUrl: 'https://example.com/ab2', duration: 18, order: 2 },
        { title: 'Statistical Significance & Lift',  videoUrl: 'https://example.com/ab3', duration: 20, order: 3 },
        { title: 'Multi-Variate Testing',            videoUrl: 'https://example.com/ab4', duration: 16, order: 4 },
        { title: 'Bandit Algorithms',                videoUrl: 'https://example.com/ab5', duration: 18, order: 5 },
        { title: 'Pitfalls & Common Mistakes',       videoUrl: 'https://example.com/ab6', duration: 14, order: 6 },
      ],
    },
  ];

  // ─── ADDITIONAL CLOUD / DEVOPS COURSES ──────────────────────────────────────

  const extraCloudCourses = [
    {
      title: 'GCP Professional Cloud Architect',
      description: 'Prepare for the Google Cloud Professional Cloud Architect exam. Covers Compute Engine, GKE, BigQuery, Cloud Run, Pub/Sub, IAM, VPC, and designing for availability, scalability, and cost.',
      category: 'Other', difficulty: 'advanced', price: 74.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'GCP Resource Hierarchy & IAM',     videoUrl: 'https://example.com/gcp1', duration: 16, order: 1 },
        { title: 'Compute: GCE, GKE, Cloud Run',     videoUrl: 'https://example.com/gcp2', duration: 22, order: 2 },
        { title: 'Storage: GCS, Bigtable, Spanner',  videoUrl: 'https://example.com/gcp3', duration: 20, order: 3 },
        { title: 'BigQuery & Data Pipelines',        videoUrl: 'https://example.com/gcp4', duration: 24, order: 4 },
        { title: 'Pub/Sub & Event-Driven Arch.',     videoUrl: 'https://example.com/gcp5', duration: 18, order: 5 },
        { title: 'Networking: VPC, Load Balancing',  videoUrl: 'https://example.com/gcp6', duration: 20, order: 6 },
        { title: 'Reliability & Cost Optimisation',  videoUrl: 'https://example.com/gcp7', duration: 18, order: 7 },
      ],
    },
    {
      title: 'Site Reliability Engineering (SRE)',
      description: 'Apply Google SRE principles to build reliable systems: SLOs and error budgets, incident response, on-call practices, toil reduction, and chaos engineering with Chaos Monkey.',
      category: 'Other', difficulty: 'advanced', price: 69.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'SRE vs DevOps Philosophy',         videoUrl: 'https://example.com/sre1', duration: 12, order: 1 },
        { title: 'SLIs, SLOs & Error Budgets',       videoUrl: 'https://example.com/sre2', duration: 20, order: 2 },
        { title: 'Incident Response Playbooks',      videoUrl: 'https://example.com/sre3', duration: 18, order: 3 },
        { title: 'Postmortems & Blameless Culture',  videoUrl: 'https://example.com/sre4', duration: 14, order: 4 },
        { title: 'Toil Reduction & Automation',      videoUrl: 'https://example.com/sre5', duration: 16, order: 5 },
        { title: 'Chaos Engineering',                videoUrl: 'https://example.com/sre6', duration: 20, order: 6 },
      ],
    },
    {
      title: 'Ansible for Configuration Management',
      description: 'Automate server configuration, software deployment, and application orchestration with Ansible. Learn playbooks, roles, inventory management, Ansible Vault, and AWX.',
      category: 'Other', difficulty: 'intermediate', price: 49.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Ansible Architecture & Inventory', videoUrl: 'https://example.com/ans1', duration: 14, order: 1 },
        { title: 'Tasks, Modules & Playbooks',       videoUrl: 'https://example.com/ans2', duration: 20, order: 2 },
        { title: 'Variables, Facts & Templates',     videoUrl: 'https://example.com/ans3', duration: 16, order: 3 },
        { title: 'Roles & Galaxy',                   videoUrl: 'https://example.com/ans4', duration: 18, order: 4 },
        { title: 'Ansible Vault for Secrets',        videoUrl: 'https://example.com/ans5', duration: 14, order: 5 },
        { title: 'AWX & Automation Controller',      videoUrl: 'https://example.com/ans6', duration: 18, order: 6 },
      ],
    },
    {
      title: 'Prometheus & Grafana Monitoring',
      description: 'Build a full observability stack with Prometheus, Alertmanager, and Grafana. Learn PromQL, recording rules, alert routing, Loki for logs, and tracing with Tempo.',
      category: 'Other', difficulty: 'intermediate', price: 54.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Observability Fundamentals',       videoUrl: 'https://example.com/prom1', duration: 12, order: 1 },
        { title: 'Prometheus Metrics & Exporters',   videoUrl: 'https://example.com/prom2', duration: 18, order: 2 },
        { title: 'PromQL Query Language',            videoUrl: 'https://example.com/prom3', duration: 22, order: 3 },
        { title: 'Alertmanager & Alert Routing',     videoUrl: 'https://example.com/prom4', duration: 16, order: 4 },
        { title: 'Grafana Dashboards',               videoUrl: 'https://example.com/prom5', duration: 18, order: 5 },
        { title: 'Logs with Loki & Traces with Tempo',videoUrl: 'https://example.com/prom6', duration: 20, order: 6 },
      ],
    },
    {
      title: 'Linux Administration Fundamentals',
      description: 'Become comfortable on the Linux command line. Learn file system navigation, process management, users and permissions, shell scripting, systemd services, cron, and SSH hardening.',
      category: 'Other', difficulty: 'beginner', price: 39.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Command Line Basics',              videoUrl: 'https://example.com/lx1', duration: 16, order: 1 },
        { title: 'File System & Permissions',        videoUrl: 'https://example.com/lx2', duration: 18, order: 2 },
        { title: 'Processes & System Resources',     videoUrl: 'https://example.com/lx3', duration: 16, order: 3 },
        { title: 'Bash Scripting',                   videoUrl: 'https://example.com/lx4', duration: 22, order: 4 },
        { title: 'systemd & Service Management',     videoUrl: 'https://example.com/lx5', duration: 16, order: 5 },
        { title: 'SSH, Firewalls & Hardening',       videoUrl: 'https://example.com/lx6', duration: 18, order: 6 },
      ],
    },
    {
      title: 'Nginx & Web Server Mastery',
      description: 'Configure Nginx for production: virtual hosts, reverse proxying, load balancing, SSL/TLS with Let\'s Encrypt, HTTP/2, caching, rate limiting, and performance tuning.',
      category: 'Other', difficulty: 'intermediate', price: 44.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Nginx Architecture & Config',      videoUrl: 'https://example.com/ng1', duration: 14, order: 1 },
        { title: 'Virtual Hosts & Server Blocks',    videoUrl: 'https://example.com/ng2', duration: 16, order: 2 },
        { title: 'Reverse Proxy & Load Balancing',   videoUrl: 'https://example.com/ng3', duration: 20, order: 3 },
        { title: 'SSL/TLS with Let\'s Encrypt',      videoUrl: 'https://example.com/ng4', duration: 16, order: 4 },
        { title: 'Caching & Compression',            videoUrl: 'https://example.com/ng5', duration: 14, order: 5 },
        { title: 'Rate Limiting & Security Headers', videoUrl: 'https://example.com/ng6', duration: 16, order: 6 },
      ],
    },
    {
      title: 'Cloud Security & Compliance',
      description: 'Secure cloud infrastructure on AWS and Azure. Learn the shared responsibility model, IAM least privilege, secrets management, encryption at rest and in transit, audit logging, and SOC 2 compliance.',
      category: 'Other', difficulty: 'intermediate', price: 59.99,
      instructor: instructor2._id, status: 'published', totalStudents: 0,
      lessons: [
        { title: 'Cloud Security Fundamentals',      videoUrl: 'https://example.com/clsec1', duration: 14, order: 1 },
        { title: 'IAM Best Practices',               videoUrl: 'https://example.com/clsec2', duration: 18, order: 2 },
        { title: 'Secrets Management (Vault, SM)',   videoUrl: 'https://example.com/clsec3', duration: 16, order: 3 },
        { title: 'Encryption At Rest & In Transit',  videoUrl: 'https://example.com/clsec4', duration: 18, order: 4 },
        { title: 'Audit Logging & SIEM',             videoUrl: 'https://example.com/clsec5', duration: 16, order: 5 },
        { title: 'SOC 2 & Compliance Frameworks',    videoUrl: 'https://example.com/clsec6', duration: 20, order: 6 },
      ],
    },
  ];

  const allCourses = [
    ...frontendCourses, ...backendCourses, ...cloudCourses, ...dataCourses,
    ...businessCourses, ...marketingCourses, ...extraProgrammingCourses,
    ...extraDesignCourses, ...extraDataCourses, ...extraCloudCourses,
  ];
  const courses = await Course.insertMany(allCourses);

  const published = courses.filter((c) => c.status === 'published').length;
  const draft     = courses.filter((c) => c.status === 'draft').length;
  console.log(`${courses.length} courses created (${published} published, ${draft} draft).`);

  // Enrolments for the two seed students across a spread of courses
  await Enrolment.insertMany([
    { student: student1._id, course: courses[0]._id,  completedLessons: [courses[0].lessons[0]._id, courses[0].lessons[1]._id], progressPercent: 33,  paymentRef: 'SIM-001' },
    { student: student1._id, course: courses[1]._id,  completedLessons: [],                                                      progressPercent: 0,   paymentRef: 'SIM-002' },
    { student: student1._id, course: courses[8]._id,  completedLessons: [],                                                      progressPercent: 0,   paymentRef: 'SIM-003' },
    { student: student2._id, course: courses[0]._id,  completedLessons: [courses[0].lessons[0]._id],                             progressPercent: 17,  paymentRef: 'SIM-004' },
    { student: student2._id, course: courses[1]._id,  completedLessons: courses[1].lessons.map((l) => l._id),                    progressPercent: 100, completedAt: new Date(), paymentRef: 'SIM-005' },
    { student: student2._id, course: courses[14]._id, completedLessons: [],                                                      progressPercent: 0,   paymentRef: 'SIM-006' },
  ]);
  console.log('Enrolments created.');

  console.log('\nSeed complete. All passwords: password123');
  console.log('  admin@eduflow.com   — admin');
  console.log('  alice@eduflow.com   — instructor (FE + BE courses)');
  console.log('  bob@eduflow.com     — instructor (Cloud + some BE courses)');
  console.log('  clara@eduflow.com   — instructor (Data Science courses)');
  console.log('  carol@eduflow.com   — student');
  console.log('  dave@eduflow.com    — student');
  console.log(`\nTotal courses: ${courses.length}`);

  const byCategory = {};
  courses.forEach((c) => { byCategory[c.category] = (byCategory[c.category] || 0) + 1; });
  Object.entries(byCategory).forEach(([cat, n]) => console.log(`  ${cat}: ${n}`));

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => { console.error(err); process.exit(1); });
