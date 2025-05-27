# VoteWise - Online Voting System

A modern, secure, and user-friendly online voting system built with React, Supabase, and Tailwind CSS. Create polls, gather votes, and analyze results in real-time.

![VoteWise Screenshot](https://images.pexels.com/photos/1550337/pexels-photo-1550337.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2)

## Features

- 🔐 Secure user authentication
- 📊 Create and manage polls
- 🗳️ Vote on polls with real-time updates
- 📈 View detailed poll results
- 🌓 Dark mode support
- ⏰ Poll expiration functionality
- 📱 Responsive design
- 🔒 Role-based access control

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **Hosting**: Netlify

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/votewise.git
   cd votewise
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

### Database Setup

The project uses Supabase migrations for database management. The migrations are located in the `supabase/migrations` directory.

To set up the database:

1. Create a new Supabase project
2. Connect to your project using the Supabase CLI
3. Run the migrations

## Project Structure

```
votewise/
├── src/
│   ├── components/     # Reusable UI components
│   ├── context/        # React context providers
│   ├── lib/           # Utility functions and configurations
│   ├── pages/         # Page components
│   └── types/         # TypeScript type definitions
├── supabase/
│   └── migrations/    # Database migrations
└── public/           # Static assets
```

## Features in Detail

### Authentication
- Email and password authentication
- Protected routes
- Persistent sessions

### Poll Management
- Create polls with multiple options
- Set poll expiration dates
- View real-time results
- Share polls via social media

### Voting System
- One vote per user per poll
- Real-time vote counting
- Prevention of creator voting on own polls
- Expiration date enforcement

## Security Measures

- Row Level Security (RLS) policies
- Secure authentication flow
- Environment variable protection
- SQL injection prevention
- XSS protection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Icons by [Lucide React](https://lucide.dev)
- UI design inspiration from modern web applications
- Stock photos from [Pexels](https://www.pexels.com)
