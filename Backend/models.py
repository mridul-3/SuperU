from sqlalchemy import Column, Integer, String, ForeignKey, JSON, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()

# USERS TABLE
class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now())

# JWT TOKENS TABLE (Optional for session revocation or tracking)
class JwtToken(Base):
    __tablename__ = 'jwt_tokens'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    token = Column(String(512), nullable=False)
    created_at = Column(DateTime, default=func.now())
    expires_at = Column(DateTime, nullable=False)

# TEAMS TABLE
class Team(Base):
    __tablename__ = 'teams'

    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    owner_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    created_at = Column(DateTime, default=func.now())

# TEAM MEMBERS TABLE
class TeamMember(Base):
    __tablename__ = 'team_members'

    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, ForeignKey('teams.id', ondelete='CASCADE'))
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    role = Column(String(50), default='member')  # Example: 'member', 'admin'
    joined_at = Column(DateTime, default=func.now())

# WORKSPACES TABLE
class Workspace(Base):
    __tablename__ = 'workspaces'

    id = Column(Integer, primary_key=True)
    team_id = Column(Integer, ForeignKey('teams.id', ondelete='CASCADE'))
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now())

# SCRAPED FILES TABLE
class ScrapedFile(Base):
    __tablename__ = 'scraped_files'

    id = Column(Integer, primary_key=True)
    workspace_id = Column(Integer, ForeignKey('workspaces.id', ondelete='CASCADE'))
    parent_id = Column(Integer, ForeignKey('scraped_files.id', ondelete='CASCADE'), nullable=True)  # For recursive file tree
    name = Column(String(255), nullable=False)
    content = Column(JSON)
    url = Column(String(2048), nullable=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

# REAL-TIME COLLABORATION UPDATES (OPTIONAL LOGGING)
class FileEditLog(Base):
    __tablename__ = 'file_edit_logs'

    id = Column(Integer, primary_key=True)
    file_id = Column(Integer, ForeignKey('scraped_files.id', ondelete='CASCADE'))
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'))
    change_data = Column(JSON)
    edited_at = Column(DateTime, default=func.now())

