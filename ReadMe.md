# Inventlix Assignment Project

This repository contains both the backend (Django) and frontend components of the Inventlix assignment project.

## Backend Setup (Django)

### Prerequisites
- Python 3.9.13
- pip (Python package manager)
- Virtual environment (recommended)

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd Inventlix-assignment
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install backend dependencies:
   ```
   cd backend  # Navigate to the Django project directory
   pip install -r requirements.txt
   ```

4. Set up the database:
   ```
   python manage.py migrate
   ```

5. Create Dummy Data(optional) :
   ```
   python manage.py seed_items
   ```

### Running the Backend Server

Start the Django development server:
```
python manage.py runserver
```

The backend will be available at [http://localhost:8000/](http://localhost:8000/)

## Frontend Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install frontend dependencies:
   ```
   npm install
   # or
   yarn install
   ```
3. Add the Enviroment Variables:
    ```
    VITE_CLOUDINARY_CLOUD_NAME= Cloudinary Cloud Name
    VITE_CLOUDINARY_UPLOAD_PRESET= Cloudinary Upload Preset
    VITE_API_BASE_URL=  Backend URL

    Cloudinary Setup Documentation Link :[text](https://cloudinary.com/documentation/react_image_and_video_upload)
    ```

### Running the Frontend Development Server

Start the frontend development server:
```
npm run dev
```

The frontend application will be available at [http://localhost:5173/](http://localhost:5173/)

## Features
- Image uploading for product images.
- Frontend filter options: Name, Price, and Category.
- User role–based frontend access.

## Development

When developing, you'll need to run both the backend and frontend servers simultaneously. You can use separate terminal windows for this purpose.
