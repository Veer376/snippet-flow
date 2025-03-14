import strawberry
from typing import List, Optional
from backend.models import SnippetModel, RecommendationModel
from backend.database import get_db
from sqlalchemy.orm import Session
from fastapi import Depends
import boto3  # AWS SDK for Python
import os

# --- AWS Configuration (Move to environment variables) ---
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")  # Replace with your region
SAGEMAKER_ENDPOINT_NAME = os.environ.get("SAGEMAKER_ENDPOINT_NAME", "your-endpoint-name")  # Replace with your endpoint name

# --- Initialize Sagemaker client ---
sagemaker_client = boto3.client("sagemaker-runtime", region_name=AWS_REGION)

@strawberry.type
class User:
    id: int
    username: str
    email: str
    full_name: Optional[str]

@strawberry.type
class Snippet:
    id: int
    title: str
    content: str
    language: str
    user_id: int
    created_at: Optional[str]
    likes: Optional[int]
    dislikes: Optional[int]
    saved: Optional[bool]

@strawberry.type
class Recommendation:
    snippet_id: int
    score: float

@strawberry.type
class Query:
    @strawberry.field
    def get_snippet(self, id: int, db: Session = Depends(get_db)) -> Optional[Snippet]:
        """Retrieves a snippet by its ID."""
        snippet = db.query(SnippetModel).filter(SnippetModel.id == id).first()
        if snippet:
            return Snippet(id=snippet.id, title=snippet.title, content=snippet.content, language=snippet.language, user_id=snippet.user_id, created_at=snippet.created_at, likes=snippet.likes, dislikes=snippet.dislikes, saved=snippet.saved)
        return None

    @strawberry.field
    def get_all_snippets(self, db: Session = Depends(get_db)) -> List[Snippet]:
         """Retrieves all snippets."""
         snippets = db.query(SnippetModel).all()
         return [Snippet(id=snippet.id, title=snippet.title, content=snippet.content, language=snippet.language, user_id=snippet.user_id, created_at=snippet.created_at, likes=snippet.likes, dislikes=snippet.dislikes, saved=snippet.saved) for snippet in snippets]

    @strawberry.field
    def get_recommendations_for_user(self, user_id: int) -> List[Recommendation]:
        """Retrieves snippet recommendations for a specific user from Sagemaker."""
        try:
            # --- Invoke Sagemaker endpoint ---
            response = sagemaker_client.invoke_endpoint(
                EndpointName=SAGEMAKER_ENDPOINT_NAME,
                ContentType="application/json",  # Adjust content type as needed
                Body=str({"user_id": user_id}),  # Pass user_id as input
            )

            # --- Parse Sagemaker response ---
            response_body = response["Body"].read().decode("utf-8")
            recommendations_data = eval(response_body)  # Assuming response is a list of dicts

            # --- Create Recommendation objects ---
            recommendations = [
                Recommendation(snippet_id=item["snippet_id"], score=item["score"])
                for item in recommendations_data
            ]
            return recommendations

        except Exception as e:
            print(f"Error calling Sagemaker endpoint: {e}")
            # Handle the error gracefully (e.g., return an empty list, log the error)
            return []

@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_snippet(self, title: str, content: str, language: str, user_id: int, db: Session = Depends(get_db)) -> Snippet:
        """Creates a new snippet."""
        snippet = SnippetModel(title=title, content=content, language=language, user_id=user_id)
        db.add(snippet)
        db.commit()
        db.refresh(snippet)
        return Snippet(id=snippet.id, title=snippet.title, content=snippet.content, language=snippet.language, user_id=snippet.user_id, created_at=snippet.created_at, likes=snippet.likes, dislikes=snippet.dislikes, saved=snippet.saved)

    @strawberry.mutation
    def like_snippet(self, snippet_id: int, db: Session = Depends(get_db)) -> Snippet:
        """Likes a snippet."""
        snippet = db.query(SnippetModel).filter(SnippetModel.id == snippet_id).first()
        if snippet:
            snippet.likes += 1
            db.commit()
            db.refresh(snippet)
            return Snippet(id=snippet.id, title=snippet.title, content=snippet.content, language=snippet.language, user_id=snippet.user_id, created_at=snippet.created_at, likes=snippet.likes, dislikes=snippet.dislikes, saved=snippet.saved)
        raise Exception("Snippet not found")

    @strawberry.mutation
    def dislike_snippet(self, snippet_id: int, db: Session = Depends(get_db)) -> Snippet:
        """Dislikes a snippet."""
        snippet = db.query(SnippetModel).filter(SnippetModel.id == snippet_id).first()
        if snippet:
            snippet.dislikes += 1
            db.commit()
            db.refresh(snippet)
            return Snippet(id=snippet.id, title=snippet.title, content=snippet.content, language=snippet.language, user_id=snippet.user_id, created_at=snippet.created_at, likes=snippet.likes, dislikes=snippet.dislikes, saved=snippet.saved)
        raise Exception("Snippet not found")

    @strawberry.mutation
    def save_snippet(self, snippet_id: int, db: Session = Depends(get_db)) -> Snippet:
        """Saves a snippet."""
        snippet = db.query(SnippetModel).filter(SnippetModel.id == snippet_id).first()
        if snippet:
            snippet.saved = True
            db.commit()
            db.refresh(snippet)
            return Snippet(id=snippet.id, title=snippet.title, content=snippet.content, language=snippet.language, user_id=snippet.user_id, created_at=snippet.created_at, likes=snippet.likes, dislikes=snippet.dislikes, saved=snippet.saved)
        raise Exception("Snippet not found")

schema = strawberry.Schema(query=Query, mutation=Mutation)