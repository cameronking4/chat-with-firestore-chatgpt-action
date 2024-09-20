## Chat with Firebase Firestor Collections in ChatGPT 
Create your own custom GPT to fetch Firestore data and query your database in ChatGPT for AI insightts. Skp building an admin dashboard and chat with natural language to get inights into your Firebase project. Use OpenAI function calling to get AI-powered admin experience in ChatGPT sidebar or use @ in a regular chat.

1. Go to Firebase Settings and download your service account key (JSON).
![image](https://github.com/user-attachments/assets/6a94e891-81c2-4e4e-99b0-e87af7e03d1d)
2. Save as `firebaseAdminConfig.json` in the root of this project
3.  Deploy
4.  Add the following prompt and action using your deployed link
5.  Optionally add API-KEY for enhanced security
   
## Prompt for ChatGPT 
**Tweak to your liking**
```
You are the database viewer and query tool for a project named <INSERT FIREBASE PROJECT NAME HERE>. Use actions to fetch database details to answer user questions. The actions allow you to pull Firestore schema and query a particular collection to answer Q&A. Use the schema to understand how to query based on the prompt user provides. Infer the most accurate query and continue querying pages until answer complete.
```

## Action for ChatGPT
```yaml
openapi: 3.1.0
info:
  title: Firestore Action API
  description: API to interact with Firestore, including fetching schema, querying collections, and supporting pagination.
  version: 1.1.0
servers:
  - url: <INSERT DEPLOYED URL HERE> 
    description: Production server for Firestore Action API
paths:
  /api/firestore:
    get:
      operationId: getFirestoreSchema
      summary: Fetch Firestore schema
      description: Retrieves the schema of collections in Firestore, including field names.
      responses:
        '200':
          description: Successfully retrieved schema
          content:
            application/json:
              schema:
                type: object
                properties:
                  schema:
                    type: array
                    items:
                      type: object
                      properties:
                        name:
                          type: string
                        fields:
                          type: array
                          items:
                            type: string
        '500':
          description: Internal Server Error
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
    post:
      operationId: queryFirestoreCollection
      summary: Query a Firestore collection with pagination
      description: Query a Firestore collection with optional filtering, pagination, and ordering.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                collectionName:
                  type: string
                  description: The name of the Firestore collection to query.
                queryParams:
                  type: array
                  description: Optional filtering criteria.
                  items:
                    type: object
                    properties:
                      field:
                        type: string
                      operator:
                        type: string
                        enum: 
                          - "<"
                          - "<="
                          - "=="
                          - ">"
                          - ">="
                          - "!="
                          - "array-contains"
                          - "array-contains-any"
                          - "in"
                          - "not-in"
                      value:
                        type: string
                limit:
                  type: integer
                  description: Maximum number of documents to return.
                  example: 10
                startAfterId:
                  type: string
                  description: Document ID to start pagination after.
                startAfterValue:
                  type: string
                  description: Field value to start pagination after.
                orderBy:
                  type: string
                  description: Field to order the results by.
                orderDirection:
                  type: string
                  description: Sort direction, either 'asc' or 'desc'.
                  enum:
                    - asc
                    - desc
      responses:
        '200':
          description: Query successful with pagination support
          content:
            application/json:
              schema:
                type: object
                properties:
                  documents:
                    type: array
                    items:
                      type: object
                      properties:
                        id:
                          type: string
                        additionalProperties:
                          type: object
                  nextPageTokenId:
                    type: string
                    nullable: true
                    description: ID of the last document in the current result set, used for pagination.
                  nextPageTokenValue:
                    type: string
                    nullable: true
                    description: Value of the last ordered field for the next page, used when ordering by a specific field.
        '400':
          description: Bad Request (missing collection name or invalid parameters)
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string
        '500':
          description: Internal Server Error
          content:
            application/json:
              schema:
                type: object
                properties:
                  error:
                    type: string

```

## Development
This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).
First, run the development server:

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

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
