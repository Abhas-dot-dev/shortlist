'use client';

import React, { useState, useRef, DragEvent } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Inputs';

interface FileUploaderProps {
  onUploadStart?: (file: File) => void;
  onUploadSuccess?: (data: any) => void;
  onUploadError?: (error: string) => void;
  jobId?: string; // If uploading for a specific job
}

type PipelineStep = 
  | 'idle'
  | 'uploading'
  | 'extracting'
  | 'analyzing'
  | 'matching'
  | 'generating'
  | 'completed'
  | 'error';

export function FileUploader({
  onUploadStart,
  onUploadSuccess,
  onUploadError,
  jobId
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<PipelineStep>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const steps = [
    { key: 'uploading', label: 'Uploading Resume...' },
    { key: 'extracting', label: 'Extracting Text...' },
    { key: 'analyzing', label: 'Analyzing Resume...' },
    { key: 'matching', label: 'Comparing with Job...' },
    { key: 'generating', label: 'Generating Score...' }
  ];

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const validateAndProcessFile = (file: File) => {
    const validTypes = [
      'application/pdf', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
      'application/msword' // DOC
    ];
    
    if (!validTypes.includes(file.type)) {
      setError('Unsupported file type. Please upload a PDF or DOCX file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('File size too large. Please upload a file smaller than 5MB.');
      return;
    }

    setFile(file);
    startPipeline(file);
  };

  const setError = (msg: string) => {
    setStatus('error');
    setErrorMessage(msg);
    if (onUploadError) onUploadError(msg);
  };

  const startPipeline = async (file: File) => {
    setStatus('uploading');
    setProgress(10);
    if (onUploadStart) onUploadStart(file);

    try {
      // Step 1: Uploading to server / Cloudinary
      await simulateDelay(1500);
      setProgress(30);
      setStatus('extracting');

      // Step 2: Extracting Text
      const formData = new FormData();
      formData.append('file', file);
      if (jobId) formData.append('jobId', jobId);

      // We'll call our API here. It handles both parsing & AI analyzing.
      // Let's call the resume analysis API route
      const response = await fetch('/api/resumes/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to analyze the resume.');
      }

      setProgress(50);
      setStatus('analyzing');
      await simulateDelay(1200);

      setProgress(75);
      setStatus('matching');
      await simulateDelay(1000);

      setProgress(90);
      setStatus('generating');
      await simulateDelay(800);

      const data = await response.json();
      setProgress(100);
      setStatus('completed');
      
      if (onUploadSuccess) {
        onUploadSuccess(data);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during analysis.');
    }
  };

  const simulateDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const resetUploader = () => {
    setFile(null);
    setStatus('idle');
    setProgress(0);
    setErrorMessage('');
  };

  return (
    <div className="w-full">
      {status === 'idle' && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
            dragActive
              ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
              : 'border-slate-300 hover:border-blue-400 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/30'
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.doc"
            onChange={handleChange}
          />
          <div className="p-4 bg-blue-50 dark:bg-slate-800/60 text-blue-600 dark:text-blue-400 rounded-full mb-4">
            <UploadCloud className="h-8 w-8" />
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
            Drag & drop resume, or <span className="text-blue-600 dark:text-blue-400">browse</span>
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            Supports PDF, DOCX up to 5MB
          </p>
        </div>
      )}

      {status !== 'idle' && status !== 'error' && status !== 'completed' && (
        <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-slate-800 text-blue-500 rounded-lg">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {file?.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {(file!.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <div className="text-sm font-bold text-blue-600 dark:text-blue-400 animate-pulse">
              {progress}%
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div 
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Pipeline Stepper */}
          <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-medium text-slate-400">
            {steps.map((step, idx) => {
              const stepIdx = steps.findIndex(s => s.key === status);
              const isActive = status === step.key;
              const isDone = stepIdx > idx;

              return (
                <div key={step.key} className="space-y-1">
                  <div className={`mx-auto w-3.5 h-3.5 rounded-full flex items-center justify-center transition-all ${
                    isDone 
                      ? 'bg-emerald-500 text-white' 
                      : isActive 
                      ? 'bg-blue-600 text-white animate-ping' 
                      : 'bg-slate-200 dark:bg-slate-800'
                  }`} />
                  <p className={`hidden sm:block ${isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : isDone ? 'text-slate-600 dark:text-slate-300' : ''}`}>
                    {step.label.split(' ')[0]}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="text-center text-xs font-semibold text-slate-600 dark:text-slate-300 animate-pulse">
            {steps.find(s => s.key === status)?.label || 'Analyzing...'}
          </div>
        </div>
      )}

      {status === 'completed' && (
        <div className="p-6 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-xl flex flex-col items-center justify-center text-center space-y-4 shadow-sm animate-fade-in">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">Analysis Complete!</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Resume parsed and matched with job details successfully.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={resetUploader}>
              Upload Another
            </Button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="p-6 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl flex flex-col items-center justify-center text-center space-y-4 shadow-sm">
          <AlertCircle className="h-12 w-12 text-red-500" />
          <div>
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">Processing Failed</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {errorMessage}
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={resetUploader} className="flex gap-2">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
