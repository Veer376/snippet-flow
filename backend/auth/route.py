from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend import database, models, utils
from datetime import timedelta
from backend.database import get_db
from backend.models import UserModel
from backend.utils import verify_password

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

ACCESS_TOKEN_EXPIRE_MINUTES = 30  # You can configure this

# --- Utility Functions ---
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = utils.datetime.utcnow() + expires_delta
    else:
        expire = utils.datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = utils.jwt.encode(to_encode, utils.SECRET_KEY, algorithm=utils.ALGORITHM)
    return encoded_jwt

# --- Authentication Endpoints ---

@router.post("/register", response_model=models.UserModel, status_code=status.HTTP_201_CREATED)
def register_user(user: models.UserModel, db: Session = Depends(get_db)):
    """Registers a new user."""

    # Check if user already exists
    db_user = db.query(models.UserModel).filter(models.UserModel.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash the password
    hashed_password = utils.pwd_context.hash(user.hashed_password)

    # Create the new user
    db_user = models.UserModel(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        disabled=user.disabled
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

@router.post("/login")
def login_user(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Logs in an existing user and returns a JWT token."""

    # Retrieve user from the database
    user = db.query(models.UserModel).filter(models.UserModel.username == form_data.username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Verify password
    if not utils.pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/logout")
def logout_user():
    """Logs out the current user (client-side implementation)."""
    # NOTE: Server-side logout is typically handled by invalidating the JWT token
    # (e.g., adding it to a blacklist).  However, this requires more complex
    # infrastructure.  For this example, we'll assume the client-side handles
    # removing the token.
    return {"message": "Logout successful"}

@router.get("/me", response_model=models.UserModel)
def get_current_user(db: Session = Depends(get_db), token: str = Depends(utils.oauth2_scheme)):
    """Retrieves the current user's information based on the JWT token."""
    try:
        payload = utils.jwt.decode(token, utils.SECRET_KEY, algorithms=[utils.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        # token_data = TokenData(username=username)
    except utils.jwt.JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    user = db.query(models.UserModel).filter(models.UserModel.username == username).first()
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user