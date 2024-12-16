import datetime
import os
from flask_sqlalchemy import SQLAlchemy
from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from functools import wraps
from bs4 import BeautifulSoup
import requests
from flask_cors import CORS, cross_origin

from models import User, Base, ScrapedFile, Team, Workspace, TeamMember

basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__)
CORS(app, support_credentials=True)
app.debug = True
app.config['SECRET_KEY'] = '\x904<\xf2\tlc\xea\x0f\x9f\xbfK\x7f\x15~\xecj\xb4{\xf6|\xe21\xac'

DATABASE_URL = "sqlite:///database.session"  # Replace with your actual database URL
engine = create_engine(DATABASE_URL)
Base.metadata.create_all(engine)
Session = sessionmaker(bind=engine)
session = Session()

# Helper function to verify JWT token
def token_required(f):
    @wraps(f)
    @cross_origin(supports_credentials=True)
    def decorated(*args, **kwargs):
        token = request.headers.get('x-access-token')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = session.query(User).filter_by(id=data['user_id']).first()
        except Exception as e:
            return jsonify({'message': 'Token is invalid!'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

# write api to create a team
@app.route('/create-team', methods=['POST'])
@token_required
def create_team(current_user):
    data = request.get_json()
    name = data.get('name')
    owner_id = current_user.id

    if not name or not owner_id:
        return jsonify({'message': 'Team name and owner ID are required!'}), 400

    # Validate the owner ID
    owner = session.query(User).filter_by(id=owner_id).first()
    if not owner:
        return jsonify({'message': 'Owner not found!'}), 404

    try:
        # Create a new team
        new_team = Team(
            name=name,
            owner_id=owner_id
        )
        session.add(new_team)
        session.commit()

        return jsonify({'message': 'Team created successfully!', 'team_id': new_team.id}), 201

    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

# write api to get all teams of a user
@app.route('/get-teams', methods=['GET'])
@token_required
def get_teams(current_user):
    teams = session.query(Team).filter_by(owner_id=current_user.id).all()
    team_list = []
    for team in teams:
        team_list.append({
            'team_id': team.id,
            'name': team.name,
            'owner_id': team.owner_id,
            'created_at': team.created_at
        })
    return jsonify({'teams': team_list}), 200

# write api to add a member to a team
@app.route('/add-member', methods=['POST'])
@token_required
def add_member(current_user):
    data = request.get_json()
    team_id = data.get('team_id')
    email = data.get('email')

    if not team_id or not email:
        return jsonify({'message': 'Team ID, user ID, and role are required!'}), 400

    # Validate the team ID
    team = session.query(Team).filter_by(id=team_id).first()
    if not team:
        return jsonify({'message': 'Team not found!'}), 404

    # Validate the user email
    user = session.query(User).filter_by(email=email).first()
    if not user:
        return jsonify({'message': 'User not found!'}), 404

    try:
        # Add the user to the team
        new_member = TeamMember(
            user_id=user.id,
            team_id=team_id
        )
        session.add(new_member)
        session.commit()

        return jsonify({'message': 'Member added to the team successfully!', 'member_id': new_member.id}), 201

    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

# Route: Signup
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required!'}), 400

    if session.query(User).filter_by(email=email).first():
        return jsonify({'message': 'Email already exists!'}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(email=email, password_hash=hashed_password)
    session.add(new_user)
    return jsonify({'message': 'User created successfully!'}), 201

# Route: Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required!'}), 400

    user = session.query(User).filter_by(email=email).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Invalid credentials!'}), 401

    token = jwt.encode({'user_id': user.id, 'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)},
                       app.config['SECRET_KEY'], algorithm="HS256")
    return jsonify({'token': token}), 200

# Route: Protected Resource Example
@app.route('/me', methods=['GET'])
@token_required
def me(current_user):
    return jsonify({'message': f'Welcome, {current_user.email}! This is a protected resource.'}), 200

@app.route('/create-workspace', methods=['POST'])
def create_workspace():
    data = request.get_json()
    team_id = data.get('team_id')
    name = data.get('name')

    if not team_id or not name:
        return jsonify({'message': 'Team ID and workspace name are required!'}), 400

    # Validate the team ID
    team = session.query(Team).filter_by(id=team_id).first()
    if not team:
        return jsonify({'message': 'Team not found!'}), 404

    try:
        # Create a new workspace
        new_workspace = Workspace(
            team_id=team_id,
            name=name
        )
        session.add(new_workspace)
        session.commit()

        return jsonify({'message': 'Workspace created successfully!', 'workspace_id': new_workspace.id}), 201

    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

@app.route('/get-workspace/<int:workspace_id>', methods=['GET'])
def get_workspace(workspace_id):
    try:
        # Fetch the workspace by ID
        workspace = session.query(Workspace).filter_by(id=workspace_id).first()
        if not workspace:
            return jsonify({'message': 'Workspace not found!'}), 404

        return jsonify({
            'workspace_id': workspace.id,
            'name': workspace.name,
            'team_id': workspace.team_id,
            'created_at': workspace.created_at
        }), 200

    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

@app.route('/scrape', methods=['POST'])
def scrape_website():
    data = request.get_json()
    website_url = data.get('website_url')
    workspace_id = data.get('workspace_id')

    if not website_url or not workspace_id:
        return jsonify({'message': 'Website URL and Workspace ID are required!'}), 400

    # Validate the workspace ID
    workspace = session.query(Workspace).filter_by(id=workspace_id).first()
    if not workspace:
        return jsonify({'message': 'Workspace not found!'}), 404

    try:
        # Fetch the website content
        response = requests.get(website_url)
        if response.status_code != 200:
            return jsonify({'message': f'Failed to fetch website. Status code: {response.status_code}'}), 400

        soup = BeautifulSoup(response.content, 'html.parser')

        # Extract the title and all text content from the website
        title = soup.title.string if soup.title else 'Untitled'
        content = soup.get_text()
        print(content)
        # Save the scraped content to the database
        new_file = ScrapedFile(
            workspace_id=workspace_id,
            parent_id=None,  # Root-level file
            name=title,
            content={"text": content},  # Store as JSON
            url=website_url
        )
        session.add(new_file)
        session.commit()

        return jsonify({'message': 'Website content scraped and saved successfully!', 'file_id': new_file.id}), 201

    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

#get all a file by id.
@app.route('/get-file/<int:file_id>', methods=['GET'])
def get_file(file_id):
    try:
        # Fetch the file by ID
        file = session.query(ScrapedFile).filter_by(id=file_id).first()
        if not file:
            return jsonify({'message': 'File not found!'}), 404

        return jsonify({
            'file_id': file.id,
            'workspace_id': file.workspace_id,
            'parent_id': file.parent_id,
            'name': file.name,
            'content': file.content,
            'url': file.url,
            'created_at': file.created_at,
            'updated_at': file.updated_at
        }), 200

    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500

# api to save the updated contents
@app.route('/update-file/<int:file_id>', methods=['POST'])
def update_file(file_id):
    data = request.get_json()
    content = data.get('content')

    if not content:
        return jsonify({'message': 'Content is required!'}), 400

    try:
        # Fetch the file by ID
        file = session.query(ScrapedFile).filter_by(id=file_id).first()
        if not file:
            return jsonify({'message': 'File not found!'}), 404

        # Update the file content
        file.content = content
        session.commit()

        return jsonify({'message': 'File content updated successfully!'}), 200

    except Exception as e:
        return jsonify({'message': f'An error occurred: {str(e)}'}), 500