import { View, Image, StyleSheet, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import Carousel from 'react-native-reanimated-carousel';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';
import { windowWidth } from '../../utils/Dimensions';
import { sliderData } from '../../data/dummyData';
import { COLORS } from '../../themes/themes';

const Carousels = ({ props }) => {
  const [loading, setloading] = useState(false);
  const onLoadEnd = () => {
    setloading(true);
  };

  function CarouselFun({ props }) {
    return (
      <View style={styles.carouselItem}>
        <Image
          source={{ uri: props.image }}
          style={{
            height: 350,
            width: '94%',
            borderRadius: 10,
            resizeMode: 'cover',
            marginRight: 5,
          }}
          onLoad={onLoadEnd}
          onLoadEnd={onLoadEnd}
        />

        <View style={styles.textOverlay}>
          <Text style={styles.titleText}>{props.title}</Text>

          <Text style={styles.descriptionText}>{props.description}</Text>
        </View>
      </View>
    );
  }

  const Slider = ({ item, index }) => {
    return <CarouselFun props={item} />;
  };

  return (
    <View style={{ position: 'relative', marginBottom: 10 }}>
      <Carousel
        loop
        width={windowWidth / 1.05}
        height={200}
        autoPlay={true}
        data={sliderData}
        scrollAnimationDuration={3000}
        renderItem={Slider}
        onLoad={onLoadEnd}
        onLoadEnd={onLoadEnd}
      />

      {!loading && (
        // This shows the skeletonLoader when the image hasn't fully loaded on the screen
        <View style={{ position: 'absolute', top: 0, zIndex: 1000 }}>
          <SkeletonPlaceholder
            highlightColor={COLORS.skeletonHighlightColor}
            backgroundColor={COLORS.skeletonBgColor}
            speed={1900}
          >
            <View style={{ width: windowWidth, height: 200 }} />
          </SkeletonPlaceholder>
        </View>
      )}
    </View>
  );
};

export default Carousels;

const styles = StyleSheet.create({
  carouselContainer: {
    position: 'relative',
    margin: 10,
  },
  carouselItem: {
    alignItems: 'center',
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'white',
    width: windowWidth / 1.9,
    paddingLeft: 7,
  },
  descriptionText: {
    fontSize: 13,
    paddingBottom: 100,
    width: windowWidth / 1.5,
    color: 'white',
    paddingLeft: 7,
  },
  image: {
    height: 200,
    width: '95%',
    borderRadius: 10,
    resizeMode: 'cover',
  },
  skeletonContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 1000,
  },
  skeleton: {
    width: windowWidth,
    height: 200,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '94%',
    height: 350,
    justifyContent: 'center',
    borderRadius: 10,
    // alignItems: "center",
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
});
