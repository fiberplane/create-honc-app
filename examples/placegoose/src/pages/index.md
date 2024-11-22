## Try it!
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

/gaggles - 10 gaggles
/geese - 100 geese, each part of a gaggle
/honks - 500 honks, each made by a goose

Note: relations

## Routes
### Gaggles
GET /gaggles
POST /gaggles
GET /gaggles/1
GET /gaggles/1/geese
PUT /gaggles/1
DELETE /gaggles/1
### Geese
GET /geese
GET /geese/:id
GET /geese/:id/honks
### Honks
GET /honks
POST /honks
GET /honks/1
PATCH /honks/1
PUT /honks/1
DELETE /honks/1

## Use your own data
- update the schema, if you'd like, and the seed file
- generate + seed


```typescript
fetch("PROD_URL/honks/1")
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```

```typescript
fetch("PROD_URL/honks")
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```
-> 200, array of records

```typescript
fetch("PROD_URL/honks?gooseId=1")
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```
-> 200, array of records

```typescript
fetch("PROD_URL/honks", {
    method: "POST",
    body: JSON.stringify({}),
    headers: {
        "Content-Type": "application/json; charset=UTF-8",
    },
})
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```
-> 201, record
Note: no real update

```typescript
fetch("PROD_URL/honks", {
    method: "PUT",
    body: JSON.stringify({}),
    headers: {
        "Content-Type": "application/json; charset=UTF-8",
    },
})
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```
-> 200, record

```typescript
fetch("PROD_URL/honks", {
    method: "PATCH",
    body: JSON.stringify({}),
    headers: {
        "Content-Type": "application/json; charset=UTF-8",
    },
})
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```
-> 200, record

```typescript
fetch("PROD_URL/honks", {
    method: "DELETE",
})
    .then((response) => response.json())
    .then((json) => console.log(json))
    .catch((error) => console.error(error));
```
-> 204, null