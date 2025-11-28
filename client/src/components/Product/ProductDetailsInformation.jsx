import React, { useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { updateDescription } from "../../api/productService";

const ProductDetailsInformation = ({
  productId,
  description,
  isOwner,
  onSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [saving, setSaving] = useState(false);

  const editorRef = useRef(null);

  const handleSave = async () => {
    if (!editorContent.trim()) {
      alert("Vui lòng nhập nội dung!");
      return;
    }

    try {
      setSaving(true);

      // Tạo timestamp
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const timestamp = `${day}/${month}/${year} ${hours}:${minutes}`;

      const updatedDescription = `
      ${description}
      <br/>
      <p><strong>✏️ ${timestamp}</strong></p>
      ${editorContent}
    `;

      const response = await updateDescription(productId, updatedDescription);

      console.log("Update description response:", response);

      onSave(response.product.detail.description);
      setEditorContent("");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating description:", error);
      alert("Cập nhật mô tả thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditorContent("");
    setIsEditing(false);
  };

  return (
    <div className="py-6">
      <div className="overflow-y-auto max-h-[100vh] mb-6">
        <div
          className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>

      {isOwner && (
        <div className="mt-8 border-t pt-6">
          {isEditing ? (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Thêm thông tin mới:
              </h3>
              <Editor
                apiKey={import.meta.env.VITE_TINYMCE_API_KEY}
                onInit={(evt, editor) => (editorRef.current = editor)}
                value={editorContent}
                init={{
                  height: 200,
                  menubar: false,
                  plugins: [
                    "advlist",
                    "autolink",
                    "lists",
                    "link",
                    "image",
                    "charmap",
                    "preview",
                    "anchor",
                    "searchreplace",
                    "visualblocks",
                    "code",
                    "fullscreen",
                    "insertdatetime",
                    "media",
                    "table",
                    "code",
                    "help",
                    "wordcount",
                  ],
                  toolbar:
                    "undo redo | blocks | " +
                    "bold italic forecolor | alignleft aligncenter " +
                    "alignright alignjustify | bullist numlist outdent indent | " +
                    "removeformat | help",
                  content_style:
                    "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                }}
                onEditorChange={(content) => setEditorContent(content)}
              />
              <div className="flex gap-4 mt-4">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                >
                  Lưu
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Thêm thông tin mới
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductDetailsInformation;
