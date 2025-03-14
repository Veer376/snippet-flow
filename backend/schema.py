from typing import Optional, List
from pydantic import BaseModel

class UserModel(BaseModel):
    id: Optional[int] = None  # Auto-incremented ID
    username: str
    email: str
    hashed_password: str  # Store hashed passwords, not plain text
    full_name: Optional[str] = None
    disabled: Optional[bool] = False

class SnippetModel(BaseModel):
    id: Optional[int] = None  # Auto-incremented ID
    title: str
    content: str
    language: str  # e.g., "python", "javascript"
    user_id: int  # Foreign key to the user who created the snippet
    created_at: Optional[str] = None #Timestamp
    likes: Optional[int] = 0
    dislikes: Optional[int] = 0
    saved: Optional[bool] = False

class RecommendationModel(BaseModel):
    snippet_id: int
    score: float #Recommendation score from sagemaker