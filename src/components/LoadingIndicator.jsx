export default function LoadingIndicator() {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
            <div className="spinner-circle"></div>
          </div>
          <h3>Loading Traffic Dashboard</h3>
          <p className="loading-message">
            Using <strong>Background Tasks API</strong> to optimize performance...
          </p>
          <div className="loading-progress">
            <div className="progress-bar"></div>
          </div>
        </div>
      </div>
    );
  }