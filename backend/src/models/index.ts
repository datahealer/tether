// This file exports data models used in the application. 
// It defines the structure of the data and may include methods for data manipulation.

export interface User {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface Post {
    id: string;
    title: string;
    content: string;
    authorId: string;
    createdAt: Date;
    updatedAt: Date;
}

// Additional models can be defined here as needed.