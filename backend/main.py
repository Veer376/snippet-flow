import os
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from backend.auth import route as auth_router
from backend.snippet import route as snippet_router
from backend import database
from backend.database import get_db
from strawberry.fastapi import GraphQLRouter
from backend.snippet.route import schema
from sqlalchemy.orm import Session

# Create the FastAPI app
app = FastAPI()

# Configure CORS (Cross-Origin Resource Sharing)
origins = ["*"]  # Allows all origins - for development purposes only!
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the authentication router
app.include_router(auth_router.router)

# Create a GraphQL router
graphql_app = GraphQLRouter(schema)

# Include the GraphQL router
app.include_router(graphql_app, prefix="/graphql")

# Dependency to get the database session
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
async def root():
    return {"message": "SnippetFlow API is running"}