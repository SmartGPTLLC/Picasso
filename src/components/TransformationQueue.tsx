interface QueueStatusProps {
  jobs: TransformationJob[];
  onRetry: (jobId: string) => void;
}

const QueueStatus: React.FC<QueueStatusProps> = ({ jobs, onRetry }) => (
  <div className="queue-status">
    <h4>Processing Queue ({jobs.length})</h4>
    <div className="jobs-list">
      {jobs.map(job => (
        <div key={job.id} className={`job-item ${job.status}`}>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${job.progress}%` }}
            />
          </div>
          <div className="job-info">
            <span>{job.status}</span>
            {job.error && (
              <button 
                onClick={() => onRetry(job.id)}
                className="retry-button"
              >
                Retry
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default QueueStatus; 