# Abnormal Transaction Monitoring System

## Overview
The Abnormal Transaction Monitoring System is a real-time application designed to detect and monitor suspicious transaction patterns, particularly focusing on identifying potential spam or fraudulent activity. The system analyzes transactions by looking for duplicate or abnormal patterns based on MSISDN (mobile number) and broadcast dates.

## Features
- **Real-time Monitoring**: Continuously scans transaction data to identify suspicious patterns
- **Duplicate Detection Algorithm**: Uses an efficient two-pass algorithm to identify transactions with the same MSISDN sent within 1 second
- **Interactive Dashboard**: Visualizes detected abnormal transactions with filtering and sorting capabilities
- **User Authentication**: Secure JWT-based authentication system
- **Test Data Generation**: Built-in functionality to generate dummy transaction data for testing

## System Architecture
- **Backend**: ASP.NET Core API with Entity Framework Core for data access
- **Frontend**: Angular application with responsive UI
- **Database**: SQL Server database with Entity Framework for ORM

## Prerequisites
- .NET 7.0 SDK or later
- Node.js (v16 or later) and npm
- Angular CLI
- SQL Server instance

## Setup Instructions

### Backend Setup
1. Navigate to the API directory:
   ```
   cd API
   ```

2. Create a `.env` file in the API directory with the following configuration:
   ```
   DB_SERVER=your_sql_server_address
   DB_NAME=your_database_name
   DB_USERNAME=your_database_username
   DB_PASSWORD=your_database_password
   JWT_KEY=your_secret_jwt_key
   ```
   Replace the placeholder values with your actual database connection details and a secure JWT key.

3. Install .NET dependencies:
   ```
   dotnet restore
   ```

4. Apply database migrations:
   ```
   dotnet ef database update
   ```

5. Run the API:
   ```
   dotnet run
   ```
   The API will start running at http://localhost:5000

### Frontend Setup
1. Navigate to the client directory:
   ```
   cd client
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the Angular development server:
   ```
   npm start
   ```
   The frontend will be available at http://localhost:4200

## Using the Application

### User Registration and Login via Postman
To create a new user using Postman:

1. Open Postman and create a new request
2. Set the request type to `POST`
3. Set the URL to `http://localhost:5000/api/account/register`
4. Set the request body to raw JSON format with the following structure:
   ```json
   {
     "username": "yourUsername",
     "password": "yourPassword"
   }
   ```
5. Send the request to create a new user
6. To login, create another `POST` request to `http://localhost:5000/api/account/login` with the same JSON structure
7. The response will include a JWT token that can be used for authenticated requests

### Monitoring Abnormal Transactions
1. Login to the application using your credentials
2. On the dashboard, click the "START MONITORING" button to begin scanning for abnormal transactions
3. The system will automatically detect and display suspicious transaction patterns
4. You can stop monitoring at any time by clicking the "STOP MONITORING" button

### Generating Test Data
1. Ensure you are logged in to the application
2. From the dashboard, click the "GENERATE 100 TRANSACTIONS" button
3. The system will create 100 dummy transactions with some abnormal patterns
4. Start monitoring to see the detected abnormal patterns in the generated data

## Understanding Abnormal Transactions
The system identifies transactions as abnormal when:
- Multiple messages are sent from the same MSISDN (phone number)
- The messages are sent within a very short time period (≤ 1 second)
- The content often includes suspicious keywords like "URGENT" or "Claim your prize"

## API Endpoints
- `GET /api/transaction/duplicates` - Retrieves all detected abnormal transactions
- `POST /api/transaction/generate-dummy?count=n` - Generates n dummy transactions (requires authentication)
- `POST /api/account/register` - Registers a new user
- `POST /api/account/login` - Authenticates a user and returns a JWT token

## Troubleshooting
- If the frontend cannot connect to the API, verify that the API is running on the correct port
- Ensure that CORS is properly configured if you're running the frontend and backend on different ports
- Verify that your SQL Server is running and accessible with the credentials provided in the .env file
- Verify that you're using a valid JWT token for authenticated endpoints 