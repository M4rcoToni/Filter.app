import React, { useEffect, useState } from 'react';
import { ImageSourcePropType, View } from 'react-native';
import { Camera, CameraType, FaceDetectionResult } from 'expo-camera';
import { styles } from './styles';
import * as FaceDetector from 'expo-face-detector';
import Animated, { useSharedValue, useAnimatedStyle } from 'react-native-reanimated';

import neutralImg from '../../assets/neutral.png';
import smilingImg from '../../assets/smiling.png';
import winkingImg from '../../assets/winking.png';

export function Home() {
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [faceDetected, setFaceDetected] = useState(false);
  const [emoji, setEmoji] = useState<ImageSourcePropType>(neutralImg);
  const faceValues = useSharedValue({
    width: 0,
    height: 0,
    x: 0,
    y: 0
  })
  function handleFacesDetected({ faces }: FaceDetectionResult) {
    const face = faces[0] as any;
    if (face) {
      const { size, origin } = face.bounds;
      faceValues.value = {
        width: size.width,
        height: size.height,
        x: origin.x,
        y: origin.y
      }

      if (face.smilingProbability > 0.5)
        setEmoji(smilingImg);
      else if (face.leftEyeOpenProbability > 0.5 && face.rightEyeOpenProbability < 0.5)
        setEmoji(winkingImg);
      else
        setEmoji(neutralImg);

      setFaceDetected(true);
    } else {
      setFaceDetected(false);
    }
  }

  const animatedStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    zIndex: 1,
    width: faceValues.value.width + 100,
    height: faceValues.value.height + 20,
    transform: [
      { translateX: faceValues.value.x - 50 },
      { translateY: faceValues.value.y }
    ],
  }))
  useEffect(() => {
    requestPermission();
  }, []);
  if (!permission?.granted) {
    return;
  }
  return (
    <View style={styles.container}>
      {
        faceDetected &&
        <Animated.Image
          style={[animatedStyle]}
          source={emoji}
        />
      }
      <Camera
        style={styles.camera}
        type={CameraType.front}
        onFacesDetected={handleFacesDetected}
        faceDetectorSettings={{
          mode: FaceDetector.FaceDetectorMode.fast,
          detectLandmarks: FaceDetector.FaceDetectorLandmarks.all,
          runClassifications: FaceDetector.FaceDetectorClassifications.all,
          minDetectionInterval: 100,
          tracking: true,
        }}
      />
    </View>
  );
}