This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, install dependencies:

```bash
npm install
```

Then, set up the environment variables by copying `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the `.env` file with your actual values:

- `DATABASE_URL`: Your PostgreSQL database connection string (Neon database recommended)
- `JWT_SECRET`: A strong random string (minimum 32 characters) for JWT token signing
- `JWT_REFRESH_SECRET`: A strong random string (minimum 32 characters) for refresh token signing

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Variables

The following environment variables are required for the application to function:

- `DATABASE_URL`: PostgreSQL database connection string
- `JWT_SECRET`: Secret key for signing JWT access tokens (min 32 characters)
- `JWT_REFRESH_SECRET`: Secret key for signing JWT refresh tokens (min 32 characters)
- `NODE_ENV`: Environment (development/production)

For security, generate strong random secrets for production:

```bash
# Generate JWT secrets (example using Node.js)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

**Important:** Before deploying to Vercel, make sure to add the required environment variables in your Vercel project settings:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:
   - `DATABASE_URL`: Your production database connection string
   - `JWT_SECRET`: A strong random string (min 32 characters)
   - `JWT_REFRESH_SECRET`: A strong random string (min 32 characters)

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
