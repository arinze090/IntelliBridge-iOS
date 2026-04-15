export const RNToast = (Toast, text2) => {
  Toast.show({
    type: 'legacyBridgeToast',
    text2: text2,
  });
};

// Function to Obscure Email Using Asterisks
export const obscureEmail = emilString => {
  var splitEmail = emilString.split('@');
  var domain = splitEmail[1];
  var name = splitEmail[0];
  return name.substring(0, 3).concat('****@').concat(domain);
};

export const normalizeEmail = email => {
  return email?.trim().toLowerCase();
};

export const generateProductId = title => {
  return `com.intellibridge.book.${title
    ?.toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')}`;
};

export const getGreeting = () => {
  const currentHour = new Date().getHours();

  if (currentHour < 12) {
    return 'Good morning 🌅,';
  } else if (currentHour < 18) {
    return 'Good afternoon 🌤,';
  } else {
    return 'Good evening 🌑,';
  }
};

export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// BASE64 HELPER — chunk-based to avoid stack overflow on large books
export function uint8ArrayToBase64(bytes) {
  const CHUNK = 8192;
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK));
  }
  return btoa(binary);
}

export const formatCardNumber = text => {
  // Remove all spaces from the input
  const cleaned = text.replace(/\s+/g, '');

  // Add a space after every 4 digits
  const formatted = cleaned.replace(/(.{4})/g, '$1 ');

  return formatted.trim(); // Trim any trailing space
};

export const formatExpiryDate = text => {
  const cleaned = text.replace(/\D+/g, ''); // Remove non-digit characters
  if (cleaned.length > 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`; // Format as MM/YY
  }
  return cleaned;
};

export const isDateExpired = expiry => {
  const [month, year] = expiry.split('/');
  if (!month || !year) {
    return false;
  }

  const currentYear = new Date().getFullYear() % 100; // Last two digits of the current year
  const currentMonth = new Date().getMonth() + 1;

  // Convert year to full year format and check
  const expiryYear = parseInt(year, 10);
  const expiryMonth = parseInt(month, 10);

  return (
    expiryYear < currentYear ||
    (expiryYear === currentYear && expiryMonth < currentMonth)
  );
};

export function addDaysToDate() {
  // to get today's date
  const newDate = new Date();
  // this adds 1day to the selected date or today's date
  const addNewDate = newDate?.setDate(newDate?.getDate() + 1);
  // converts the date to a format
  const minimumDateToAdd = new Date(addNewDate);
  console.log('minimumDateToAdd2', minimumDateToAdd);

  return minimumDateToAdd;
}

export function getMaxSelectableDateFor17YearsOld() {
  const today = new Date();
  // Subtract 17 years from today's date
  const year = today.getFullYear() - 17;
  const month = today.getMonth();
  const day = today.getDate();

  return new Date(year, month, day);
}

export function formatToUSD(number) {
  const numeric = typeof number === 'string' ? parseFloat(number) : number;
  return numeric.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
}

export const formatToNaira = number => {
  const numeric = typeof number === 'string' ? parseFloat(number) : number;

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    // minimumFractionDigits: 0,
  }).format(numeric);
};

export function formatDateForBackend(dateString) {
  const date = new Date(dateString);

  // Extract parts of the date
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  // Format as YYYY-MM-DD HH:mm:ss
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export const setPriceTo2DecimalPlaces = price => {
  const numeric = typeof number === 'string' ? parseFloat(price) : price;

  const priceFigure = numeric?.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return priceFigure;
};

export function parsePriceRange(priceRangeString) {
  if (priceRangeString.startsWith('Under')) {
    const max = parseInt(priceRangeString.replace('Under $', ''), 10);
    return { min: 0, max: max };
  } else if (priceRangeString.includes('-')) {
    const [min, max] = priceRangeString
      .replace(/\$/g, '')
      .split(' - ')
      .map(Number);

    if (!isNaN(min) && !isNaN(max)) {
      return { min, max };
    }
  } else if (priceRangeString.endsWith('+')) {
    const min = parseInt(
      priceRangeString.replace('$', '').replace('+', ''),
      10,
    );
    if (!isNaN(min)) {
      return { min, max: 1000000 };
    }
  }

  // Return null for invalid formats
  return null;
}

export function parseExperienceRange(experienceRangeString) {
  // Handle "Under X years" case
  if (experienceRangeString.startsWith('Under')) {
    const max = parseInt(experienceRangeString.replace(/Under|\D/g, ''), 10);
    return { min: 0, max: max };
  }
  // Handle "X - Y years" case
  else if (experienceRangeString.includes('-')) {
    const [min, max] = experienceRangeString
      .replace(/\D/g, ' ')
      .trim()
      .split(/\s+/)
      .map(Number);

    if (!isNaN(min) && !isNaN(max)) {
      return { min, max };
    }
  } else if (experienceRangeString?.endsWith('+')) {
    const min = parseInt(experienceRangeString?.replace('+', ''), 10);
    if (!isNaN(min)) {
      return { min, max: 100 };
    }
  }

  return null;
}

export function formatDate(isoString) {
  const date = new Date(isoString);
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    // hour: "2-digit",
    // minute: "2-digit",
    // timeZoneName: "short",
  };
  return date.toLocaleDateString('en-US', options);
}

export function stripHtml(htmlString) {
  // Replace HTML tags with an empty string
  return htmlString?.replace(/<\/?[^>]+(>|$)/g, '');
}

export const generateTherapistAvailability = (
  moment,
  weeklyAvailability,
  weeksAhead = 52,
) => {
  const result = {};
  const today = moment();

  for (let i = 0; i < weeksAhead * 7; i++) {
    const currentDay = today.clone().add(i, 'days');
    const weekday = currentDay.format('dddd');

    if (weeklyAvailability[weekday]) {
      result[currentDay.format('YYYY-MM-DD')] = weeklyAvailability[weekday];
    }
  }

  return result;
};

export const convertTo12HourFormat = time24 => {
  const [hourStr, minute] = time24.split(':');
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';

  hour = hour % 12;
  hour = hour === 0 ? 12 : hour;

  return `${hour}:${minute} ${ampm}`;
};

export const timeAgo = timestamp => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now - past) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds === 1 ? '' : 's'} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? '' : 's'} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours === 1 ? '' : 's'} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays === 1 ? '' : 's'} ago`;
};

export const generateTimeSlots = (startTime, endTime) => {
  if (!startTime || !endTime) {
    return [];
  } // Ensure values exist

  const times = [];
  let start = parseInt(startTime.split(':')[0], 10); // Extract hour
  let end = parseInt(endTime.split(':')[0], 10);

  while (start <= end) {
    times.push(formatTime(start));
    start += 1; // Increment by 1 hour
  }

  return times;
};

const formatTime = hour => {
  const period = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${period}`;
};

export const extractTime = timeStr => {
  if (!timeStr) {
    return '';
  }

  return timeStr.replace(/\s?(AM|PM)/gi, '');
};

export const formatDateTime = isoString => {
  if (!isoString) {
    return '';
  }

  const date = new Date(isoString);

  const options = {
    month: 'long', // Full month name (e.g., "April")
    day: 'numeric', // Day of the month (e.g., "2")
    year: 'numeric', // Full year (e.g., "2025")
    hour: '2-digit', // Hour in 12-hour format
    minute: '2-digit', // Minutes with leading zero
    hour12: true, // Ensures 12-hour format with AM/PM
  };

  return date.toLocaleString('en-US', options);
};

export function getAge(birthdateString) {
  const today = new Date();
  const birthDate = new Date(birthdateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // Adjust if birthday hasn't occurred yet this year
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
}

export const capitalizeFirstLetter = text => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  return text?.charAt(0).toUpperCase() + text.slice(1);
};

export function normalizeGender(input) {
  if (!input || typeof input !== 'string') {
    return 'Other';
  }

  const formatted = input.trim().toLowerCase();

  if (
    // formatted.includes('man') ||
    formatted.includes('male') ||
    formatted === 'i identify as a man'
  ) {
    return 'Male';
  } else if (
    formatted.includes('woman') ||
    formatted.includes('female') ||
    formatted === 'i identify as a woman'
  ) {
    return 'Female';
  }

  return 'Other';
}

function formatDateMessage(dateString) {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1); // Calculate yesterday's date

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US');
  }
}

export function displayMessagesByDay(messages) {
  console.log('array', messages);
  // Create an object to group messages by day
  const messagesByDay = {};

  // Iterate through each message
  messages.forEach(message => {
    const dadaa = new Date(message.timestamp);
    // Get the date of the message (assuming message.date is a valid Date object)
    const messageDate = formatDateMessage(message.timestamp); // Convert to a string with the day

    // Check if a group for this day exists, and if not, create one
    if (!messagesByDay[messageDate]) {
      messagesByDay[messageDate] = [];
    }

    // Add the message to the corresponding day's group
    messagesByDay[messageDate].push(message);
  });

  // Convert the grouped messages to an array of objects with "day" and "messages" properties
  const messageGroups = Object.keys(messagesByDay).map(day => ({
    day,
    messages: messagesByDay[day],
  }));

  // Now you can render the messageGroups as needed in your UI
  return messageGroups;
}

export function convertTimestampToAmPm(timestamp) {
  const date = new Date(timestamp);

  const hours = date.getHours();
  const minutes = date.getMinutes();

  const amOrPm = hours >= 12 ? 'PM' : 'AM';

  const hoursIn12HourFormat = hours % 12 || 12;

  const formattedTime = `${hoursIn12HourFormat}:${
    minutes < 10 ? '0' : ''
  }${minutes} ${amOrPm}`;

  return formattedTime;
}

export const convertCmToFeetInches = cm => {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}.${inches}ft`;
};

export function prepareFlightSwitchData(groupedByPrice) {
  if (!groupedByPrice || groupedByPrice.length === 0) {
    return [];
  }

  // Sort prices ascending
  const sorted = [...groupedByPrice].sort(
    (a, b) => parseFloat(a.price) - parseFloat(b.price),
  );

  const cheapest = sorted[0];
  const fastest = sorted[sorted.length - 1];

  const result = [
    {
      ...cheapest,
      optionTitle: 'Cheapest',
      optionPrice: `$${parseFloat(cheapest.price).toFixed(2)}`,
    },
    {
      ...cheapest,
      optionTitle: 'Best',
      optionPrice: `$${parseFloat(cheapest.price).toFixed(2)}`,
    },
    {
      ...fastest,
      optionTitle: 'Fastest',
      optionPrice: `$${parseFloat(fastest.price).toFixed(2)}`,
    },
  ];

  return result;
}

export function groupIntoPriceTiers(groupedByPrice) {
  if (!groupedByPrice || groupedByPrice.length === 0) {
    return [];
  }

  // Step 1: Sort by price ascending
  const sorted = [...groupedByPrice].sort(
    (a, b) => parseFloat(a.price) - parseFloat(b.price),
  );

  const total = sorted.length;
  const tierSize = Math.ceil(total / 3); // For 3 groups

  const cheapestGroup = sorted.slice(0, tierSize).map(item => ({
    ...item,
    optionTitle: 'Cheapest',
    optionPrice: `$${parseFloat(item.price).toFixed(2)}`,
  }));

  const bestGroup = sorted.slice(tierSize, tierSize * 2).map(item => ({
    ...item,
    optionTitle: 'Best',
    optionPrice: `$${parseFloat(item.price).toFixed(2)}`,
  }));

  const fastestGroup = sorted.slice(tierSize * 2).map(item => ({
    ...item,
    optionTitle: 'Fastest',
    optionPrice: `$${parseFloat(item.price).toFixed(2)}`,
  }));

  // Combine all groups
  return [...cheapestGroup, ...bestGroup, ...fastestGroup];
}

export function groupFlightsIntoThreeCategories(groupedByPrice) {
  if (!groupedByPrice || groupedByPrice.length === 0) {
    return [];
  }

  const sorted = [...groupedByPrice]?.sort(
    (a, b) => parseFloat(a?.price) - parseFloat(b?.price),
  );

  const total = sorted.length;
  const tierSize = Math.ceil(total / 3);

  const cheapest = sorted.slice(0, tierSize);
  const best = sorted.slice(tierSize, tierSize * 2);
  const fastest = sorted.slice(tierSize * 2);

  const groups = [
    {
      optionTitle: 'Cheapest',
      group: cheapest,
    },
    {
      optionTitle: 'Best',
      group: best,
    },
    {
      optionTitle: 'Fastest',
      group: fastest,
    },
  ];

  // Filter out groups with no data or invalid price
  return groups
    .filter(g => g.group.length > 0 && !isNaN(parseFloat(g.group[0]?.price)))
    .map(g => ({
      optionTitle: g.optionTitle,
      optionPrice: `$${parseFloat(g.group[0]?.price).toFixed(2)}`,
      data: g.group.flatMap(item => item.data),
    }));
}

export const extractJustTime = dateTime => {
  if (!dateTime) {
    return '';
  }
  const time = new Date(dateTime)?.toTimeString()?.slice(0, 5);
  return time;
};

export const extractDuration = duration => {
  if (!duration) {
    return '';
  }
  const match = duration.match(/PT(\d+H)?(\d+M)?/);
  const hours = match[1] ? match[1].replace('H', 'h ') : '';
  const minutes = match[2] ? match[2].replace('M', 'm') : '';
  return `${hours}${minutes}`.trim();
};

export function extractCallingCode(formattedNumber, rawNumber) {
  if (!formattedNumber || !rawNumber) {
    return '';
  }

  // Remove "+" in case it's included in formatted number
  const formatted = formattedNumber?.replace('+', '');

  // Get the difference (prefix) between formatted and raw
  const callingCode = formatted.replace(rawNumber, '');

  return callingCode; // e.g., "213"
}

export const shuffleArray = arr => {
  return [...arr].sort(() => Math.random() - 0.5);
};

export function formatDateToBornLabel(dateString) {
  const date = new Date(dateString);

  if (isNaN(date)) {
    return 'Invalid date';
  }

  const options = { year: 'numeric', month: 'long', day: 'numeric' };

  return `Born ${date.toLocaleDateString('en-US', options)}`;
}
