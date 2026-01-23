"""
Database Engine - Optimized MongoDB Connection with Connection Pooling
"""
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings
from app.models.user import User
from app.models.financial import FinancialRecord
from app.models.startup import StartupProfile, UserSettings
import logging

logger = logging.getLogger(__name__)

# Global client instance for connection reuse
_client: AsyncIOMotorClient | None = None


async def init_db():
    """
    Initialize MongoDB connection with Beanie ODM.
    
    Optimizations:
    - Connection pooling with min/max pool size
    - Server selection timeout for faster failover
    - Compression enabled for reduced bandwidth
    - Retry writes enabled for reliability
    """
    global _client
    
    # Connection pool settings optimized for production
    _client = AsyncIOMotorClient(
        settings.MONGODB_URI,
        tlsCAFile=certifi.where(),
        # Connection pool settings
        minPoolSize=1,           # Minimum connections to keep open
        maxPoolSize=10,          # Maximum connections
        maxIdleTimeMS=45000,     # Close idle connections after 45s
        # Timeout settings
        connectTimeoutMS=20000,  # Connection timeout: 20s
        serverSelectionTimeoutMS=20000,  # Server selection: 20s
        socketTimeoutMS=60000,   # Socket timeout: 60s (increased)
        # Performance settings
        compressors=["snappy", "zlib"],  # Enable compression (removed zstd)
        retryWrites=True,        # Retry failed writes
        retryReads=True,         # Retry failed reads
        w="majority",            # Write concern for data safety
    )
    
    await init_beanie(
        database=_client.strata_ai,
        document_models=[User, FinancialRecord, StartupProfile, UserSettings]
    )
    
    logger.info("MongoDB connection pool initialized")


async def close_db():
    """
    Close database connection gracefully.
    Called during application shutdown.
    """
    global _client
    if _client:
        _client.close()
        _client = None
        logger.info("MongoDB connection closed")


def get_client() -> AsyncIOMotorClient:
    """Get the current database client instance."""
    if _client is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return _client


def get_database():
    """Get the database instance for direct queries if needed."""
    return get_client().strata_ai
