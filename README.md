# Chirpy API

Chirpy is the new world's best social media platform.
This chirpy's RestAPI.

## Endpoints:

- GET: /api/healthz => simply shows wether the server is online and listening

- POST: /api/users => registers a new user. See Request Bodies below
- PUT: /api/users => updates existing user info. See Request Bodies below. **Requires Athentication**
- POST: /api/login => authenticates a user and returns an Asccess Token and Refresh Token. See Request Bodies below

- POST: /api/chirps => creates a new chirp. See Request Bodies below. **Requires Athentication**
- GET: /api/chirps/:authorId?/:sort? => returns a list of chirps. Optionally filtered by author id. sort query can be _asc_ or _desc_. _asc_ is the default sort order.
- GET: /api/chirps/:chirpID => returns a specific chirp
- DELETE: /api/chirps/:chirpID => deletes a specifiv chirp. **Requires Athentication** 

- POST: /api/refresh => Refreshes access token. **Requires Refresh Token**
- POST: /api/revoke => Revokes refresh token. **Requires Refresh Token**

All endpoints marked with **Requires Athentication** require and Authentication header container a Bearer Token provided from /api/login endpoint.

## Rquest Bodies

### POST /api/users
### PUT /api/users
### POST /api/login
```
{
    email: string,
    password: string,
}
```

### POST /api/chirps
```
{
    body: string,
    userId: string,
}
```

## Response Bodies
### POST /api/users
### PUT /api/users
```
{
    id: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
    isChirpyRed: bool
}
```

### POST /api/login
```
{
    id: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
    isChirpyRed: bool
    token: string
    refreshToken: string
}
```

### POST /api/refresh
```
{
    token: string
}
```

### POST /api/chirps
```
{
    userId: string,
    body: string
}
```

### GET /api/chirps
```
[
    {
        id: string,
        createdAt: Date,
        updatedAt: Date,
        body: string,
        userId: string
    },
]
```
### GET /api/chirps/:chirpID
```
{
    id: string,
    createdAt: Date,
    updatedAt: Date,
    body: string,
    userId: string
}
```