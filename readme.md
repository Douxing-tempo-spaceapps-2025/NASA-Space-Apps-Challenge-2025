# 🛰️ NASA Space Apps Challenge 2025 - Air Quality Monitoring System

A comprehensive real-time air quality monitoring and wildfire threat assessment system using NASA TEMPO satellite data, ground-based measurements, and advanced data visualization.

## 🌟 Project Overview

This project combines NASA's cutting-edge TEMPO (Tropospheric Emissions: Monitoring of Pollution) satellite data with ground-based air quality measurements to create a comprehensive air quality monitoring and wildfire threat assessment system. The system provides real-time visualization of air quality indicators across the United States, helping communities understand and respond to air quality threats.

## 🎯 Key Features

### 🛰️ Satellite Data Integration
- **NASA TEMPO L3 NRT Data**: Real-time tropospheric pollution monitoring
- **HCHO/NO2 Heatmaps**: Formaldehyde and nitrogen dioxide visualization
- **Wildfire Smoke Threat Index (WSTI)**: Advanced threat assessment algorithm
- **Multi-temporal Data**: 6h, 12h, and 24h data availability with intelligent fallback

### 🔥 Fire Data & Threat Assessment
- **NASA FIRMS Integration**: Real-time fire detection data
- **Wildfire Smoke Tracking**: Advanced smoke dispersion modeling
- **Threat Level Classification**: Color-coded threat assessment
- **Historical Fire Data**: Fire statistics and trend analysis

### 🌍 Interactive Visualization
- **Real-time Maps**: Interactive MapLibre GL JS visualization
- **Cluster-based Display**: Efficient handling of large datasets
- **Heatmap Layers**: Dual-layer HCHO/NO2 visualization
- **Responsive Design**: Mobile and desktop optimized

### 📊 Data Sources
- **AirNow API**: Ground-based air quality measurements
- **NASA FIRMS**: Fire detection and monitoring
- **NASA Earthdata**: TEMPO satellite data access
- **MapTiler**: Base map services

## 🏗️ Architecture

### Frontend (`tempo-air-quality/`)
- **Next.js 15**: React framework with App Router
- **TypeScript**: Full type safety
- **MapLibre GL JS**: Interactive mapping
- **Tailwind CSS**: Modern styling
- **React Query**: Data fetching and caching
- **Zustand**: State management

### Backend (`backend-fastapi/`)
- **FastAPI**: High-performance Python web framework
- **Pydantic**: Data validation and serialization
- **HTTPX**: Async HTTP client
- **NASA Earthdata Access**: Satellite data integration
- **Scientific Computing**: NumPy, Pandas, XArray for data processing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Git
- NASA Earthdata account (free)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/NASA-Space-Apps-Challenge-2025.git
cd NASA-Space-Apps-Challenge-2025
```

### 2. Backend Setup
```bash
cd backend-fastapi

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp env.example .env
# Edit .env with your API keys
```

### 3. Frontend Setup
```bash
cd tempo-air-quality

# Install dependencies
npm install

# Configure environment
cp env.example .env.local
# Edit .env.local with your API keys
```

### 4. Get Required API Keys

#### NASA Earthdata (Required)
1. Visit [NASA Earthdata](https://urs.earthdata.nasa.gov/)
2. Create a free account
3. Configure authentication in backend `.env`

#### NASA FIRMS (Required for Fire Data)
1. Visit [NASA FIRMS API Registration](https://firms.modaps.eosdis.nasa.gov/api/map_key)
2. Sign up for free API key
3. Add to backend `.env`: `NASA_FIRMS_API_KEY=your_key_here`

#### MapTiler (Optional - for enhanced maps)
1. Visit [MapTiler](https://www.maptiler.com/)
2. Sign up for free account
3. Add to frontend `.env.local`: `NEXT_PUBLIC_MAPTILER_KEY=your_key_here`

### 5. Run the Application

#### Option 1: Quick Start Script
```bash
# Run the automated startup script
./start_wsti.sh
```

#### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend-fastapi
source venv/bin/activate
python run.py
```

**Terminal 2 - Frontend:**
```bash
cd tempo-air-quality
npm run dev
```

### 6. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📊 Data Processing Pipeline

### 1. Data Acquisition
- **TEMPO L3 NRT**: Near real-time satellite data via NASA Harmony
- **Ground Stations**: AirNow API integration
- **Fire Detection**: NASA FIRMS real-time fire data

### 2. Data Processing
- **Scientific Computing**: NumPy, Pandas, XArray for data manipulation
- **Geospatial Processing**: Coordinate transformation and projection
- **Quality Control**: Data validation and filtering
- **Temporal Aggregation**: Time-series data processing

### 3. Threat Assessment
- **WSTI Algorithm**: Wildfire Smoke Threat Index calculation
- **Multi-factor Analysis**: Combining satellite and ground data
- **Risk Classification**: Color-coded threat levels
- **Predictive Modeling**: Historical trend analysis

### 4. Visualization
- **Interactive Maps**: Real-time data visualization
- **Heatmap Rendering**: Efficient large dataset display
- **Cluster Management**: Optimized marker clustering
- **Responsive UI**: Cross-platform compatibility

## 🛠️ Technical Stack

### Frontend Technologies
- **Next.js 15**: React framework with App Router
- **React 19**: Latest React features
- **TypeScript**: Type safety and developer experience
- **MapLibre GL JS**: Open-source mapping library
- **Tailwind CSS**: Utility-first CSS framework
- **React Query**: Server state management
- **Zustand**: Client state management

### Backend Technologies
- **FastAPI**: Modern Python web framework
- **Pydantic**: Data validation and settings management
- **HTTPX**: Async HTTP client
- **NASA Earthdata Access**: Satellite data integration
- **Scientific Stack**: NumPy, Pandas, XArray, NetCDF4
- **Uvicorn**: ASGI server

### Data Sources
- **NASA TEMPO**: Tropospheric pollution monitoring
- **NASA FIRMS**: Fire detection and monitoring
- **AirNow**: Ground-based air quality data
- **NASA Earthdata**: Satellite data archive

## 📁 Project Structure

```
NASA-Space-Apps-Challenge-2025/
├── backend-fastapi/           # FastAPI backend service
│   ├── app/
│   │   ├── api/v1/           # API endpoints
│   │   ├── core/             # Configuration
│   │   ├── models/           # Data models
│   │   └── services/         # Business logic
│   ├── requirements.txt      # Python dependencies
│   └── run.py               # Application entry point
├── tempo-air-quality/        # Next.js frontend
│   ├── src/
│   │   ├── app/             # Next.js App Router
│   │   ├── components/          # React components
│   │   └── services/           # API services
│   ├── package.json          # Node.js dependencies
│   └── next.config.ts        # Next.js configuration
├── requirements.txt          # Root Python dependencies
├── start_wsti.sh            # Quick start script
└── README.md                # This file
```

## 🔬 Scientific Background

### TEMPO Satellite Mission
The Tropospheric Emissions: Monitoring of Pollution (TEMPO) mission provides unprecedented observations of air quality across North America. This project leverages TEMPO's capabilities to:

- **Monitor Air Pollutants**: HCHO, NO2, and other key pollutants
- **Track Wildfire Smoke**: Real-time smoke dispersion monitoring
- **Assess Health Impacts**: Air quality index calculations
- **Support Decision Making**: Data-driven environmental policy

### Wildfire Smoke Threat Index (WSTI)
Our proprietary WSTI algorithm combines:
- **Satellite Observations**: TEMPO pollution data
- **Fire Detection**: NASA FIRMS active fire data
- **Meteorological Data**: Wind patterns and atmospheric conditions
- **Historical Analysis**: Trend analysis and pattern recognition

## 🌍 Impact & Applications

### Public Health
- **Air Quality Alerts**: Real-time health advisories
- **Vulnerable Population Protection**: Elderly, children, and respiratory patients
- **Emergency Response**: Wildfire evacuation planning

### Environmental Monitoring
- **Pollution Tracking**: Long-term air quality trends
- **Wildfire Impact Assessment**: Smoke dispersion modeling
- **Climate Research**: Atmospheric composition monitoring

### Policy Support
- **Regulatory Compliance**: Air quality standard monitoring
- **Resource Allocation**: Emergency response planning
- **Public Awareness**: Community education and engagement

## 🤝 Contributing

We welcome contributions to improve the NASA Space Apps Challenge 2025 project:

1. **Fork the Repository**
2. **Create a Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Follow Setup Guide**: Ensure proper development environment
4. **Make Changes**: Implement your improvements
5. **Test Thoroughly**: Verify functionality and performance
6. **Submit Pull Request**: Describe your changes clearly

### Development Guidelines
- **Code Style**: Follow Python PEP 8 and TypeScript best practices
- **Testing**: Include tests for new features
- **Documentation**: Update relevant documentation
- **Performance**: Consider data processing efficiency

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA**: For providing TEMPO satellite data and FIRMS fire detection
- **NASA Earthdata**: For data access infrastructure
- **AirNow**: For ground-based air quality measurements
- **MapTiler**: For mapping services
- **Open Source Community**: For the amazing tools and libraries

## 📞 Support

For questions, issues, or contributions:
- **GitHub Issues**: [Create an issue](https://github.com/your-username/NASA-Space-Apps-Challenge-2025/issues)
- **Documentation**: Check the detailed setup guides in each component
- **API Documentation**: http://localhost:8000/docs (when running)

## 🚀 Future Enhancements

- **Machine Learning**: Predictive air quality modeling
- **Mobile App**: Native mobile application
- **Real-time Alerts**: Push notifications for air quality events
- **Historical Analysis**: Long-term trend visualization
- **International Expansion**: Global air quality monitoring
- **API Integration**: Additional data sources and services

---

**Built with ❤️ for NASA Space Apps Challenge 2025**

*Empowering communities with real-time air quality insights through NASA's cutting-edge satellite technology.*
