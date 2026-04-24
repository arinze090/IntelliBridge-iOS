import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  loading: false,
  books: [],
  lastAPIFetchTime: null,
  bookLocations: {}, // { [bookId]: { progress, location } }
  bookmarkedBooks: [],
  wishlistsBooks: [],
  boughtBooks: [],
  librarybooks: [],
  bookmarkBookPages: {},
};

const booksSlice = createSlice({
  name: 'books',
  initialState: initialState,
  reducers: {
    getBooks: (state, action) => {
      state.books = action.payload;
    },

    saveLoginTime: (state, action) => {
      state.lastLoginTime = action.payload;
    },
    setLoading: (state, action) => {
      state.loading =
        action.payload?.loading !== undefined
          ? action.payload?.loading
          : state.loading;
    },
    APILastFetchTime: (state, action) => {
      state.lastAPIFetchTime = action.payload;
    },
    setBookLocation: (state, action) => {
      const { bookId, progress, location, bookInfo } = action.payload;
      state.bookLocations[bookId] = { progress, location, bookInfo };
    },
    setClearAllBookLocations: (state, action) => {
      state.bookLocations = {};
    },
    saveBookmarkedBooks: (state, action) => {
      state.bookmarkedBooks = [...state.bookmarkedBooks, action.payload];
    },
    removeBookFromBookmarks: (state, action) => {
      const updatedSavedItems = state.bookmarkedBooks.filter(
        item => item._id !== action.payload._id,
      );

      state.bookmarkedBooks = updatedSavedItems;
    },
    saveWishlistBooks: (state, action) => {
      state.wishlistsBooks = [...state.wishlistsBooks, action.payload];
    },
    removeBookFromWishlist: (state, action) => {
      const updatedSavedItems = state.wishlistsBooks.filter(
        item => item._id !== action.payload._id,
      );

      state.wishlistsBooks = updatedSavedItems;
    },
    saveBoughtBooks: (state, action) => {
      state.boughtBooks = [...state.boughtBooks, action.payload];
    },
    clearBoughtBooks: (state, action) => {
      state.boughtBooks = [];
    },
    saveLibraryBooks: (state, action) => {
      state.librarybooks = action.payload;
    },
    addBookmarkBookPage: (state, action) => {
      const { bookId, location, text, page, bookInfo } = action.payload;

      if (!state.bookmarkBookPages[bookId]) {
        state.bookmarkBookPages[bookId] = {
          bookInfo,
          bookmarks: [
            {
              location,
              page,
              text: text || '',
              createdAt: Date.now(),
            },
          ],
        };
        return;
      }

      const book = state.bookmarkBookPages[bookId];

      // safety guard (important for old data)
      if (!Array.isArray(book.bookmarks)) {
        book.bookmarks = [];
      }

      const exists = book.bookmarks.some(b => b?.location === location);

      if (!exists) {
        book.bookmarks.push({
          location,
          page,
          text: text || '',
          createdAt: Date.now(),
        });
      }
    },
    removeBookmarkBookaPage: (state, action) => {
      const { bookId, location } = action.payload;

      const book = state.bookmarkBookPages[bookId];

      if (!book || !Array.isArray(book.bookmarks)) return;

      book.bookmarks = book.bookmarks.filter(b => b?.location !== location);
    },
  },
});

export const {
  getBooks,
  APILastFetchTime,
  saveLoginTime,
  setBookLocation,
  setClearAllBookLocations,
  saveBookmarkedBooks,
  removeBookFromBookmarks,
  saveWishlistBooks,
  removeBookFromWishlist,
  saveBoughtBooks,
  clearBoughtBooks,
  saveLibraryBooks,
  addBookmarkBookPage,
  removeBookmarkBookaPage,
} = booksSlice.actions;
export default booksSlice.reducer;
