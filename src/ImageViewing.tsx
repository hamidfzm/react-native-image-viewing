/**
 * Copyright (c) JOB TODAY S.A. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React, { ComponentType } from "react";
import {
  Animated,
  StyleSheet,
  View,
  VirtualizedList,
  ModalProps
} from "react-native";

import Modal from "./components/Modal/Modal";
import ImageItem from "./components/ImageItem/ImageItem";
import ImageDefaultHeader from "./components/ImageDefaultHeader";

import useAnimatedComponents from "./hooks/useAnimatedComponents";
import useImageIndexChange from "./hooks/useImageIndexChange";
import useRequestClose from "./hooks/useRequestClose";
import { ImageSource, Dimensions } from "./@types";

type Props<T extends any> = {
  data: ReadonlyArray<T>;
  getImage: (item: T) => ImageSource;
  imageIndex: number;
  visible: boolean;
  onRequestClose: () => void;
  onImageIndexChange?: (imageIndex: number) => void;
  presentationStyle?: ModalProps["presentationStyle"];
  animationType?: ModalProps["animationType"];
  backgroundColor?: string;
  swipeToCloseEnabled?: boolean;
  doubleTapToZoomEnabled?: boolean;
  HeaderComponent?: ComponentType<{ imageIndex: number }>;
  FooterComponent?: ComponentType<{ imageIndex: number }>;
};

const DEFAULT_ANIMATION_TYPE = "fade";
const DEFAULT_BG_COLOR = "#000";

function ImageViewing<T extends any>({
  data,
  getImage,
  imageIndex,
  visible,
  onRequestClose,
  onImageIndexChange,
  animationType = DEFAULT_ANIMATION_TYPE,
  backgroundColor = DEFAULT_BG_COLOR,
  presentationStyle,
  swipeToCloseEnabled,
  doubleTapToZoomEnabled,
  HeaderComponent,
  FooterComponent
}: Props<T>) {
  const imageList = React.createRef<VirtualizedList<ImageSource>>();
  const [opacity, onRequestCloseEnhanced] = useRequestClose(onRequestClose);
  const [layout, setLayout] = React.useState<Dimensions>({ width: 0, height: 0 });
  const [currentImageIndex, onScroll] = useImageIndexChange(imageIndex, layout);
  const [
    headerTransform,
    footerTransform,
    toggleBarsVisible
  ] = useAnimatedComponents();

  React.useEffect(() => {
    if (onImageIndexChange) {
      onImageIndexChange(currentImageIndex);
    }
  }, [currentImageIndex]);

  const onZoom = React.useCallback(
    (isScaled: boolean) => {
      // @ts-ignore
      imageList?.current?.setNativeProps({ scrollEnabled: !isScaled });
      toggleBarsVisible(!isScaled);
    },
    [imageList]
  );
  const getItemCount = React.useCallback(() => data.length, [data]);
  const getItem = React.useCallback((_, index) => data[index] ? getImage(data[index]) : ({ uri: "" }), [getImage, data]);

  return (
    <Modal
      transparent
      visible={visible}
      presentationStyle={presentationStyle}
      animationType={animationType}
      onRequestClose={onRequestCloseEnhanced}
      supportedOrientations={["portrait", "portrait-upside-down", "landscape", "landscape-left", "landscape-right"]}
    >
      <View
        style={[styles.container, { opacity, backgroundColor }]}
        onLayout={(e) => {
          setLayout(e.nativeEvent.layout);
        }}
      >
        <Animated.View style={[styles.header, { transform: headerTransform }]}>
          {typeof HeaderComponent !== "undefined" ? (
            React.createElement(HeaderComponent, {
              imageIndex: currentImageIndex
            })
          ) : (
            <ImageDefaultHeader onRequestClose={onRequestCloseEnhanced} />
          )}
        </Animated.View>
        <VirtualizedList
          ref={imageList}
          data={data}
          horizontal
          pagingEnabled
          windowSize={2}
          initialNumToRender={1}
          maxToRenderPerBatch={1}
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          initialScrollIndex={imageIndex}
          getItem={getItem}
          getItemCount={getItemCount}
          getItemLayout={(_, index) => ({
            length: layout.width,
            offset: layout.width * index,
            index
          })}
          renderItem={({ item: imageSrc }) => (
            <ImageItem
              onZoom={onZoom}
              imageSrc={imageSrc}
              onRequestClose={onRequestCloseEnhanced}
              swipeToCloseEnabled={swipeToCloseEnabled}
              doubleTapToZoomEnabled={doubleTapToZoomEnabled}
              layout={layout}
            />
          )}
          onMomentumScrollEnd={onScroll}
          keyExtractor={imageSrc => imageSrc.uri}
        />
        {typeof FooterComponent !== "undefined" && (
          <Animated.View
            style={[styles.footer, { transform: footerTransform }]}
          >
            {React.createElement(FooterComponent, {
              imageIndex: currentImageIndex
            })}
          </Animated.View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000"
  },
  header: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
    top: 0
  },
  footer: {
    position: "absolute",
    width: "100%",
    zIndex: 1,
    bottom: 0
  }
});

const EnhancedImageViewing = <T extends any>(props: Props<T>) => (
  <ImageViewing key={props.imageIndex} {...props} />
);

export default EnhancedImageViewing;
