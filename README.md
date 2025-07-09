# Slack Clone

A modern, full-stack Slack clone built with Next.js, Convex, and TypeScript. This project demonstrates real-time messaging, channels, direct messages, reactions, file uploads, and workspace management, providing a collaborative chat experience similar to Slack.

## Features
- User authentication and workspace management
- Public and private channels
- Direct (1:1) messaging
- Real-time message updates
- Emoji reactions
- File uploads
- Member invitations and roles
- Responsive, modern UI

## Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Convex (serverless database & functions)
- **State Management:** Jotai
- **Authentication:** Custom (see `convex/auth.ts`)
- **Other:** Bun (optional), PostCSS

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Bun (optional, for faster installs)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd slack-clone
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```
3. **Set up environment variables:**
   - Copy `.env.example` to `.env` and fill in required values (if present).
   - Configure Convex and authentication as needed.
4. **Run the development server:**
   ```bash
   npm run dev
   # or
   bun run dev
   ```
5. **Open [http://localhost:3000](http://localhost:3000) in your browser.**

## Project Structure
```
slack-clone/
  convex/           # Convex backend functions & schema
  src/
    app/            # Next.js app directory (routing, pages)
    components/     # Shared React components
    features/       # Feature-based modules (auth, channels, messages, etc.)
    hooks/          # Custom React hooks
    lib/            # Utility functions
  public/           # Static assets
  package.json      # Project metadata & scripts
  tailwind.config.ts# Tailwind CSS config
```

## Scripts
- `dev` - Start the development server
- `build` - Build for production
- `start` - Start the production server
- `lint` - Run linter

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## License
[MIT](LICENSE)

## Deployment
The live app is available at: [Live Demo](https://slack-clone-chi-five.vercel.app)
