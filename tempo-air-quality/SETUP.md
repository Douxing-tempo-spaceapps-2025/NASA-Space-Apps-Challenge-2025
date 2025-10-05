# 🚀 Tempo Air Quality - Setup Guide

## 📋 Prerequisites

- Node.js 18+
- Python 3.8+
- Git

## 🔧 Quick Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/tempo-air-quality.git
cd tempo-air-quality
```

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Create environment file
cp env.example .env.local
```

### 3. Backend Setup

```bash
cd backend-fastapi

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp env.example .env
```

## 🔑 Required API Keys

### MapTiler API Key (Required for Maps)

1. Visit [MapTiler](https://www.maptiler.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key_here
   ```

### NASA FIRMS API Key (Required for Fire Data)

1. Visit [NASA FIRMS API Registration](https://firms.modaps.eosdis.nasa.gov/api/map_key)
2. Sign up for a FREE API key (MAP_KEY)
3. Add to backend `.env`:
   ```env
   NASA_FIRMS_API_KEY=your_nasa_firms_key_here
   ```

### AirNow API (Optional - Uses Free Public Data)

- No API key required for basic usage
- Data is fetched from public AirNow endpoints

## 🚀 Running the Application

### Start Backend (Terminal 1)

```bash
cd backend-fastapi
source venv/bin/activate  # On Windows: venv\Scripts\activate
python run.py
```

### Start Frontend (Terminal 2)

```bash
npm run dev
```

### Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## 📁 Environment Files

### Frontend (.env.local)

```env
NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key_here
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)

```env
APP_NAME="NASA Air Quality API"
APP_VERSION="1.0.0"
DEBUG=True
HOST=0.0.0.0
PORT=8000

# NASA FIRMS API Key
NASA_FIRMS_API_KEY=your_nasa_firms_key_here

# AirNow API (Optional)
AIRNOW_API_KEY=your_airnow_key_here

# Logging
LOG_LEVEL=INFO
```

## 🛠️ Troubleshooting

### Map Not Loading

- Check if `NEXT_PUBLIC_MAPTILER_KEY` is set correctly
- Verify MapTiler API key is valid

### No Air Quality Data

- Ensure backend is running on port 8000
- Check backend logs for errors

### No Fire Data

- Verify `NASA_FIRMS_API_KEY` is set
- Check NASA FIRMS API key status at `/api/v1/fire-data/api-status`

## 📚 API Documentation

- **Backend API Docs**: http://localhost:8000/docs
- **Alternative Docs**: http://localhost:8000/redoc

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Follow the setup guide above
4. Make your changes
5. Test thoroughly
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
