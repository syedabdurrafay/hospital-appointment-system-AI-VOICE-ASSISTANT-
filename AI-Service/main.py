import os
import json
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from openai import OpenAI
from datetime import datetime, timedelta
import pytz
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Clinic AI Voice Assistant Service")

# AI Configuration (Using Groq via OpenAI library)
GROK_KEY = os.getenv("GROK_KEY")
client = OpenAI(
    api_key=GROK_KEY,
    base_url="https://api.groq.com/openai/v1"
)

class VoiceRequest(BaseModel):
    text: str
    patientId: Optional[str] = None
    doctors: Optional[List[dict]] = None

class BookingRequest(BaseModel):
    doctorId: Optional[str] = None
    doctorName: Optional[str] = None
    specialization: Optional[str] = None
    date: str
    time: str
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    dob: Optional[str] = None
    email: Optional[str] = None
    reason: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "AI Clinic Voice Assistant Service is running"}

@app.post("/process-voice")
async def process_voice(data: VoiceRequest):
    if not data.text:
        raise HTTPException(status_code=400, detail="Text is required")

    # Get Germany Time
    germany_tz = pytz.timezone('Europe/Berlin')
    now_germany = datetime.now(germany_tz)
    current_time_str = now_germany.strftime("%Y-%m-%d %H:%M:%S")
    current_date_str = now_germany.strftime("%Y-%m-%d")
    tomorrow_str = (now_germany + timedelta(days=1)).strftime("%Y-%m-%d")

    # 1️⃣ AI Understands Intent and Extracts Data
    extraction_prompt = f"""
    You are the AI Clinic Receptionist. 
    Current date/time in Germany: {current_time_str}.
    Available Doctors in our Clinic: {json.dumps(data.doctors) if data.doctors else "Not provided"}
    
    Patient input: "{data.text}"
    
    Extract the following information in JSON format:
    - firstName (e.g., "Siddharth")
    - lastName (e.g., "Rafi")
    - dob (Date of birth, YYYY-MM-DD. Priority!)
    - specialization (e.g., Cardiologist, Dermatologist, General Physician. DEFAULT to "General Physician")
    - doctorName (Matches one of the Available Doctors)
    - date (YYYY-MM-DD format. Priority! Tomorrow is {tomorrow_str})
    - time (HH:mm format)
    - symptoms (brief description)
    - intent ("book", "cancel", "query", "confirm", "provide_info", or "other")
    - missingInfo (array of missing required fields: ["firstName", "lastName", "dob", "doctor", "date", "time"])
    - readyToBook (boolean: true if we have all required info: firstName, lastName, dob, doctor/date/time)

    CRITICAL RULES:
    1. NEVER set readyToBook to true unless ALL of these are present and valid:
       - firstName, lastName, dob (patient identification)
       - doctorName OR specialization (doctor/specialty)
       - date AND time (appointment slot)
    2. If patient hasn't confirmed yet, set intent to "provide_info" or "query"
    3. If patient says "yes", "confirm", "book it", "go ahead" - set intent to "confirm"
    4. Output STRICT JSON.
    """

    try:
        # Extraction Call
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a highly efficient clinic reservation bot. Output strictly JSON."},
                {"role": "user", "content": extraction_prompt}
            ],
            response_format={ "type": "json_object" }
        )
        
        content = response.choices[0].message.content
        try:
            structured_data = json.loads(content)
        except:
            structured_data = {"raw": content, "intent": "other", "readyToBook": False}

        # Ensure required fields exist
        if "readyToBook" not in structured_data:
            structured_data["readyToBook"] = False
        if "intent" not in structured_data:
            structured_data["intent"] = "other"
        if "missingInfo" not in structured_data:
            structured_data["missingInfo"] = []

        # 2️⃣ Determine conversation flow based on intent and data completeness
        requires_confirmation = False
        pending_booking = None
        
        # Check if we have all booking info but need confirmation
        all_booking_info_present = all([
            structured_data.get("firstName"),
            structured_data.get("lastName"),
            structured_data.get("dob"),
            (structured_data.get("doctorName") or structured_data.get("specialization")),
            structured_data.get("date"),
            structured_data.get("time")
        ])
        
        # If user is confirming (says yes) AND we have all info
        if structured_data["intent"] == "confirm" and all_booking_info_present:
            # Ready to book - prepare booking request
            pending_booking = BookingRequest(
                doctorName=structured_data.get("doctorName"),
                specialization=structured_data.get("specialization"),
                date=structured_data.get("date"),
                time=structured_data.get("time"),
                firstName=structured_data.get("firstName"),
                lastName=structured_data.get("lastName"),
                dob=structured_data.get("dob"),
                reason=structured_data.get("symptoms", "Voice appointment request")
            )
            requires_confirmation = False  # User already confirmed
            
        # If we have all info but user hasn't confirmed yet
        elif all_booking_info_present and structured_data["intent"] != "confirm":
            requires_confirmation = True
            pending_booking = BookingRequest(
                doctorName=structured_data.get("doctorName"),
                specialization=structured_data.get("specialization"),
                date=structured_data.get("date"),
                time=structured_data.get("time"),
                firstName=structured_data.get("firstName"),
                lastName=structured_data.get("lastName"),
                dob=structured_data.get("dob"),
                reason=structured_data.get("symptoms", "Voice appointment request")
            )
            
        # If user explicitly says "book" but missing info
        elif structured_data["intent"] == "book" and not all_booking_info_present:
            requires_confirmation = False  # Need to ask for missing info
            pending_booking = None

        # 3️⃣ Generate Conversational Response based on state
        conversational_prompt = f"""
        You are a friendly Clinic Receptionist. 
        Current Context: {json.dumps(structured_data)}
        Is Patient Logged In? {'Yes (ID: ' + data.patientId + ')' if data.patientId else 'No'}
        Available Clinic Doctors: {json.dumps(data.doctors) if data.doctors else "None"}
        Patient said: "{data.text}"

        CONVERSATION STATE:
        - Intent: {structured_data['intent']}
        - Missing info: {json.dumps(structured_data['missingInfo'])}
        - Ready to book (has all info): {all_booking_info_present}

        Task: Provide a professional clinic response.

        RULES:
        1. If Patient IS logged in: DO NOT ask for Name/DOB. Use "Welcome back, [Name]" if possible.
        2. If Patient is NOT logged in and wants to book: Explain "For security reasons, you must be registered with our clinic to book an appointment. Please log in or register first."
        3. If intent is 'query' or 'other': Answer helpfully and ask what they need.
        4. If we have all booking info but user hasn't confirmed yet:
           - Say: "I have Dr. [Name] available on [Date] at [Time]. Should I go ahead and book that for you?"
           - This is the confirmation step - DO NOT book without asking.
        5. If user just confirmed (intent is 'confirm'):
           - Say: "Perfect! I'm processing your booking at our clinic now..."
        6. If we're missing information:
           - Ask ONLY for the missing info, one question at a time.
           - Examples: "What date would you like to come in?" or "Which doctor would you prefer?"

        Keep response to ONE short, friendly sentence.
        """

        chat_response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": conversational_prompt}]
        )
        ai_reply = chat_response.choices[0].message.content

        # 4️⃣ Generate Summary for Clinic Records
        summary_prompt = f"Professional summary for clinic records: {data.text}. Extracted: {json.dumps(structured_data)}"
        summary_res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": summary_prompt}]
        )
        doctor_summary = summary_res.choices[0].message.content

        # Prepare response
        response_data = {
            "success": True,
            "structuredData": structured_data,
            "doctorSummary": doctor_summary,
            "germanyTime": current_time_str,
            "conversation": [
                {"role": "user", "content": data.text},
                {"role": "assistant", "content": ai_reply}
            ],
            "requiresConfirmation": requires_confirmation,
            "pendingBooking": pending_booking.dict() if pending_booking else None,
            "bookingRequest": pending_booking.dict() if pending_booking and structured_data["intent"] == "confirm" else None
        }

        return response_data

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)