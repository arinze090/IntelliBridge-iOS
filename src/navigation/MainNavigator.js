import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import AuthStack from './AuthNavigator';
import AppNavigation from './AppNavigator';

const MainNavigator = () => {
  const dispatch = useDispatch();
  const state = useSelector(state => state);

  const loggedInUser = state?.user?.user;
  console.log('logged', loggedInUser);

  if (loggedInUser) {
    return <AppNavigation />;
  } else {
    return <AuthStack />;
  }
};

export default MainNavigator;
