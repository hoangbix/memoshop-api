const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'dparfrfjz',
  api_key: '968877992873138',
  api_secret: 'Msfp78iR0Z9UukDcevX7JgFEn4w',
});

const cloudinaryUploadImg = async (fileToUploads) => {
  return new Promise((resolve) => {
    cloudinary.uploader.upload(fileToUploads, (result) => {
      resolve(
        {
          url: result.secure_url,
          asset_id: result.asset_id,
          public_id: result.public_id,
        },
        {
          resource_type: 'auto',
        }
      );
    });
  });
};
const cloudinaryDeleteImg = async (fileToDelete) => {
  return new Promise((resolve) => {
    cloudinary.uploader.destroy(fileToDelete, (result) => {
      resolve(
        {
          url: result.secure_url,
          asset_id: result.asset_id,
          public_id: result.public_id,
        },
        {
          resource_type: 'auto',
        }
      );
    });
  });
};

module.exports = {
  cloudinaryUploadImg,
  cloudinaryDeleteImg,
};
