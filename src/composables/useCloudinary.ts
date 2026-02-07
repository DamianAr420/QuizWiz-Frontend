import { Cloudinary } from "@cloudinary/url-gen";
import { thumbnail } from "@cloudinary/url-gen/actions/resize";
import { face } from "@cloudinary/url-gen/qualifiers/focusOn";
import { focusOn } from "@cloudinary/url-gen/qualifiers/gravity";

const cld = new Cloudinary({
  cloud: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  },
});

export function useCloudinary() {
  const getAvatarUrl = (
    publicId: string | null | undefined,
    size: number = 80,
  ) => {
    if (!publicId) return null;

    return cld
      .image(publicId)
      .resize(thumbnail().width(size).height(size).gravity(focusOn(face())))
      .format("auto")
      .quality("auto")
      .toURL();
  };

  return {
    cld,
    getAvatarUrl,
  };
}
