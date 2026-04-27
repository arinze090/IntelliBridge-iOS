import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Animated,
  PanResponder,
  SafeAreaView,
  Platform,
  Alert,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { blobToBase64 } from '../../Library/Common';
import { windowHeight, windowWidth } from '../../utils/Dimensions';
import { THEMES, HIT } from '../../themes/bookReaderThemes';
import { useDispatch, useSelector } from 'react-redux';
import {
  addBookmarkBookPage,
  removeBookmarkBookaPage,
  setBookLocation,
} from '../../redux/features/books/booksSlice';
import ReaderPanel from '../common/EpubReaderComponents/ReaderPanel';
import EpubBottomSheet from '../bottomSheet/EpubBottomSheet';
import FontsDisplay from '../common/EpubReaderComponents/FontsDisplay';
import PaginationSlider from '../common/EpubReaderComponents/PaginationSlider';
import AddNotesModal from '../common/EpubReaderComponents/AddNotesModal';
import BookmarkList from '../common/EpubReaderComponents/BookmarkList';
import NotesList from '../common/EpubReaderComponents/NotesList';

// How many px the user must swipe horizontally to trigger a page turn
const SWIPE_THRESHOLD = 50;
// How many px of vertical drift is still considered a horizontal swipe
const SWIPE_MAX_VERT = 80;

const EpubReader2 = ({ bookUrl, bookId, bookTitle = 'Book', props }) => {
  // console.log('proooo', props);

  const navigation = useNavigation();
  const dispatch = useDispatch();

  const state = useSelector(state => state);
  const reduxBookmarks = state?.books?.bookmarkBookPages?.[bookId];

  const bookmarks = reduxBookmarks?.bookmarks || [];
  const bookmarksss = state?.books?.bookmarkBookPages;
  console.log('bookmarks', bookmarks, bookmarksss);

  const webRef = useRef(null);
  const bottomSheetRef = useRef();
  const pageSliderBottomSheetRef = useRef();
  const bookmarkBottomSheetRef = useRef();
  const notesBottomSheetRef = useRef();

  // Book state
  const [savedLocation, setSavedLocation] = useState(null);
  const [epubBase64, setEpubBase64] = useState(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Reader UI state
  const [progress, setProgress] = useState(0);
  const [fontSize, setFontSize] = useState(100);
  const [theme, setTheme] = useState('light');
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  // add notes segment
  const [selectedText, setSelectedText] = useState(null);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [notes, setNotes] = useState([]);

  // page alignement (left, center, right)
  const [textAlign, setTextAlign] = useState('left');

  // page formatting useEffect
  useEffect(() => {
    if (isWebViewReady) {
      sendMessage({ type: 'SET_ALIGNMENT', align: textAlign });
      console.log('textAlign', textAlign);
    }
  }, [textAlign]);

  // font family etc
  const [fontFamily, setFontFamily] = useState('');

  useEffect(() => {
    if (isWebViewReady) {
      sendMessage({ type: 'SET_FONT_FAMILY', family: fontFamily });
      console.log('fontFamily', fontFamily);
      // bottomSheetRef?.current?.close();
    }
  }, [fontFamily]);

  // font size
  const [fontSizee, setFontSizee] = useState(16);

  useEffect(() => {
    if (isWebViewReady) {
      sendMessage({ type: 'SET_FONT_SIZEE', fontSizee: fontSizee });
      console.log('fontSizee', fontSizee);
      // bottomSheetRef?.current?.close();
    }
  }, [fontSizee]);

  // line height
  const [lineHeight, setLineHeight] = useState(1.4);
  useEffect(() => {
    if (isWebViewReady) {
      sendMessage({ type: 'SET_LINE_HEIGHT', lineHeight: lineHeight });
      console.log('lineHeight', lineHeight);
      // bottomSheetRef?.current?.close();
    }
  }, [lineHeight]);

  // hyphenation
  const [hyphenation, setHyphenation] = useState(false);
  useEffect(() => {
    if (isWebViewReady) {
      sendMessage({ type: 'SET_HYPHENATION', hyphenation: hyphenation });
      console.log('hyphenation', hyphenation);
      // bottomSheetRef?.current?.close();
    }
  }, [hyphenation]);

  // tts segment
  const [ttsStatus, setTTSStatus] = useState('');

  useEffect(() => {
    if (isWebViewReady) {
      if (ttsStatus?.type === 'play') {
        sendMessage({ type: 'START_TTS' });
      } else if (ttsStatus?.type === 'pause') {
        sendMessage({ type: 'STOP_TTS' });
      } else if (ttsStatus?.type === 'speed') {
        sendMessage({ type: 'SET_TTS_RATE', rate: ttsStatus?.rate });
      } else {
        sendMessage({
          type: 'SET_TTS_RATE',
          rate: 1,
        });
      }
      console.log('ttsStatusttsStatus', ttsStatus);
      // bottomSheetRef?.current?.close();
    }
  }, [ttsStatus]);

  // bookmark
  const [currentLocation, setCurrentLocation] = useState(null);
  const isBookmarked = bookmarks?.some(
    b => b.location === currentLocation?.cfi,
  );

  // Toolbar fade animation
  const toolbarOpacity = useRef(new Animated.Value(0)).current;
  const toolbarTimeout = useRef(null);

  // ── Gesture tracking refs (not state — no re-render needed) ──────────────
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const isSwiping = useRef(false);

  //  This is to fetch epub as base64 in RN (bypasses CORS completely)
  useEffect(() => {
    if (!bookUrl) {
      setLoadError('No bookUrl provided');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const response = await fetch(bookUrl);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const blob = await response.blob();
        if (blob.size === 0) throw new Error('File is empty');

        const b64 = await blobToBase64(blob);
        const raw = b64.includes(',') ? b64.split(',')[1] : b64;

        const saved = await AsyncStorage.getItem(`progress_${bookId}`);
        if (saved) setSavedLocation(JSON.parse(saved).location || null);

        setEpubBase64(raw);
      } catch (e) {
        setLoadError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [bookUrl, bookId]);

  //   Send the epubBase64 data to WebView once both sides are ready
  useEffect(() => {
    if (isWebViewReady && epubBase64) {
      sendMessage({
        type: 'LOAD_BOOK',
        base64: epubBase64,
        location: savedLocation,
      });
    }
  }, [isWebViewReady, epubBase64]);

  // Apply theme changes after boot
  useEffect(() => {
    sendMessage({ type: 'SET_THEME', theme });
  }, [theme]);

  // notes

  const loadAndInjectNotes = async () => {
    const savedNotes =
      JSON.parse(await AsyncStorage.getItem(`notes_${bookId}`)) || [];

    setNotes(savedNotes);
    savedNotes.forEach(n => {
      sendMessage({
        type: 'HIGHLIGHT_NOTE',
        location: n.location,
      });
    });
  };

  useEffect(() => {
    if (isWebViewReady) {
      loadAndInjectNotes();
    }
  }, [isWebViewReady]);

  //   javascript bridge to send messages to WebView
  const sendMessage = useCallback(payload => {
    const json = JSON.stringify(payload);
    webRef.current?.injectJavaScript(`
      (function(){
        window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(
          json,
        )} }));
      })();
      true;
    `);
  }, []);

  const sendMessage2 = useCallback(payload => {
    webRef.current?.postMessage(JSON.stringify(payload));
  }, []);

  //   Handle messages received from the WebView (progress updates, logs, errors)
  const handleMessage = useCallback(
    async event => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        switch (data.type) {
          case 'PROGRESS':
            setProgress(data?.progress);
            setIsAtStart(data?.isAtStart || false);
            setIsAtEnd(data?.isAtEnd || false);
            setCurrentPage(data?.currentPage || 0);
            setTotalPages(data?.totalPages || 0);

            setCurrentLocation({
              cfi: data?.location,
              page: data?.currentPage,
            });

            await AsyncStorage.setItem(
              `progress_${bookId}`,
              JSON.stringify({
                progress: data?.progress,
                location: data?.location,
              }),
            );

            // also save to redux or global state if needed for cross-session syncing
            dispatch(
              setBookLocation({
                bookId: bookId,
                progress: data?.progress,
                location: data?.location,
                bookInfo: props,
              }),
            );

            break;
          case 'BOOKMARK':
            const newBookmark = data.location;

            const existing =
              JSON.parse(await AsyncStorage.getItem(`bookmarks_${bookId}`)) ||
              [];

            // prevent duplicates
            if (!existing?.includes(newBookmark)) {
              const updated = [...existing, newBookmark];

              await AsyncStorage.setItem(
                `bookmarks_${bookId}`,
                JSON.stringify(updated),
              );
            }
            break;
          case 'LOAD_FONT':
            setFontFamily(data.family);
            break;
          case 'TEXT_SELECTED':
            console.log('TEXT_SELECTED', data);
            setSelectedText({
              text: data.text,
              location: data.location,
            });

            setNoteModalVisible(true);
            break;
          case 'TAP':
            if (data.zone === 'left') {
              goPrev();
            } else if (data.zone === 'right') {
              goNext();
            } else {
              toggleToolbar();
            }
            break;

          case 'LOG':
            console.log('[WebView]', data.message);
            break;
          case 'ERROR':
            console.error('[WebView]', data.message);
            break;
        }
      } catch (e) {}
    },
    [bookId],
  );

  //   Show toolbar immediately, then auto-hide after a delay. Resets timer if already visible.
  const showToolbar = useCallback(() => {
    if (toolbarTimeout.current) clearTimeout(toolbarTimeout.current);
    setToolbarVisible(true);
    Animated.timing(toolbarOpacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
    // Auto-hide after 4 seconds
    toolbarTimeout.current = setTimeout(hideToolbar, 4000);
  }, []);

  //   function to hide the toolbar with a fade-out animation
  const hideToolbar = useCallback(() => {
    Animated.timing(toolbarOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setToolbarVisible(false);
    });
  }, []);

  const toggleToolbar = useCallback(() => {
    toolbarVisible ? hideToolbar() : showToolbar();
  }, [toolbarVisible]);

  //   functions to send next/prev page commands to WebView.
  //   Wrapped in useCallback for stable references in gesture handlers.
  const goNext = useCallback(
    () => sendMessage({ type: 'NEXT_PAGE' }),
    [sendMessage],
  );

  const goPrev = useCallback(
    () => sendMessage({ type: 'PREV_PAGE' }),
    [sendMessage],
  );

  //   function to change font size, with limits to prevent it from getting too small or too large
  const changeFontSize = useCallback(
    delta => {
      setFontSize(prev => {
        const next = Math.min(200, Math.max(60, prev + delta));
        sendMessage({ type: 'SET_FONT_SIZE', size: next });
        return next;
      });
    },
    [sendMessage],
  );

  // bookmark feature
  // const handleAddBookmark = useCallback(() => {
  //   sendMessage({ type: 'GET_CURRENT_LOCATION' });
  // }, [sendMessage]);

  const handleAddBookmark = () => {
    if (!currentLocation?.cfi) return;

    const payload = {
      bookId,
      location: currentLocation.cfi,
      page: currentPage,
      bookInfo: props,
    };

    // const isBookmarked = bookmarks?.some(
    //   b => b.location === currentLocation.cfi,
    // );

    if (isBookmarked) {
      dispatch(removeBookmarkBookaPage(payload));
    } else {
      dispatch(addBookmarkBookPage(payload));
    }
  };

  const saveNote = async noteText => {
    if (!selectedText?.location) return;

    const existing =
      JSON.parse(await AsyncStorage.getItem(`notes_${bookId}`)) || [];

    const updated = [
      ...existing,
      {
        text: selectedText?.text,
        note: noteText,
        location: selectedText?.location,
        createdAt: Date.now(),
      },
    ];
    console.log('updatedTexttttt', updated);
    await AsyncStorage.setItem(`notes_${bookId}`, JSON.stringify(updated));
    setNotes(updated);
  };

  const handlePressBookmark = location => {
    console.log('handlePressBookmark', location);
    sendMessage({
      type: 'GO_TO_LOCATION',
      location: location?.location,
    });
  };

  const handlePressNotes = note => {
    console.log('handlePressNotes', note);
    sendMessage({
      type: 'GO_TO_LOCATION',
      location: note?.location,
    });
    notesBottomSheetRef?.current.close();
  };

  const openNotesBottomSheet = () => {
    if (bottomSheetRef?.current?.close) {
      bottomSheetRef?.current.close();
    }

    setTimeout(() => {
      if (notesBottomSheetRef?.current?.open) {
        notesBottomSheetRef?.current.open();
      } else {
        console.warn('notesBottomSheetRef is not ready');
      }
    }, 250);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // GESTURE HANDLER — lives on the RN View that overlays the WebView.
  //
  // Why overlay instead of WebView gestures?
  // The WebView swallows all touch events for epub.js text selection.
  // A transparent RN overlay captures swipe/tap gestures first, then
  // we drive epub.js via postMessage. Text selection still works because
  // we only intercept clear horizontal swipes and short taps.
  // ─────────────────────────────────────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      // We want to consider being the responder for every touch
      onStartShouldSetPanResponder: () => true,
      // onStartShouldSetPanResponder: () => false,

      onMoveShouldSetPanResponder: (_, g) => {
        return Math.abs(g.dx) > 12 && Math.abs(g.dy) < 80;
      },
      // onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
      onStartShouldSetPanResponderCapture: () => false, // don't steal taps from links
      onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 12,

      onPanResponderGrant: evt => {
        const t = evt.nativeEvent.touches[0];
        touchStartX.current = t.pageX;
        touchStartY.current = t.pageY;
        touchStartTime.current = Date.now();
        isSwiping.current = false;
      },

      onPanResponderMove: (_, g) => {
        if (Math.abs(g.dx) > SWIPE_THRESHOLD) isSwiping.current = true;
      },

      onPanResponderRelease: (evt, g) => {
        const dx = g.dx;
        const dy = g.dy;
        const duration = Date.now() - touchStartTime.current;
        const x = touchStartX.current;

        const isHorizontalSwipe =
          Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_MAX_VERT;
        const isTap = Math.abs(dx) < 10 && Math.abs(dy) < 10 && duration < 300;

        if (isHorizontalSwipe) {
          // Swipe left → next page, swipe right → previous page
          dx < 0 ? goNext() : goPrev();
          return;
        }

        if (isTap) {
          const leftZone = x < windowWidth * 0.25;
          const rightZone = x > windowWidth * 0.75;
          const centerZone = !leftZone && !rightZone;

          if (leftZone) goPrev();
          else if (rightZone) goNext();
          else if (centerZone) toggleToolbar();
        }
      },

      onPanResponderTerminate: () => {},
    }),
  ).current;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#555" />
        <Text style={styles.loadingText}>Opening book…</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Could not open book</Text>
        <Text style={styles.errorSub}>{loadError}</Text>
      </View>
    );
  }

  const bg = THEMES[theme]?.background;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar hidden />
      {/* ── The book renders here ── */}
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        allowUniversalAccessFromFileURLs
        allowFileAccessFromFileURLs
        mixedContentMode="always"
        scrollEnabled={false}
        source={{ html: getReaderHtml(), baseUrl: 'https://localhost' }}
        style={{ backgroundColor: bg }}
        onLoad={() => setIsWebViewReady(true)}
        onMessage={handleMessage}
        onShouldStartLoadWithRequest={() => true}
      />
      {/* ── Transparent gesture overlay — sits on top of WebView ── */}
      {!isSelectionMode && (
        <View style={styles.gestureOverlay} {...panResponder.panHandlers} />
      )}
      {/* <View style={styles.gestureOverlay} {...panResponder.panHandlers} /> */}
      {/* ── Page edge hint arrows (subtle, fade out after first swipe) ── */}
      {!isAtStart && (
        <View style={styles.edgeLeft}>
          <Text style={styles.edgeArrow}>‹</Text>
        </View>
      )}
      {!isAtEnd && (
        <View style={styles.edgeRight}>
          <Text style={styles.edgeArrow}>›</Text>
        </View>
      )}
      {/* ── Progress bar at very bottom ── */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%`, backgroundColor: THEMES[theme].accent },
          ]}
        />
      </View>

      {/* Reader's panel */}
      <ReaderPanel
        bookTitle={bookTitle}
        toolbarOpacity={toolbarOpacity}
        theme={theme}
        progress={progress}
        changeFontSize={changeFontSize}
        onPageFormat={align => {
          setTextAlign(align);
          console.log('assss', align);
        }}
        // onAddNotes={saveNote}
        onAddNotes={() => {
          setIsSelectionMode(prev => !prev);
          console.log('isSelectionMode', isSelectionMode);
        }}
        isBookmarked={isBookmarked}
        handleAddBookmark={handleAddBookmark}
        onSettings
        onViewChange={() => {
          bottomSheetRef?.current?.open();
        }}
        onPaginationChange={() => {
          pageSliderBottomSheetRef?.current?.open();
        }}
        onTTSChange={status => {
          console.log('ttsStatus', status);
          setTTSStatus(status);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        onBookmarksChange={() => {
          bookmarkBottomSheetRef?.current?.open();
        }}
        // onSlidingComplete={value => {
        //   console.log('slidingpage', value);
        //   sendMessage({
        //     type: 'GO_TO_PAGE',
        //     page: value,
        //   });
        // }}
      />

      {/* notes modal */}
      {noteModalVisible && (
        <AddNotesModal
          noteInput={noteInput}
          selectedText={selectedText}
          setNoteInput={setNoteInput}
          onAddNotesPress={async () => {
            if (!selectedText?.text || !selectedText?.location) {
              Alert.alert('No text selected');
              return;
            }

            await saveNote(noteInput);

            sendMessage({
              type: 'HIGHLIGHT_NOTE',
              location: selectedText.location,
            });

            setNoteModalVisible(false);
            setNoteInput('');
            setSelectedText(null);
            setIsSelectionMode(false);
          }}
          onCancelNotes={() => {
            setNoteModalVisible(false);
            setNoteInput('');
            setSelectedText(null);
            setIsSelectionMode(false);
          }}
        />
      )}

      {/* View for Fonts Display */}
      <EpubBottomSheet
        bottomSheetRef={bottomSheetRef}
        bottomsheetTitle={'Reading View Options'}
        height={2.2}
        children={
          <FontsDisplay
            selectedFont={fontFamily}
            onFontChange={family => {
              // console.log('fontfamily', family);
              setFontFamily(family);
            }}
            fontSize={fontSizee}
            onFontSizeChange={fos => {
              // console.log('setFontSizee', fos);
              setFontSizee(fos);
            }}
            lineHeight={lineHeight}
            onLineHeightChange={lh => {
              // console.log('setLineHeight', lh);
              setLineHeight(lh);
            }}
            hyphenation={hyphenation}
            onHyphenationChange={hyphen => {
              setHyphenation(hyphen);
              console.log('hyphenation', hyphen);
            }}
            onViewNotes={() => {
              console.log('onViewNotes');
              openNotesBottomSheet();
            }}
          />
        }
      />

      {/* Page Slider Bottom Sheet */}
      <EpubBottomSheet
        bottomSheetRef={pageSliderBottomSheetRef}
        bottomsheetTitle={'Slide to Page'}
        height={5}
        children={
          <PaginationSlider
            currentPage={currentPage}
            totalPages={totalPages}
            onSlidingComplete={value => {
              console.log('slidingpage', value);
              sendMessage({
                type: 'GO_TO_PAGE',
                page: value,
              });
            }}
          />
        }
      />

      {/* bookmarks bottom sheet */}
      <EpubBottomSheet
        bottomSheetRef={bookmarkBottomSheetRef}
        bottomsheetTitle={'Bookmarked Pages'}
        height={2}
        children={
          <BookmarkList
            bookmarks={bookmarks}
            onPressBookmark={handlePressBookmark}
          />
        }
      />

      {/* notes bottom sheet */}
      <EpubBottomSheet
        bottomSheetRef={notesBottomSheetRef}
        bottomsheetTitle={'Added Notes'}
        height={2}
        children={<NotesList notes={notes} onPressNotes={handlePressNotes} />}
      />
    </SafeAreaView>
  );
};

export default EpubReader2;

// ─────────────────────────────────────────────────────────────────────────────
// WEBVIEW HTML
// All gestures are handled in RN above. The HTML only needs to:
//  1. Render the book
//  2. Listen for commands (NEXT, PREV, FONT, THEME)
//  3. Report progress back
// ─────────────────────────────────────────────────────────────────────────────
function getReaderHtml() {
  return `<!DOCTYPE html>
<html>
<head>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Open+Sans&family=Roboto&family=EB+Garamond&display=swap" rel="stylesheet">
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/epubjs@0.3.93/dist/epub.min.js"><\/script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body {
      height: 100%; width: 100%;
      overflow: auto;
      background: var(--bg, #ffffff);
      position: relative;
      top: 0; left: 0;
    }
    #viewer { height: 100%; width: 100%; }
    #viewer iframe { border: none !important; }

    .note-icon {
      background: yellow;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      display: inline-block;
    }
  </style>
</head>
<body>
  <div id="viewer"></div>
  <script>
    var book             = null;
    var rendition        = null;
    var currentFontSize  = 100;
    var currentTheme     = 'light';
    var currentAlignment = 'left';
    var locationsReady   = false;

    var THEMES = {
      light: { background: '#ffffff', color: '#1a1a1a' },
      sepia: { background: '#f3e9d2', color: '#3b2e1a' },
      dark:  { background: '#1a1a1a', color: '#d8d4cc' },
    };

    window.onerror = function(msg, src, line) {
      rn('ERROR', { message: msg + ' (line ' + line + ')' });
      return false;
    };

    // tts
    var ttsUtterance = null;
    var ttsPlaying = false;
    var ttsRate = 1;

    function receiveMessage(event) {
      try {
        var data = JSON.parse(event.data);
        switch(data.type) {
          case 'LOAD_BOOK':     loadBook(data.base64, data.location);  break;
          case 'NEXT_PAGE':     if (rendition) rendition.next();       break;
          case 'PREV_PAGE':     if (rendition) rendition.prev();       break;
          case 'SET_FONT_SIZE': setFontSize(data.size);                break;
          case 'SET_THEME':     applyTheme(data.theme);                break;
          case 'SET_ALIGNMENT': setAlignment(data.align);              break;
          case 'SET_FONT_FAMILY': setFontFamily(data.family);          break;
          case 'SET_LINE_HEIGHT': setLineHeight(data.lineHeight);      break;
          case 'SET_FONT_SIZEE': setFontSizee(data.fontSizee);         break;
          case 'SET_HYPHENATION': setHyphenation(data.hyphenation);    break;
          case 'GET_TEXT_FOR_TTS': sendTextForTTS();                   break;

          case 'START_TTS':     startTTS();                            break;
          case 'STOP_TTS':      stopTTS();                             break;
          case 'SET_TTS_RATE':  setTTSRate(data.rate);                 break;

          case 'GET_CURRENT_LOCATION':
            if (rendition) {
              var loc = rendition.currentLocation();
              if (loc && loc.start && loc.start.cfi) {
                rn('BOOKMARK', {
                  location: loc.start.cfi
                });
              }
            }                                                          break;
                                                                      
          case 'GO_TO_LOCATION': if (rendition) rendition.display(data.location);   break;
          case 'GO_TO_PAGE':
            if (book && rendition && locationsReady) {
              try {
                var cfi = book.locations.cfiFromLocation(data.page);
                rendition.display(cfi);
              } catch (e) {
                rn('ERROR', { message: 'GO_TO_PAGE failed: ' + e.message });
              }
            }
                                                                        break;
          case 'notes': sendMessage({ type: 'GET_CURRENT_SELECTION' }); break;

          case 'GET_CURRENT_SELECTION':
            const selection = window.getSelection().toString().trim();

            if (selection && selection.length > 5) {
              const loc = rendition && rendition.currentLocation();

              rn('TEXT_SELECTED', {
                text: selection,
                location: loc && loc.start && loc.start.cfi
              });
            }
                                                                        break;

          case 'HIGHLIGHT_NOTE':
            if (rendition) {
              const id = 'note-' + data.location;

              // rendition.annotations.add(
              //   'highlight',
              //   data.location,
              //   { id },
              //   null,
              //   'note-highlight',
              //   {
              //     fill: 'yellow',
              //     'fill-opacity': '0.3',
              //     'mix-blend-mode': 'multiply'
              //   }
              // );
              rendition.annotations.add(
                'highlight',
                data.location,
                { id },
                function(e) {
                  rn('NOTE_CLICKED', { location: data.location });
                  console.log('Note at ' + data.location + ' clicked');
                },
                'note-highlight',
                {
                  fill: 'yellow',
                  'fill-opacity': '0.3',
                  'mix-blend-mode': 'multiply'
                }
              );
            }
          break;
        }
      } catch(e) {}
    }
    window.addEventListener('message', receiveMessage);
    document.addEventListener('message', receiveMessage);

    function rn(type, payload) {
      try {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
          JSON.stringify(Object.assign({ type: type }, payload || {}))
        );
      } catch(e) {}
    }

    function loadBook(base64, location) {
      if (!base64) return;

      var binary = atob(base64);
      var bytes  = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      book = ePub(bytes.buffer);

      rendition = book.renderTo('viewer', {
        width:  window.innerWidth,
        height: window.innerHeight,
        spread: 'none',
        allowScriptedContent: true,
        flow: 'paginated',
        manager: 'default',
        snap: true,
      });

     rendition.themes.default({
  "::selection": {
    "background": "rgba(255,165,0,0.4)"
  },
  ".epubjs-hl": {
    "fill": "orange",
    "fill-opacity": "0.4",
    "mix-blend-mode": "multiply"
  }
});

      // 🔥 THIS IS THE IMPORTANT PART
      // rendition.themes.register("highlightTheme", {
      //   ".note-highlight": {
      //     "fill": "orange",
      //     "fill-opacity": "0.4",
      //     "mix-blend-mode": "multiply"
      //   }
      // });

      // rendition.themes.select("highlightTheme");

      rendition.hooks.content.register(function(contents) {
        const doc = contents.document;

         const style = doc.createElement('style');
          style.innerHTML =
            '.note-highlight {' +
            ' background: rgba(255,165,0,0.35) !important;' +
            ' border-radius: 3px;' +
            '}' +
            '::selection {' +
            ' background: rgba(255,165,0,0.4);' +
            '}';
          doc.head.appendChild(style);

        doc.addEventListener('selectionchange', function () {
          setTimeout(() => {
            const selection = doc.getSelection();
            const text = selection.toString().trim();

            if (text && text.length > 5) {
            rn('LOG', { message: 'Selection detected: ' + text });
              const loc = rendition.currentLocation();

              rn('TEXT_SELECTED', {
                text,
                location: loc && loc.start && loc.start.cfi,
              });
            }
          }, 200);

        });
      });

      rendition.display(location || undefined)
        .then(function() {
          applyTheme(currentTheme);
          rendition.themes.fontSize(currentFontSize + '%');
          setAlignment(currentAlignment);

          rendition.on('relocated', function(loc) {
            var progress = 0;
            var currentPage = 0;
            var totalPages = 0;

            if (locationsReady && book.locations.total > 0) {
              try {
                percentage = book.locations.percentageFromCfi(loc.start.cfi) || 0

                progress = Math.floor(percentage * 100);
                totalPages = book.locations.total;
                currentPage = Math.floor(book.locations.locationFromCfi(loc.start.cfi));
                
              } catch(e) {}
            }

            rn('PROGRESS', {
              progress: progress,
              location: loc.start.cfi,
              currentPage,
              totalPages,
              isAtStart: !!loc.atStart,
              isAtEnd:   !!loc.atEnd,
            });
          });

          book.locations.generate(1000).then(function() {
            locationsReady = true;
            rn('LOG', { message: 'Locations ready' });
          });
        })
        .catch(function(err) {
          rn('ERROR', { message: 'display() failed: ' + (err && err.message ? err.message : err) });
        });

      book.on('openFailed', function(err) {
        rn('ERROR', { message: 'openFailed: ' + err });
      });
    }

    function setFontSize(size) {
      currentFontSize = size;
      if (rendition) rendition.themes.fontSize(size + '%');
    }

    function applyTheme(name) {
      currentTheme = name;
      var t = THEMES[name] || THEMES.light;
      document.body.style.background = t.background;
      document.documentElement.style.setProperty('--bg', t.background);
      if (rendition) {
        rendition.themes.override('background', t.background);
        rendition.themes.override('color',      t.color);

        rendition.views().forEach(function(view) {
          try {
            var doc = view.document;
            if (!doc) return;
            var s = doc.getElementById('__theme__');
            if (!s) {
              s = doc.createElement('style');
              s.id = '__theme__';
              (doc.head||doc.body).appendChild(s);
            }
            s.textContent = 'body,p,div,span { background:' + t.background + ' !important; color:' + t.color + ' !important; }';
          } catch(e) {}
        });

        // Re-apply alignment after theme changes
        setAlignment(currentAlignment);
      }
    }

    function setAlignment(align) {
      if (!rendition) {
        currentAlignment = align || 'left';
        return;
      }

      var valid = ['left', 'right', 'center', 'justify'];
      if (!valid.includes(align)) align = 'left';
      currentAlignment = align;

      // For future renders
      rendition.themes.override('text-align', align);

      // For already rendered views
      rendition.views().forEach(function(view) {
        try {
          var doc = view.document;
          if (!doc) return;

          var style = doc.getElementById('__alignment__');
          if (!style) {
            style = doc.createElement('style');
            style.id = '__alignment__';
            (doc.head || doc.body).appendChild(style);
          }

      style.textContent =
        'body, p, div, span { text-align: ' + align + ' !important; }';
        } catch(e) {
         console.log('hhh', e)
        }
      });
    }

    // font family segment
    function setFontFamily(family) {
      if (!rendition) return;

      rendition.themes.override('font-family', family);

      rendition.views().forEach(view => {
        const doc = view.document;
        if (!doc) return;

        let style = doc.getElementById('__fontfamily__');
        if (!style) {
          style = doc.createElement('style');
          style.id = '__fontfamily__';
          doc.head.appendChild(style);
        }

        style.textContent = 
          'body, p, div, span { font-family: ' + family +' !important; }';
      });
    }

    // font size slider segment
    function setFontSizee(fontSizee) {
      if (!rendition) return;

      rendition.themes.override('font-size', fontSizee);

      rendition.views().forEach(view => {
        const doc = view.document;
        if (!doc) return;

        let style = doc.getElementById('__fontsize__');
        if (!style) {
          style = doc.createElement('style');
          style.id = '__fontsize__';
          doc.head.appendChild(style);
        }

        style.textContent = 
          'body, p, div, span { font-size: ' + fontSizee +'px !important; }';
      });
    }

    function setLineHeight(lineHeight) {
      if (!rendition) return;

      // Apply to future renders
      rendition.themes.override('line-height', lineHeight);

      // Apply to already-rendered iframes
      rendition.views().forEach(view => {
        const doc = view.document;
        if (!doc) return;

        let style = doc.getElementById('__lineheight__');
        if (!style) {
          style = doc.createElement('style');
          style.id = '__lineheight__';
          doc.head.appendChild(style);
        }

        style.textContent =
          'body, p, div, span { line-height: ' + lineHeight + ' !important; }';
      });
    }

    // hyphenation segment
    function setHyphenation(hyphenation) {
      currentHyphenation = hyphenation;

      if (!rendition) return;

      var value = hyphenation ? 'auto' : 'none';

      // Apply for future renders
      rendition.themes.override('hyphens', value);
      rendition.themes.override('-webkit-hyphens', value);
      rendition.themes.override('-ms-hyphens', value);

      // Apply to already rendered views
      rendition.views().forEach(function(view) {
        try {
          var doc = view.document;
          if (!doc) return;

          // ⚠️ IMPORTANT: ensure language exists
          doc.documentElement.setAttribute('lang', 'en');

          var style = doc.getElementById('__hyphenation__');
          if (!style) {
            style = doc.createElement('style');
            style.id = '__hyphenation__';
            (doc.head || doc.body).appendChild(style);
          }

          style.textContent =
            'body, p, div, span {' +
            'hyphens: ' + value + ' !important;' +
            '-webkit-hyphens: ' + value + ' !important;' +
            '-ms-hyphens: ' + value + ' !important;' +
            '}';
        } catch (e) {}
      });
    }

    // tts segment
    function sendTextForTTS() {
      if (!rendition) return;

      const iframe = document.querySelector('#viewer iframe');
      if (!iframe) return;

      const doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc) return;

      const text = doc.body.innerText || '';

      rn('TTS_TEXT', { text });
    }

    function startTTS() {
      if (!rendition) return;

      stopTTS();

      try {
        var contents = rendition.getContents();

        if (!contents || !contents.length) return;

        var doc = contents[0].document;
        if (!doc) return;

        var text = doc.body?.innerText || '';

        if (!text || text.length < 10) return;

        ttsUtterance = new SpeechSynthesisUtterance(text);
        ttsUtterance.rate = ttsRate;

        speechSynthesis.speak(ttsUtterance);
        ttsPlaying = true;

      } catch (e) {
        rn('ERROR', { message: 'TTS failed: ' + e.message });
      }
    }

    // function startTTS() {
    //   if (!rendition) return;

    //   stopTTS(); // reset if already playing

    //   try {
    //     var views = rendition.views();
    //     if (!views.length) return;

    //     var doc = views[0].document;
    //     if (!doc) return;

    //     var text = doc.body.innerText;

    //     if (!text || text.length < 10) return;

    //     ttsUtterance = new SpeechSynthesisUtterance(text);
    //     ttsUtterance.rate = ttsRate;
    //     ttsUtterance.pitch = 1;

    //     ttsUtterance.onend = function () {
    //       ttsPlaying = false;
    //       rn('TTS_ENDED');
    //     };

    //     speechSynthesis.speak(ttsUtterance);
    //     ttsPlaying = true;

    //   } catch (e) {
    //     rn('ERROR', { message: 'TTS failed: ' + e.message });
    //   }
    // }

    function stopTTS() {
      try {
        speechSynthesis.cancel();
        ttsPlaying = false;
      } catch (e) {}
    }

    function setTTSRate(rate) {
      ttsRate = rate;

      if (ttsPlaying) {
        startTTS(); // restart with new speed
      }
    }

//     document.addEventListener('mouseup', function() {
//   setTimeout(function () {
//     const selection = window.getSelection();
//     const text = selection.toString().trim();

//     if (text && text.length > 5) {
//       const loc = rendition && rendition.currentLocation();

//       rn('TEXT_SELECTED', {
//         text,
//         location: loc && loc.start && loc.start.cfi
//       });
//     }
//   }, 100);
// });


    // document.addEventListener('selectionchange', function() {
    //   const text = window.getSelection().toString();

    //   if (text && text.length > 5) {
    //     const loc = rendition && rendition.currentLocation();

    //     rn('TEXT_SELECTED', {
    //       text,
    //       location: loc && loc.start && loc.start.cfi
    //     });
    //   }
    // });

    // document.addEventListener('selectionchange', function () {
    //   setTimeout(() => {
    //     const selection = window.getSelection();
    //     const text = selection.toString().trim();

    //     if (text && text.length > 5) {
    //       const loc = rendition && rendition.currentLocation();

    //       rn('TEXT_SELECTED', {
    //         text,
    //         location: loc && loc.start && loc.start.cfi,
    //       });
    //     }
    //   }, 150);
    // });

    document.addEventListener('click', function(e) {
  const width = window.innerWidth;
  const x = e.clientX;

  let zone = 'center';

  if (x < width * 0.25) zone = 'left';
  else if (x > width * 0.75) zone = 'right';

  rn('TAP', { zone });
});

    window.addEventListener('resize', function() {
      if (rendition) rendition.resize(window.innerWidth, window.innerHeight);
    });
  <\/script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 12,
  },
  loadingText: { fontSize: 15, color: '#666' },
  errorText: {
    fontSize: 16,
    color: '#c00',
    fontWeight: '600',
    textAlign: 'center',
  },
  errorSub: { fontSize: 13, color: '#999', textAlign: 'center' },

  // Transparent overlay that captures gestures above the WebView
  gestureOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 5,
    // backgroundColor: 'rgba(255,0,0,0.05)',
    // pointerEvents: 'box-none',
    backgroundColor: 'transparent',
  },

  // Subtle left/right edge arrows
  edgeLeft: {
    position: 'absolute',
    left: 6,
    top: '50%',
    transform: [{ translateY: -16 }],
    zIndex: 6,
  },
  edgeRight: {
    position: 'absolute',
    right: 6,
    top: '50%',
    transform: [{ translateY: -16 }],
    zIndex: 6,
  },
  edgeArrow: {
    fontSize: 28,
    color: 'rgba(0,0,0,0.12)',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },

  // Thin progress bar pinned to very bottom
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.08)',
    zIndex: 4,
  },
  progressFill: { height: 2, borderRadius: 1 },

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
  highlightedTextHeader: {
    justifyContent: 'center',
    alignContent: 'center',
    alignItems: 'center',
    fontSize: 17,
    fontWeight: '700',
    alignSelf: 'center',
    marginTop: 10,
    color: 'black',
    padding: 20,
  },
});
