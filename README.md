## Kanban Board Application

This is a basic Kanban board application that allows users to manage and persist tasks across various stages, such as:
- To Do
- In Progress
- Done

## System requirement


- Tested on macOS Monterey
- NodeJS version v18.20.4
- NPM version 10.7.0
- PHP version 8.4.5
- Laravel version 12
- Vue.js version 3
- Sqlite


## Database setup

env
- DB_CONNECTION=sqlite


## Steps to configure app

1. Clone the Repository
    - git clone git@github.com:bishaljoshi/kanban-board.git
2. Set Up Environment Variables
    - Open the project in terminal
    - cp .env.example .env
3. Modify the .env file:
    - Open the project in VSCode or any other code editor
    - DB_CONNECTION=sqlite
4. Run the command
    - npm install && npm run build && composer run dev
    - php artisan migrate
    - php artisan serve

    #### Using Docker

5. Build and start the containers
    - docker-compose up -d --build
6. Run database migrations
    - docker-compose exec app php artisan migrate
7. Run Laravel development server
    - docker-compose exec app php artisan serve

## Commands used

- php artisan make:controller [ControllerName] - Create controllers for managing user input and handling actions like logging in or updating profiles.
- php artisan make:model [ModelName] - Create models for interacting with database records, such as products, users, or orders.
- php artisan migrate - Make changes to your database, like adding tables or modifying columns, without manually writing SQL.
- php artisan migrate:fresh - Reset your database during development, ensuring a clean slate for testing or rebuilding your schema.
- php artisan test - Validate your application’s functionality and ensure that features are working as intended before deploying
- php artisan serve - Running php artisan serve starts the Laravel development server. 

## Packages used

#### Backend
- Framework: Laravel (Version 12)
- Database: SQLite
- API Handling: Laravel API Routes & Controllers
- ORM: Eloquent
- Version Control: Git with micro-commits

#### Frontend
- Framework: Vue 3 (with Inertia.js)
- Language: TypeScript
- State Management: Vue Reactive Composition API
- Drag & Drop: VueDraggableNext
- Error Message: vue-toaster
- Styling: Tailwind CSS
- Routing: Inertia.js
- Axios: For API calls

#### DevOps
- Docker (For Containerization)
- Nginx (As a Web Server)
- PHP-FPM (For Laravel Backend)
- Node.js (For Vue.js Compilation)

## Additional Info

- We have included created_by, updated_by, and deleted_by columns in the tasks table to track who created, updated, and deleted each task.
- As authentication is not required as per the requirement, these fields are temporarily set to 1.