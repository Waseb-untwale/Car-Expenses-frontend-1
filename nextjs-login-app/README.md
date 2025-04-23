# Next.js Login App

This is a simple Next.js application that features a basic "Hello World" login page component. The application is structured to manage user authentication and display success or error messages.

## Project Structure

```
nextjs-login-app
├── public
│   └── favicon.ico
├── src
│   ├── app
│   │   ├── components
│   │   │   └── Login
│   │   │       └── page.jsx
│   │   └── page.jsx
├── styles
│   └── globals.css
├── .gitignore
├── package.json
├── README.md
└── next.config.js
```

## Getting Started

To get started with this project, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd nextjs-login-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

## Features

- A simple login form that accepts email and password.
- Displays success messages upon successful login.
- Shows error messages for invalid credentials.

## Technologies Used

- Next.js
- React
- Tailwind CSS (for styling)
- React Toastify (for notifications)

## License

This project is licensed under the MIT License.