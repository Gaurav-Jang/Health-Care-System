from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

class Database:
    def __init__(self):
        self.client = None
        self.db = None

    def connect(self):
        """Connect to MongoDB using the URI from .env file"""
        try:
            mongo_uri = os.getenv('MONGODB_URI', 'mongodb://127.0.0.1:27017')
            self.client = MongoClient(mongo_uri)
            self.db = self.client['healthcare_system']
            print("Connected to MongoDB successfully!")
            return True
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            return False

    def get_collection(self, collection_name):
        """
        Get a collection by name.
        Automatically tries to reconnect if the database is not connected.
        """
        if self.db is None:
            print("WARNING: db_instance.db is None. Trying to reconnect...")
            connected = self.connect()
            if not connected:
                print("ERROR: Could not connect to MongoDB.")
                return None
        return self.db[collection_name]

    def close_connection(self):
        """Close the MongoDB connection"""
        if self.client:
            self.client.close()
            print("MongoDB connection closed.")

# Global database instance
db_instance = Database()
