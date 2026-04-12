const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.CLOUDINARY_UPLOAD_PRESET;

export const uploadProfilePictureToCloudinary = async (image, userId) => {
  if (!image) {
    console.error('No image provided for upload.');
    return null;
  }

  try {
    const formData = new FormData();

    formData.append('file', {
      uri: image?.path,
      type: image?.mime || 'image/jpeg',
      name: image?.fileName || `profile_${Date.now()}.jpg`,
    });

    formData.append('upload_preset', UPLOAD_PRESET);

    // 👇 dynamic folder per user
    formData.append('folder', `IntelliBridge/users/${userId}/profile`);

    // 👇 optional: force overwrite same file
    // formData.append('public_id', 'profile');
    // formData.append('public_id', `IntelliBridge/users/${userId}/profile`);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      },
    );

    const uploadProfilePictureResponse = await res?.json();
    console.log('Cloudinary upload response:', uploadProfilePictureResponse);

    return uploadProfilePictureResponse;
  } catch (error) {
    console.log('Upload error:', error?.response);
    throw error;
  }
};
