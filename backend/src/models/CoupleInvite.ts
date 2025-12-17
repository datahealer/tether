// import mongoose, { Schema, Document } from 'mongoose';

// export interface ICoupleInvite extends Document {
//   inviterId: mongoose.Types.ObjectId;
//   inviteCode: string;
//   inviteLink: string;
//   status: 'pending' | 'accepted' | 'expired';
//   expiresAt: Date;
//   acceptedById?: mongoose.Types.ObjectId;
//   acceptedAt?: Date;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const CoupleInviteSchema: Schema = new Schema(
//   {
//     inviterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
//     inviteCode: { type: String, required: true, unique: true },
//     inviteLink: { type: String, required: true },
//     status: { 
//       type: String, 
//       enum: ['pending', 'accepted', 'expired'], 
//       default: 'pending' 
//     },
//     expiresAt: { type: Date, required: true },
//     acceptedById: { type: Schema.Types.ObjectId, ref: 'User' },
//     acceptedAt: { type: Date },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Indexes
// CoupleInviteSchema.index({ inviteCode: 1 });
// CoupleInviteSchema.index({ inviterId: 1, status: 1 });
// CoupleInviteSchema.index({ expiresAt: 1 });

// export default mongoose.model<ICoupleInvite>('CoupleInvite', CoupleInviteSchema);
import mongoose, { Schema, Document } from 'mongoose';

export interface ICoupleInvite extends Document {
  inviterId: mongoose.Types.ObjectId;
  inviteCode: string;
  status: 'pending' | 'accepted' | 'expired';
  expiresAt: Date;
  acceptedById?: mongoose.Types.ObjectId;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CoupleInviteSchema: Schema = new Schema(
  {
    inviterId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    inviteCode: { type: String, required: true, unique: true },
    status: { 
      type: String, 
      enum: ['pending', 'accepted', 'expired'], 
      default: 'pending' 
    },
    expiresAt: { type: Date, required: true, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // 7 days from now
    acceptedById: { type: Schema.Types.ObjectId, ref: 'User' },
    acceptedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Indexes
CoupleInviteSchema.index({ inviteCode: 1 }, { unique: true });
CoupleInviteSchema.index({ inviterId: 1, status: 1 });
CoupleInviteSchema.index({ expiresAt: 1 });

export default mongoose.model<ICoupleInvite>('CoupleInvite', CoupleInviteSchema);