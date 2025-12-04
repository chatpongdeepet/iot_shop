# IoT Shop Project

A full-stack e-commerce application for IoT devices, built with FastAPI, React, and PostgreSQL.

## Prerequisites

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Installation & Setup

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone <repository-url>
    cd iot-shop-project
    ```

2.  **Configure Environment Variables**:
    Copy the example environment file to create your local configuration:
    ```bash
    cp .env.example .env
    ```
    
    Open `.env` and update the following variables:
    -   **Database**: `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` (Defaults provided)
    -   **Cloudinary** (Required for image uploads):
        -   `CLOUDINARY_CLOUD_NAME`
        -   `CLOUDINARY_API_KEY`
        -   `CLOUDINARY_API_SECRET`

## Running the Application

Start the application using Docker Compose:

```bash
docker-compose up --build
```

This command will build the images and start the services.

## Accessing the Application

Once the services are running, you can access them at:

-   **Frontend (Storefront & Admin)**: [http://localhost:5173](http://localhost:5173)
-   **Backend API Docs (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
-   **Database Management (Adminer)**: [http://localhost:8080](http://localhost:8080)
    -   System: PostgreSQL
    -   Server: `db`
    -   Username/Password/Database: As defined in your `.env` file.
    -   User Admin (for testing)
        -   Username: admin@admin.com
        -   Password: password1234
    

## Features

-   **User Authentication**: Register and login.
-   **Product Management**: Admin dashboard to create, update, delete products with image uploads.
-   **Shopping Cart**: Add items to cart and manage quantities.
-   **Analytics**: Admin dashboard for sales and visitor analytics.
