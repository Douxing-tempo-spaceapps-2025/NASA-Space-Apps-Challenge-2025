# NASA Air Quality API (FastAPI)

A FastAPI-based backend service for NASA air quality and fire data.

## Features

- **Air Quality Data**: Get real-time air quality information
- **Fire Data**: Retrieve fire detection data from NASA FIRMS
- **RESTful API**: Clean, documented API endpoints
- **Auto Documentation**: Interactive API docs with Swagger UI
- **Type Safety**: Full type hints with Pydantic models

## Quick Start

### 1. Setup Environment

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

Copy the environment example file and configure:

```bash
cp env.example .env
```

Edit `.env` with your API keys and settings.

#### Required API Keys

**NASA FIRMS API Key (Required for fire data):**

1. Visit [NASA FIRMS API Registration](https://firms.modaps.eosdis.nasa.gov/api/map_key)
2. Sign up for a FREE API key (MAP_KEY)
3. Add your key to `.env`: `NASA_FIRMS_API_KEY=your_key_here`

**AirNow API Key (Optional for air quality):**

1. Visit [AirNow API Registration](https://www.airnow.gov/air-quality-api/)
2. Register for an API key
3. Add your key to `.env`: `AIRNOW_API_KEY=your_key_here`

### 3. Run the Application

```bash
# Using the startup script
python run.py

# Or using uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 4. Access the API

- **API Base URL**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs
- **ReDoc Documentation**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Air Quality

- `GET /api/v1/air-quality/` - Get air quality data by location
- `GET /api/v1/air-quality/current` - Get current air quality
- `GET /api/v1/air-quality/forecast` - Get air quality forecast

### Fire Data

- `GET /api/v1/fire-data/` - Get fire data by location
- `GET /api/v1/fire-data/recent` - Get recent fire data (last 24 hours)
- `GET /api/v1/fire-data/statistics` - Get fire statistics
- `GET /api/v1/fire-data/api-status` - Check NASA FIRMS API key status
- `GET /api/v1/fire-data/data-availability` - Get data availability for all sensors

## Project Structure

```
backend-fastapi/
├── app/
│   ├── api/
│   │   └── v1/
│   │       ├── endpoints/
│   │       │   ├── air_quality.py
│   │       │   └── fire_data.py
│   │       └── api.py
│   ├── core/
│   │   └── config.py
│   ├── models/
│   ├── services/
│   ├── utils/
│   └── main.py
├── tests/
├── docs/
├── requirements.txt
├── run.py
└── README.md
```

## Development

### Code Formatting

```bash
# Format code with black
black app/

# Sort imports with isort
isort app/

# Lint with flake8
flake8 app/
```

### Testing

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=app
```

## Migration from Express

This FastAPI backend is designed to replace the existing Express.js backend. Key differences:

- **Language**: Python instead of TypeScript/JavaScript
- **Framework**: FastAPI instead of Express
- **Async**: Native async/await support
- **Validation**: Automatic request/response validation with Pydantic
- **Documentation**: Auto-generated OpenAPI/Swagger documentation
- **Type Safety**: Full type hints throughout the codebase

## Next Steps

1. **Migrate Services**: Port existing Express services to Python
2. **Database Integration**: Add database models and connections
3. **Authentication**: Implement API authentication if needed
4. **Testing**: Add comprehensive test coverage
5. **Deployment**: Configure for production deployment
