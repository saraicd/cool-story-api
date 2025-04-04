# Cool Story API

This API powers a **crowd-built narrative**, where random users contribute short segments to build a story—one entry at a time. Whether you’re adding a twist, building suspense, or simply throwing in a funny line, your words become part of a larger tale, evolving with each new contributor.

## How It Works
- Users can **submit a snippet of a story**, which becomes part of an ongoing narrative.
- The API **checks for the continuity** of the story to ensure that each new entry follows the correct sequence.
- **Each new contributor** can see and continue the story by adding their own piece, creating an ever-evolving web of creativity!

A simple API that allows users to contribute to a collaborative story. Each user can add a new entry to the story, which is linked to the previous entry. The API uses MongoDB to store the story entries and Express.js to handle the API endpoints. 

## Technologies Used
- **Node.js**: A JavaScript runtime used to run the server.
- **Express.js**: A web framework for building the API, enabling easy routing and middleware integration.
- **MongoDB**: A NoSQL database to store story entries. MongoDB is used with **Mongoose**, an Object Data Modeling (ODM) library for MongoDB and Node.js, to define and interact with the data models.
- **Mongoose**: A library that helps in modeling and managing MongoDB data using schemas.
- **Dotenv**: Used for managing environment variables (e.g., MongoDB URI, API keys) in a `.env` file for local development.
- **Railway**: The deployment platform for hosting the API and connecting to MongoDB.

