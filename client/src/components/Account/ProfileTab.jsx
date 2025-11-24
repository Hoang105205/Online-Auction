import { useState, useEffect } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { getUserBasicProfile } from "../../api/userService";

import { Spinner } from "flowbite-react";

const ProfileTab = () => {
  // Zod schema for validation
  const ProfileSchema = z
    .object({
      fullName: z.string().min(2, "Vui lòng nhập họ và tên hợp lệ"),
      email: z.email("Email không hợp lệ"),
      address: z.string().min(5, "Địa chỉ chưa hợp lệ"),
      currentPassword: z.string().optional().default(""),
      newPassword: z.string().optional().default(""),
      confirmPassword: z.string().optional().default(""),
    })
    .superRefine((data, ctx) => {
      const anyChanged =
        !!data.currentPassword || !!data.newPassword || !!data.confirmPassword;
      if (!anyChanged) return; // No password change

      if (!data.currentPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["currentPassword"],
          message: "Vui lòng nhập mật khẩu hiện tại",
        });
      }
      if (!data.newPassword || data.newPassword.length < 6) {
        ctx.addIssue({
          code: "too_small",
          minimum: 6,
          type: "string",
          inclusive: true,
          path: ["newPassword"],
          message: "Mật khẩu mới tối thiểu 6 ký tự",
        });
      }
      if (data.confirmPassword !== data.newPassword) {
        ctx.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Mật khẩu xác nhận không khớp",
        });
      }
    });

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const axiosPrivate = useAxiosPrivate();

  const [userData, setUserData] = useState({
    fullName: "",
    email: "",
    address: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const data = await getUserBasicProfile(axiosPrivate);

        if (isMounted) {
          const formValues = {
            fullName: data.fullName || "",
            email: data.email || "",
            address: data.address || "",
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
          };

          setUserData({
            fullName: data.fullName || "",
            email: data.email || "",
            address: data.address || "",
          });

          reset(formValues);
        }
      } catch (error) {
        console.error("Lỗi tải thông tin:", error);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfile();

    return () => {
      isMounted = false;
    };
  }, [axiosPrivate, reset]);

  const onSubmitInfo = (data) => {
    const payload = {
      fullName: data.fullName,
      email: data.email,
      address: data.address,
    };
    console.log("Update basic info:", payload);
    setUserData(payload);
    // Keep password fields as current values
    const { currentPassword, newPassword, confirmPassword } = getValues();
    reset({ ...payload, currentPassword, newPassword, confirmPassword });
    setIsEditingInfo(false);
  };

  const onSubmitPassword = (data) => {
    const payload = {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    };
    console.log("Update password:", payload);
    // Clear password fields after successful update
    const { fullName, email, address } = getValues();
    reset({
      fullName,
      email,
      address,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditingPassword(false);
  };

  const handleCancelInfo = () => {
    const { currentPassword, newPassword, confirmPassword } = getValues();
    reset({ ...userData, currentPassword, newPassword, confirmPassword });
    setIsEditingInfo(false);
  };

  const handleCancelPassword = () => {
    const { fullName, email, address } = getValues();
    reset({
      fullName,
      email,
      address,
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsEditingPassword(false);
  };

  return (
    <div className="relative p-6 md:p-8">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm">
          <Spinner size="lg" color="info" />
          <p className="mt-3 text-sm text-gray-700">Đang tải hồ sơ...</p>
        </div>
      )}
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditingInfo ? "Chỉnh sửa hồ sơ" : "Hồ sơ của bạn"}
        </h2>
      </div>

      {/* FORM: Basic Info */}
      <form onSubmit={handleSubmit(onSubmitInfo)} className="space-y-6">
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label
              htmlFor="fullName"
              value="Họ và Tên"
              className="mb-2 block"
            />
            <TextInput
              id="fullName"
              type="text"
              placeholder="Nhập họ và tên đầy đủ"
              disabled={isLoading || !isEditingInfo}
              sizing="lg"
              className="w-full"
              {...register("fullName")}
              color={errors.fullName ? "failure" : undefined}
            />
            {errors.fullName?.message && (
              <span className="text-red-600">{errors.fullName.message}</span>
            )}
          </div>
          <div>
            <Label htmlFor="email" value="Email" className="mb-2 block" />
            <TextInput
              id="email"
              type="email"
              placeholder="name@example.com"
              disabled={isLoading || !isEditingInfo}
              sizing="lg"
              className="w-full"
              {...register("email")}
              color={errors.email ? "failure" : undefined}
            />
            {errors.email?.message && (
              <span className="text-red-600">{errors.email.message}</span>
            )}
          </div>
        </div>

        {/* Address */}
        <div>
          <Label htmlFor="address" value="Address" className="mb-2 block" />
          <TextInput
            id="address"
            type="text"
            placeholder="Địa chỉ liên hệ"
            disabled={isLoading || !isEditingInfo}
            sizing="lg"
            className="w-full"
            {...register("address")}
            color={errors.address ? "failure" : undefined}
          />
          {errors.address?.message && (
            <span className="text-red-600">{errors.address.message}</span>
          )}
        </div>

        {/* Actions: Basic Info */}
        <div className="flex justify-end gap-4 pt-2">
          {isEditingInfo ? (
            <>
              <Button
                type="button"
                color="gray"
                size="lg"
                onClick={handleCancelInfo}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700"
                size="lg"
                disabled={isLoading || !isValid}
              >
                Cập nhật thông tin
              </Button>
            </>
          ) : (
            <Button
              type="button"
              className="bg-sky-600 hover:bg-sky-700"
              size="lg"
              onClick={() => setIsEditingInfo(true)}
              disabled={isLoading}
            >
              Chỉnh sửa thông tin
            </Button>
          )}
        </div>
      </form>

      {/* Divider */}
      <hr className="my-8 border-gray-200" />

      {/* FORM: Change Password */}
      <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-6">
        {/* Password Changes Section */}
        <div className="pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Thay đổi mật khẩu
          </h3>
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="currentPassword"
                value="Current Password"
                className="mb-2 block"
              />
              <TextInput
                id="currentPassword"
                type="password"
                placeholder="Current Password"
                disabled={isLoading || !isEditingPassword}
                sizing="lg"
                className="w-full"
                {...register("currentPassword")}
                color={errors.currentPassword ? "failure" : undefined}
              />
              {errors.currentPassword?.message && (
                <span className="text-red-600">
                  {errors.currentPassword.message}
                </span>
              )}
            </div>
            <div>
              <Label
                htmlFor="newPassword"
                value="New Password"
                className="mb-2 block"
              />
              <TextInput
                id="newPassword"
                type="password"
                placeholder="New Password (min 8 ký tự)"
                disabled={isLoading || !isEditingPassword}
                sizing="lg"
                className="w-full"
                {...register("newPassword")}
                color={errors.newPassword ? "failure" : undefined}
              />
              {errors.newPassword?.message && (
                <span className="text-red-600">
                  {errors.newPassword.message}
                </span>
              )}
            </div>
            <div>
              <Label
                htmlFor="confirmPassword"
                value="Confirm New Password"
                className="mb-2 block"
              />
              <TextInput
                id="confirmPassword"
                type="password"
                placeholder="Confirm New Password"
                disabled={isLoading || !isEditingPassword}
                sizing="lg"
                className="w-full"
                {...register("confirmPassword")}
                color={errors.confirmPassword ? "failure" : undefined}
              />
              {errors.confirmPassword?.message && (
                <span className="text-red-600">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>
        </div>
        {/* Actions: Password */}
        <div className="flex justify-end gap-4 pt-2">
          {isEditingPassword ? (
            <>
              <Button
                type="button"
                color="gray"
                size="lg"
                onClick={handleCancelPassword}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="bg-red-500 hover:bg-red-600"
                size="lg"
                disabled={isLoading || !isValid}
              >
                Cập nhật mật khẩu
              </Button>
            </>
          ) : (
            <Button
              type="button"
              className="bg-red-500 hover:bg-red-600"
              size="lg"
              onClick={() => setIsEditingPassword(true)}
              disabled={isLoading}
            >
              Thay đổi mật khẩu
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;
