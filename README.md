# Automated Corruption Risk Detection in Prozorro Tenders

## Overview
This backend application is designed to analyze public procurement tenders in the Prozorro system, identifying potential corruption risks based on predefined indicators. The system processes large datasets, detects anomalies, and generates reports for further investigation.

## Features
- Fetches tender data from Prozorro API
- Preprocesses and stores data in a MySQL database
- Analyzes tenders using risk indicators
  
## Tech Stack
- **Frameworks:** Node.js, NestJS, TypeORM
- **Database:** MySQL
- **Data Processing:** Risk indicator analysis, statistical methods

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/mxcv/getting-clear-be.git
   cd getting-clear-be
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in `.env` file:
   ```plaintext
   PROZORRO_URL=https://public.api.openprocurement.org/api/2.5
   DATA_SOURCE_HOST=localhost
   DATA_SOURCE_PORT=3306
   DATA_SOURCE_USERNAME=
   DATA_SOURCE_PASSWORD=
   DATA_SOURCE_DATABASE=
   DATA_SOURCE_SYNCHRONIZE=true
   ```
4. Run the application:
   ```bash
   npm start
   ```

## API Endpoints
### Tenders
- `PUT /tenders/seed` - Seeds tender data by date range
- `GET /tenders/:id` - Retrieve a specific tender by ID

### Regions
- `GET /regions` - Retrieve all regions
- `GET /regions/:regionId/localities` - Get localities by region ID

### Items
- `GET /items/classifications` - Retrieve item classifications

### Inspections
- `GET /inspections/tenders/:id` - Inspect a specific tender
- `GET /inspections/regions/:id?from=YYYY-MM-DD&to=YYYY-MM-DD` - Inspect a specific region within a date range
- `GET /inspections/regions?from=YYYY-MM-DD&to=YYYY-MM-DD` - Inspect all regions within a date range
- `GET /inspections/localities/:id?from=YYYY-MM-DD&to=YYYY-MM-DD` - Inspect a specific locality within a date range

### Estimates
- `GET /estimates/localities?year=YYYY&regionId=X` - Get cost estimates for localities
- `PUT /estimates/localities` - Update cost estimates for localities
- `GET /estimates/regions?year=YYYY` - Get cost estimates for regions
- `PUT /estimates/regions?year=YYYY` - Update cost estimates for regions
- `GET /estimates/items?year=YYYY&classificationId=X` - Get cost estimates for items
- `PUT /estimates/items` - Update cost estimates for items
