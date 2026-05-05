import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { tripApi } from '../../../services/tripApi';
import { validateCSVFile } from '../../../utils/tripUtils';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DescriptionIcon from '@mui/icons-material/Description';
import { toast } from 'react-toastify';

const TripUpload: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [tripName, setTripName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (selectedFile: File) => {
        const validation = validateCSVFile(selectedFile);
        if (!validation.valid) {
            setUploadError(validation.error || 'Invalid file');
            return;
        }

        setFile(selectedFile);
        setUploadError(null);
        setUploadSuccess(false);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);
        setUploadError(null);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            const response = await tripApi.uploadTrip(file, tripName);

            clearInterval(progressInterval);
            setUploadProgress(100);
            setUploadSuccess(true);
            toast.success('Trip uploaded successfully!');

            // Redirect to trip details after 2 seconds
            setTimeout(() => {
                navigate(`/dashboard/trips/${response.tripId}`);
            }, 2000);
        } catch (error: unknown) {
            let message = 'Failed to upload trip';
            if (axios.isAxiosError(error)) {
                message = error.response?.data?.message || message;
            } else if (error instanceof Error) {
                message = error.message;
            }
            toast.error(message);
            setUploadError(message);
            setUploadProgress(0);
        } finally {
            setUploading(false);
        }
    };

    const resetUpload = () => {
        setFile(null);
        setTripName('');
        setUploadSuccess(false);
        setUploadError(null);
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="trip-upload">
            <div className="dashboard-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Upload GPS Trip Data</h3>
                        <p className="card-subtitle">Upload a CSV file containing GPS coordinates and timestamps</p>
                    </div>
                </div>

                {/* Upload Area */}
                <div
                    className={`upload-area ${dragActive ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => !file && fileInputRef.current?.click()}
                    style={{
                        border: `2px dashed ${dragActive ? '#667eea' : '#cbd5e0'}`,
                        borderRadius: '12px',
                        padding: '60px 20px',
                        textAlign: 'center',
                        cursor: file ? 'default' : 'pointer',
                        background: dragActive ? 'rgba(102, 126, 234, 0.05)' : 'transparent',
                        transition: 'all 0.3s ease',
                        marginBottom: '24px',
                    }}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        onChange={handleFileInputChange}
                        style={{ display: 'none' }}
                    />

                    {!file ? (
                        <>
                            <CloudUploadIcon style={{ fontSize: 64, color: '#cbd5e0', marginBottom: '16px' }} />
                            <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#2d3748', margin: '0 0 8px 0' }}>
                                Drop your CSV file here
                            </h4>
                            <p style={{ fontSize: '14px', color: '#718096', margin: '0 0 16px 0' }}>
                                or click to browse
                            </p>
                            <p style={{ fontSize: '12px', color: '#a0aec0', margin: 0 }}>
                                Maximum file size: 10MB
                            </p>
                        </>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                            <DescriptionIcon style={{ fontSize: 48, color: '#667eea' }} />
                            <div style={{ textAlign: 'left' }}>
                                <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#2d3748', margin: '0 0 4px 0' }}>
                                    {file.name}
                                </h4>
                                <p style={{ fontSize: '14px', color: '#718096', margin: 0 }}>
                                    {(file.size / 1024).toFixed(2)} KB
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Trip Name Input */}
                {file && !uploadSuccess && (
                    <div style={{ marginBottom: '24px' }}>
                        <label 
                            htmlFor="tripName" 
                            style={{ 
                                display: 'block', 
                                fontSize: '14px', 
                                fontWeight: 600, 
                                color: '#4a5568', 
                                marginBottom: '8px' 
                            }}
                        >
                            Trip Name (Optional)
                        </label>
                        <input
                            id="tripName"
                            type="text"
                            placeholder="Enter a name for this trip (e.g. Office Commute)"
                            value={tripName}
                            onChange={(e) => setTripName(e.target.value)}
                            disabled={uploading}
                            style={{
                                width: '100%',
                                padding: '12px 16px',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                background: uploading ? '#f7fafc' : 'white'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#667eea'}
                            onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                        />
                    </div>
                )}

                {/* Upload Progress */}
                {uploading && (
                    <div style={{ marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#718096' }}>Uploading...</span>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#667eea' }}>{uploadProgress}%</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                                style={{
                                    width: `${uploadProgress}%`,
                                    height: '100%',
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    transition: 'width 0.3s ease',
                                }}
                            />
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {uploadSuccess && (
                    <div
                        style={{
                            padding: '16px',
                            background: '#f0fdf4',
                            border: '1px solid #86efac',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '24px',
                        }}
                    >
                        <CheckCircleIcon style={{ color: '#22c55e' }} />
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#166534', margin: '0 0 4px 0' }}>
                                Upload Successful!
                            </h4>
                            <p style={{ fontSize: '13px', color: '#15803d', margin: 0 }}>
                                Redirecting to trip details...
                            </p>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {uploadError && (
                    <div
                        style={{
                            padding: '16px',
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            marginBottom: '24px',
                        }}
                    >
                        <ErrorIcon style={{ color: '#ef4444' }} />
                        <div>
                            <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#991b1b', margin: '0 0 4px 0' }}>
                                Upload Failed
                            </h4>
                            <p style={{ fontSize: '13px', color: '#b91c1c', margin: 0 }}>
                                {uploadError}
                            </p>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    {file && !uploadSuccess && (
                        <>
                            <button className="btn-secondary" onClick={resetUpload} disabled={uploading}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleUpload} disabled={uploading}>
                                {uploading ? 'Uploading...' : 'Upload Trip'}
                            </button>
                        </>
                    )}
                    {uploadSuccess && (
                        <button className="btn-primary" onClick={resetUpload}>
                            Upload Another Trip
                        </button>
                    )}
                </div>

                {/* CSV Format Info */}
                <div
                    style={{
                        marginTop: '32px',
                        padding: '20px',
                        background: '#f7fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                    }}
                >
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#2d3748', margin: '0 0 12px 0' }}>
                        CSV Format Requirements
                    </h4>
                    <p style={{ fontSize: '13px', color: '#718096', margin: '0 0 8px 0' }}>
                        Your CSV file should contain the following columns:
                    </p>
                    <ul style={{ fontSize: '13px', color: '#718096', margin: '0', paddingLeft: '20px' }}>
                        <li>latitude (decimal degrees)</li>
                        <li>longitude (decimal degrees)</li>
                        <li>timestamp (ISO 8601 format)</li>
                        <li>ignition (ON/OFF)</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default TripUpload;
