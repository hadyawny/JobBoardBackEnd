import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { catchError } from "../../middleware/catchError.js";
import { userModel } from "../../../database/models/user.model.js";
import { AppError } from "../../utils/appError.js";
import transporter from '../../utils/email.js'
import otpGenerator from "otp-generator";


const signup = catchError(async (req, res, next) => {
  let user = new userModel(req.body);
  await user.save();

  let token = jwt.sign(
    { userId: user._id, role: user.role , email: user.email},
    process.env.JWT_KEY
  );

   transporter.sendMail({
		from: process.env.EMAIL,
		to: user.email,
		subject: 'Email verification',
		text: 'Please validate you email address',
		html: `<a href="${req.protocol}://${req.headers.host}/api/v1/auth/validate/${token}">Click here to confirm your email address</a>`,
	})
  res.json({ message: "success", token , user_id: user._id , user_role: user.role});
});

const signin = catchError(async (req, res, next) => {
  let user = await userModel.findOne({ email: req.body.email });
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    let token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_KEY
    );
    return res.json({ message: "success", token ,user_id: user._id , user_role: user.role});
  }

  next(new AppError("incorrect email or password", 401));
});

const changePassword = catchError(async (req, res, next) => {
  let user = await userModel.findById(req.user._id);
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    let token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_KEY
    );
    await userModel.findByIdAndUpdate(req.user._id, {
      password: req.body.newPassword,
      passwordChangedAt: Date.now(),
    });
    return res.json({ message: "success", token });
  }

  next(new AppError("incorrect email or password", 401));
});

const protectedRoutes = catchError(async (req, res, next) => {
  let { token } = req.headers;
  if (!token) return next(new AppError("token is not provided", 401));

  let decoded = jwt.verify(token, process.env.JWT_KEY);
  let user = await userModel.findById(decoded.userId);
  if (!user) return next(new AppError("user is not found", 401));

  if (user.passwordChangedAt) {
    let time = parseInt(user.passwordChangedAt.getTime() / 1000);
    if (time > decoded.iat)
      return next(new AppError("invalid token log in again", 401));
  }

  req.user = user;

  next();
});

const allowedTo = (...roles) => {
  return catchError(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError("you are not authorized", 401));

    next();
  });
};

const validateEmail = catchError(async (req, res) => {
	  const { token } = req.params
		const decoded = jwt.verify(token,process.env.JWT_KEY)
		const { email } = decoded
		await userModel.findOneAndUpdate({ email }, { confirmEmail: true })
		res.json({ message: 'Email verified successfully' })
	
})


const forgotPassword = catchError(async (req, res, next) => {
  let user = await userModel.findOne({email:req.body.email});
  console.log(user);
  if (user) {
    user.otp = otpGenerator.generate(6, {upperCaseAlphabets: false,specialChars: false,});
    user.save();
  }

  transporter.sendMail({
		from: process.env.EMAIL,
		to: user.email,
		subject: 'OTP For Changing Password',
    text: `Your OTP for changing the password is: ${user.otp}`,
    html: `<p>Your OTP for changing the password is: <strong>${user.otp}</strong></p>`,
 	})


  !user && res.status(404).json({ message: "user not found" });
  user && res.json({ message: "success" });
});

const resetPassword = catchError(async (req, res, next) => {

  let user = await userModel.findOne({email: req.body.email,otp: req.body.otp});
  if (user) {
    user.password = req.body.newPassword
    user.otp = undefined
    user.save();
  }
  !user && res.status(404).json({ message: "user not found" });
  user && res.json({ message: "successfully changed password ", otp: user.otp });
});



export { signup, signin, changePassword, protectedRoutes, allowedTo , validateEmail ,forgotPassword,resetPassword};
