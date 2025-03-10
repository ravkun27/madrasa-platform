const AuditLog = ({ logs }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h2 className="text-2xl font-bold mb-6">Audit Log</h2>
    <div className="space-y-4">
      {logs.map((log) => (
        <div key={log.id} className="border-b pb-2">
          <p className="text-sm text-gray-600">{log.timestamp}</p>
          <p>
            {log.action} by {log.admin}
          </p>
        </div>
      ))}
    </div>
  </div>
);

export default AuditLog;
