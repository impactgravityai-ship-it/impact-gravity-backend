# Frontend-Backend Integration Guide

## Overview
This guide explains how to integrate the Impact Gravity Frontend (HTML/CSS/JS) with the Impact Gravity Backend (Express.js) API.

## Backend API Endpoints

The backend provides the following REST API endpoints:

### 1. Create Booking
**Endpoint:** `POST /api/create-booking`

**Request Body:**
```json
{
  "service": "roadmap",
  "serviceName": "AI Career Roadmap",
  "price": 5999,
  "priceUSD": 70,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "91 9876543210",
  "date": "2025-12-15",
  "time": "10:00"
}
```

**Response:**
```json
{
  "bookingId": "uuid-string",
  "message": "Booking created successfully"
}
```

### 2. Verify Payment
**Endpoint:** `POST /api/verify-payment`

**Request Body:**
```json
{
  "bookingId": "uuid-string",
  "transactionId": "transaction-id"
}
```

**Response:**
```json
{
  "verified": true,
  "bookingId": "uuid-string"
}
```

### 3. Create Calendar Event
**Endpoint:** `POST /api/create-calendar-event`

**Request Body:**
```json
{
  "bookingId": "uuid-string"
}
```

**Response:**
```json
{
  "eventId": "calendar-event-id",
  "meetLink": "https://meet.google.com/xxx-yyy-zzz"
}
```

### 4. Send Confirmation Emails
**Endpoint:** `POST /api/send-confirmation-emails`

**Request Body:**
```json
{
  "bookingId": "uuid-string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Emails sent successfully"
}
```

### 5. Get Booking Details
**Endpoint:** `GET /api/booking/:bookingId`

**Response:**
```json
{
  "bookingId": "uuid-string",
  "service": "roadmap",
  "serviceName": "AI Career Roadmap",
  "price": 5999,
  "priceUSD": 70,
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "91 9876543210",
  "date": "2025-12-15",
  "time": "10:00",
  "status": "confirmed",
  "paymentVerified": true,
  "transactionId": "transaction-id",
  "calendarEventId": "event-id",
  "meetLink": "https://meet.google.com/xxx-yyy-zzz",
  "createdAt": "2025-12-01T11:00:00.000Z"
}
```

### 6. Health Check
**Endpoint:** `GET /health`

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-12-01T11:00:00.000Z"
}
```

## Frontend Configuration

### Step 1: Update API Base URL

In your frontend HTML/JavaScript, add an API configuration at the top of your script section:

```javascript
// API Configuration
const API_BASE_URL = 'http://localhost:3000'; // Change to your backend URL
// For production: const API_BASE_URL = 'https://your-backend-domain.com';
```

### Step 2: Create API Service Layer

Add this API service layer to your frontend JavaScript:

```javascript
// API Service Layer
const apiService = {
  async createBooking(bookingData) {
    const response = await fetch(`${API_BASE_URL}/api/create-booking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });
    if (!response.ok) throw new Error('Failed to create booking');
    return await response.json();
  },

  async verifyPayment(bookingId, transactionId) {
    const response = await fetch(`${API_BASE_URL}/api/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, transactionId })
    });
    if (!response.ok) throw new Error('Failed to verify payment');
    return await response.json();
  },

  async createCalendarEvent(bookingId) {
    const response = await fetch(`${API_BASE_URL}/api/create-calendar-event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId })
    });
    if (!response.ok) throw new Error('Failed to create calendar event');
    return await response.json();
  },

  async sendConfirmationEmails(bookingId) {
    const response = await fetch(`${API_BASE_URL}/api/send-confirmation-emails`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId })
    });
    if (!response.ok) throw new Error('Failed to send confirmation emails');
    return await response.json();
  },

  async getBooking(bookingId) {
    const response = await fetch(`${API_BASE_URL}/api/booking/${bookingId}`);
    if (!response.ok) throw new Error('Failed to fetch booking');
    return await response.json();
  },

  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'error' };
    }
  }
};
```

## Frontend Integration Steps

### Step 3: Update Booking System

Replace the booking system in your frontend JavaScript with this updated version that calls the backend APIs:

```javascript
// Update the Continue to Payment button click handler
document.getElementByIdcontinueToPayment.addEventListenerclick, async () => {
  const date = document.getElementByIdbookingDate.value;
  if (!date || !bookingState.time) {
    alertPlease select date and time;
    return;
  }

  try {
    // Step 1: Create booking
    bookingState.date = date;
    const bookingResponse = await apiService.createBooking({
      service: bookingState.service,
      serviceName: bookingState.serviceName,
      price: bookingState.price,
      priceUSD: bookingState.priceUSD,
      name: bookingState.name,
      email: bookingState.email,
      phone: bookingState.phone,
      date: bookingState.date,
      time: bookingState.time
    });

    bookingState.bookingId = bookingResponse.bookingId;

    // Update summary
    document.getElementByIdsummaryService.textContent = bookingState.serviceName;
    document.getElementByIdsummaryDateTime.textContent = `${bookingState.date} at ${bookingState.time}`;
    document.getElementByIdsummaryAmount.textContent = `${bookingState.price} / $${bookingState.priceUSD}`;

    showStep3;
  } catch (error) {
    console.error('Error creating booking:', error);
    alertFailed to create booking: \n + error.message;
  }
};

// Update the payment verification button
document.getElementByIdverifyPayment.addEventListenerclick, async () => {
  const btn = document.getElementByIdverifyPayment;
  btn.disabled = true;
  btn.textContent = 'Verifying Payment...';

  try {
    // Verify payment
    await apiService.verifyPayment(bookingState.bookingId, 'PHONPE_TXN_' + Date.now());

    // Create calendar event
    const calendarResponse = await apiService.createCalendarEvent(bookingState.bookingId);
    bookingState.meetLink = calendarResponse.meetLink;

    // Send confirmation emails
    await apiService.sendConfirmationEmails(bookingState.bookingId);

    // Update confirmation screen
    document.getElementByIdconfirmedDateTime.textContent = new Date(bookingState.date).toLocaleDateStringen-US, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' + " at " + bookingState.time;
    document.getElementByIdmeetLink.href = bookingState.meetLink;
    document.getElementByIdbookingId.textContent = bookingState.bookingId;
    document.getElementByIdpaymentId.textContent = 'PAY_' + Date.now();
    document.getElementByIdconfirmedEmail.textContent = bookingState.email;

    showStep4;
    btn.disabled = false;
    btn.textContent = "Ive Completed Payment";
  } catch (error) {
    console.error('Error verifying payment:', error);
    alertFailed to verify payment: \n + error.message;
    btn.disabled = false;
    btn.textContent = "Ive Completed Payment";
  }
};
```

## Environment Variables

Make sure your backend .env file is configured with:

```
PORT=3000
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your-app-password
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/google/callback
GOOGLE_REFRESH_TOKEN=your-refresh-token
OWNER_EMAIL=owner@example.com
```

## CORS Configuration

The backend already has CORS enabled. For production, update server.js to restrict CORS to your frontend domain:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: 'https://your-frontend-domain.com',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

## Testing

1. Start your backend: `npm start`
2. Verify health: `curl http://localhost:3000/health`
3. Test the frontend booking flow
4. Check backend console logs for debugging

## Deployment

### Frontend Deployment (Framer/Vercel/Netlify)
- Update `API_BASE_URL` to your production backend URL
- Deploy to your hosting platform

### Backend Deployment (Railway/Render)
1. Push code to GitHub
2. Connect to deployment platform
3. Set environment variables
4. Deploy

## Troubleshooting

### CORS Errors
- Ensure backend has CORS enabled
- Update API_BASE_URL to correct backend URL
- Check browser console for error details

### Payment Verification Fails
- Verify bookingId exists in the system
- Check backend logs for errors
- Ensure booking was created before verification

### Calendar Event Creation Fails
- Verify Google OAuth credentials are correct
- Check GOOGLE_REFRESH_TOKEN is valid
- Ensure date/time format is correct (YYYY-MM-DD HH:MM)

### Email Not Sent
- Verify EMAIL_USER and EMAIL_APP_PASSWORD are correct
- Check Gmail app passwords are set up correctly
- Verify OWNER_EMAIL is configured
