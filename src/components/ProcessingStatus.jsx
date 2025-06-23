import React from 'react';

const ProcessingStatus = () => {
  return (
    <div className="processing-container">
      <div className="processing-spinner"></div>
      <h3>🤖 AI Processing Your Contacts</h3>
      <div className="processing-steps">
        <div className="step active">📊 Analyzing contact data</div>
        <div className="step active">🧠 Generating personalized emails</div>
        <div className="step">✨ Creating email variants</div>
        <div className="step">📧 Preparing export</div>
      </div>
      <p>This usually takes 2-3 minutes for 1000 contacts...</p>
    </div>
  );
};

export default ProcessingStatus;