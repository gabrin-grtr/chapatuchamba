/// <reference types="vite/client" />

import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import { FirebaseStorage } from 'firebase/storage';

declare global {
  interface Window {
    db?: Firestore;
    auth?: Auth;
    storage?: FirebaseStorage;
    __app_id?: string;
  }
}
