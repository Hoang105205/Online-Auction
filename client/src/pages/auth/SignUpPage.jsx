import { useState, useRef, useEffect } from "react";
import { Button, Label, TextInput, Card } from "flowbite-react";
import { FaFacebook, FaLinkedin, FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import { signup } from "../../api/authService";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import ReCAPTCHA from "react-google-recaptcha";

const SignUpPage = () => {
  const [submitError, setSubmitError] = useState(null);
  const navigate = useNavigate();

  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const recaptchaRef = useRef(null);
  const [recaptchaSize, setRecaptchaSize] = useState("normal");

  useEffect(() => {
    const handleResize = () => {
      // Kiểm tra chiều rộng màn hình
      // 640px là điểm gãy (breakpoint) 'sm' mặc định của Tailwind
      if (window.innerWidth < 640) {
        setRecaptchaSize("compact");
      } else {
        setRecaptchaSize("normal");
      }
    };

    // Gọi 1 lần ngay khi vào trang để set đúng size ban đầu
    handleResize();

    // Lắng nghe sự kiện resize cửa sổ
    window.addEventListener("resize", handleResize);

    // Cleanup khi thoát trang
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onCaptchaChange = (token) => {
    setRecaptchaToken(token); // Lưu token lại
  };

  const signUpSchema = z
    .object({
      fullName: z.string().min(3, "Họ và tên tối thiểu 3 ký tự"),
      email: z.email("Email không hợp lệ"),
      address: z.string().min(5, "Địa chỉ tối thiểu 5 ký tự"),
      password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
      confirmPassword: z.string().min(6, "Xác nhận mật khẩu tối thiểu 6 ký tự"),
    })
    .refine((data) => data.password === data.confirmPassword, {
      path: ["confirmPassword"],
      message: "Mật khẩu xác nhận không khớp",
    });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm({
    resolver: zodResolver(signUpSchema),
    mode: "onBlur",
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data) => {
    if (!recaptchaToken) {
      setSubmitError("Vui lòng xác nhận reCAPTCHA.");
      return;
    }

    try {
      const result = await signup({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        address: data.address,
        recaptchaToken: recaptchaToken,
      });
      setSubmitError(null);
      navigate("/login");
    } catch (error) {
      recaptchaRef.current.reset();
      setRecaptchaToken(null);
      setSubmitError(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left side - Image with overlayed branding (hidden on mobile) */}
          <div className="relative hidden md:block bg-white">
            {/* Image */}
            <img
              src="/auth-images/auctify.png"
              alt="Auctify"
              className="absolute inset-0 h-full w-full object-contain p-6"
            />
            {/* Optional subtle overlay for better text contrast */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/40 to-transparent" />
            {/* Overlay title horizontally centered near top */}
            <div className="absolute inset-x-0 top-6 flex justify-center px-6">
              <h1 className="text-6xl md:text-7xl font-extrabold text-sky-500 drop-shadow-md text-center">
                Auctify
              </h1>
            </div>
            {/* Keep a fixed height so the column is visually balanced */}
            <div
              className="invisible select-none h-[520px]"
              aria-hidden="true"
            />
          </div>

          {/* Right side - Sign Up form */}
          <div className="bg-white p-6 md:p-12 flex flex-col justify-center">
            {/* Mobile title */}
            <h1 className="md:hidden text-4xl font-extrabold text-sky-500 drop-shadow-md text-center mb-6">
              Auctify
            </h1>
            <div className="mx-auto w-full max-w-md">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Full Name Input */}
                <div>
                  <Label
                    htmlFor="fullName"
                    value="Họ và Tên"
                    className="sr-only"
                  />
                  <TextInput
                    id="fullName"
                    type="text"
                    placeholder="Họ và Tên"
                    {...register("fullName")}
                    color={errors.fullName ? "failure" : "gray"}
                    className="w-full"
                    sizing="lg"
                  />
                  {errors.fullName && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.fullName.message}
                    </p>
                  )}
                </div>

                {/* Email Input */}
                <div>
                  <Label htmlFor="email" value="Email" className="sr-only" />
                  <TextInput
                    id="email"
                    type="email"
                    placeholder="Email"
                    {...register("email")}
                    color={errors.email ? "failure" : "gray"}
                    className="w-full"
                    sizing="lg"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Address Input */}
                <div>
                  <Label
                    htmlFor="address"
                    value="Địa chỉ"
                    className="sr-only"
                  />
                  <TextInput
                    id="address"
                    type="text"
                    placeholder="Địa chỉ"
                    {...register("address")}
                    color={errors.address ? "failure" : "gray"}
                    className="w-full"
                    sizing="lg"
                  />
                  {errors.address && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                {/* Password Input */}
                <div>
                  <Label
                    htmlFor="password"
                    value="Mật khẩu"
                    className="sr-only"
                  />
                  <TextInput
                    id="password"
                    type="password"
                    placeholder="Mật khẩu"
                    {...register("password")}
                    color={errors.password ? "failure" : "gray"}
                    className="w-full"
                    sizing="lg"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password Input */}
                <div>
                  <Label
                    htmlFor="confirmPassword"
                    value="Xác nhận mật khẩu"
                    className="sr-only"
                  />
                  <TextInput
                    id="confirmPassword"
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    {...register("confirmPassword")}
                    color={errors.confirmPassword ? "failure" : "gray"}
                    className="w-full"
                    sizing="lg"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* ReCAPTCHA Placeholder */}
                <div className="flex justify-center py-2">
                  <div className="recaptcha-wrapper">
                    <ReCAPTCHA
                      key={recaptchaSize}
                      ref={recaptchaRef}
                      sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
                      onChange={onCaptchaChange}
                      size={recaptchaSize}
                    />
                  </div>
                </div>

                {/* Sign Up Button */}
                <Button
                  type="submit"
                  className="bg-sky-600 w-full hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                  disabled={!isValid || isSubmitting}
                >
                  Đăng ký
                </Button>

                {submitError && (
                  <p className="text-red-600 text-sm mt-2">{submitError}</p>
                )}

                {/* Social Sign Up Buttons */}
                <div className="flex gap-3 justify-center">
                  {/* <button
                  type="button"
                  className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  aria-label="Sign up with Facebook"
                >
                  <FaFacebook className="w-6 h-6 text-blue-600" />
                </button>
                <button
                  type="button"
                  className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  aria-label="Sign up with LinkedIn"
                >
                  <FaLinkedin className="w-6 h-6 text-blue-700" />
                </button> */}
                  <button
                    type="button"
                    className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                    aria-label="Sign up with Google"
                    onClick={() =>
                      (window.location.href = `${
                        import.meta.env.VITE_API_URL
                      }/api/auth/google`)
                    }
                  >
                    <FaGoogle className="w-6 h-6 text-red-600" />
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <span className="text-gray-500 text-sm">Or</span>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-gray-600 mb-3">Đã có tài khoản?</p>
                  <Link
                    to="/login"
                    className="block w-full md:w-fit md:mx-auto"
                  >
                    <Button
                      color="gray"
                      size="lg"
                      className="w-full md:w-fit px-12"
                    >
                      Đăng nhập
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SignUpPage;
