require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

const bookings = new Map();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const calendar = google.calendar({
  version: 'v3',
  auth: oauth2Client,
});

app.post('/api/create-booking', async (req, res) => {
  try {
    const { service, serviceName, price, priceUSD, name, email, phone, date, time } = req.body;

    if (!name || !email || !phone || !date || !time) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const bookingId = uuidv4();
    const booking = {
      bookingId,
      service,
      serviceName,
      price,
      priceUSD,
      name,
      email,
      phone,
      date,
      time,
      createdAt: new Date(),
      status: 'pending',
    };

    bookings.set(bookingId, booking);
    console.log(`Booking created: ${bookingId}`);

    res.json({ bookingId, message: 'Booking created successfully' });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { bookingId, transactionId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'Missing bookingId' });
    }

    const booking = bookings.get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    booking.status = 'confirmed';
    booking.paymentVerified = true;
    booking.transactionId = transactionId || 'DEMO_' + Date.now();
    console.log(`Payment verified for booking: ${bookingId}`);

    res.json({ verified: true, bookingId });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/create-calendar-event', async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'Missing bookingId' });
    }

    const booking = bookings.get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const [year, month, day] = booking.date.split('-');
    const [hours, minutes] = booking.time.split(':');
    const eventStart = new Date(year, month - 1, day, hours, minutes);
    const eventEnd = new Date(eventStart.getTime() + 60 * 60 * 1000);

    const event = {
      summary: `Booking: ${booking.serviceName} - ${booking.name}`,
      description: `Service: ${booking.serviceName}\nClient: ${booking.name}\nEmail: ${booking.email}\nPhone: ${booking.phone}`,
      start: { dateTime: eventStart.toISOString() },
      end: { dateTime: eventEnd.toISOString() },
      conferenceData: {
        createRequest: { requestId: bookingId },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    booking.calendarEventId = response.data.id;
    booking.meetLink = response.data.conferenceData?.entryPoints?.[0]?.uri || 'No meet link';

    console.log(`Calendar event created: ${response.data.id}`);
    res.json({ eventId: response.data.id, meetLink: booking.meetLink });
  } catch (error) {
    console.error('Create calendar event error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/send-confirmation-emails', async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ error: 'Missing bookingId' });
    }

    const booking = bookings.get(bookingId);
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    const clientEmailContent = `
      <h2>Booking Confirmation</h2>
      <p>Dear ${booking.name},</p>
      <p>Your booking has been confirmed!</p>
      <p><strong>Service:</strong> ${booking.serviceName}</p>
      <p><strong>Date:</strong> ${booking.date}</p>
      <p><strong>Time:</strong> ${booking.time}</p>
      <p><strong>Price:</strong> ${booking.price} (USD $${booking.priceUSD})</p>
      ${booking.meetLink ? `<p><strong>Meeting Link:</strong> <a href="${booking.meetLink}">${booking.meetLink}</a></p>` : ''}
      <p>Thank you!</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: booking.email,
      subject: `Booking Confirmation - ${booking.serviceName}`,
      html: clientEmailContent,
    });

    const ownerEmailContent = `
      <h2>New Booking Received</h2>
      <p><strong>Client:</strong> ${booking.name}</p>
      <p><strong>Email:</strong> ${booking.email}</p>
      <p><strong>Phone:</strong> ${booking.phone}</p>
      <p><strong>Service:</strong> ${booking.serviceName}</p>
      <p><strong>Date:</strong> ${booking.date}</p>
      <p><strong>Time:</strong> ${booking.time}</p>
      <p><strong>Price:</strong> ${booking.price} (USD $${booking.priceUSD})</p>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.OWNER_EMAIL,
      subject: `New Booking - ${booking.serviceName}`,
      html: ownerEmailContent,
    });

    console.log(`Confirmation emails sent for booking: ${bookingId}`);
    res.json({ success: true, message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Send emails error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/booking/:bookingId', (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = bookings.get(bookingId);

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Impact Gravity Backend running on port ${PORT}`);
});
