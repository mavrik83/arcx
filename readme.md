# ArcX

<div align="center">
  <strong>Lightweight, Type-Safe API Request Control</strong>
  <br />
  <sub>Zero dependencies • ~2KB minified • React + Node.js compatible</sub>
</div>

<br />

[![npm version](https://img.shields.io/npm/v/arcx.svg)](https://www.npmjs.com/package/arcx)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✨ **Modern & Lightweight**

- Zero dependencies
- TypeScript-first with full type safety
- ~2KB minified
- Built for React 18+ and Node.js environments

🔧 **Powerful & Flexible**

- Global configuration with local overrides
- Request/Response/Error interceptors
- Automatic retries and timeout handling
- Query parameter handling
- File upload support

⚛️ **React Integration**

- React hooks (`useFetch`, `useFetchSuspense`)
- Context provider for global config
- Next.js App Router compatible
- Optional Suspense support

## Quick Start

```bash
npm install arcx
```

### Basic Usage

```typescript
import { configureArcX, fetchRequest } from "arcx";

// Optional global config
configureArcX({ 
  baseUrl: "https://api.example.com",
  headers: { "Authorization": "Bearer token" }
});

// Type-safe requests
interface User {
  id: number;
  name: string;
}

const user = await fetchRequest<User>("/users/1");
console.log(user.name); // TypeScript knows this exists!
```

### React Hook

```tsx
import { useFetch } from "arcx";

function UserProfile() {
  const { data, isLoading, error, refetch } = useFetch<User>("/users/1");

  if (isLoading) return <Spinner />;
  if (error) return <Error message={error.message} />;

  return (
    <div>
      <h1>{data.name}</h1>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## Core Concepts

### Global Configuration

Configure once, use anywhere:

```typescript
configureArcX({
  baseUrl: "https://api.example.com",
  headers: {
    "Authorization": "Bearer token",
    "Content-Type": "application/json"
  },
  interceptors: {
    onRequest: (config) => {
      // Modify request config
      return config;
    },
    onResponse: (response) => {
      // Transform response
      return response;
    },
    onError: (error) => {
      // Handle or log errors
      console.error(error);
    }
  }
});
```

### React Provider

For React applications, wrap your app with `ArcXProvider`:

```tsx
import { ArcXProvider } from "arcx";

function App() {
  return (
    <ArcXProvider 
      baseUrl="https://api.example.com"
      headers={{ Authorization: "Bearer token" }}
    >
      <YourApp />
    </ArcXProvider>
  );
}
```

### Advanced Features

#### Retry Mechanism

```typescript
const data = await fetchRequest("/api/unstable", {
  retries: 3, // Retry 3 times with exponential backoff
  timeout: 5000 // 5 second timeout
});
```

#### File Uploads

```typescript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

await fetchRequest("/api/upload", {
  method: "POST",
  body: formData
});
```

#### Query Parameters

```typescript
const users = await fetchRequest("/api/users", {
  queryParams: {
    page: 1,
    limit: 10,
    search: "john"
  }
}); // => /api/users?page=1&limit=10&search=john
```

#### Manual Fetching

```typescript
const { data, refetch } = useFetch("/api/data", { 
  manual: true // Don't fetch on mount
});

useEffect(() => {
  refetch(); // Fetch when needed
}, [someCondition]);
```

## Next.js Integration

ArcX works seamlessly with Next.js App Router. Create a client provider:

```tsx
// app/providers.tsx
"use client";

export function Providers({ children }) {
  return (
    <ArcXProvider baseUrl={process.env.NEXT_PUBLIC_API_URL}>
      {children}
    </ArcXProvider>
  );
}
```

Use in your layout:

```tsx
// app/layout.tsx
import { Providers } from "./providers";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

## TypeScript Support

ArcX is written in TypeScript and provides full type safety:

```typescript
interface User {
  id: number;
  name: string;
}

// Type-safe response
const { data } = useFetch<User>("/user");
console.log(data.name); // TypeScript knows this exists

// Type-safe error handling
interface ApiError {
  code: string;
  message: string;
}

configureArcX({
  interceptors: {
    onError: (error: ApiError) => {
      console.error(error.code); // Type-safe error handling
    }
  }
});
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## License

MIT © [Ryan Huber](LICENSE)
