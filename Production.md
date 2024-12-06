# Running development and production instances guide

## Production
1. create production instance on clerk
2. change clerk keys from development keys to production keys
3. create a webhook in production instance with the pseudoai.dev/api/webhooks/clerk path

## Testing Development and Production locally
- You can run the development version locally by using the clerk development keys
- can also test the production instance locally by change the env variables to the clerk production keys

## Adding Users from Clerk to MongoDB in Development mode locally
- waiting to add this functionality in production until all the other functionality is added on the site first
    - ***tracking user progress/how many problems solved***
    - abililty to message other users with web sockets
    - abililty to video call/mock interview with others (web sockets)
    - live coding with friends on the same problem (again will probably use web sockets)

## Workflow I want in the end
- vercel has clerk production instance keys
- webhook for adding users and other MongoDB functionalities in clerk production instances

- use ngrok and and development keys in vscode
- use development instance env variables in vscode only

Goal: production related env variables stay in clerk and vercel, development keys stay in codebase
