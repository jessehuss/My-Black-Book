# BetTracker

BetTracker is a web application that allows users to track bets they make with friends. It simplifies bet tracking by providing a clean and structured way to record, update, and settle bets.

## Features

### MVP Features:

- **User Authentication**: Register, login, and manage user accounts.
- **Friend System**: Add and manage friends to create bets with them.
- **Bet Management**: Create, track, and update bets with conditions, odds, and payouts.
- **Bet Participants**: Assign multiple users to a single bet.

### Planned Features:

- Notifications for bet updates and settlements.
- Detailed bet history and statistics.
- Mobile-friendly UI with a potential native mobile app.

## Tech Stack

### Backend:

- **Framework**: Laravel 11
- **Database**: MySQL
- **Authentication**: Laravel Sanctum
- **API**: RESTful API with JSON responses
- **Containerization**: Docker

### Frontend:

- **Framework**: Vue 3 + Vite
- **UI Library**: Tailwind CSS
- **State Management**: Pinia (if needed for global state)

## Development Setup

### Prerequisites

- Docker & Docker Compose
- Node.js & npm (for frontend development)
- Composer (for Laravel dependencies)

### Getting Started

#### Clone the Repository

```sh
git clone https://github.com/your-username/bettracker.git
cd bettracker
```

#### Environment Setup

1. Copy the example environment files:
   ```sh
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
2. Update `.env` files with your local settings.

#### Start the Application

Run the following command to start both frontend and backend services:

```sh
docker-compose up --build
```

The app should now be accessible at:

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8000`

#### Run Migrations

Run the following to set up the database:

```sh
docker exec -it backend-app php artisan migrate --seed
```

## Testing

Run the backend tests with coverage:

```sh
docker-compose exec backend composer test:coverage
```

Run frontend tests with coverage:

```sh
cd frontend
npm run test:coverage
```

## API Documentation

API endpoints are documented in an OpenAPI/Swagger format. Once the app is running, visit:

```
http://localhost:8000/api/documentation
```

## Contributing

1. Fork the repo and create a new branch.
2. Commit your changes with descriptive messages.
3. Open a pull request for review.

## License

This project is licensed under the MIT License.

