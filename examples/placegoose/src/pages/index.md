## Take a gander!
```typescript
// Run this code in a console, or from any app:
fetch("https://placegoose.mies.workers.dev/geese/1")
    .then((response) => response.json())
    .then((json) => console.log(json));
```

## What's it good for?
Placegoose is a free online REST API for moments when you **just need some honkin data**! More than that, it's a learning resource for building blazing-fast REST APIs with the [HO(N)C stack.](https://honc.dev/#overview) You're welcome to use it as a reference, or clone the repo and modify the schema to fit your use-case.

## How does the API work?
Placegoose comes with 3 goose-themed resources, supporting _up to_ all 5 common HTTP verbs. We don't actually make updates to the DB in response to write requests, but we do validate payloads and verify the target exists. If something's not right, we'll return an error with a helpful message.

To learn more about making requests, or what different errors mean, [check out our guide!](#guide)

### Resources {#resources}
| | |
|-|-|
|[/gaggles](#gaggles-routes)|10 gaggles|
|[/geese](#geese-routes)|100 geese, each part of a gaggle|
|[/honks](#honks-routes)|500 honks, each made by a goose|

## Flying solo
You might want to build your own (mock?) data service, or may just be curious about the stack. This project was built using [Hono](https://hono.dev/) and [Drizzle ORM](https://orm.drizzle.team/) to highlight core features and implementation patterns. For more examples, or to get going with a template, [check out our repo.](https://github.com/fiberplane/create-honc-app)

Take a deep dive into the development process and key features of the stack in our blog post. You'll need a basic understanding of TypeScript REST APIs and Cloudflare, but we tried to cover everything you'll need to get started!

## Making requests {#guide}
- **No updates are made to the DB.** Responses to write operations are simulated by merging the validated request payload with the stored data.
- We use integer IDs for convenience. Production DBs should use an ID system that obscures database architecture, like UUIDs.
- We validate. Write resources expect a JSON payload, and malformed payloads will result in a `400`, making it possible to demo error flows.
- Write operations against records that do not exist will return a `404`.

#### Reference

|||
|-|-|
|[Get All](#guide-get-all)|[Create](#guide-create)|
|[Get All (By Relation)](#guide-get-all-relation)|[Modify](#guide-modify)|
|[Get By Id](#guide-get-by-id)|[Delete](#guide-delete)|
|[Update](#guide-update)|[Errors](#guide-errors)|

### Get All Records {#guide-get-all}
_Filtering, sorting, and pagination are not currently supported._

```typescript
fetch("https://placegoose.mies.workers.dev/honks")
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```

Status: `200`

```json
[
    {
        "id": 1,
        "gooseId": 16,
        "decibels": 104
    },
    // ...
    {
        "id": 100,
        "gooseId": 17,
        "decibels": 82
    },
]
```

### Get All Records (Filtered by relation) {#guide-get-all-relation}
_This feature is only available for the `/honks` resource at this time._

```typescript
fetch("https://placegoose.mies.workers.dev/honks?gooseId=1")
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```

Status: `200`

```json
[
    {
        "id": 78,
        "gooseId": 17,
        "decibels": 110
    },
    {
        "id": 100,
        "gooseId": 17,
        "decibels": 82
    }
]
```

### Create Record {#guide-create}
_Geese cannot be created by API request._

```typescript
fetch("https://placegoose.mies.workers.dev/honks", {
    method: "POST",
    body: JSON.stringify({
        gooseId: 42,
        decibels: 64,
    }),
    headers: {
        "Content-Type": "application/json; charset=UTF-8",
    },
})
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```

Status: `201`

```json
{
    "id": 325,
    "gooseId": 42,
    "decibels": 64
}
```

### Get Record By ID {#guide-get-by-id}

```typescript
fetch("https://placegoose.mies.workers.dev/honks/1")
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```

Status: `200`

```json
{
    "id": 1,
    "gooseId": 16,
    "decibels": 104
}
```

### Update Record {#guide-update}
_In most cases, PUTs update the whole record, but honks are read-only properties._

```typescript
fetch("https://placegoose.mies.workers.dev/honks/1", {
    method: "PUT",
    body: JSON.stringify({
        decibels: 299,
    }),
    headers: {
        "Content-Type": "application/json; charset=UTF-8",
    },
})
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```

Status: `200`

```json
{
    "id": 1,
    "gooseId": 16,
    "decibels": 299
}
```

### Modify Record {#guide-modify}
_PATCHes accept partial updates._

```typescript
fetch("https://placegoose.mies.workers.dev/honks/1", {
    method: "PATCH",
    body: JSON.stringify({
        decibels: 36,
    }),
    headers: {
        "Content-Type": "application/json; charset=UTF-8",
    },
})
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```

Status: `200`

```json
{
    "id": 1,
    "gooseId": 16,
    "decibels": 36
}
```

### Delete Record {#guide-delete}
_DELETes don't return a body._

```typescript
fetch("https://placegoose.mies.workers.dev/honks", {
    method: "DELETE",
})
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```

Status: `204`

### Errors {#guide-errors}
Whens something goes wrong, we'll try and share a helpful message! If you're running your own instance, use Fiberplane Studio to inspect logs and the request timeline.

```
type ErrorData = {
    message: string;
}
```

|Status|Issue|
|-|-|
|400|Request Error: Make sure the request is properly formatted, and that you're using a valid ID and payload (if applicable).|
|403|Forbidden: The darkness beacons.|
|404|Not Found: Verify you're using an ID within the [resource limits](#resources) or try a Get All request to double-check.|
|500|Something went terribly wrong. If you're using our deployed service, [please create an issue](https://github.com/fiberplane/create-honc-app/issues/new/choose) to let us know.

## Routes {#routes}

### Gaggles {#gaggles-routes}
```typescript
type Gaggle = {
    id: number;
    name: string;
    territory: string | null;
}
```

| | |
|-|-|
|GET|/gaggles|
|POST|/gaggles|
|GET|/gaggles/1|
|GET|/gaggles/1/geese|
|PUT|/gaggles/1|
|DELETE|/gaggles/1|

### Geese {#geese-routes}
```typescript
type Goose = {
    id: number;
    gaggleId: number | null;
    name: string;
    isMigratory: boolean;
    mood: "hangry", "waddling", "stoic", "haughty", "alarmed" | null;
}
```

| | |
|-|-|
|GET|/geese|
|GET|/geese/:id|
|GET|/geese/:id/honks|

### Honks {#honks-routes}
```typescript
type Honk = {
    id: number;
    // Note: honks cannot be reassigned to a different goose
    gooseId: number;
    decibels: number;
}
```

| | |
|-|-|
|GET|/honks|
|GET|/honks?gooseId=1|
|POST|/honks|
|GET|/honks/1|
|PATCH|/honks/1|
|PUT|/honks/1|
|DELETE|/honks/1|
