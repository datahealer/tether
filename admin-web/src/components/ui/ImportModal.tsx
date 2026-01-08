import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import axios from 'axios';
import { authService } from '../../services/auth';
const uri=import.meta.env['VITE_API_URL']
interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    if (!file) return;
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
      onSuccess(response.data.imported?.length || 0);
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
      <div className="bg-white border border-white/20 rounded-2xl p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#1F2935]">Import Questions from Excel</h2>
          <button onClick={onClose} className="text-[#1F2935] hover:bg-white/10 p-2 rounded-lg">
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-800 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div
            className="border-2 border-dashed border-[#FF7E3D] rounded-xl p-8 text-center hover:border-[#626262]-500 transition-colors"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (e.dataTransfer.files[0]) setFile(e.dataTransfer.files[0]);
            }}
          >
            <Upload size={48} className="mx-auto text-[#FF7E3D] mb-4" />
            <p className="text-[#626262] mb-2">Drop Excel file here or click to browse</p>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => e.target.files?.[0] && setFile(e.target.files[0])}
              className="hidden"
              id="excel-upload"
            />
            <label
              htmlFor="excel-upload"
              className="cursor-pointer inline-block px-6 py-3  border border-[#FF7E3D] bg-white/10 rounded-xl text-[#1F2935] hover:bg-white/20"
            >
              Choose File
            </label>
            {file && <p className="mt-4 text-[#626262]">{file.name}</p>}
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white/10 border cursor-pointer border-[#626262] rounded-xl text-[#1F2935] hover:bg-white/20"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!file || uploading}
              className="px-6 py-3 bg-[#FF7E3D] cursor-pointer text-white rounded-xl font-medium hover:from-[#626262]-600 hover:to-pink-600 disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? 'Importing...' : 'Import Questions'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};