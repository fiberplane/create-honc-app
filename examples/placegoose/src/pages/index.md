## Try it now!
Run this code in a console, or from any app:
```typescript
fetch("PROD_URL/geese/1")
    .then((response) => response.json())
    .then((json) => console.log(json));
```
## When to use
Placegoose is a free online REST API **whenever you need some fake data**. It can be for any reason

## Resources
By default, Placegoose comes with 3 goose-themed resources:
| | |
|-|-|
|/gaggles|10 gaggles|
|/geese|100 geese, each part of a gaggle|
|/honks|500 honks, each made by a goose|

_Note: relations_

## Routes
### Gaggles
| | |
|-|-|
|GET|/gaggles|
|POST|/gaggles|
|GET|/gaggles/1|
|GET|/gaggles/1/geese|
|PUT|/gaggles/1|
|DELETE|/gaggles/1|
### Geese
| | |
|-|-|
|GET|/geese|
|GET|/geese/:id|
|GET|/geese/:id/honks|
### Honks
| | |
|-|-|
|GET|/honks|
|POST|/honks|
|GET|/honks/1|
|PATCH|/honks/1|
|PUT|/honks/1|
|DELETE|/honks/1|

## Use your own data
Clone the repo
1. Update the schema to
- update the schema, if you'd like, and the seed file
- generate + seed

## Making requests
- **No updates are made to the DB.** Responses to write operations are simulated by merging the validated request payload with the stored data.
- We use integer IDs for convenience. Production DBs should use an ID system that obscures database architecture, like UUIDs.
- This API is JSON-first! At this time, only JSON payloads are accepted for write operations.
- We validate. Malformed payloads will result in a 400, making it possible to demo error flows.
- Write operations against records that do not exist will return a 404.

### Get All Records
Filtering, sorting, and pagination are not currently supported.
```typescript
fetch("PROD_URL/honks")
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
    {
        "id": 2,
        "gooseId": 27,
        "decibels": 75
    },
    // ...
    {
        "id": 100,
        "gooseId": 17,
        "decibels": 82
    },
]
```
### Get All Records (Filtered by relation)
This feature is only supported by the `/honks` route at this time.
_Note: Only integer IDs are accepted. Will return 404 if record does not exist_
```typescript
fetch("PROD_URL/honks?gooseId=1")
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
### Create Record
Only accepts JSON. Invalid payloads will return a `400`.
_Note: No record will be created_
```typescript
fetch("PROD_URL/honks", {
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
### Get Record By ID
Only accepts JSON. Invalid payloads will return a `400`.
_Note: Only integer IDs are accepted. Will return 404 if record does not exist_
```typescript
fetch("PROD_URL/honks/1")
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
### Update Record
_Note: Updating foreign key properties (e.g., Honk.gooseId) is not allowed_
```typescript
fetch("PROD_URL/honks/1", {
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
### Modify Record
```typescript
fetch("PROD_URL/honks/1", {
    method: "PATCH",
    body: JSON.stringify({
        "decibels": "36"
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
### Delete Record
```typescript
fetch("PROD_URL/honks", {
    method: "DELETE",
})
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```
Status: `204`