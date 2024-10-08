# SecureAuthApp

SecureAuthApp is a web application that provides secure user authentication using both local and Google OAuth2 methods. It allows users to register, log in, and manage their secrets anonymously.

## Features

- **Local Authentication**: Register and log in using email and password.
- **Google OAuth2**: Authenticate using Google accounts.
- **Secret Management**: Users can manage and view their secrets.
- **Password Security**: Passwords are hashed with bcrypt.
- **Session Management**: Sessions are handled with express-session.

## Technologies

- **Backend Framework**: [Express.js](https://expressjs.com/) - Minimalist web framework for Node.js.
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Powerful, open-source relational database.
- **Authentication**: [Passport.js](http://www.passportjs.org/) - Middleware for authentication with local strategy and Google OAuth2.
- **Password Hashing**: [bcrypt](https://www.npmjs.com/package/bcrypt) - Library to hash passwords securely.
- **Environment Management**: [dotenv](https://www.npmjs.com/package/dotenv) - Loads environment variables from a `.env` file.
- **Session Management**: [express-session](https://www.npmjs.com/package/express-session) - Middleware for handling sessions.
- **Templating Engine**: [EJS](https://www.npmjs.com/package/ejs) - Embedded JavaScript templating for rendering views.
- **Body Parsing**: [body-parser](https://www.npmjs.com/package/body-parser) - Middleware to parse incoming request bodies.
- **Runtime**: [Node.js](https://nodejs.org/) - JavaScript runtime for building scalable network applications.


## Setup

### 1. Clone the Repository

   
    git clone https://github.com/Manish312002/Lvl_3_SecureAuthApp.git
    cd Lvl_3_SecureAuthApp

### 2. Install Dependencies
  
    npm i express ejs pg body-parser bcrypt passport express-session passport-local dotenv passport-google-oauth2

### 3. Configure Environment Variables

- Create a .env file in the root of your project with the following content:
    ```bash
    SESSION_SECRET=your-session-secret
    PG_USER=your-database-username
    PG_HOST=your-database-host
    PG_DATABASE=your-database-name
    PG_PASSWORD=your-database-password
    PG_PORT=your-database-port
    GOOGLE_CLIENT_ID=your-google-client-id
    GOOGLE_CLIENT_SECRET=your-google-client-secret
    
### 4. Set Up the Database

- Ensure that your PostgreSQL database is running and create the necessary table for user authentication. You can use the following SQL command to create the table:
    ```bash
    CREATE TABLE userauth (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE,
      password varchar(255) NOT NULL,
      secret text
  );

### 5. Start the Application

    node index.js

## Usage

- Homepage (/): Welcome page.
- Login (/login): Login form for local authentication.
- Register (/register): Registration form for new users.
- Submit Secret (/submit): Page for submitting and viewing secrets (authentication required).
- Secrets (/secrets): View your secrets after logging in.
- Google Authentication (/auth/google): Start Google OAuth2 flow.
- Logout (/logout): Log out from the session.

## Contributing

- Feel free to fork the repository and submit pull requests. For major changes, please open an issue first to discuss what you would like to change.


