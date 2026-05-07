# ROBMS — Restaurant Order & Billing Management System

ROBMS is a full-stack restaurant management application built for local development and testing. It includes:
- digital menu browsing,
- table selection and orders,
- kitchen display system (KDS),
- billing support,
- real-time status updates between frontend and backend.

This project is designed to be easy to run on a local machine using the built-in H2 database and the Spring Boot/Next.js development servers.

## What the Project Does

- Displays a restaurant floor map with table status.
- Lets a user select a table and place an order from a digital menu.
- Sends orders to the backend and updates table status automatically.
- Shows kitchen staff a live view of orders and order progress.
- Tracks billing status and lets staff mark orders as paid.
- Uses WebSockets for immediate UI updates across clients.

## Technology Stack

- Frontend: **Next.js 14.2.3**, **React 18**, **TypeScript**, **Tailwind CSS**, **Axios**, **Zustand**, **STOMP/WebSocket**
- Backend: **Java 17**, **Spring Boot 3.2.5**, **Spring Web**, **Spring Data JPA**, **Spring WebSocket**, **Spring Security**
- Database: **H2 in-memory** (default for local development)
- Packaging: **Maven wrapper** (`mvnw.cmd` / `./mvnw`)

## Project Contents

- `backend/` — Java Spring Boot application that serves the API, manages table/order state, and broadcasts real-time updates.
- `frontend/` — Next.js application with pages for the floor map, menu, kitchen display, and billing.
- `docker-compose.yml` — optional PostgreSQL + Redis service definitions, included for future persistence support.
- `Guide.txt` — detailed architecture and directory structure documentation.

## How to Run the Project

### Prerequisites
- Node.js v18 or higher
- Java JDK 17 or higher
- Git (optional)

### Start the Backend
Open a terminal and run:
```bash
cd backend
.\mvnw.cmd spring-boot:run
```
If you want to build and run the packaged jar instead:
```bash
cd backend
.\mvnw.cmd clean package
java -jar target/backend-0.0.1-SNAPSHOT.jar
```
The backend listens on `http://localhost:8080` by default.

### Start the Frontend
In another terminal, run:
```bash
cd frontend
npm install
npm run dev
```
If port 3000 is already in use, Next.js will automatically try 3001 or 3002.
Open the URL shown in the terminal, usually `http://localhost:3002`.

### Optional: H2 Console
The backend uses an in-memory H2 database for development.
Open the H2 console at:
```
http://localhost:8080/h2-console
```
Use this JDBC URL:
```
jdbc:h2:mem:robms_db
```
Username: `sa`
Password: `password`

## How the System Works

1. The frontend shows a floor map with tables.
2. Clicking a table opens the menu for that table.
3. Users add menu items, set quantities, and submit the order.
4. The backend saves the order and updates the table's status.
5. Kitchen staff can view and update order status in real-time.
6. Billed tables are shown separately and can be closed when payment is received.

## Important Notes

- Data is reset when the backend restarts, because the default database is in-memory.
- The `docker-compose.yml` file is included for future PostgreSQL/Redis usage, but the current default configuration uses H2.
- If you want persistent database storage, you must update `backend/src/main/resources/application.properties` to use PostgreSQL and enable Docker compose.

## Troubleshooting

- If the frontend shows only a few menu items, refresh the browser or clear cache.
- If the backend fails to start with `java -jar`, rebuild with:
  ```bash
  cd backend
  .\mvnw.cmd clean package
  ```
- If `npm run dev` fails because port 3000 is in use, use the local URL shown in the terminal.

## Where to Find More Information

- See `Guide.txt` for a deeper explanation of the backend and frontend directory layout.
- Look in `backend/src/main/java/com/robms/config` for security, WebSocket, and data initialization behavior.
- Look in `frontend/src/app` to see the main user interface pages.
