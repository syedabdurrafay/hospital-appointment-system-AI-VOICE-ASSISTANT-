import { useState } from 'react';
import axios from 'axios';
import './ImportPatients.css';

const ImportPatients = () => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (fileExtension === 'xlsx' || fileExtension === 'xls' || fileExtension === 'pdf') {
                setSelectedFile(file);
                setError(null);
                setUploadResult(null);
            } else {
                setError('Please select a valid Excel (.xlsx, .xls) or PDF file');
                setSelectedFile(null);
            }
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        setUploading(true);
        setError(null);
        setUploadResult(null);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const token = localStorage.getItem('adminToken') || document.cookie
                .split('; ')
                .find(row => row.startsWith('adminToken='))
                ?.split('=')[1];

            const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            const response = await axios.post(`${apiUrl}/api/v1/user/patient/import`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true
            });

            if (response.data.success) {
                setUploadResult(response.data.data);
                setSelectedFile(null);
                // Reset file input
                document.getElementById('file-input').value = '';
            } else {
                setError('Upload failed: ' + (response.data.message || 'Unknown error'));
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(err.response?.data?.message || 'Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const downloadTemplate = async () => {
        try {
            const token = localStorage.getItem('adminToken') || document.cookie
                .split('; ')
                .find(row => row.startsWith('adminToken='))
                ?.split('=')[1];

            const apiUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
            const response = await axios.get(`${apiUrl}/api/v1/user/patient/import/template`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                withCredentials: true,
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'patient_import_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            console.error('Template download error:', err);
            setError('Failed to download template');
        }
    };

    return (
        <div className="import-patients-page">
            <div className="import-header">
                <h1>Import Patients</h1>
                <p>Bulk import patient data from Excel or PDF files</p>
            </div>

            <div className="import-container">
                <div className="import-card">
                    <div className="card-section">
                        <h2>📥 Upload File</h2>
                        <p className="section-description">
                            Select an Excel (.xlsx, .xls) or PDF file containing patient data
                        </p>

                        <div className="file-upload-area">
                            <input
                                id="file-input"
                                type="file"
                                accept=".xlsx,.xls,.pdf"
                                onChange={handleFileSelect}
                                className="file-input"
                            />
                            <label htmlFor="file-input" className="file-label">
                                <div className="upload-icon">📄</div>
                                <div className="upload-text">
                                    {selectedFile ? (
                                        <>
                                            <strong>{selectedFile.name}</strong>
                                            <span>{(selectedFile.size / 1024).toFixed(2)} KB</span>
                                        </>
                                    ) : (
                                        <>
                                            <strong>Click to select file</strong>
                                            <span>or drag and drop here</span>
                                        </>
                                    )}
                                </div>
                            </label>
                        </div>

                        <div className="action-buttons">
                            <button
                                className="btn btn-primary"
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                            >
                                {uploading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <span>⬆️</span>
                                        Upload & Import
                                    </>
                                )}
                            </button>

                            <button className="btn btn-secondary" onClick={downloadTemplate}>
                                <span>📥</span>
                                Download Template
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <span className="alert-icon">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {uploadResult && (
                        <div className="result-section">
                            <div className="alert alert-success">
                                <span className="alert-icon">✅</span>
                                <span>Import completed successfully!</span>
                            </div>

                            <div className="result-stats">
                                <div className="stat-card">
                                    <div className="stat-value">{uploadResult.totalRows}</div>
                                    <div className="stat-label">Total Rows</div>
                                </div>
                                <div className="stat-card success">
                                    <div className="stat-value">{uploadResult.successfulImports}</div>
                                    <div className="stat-label">Successful</div>
                                </div>
                                <div className="stat-card error">
                                    <div className="stat-value">{uploadResult.failedImports}</div>
                                    <div className="stat-label">Failed</div>
                                </div>
                            </div>

                            {uploadResult.insertedPatients && uploadResult.insertedPatients.length > 0 && (
                                <div className="imported-list">
                                    <h3>Imported Patients:</h3>
                                    <div className="patient-list">
                                        {uploadResult.insertedPatients.map((patient, idx) => (
                                            <div key={idx} className="patient-item">
                                                <span className="patient-icon">👤</span>
                                                <div className="patient-info">
                                                    <strong>{patient.name}</strong>
                                                    <span>{patient.email}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {uploadResult.errors && uploadResult.errors.length > 0 && (
                                <div className="errors-list">
                                    <h3>Errors:</h3>
                                    <div className="error-items">
                                        {uploadResult.errors.map((err, idx) => (
                                            <div key={idx} className="error-item">
                                                <span className="error-icon">❌</span>
                                                <span>{err}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="info-card">
                    <h2>📋 File Format Guidelines</h2>

                    <div className="guideline-section">
                        <h3>Excel Format (.xlsx, .xls)</h3>
                        <p>Your Excel file should have the following columns:</p>
                        <ul>
                            <li><strong>firstName</strong> - Patient's first name (required)</li>
                            <li><strong>lastName</strong> - Patient's last name (required)</li>
                            <li><strong>email</strong> - Valid email address (required)</li>
                            <li><strong>phone</strong> - Phone number</li>
                            <li><strong>dob</strong> - Date of birth (YYYY-MM-DD)</li>
                            <li><strong>gender</strong> - Male/Female/Other</li>
                            <li><strong>aadhar</strong> - Aadhar number (optional)</li>
                        </ul>
                    </div>

                    <div className="guideline-section">
                        <h3>PDF Format</h3>
                        <p>PDF should contain patient data in the following format:</p>
                        <code>FirstName LastName Email Phone DOB Gender</code>
                        <p className="note">Note: Excel format is recommended for better accuracy</p>
                    </div>

                    <div className="tips-section">
                        <h3>💡 Tips</h3>
                        <ul>
                            <li>Download the template for the correct format</li>
                            <li>Ensure all required fields are filled</li>
                            <li>Use valid email addresses</li>
                            <li>Duplicate emails will be skipped</li>
                            <li>Maximum file size: 50MB</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ImportPatients;
