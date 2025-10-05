"""
Earthdata Authentication Service
Handles NASA Earthdata login and credential caching
"""
import os
import logging
from typing import Optional
import earthaccess
from app.core.config import settings

logger = logging.getLogger(__name__)


class EarthdataService:
    """Service for managing Earthdata authentication and access"""
    
    def __init__(self):
        self.is_authenticated = False
        # Don't check authentication on init to avoid blocking startup
    
    def _check_authentication(self) -> bool:
        """Check if we have valid authentication"""
        try:
            # Try to get current authentication status
            auth = earthaccess.login()
            if auth:
                self.is_authenticated = True
                logger.info("Earthdata authentication successful from cached credentials")
                return True
        except Exception as e:
            logger.debug(f"No cached authentication found: {e}")
        
        return False
    
    def login(self, username: Optional[str] = None, password: Optional[str] = None) -> bool:
        """
        Authenticate with Earthdata
        
        Args:
            username: Earthdata username (if None, uses environment variable)
            password: Earthdata password (if None, uses environment variable)
            
        Returns:
            bool: True if authentication successful
        """
        try:
            # Use provided credentials or fall back to environment variables
            user = username or settings.earthdata_user
            pwd = password or settings.earthdata_pass
            
            if not user or not pwd:
                logger.error("Earthdata credentials not provided")
                return False
            
            # Set environment variables for earthaccess
            import os
            os.environ['EARTHDATA_USERNAME'] = user
            os.environ['EARTHDATA_PASSWORD'] = pwd
            
            # Authenticate with earthaccess
            auth = earthaccess.login(
                strategy="environment",
                persist=True  # This will cache to ~/.netrc
            )
            
            if auth:
                self.is_authenticated = True
                logger.info("Earthdata authentication successful")
                return True
            else:
                logger.error("Earthdata authentication failed")
                return False
                
        except Exception as e:
            logger.error(f"Earthdata authentication error: {e}")
            return False
    
    def ensure_authenticated(self) -> bool:
        """
        Ensure we have valid authentication, login if needed
        
        Returns:
            bool: True if authenticated
        """
        if self.is_authenticated:
            return True
        
        return self.login()
    
    def logout(self):
        """Logout and clear cached credentials"""
        try:
            # Clear cached credentials
            netrc_path = os.path.expanduser("~/.netrc")
            if os.path.exists(netrc_path):
                os.remove(netrc_path)
            
            self.is_authenticated = False
            logger.info("Earthdata logout successful")
        except Exception as e:
            logger.error(f"Error during logout: {e}")


# Global instance
earthdata_service = EarthdataService()
