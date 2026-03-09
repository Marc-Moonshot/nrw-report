# NRW Gorgon

A web application that calculates and displays non-revenue water (NRW) from water treatment plants and the areas they provide water to.

Gorgon is primarily composed of a Python script that calculates non-revenue water from data gathered at water treatment plants and the area they supply, along with a web application that displays the data in an intuitive interface.

## Overview
Non-Revenue Water (NRW) represents water losses in a water supply system due to leakage, metering errors, and theft. This project provides tools to calculate NRW metrics from treatment plants and visualize them in a graph.

## Project Structure

### `nrw-app/`
A Single Page Application written in Svelte that lists all water treatment plants and visualizes their NRW data. Provides an interactive interface for exploring NRW metrics and geographic coverage areas.

### `database/`
Initializes the database schema, which includes a single table `CacheEntry`. Manages persistent storage for NRW calculations and API response caching.

### `nrw.py`
Aggregator script entrypoint. Works by querying an endpoint to gather water treatment plant data and calculate NRW metrics. Processes raw water system data into meaningful analytics.

### `temporal-guru/`
A custom caching layer that saves heavy NRW API hits in a PostgreSQL database and reactively updates the data on hit. Optimizes performance by reducing redundant API calls.

### `services/`
Microservice implementations for specific functionality components.

### `nginx/`
Web server configuration for routing requests and serving the frontend application. Includes both development and production configurations:
- `nginx_dev.conf` - Development environment configuration
- `nginx_prod.conf` - Production environment configuration

### Docker Files
- `dockerfile` - Container image definition for the application
- `docker-compose.yml` - Multi-container orchestration configuration

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js and npm (for the Svelte frontend)
- Docker and Docker Compose (for containerized deployment)
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Marc-Moonshot/nrw-report.git
cd nrw-report
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd nrw-app
npm install
cd ..
```

4. Set up the database:
```bash
# Initialize the schema
python -m database
```

### Development

#### Running with Docker Compose

The easiest way to get started is using Docker Compose:

```bash
docker-compose up
```

This will start:
- Frontend (Svelte app) on port 3000
- Backend (Python aggregator) 
- PostgreSQL database
- Nginx reverse proxy

#### Running Locally

**Backend (NRW Calculator):**
```bash
python nrw.py
```

**Frontend (Svelte App):**
```bash
cd nrw-app
npm run dev
# or with auto-open in browser
npm run dev -- --open
```

### Building

#### Frontend

To create a production version of the Svelte app:

```bash
cd nrw-app
npm run build
```

You can preview the production build with:
```bash
npm run preview
```

#### Full Application

To build the Docker image:

```bash
docker build -t nrw-gorgon .
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DATABASE_URL=postgresql://user:password@localhost/nrw_db
API_ENDPOINT=https://your-water-plant-api.com
CACHE_TTL=3600
```

### Nginx Configuration

- **Development**: Use `nginx_dev.conf` for local development with hot reloading
- **Production**: Use `nginx_prod.conf` for optimized performance and security

## API Documentation

The NRW aggregator fetches data from water treatment plant endpoints and calculates:

- **Total Water Input**: Volume of water entering the system
- **Billed Authorized Consumption**: Metered and billed water usage
- **Non-Revenue Water**: Calculated as input minus billed consumption
- **NRW Percentage**: (NRW / Total Water Input) × 100%

Results are cached in PostgreSQL via the temporal-guru layer to optimize performance.
