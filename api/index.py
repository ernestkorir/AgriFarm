import os
from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)

# --- DYNAMIC DATABASE PATHING ---
# This ensures the DB is created in the same folder as this script (the 'api' folder)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + \
    os.path.join(basedir, 'bore_farm.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- MODELS ---


class Asset(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    purchase_price = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='Active')


class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    type = db.Column(db.String(10), nullable=False)  # 'Income' or 'Expense'
    category = db.Column(db.String(50), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.DateTime, default=datetime.utcnow)

# --- ROUTES ---


@app.route('/api/summary', methods=['GET'])
def get_summary():
    try:
        assets = Asset.query.all()
        transactions = Transaction.query.order_by(
            Transaction.date.desc()).all()

        income = db.session.query(db.func.sum(Transaction.amount)).filter(
            Transaction.type == 'Income').scalar() or 0
        expenses = db.session.query(db.func.sum(Transaction.amount)).filter(
            Transaction.type == 'Expense').scalar() or 0

        return jsonify({
            "profit": income - expenses,
            "total_income": income,
            "total_expenses": expenses,
            "assets": [{"id": a.id, "name": a.name, "price": a.purchase_price, "status": a.status} for a in assets],
            "transactions": [{
                "id": t.id, "type": t.type, "category": t.category,
                "amount": t.amount, "date": t.date.strftime("%Y-%m-%d %H:%M")
            } for t in transactions]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/transaction', methods=['POST'])
def add_transaction():
    data = request.json
    try:
        new_tx = Transaction(
            type=data['type'],
            category=data['category'],
            amount=float(data['amount'])
        )
        db.session.add(new_tx)
        db.session.commit()
        return jsonify({"message": "Success"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route('/api/assets', methods=['POST'])
def add_asset():
    data = request.json
    try:
        new_asset = Asset(
            name=data['name'],
            purchase_price=float(data['purchase_price']),
            status='Active'
        )
        db.session.add(new_asset)
        db.session.commit()
        return jsonify({"message": "Asset added"}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400


# --- INITIALIZATION ---
if __name__ == '__main__':
    with app.app_context():
        print("Initializing Bore Database...")
        db.create_all()
        print(f"Database location: {os.path.join(basedir, 'bore_farm.db')}")
    app.run(port=5000, debug=True)
