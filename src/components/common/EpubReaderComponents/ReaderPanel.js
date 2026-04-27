import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  PanResponder,
  SafeAreaView,
  Platform,
  ScrollView,
} from 'react-native';
import React, { useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import FeatherIcons from 'react-native-vector-icons/Feather';
import Slider from '@react-native-community/slider';

import { THEMES, HIT } from '../../../themes/bookReaderThemes';
import { windowHeight, windowWidth } from '../../../utils/Dimensions';

const OPTIONS = {
  alignment: {
    title: 'Page Alignment',
    items: [
      { key: 'left', icon: 'align-left' },
      { key: 'center', icon: 'align-center' },
      { key: 'right', icon: 'align-right' },
      { key: 'justify', icon: 'align-justify' },
    ],
  },

  tts: {
    title: 'Text-to-Speech',
    items: [
      { key: 'slow', icon: 'play-back-outline', label: '0.5x', rate: 0.5 },
      { key: 'normal', icon: 'play-circle-outline', label: '1x', rate: 1 },
      { key: 'fast', icon: 'play-forward-outline', label: '1.5x', rate: 1.5 },
    ], // items: [
    //   {
    //     key: 'play-back',
    //     icon: 'play-back-outline',
    //     label: 'x 0.5',
    //   },
    //   {
    //     key: 'play-normal',
    //     icon: 'play-circle-outline',
    //     label: 'Normal',
    //   },
    //   {
    //     key: 'play',
    //     icon: 'play-outline',
    //     label: 'Play',
    //   },
    //   {
    //     key: 'pause',
    //     icon: 'pause-outline',
    //     label: 'Pause',
    //   },
    //   {
    //     key: 'play-forward',
    //     icon: 'play-forward-outline',
    //     label: 'x 1.5',
    //   },
    // ],
  },

  view: {
    title: 'View Options',
    items: ['page', 'scroll'],
  },

  notes: {
    title: 'Notes',
    items: ['create', 'view'],
  },
  pagination: {
    title: 'Slide to Page',
    // items: ['create', 'view'],
  },
  bookmarks: {
    title: 'Bookmarked Pages',
  },
};

const TOOLBAR_ITEMS = [
  {
    key: 'view',
    icon: 'aperture-outline',
    label: 'View',
    onPress: 'view',
  },
  {
    key: 'tts',
    icon: 'volume-high-outline',
    label: 'TTS',
    onPress: 'tts',
  },
  {
    key: 'notes',
    icon: 'chatbox-ellipses-outline',
    label: 'Add Notes',
    onPress: 'notes',
  },
  {
    key: 'alignment',
    icon: 'reorder-four-outline',
    label: 'Organize',
    onPress: 'alignment',
  },
  {
    key: 'pagination',
    icon: 'layers-outline',
    label: 'Pagination',
    onPress: 'pagination',
  },
  {
    key: 'bookmarks',
    icon: 'bookmark-outline',
    label: 'Bookmarks',
    onPress: 'bookmarks',
  },
  // {
  //   key: 'settings',
  //   icon: 'settings-outline',
  //   label: 'Settings',
  //   onPress: 'settings',
  // },
];

const ReaderPanel = ({
  toolbarOpacity,
  theme,
  bookTitle,
  isBookmarked,
  handleAddBookmark,
  progress,
  changeFontSize,
  onViewChange,
  onTTSChange,
  onAddNotes,
  onPageFormat,
  onPaginationChange,
  onBookmarksChange,
  onSettings,
  currentPage,
  totalPages,
  onSlidingComplete,
}) => {
  const navigation = useNavigation();

  const [showSelectedOptions, setShowSelectedOptions] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [activeTool, setActiveTool] = useState(null);
  const [activePanel, setActivePanel] = useState(null);
  const [activeAlign, setActiveAlign] = useState('left');
  const [activeTTS, setActiveTTS] = useState('normal');
  const [activeView, setActiveView] = useState('page');

  const AlignIcons = ({ alignment }) => {
    const isActive = activeAlign === alignment;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => {
          onPageFormat(alignment);
          setActiveAlign(alignment);
        }}
        style={[styles.alignOption, isActive && styles.alignActive]}
      >
        <FeatherIcons
          name={`align-${alignment}`}
          size={20}
          color={isActive ? '#fff' : 'black'}
        />
      </TouchableOpacity>
    );
  };

  const renderOptions = () => {
    if (!activePanel) return null;

    const config = OPTIONS[activePanel];

    return (
      <View
        style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 4 }}
      >
        {/* ================= ALIGNMENT ================= */}
        {activePanel === 'alignment' &&
          config?.items?.map(item => {
            const isActive = activeAlign === item.key;

            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => {
                  setActiveAlign(item?.key);
                  onPageFormat(item?.key);
                }}
                style={[styles.alignOption, isActive && styles.alignActive]}
              >
                <FeatherIcons
                  name={item?.icon}
                  size={20}
                  color={isActive ? '#fff' : '#000'}
                />
              </TouchableOpacity>
            );
          })}

        {/* ================= TTS ================= */}
        {activePanel === 'tts' && (
          <>
            {/* PLAY / PAUSE */}
            <TouchableOpacity
              onPress={() => {
                if (isPlaying) {
                  onTTSChange?.({ type: 'pause' });
                } else {
                  onTTSChange?.({ type: 'play', rate: ttsSpeed });
                }
                setIsPlaying(!isPlaying);
              }}
              style={[styles.alignOption, isPlaying && styles.alignActive]}
            >
              <Ionicons
                name={isPlaying ? 'pause-outline' : 'play-outline'}
                size={24}
                color={isPlaying ? '#fff' : '#000'}
              />
              <Text style={{ color: isPlaying ? '#fff' : '#000' }}>
                {isPlaying ? 'Pause' : 'Play'}
              </Text>
            </TouchableOpacity>

            {/* SPEED OPTIONS */}
            {config?.items?.map(item => {
              const isActive = ttsSpeed === item.rate;

              return (
                <TouchableOpacity
                  activeOpacity={0.9}
                  key={item?.key}
                  onPress={() => {
                    setTtsSpeed(item?.rate);
                    onTTSChange?.({ type: 'speed', rate: item?.rate });
                  }}
                  style={[styles.alignOption, isActive && styles.alignActive]}
                >
                  <Ionicons
                    name={item?.icon}
                    size={20}
                    color={isActive ? '#fff' : '#000'}
                  />
                  <Text style={{ color: isActive ? '#fff' : '#000' }}>
                    {item?.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ================= VIEW ================= */}
        {activePanel === 'view' &&
          config?.items?.map(item => {
            const isActive = activeView === item;

            return (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setActiveView(item);
                  onViewChange?.(item);
                }}
                style={[styles.alignOption, isActive && styles.alignActive]}
              >
                <Text style={{ color: isActive ? '#fff' : '#000' }}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}

        {/* Pagination */}
        {activePanel === 'pagination' &&
          config?.items?.map(item => {
            const isActive = activeView === item;

            return (
              <TouchableOpacity
                key={item}
                onPress={() => {
                  setActiveView(item);
                  onPaginationChange?.(item);
                }}
                style={[styles.alignOption, isActive && styles.alignActive]}
              >
                <Text style={{ color: isActive ? '#fff' : '#000' }}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}

        {/* {activePanel === 'pagination' && (
          <View style={styles.sliderArea}>
            <Text style={styles.fontBtnSm}>{currentPage}</Text>
            <Slider
              style={{ width: windowWidth / 1.3, height: 40 }}
              minimumValue={0}
              maximumValue={totalPages || 1}
              step={1}
              value={currentPage}
              onSlidingComplete={onSlidingComplete}
            />
            <Text style={styles.fontBtnSm}>{totalPages}</Text>
          </View>
        )} */}
      </View>
    );
  };

  //   const renderOptions = () => {
  //     if (!activePanel) return null;

  //     const config = OPTIONS[activePanel];

  //     return (
  //       <View
  //         style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 4 }}
  //       >
  //         {config?.items?.map(item => {
  //           const key = item?.key;

  //           const isActive =
  //             activePanel === 'alignment'
  //               ? activeAlign === key
  //               : activePanel === 'tts'
  //               ? activeTTS === key
  //               : activePanel === 'view'
  //               ? activeView === key
  //               : false;

  //           return (
  //             <TouchableOpacity
  //               key={key}
  //               onPress={() => {
  //                 if (activePanel === 'alignment') {
  //                   setActiveAlign(key);
  //                   onPageFormat(key);
  //                 }

  //                 if (activePanel === 'tts') {
  //                   setActiveTTS(key);
  //                   onTTSChange?.(key);
  //                 }

  //                 if (activePanel === 'view') {
  //                   setActiveView(key);
  //                   onViewChange?.(key);
  //                 }
  //               }}
  //               style={[styles.alignOption, isActive && styles.alignActive]}
  //             >
  //               {/* ALIGNMENT → ICONS */}
  //               {activePanel === 'alignment' && item?.icon && (
  //                 <FeatherIcons
  //                   name={item?.icon}
  //                   size={20}
  //                   color={isActive ? '#fff' : '#000'}
  //                 />
  //               )}
  //               {/* TTS → ICONS */}
  //               {activePanel === 'tts' && item?.icon && (
  //                 <View activeOpacity={0.9} style={styles.bottomBarBtn}>
  //                   <Ionicons
  //                     name={isActive === 'play' ? 'pause-outline' : item?.icon}
  //                     size={20}
  //                     color={isActive ? '#fff' : '#000'}
  //                   />
  //                   <Text style={{ color: isActive ? '#fff' : '#000' }}>
  //                     {item?.label}
  //                   </Text>
  //                 </View>
  //               )}
  //               {/* OTHER OPTIONS → TEXT */}
  //               {/* {activePanel !== 'alignment' && (
  //                 <Text style={{ color: isActive ? '#fff' : '#000' }}>
  //                   {item.label}
  //                 </Text>
  //               )} */}
  //             </TouchableOpacity>
  //           );
  //         })}
  //       </View>
  //     );
  //   };

  const OptionButton = ({ active, onPress, children, label }) => {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.optionItem, active && styles.optionActive]}
        activeOpacity={0.9}
      >
        {children}
        {label && (
          <Text style={[styles.optionText, active && styles.optionTextActive]}>
            {label}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const handleToolPress = key => {
    setActiveTool(key);

    switch (key) {
      case 'view':
        onViewChange?.();
        setActivePanel(null);
        setShowSelectedOptions(false);
        break;

      case 'tts':
        // onTTSChange?.()
        setActivePanel('tts');
        setShowSelectedOptions(true);
        break;

      case 'notes':
        onAddNotes?.();
        setActivePanel('notes');
        setShowSelectedOptions(false);
        break;

      case 'alignment':
        setActivePanel('alignment');
        setShowSelectedOptions(true);
        break;

      case 'pagination':
        onPaginationChange?.();
        setActivePanel(null);
        setShowSelectedOptions(false);
        break;

      case 'bookmarks':
        onBookmarksChange?.();
        setActivePanel(null);
        setShowSelectedOptions(false);
        break;

      // case 'settings':
      //   // onSettings?.();
      //   setActivePanel('settings');
      //   setShowSelectedOptions(false);
      //   break;
    }
  };

  return (
    <Animated.View
      // style={[styles.toolbarWrapper]}
      style={[styles.toolbarWrapper, { opacity: toolbarOpacity }]}
    >
      {/* Top bar */}
      <SafeAreaView
        style={[styles.topBar, { backgroundColor: THEMES[theme]?.barBg }]}
      >
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
          style={styles.barBtn}
          hitSlop={HIT}
        >
          <Ionicons
            name="arrow-back-outline"
            size={22}
            color={THEMES[theme]?.barText}
          />
        </TouchableOpacity>
        <Text
          style={[styles.barTitle, { color: THEMES[theme]?.barText }]}
          numberOfLines={1}
        >
          {bookTitle}
        </Text>
        <TouchableOpacity onPress={handleAddBookmark} style={styles.barBtn}>
          <Ionicons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
          />
        </TouchableOpacity>
        <Text style={[styles.barProgress, { color: THEMES[theme]?.barMuted }]}>
          {progress}%
        </Text>
      </SafeAreaView>

      {/* Bottom bar */}

      <View style={styles.bottomWrapper}>
        {showSelectedOptions && (
          <View
            style={[
              styles.floatingOptions,
              { backgroundColor: THEMES[theme]?.barBg },
            ]}
          >
            <Text style={styles.moreOptionTitle}>
              {OPTIONS[activePanel]?.title}
            </Text>
            {renderOptions()}
          </View>
        )}

        {/* {showSelectedOptions && (
          <View
            style={[
              styles.floatingOptions,
              { backgroundColor: THEMES[theme]?.barBg },
            ]}
          >
            <Text style={styles.moreOptionTitle}>{selectedOptionTitle}</Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              {selectedOptionIcons &&
                selectedOptionIcons?.map((cur, i) => (
                  <TouchableOpacity
                    key={i}
                    activeOpacity={0.9}
                    style={{ padding: 10, marginLeft: 10 }}
                  >
                    {cur}
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )} */}
        <SafeAreaView
          style={[styles.bottomBar, { backgroundColor: THEMES[theme]?.barBg }]}
        >
          {/* Font size */}
          {/* <TouchableOpacity
            onPress={() => changeFontSize(-10)}
            style={styles.bottomBarBtn}
            hitSlop={HIT}
          >
            <Text style={[styles.fontBtnLg, { color: THEMES[theme]?.barText }]}>
              A-
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => changeFontSize(10)}
            style={styles.barBtn}
            hitSlop={HIT}
          >
            <Text style={[styles.fontBtnLg, { color: THEMES[theme]?.barText }]}>
              A+
            </Text>
          </TouchableOpacity> */}

          {/* Divider */}
          <View style={styles.barDivider} />

          {/* Theme swatches */}
          {/* {Object?.entries(THEMES)?.map(([key, t]) => (
            <TouchableOpacity
              key={key}
              onPress={() => setTheme(key)}
              style={[
                styles.themeSwatch,
                {
                  backgroundColor: t.background,
                  borderColor:
                    theme === key ? THEMES[theme]?.accent : 'transparent',
                },
              ]}
              hitSlop={HIT}
            >
              <Text style={{ fontSize: 10, color: t.fg }}>Aa</Text>
            </TouchableOpacity>
          ))} */}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              // backgroundColor: 'green',
              // flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 12,
              borderTopWidth: StyleSheet.hairlineWidth,
              borderTopColor: 'rgba(0,0,0,0.08)',
              gap: 12,
              padding: 4,
              // height: windowHeight / 10,
              paddingLeft: '10',
            }}
            // style={styles.bottomBar}
          >
            {TOOLBAR_ITEMS?.map(item => {
              const isActive = activeTool === item?.key;

              return (
                <TouchableOpacity
                  key={item?.key}
                  onPress={() => handleToolPress(item?.key)}
                  style={[styles.bottomBarBtn, isActive && styles.toolActive]}
                  hitSlop={HIT}
                >
                  <Ionicons
                    name={item?.icon}
                    size={22}
                    color={isActive ? '#fff' : THEMES[theme]?.barText}
                  />

                  <Text
                    style={[
                      styles.fontBtnSm,
                      {
                        marginTop: 3,
                        fontSize: 12,
                        color: isActive ? '#fff' : THEMES[theme]?.barText,
                      },
                    ]}
                  >
                    {item?.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* More View segment */}
          {/* <TouchableOpacity
            onPress={onViewChange}
            style={styles.bottomBarBtn}
            hitSlop={HIT}
          >
            <Ionicons
              name="aperture-outline"
              size={22}
              color={THEMES[theme]?.barText}
            />
            <Text
              style={[
                styles.fontBtnSm,
                { marginTop: 3, color: THEMES[theme]?.barText, fontSize: 12 },
              ]}
            >
              View
            </Text>
          </TouchableOpacity> */}

          {/* TTS Segment */}
          {/* <TouchableOpacity
            onPress={() => {
              setActivePanel('tts');
              setShowSelectedOptions(!showSelectedOptions);
              setSelectedOptionTitle('Text-to-Speech');
              setSelectedOptionIcons([
                <FeatherIcons name="align-left" size={20} />,
              ]);
            }}
            style={styles.bottomBarBtn}
            hitSlop={HIT}
          >
            <Ionicons
              name="volume-high-outline"
              size={22}
              color={THEMES[theme]?.barText}
            />
            <Text
              style={[
                styles.fontBtnSm,
                { marginTop: 3, color: THEMES[theme]?.barText, fontSize: 12 },
              ]}
            >
              TTS
            </Text>
          </TouchableOpacity> */}

          {/* Add Notes segment */}
          {/* <TouchableOpacity
            onPress={onAddNotes}
            style={styles.bottomBarBtn}
            hitSlop={HIT}
          >
            <Ionicons
              name="chatbox-ellipses-outline"
              size={22}
              color={THEMES[theme]?.barText}
            />
            <Text
              style={[
                styles.fontBtnSm,
                { marginTop: 3, color: THEMES[theme]?.barText, fontSize: 12 },
              ]}
            >
              Add Notes
            </Text>
          </TouchableOpacity> */}

          {/* Page Alignment segment */}
          {/* <TouchableOpacity
            // onPress={onPageFormat}
            onPress={() => {
              setActivePanel('alignment');
              setShowSelectedOptions(!showSelectedOptions);
              setSelectedOptionTitle('Page Alignment');
              setSelectedOptionIcons(
                alignmentAngles?.map(cur => <AlignIcons alignment={cur} />),
              );
            }}
            style={styles.bottomBarBtn}
            hitSlop={HIT}
          >
            <Ionicons
              name="reorder-four-outline"
              size={22}
              color={THEMES[theme]?.barText}
            />
            <Text
              style={[
                styles.fontBtnSm,
                { marginTop: 3, color: THEMES[theme]?.barText, fontSize: 12 },
              ]}
            >
              Organize
            </Text>
          </TouchableOpacity> */}

          {/* Settings segment */}
          {/* <TouchableOpacity
            onPress={onSettings}
            style={styles.bottomBarBtn}
            hitSlop={HIT}
          >
            <Ionicons
              name="settings-outline"
              size={22}
              color={THEMES[theme]?.barText}
            />
            <Text
              style={[
                styles.fontBtnSm,
                { marginTop: 3, color: THEMES[theme]?.barText, fontSize: 12 },
              ]}
            >
              Settings
            </Text>
          </TouchableOpacity> */}
        </SafeAreaView>
      </View>
    </Animated.View>
  );
};

export default ReaderPanel;

const styles = StyleSheet.create({
  // Toolbar wrapper
  toolbarWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: 'space-between',
    pointerEvents: 'box-none',
  },
  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  bottomBarBtn: {
    padding: 4,
    // backgroundColor: 'red',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  barBtn: {
    padding: 4,
  },
  barBtnText: { fontSize: 18 },
  barTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    marginHorizontal: 8,
  },
  barProgress: { fontSize: 16, minWidth: 36, textAlign: 'right' },

  // Bottom bar
  bottomBarWithMoreOptions: {
    // flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
    gap: 12,
    padding: 4,
    height: windowHeight / 7,
    paddingLeft: '10',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
    gap: 12,
    padding: 4,
    height: windowHeight / 10,
    paddingLeft: '10',
  },
  fontBtnSm: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  fontBtnLg: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  barDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  themeSwatch: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  bottomWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
  },
  floatingOptions: {
    position: 'absolute',
    bottom: windowHeight / 10 + 5, // sits above bottom bar
    left: 10,
    right: 10,
    borderRadius: 10,
    padding: 12,

    // optional polish
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  moreOptionTitle: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    fontSize: 15,
    fontWeight: '700',
    alignSelf: 'center',
    color: 'black',
  },
  alignOption: {
    padding: 8,
    borderRadius: 4,
    marginHorizontal: 2,
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
  },
  alignActive: {
    backgroundColor: THEMES.dark?.accent || '#000',
  },
  toolActive: {
    backgroundColor: THEMES.dark?.accent || '#000',
    borderRadius: 8,
  },
  toolTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  sliderArea: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    width: windowWidth / 1.1,
    // backgroundColor: 'red',
    //   margin: 10,
    padding: 4,
    alignSelf: 'center',
  },
});
