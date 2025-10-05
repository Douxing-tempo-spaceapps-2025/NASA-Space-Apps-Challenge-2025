# 🛰️ Tempo Air Quality

A real-time air quality monitoring application using NASA TEMPO data and ground-based measurements.

## 🌟 Features

- **Real-time Air Quality Data**: Live air quality monitoring across the United States
- **Fire Data Integration**: NASA FIRMS fire detection data visualization
- **Interactive Maps**: Cluster-based visualization with MapLibre GL JS
- **FastAPI Backend**: High-performance Python backend with automatic API documentation

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- Git

### 1. Clone and Setup

```bash
git clone https://github.com/your-username/tempo-air-quality.git
cd tempo-air-quality
```

### 2. Frontend Setup

```bash
npm install
cp env.example .env.local
```

### 3. Backend Setup

```bash
cd backend-fastapi
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp env.example .env
```

### 4. Get API Keys

#### MapTiler (Required for Maps)

1. Visit [MapTiler](https://www.maptiler.com/)
2. Sign up for free account
3. Get API key from dashboard
4. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_MAPTILER_KEY=your_maptiler_key_here
   ```

#### NASA FIRMS (Required for Fire Data)

1. Visit [NASA FIRMS API Registration](https://firms.modaps.eosdis.nasa.gov/api/map_key)
2. Sign up for free API key
3. Add to backend `.env`:
   ```env
   NASA_FIRMS_API_KEY=your_nasa_firms_key_here
   ```

### 5. Run the Application

#### Start Backend

```bash
cd backend-fastapi
source venv/bin/activate
python run.py
```

#### Start Frontend

```bash
npm run dev
```

#### Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## 📚 Documentation

- **Detailed Setup Guide**: [SETUP.md](./SETUP.md)
- **Migration Guide**: [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)
- **API Documentation**: http://localhost:8000/docs

## 🛠️ Tech Stack

### Frontend

- **Next.js 15**: React framework
- **TypeScript**: Type safety
- **MapLibre GL JS**: Interactive maps
- **Supercluster**: Marker clustering
- **Tailwind CSS**: Styling

### Backend

- **FastAPI**: Python web framework
- **Pydantic**: Data validation
- **HTTPX**: HTTP client
- **Uvicorn**: ASGI server

## 📊 Data Sources

- **AirNow**: Real-time air quality data
- **NASA FIRMS**: Fire detection data
- **MapTiler**: Base maps

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Follow setup guide
4. Make changes
5. Test thoroughly
6. Submit pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.
