import { useEffect, useState } from "react";
import { Button, Label, TextInput, Card } from "flowbite-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPassword } from "../../api/authService";
import { toast } from "react-toastify";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

const schema = z
  .object({
    password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
    confirmPassword: z.string().min(6, "Xác nhận tối thiểu 6 ký tự"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Mật khẩu xác nhận không khớp",
  });

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const token = searchParams.get("token") || "";
  const [submitError, setSubmitError] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onBlur",
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!email || !token) {
      toast.error("Thiếu token hoặc email.");
    }
  }, [email, token]);

  const onSubmit = async (data) => {
    if (!email || !token) {
      setSubmitError("Thiếu token hoặc email.");
      return;
    }
    try {
      await resetPassword(email, token, data.password);
      toast.success("Đặt lại mật khẩu thành công. Chuyển hướng...");
      setSubmitError(null);
      reset();
      setTimeout(() => navigate("/login"), 1500);
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
                    Đặt lại mật khẩu
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Tạo mật khẩu mới cho tài khoản{" "}
                    <span className="font-semibold">
                      {email || "email không xác định"}
                    </span>
                    .
                  </p>
                </div>
                <div>
                  <Label
                    htmlFor="password"
                    value="Mật khẩu mới"
                    className="sr-only"
                  />
                  <TextInput
                    id="password"
                    type="password"
                    placeholder="Mật khẩu mới"
                    {...register("password")}
                    color={errors.password ? "failure" : "gray"}
                    sizing="lg"
                    className="w-full"
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
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
                    sizing="lg"
                    className="w-full"
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="bg-sky-600 w-full hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                  disabled={!isValid || isSubmitting}
                >
                  Cập nhật mật khẩu
                </Button>
                {submitError && (
                  <p className="text-red-600 text-sm mt-2">{submitError}</p>
                )}
                <div className="text-center">
                  <p className="text-gray-600 mb-3">Quay lại đăng nhập?</p>
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

export default ResetPasswordPage;
