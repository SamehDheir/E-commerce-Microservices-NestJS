<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

🚀 Overview
This project is a high-performance, scalable E-commerce Backend built using a Microservices Architecture. It leverages the power of NestJS and TypeScript to provide a modular system where each core business function (Orders, Products, Payments, etc.) operates as an independent service.

The architecture is designed to handle high traffic and ensure data consistency across services using modern communication patterns and message brokers.

🛠 Tech Stack
- Framework: NestJS (Node.js).
- Language: TypeScript.
- Database: PostgreSQL & MongoDB (Database-per-service pattern).
- ORM: Prisma ORM.
- Communication: RabbitMQ / Redis for asynchronous messaging and event-driven architecture.
- Security: JWT-based Authentication & Role-Based Access Control (RBAC).
- DevOps: Docker for containerization and environment consistency.

  🏗 Key Microservices
  - Auth Service: Manages user identity, secure registration, and token-based sessions.
  - Product Service: Handles the product catalog, inventory management, and search functionality.
  - Order Service: Manages the lifecycle of an order, from creation to completion, ensuring atomic transactions.
  - Payment Service: Integrates with payment gateways to process secure financial transactions.

  Key Features
  - Scalability: Services can be scaled independently based on demand.
  - Clean Architecture: Follows modular design and SOLID principles for maintainable code.
  - API Gateway: A single entry point for client requests, routing them to the appropriate microservice.
  - Real-time Updates: Potential for WebSocket integration to provide instant notifications (e.g., order status updates).
  - Performance Optimized: Implements caching strategies and efficient database querying

Getting Started
- Clone the repo: git clone https://github.com/SamehDheir/E-commerce-Microservices-NestJS
- Install dependencies: npm install
- Environment Setup: Configure your .env files for each service.
- Docker Compose: Spin up the infrastructure (DBs, Message Broker) using docker-compose up.
