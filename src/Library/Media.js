export const mediaSelectAndCrop = (
  ImagePicker,
  height,
  width,
  setCameraImage2,
  selectImage2,
  type = 1,
) => {
  if (type == 2) {
    ImagePicker.openPicker({
      width: width,
      height: height,
      cropping: true,
      mediaType: 'photo',
      multiple: false,
    }).then(image => {
      setCameraImage2('file://' + image?.path);
      selectImage2.current.close();
    });
  } else {
    ImagePicker.openCamera({
      width: width,
      height: height,
      cropping: true,
      mediaType: 'photo',
      multiple: false,
    }).then(image => {
      setCameraImage2('file://' + image?.path);
      selectImage2.current.close();
    });
  }
};
