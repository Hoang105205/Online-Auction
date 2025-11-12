import { useState } from "react";
import { Button, Label, TextInput, Card } from "flowbite-react";
import { FaFacebook, FaLinkedin, FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    password: "",
    confirmPassword: "",
  });
  const passwordsMatch =
    formData.password.length > 0 &&
    formData.confirmPassword.length > 0 &&
    formData.password === formData.confirmPassword;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simple front-end validation before calling API
    if (!passwordsMatch) {
      // Early return if passwords don't match
      return;
    }
    // Handle signup logic here
    console.log("Sign Up:", formData);
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
          <div className="bg-white p-8 md:p-12 flex flex-col justify-center">
            {/* Mobile title */}
            <h1 className="md:hidden text-4xl font-extrabold text-sky-500 drop-shadow-md text-center mb-6">
              Auctify
            </h1>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Input */}
              <div>
                <Label
                  htmlFor="fullName"
                  value="Họ và Tên"
                  className="sr-only"
                />
                <TextInput
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="Họ và Tên"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full"
                  sizing="lg"
                />
              </div>

              {/* Email Input */}
              <div>
                <Label htmlFor="email" value="Email" className="sr-only" />
                <TextInput
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full"
                  sizing="lg"
                />
              </div>

              {/* Address Input */}
              <div>
                <Label htmlFor="address" value="Địa chỉ" className="sr-only" />
                <TextInput
                  id="address"
                  name="address"
                  type="text"
                  placeholder="Địa chỉ"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full"
                  sizing="lg"
                />
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
                  name="password"
                  type="password"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full"
                  sizing="lg"
                />
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
                  name="confirmPassword"
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full"
                  color={
                    formData.confirmPassword
                      ? passwordsMatch
                        ? "success"
                        : "failure"
                      : undefined
                  }
                  sizing="lg"
                />

                {/* Reserve space to avoid layout shift; toggle visibility only */}
                <div className="mt-1 h-5">
                  <p
                    className={`text-sm ${
                      formData.confirmPassword && !passwordsMatch
                        ? "text-red-600 visible"
                        : "invisible"
                    }`}
                  >
                    Mật khẩu xác nhận không khớp
                  </p>
                </div>
              </div>

              {/* ReCAPTCHA Placeholder */}
              <div className="flex justify-center py-2">
                <div className="w-full max-w-sm h-20 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">
                    ReCAPTCHA sẽ xuất hiện ở đây
                  </span>
                </div>
              </div>

              {/* Sign Up Button */}
              <Button
                type="submit"
                className="bg-sky-600 w-full hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                size="lg"
                disabled={
                  !formData.fullName ||
                  !formData.email ||
                  !formData.address ||
                  !formData.password ||
                  !formData.confirmPassword ||
                  !passwordsMatch
                }
              >
                Đăng ký
              </Button>

              {/* Social Sign Up Buttons */}
              <div className="flex gap-3 justify-center">
                <button
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
                </button>
                <button
                  type="button"
                  className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  aria-label="Sign up with Google"
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
                <Link to="/login" className="block w-full md:w-fit md:mx-auto">
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
      </Card>
    </div>
  );
};

export default SignUpPage;
