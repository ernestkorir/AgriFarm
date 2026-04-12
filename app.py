from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
# Enable CORS so your React frontend (usually port 3000) can access this API
CORS(app)

# Database configuration - creates a file named bore_farm.db
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bore_farm.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- DATABASE MODELS ---


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    # SuperUser, Manager, Worker
    role = db.Column(db.String(20), default='Worker')


class Asset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    purchase_price = db.Column(db.Float, nullable=False)
    purchase_date = db.Column(db.DateTime, default=datetime.utcnow)
    # Active, Under Repair, Sold
    status = db.Column(db.String(20), default='Active')


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(10), nullable=False)  # 'Income' or 'Expense'
    category = db.Column(db.String(50))  # e.g., 'Fuel', 'Seeds', 'Crop Sale'
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)

# --- API ROUTES ---


@app.route('/api/summary', methods=['GET'])
def get_summary():
    """Returns the total profit and list of assets for the dashboard."""
    assets = Asset.query.all()

    # Calculate Total Income
    income = db.session.query(db.func.sum(Transaction.amount))\
        .filter(Transaction.type == 'Income').scalar() or 0

    # Calculate Total Expenses
    expenses = db.session.query(db.func.sum(Transaction.amount))\
        .filter(Transaction.type == 'Expense').scalar() or 0

    asset_list = [{
        "id": a.id,
        "name": a.name,
        "price": a.purchase_price,
        "status": a.status
    } for a in assets]

    return jsonify({
        "profit": income - expenses,
        "total_income": income,
        "total_expenses": expenses,
        "assets": asset_list
    })


@app.route('/api/transaction', methods=['POST'])
def add_transaction():
    """Logs either an Expense or Income."""
    data = request.json
    try:
        new_tx = Transaction(
            type=data['type'],  # 'Income' or 'Expense'
            category=data['category'],
            amount=float(data['amount'])
        )
        db.session.add(new_tx)
        db.session.commit()
        return jsonify({"message": "Transaction recorded"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/assets', methods=['POST'])
def add_asset():
    """Adds a new physical asset to the farm."""
    data = request.json
    try:
        new_asset = Asset(
            name=data['name'],
            purchase_price=float(data['purchase_price']),
            status='Active'
        )
        db.session.add(new_asset)
        db.session.commit()
        return jsonify({"message": "Asset added successfully"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

# --- INITIALIZATION ---


if __name__ == '__main__':
    with app.app_context():
        # This creates the tables if they don't exist yet
        db.create_all()

        # Optional: Create a default Super User if none exists
        if not User.query.filter_by(username='admin').first():
            admin = User(username='admin', role='SuperUser')
            db.session.add(admin)
            db.session.commit()
            print("Database initialized and admin user created.")

    app.run(port=3000, debug=True)
