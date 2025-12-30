import { useEffect, useState } from "react";
import { Button, Label, TextInput, Card } from "flowbite-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { verifyForgotPasswordOtp } from "../../api/authService";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

const schema = z.object({
  otp: z
    .string()
    .min(6, "OTP tối thiểu 6 ký tự")
    .max(6, "OTP gồm 6 ký tự")
    .regex(/^\d{6}$/i, "OTP chỉ gồm số"),
});

const VerifyForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (!email) {
      toast.error("Thiếu email để xác thực OTP.");
    }
  }, [email]);

  const onSubmit = async (data) => {
    if (!email) {
      setSubmitError("Thiếu email.");
      return;
    }
    try {
      const result = await verifyForgotPasswordOtp(email, data.otp);
      const resetToken = result.resetToken;
      toast.success(result.message || "Xác thực OTP thành công");
      setSubmitError(null);
      reset();
      if (resetToken) {
        navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`);
      } else {
        toast.error("Không nhận được token đặt lại mật khẩu.");
      }
    } catch (error) {
      setSubmitError(error.response?.data?.message || "Có lỗi xảy ra");
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-5xl overflow-hidden shadow-xl">
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left branding */}
          <div className="relative hidden md:block bg-white">
            <img
              src="/auth-images/auctify.png"
              alt="Auctify"
              className="absolute inset-0 h-full w-full object-contain p-6"
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/40 to-transparent" />
            <div className="absolute inset-x-0 top-6 flex justify-center px-6">
              <h1 className="text-6xl md:text-7xl font-extrabold text-sky-500 drop-shadow-md text-center">
                Auctify
              </h1>
            </div>
            <div
              className="invisible select-none h-[520px]"
              aria-hidden="true"
            />
          </div>
          {/* Right form */}
          <div className="bg-white p-6 md:p-12 flex flex-col justify-center">
            <h1 className="md:hidden text-4xl font-extrabold text-sky-500 drop-shadow-md text-center mb-6">
              Auctify
            </h1>
            <div className="mx-auto w-full max-w-md">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold text-sky-600">
                    Xác thực OTP
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Nhập mã OTP đã gửi đến{" "}
                    <span className="font-semibold">
                      {email || "email không xác định"}
                    </span>
                    .
                  </p>
                </div>
                <div>
                  <Label htmlFor="otp" value="OTP" className="sr-only" />
                  <TextInput
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="Nhập OTP 6 số"
                    {...register("otp")}
                    color={errors.otp ? "failure" : "gray"}
                    sizing="lg"
                    className="w-full"
                  />
                  {errors.otp && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.otp.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="bg-sky-600 w-full hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                  disabled={!isValid || isSubmitting}
                >
                  Xác thực
                </Button>
                {submitError && (
                  <p className="text-red-600 text-sm mt-2">{submitError}</p>
                )}
                <div className="text-center">
                  <p className="text-gray-600 mb-3">Sai email?</p>
                  <Link
                    to="/forgot-password"
                    className="block w-full md:w-fit md:mx-auto"
                  >
                    <Button
                      color="gray"
                      size="lg"
                      className="w-full md:w-fit px-12"
                    >
                      Nhập lại email
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

export default VerifyForgotPasswordPage;
