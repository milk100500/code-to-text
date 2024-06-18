from pathlib import Path
from flask import Flask, jsonify, render_template, request, redirect, send_file, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager, create_access_token
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash
from datetime import datetime, timedelta

from static.py.converter import CodeCleaner, convert_image_to_text, save_code_to_file

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///codeToText.db'
app.config['SECRET_KEY'] = 'your_secret_key'  
app.config['JWT_SECRET_KEY'] = 'super-secret' 
jwt = JWTManager(app)
db = SQLAlchemy(app)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False, unique=True)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(100), nullable=False)
    token = db.Column(db.String(255), index=True, unique=True)
    token_created_at = db.Column(db.DateTime, default=datetime.now)

@app.route('/registration', methods=['GET', 'POST'])
def registration():
    if request.method == 'POST':
        data = request.get_json()

        username = data['username']
        email = data['email']
        password = data['password']

        existing_user = User.query.filter_by(username=username).first()
        existing_email = User.query.filter_by(email=email).first()

        if existing_user or existing_email:
            return jsonify({"error": "User with this username or email already exists!"}), 409

        password_hash = generate_password_hash(password)
        new_user = User(username=username, email=email, password=password_hash)

        access_token = create_access_token(identity=username, expires_delta=timedelta(days=1))

        new_user.token = access_token
        new_user.token_created_at = datetime.now()

        db.session.add(new_user)
        db.session.commit()

        return jsonify(accessToken=access_token, redirectUrl="/about"), 201

    return render_template('registration.html')


@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        data = request.get_json()

        email = data['email']
        password = data['password']

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            access_token = create_access_token(identity=email)

            user.token = access_token
            user.token_created_at = datetime.now()
            db.session.commit()

            return jsonify(accessToken=access_token), 200
        else:
            flash('Invalid email or password. Please try again.', 'danger')

    return render_template('login.html')

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/converter', methods=['GET', 'POST'])
def converter():
    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        if file:
            image_path = Path('uploads') / file.filename
            image_path.parent.mkdir(exist_ok=True, parents=True)
            file.save(image_path)

            code = convert_image_to_text(str(image_path))

            cleaner = CodeCleaner(code)
            clean_code = cleaner.clean()

            image_path.unlink()

            return jsonify({'converted_code': clean_code})

    else:
        return render_template('converter.html')

if __name__ == '__main__':
    app.run(debug=True)

    with app.app_context():
        db.create_all()
