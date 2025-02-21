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

### ArcXProvider (Optional)

If you’re building a React application, you can wrap your app with the `ArcXProvider` for a simpler configuration:

```tsx
import { ArcXProvider } from "arcx";

function App() {
  return (
    <ArcXProvider
      baseUrl="https://api.example.com"
      headers={{ Authorization: "Bearer token" }}
    >
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
