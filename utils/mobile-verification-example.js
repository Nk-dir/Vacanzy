// Example: Enhanced Authentication System
// Add this to your user registration flow

const mobileverification = {
    // Add mobile field to user model
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    mobileVerified: {
        type: Boolean,
        default: false
    },
    otp: String,
    otpExpiry: Date
};

// OTP Generation Function
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via SMS (using MSG91 or similar)
const sendOTP = async (mobile, otp) => {
    // API call to SMS service
    const response = await smsService.send({
        mobile: mobile,
        message: `Your Vacanzy verification code is: ${otp}. Valid for 10 minutes.`
    });
    return response;
};

// Verification Flow
const verifyMobile = async (mobile, userOTP) => {
    const user = await User.findOne({ mobile: mobile });
    
    if (user.otp === userOTP && new Date() < user.otpExpiry) {
        user.mobileVerified = true;
        user.otp = undefined;
        user.otpExpiry = undefined;
        await user.save();
        return { success: true };
    }
    
    return { success: false, message: "Invalid or expired OTP" };
};