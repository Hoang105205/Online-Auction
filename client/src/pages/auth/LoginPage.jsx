import { useState } from "react";
import { Button, Label, TextInput, Card } from "flowbite-react";
import { FaFacebook, FaLinkedin, FaGoogle } from "react-icons/fa";
import { Link } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login:", { email, password });
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

          {/* Right side - Login form */}
          <div className="bg-white p-8 md:p-12 flex flex-col justify-center">
            {/* Mobile title */}
            <h1 className="md:hidden text-4xl font-extrabold text-sky-500 drop-shadow-md text-center mb-6">
              Auctify
            </h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <Label htmlFor="email" value="Email" className="sr-only" />
                <TextInput
                  id="email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full"
                  sizing="lg"
                />
              </div>

              {/* Password Input */}
              <div>
                <Label
                  htmlFor="password"
                  value="Password"
                  className="sr-only"
                />
                <TextInput
                  id="password"
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                  sizing="lg"
                />
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="bg-sky-600 w-full hover:bg-sky-700"
                size="lg"
              >
                Đăng nhập
              </Button>

              {/* Social Login Buttons */}
              <div className="flex gap-3 justify-center">
                <button
                  type="button"
                  className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  aria-label="Login with Facebook"
                >
                  <FaFacebook className="w-6 h-6 text-blue-600" />
                </button>
                <button
                  type="button"
                  className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  aria-label="Login with LinkedIn"
                >
                  <FaLinkedin className="w-6 h-6 text-blue-700" />
                </button>
                <button
                  type="button"
                  className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                  aria-label="Login with Google"
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

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-gray-600 mb-3">Mới? Tạo tài khoản</p>
                <Link to="/signup" className="block w-full md:w-fit md:mx-auto">
                  <Button
                    color="gray"
                    size="lg"
                    className="w-full md:w-fit px-12"
                  >
                    Đăng ký
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

export default LoginPage;
