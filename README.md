# Cluster Application

This application allows users to connect their Web3 identities and social accounts, combining data to calculate a comprehensive user score.

## Features

- Connect Twitter accounts
- Connect crypto wallets
- Connect Verida accounts (with Telegram data)
- Score calculation based on social activity and wallet holdings
- Leaderboard showing top users

## Setup

### Prerequisites

- Node.js (v16+)
- MongoDB
- Twitter Developer Account (for API keys)
- Verida Account (for API integration)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cluster-main-main
```

2. Install dependencies:
```bash
# Install backend dependencies
cd Backend
npm install

# Install frontend dependencies
cd ../Frontend
npm install
```

3. Set up environment variables:
   - Create a `.env` file in the Backend directory using the `.env.example` as a template
   - Fill in your API keys and configuration values

### Running the Application

1. Start the backend server:
```bash
cd Backend
npm run dev
```

2. Start the frontend application:
```bash
cd Frontend
npm run dev
```

3. Open your browser and navigate to `http://localhost:3000`

## Testing

### Backend Tests

```bash
cd Backend
npm test                # Run all tests
```

## Architecture

The application is divided into:

- **Frontend**: React application with components for different integrations
- **Backend**: Express server handling API integrations and score calculations
- **Database**: MongoDB for storing user data and scores

For more details on specific integrations, see:
- [Verida Integration](Backend/docs/verida-integration.md)

## License

[MIT License](LICENSE) 
