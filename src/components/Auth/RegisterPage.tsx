import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { RegisterForm } from './RegisterForm';

export const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
          <UserPlus className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Request Account Access
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Fill out this form to request access to the system. Your request will be reviewed by an administrator.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm />
          <div className="mt-6 text-sm text-center">
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};