"""
Database Engine - Optimized MongoDB Connection with Connection Pooling
"""
import certifi
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.user import User
from app.models.financial import FinancialRecord
from app.models.startup import StartupProfile, UserSettings

# Setup logging
logger = logging.getLogger(__name__)

# Global client instance for connection reuse
_client: AsyncIOMotorClient | None = None

async def init_db():
    """
    Initialize MongoDB connection with Beanie ODM.
    
    Optimizations:
    - Auto-fixes SRV connection strings (removes port if present)
    - Connection pooling with min/max pool size
    - Server selection timeout for faster failover
    - Compression enabled for reduced bandwidth
    - Retry writes enabled for reliability
    """
    global _client
    _client = AsyncIOMotorClient(
        settings.MONGODB_URI, 
        tlsCAFile=certifi.where() 
    )
    # 1. Get the URI as a string
    mongo_uri = str(settings.MONGODB_URI)
    
    # 2. DEFENSIVE FIX: Remove port from SRV connection string if present.
    # The 'mongodb+srv://' protocol forbids ports, but Pydantic or .env 
    # often injects ':27017' by mistake.
    if mongo_uri.startswith("mongodb+srv://") and ":27017" in mongo_uri:
        logger.warning("Detected port in SRV URI. Removing ':27017' to prevent crash.")
        mongo_uri = mongo_uri.replace(":27017", "")

    logger.info("Initializing MongoDB connection...")

    # 3. Initialize Client with optimized settings
    _client = AsyncIOMotorClient(
        mongo_uri,
        tlsCAFile=certifi.where(),
        # Connection pool settings
        minPoolSize=1,           # Keep at least 1 connection open
        maxPoolSize=10,          # Scale up to 10 connections
        maxIdleTimeMS=45000,     # Recycle idle connections after 45s
        # Timeout settings
        connectTimeoutMS=20000,  # Give up on initial connect after 20s
        serverSelectionTimeoutMS=20000,  
        socketTimeoutMS=60000,   # 60s socket timeout
        # Performance settings
        compressors=["snappy", "zlib"], 
        retryWrites=True,       
        retryReads=True,
        w="majority",            
        uuidRepresentation="standard" # Good practice for Beanie/Pydantic UUIDs
    )
    
    # 4. Initialize Beanie ODM
    await init_beanie(
        database=_client.strata_ai,
        document_models=[
            User, 
            FinancialRecord, 
            StartupProfile, 
            UserSettings
        ]
    )
    
    logger.info("MongoDB connection pool initialized successfully.")


async def close_db():
    """
    Close database connection gracefully.
    Called during application shutdown.
    """
    global _client
    if _client:
        _client.close()
        _client = None
        logger.info("MongoDB connection closed.")


def get_client() -> AsyncIOMotorClient:
    """Get the current database client instance."""
    if _client is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return _client


def get_database():
    """Get the database instance for direct queries if needed."""
    return get_client().strata_ai