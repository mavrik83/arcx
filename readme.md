# ArcX - API Request Control

## Overview

ArcX is a lightweight, dependency-free fetch utility for handling API requests in both React and non-React environments. It provides an easy-to-use API for global configurations, interceptors, and retry mechanisms while remaining highly performant and flexible.

## Installation

To install ArcX, use npm:

```bash
npm install arcx
```

## Usage

### Configuring ArcX

Set up global configurations using `configureArcX`:

```ts
import { configureArcX } from "arcx";

configureArcX({
  baseUrl: "https://api.example.com",
  headers: { "Authorization": "Bearer token" },
  interceptors: {
    onRequest: (config) => {
      // Modify request
      return config;
    },
    onResponse: (response) => {
      // Modify response
      return response;
    },
    onError: (error) => {
      console.error(error);
    },
  },
});
```

### Fetching Data in Non-React Environments

Use `fetchRequest` to make API calls:

```ts
import { fetchRequest } from "arcx";

async function getUser() {
  try {
    const user = await fetchRequest<{ id: number; name: string }>("/user/1");
    console.log(user);
  } catch (error) {
    console.error(error);
  }
}
```

### Fetching Data in React Components

Use `useFetch` for API calls inside React components:

```tsx
import { useFetch } from "arcx";

function UserComponent() {
  const { data, isLoading, error, refetch } = useFetch<{ id: number; name: string }>("/user/1");

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <p>User: {data?.name}</p>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

## API Reference

### `configureArcX(config: ArcXConfig): void`

Configures global settings.

### `fetchRequest<T>(url: string, options?: FetchOptions): Promise<T>`

Makes a fetch request with optional configurations.

### `useFetch<T>(url: string, options?: FetchOptions & { manual?: boolean })`

React hook for API fetching with built-in state management.

## Features

- No Dependencies
- Type-Safe API with TypeScript Generics
- Lightweight (~2KB minified)
- Global Configuration with Overrides
- Interceptors for Requests, Responses, and Errors
- Automatic JSON Parsing
- Fetch Requests with Retry Mechanisms
- Timeout Support
- Abort Controller for Cancellation
- Query Parameter Handling
- React Hook with Manual or Automatic Fetching

## License

MIT License

## Contributing

Pull requests and issues are welcome!
