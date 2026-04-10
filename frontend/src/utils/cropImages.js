// Default crop images — farmers never need to upload their own photo
const CROP_IMAGES = {
  wheat: '/images/wheat.png',
  rice: '/images/rice.png',
  corn: '/images/corn.png',
  cotton: '/images/cotton.png',
  soybean: '/images/soybean.png',
  potato: '/images/potato.png',
};

/**
 * Returns the default image path for a crop name.
 * Falls back to wheat if the crop isn't recognized.
 */
export function getCropImage(cropName) {
  if (!cropName) return CROP_IMAGES.wheat;
  const key = cropName.toLowerCase().trim();
  return CROP_IMAGES[key] || CROP_IMAGES.wheat;
}

export default CROP_IMAGES;
