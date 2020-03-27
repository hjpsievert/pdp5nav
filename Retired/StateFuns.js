import React, { useState }  from 'react';

const [emailVerified, setEmailVerified] = useState(false);
const [appActivated, setAppActivated] = useState(false);

export function getEmailVerified() {
  return emailVerified;
}

export function putEmailVerified(newVal) {
  setEmailVerified(newVal);
}

export function getAppActivated() {
  return appActivated;
}

export function putAppActivated(newVal) {
  setAppActivated(newVal);
}