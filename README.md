# impact-gravity-backend
Impact Gravity Backend - Booking, Payment, Calendar &amp; Email System. Express.js + Google Calendar API + Razorpay/PhonePe Integration.


## Frontend Integration

The backend is now integrated with the Impact Gravity Frontend. See the following files for integration details:

- **FRONTEND-INTEGRATION-GUIDE.md** - Complete integration documentation with API endpoints, configuration, and implementation steps
- **frontend-updated.html** - Code snippet showing how to integrate the API calls with your frontend

### Quick Start

1. Start the backend server: `npm start`
2. Update `API_BASE_URL` in your frontend to match the backend URL
3. Copy the API service layer from `frontend-updated.html` into your frontend
4. Replace the booking handlers with the updated versions
5. Test the booking flow in your browser

### API Endpoints

- `POST /api/create-booking` - Create a new booking
- `POST /api/verify-payment` - Verify payment for a booking
- `POST /api/create-calendar-event` - Create Google Calendar event
- `POST /api/send-confirmation-emails` - Send confirmation emails
- `GET /api/booking/:bookingId` - Retrieve booking details
- `GET /health` - Health check endpoint

### Environment Configuration

See `.env.example` for required environment variables including Gmail credentials, Google Calendar OAuth tokens, and other configuration.
