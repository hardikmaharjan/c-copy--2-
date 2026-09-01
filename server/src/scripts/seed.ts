import mongoose from 'mongoose';
import { env } from '../config/env.js';
import { Consultancy } from '../models/Consultancy.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

const consultancies = [
  {
    name: 'Horizon Education Nepal', city: 'Kathmandu', services: ['University applications', 'Visa guidance', 'IELTS support'], destinations: ['Australia', 'Canada', 'United Kingdom'], description: 'End-to-end counselling for students planning overseas study.', verificationStatus: 'verified', rating: 0, reviewCount: 0,
    contact: { phone: '+977-1-5550101', email: 'hello@horizonedu.example', website: 'https://horizonedu.example' }, documents: [{ name: 'Business registration', url: 'https://example.com/documents/horizon-registration.pdf' }]
  },
  {
    name: 'Pathway Abroad Services', city: 'Lalitpur', services: ['Course selection', 'SOP review', 'Visa applications'], destinations: ['Japan', 'Germany', 'United States'], description: 'Personalised support for university and visa applications.', verificationStatus: 'verified', rating: 0, reviewCount: 0,
    contact: { phone: '+977-1-5550102', email: 'contact@pathway.example', website: 'https://pathway.example' }
  },
  {
    name: 'Everest Global Consultants', city: 'Pokhara', services: ['University applications', 'Financial planning'], destinations: ['Canada', 'New Zealand'], description: 'A local consultancy focused on transparent financial and admissions guidance.', verificationStatus: 'pending', rating: 0, reviewCount: 0,
    contact: { phone: '+977-61-555103', email: 'info@everestglobal.example', website: 'https://everestglobal.example' }
  },
  {
    name: 'NextStep Study Hub', city: 'Chitwan', services: ['Visa guidance', 'Pre-departure orientation'], destinations: ['Australia', 'United Kingdom'], description: 'Practical support from first counselling session to departure.', verificationStatus: 'verified', rating: 0, reviewCount: 0,
    contact: { phone: '+977-56-555104', email: 'team@nextstep.example', website: 'https://nextstep.example' }
  },
  {
    name: 'Bright Future Education', city: 'Kathmandu', services: ['University applications', 'Scholarship assistance'], destinations: ['South Korea', 'Japan', 'Germany'], description: 'Scholarship and university application assistance for ambitious students.', verificationStatus: 'pending', rating: 0, reviewCount: 0,
    contact: { phone: '+977-1-5550105', email: 'hello@brightfuture.example', website: 'https://brightfuture.example' }
  }
];

async function seed() {
  await mongoose.connect(env.mongoUri);
  for (const consultancy of consultancies) {
    await Consultancy.updateOne({ name: consultancy.name }, { $set: consultancy }, { upsert: true });
  }
  const passwordHash = await bcrypt.hash('Admin123!', 12);
  await User.updateOne(
    { email: 'admin@safestudy.local' },
    { $set: { name: 'SafeStudy Admin', role: 'admin', verifiedAt: new Date(), passwordHash } },
    { upsert: true }
  );
  console.log(`Added or updated ${consultancies.length} dummy consultancies and one admin account.`);
  console.log('Admin login: admin@safestudy.local / Admin123!');
  await mongoose.disconnect();
}

seed().catch(async (error) => { console.error(error); await mongoose.disconnect(); process.exit(1); });
