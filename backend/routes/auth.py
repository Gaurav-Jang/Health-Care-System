from flask import Blueprint, request, jsonify
from models.user import User
from utils.auth_utils import generate_token, verify_token as verify_jwt_token

auth_bp = Blueprint('auth', __name__)
user_model = User()


@auth_bp.route('/login', methods=['POST', 'OPTIONS'])
def login():
    """Login endpoint for all user types"""
    if request.method == 'OPTIONS':
        return '', 200  # Preflight request

    try:
        data = request.get_json()   
        email = data.get('email')
        password = data.get('password')
        user_type = data.get('user_type')

        if not email or not password or not user_type:
            return jsonify({'error': 'Email, password and user type are required'}), 400

        user = user_model.find_user_by_email(email)
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401

        if user['user_type'] != user_type.lower():
            return jsonify({'error': 'Invalid user type'}), 401

        if not user_model.verify_password(password, user['password']):
            return jsonify({'error': 'Invalid credentials'}), 401

        if not user.get('is_active', True):
            return jsonify({'error': 'Account is deactivated'}), 401

        if user_type == 'doctor' and not user.get('approved_by_admin', False):
            return jsonify({'error': 'Doctor account not approved by admin'}), 401

        token = generate_token(user)
        if not token:
            return jsonify({'error': 'Failed to generate token'}), 500

        # Prepare user data for response
        user_data = {
            'id': str(user['_id']),
            'email': user['email'],
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'user_type': user['user_type'],
            'phone': user.get('phone', '')
        }

        if user_type == 'doctor':
            user_data.update({
                'specialization': user.get('specialization', ''),
                'license_number': user.get('license_number', ''),
                'experience_years': user.get('experience_years', 0),
                'available_time_slots': user.get('available_time_slots', [])
            })
        elif user_type == 'patient':
            user_data.update({
                'date_of_birth': user.get('date_of_birth'),
                'gender': user.get('gender', '')
            })

        return jsonify({'message': 'Login successful', 'token': token, 'user': user_data}), 200

    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@auth_bp.route('/signup', methods=['POST'])
def signup():
    """Signup endpoint for patients only"""
    try:
        data = request.get_json()

        required_fields = ['email', 'password', 'first_name', 'last_name', 'phone']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400

        if user_model.find_user_by_email(data['email']):
            return jsonify({'error': 'User with this email already exists'}), 400

        user_data = {
            'email': data['email'],
            'password': data['password'],
            'user_type': 'patient',
            'first_name': data['first_name'],
            'last_name': data['last_name'],
            'phone': data['phone'],
            'date_of_birth': data.get('date_of_birth'),
            'gender': data.get('gender', ''),
            'emergency_contact': data.get('emergency_contact', {})
        }

        user_id = user_model.create_user(user_data)
        # print("Created user ID:", user_id) 
        # print("New user data:", user_data)
        if not user_id:
            return jsonify({'error': 'Failed to create user'}), 500

        return jsonify({'message': 'Patient account created successfully', 'user_id': user_id}), 201

    except Exception as e:
        print(f"Signup error: {e}")
        return jsonify({'error': 'Internal server error'}), 500


@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    """Verify if token is valid"""
    try:
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401

        if token.startswith('Bearer '):
            token = token[7:]

        payload = verify_jwt_token(token)
        if not payload:
            return jsonify({'error': 'Invalid or expired token'}), 401

        user = user_model.find_user_by_id(payload['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404

        user_data = {
            'id': str(user['_id']),
            'email': user['email'],
            'first_name': user['first_name'],
            'last_name': user['last_name'],
            'user_type': user['user_type']
        }

        return jsonify({'valid': True, 'user': user_data}), 200

    except Exception as e:
        print(f"Token verification error: {e}")
        return jsonify({'error': 'Internal server error'}), 500
