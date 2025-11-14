import { useState } from "react";
import { Button, Label, TextInput } from "flowbite-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const ProfileTab = () => {
  // Default data for demo
  const initialProfile = {
    fullName: "Nguyễn Văn A",
    email: "user@example.com",
    address: "Kingston, 5230, United State",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  };

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
      if (!data.newPassword || data.newPassword.length < 8) {
        ctx.addIssue({
          code: "too_small",
          minimum: 8,
          type: "string",
          inclusive: true,
          path: ["newPassword"],
          message: "Mật khẩu mới tối thiểu 8 ký tự",
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
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(ProfileSchema),
    defaultValues: initialProfile,
    mode: "onChange",
  });

  const [isEditing, setIsEditing] = useState(false);

  const onSubmit = (data) => {
    // Handle save logic here (call API)
    console.log("Saving profile:", data);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original data
    reset(initialProfile);
    setIsEditing(false);
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">{isEditing ? "Chỉnh sửa hồ sơ" : "Hồ sơ của bạn"}</h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
              disabled={!isEditing}
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
              disabled={!isEditing}
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
            disabled={!isEditing}
            sizing="lg"
            className="w-full"
            {...register("address")}
            color={errors.address ? "failure" : undefined}
          />
          {errors.address?.message && (
            <span className="text-red-600">{errors.address.message}</span>
          )}
        </div>

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
                disabled={!isEditing}
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
                disabled={!isEditing}
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
                disabled={!isEditing}
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          {isEditing ? (
            <>
              <Button
                type="button"
                color="gray"
                size="lg"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-red-500 hover:bg-red-600"
                size="lg"
                disabled={!isValid}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              type="button"
              className="bg-sky-600 hover:bg-sky-700"
              size="lg"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;
