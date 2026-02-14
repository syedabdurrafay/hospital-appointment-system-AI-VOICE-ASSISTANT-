# Voice Assistant & Patient Import - Setup Guide

## 🚀 Features Implemented

### 1. AI Voice Assistant (Grok API Integration)
- **Conversational AI**: Natural, lively conversation flow
- **Smart Booking**: Collects patient info, checks availability, and books appointments
- **Voice Interaction**: Speech-to-Text and Text-to-Speech
- **Tool Calling**: AI can check availability and book appointments automatically

### 2. Admin Patient Data Import
- **Excel Upload**: Import patients from .xlsx/.xls files
- **PDF Upload**: Basic PDF text extraction support
- **Bulk Processing**: Import multiple patients at once
- **Error Handling**: Detailed error reporting and validation
- **Template Download**: Get a sample Excel template

## 📋 Setup Instructions

### Backend Setup

1. **Install Dependencies** (Already done)
   ```bash
   cd Backend
   npm install openai xlsx pdf-parse
   ```

2. **Add Grok API Key to .env**
   
   Open `Backend/.env` and add:
   ```env
   XAI_API_KEY=your_grok_api_key_here
   ```
   
   OR
   
   ```env
   GROK_API_KEY=your_grok_api_key_here
   ```

   **How to get Grok API Key:**
   - Visit https://x.ai/
   - Sign up for API access
   - Generate an API key
   - Copy and paste it into your .env file

3. **Restart Backend Server**
   ```bash
   npm run dev
   ```

3. **AI Service Setup (Python)**
   
   The voice assistant relies on a Python microservice for advanced natural language processing.
   
   **Install Dependencies:**
   ```bash
   cd AI-Service
   pip install -r requirements.txt
   ```
   
   **Run the Service:**
   ```bash
   python main.py
   ```
   *The service will start on http://localhost:8000*

### Frontend Setup

**Patient Frontend:**
- Voice Assistant is already integrated in the Layout
- Click the microphone button (🎙️) in the bottom-right corner
- Grant microphone permissions when prompted

**Admin Frontend:**
- Navigate to "Import Patients" from the sidebar
- Download the template or upload your own Excel/PDF file

## 🎯 How to Use

### Voice Assistant Flow

1. **Open Patient Frontend** (http://localhost:5173)
2. **Click the microphone icon** in the bottom-right
3. **Start conversation:**
   - "I need to book an appointment"
   - AI will ask for your name
   - AI will ask for your date of birth
   - AI will ask for the reason/department
   - AI will ask for preferred date
   - AI will check availability
   - AI will suggest slots if preferred time is unavailable
   - Confirm to book

4. **Example Conversation:**
   ```
   AI: "Hello! I'm your AI hospital assistant. How can I help you today?"
   You: "I need to book an appointment"
   AI: "I'd be happy to help you book an appointment. May I have your full name please?"
   You: "John Doe"
   AI: "Thank you, John. What is your date of birth?"
   You: "January 1st, 1990"
   AI: "Got it. What is the reason for your visit?"
   You: "I have a headache"
   AI: "I understand. When would you like to schedule your appointment?"
   You: "Tomorrow at 2 PM"
   AI: "Let me check availability... I have slots available at 2:00 PM, 2:30 PM, and 3:00 PM. Which works best for you?"
   You: "2 PM works"
   AI: "Perfect! I'll book your appointment for tomorrow at 2:00 PM. Can you confirm?"
   You: "Yes, confirm"
   AI: "Great! Your appointment is booked. You'll receive a confirmation shortly."
   ```

### Admin Patient Import

1. **Login to Admin Dashboard** (http://localhost:5174)
2. **Navigate to "Import Patients"** from sidebar
3. **Download Template** (optional but recommended)
4. **Fill in patient data** in Excel:
   - firstName (required)
   - lastName (required)
   - email (required, must be unique)
   - phone
   - dob (YYYY-MM-DD format)
   - gender (Male/Female/Other)
   - aadhar (optional)

5. **Upload the file**
6. **Review results:**
   - Total rows processed
   - Successful imports
   - Failed imports with error details

## 🔍 Verification

### Voice Assistant
1. Use the voice assistant to book an appointment
2. Check Admin Dashboard → Appointments
3. Verify the appointment appears
4. Check Admin Dashboard → Audit Logs
5. Verify entry: "Appointment booked via Voice Assistant"

### Patient Import
1. Upload a sample Excel file
2. Check the import results
3. Navigate to Patients list (if available)
4. Verify imported patients appear

## 🛠️ Troubleshooting

### Voice Assistant Issues

**"Speech recognition not supported"**
- Use Chrome or Edge browser
- Grant microphone permissions

**"Failed to process AI request"**
- Check if Grok API key is set in .env
- Verify backend is running
- Check backend console for errors

**"I'm having trouble connecting"**
- Verify VITE_BACKEND_URL in Frontend .env
- Check CORS settings
- Ensure backend is accessible

### Import Issues

**"Upload failed"**
- Check file format (.xlsx, .xls, or .pdf)
- Verify file size < 50MB
- Ensure you're logged in as Admin

**"Duplicate email"**
- Patients with existing emails will be skipped
- Check error details for specific rows

## 📁 File Structure

```
Backend/
├── controller/
│   ├── aiController.js          (NEW - Grok API integration)
│   ├── patientDataController.js (NEW - Import functionality)
│   └── appointmentController.js (MODIFIED - Audit support)
├── router/
│   ├── aiRouter.js              (NEW - AI routes)
│   └── userRouter.js            (MODIFIED - Import routes)
├── models/
│   └── auditSchema.js           (MODIFIED - Optional adminId)
└── app.js                       (MODIFIED - AI router registered)

Frontend-Patient/
└── src/components/Layout/
    ├── VoiceAssistant.jsx       (MODIFIED - Grok integration)
    └── VoiceAssistant.css       (MODIFIED - Enhanced UI)

Frontend-Admin/
└── src/components/Patients/
    ├── ImportPatients.jsx       (NEW - Import UI)
    └── ImportPatients.css       (NEW - Import styles)
```

## 🎨 Features

### Voice Assistant
- ✅ Natural conversation flow
- ✅ Speech-to-Text (Web Speech API)
- ✅ Text-to-Speech (Web Speech API)
- ✅ Grok AI integration
- ✅ Tool calling (availability check, booking)
- ✅ Conversation history
- ✅ Auto-restart listening
- ✅ Speaking state management
- ✅ Responsive design

### Patient Import
- ✅ Excel file support (.xlsx, .xls)
- ✅ PDF file support (basic)
- ✅ Template download
- ✅ Bulk validation
- ✅ Error reporting
- ✅ Success/failure statistics
- ✅ Imported patients list
- ✅ Audit logging

## 📝 Notes

- Voice Assistant requires microphone permissions
- Grok API key is required for AI functionality
- Excel format is recommended over PDF for accuracy
- Duplicate emails will be automatically skipped
- All voice bookings are logged in Audit system
- Patients created via import get random passwords (should be reset)

## 🔐 Security

- API key is stored in .env (never commit to git)
- Admin authentication required for imports
- File size limits enforced (50MB)
- Email validation performed
- Duplicate prevention

## 🚀 Next Steps

1. Add your Grok API key to Backend/.env
2. Test the voice assistant
3. Try importing patients
4. Check audit logs
5. Customize as needed!

---

**Need Help?** Check the console logs for detailed error messages.
