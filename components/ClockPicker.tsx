
import React, { useState } from 'react';

interface ClockPickerProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
}

const ClockPicker: React.FC<ClockPickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(value.split(':')[0] || '12');
  const [minutes, setMinutes] = useState(value.split(':')[1] || '00');

  const updateTime = (h: string, m: string) => {
    setHours(h);
    setMinutes(m);
    onChange(`${h.padStart(2, '0')}:${m.padStart(2, '0')}`);
  };

  return (
    <div className="mb-4 relative">
      <label className="block text-sm font-semibold text-gray-700 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 flex items-center justify-between bg-white hover:border-indigo-300 transition-all"
      >
        <span className="text-gray-800 font-bold text-lg">{hours}:{minutes}</span>
        <i className="fa-solid fa-clock text-indigo-500"></i>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-white rounded-2xl shadow-2xl border border-gray-100 w-full animate-in zoom-in duration-200">
          <div className="flex gap-4 items-center justify-center mb-4">
             <div className="flex flex-col items-center">
                <button type="button" onClick={() => updateTime(((parseInt(hours) + 1) % 24).toString(), minutes)} className="p-2 hover:bg-gray-100 rounded-lg"><i className="fa-solid fa-chevron-up"></i></button>
                <span className="text-2xl font-bold">{hours.padStart(2, '0')}</span>
                <button type="button" onClick={() => updateTime(((parseInt(hours) + 23) % 24).toString(), minutes)} className="p-2 hover:bg-gray-100 rounded-lg"><i className="fa-solid fa-chevron-down"></i></button>
             </div>
             <span className="text-2xl font-bold">:</span>
             <div className="flex flex-col items-center">
                <button type="button" onClick={() => updateTime(hours, ((parseInt(minutes) + 5) % 60).toString())} className="p-2 hover:bg-gray-100 rounded-lg"><i className="fa-solid fa-chevron-up"></i></button>
                <span className="text-2xl font-bold">{minutes.padStart(2, '0')}</span>
                <button type="button" onClick={() => updateTime(hours, ((parseInt(minutes) + 55) % 60).toString())} className="p-2 hover:bg-gray-100 rounded-lg"><i className="fa-solid fa-chevron-down"></i></button>
             </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="w-full py-2 bg-indigo-600 text-white rounded-lg font-bold"
          >
            Set Time
          </button>
        </div>
      )}
    </div>
  );
};

export default ClockPicker;
