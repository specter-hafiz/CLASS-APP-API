const getPublicIdFromUrl = (url) => {
  try {
    const fileName = url.split("/").pop(); // "vkd04tqsfeetugo2zrkd.jpg"
    return fileName.split(".")[0]; // "vkd04tqsfeetugo2zrkd"
  } catch (e) {
    console.error("Failed to extract public_id from URL", e);
    return null;
  }
};

module.exports = getPublicIdFromUrl;
