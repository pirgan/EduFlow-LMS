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

  const allCourses = [...frontendCourses, ...backendCourses, ...cloudCourses, ...dataCourses];
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
