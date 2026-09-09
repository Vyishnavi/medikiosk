Create a **high-fidelity, fully clickable healthcare web prototype called “MediKiosk”** for an SIH (Smart India Hackathon) project.

### PRODUCT

MediKiosk is an **AI-powered patient-facing clinical history and medical document digitization kiosk for Indian hospitals and AYUSH OPDs**.

The problem it solves:

Indian OPDs are overcrowded and doctors have very little consultation time. Patients also carry old prescriptions, lab reports and discharge summaries in paper form. Doctors spend valuable consultation time manually collecting history and reviewing these fragmented records.

MediKiosk allows the patient to complete their clinical history **before meeting the doctor**, using **voice + touchscreen**, while also scanning old medical documents. AI structures the information into a physician-ready summary and highlights potentially urgent symptoms for priority clinical assessment.

The AI **must not diagnose or prescribe**. The doctor always reviews and verifies the information.

---

## DESIGN

Make it look like a **real, premium, deployable Indian healthcare product**, not a generic chatbot.

Style:

* Clean white interface
* Deep navy
* Teal
* Medical green
* Light grey backgrounds
* Rounded cards
* Soft shadows
* Modern typography
* Large buttons and touch targets
* Accessible for elderly and low-literacy patients
* Minimal typing
* Friendly but professional

Brand:

**MediKiosk**

Tagline:

**YOUR STORY. BETTER CARE.**

Use a simple healthcare + digital connectivity logo.

---

# PATIENT KIOSK

Create a connected patient journey with these screens:

### 1. Welcome

Show:

**MediKiosk**
**YOUR STORY. BETTER CARE.**

“Complete your health information before meeting your doctor.”

Large buttons:

**START**

**NEED HELP?**

Show icons for:

* Voice
* Touch
* Document scanning
* Multilingual support

---

### 2. Language Selection

Title:

**Choose your language**

Large language buttons:

English
हिन्दी
తెలుగు
தமிழ்
ಕನ್ನಡ
മലയാളം
मराठी
বাংলা

Select Telugu in the prototype to demonstrate Indian regional-language support.

Button:

**CONTINUE**

---

### 3. Consent

Title:

**Before we begin**

Explain simply:

“MediKiosk will ask about your symptoms, medical history, medicines and previous medical records.”

“We will create a summary for your doctor.”

Include:

🔊 **LISTEN**

☐ I understand and agree

**AGREE & CONTINUE**

Show a small privacy indicator:

🔒 Your information is protected

---

### 4. Patient Identification

Title:

**Let's identify you**

Options:

**SCAN ABHA**

**ENTER ABHA**

**HOSPITAL ID**

**NEW PATIENT**

Use fictional demo data.

Show:

Patient ID: **MK-10245**

ABHA:

**Connected**

---

### 5. Patient Profile

Show:

Name: Ravi Kumar
Age: 52
Gender: Male
Language: Telugu

Button:

**START HEALTH CHECK**

---

# 6. AI VOICE HISTORY — MAIN FEATURE

This must be the most impressive patient screen.

Title:

**Let's talk about your health**

Show an AI assistant icon and a large microphone button:

🎙️ **TAP TO SPEAK**

Also show:

**I PREFER TO TAP**

AI asks naturally:

“Namaste Ravi. What brings you to the hospital today?”

Show patient response:

“I have chest pain since yesterday.”

Then demonstrate adaptive follow-up questions:

“When did the pain start?”

“Where exactly do you feel it?”

“How would you describe the pain?”

“Does it spread to your arm, back, shoulder or jaw?”

“Do you have difficulty breathing?”

“Do you feel dizzy, sweaty or nauseous?”

Show:

**Question 2 of 12**

and a progress bar.

Make the interaction look like an intelligent clinical interview, **not a chatbot conversation**.

Every important question should support:

🎙️ Speak

or

👆 Tap an answer

---

# 7. TOUCH HISTORY

Create a touchscreen alternative.

Question:

**Where do you feel the pain?**

Show a simple human body diagram.

Selectable areas:

Chest
Left arm
Right arm
Back
Shoulder
Jaw

Large buttons.

Also show:

🎙️ Answer by speaking

---

# 8. RED-FLAG ALERT

When the demo patient reports:

**Chest pain + difficulty breathing**

show a prominent warning:

⚠️ **PRIORITY CLINICAL ASSESSMENT RECOMMENDED**

Text:

“Some of your answers may require prompt medical attention. A healthcare professional has been notified.”

Buttons:

**REQUEST IMMEDIATE ASSISTANCE**

**CONTINUE HISTORY**

Important disclaimer:

“MediKiosk does not provide a diagnosis.”

This alert must also appear on the doctor dashboard.

---

# 9. MEDICAL DOCUMENT SCANNING

Title:

**Do you have previous medical records?**

Show cards:

📄 Prescription
🧪 Lab Report
🏥 Discharge Summary
🩻 Imaging Report

Button:

**SCAN DOCUMENT**

Create a realistic scanner interface with a fictional prescription.

Then show:

**Processing document...**

Progress:

✓ Document captured
✓ Text detected
✓ Medical information extracted
✓ Confidence checked
✓ Added to timeline

---

# 10. OCR VERIFICATION

Show extracted information:

**12 March 2026**

Diagnosis:
Hypertension

Medicine:
Amlodipine 5 mg

Blood Pressure:
150/95 mmHg

HbA1c:
7.2%

Some information should have a:

⚠️ **VERIFY**

label.

Allow editing.

Button:

**CONFIRM INFORMATION**

Make it clear OCR information must be verified.

---

# 11. MEDICAL TIMELINE

Create a beautiful vertical medical timeline.

Example:

**12 Mar 2026**
Hypertension
Amlodipine 5 mg

**08 Nov 2025**
Blood test
HbA1c: 7.2%

**21 Jul 2025**
Hospital discharge

Allow the user to open the original document from each timeline entry.

---

# 12. AYUSH MODE

Add an **AYUSH Assessment** option.

Show:

**Modern Clinical History**

and

**AYUSH Assessment**

For AYUSH mode demonstrate collection of:

Prakriti
Vikriti
Sara
Samhanana
Pramana
Satmya
Sattva
Ahara Shakti
Vyayama Shakti
Vaya
Ahara
Vihara
Nidana
Samprapti

Use simple questions and icon-based choices.

---

# 13. REVIEW

Title:

**Review your health information**

Show editable cards:

Chief Complaint
History of Present Illness
Past Medical History
Past Surgical History
Medications
Allergies
Family History
Personal History
Review of Systems
Previous Investigations
Documents

Each section should have:

**EDIT**

Button:

**CREATE DOCTOR SUMMARY**

---

# 14. AI CLINICAL SUMMARY

Show:

**AI-GENERATED CLINICAL SUMMARY**

Patient:
Ravi Kumar, 52 M

### Chief Complaint

Chest pain since yesterday.

### HPI

Onset: Yesterday
Location: Central chest
Associated symptom: Shortness of breath

### Past History

Hypertension

### Medications

Amlodipine 5 mg once daily

### Allergies

No known drug allergies reported

### Investigations

BP: 150/95 mmHg
HbA1c: 7.2%

### Documents

3 documents digitized

### Priority

⚠️ Priority clinical assessment recommended

Show:

**AI DRAFT — REQUIRES CLINICIAN REVIEW**

Buttons:

**SEND TO DOCTOR**

**EDIT**

---

# DOCTOR DASHBOARD

Create a separate professional doctor interface.

## 15. Doctor Login

Title:

**MediKiosk Clinical Console**

Login screen with hospital ID and password.

---

## 16. Doctor Patient Queue

Show:

**Good Morning, Dr. Sharma**

Patient cards/table:

Ravi Kumar — 52 M — Chest Pain — 🔴 Priority — Summary Ready

Anita Rao — 34 F — Fever — 🟢 Routine

Suresh Kumar — 67 M — Joint Pain — 🟡 Review

Filters:

All
Priority
Waiting
Ready

---

# 17. DOCTOR SUMMARY

Open Ravi Kumar.

At the top show:

🔴 **PRIORITY CLINICAL ASSESSMENT RECOMMENDED**

Then show:

Chief Complaint
HPI
Past History
Medications
Allergies
Investigations
Family History
Personal History
ROS

Make everything editable.

Clearly label:

**AI DRAFT**

and allow:

**EDIT**

**ACCEPT**

**REJECT**

---

# 18. DOCUMENT VIEWER

Split screen:

LEFT:
Original uploaded prescription/report

RIGHT:
AI-extracted information

Allow doctor to:

**ACCEPT**

**EDIT**

**REJECT**

Show OCR confidence.

---

# 19. FINAL VERIFIED RECORD

Show:

✓ **CLINICIAN VERIFIED**

Final structured clinical history.

Button:

**SAVE TO PATIENT RECORD**

---

# 20. ABDM / FHIR INTEGRATION

Create a final integration screen showing:

**MediKiosk**

↓

**Hospital HIS / EMR**

↓

**ABDM / ABHA**

Show:

✓ Consent recorded
✓ Structured clinical data
✓ Documents linked
✓ FHIR-ready data

Clearly label:

**PROTOTYPE INTEGRATION**

Do NOT claim a live government API connection.

---

# PROTOTYPE INTERACTION

Make the main flow fully clickable:

WELCOME
→ LANGUAGE
→ CONSENT
→ IDENTIFICATION
→ PROFILE
→ AI HISTORY
→ TOUCH ALTERNATIVE
→ RED FLAG
→ DOCUMENT SCAN
→ OCR
→ VERIFY
→ TIMELINE
→ AYUSH
→ REVIEW
→ AI SUMMARY
→ SEND TO DOCTOR
→ DOCTOR LOGIN
→ PATIENT QUEUE
→ DOCTOR SUMMARY
→ DOCUMENT VIEWER
→ EDIT / VERIFY
→ FINAL RECORD
→ ABDM/FHIR STATUS

Use realistic transitions and animations.

All buttons should work.

---

# ACCESSIBILITY

The patient kiosk must be extremely easy to use.

Use:

* Large buttons
* Large text
* High contrast
* Icons + text
* Voice instructions
* Minimal typing
* Speak OR tap for answers
* Clear progress indicator
* Simple language

Keep a visible:

🔊 **Hear Question**

option on patient screens.

---

# IMPORTANT MEDICAL SAFETY

MediKiosk is an **AI clinical documentation and intake assistant**.

It must NOT:

* Diagnose
* Prescribe
* Recommend treatment
* Replace doctors
* Make autonomous clinical decisions

It CAN:

* Collect history
* Ask relevant follow-up questions
* Extract information from documents
* Organize medical records
* Identify potentially urgent symptoms
* Generate a structured draft
* Help doctors review information

Always include:

**“MediKiosk assists clinical documentation. Final clinical decisions remain with the healthcare professional.”**

---

# FINAL GOAL

The prototype should immediately communicate this story to an SIH judge:

**PATIENT SPEAKS → MEDIKIOSK UNDERSTANDS → OLD RECORDS ARE DIGITIZED → INFORMATION IS STRUCTURED → POTENTIAL RED FLAGS ARE HIGHLIGHTED → DOCTOR RECEIVES A READY-TO-REVIEW SUMMARY**

Make it visually impressive, highly interactive, accessible, Indian-language friendly, AYUSH-inclusive, and realistic enough to look like a product that could actually be deployed in a busy Indian hospital OPD.

Use ONLY fictional patient data.
