import React, { forwardRef } from 'react';

interface FileUploaderProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export const FileUploader = forwardRef<HTMLInputElement, FileUploaderProps>(
  ({ onChange, disabled }, ref) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Select Excel File
      </label>
      <input
        ref={ref}
        type="file"
        accept=".xlsx"
        onChange={onChange}
        disabled={disabled}
        className="block w-full text-sm text-gray-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-md file:border-0
          file:text-sm file:font-medium
          file:bg-blue-50 file:text-blue-700
          hover:file:bg-blue-100
          disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  )
);

FileUploader.displayName = 'FileUploader';