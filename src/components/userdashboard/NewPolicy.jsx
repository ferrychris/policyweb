import React from 'react';
import PolicyGenerator from './components/PolicyGenerator';

const NewPolicy = () => {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <PolicyGenerator />
            </div>
        </div>
    );
};

export default NewPolicy; 