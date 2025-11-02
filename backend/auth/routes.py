from fastapi import APIRouter
from fastapi_users import FastAPIUsers
from fastapi_users.authentication import AuthenticationBackend, CookieTransport, OAuth2Strategy
from fastapi_users.oauth.provider.github import GitHubOAuth2
from .models import User
from .schemas import UserRead, UserCreate, UserUpdate
from .user_manager import get_user_manager
from .db import Base, engine

cookie_transport = CookieTransport(cookie_name="auth", cookie_max_age=3600)
oauth2_strategy = OAuth2Strategy(secret="YOUR_SUPER_SECRET_KEY")

auth_backend = AuthenticationBackend(
    name="github",
    transport=cookie_transport,
    get_strategy=lambda: oauth2_strategy,
)

github_oauth_client = GitHubOAuth2(
    client_id="GITHUB_CLIENT_ID",
    client_secret="GITHUB_CLIENT_SECRET",
    redirect_url="http://127.0.0.1:8000/auth/github/callback",
)

fastapi_users = FastAPIUsers[User, int](
    get_user_manager,
    [auth_backend],
    User,
    UserCreate,
    UserUpdate,
    UserRead,
)

router = APIRouter()

router.include_router(
    fastapi_users.get_oauth_router(github_oauth_client, auth_backend),
    prefix="/auth/github",
    tags=["auth"]
)

router.include_router(
    fastapi_users.get_users_router(),
    prefix="/users",
    tags=["users"]
)
