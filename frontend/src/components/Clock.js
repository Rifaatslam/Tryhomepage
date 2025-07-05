import React, { useState, useEffect } from 'react';

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    // Convert to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('bn-BD', options);
  };

  return (
    <div className="text-center animate-fade-in">
      <div className="glass p-6 rounded-3xl inline-block animate-pulse-glow">
        <div className="text-white text-4xl md:text-5xl font-semibold tracking-widest clock mb-2">
          {formatTime(time)}
        </div>
        <div className="text-white/70 text-lg">
          {formatDate(time)}
        </div>
      </div>
    </div>
  );
};

export default Clock;