import os
import sys

# Ensure backend directory is in Python path for VS Code & execution
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from database import get_db_connection, init_db

# Import blueprints
from routes.auth_routes import auth_bp
from routes.children_routes import children_bp
from routes.vaccine_routes import vaccine_bp
from routes.vaccination_routes import vaccination_bp
from routes.reminder_routes import reminder_bp
from routes.dashboard_routes import dashboard_bp
from routes.user_routes import user_bp
from routes.reports_routes import reports_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend API requests
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize Database Schema & Seed Data
    try:
        init_db()
    except Exception as e:
        print(f"[App Init Warning] DB setup error: {e}")

    # Register Blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(children_bp)
    app.register_blueprint(vaccine_bp)
    app.register_blueprint(vaccination_bp)
    app.register_blueprint(reminder_bp)
    app.register_blueprint(dashboard_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(reports_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        db_status = "connected"
        try:
            conn = get_db_connection()
            if hasattr(conn, 'close'):
                conn.close()
        except Exception as e:
            db_status = f"disconnected: {e}"

        return jsonify({
            "status": "healthy",
            "app": "VaccTrack API",
            "database_status": db_status,
            "database_driver": Config.DB_DRIVER,
            "database_name": Config.DB_NAME,
            "database_type": "Microsoft SQL Server"
        }), 200

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"success": False, "message": "Requested API endpoint not found."}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({"success": False, "message": "Internal server error occurred."}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    print(f"[VaccTrack Backend] Server listening at http://127.0.0.1:{Config.PORT}")
    app.run(host='0.0.0.0', port=Config.PORT, debug=False)
