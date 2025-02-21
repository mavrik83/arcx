# ArcX - API Request Control

## Overview

ArcX is a lightweight, dependency-free fetch utility for handling API requests in both React and non-React environments. It provides an easy-to-use API for global configurations, interceptors, and retry mechanisms while remaining highly performant and flexible.

## Installation

```bash
npm install arcx
```

## Quick Start

```ts
import { configureArcX, fetchRequest } from "arcx";

// 1. Configure ArcX globally
configureArcX({ baseUrl: "https://api.example.com" });

// 2. Fetch data anywhere
async function getData() {
  const data = await fetchRequest("/some-endpoint");
  console.log(data);
}
```

## Using ArcX in React

### `ArcXProvider` (Optional)

If you’re building a React application, you can wrap your app with the `ArcXProvider` for a simpler configuration:

```tsx
import { ArcXProvider } from "arcx";

function App() {
  return (
    <ArcXProvider baseUrl="https://api.example.com" headers={{ Authorization: "Bearer token" }}>
      {/* ...rest of your app */}
    </ArcXProvider>
  );
}
```

### `useFetch` Hook

```tsx
import { useFetch } from "arcx";

function UserComponent() {
  const { data, isLoading, error, refetch } = useFetch("/api/user");

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <p>User: {JSON.stringify(data)}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

### Suspense Support (Optional)

If you use React 18 Suspense, you can import `useFetchSuspense`:

```tsx
import React, { Suspense } from "react";
import { useFetchSuspense } from "arcx";

function MySuspenseComponent() {
  const data = useFetchSuspense("/api/hello");
  return <div>{JSON.stringify(data)}</div>;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MySuspenseComponent />
    </Suspense>
  );
}
```

## Using ArcX with Next.js (App Router)

With Next.js 13+ (App Router), you can still use `ArcXProvider` in a **Client Component**. For example, create a `providers.tsx` file:

```tsx
"use client";

import React from "react";
import { ArcXProvider } from "arcx";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ArcXProvider
      baseUrl="https://api.example.com"
      interceptors={{
        onError: (error) => {
          console.error("[ArcX] Global error:", error);
        },
      }}
    >
      {children}
    </ArcXProvider>
  );
}
```

Then, in your `layout.tsx` or a similar Server Component, render `<Providers>`:

```tsx
// app/layout.tsx (Server Component by default)
import React from "react";
import { Providers } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

Since `Providers` is a **Client Component**, you can safely pass function-based interceptors to `ArcXProvider`.

### Fetching in Next.js

- **Client-side Fetches**: Use `useFetch` or `fetchRequest` in Client Components.  
- **Server-side Fetches**: You can call `fetchRequest` in a server route or Server Component, but be aware that interceptors requiring browser APIs (like `useEffect`) won’t apply in SSR-only contexts. If you need global config on the server, call `configureArcX` in your server code with the appropriate settings.

## Using ArcX in Non-React / Node

ArcX is not limited to React. You can simply import `fetchRequest` in any Node or browser-based script:

```ts
import { configureArcX, fetchRequest } from "arcx";

// Optional global config
configureArcX({ baseUrl: "https://api.example.com" });

async function main() {
  const data = await fetchRequest("/endpoint", { method: "GET" });
  console.log("Data:", data);
}

main().catch(console.error);
```

You can still provide interceptors if you like:

```ts
configureArcX({
  interceptors: {
    onRequest: (req) => {
      req.headers = { ...req.headers, "X-Custom": "Value" };
      return req;
    },
  },
});
```

## Key Features

- **No Dependencies**  
- **Type-Safe API with TypeScript Generics**  
- **Lightweight (~2KB minified)**  
- **Global Configuration with Overrides**  
- **Interceptors for Requests, Responses, and Errors**  
- **Flexible Response Parsing**  
- **Automatic JSON Parsing by Default**  
- **Fetch Requests with Retry Mechanisms**  
- **Timeout Support**  
- **Abort Controller for Cancellation**  
- **Query Parameter Handling**  
- **React Hook with Manual or Automatic Fetching**  
- **(Optional) Suspense Support**  

## Advanced Usage

### Manual Fetch (No Auto Fire)

```ts
const { data, error, refetch } = useFetch("/api/user", { manual: true });

// Then trigger it as needed
useEffect(() => {
  refetch();
}, []);
```

### File Upload Example

```ts
const formData = new FormData();
formData.append("file", file);

await fetchRequest("/api/upload", {
  method: "POST",
  body: formData,
});
```

### Custom Error Handling

```ts
configureArcX({
  interceptors: {
    onError: (error) => {
      // Possibly handle or re-throw
      console.error("Global ArcX Error:", error);
    },
  },
});
```

## Contributing

Pull requests and issues are always welcome!

## License

MIT
