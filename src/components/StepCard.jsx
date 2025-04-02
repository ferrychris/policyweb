import React from 'react';

const StepCard = ({ number, title, description }) => {
  return (
    <div className="mb-4">
      <h5 className="text-lg font-medium flex items-center">
        <span className="flex items-center justify-center h-8 w-8 rounded-full gradient-bg text-white mr-2">
          {number}
        </span>
        {title}
      </h5>
      <p className="ml-10">{description}</p>
    </div>
  );
};

export default StepCard;
