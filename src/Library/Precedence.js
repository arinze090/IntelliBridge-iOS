export const appointmentTextPrecedence = propss => {
  const textPreference =
    propss?.status == 'request'
      ? 'Pending'
      : propss?.status == 'scheduled'
      ? 'Accepted'
      : 'Declined';

  return textPreference;
};

export const orderDetailsTextPrecedence = propss => {
  const textPreference = propss?.is_refunded
    ? 'Refunded'
    : propss?.is_cancelled
    ? 'Cancelled'
    : propss?.is_completed
    ? 'Completed'
    : 'In Progress';

  return textPreference;
};

export const isProfileComplete = userProfile => {
  console.log('isProfileComplete', userProfile);
  if (!userProfile) {
    return false;
  }

  const Address = userProfile?.address;
  const EmploymentStatus = userProfile?.employmentStatus;
  const University = userProfile?.university;
  const PhoneNumber = userProfile?.phone_number;
  const Occupation = userProfile?.occupation;
  const Degree = userProfile?.degree;

  // Check if every field has a truthy value
  return (
    Boolean(EmploymentStatus) &&
    Boolean(University) &&
    Boolean(PhoneNumber) &&
    Boolean(Occupation) &&
    Boolean(Degree) &&
    Boolean(Address)
  );
};
