import mongoose, { Document, Schema} from "mongoose";

export interface IAuth extends Document {
    userId: mongoose.Schema.Types.ObjectId;
    otpCode: number | null;
    expiresAt: Date | null;
    resendCount: number;
}

const authSchema = new Schema<IAuth>({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    otpCode: { type: Number, require: true, default: null },
    expiresAt: { type: Date, require: true },
    resendCount: { type: Number, default: 3 },
}, {
    timestamps: true,
    versionKey: false,
})


const Auth = mongoose.model<IAuth>('Auth', authSchema);

export default Auth;
