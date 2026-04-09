// EpubReader.jsx
// Android + iOS compatible epub reader
//
// Key fixes vs naive implementation:
//  1. Gestures handled INSIDE the WebView HTML (not RN PanResponder)
//     → avoids Android WebView touch event competition entirely
//  2. base64 conversion uses fetch+arrayBuffer instead of FileReader/Blob
//     → works reliably on Android Hermes engine
//  3. LOAD_BOOK is sent via a retry loop until WebView ACKs it
//     → fixes Android injectJavaScript timing issue
//  4. Theme injection uses rendition.themes + iframe style tag (no views() API)
//     → fixes epub.js 0.3.93 API mismatch
//  5. HTML uses overflow:hidden + position:absolute (no fixed) on body
//     → fixes Android WebView fixed-position quirks

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  StatusBar,
  Animated,
  SafeAreaView,
  Platform,
} from 'react-native';
import { WebView } from 'react-native-webview';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { uint8ArrayToBase64 } from '../../Library/Common';
import { windowWidth } from '../../utils/Dimensions';
import { THEMES, HIT } from '../../themes/bookReaderThemes';

const PubReader = ({ bookUrl, id, bookTitle = 'Book' }) => {
  const navigation = useNavigation();
  const webRef = useRef(null);

  // Book data
  const [epubBase64, setEpubBase64] = useState(null);
  const [savedLocation, setSavedLocation] = useState(null);
  const [isWebViewReady, setIsWebViewReady] = useState(false);

  // UI
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [theme, setThemeState] = useState('light');
  const [fontSize, setFontSize] = useState(100);
  const [toolbarVisible, setToolbarVisible] = useState(false);

  // Toolbar animation
  const toolbarAnim = useRef(new Animated.Value(0)).current;
  const toolbarTimer = useRef(null);
  const bookReadyRef = useRef(false); // has WebView ACKed the book?
  const retryTimer = useRef(null);
  const base64Ref = useRef(null); // keep a ref for the retry loop
  const locationRef = useRef(null);

  // FETCH EPUB — use arrayBuffer not Blob, works on Android Hermes
  useEffect(() => {
    if (!bookUrl) {
      setLoadError('No bookUrl provided');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await fetch(bookUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // arrayBuffer works reliably on Hermes; Blob+FileReader does not
        const buffer = await res.arrayBuffer();
        const bytes = new Uint8Array(buffer);

        // Convert to base64 in chunks to avoid stack overflow on large books
        const raw = uint8ArrayToBase64(bytes);

        // Load saved progress
        const saved = await AsyncStorage.getItem(`progress_${id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          setSavedLocation(parsed.location || null);
          locationRef.current = parsed.location || null;
        }

        base64Ref.current = raw;
        setEpubBase64(raw);
      } catch (e) {
        setLoadError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [bookUrl, id]);

  // SEND LOAD_BOOK — retry until WebView ACKs with BOOK_READY
  // Fixes Android injectJavaScript timing where the first call is dropped
  useEffect(() => {
    if (!isWebViewReady || !epubBase64) return;
    attemptLoadBook();
    return () => {
      if (retryTimer.current) clearTimeout(retryTimer.current);
    };
  }, [isWebViewReady, epubBase64]);

  const attemptLoadBook = useCallback(() => {
    if (bookReadyRef.current) return; // already loaded
    injectCommand({
      type: 'LOAD_BOOK',
      base64: base64Ref.current,
      location: locationRef.current,
    });
    // Retry after 800ms if no ACK received
    retryTimer.current = setTimeout(() => {
      if (!bookReadyRef.current) {
        console.log('[EpubReader] Retrying LOAD_BOOK…');
        attemptLoadBook();
      }
    }, 800);
  }, []);

  // BRIDGE — RN → WebView
  const injectCommand = useCallback(payload => {
    const json = JSON.stringify(payload);
    // Use a self-calling function to ensure it runs in the correct scope
    webRef.current?.injectJavaScript(
      `(function(){ try { window.__epubCommand(${JSON.stringify(
        json,
      )}); } catch(e){} })(); true;`,
    );
  }, []);

  // BRIDGE — WebView → RN
  const handleMessage = useCallback(
    async event => {
      let data;
      try {
        data = JSON.parse(event.nativeEvent.data);
      } catch (e) {
        console.error('[PubReader] handleMessage error:', e);
        return;
      }

      switch (data?.type) {
        case 'BOOK_READY':
          // WebView ACK — stop retry loop
          bookReadyRef.current = true;
          if (retryTimer.current) clearTimeout(retryTimer.current);
          break;

        case 'PROGRESS':
          setProgress(data?.progress || 0);
          await AsyncStorage.setItem(
            `progress_${id}`,
            JSON.stringify({
              progress: data?.progress || 0,
              location: data?.location || null,
            }),
          );
          break;

        case 'TOGGLE_TOOLBAR':
          toggleToolbar();
          break;

        case 'LOG':
          console.log('[WebView]', data.message);
          break;

        case 'ERROR':
          console.error('[WebView ERROR]', data.message);
          break;
      }
    },
    [id],
  );

  // TOOLBAR
  const showToolbar = useCallback(() => {
    if (toolbarTimer.current) clearTimeout(toolbarTimer.current);
    setToolbarVisible(true);
    Animated.timing(toolbarAnim, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
    toolbarTimer.current = setTimeout(hideToolbar, 4000);
  }, []);

  const hideToolbar = useCallback(() => {
    Animated.timing(toolbarAnim, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setToolbarVisible(false));
  }, []);

  const toggleToolbar = useCallback(() => {
    toolbarVisible ? hideToolbar() : showToolbar();
  }, [toolbarVisible]);

  // CONTROLS
  const goNext = useCallback(
    () => injectCommand({ type: 'NEXT_PAGE' }),
    [injectCommand],
  );
  const goPrev = useCallback(
    () => injectCommand({ type: 'PREV_PAGE' }),
    [injectCommand],
  );

  const applyTheme = useCallback(
    t => {
      setThemeState(t);
      injectCommand({ type: 'SET_THEME', theme: t });
    },
    [injectCommand],
  );

  const applyFontSize = useCallback(
    delta => {
      setFontSize(prev => {
        const next = Math.min(200, Math.max(60, prev + delta));
        injectCommand({ type: 'SET_FONT_SIZE', size: next });
        return next;
      });
    },
    [injectCommand],
  );

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
        <Text style={styles.errorTitle}>Could not open book</Text>
        <Text style={styles.errorMsg}>{loadError}</Text>
      </View>
    );
  }

  const t = THEMES[theme];

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>
      <StatusBar hidden />

      {/* Book renders here — gestures are handled INSIDE the HTML */}
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
        bounces={false}
        overScrollMode="never"
        // Critical for Android: prevents WebView intercepting all touches
        // before our in-HTML gesture handler can process them
        nestedScrollEnabled={false}
        source={{ html: getReaderHtml(), baseUrl: 'https://localhost' }}
        style={{ backgroundColor: t.bg }}
        onLoad={() => setIsWebViewReady(true)}
        onMessage={handleMessage}
        onShouldStartLoadWithRequest={() => true}
        // Android: keep WebView alive when screen re-renders
        androidLayerType="hardware"
      />

      {/* Progress bar */}
      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%`, backgroundColor: t.accent },
          ]}
        />
      </View>

      {/* Toolbar */}
      {toolbarVisible && (
        <Animated.View
          style={[styles.toolbarWrapper, { opacity: toolbarAnim }]}
          pointerEvents="box-none"
        >
          {/* Top */}
          <SafeAreaView style={[styles.topBar, { backgroundColor: t.barBg }]}>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
              hitSlop={HIT}
              style={styles.barBtn}
            >
              <Ionicons name="close" size={22} color={THEMES[theme].barText} />
            </TouchableOpacity>
            <Text
              style={[styles.barTitle, { color: t.text }]}
              numberOfLines={1}
            >
              {bookTitle}
            </Text>
            <Text style={[styles.progressLabel, { color: t.muted }]}>
              {progress}%
            </Text>
          </SafeAreaView>

          {/* Bottom */}
          <SafeAreaView
            style={[styles.bottomBar, { backgroundColor: t.barBg }]}
          >
            {/* Font controls */}
            <TouchableOpacity onPress={() => applyFontSize(-10)} hitSlop={HIT}>
              <Text style={[styles.fontA, { color: t.text, fontSize: 15 }]}>
                A
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => applyFontSize(10)} hitSlop={HIT}>
              <Text style={[styles.fontA, { color: t.text, fontSize: 22 }]}>
                A
              </Text>
            </TouchableOpacity>

            <View style={[styles.divider, { backgroundColor: t.muted }]} />

            {/* Theme swatches */}
            {Object?.entries(THEMES)?.map(([key, th]) => (
              <TouchableOpacity
                key={key}
                onPress={() => applyTheme(key)}
                hitSlop={HIT}
                style={[
                  styles.swatch,
                  { backgroundColor: th.bg },
                  theme === key && { borderColor: t.accent, borderWidth: 2 },
                ]}
              >
                <Text style={{ fontSize: 10, color: th.text }}>Aa</Text>
              </TouchableOpacity>
            ))}

            {/* Page arrows as fallback buttons */}
            <View style={[styles.divider, { backgroundColor: t.muted }]} />
            <TouchableOpacity onPress={goPrev} hitSlop={HIT}>
              <Text style={[styles.pageArrow, { color: t.text }]}>‹</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={goNext} hitSlop={HIT}>
              <Text style={[styles.pageArrow, { color: t.text }]}>›</Text>
            </TouchableOpacity>
          </SafeAreaView>
        </Animated.View>
      )}
    </View>
  );
};

export default PubReader;

// ─────────────────────────────────────────────────────────────────────────────
// WEBVIEW HTML
// Gestures are handled entirely in JS inside the WebView.
// This is the only reliable approach on Android — RN PanResponder
// loses the touch competition against the WebView on Android.
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
    * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
    html { height:100%; width:100%; }
    body {
      height:100%; width:100%;
      overflow:hidden;
      background:#ffffff;
      /* absolute instead of fixed — avoids Android WebView fixed-position bugs */
      position:absolute;
      top:0; left:0; right:0; bottom:0;
    }
    #viewer { position:absolute; top:0; left:0; right:0; bottom:0; }
    #viewer iframe { border:none !important; display:block; }
  </style>
</head>
<body>
  <div id="viewer"></div>
<script>
  /* ── State ─────────────────────────────────────────────────────── */
  var book           = null;
  var rendition      = null;
  var fontSize       = 100;
  var currentTheme   = 'light';
  var locationsReady = false;

  var THEMES = {
    light: { bg:'#ffffff', fg:'#1a1a1a' },
    sepia: { bg:'#f3e9d2', fg:'#3b2e1a' },
    dark:  { bg:'#1a1a1a', fg:'#d8d4cc' },
  };

  /* ── Post to React Native ───────────────────────────────────────── */
  function rn(type, payload) {
    try {
      window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
        JSON.stringify(Object.assign({ type: type }, payload || {}))
      );
    } catch(e) {}
  }

  /* ── Command handler (called by injectJavaScript from RN) ───────── */
  window.__epubCommand = function(json) {
    var cmd;
    try { cmd = JSON.parse(json); } catch(e) { return; }
    switch(cmd.type) {
      case 'LOAD_BOOK':     loadBook(cmd.base64, cmd.location); break;
      case 'NEXT_PAGE':     if(rendition) rendition.next();     break;
      case 'PREV_PAGE':     if(rendition) rendition.prev();     break;
      case 'SET_FONT_SIZE': setFontSize(cmd.size);              break;
      case 'SET_THEME':     applyTheme(cmd.theme);              break;
    }
  };

  /* Also support postMessage for older RN WebView versions */
  window.addEventListener('message', function(e) { window.__epubCommand(e.data); });
  document.addEventListener('message', function(e) { window.__epubCommand(e.data); });

  /* ── Gesture handling ───────────────────────────────────────────────
     All touch handling lives here in the WebView so Android doesn't
     compete for touches. We use document-level listeners so they fire
     even when epub.js creates child iframes.
  ─────────────────────────────────────────────────────────────────── */
  var touchStartX = 0;
  var touchStartY = 0;
  var touchStartT = 0;
  var SWIPE_MIN_X = 50;   /* min horizontal distance for a swipe */
  var SWIPE_MAX_Y = 80;   /* max vertical drift still counts as horiz swipe */
  var TAP_MAX_D   = 12;   /* max movement still counts as a tap */
  var TAP_MAX_MS  = 300;  /* max duration for a tap */

  function attachGestures(doc) {
    if (!doc) return;
    doc.addEventListener('touchstart', function(e) {
      var t = e.touches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      touchStartT = Date.now();
    }, { passive: true });

    doc.addEventListener('touchend', function(e) {
      var t    = e.changedTouches[0];
      var dx   = t.clientX - touchStartX;
      var dy   = t.clientY - touchStartY;
      var dt   = Date.now() - touchStartT;
      var adx  = Math.abs(dx);
      var ady  = Math.abs(dy);
      var sw   = doc.documentElement.clientWidth || window.innerWidth;

      var isSwipe = adx > SWIPE_MIN_X && ady < SWIPE_MAX_Y;
      var isTap   = adx < TAP_MAX_D && ady < TAP_MAX_D && dt < TAP_MAX_MS;

      if (isSwipe) {
        if (dx < 0) rendition && rendition.next();
        else         rendition && rendition.prev();
        return;
      }

      if (isTap) {
        var x = t.clientX;
        if      (x < sw * 0.25) { rendition && rendition.prev(); }
        else if (x > sw * 0.75) { rendition && rendition.next(); }
        else                     { rn('TOGGLE_TOOLBAR'); }
      }
    }, { passive: true });
  }

  /* Attach to main document */
  attachGestures(document);

  /* ── Load book ──────────────────────────────────────────────────── */
  function loadBook(base64, location) {
    if (!base64) { rn('ERROR', { message: 'No base64 data' }); return; }

    try {
      /* base64 → ArrayBuffer */
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

      /* ACK to RN immediately so retry loop stops */
      rn('BOOK_READY');

      rendition.display(location || undefined)
        .then(function() {
          applyTheme(currentTheme);
          rendition.themes.fontSize(fontSize + '%');

          /* Re-attach gestures inside the epub iframe after each chapter */
          rendition.on('rendered', function(section, view) {
            try { attachGestures(view.document); } catch(e) {}
            injectIframeTheme(view);
          });

          /* Progress reporting */
          rendition.on('relocated', function(loc) {
            var pct = 0;
            if (locationsReady) {
              try { pct = Math.floor(book.locations.percentageFromCfi(loc.start.cfi) * 100); } catch(e) {}
            }
            rn('PROGRESS', { progress: pct, location: loc.start.cfi });
          });

          /* Build location index in background */
          book.locations.generate(1000).then(function() {
            locationsReady = true;
            rn('LOG', { message: 'Locations ready' });
          });
        })
        .catch(function(err) {
          rn('ERROR', { message: 'display() failed: ' + (err && err.message ? err.message : String(err)) });
        });

      book.on('openFailed', function(err) {
        rn('ERROR', { message: 'openFailed: ' + err });
      });

    } catch(e) {
      rn('ERROR', { message: 'loadBook exception: ' + e.message });
    }
  }

  /* ── Theme ──────────────────────────────────────────────────────── */
  function applyTheme(name) {
    currentTheme = name;
    var t = THEMES[name] || THEMES.light;
    document.body.style.background = t.bg;

    if (!rendition) return;

    /* 1. Override epub.js theme variables */
    rendition.themes.override('background', t.bg);
    rendition.themes.override('color', t.fg);

    /* 2. Inject a <style> tag into every open iframe */
    try {
      rendition.manager.views._views.forEach(function(view) {
        injectIframeTheme(view);
      });
    } catch(e) {
      /* views() API varies by epub.js version — safe to ignore */
    }
  }

  function injectIframeTheme(view) {
    try {
      var t   = THEMES[currentTheme] || THEMES.light;
      var doc = view.document;
      if (!doc) return;
      var existing = doc.getElementById('__rn_theme__');
      if (!existing) {
        existing = doc.createElement('style');
        existing.id = '__rn_theme__';
        (doc.head || doc.documentElement).appendChild(existing);
      }
      existing.textContent = [
        'html,body{background:' + t.bg + '!important;color:' + t.fg + '!important;}',
        'p,div,span,li,td,h1,h2,h3,h4,h5,h6{color:' + t.fg + '!important;}',
      ].join('');
    } catch(e) {}
  }

  /* ── Font size ──────────────────────────────────────────────────── */
  function setFontSize(size) {
    fontSize = size;
    if (rendition) rendition.themes.fontSize(size + '%');
  }

  /* ── Orientation / resize ───────────────────────────────────────── */
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
  errorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#c00',
    textAlign: 'center',
  },
  errorMsg: { fontSize: 13, color: '#999', textAlign: 'center' },

  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: 'rgba(0,0,0,0.07)',
    zIndex: 4,
  },
  progressFill: { height: 2, borderRadius: 1 },

  toolbarWrapper: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: 'space-between',
  },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  barBtn: { padding: 4 },
  backIcon: { fontSize: 18 },
  barTitle: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
  },
  progressLabel: { fontSize: 16, minWidth: 36, textAlign: 'right' },

  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  fontA: {
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '400',
  },
  divider: { width: StyleSheet.hairlineWidth, height: 24, opacity: 0.4 },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pageArrow: { fontSize: 28, lineHeight: 32 },
});
