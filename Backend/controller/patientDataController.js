import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { User } from "../models/userSchema.js";
import xlsx from "xlsx";
import { logAdminAction } from "../utils/audit.js";

// Import patients from Excel or PDF
export const importPatients = catchAsyncErrors(async (req, res, next) => {
    console.log('POST /patient/import called');
    console.log('User:', req.user ? req.user.email : 'No user');
    console.log('Files:', req.files);

    // Check admin authorization
    if (!req.user || req.user.role !== 'Admin') {
        return next(new ErrorHandler('Admin privileges required', 403));
    }

    if (!req.files || !req.files.file) {
        return next(new ErrorHandler('Please upload a file', 400));
    }

    const file = req.files.file;
    const fileExtension = file.name.split('.').pop().toLowerCase();

    let patientsData = [];

    try {
        if (fileExtension === 'xlsx' || fileExtension === 'xls') {
            // Parse Excel file
            const workbook = xlsx.read(file.data, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet);

            patientsData = jsonData.map(row => ({
                firstName: row.firstName || row.FirstName || row['First Name'] || '',
                lastName: row.lastName || row.LastName || row['Last Name'] || '',
                email: row.email || row.Email || '',
                phone: row.phone || row.Phone || row['Phone Number'] || '',
                dob: row.dob || row.DOB || row['Date of Birth'] || '',
                gender: row.gender || row.Gender || 'Other',
                aadhar: row.aadhar || row.Aadhar || row['Aadhar Number'] || '000000000000',
                password: row.password || Math.random().toString(36).slice(-8) // Random password if not provided
            }));

        } else if (fileExtension === 'pdf') {
            // Parse PDF file
            const pdfData = await pdfParse(file.data);
            const text = pdfData.text;

            // Basic parsing - assumes each line has patient data
            // Format: FirstName LastName Email Phone DOB Gender
            const lines = text.split('\n').filter(line => line.trim());

            patientsData = lines.slice(1).map(line => { // Skip header line
                const parts = line.trim().split(/\s+/);
                if (parts.length >= 4) {
                    return {
                        firstName: parts[0] || '',
                        lastName: parts[1] || '',
                        email: parts[2] || '',
                        phone: parts[3] || '',
                        dob: parts[4] || '',
                        gender: parts[5] || 'Other',
                        aadhar: '000000000000',
                        password: Math.random().toString(36).slice(-8)
                    };
                }
                return null;
            }).filter(Boolean);

        } else {
            return next(new ErrorHandler('Unsupported file format. Please upload .xlsx or .pdf', 400));
        }

        // Validate and filter valid patients
        const validPatients = [];
        const errors = [];

        for (let i = 0; i < patientsData.length; i++) {
            const patient = patientsData[i];

            // Validate required fields
            if (!patient.firstName || !patient.lastName || !patient.email) {
                errors.push(`Row ${i + 1}: Missing required fields (firstName, lastName, email)`);
                continue;
            }

            // Check if email is valid
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(patient.email)) {
                errors.push(`Row ${i + 1}: Invalid email format`);
                continue;
            }

            // Check if patient already exists
            const existingPatient = await User.findOne({ email: patient.email });
            if (existingPatient) {
                errors.push(`Row ${i + 1}: Patient with email ${patient.email} already exists`);
                continue;
            }

            validPatients.push(patient);
        }

        // Bulk insert valid patients
        let insertedCount = 0;
        const insertedPatients = [];

        for (const patientData of validPatients) {
            try {
                const patient = await User.create({
                    ...patientData,
                    role: 'Patient'
                });
                insertedPatients.push({
                    _id: patient._id,
                    name: `${patient.firstName} ${patient.lastName}`,
                    email: patient.email
                });
                insertedCount++;
            } catch (error) {
                errors.push(`Failed to create patient ${patientData.email}: ${error.message}`);
            }
        }

        // Log admin action
        try {
            await logAdminAction({
                adminId: req.user._id,
                action: 'bulk_import_patients',
                targetType: 'User',
                details: {
                    fileName: file.name,
                    totalRows: patientsData.length,
                    successfulImports: insertedCount,
                    failedImports: errors.length,
                    timestamp: new Date()
                }
            });
        } catch (auditError) {
            console.error('Failed to log admin action:', auditError);
        }

        res.status(200).json({
            success: true,
            message: `Successfully imported ${insertedCount} patients`,
            data: {
                totalRows: patientsData.length,
                successfulImports: insertedCount,
                failedImports: errors.length,
                insertedPatients: insertedPatients,
                errors: errors
            }
        });

    } catch (error) {
        console.error('Error importing patients:', error);
        return next(new ErrorHandler('Failed to import patients: ' + error.message, 500));
    }
});

// Get import template
export const getImportTemplate = catchAsyncErrors(async (req, res, next) => {
    // Create a sample Excel template
    const templateData = [
        {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '1234567890',
            dob: '1990-01-01',
            gender: 'Male',
            aadhar: '123456789012'
        },
        {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '0987654321',
            dob: '1985-05-15',
            gender: 'Female',
            aadhar: '987654321098'
        }
    ];

    const worksheet = xlsx.utils.json_to_sheet(templateData);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Patients');

    const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename=patient_import_template.xlsx');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
});
