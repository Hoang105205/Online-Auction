exports.uploadImage = async (req, res) => {
  try {
    const publicId = req.file.filename; // Cloudinary publicId
    const imageUrl = req.file.path; // full URL (nếu cần)

    return res.json({
      publicId,
      url: imageUrl,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
