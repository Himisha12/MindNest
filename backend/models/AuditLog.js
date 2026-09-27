import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: {
      type: String,
      default: 'Guest'
    },
    ip: {
      type: String,
      default: '127.0.0.1'
    },
    details: {
      type: String,
      default: ''
    },
    statusCode: {
      type: Number,
      default: 200
    }
  },
  {
    timestamps: true
  }
);

auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
