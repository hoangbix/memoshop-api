const cloudinary = require('cloudinary');

cloudinary.config({
  cloud_name: 'dparfrfjz',
  api_key: '968877992873138',
  api_secret: 'Msfp78iR0Z9UukDcevX7JgFEn4w',
});

const cloudinaryUploadImg = async (fileToUploads) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(fileToUploads, (result) => {
      resolve(
        {
          url: result.secure_url,
        },
        {
          resource_type: 'auto',
        }
      );
    });
  });
};

module.exports = cloudinaryUploadImg;
