from fastapi import Depends, Request
from fastapi_users import BaseUserManager, IntegerIDMixin
from .models import User
from .db import async_session_maker
from sqlalchemy.ext.asyncio import AsyncSession

SECRET = "YOUR_SUPER_SECRET_KEY"

async def get_user_db():
    async with async_session_maker() as session:
        yield session

class UserManager(IntegerIDMixin, BaseUserManager[User, int]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)
