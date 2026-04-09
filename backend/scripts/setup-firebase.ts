/**
 * Firebase Setup Script
 * Run: npx ts-node scripts/setup-firebase.ts
 *
 * This seeds initial categories and service areas into Firestore.
 * Firebase Auth and Storage are configured via Firebase Console.
 */
import dotenv from 'dotenv';
dotenv.config();

import { db, Timestamp } from '../src/config/firebase';
import { v4 as uuidv4 } from 'uuid';

const defaultCategories = [
  { name: 'JCB', icon: 'construction' },
  { name: 'Excavator', icon: 'precision_manufacturing' },
  { name: 'Pokelane', icon: 'engineering' },
  { name: 'Crane', icon: 'crane' },
  { name: 'Bulldozer', icon: 'bulldozer' },
  { name: 'Roller', icon: 'roller' },
];

const defaultServiceAreas = [
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Bhopal', state: 'Madhya Pradesh' },
  { city: 'Mumbai', state: 'Maharashtra' },
  { city: 'Pune', state: 'Maharashtra' },
  { city: 'Delhi', state: 'Delhi' },
  { city: 'Bangalore', state: 'Karnataka' },
];

async function setup() {
  console.log('Setting up Firestore collections...\n');

  // Seed categories
  console.log('Creating categories...');
  for (const cat of defaultCategories) {
    const id = uuidv4();
    await db.collection('categories').doc(id).set({
      id,
      name: cat.name,
      icon: cat.icon,
      isActive: true,
      createdAt: Timestamp.now(),
    });
    console.log(`  + ${cat.name}`);
  }

  // Seed service areas
  console.log('\nCreating service areas...');
  for (const area of defaultServiceAreas) {
    const id = uuidv4();
    await db.collection('serviceAreas').doc(id).set({
      id,
      city: area.city,
      state: area.state,
      isActive: true,
      createdAt: Timestamp.now(),
    });
    console.log(`  + ${area.city}, ${area.state}`);
  }

  console.log('\nSetup complete!');
  console.log('\nNext steps:');
  console.log('1. Enable Phone Authentication in Firebase Console > Authentication > Sign-in method');
  console.log('2. Enable Cloud Storage in Firebase Console > Storage');
  console.log('3. Deploy Firestore security rules from firestore.rules');
  process.exit(0);
}

setup().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
