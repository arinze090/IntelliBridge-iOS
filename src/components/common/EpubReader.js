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
import { windowWidth } from '../../utils/Dimensions';
import { THEMES, HIT } from '../../themes/bookReaderThemes';
import { useDispatch } from 'react-redux';
import { setBookLocation } from '../../redux/features/books/booksSlice';

// How many px the user must swipe horizontally to trigger a page turn
const SWIPE_THRESHOLD = 50;
// How many px of vertical drift is still considered a horizontal swipe
const SWIPE_MAX_VERT = 80;

const EpubReader = ({ bookUrl, bookId, bookTitle = 'Book', props }) => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  const webRef = useRef(null);

  // Book state
  const [savedLocation, setSavedLocation] = useState(null);
  const [epubBase64, setEpubBase64] = useState(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  // Reader UI state
  const [progress, setProgress] = useState(0);
  const [fontSize, setFontSize] = useState(100);
  const [theme, setTheme] = useState('light');
  const [toolbarVisible, setToolbarVisible] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

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
            if (!existing.includes(newBookmark)) {
              const updated = [...existing, newBookmark];

              await AsyncStorage.setItem(
                `bookmarks_${bookId}`,
                JSON.stringify(updated),
              );
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
  const handleAddBookmark = () => {
    sendMessage({ type: 'GET_CURRENT_LOCATION' });
  };

  const goToBookmark = cfi => {
    sendMessage({
      type: 'GO_TO_LOCATION',
      location: cfi,
    });
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
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 8,
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
          if (dx < 0) goNext();
          else goPrev();
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
      <View style={styles.gestureOverlay} {...panResponder.panHandlers} />

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

      {/* ── Toolbar (top + bottom) — fades in on center tap ── */}
      {toolbarVisible && (
        <Animated.View
          style={[styles.toolbarWrapper, { opacity: toolbarOpacity }]}
        >
          {/* Top bar */}
          <SafeAreaView
            style={[styles.topBar, { backgroundColor: THEMES[theme].barBg }]}
          >
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              style={styles.barBtn}
              hitSlop={HIT}
            >
              <Ionicons name="close" size={22} color={THEMES[theme].barText} />
            </TouchableOpacity>
            <Text
              style={[styles.barTitle, { color: THEMES[theme].barText }]}
              numberOfLines={1}
            >
              {bookTitle}
            </Text>
            <TouchableOpacity onPress={handleAddBookmark} style={styles.barBtn}>
              <Ionicons name="bookmark-outline" size={20} />
            </TouchableOpacity>
            <Text
              style={[styles.barProgress, { color: THEMES[theme].barMuted }]}
            >
              {progress}%
            </Text>
          </SafeAreaView>

          {/* Bottom bar */}
          <SafeAreaView
            style={[styles.bottomBar, { backgroundColor: THEMES[theme].barBg }]}
          >
            {/* Font size */}
            <TouchableOpacity
              onPress={() => changeFontSize(-10)}
              style={styles.barBtn}
              hitSlop={HIT}
            >
              <Text
                style={[styles.fontBtnSm, { color: THEMES[theme].barText }]}
              >
                A
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => changeFontSize(10)}
              style={styles.barBtn}
              hitSlop={HIT}
            >
              <Text
                style={[styles.fontBtnLg, { color: THEMES[theme].barText }]}
              >
                A
              </Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.barDivider} />

            {/* Theme swatches */}
            {Object?.entries(THEMES)?.map(([key, t]) => (
              <TouchableOpacity
                key={key}
                onPress={() => setTheme(key)}
                style={[
                  styles.themeSwatch,
                  {
                    backgroundColor: t.background,
                    borderColor:
                      theme === key ? THEMES[theme].accent : 'transparent',
                  },
                ]}
                hitSlop={HIT}
              >
                <Text style={{ fontSize: 10, color: t.fg }}>Aa</Text>
              </TouchableOpacity>
            ))}
          </SafeAreaView>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

export default EpubReader;

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
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/epubjs@0.3.93/dist/epub.min.js"><\/script>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    html, body {
      height: 100%; width: 100%;
      overflow: hidden;
      background: var(--bg, #ffffff);
      /* Prevent iOS rubber-band scroll bleeding through */
      position: fixed;
      top: 0; left: 0;
    }
    #viewer { height: 100%; width: 100%; }
    /* Ensure epub.js iframe fills its slot */
    #viewer iframe { border: none !important; }
  </style>
</head>
<body>
  <div id="viewer"></div>
  <script>
    var book           = null;
    var rendition      = null;
    var currentFontSize = 100;
    var currentTheme   = 'light';
    var locationsReady = false;

    var THEMES = {
      light: { background: '#ffffff', color: '#1a1a1a' },
      sepia: { background: '#f3e9d2', color: '#3b2e1a' },
      dark:  { background: '#1a1a1a', color: '#d8d4cc' },
    };

    /* ── Forward errors to RN ── */
    window.onerror = function(msg, src, line) {
      rn('ERROR', { message: msg + ' (line ' + line + ')' });
      return false;
    };

    /* ── Message bridge ── */
    function receiveMessage(event) {
      try {
        var data = JSON.parse(event.data);
        switch(data.type) {
          case 'LOAD_BOOK':     loadBook(data.base64, data.location); break;
          case 'NEXT_PAGE':     if(rendition) rendition.next();       break;
          case 'PREV_PAGE':     if(rendition) rendition.prev();       break;
          case 'SET_FONT_SIZE': setFontSize(data.size);               break;
          case 'SET_THEME':     applyTheme(data.theme);               break;
          case 'GET_CURRENT_LOCATION':    
            if (rendition) {
              var loc = rendition.currentLocation();
              if (loc && loc.start && loc.start.cfi) {
                rn('BOOKMARK', {
                  location: loc.start.cfi
                });
              }
            }
          break;
          case 'GO_TO_LOCATION': if (rendition) rendition.display(data.location); break;
        }
      } catch(e) {}
    }
    window.addEventListener('message', receiveMessage);
    document.addEventListener('message', receiveMessage);

    /* ── Post to React Native ── */
    function rn(type, payload) {
      try {
        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
          JSON.stringify(Object.assign({ type: type }, payload || {}))
        );
      } catch(e) {}
    }

    /* ── Load book from base64 ArrayBuffer ── */
    function loadBook(base64, location) {
      if (!base64) return;

      /* Convert base64 → ArrayBuffer */
      var binary = atob(base64);
      var bytes  = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);

      book = ePub(bytes.buffer);

      rendition = book.renderTo('viewer', {
        width:  window.innerWidth,
        height: window.innerHeight,
        spread: 'none',
        allowScriptedContent: true,
      });

      /* Display the book immediately — don't block on location generation */
      rendition.display(location || undefined)
        .then(function() {
          applyTheme(currentTheme);
          rendition.themes.fontSize(currentFontSize + '%');

          /* Report page turns back to RN */
          rendition.on('relocated', function(loc) {
            var progress = 0;
            if (locationsReady) {
              try { progress = Math.floor(book.locations.percentageFromCfi(loc.start.cfi) * 100); } catch(e) {}
            }
            rn('PROGRESS', {
              progress: progress,
              location: loc.start.cfi,
              isAtStart: !!loc.atStart,
              isAtEnd:   !!loc.atEnd,
            });
          });

          /* Generate locations in background — progress bar fills in after */
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

    /* ── Font size ── */
    function setFontSize(size) {
      currentFontSize = size;
      if (rendition) rendition.themes.fontSize(size + '%');
    }

    /* ── Theme ── */
    function applyTheme(name) {
      currentTheme = name;
      var t = THEMES[name] || THEMES.light;
      document.body.style.background = t.background;
      document.documentElement.style.setProperty('--bg', t.background);
      if (rendition) {
        rendition.themes.override('background', t.background);
        rendition.themes.override('color',      t.color);
        /* Re-inject into the iframe on next render */
        rendition.views().forEach(function(view) {
          try {
            var doc = view.document;
            if (!doc) return;
            var s = doc.getElementById('__theme__');
            if (!s) { s = doc.createElement('style'); s.id = '__theme__'; (doc.head||doc.body).appendChild(s); }
            s.textContent = 'body,p,div,span { background:' + t.background + ' !important; color:' + t.color + ' !important; }';
          } catch(e) {}
        });
      }
    }

    /* ── Resize handler (orientation change) ── */
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
    backgroundColor: 'rgba(255,0,0,0.05)',
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
  barBtn: { padding: 4 },
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
});
