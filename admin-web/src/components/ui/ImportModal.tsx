import React, { useState } from 'react';
import { X, Upload, Download, Lock } from 'lucide-react';
import axios from 'axios';
import { authService } from '../../services/auth';
const uri = import.meta.env['VITE_API_URL'];
interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}
export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [templateDownloaded, setTemplateDownloaded] = useState(false);

  const handleDownloadTemplate = async () => {
    try {
      const response = await axios.get(
        `${uri}/api/admin/questions/template`,
        {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
          },
          responseType: 'blob', // Important for file download
        }
      );

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'questions-import-template.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setTemplateDownloaded(true);
    } catch (err) {
      setError('Failed to download template');
    }
  };

  const handleImport = async () => {
    if (!file || !templateDownloaded) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        `${uri}/api/admin/questions/import`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${authService.getToken()}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      // Backend returns imported as a number, not an array
      onSuccess(response.data.imported || 0);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Import failed');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#1F2935]">
            Import Questions
          </h2>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* STEP 1 */}
          <div className="border rounded-xl p-5">
            <p className="font-semibold mb-2">Step 1: Download Template</p>
            <p className="text-sm text-[#626262] mb-4">
              You must download the template before importing.
            </p>

            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-2 px-5 py-3 border border-[#FF7E3D] text-[#FF7E3D] rounded-xl hover:bg-orange-50"
            >
              <Download size={18} />
              Download Excel Template
            </button>

            {templateDownloaded && (
              <p className="text-green-600 text-sm mt-3">
                ✓ Template downloaded
              </p>
            )}
          </div>

          {/* STEP 2 */}
          <div
            className={`border-2 border-dashed rounded-xl p-6 text-center transition
              ${
                templateDownloaded
                  ? 'border-[#FF7E3D]'
                  : 'border-gray-300 bg-gray-50 cursor-not-allowed'
              }`}
            onDragOver={(e) => templateDownloaded && e.preventDefault()}
            onDrop={(e) => {
              if (!templateDownloaded) return;
              e.preventDefault();
              if (e.dataTransfer.files[0]) {
                setFile(e.dataTransfer.files[0]);
              }
            }}
          >
            {!templateDownloaded ? (
              <div className="flex flex-col items-center text-gray-400">
                <Lock size={36} className="mb-2" />
                <p className="text-sm">
                  Download template to enable upload
                </p>
              </div>
            ) : (
              <>
                <Upload size={42} className="mx-auto text-[#FF7E3D] mb-3" />
                <p className="text-[#626262] mb-2">
                  Step 2: Upload Filled Excel File
                </p>

                <input
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  id="excel-upload"
                  disabled={!templateDownloaded}
                  onChange={(e) =>
                    e.target.files?.[0] && setFile(e.target.files[0])
                  }
                />

                <label
                  htmlFor="excel-upload"
                  className="cursor-pointer inline-block px-6 py-3 border border-[#FF7E3D] rounded-xl hover:bg-orange-50"
                >
                  Choose File
                </label>

                {file && (
                  <p className="mt-3 text-sm text-[#626262]">
                    Selected: <strong>{file.name}</strong>
                  </p>
                )}
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 border rounded-xl">
              Cancel
            </button>

            <button
              onClick={handleImport}
              disabled={!file || !templateDownloaded || uploading}
              className="px-6 py-3 bg-[#FF7E3D] text-white rounded-xl disabled:opacity-50"
            >
              {uploading ? 'Importing...' : 'Import Questions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
