/**
 * Seed script — populates DB with sample data and admin user.
 * Usage: node server/utils/seedData.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Destination = require('../models/Destination');
const Hotel = require('../models/Hotel');

const destinations = [
  {
    name: 'Goa', country: 'India', state: 'Goa', type: 'Beach',
    description: 'Sun-kissed shores, vibrant nightlife, Portuguese heritage and fresh seafood.',
    shortDesc: 'Golden beaches & Portuguese charm',
    highlights: ['Baga Beach','Dudhsagar Falls','Old Goa Churches','Anjuna Flea Market'],
    bestTimeToVisit: ['October','November','December','January'],
    isTrending: true, isFeatured: true,
    avgBudgetPerDay: { budget: 1500, midRange: 3500, luxury: 10000 },
    location: { type: 'Point', coordinates: [73.8278, 15.2993] },
  },
  {
    name: 'Rajasthan', country: 'India', type: 'Cultural',
    description: 'Majestic forts, golden deserts, vibrant culture and royal palaces.',
    shortDesc: 'Royal forts & desert safaris',
    highlights: ['Jaipur Pink City','Jodhpur Blue City','Jaisalmer Desert','Udaipur Lake Palace'],
    bestTimeToVisit: ['October','November','December','January'],
    isTrending: true, isFeatured: true,
    avgBudgetPerDay: { budget: 1800, midRange: 4000, luxury: 15000 },
    location: { type: 'Point', coordinates: [74.2179, 27.0238] },
  },
  {
    name: 'Ladakh', country: 'India', type: 'Mountain',
    description: 'High-altitude desert landscapes, Buddhist monasteries and pristine lakes.',
    shortDesc: 'Adventure, monasteries & lakes',
    highlights: ['Pangong Lake','Nubra Valley','Khardung La Pass','Hemis Monastery'],
    bestTimeToVisit: ['June','July','August','September'],
    isTrending: true,
    avgBudgetPerDay: { budget: 2500, midRange: 5000, luxury: 15000 },
    location: { type: 'Point', coordinates: [77.5770, 34.1526] },
  },
  {
    name: 'Kerala', country: 'India', type: 'Beach',
    description: 'Serene backwaters, lush spice plantations, Ayurvedic retreats and pristine beaches.',
    shortDesc: 'Backwaters, spices & Ayurveda',
    highlights: ['Alleppey Backwaters','Munnar Tea Gardens','Periyar Wildlife','Kovalam Beach'],
    bestTimeToVisit: ['September','October','November','December'],
    isTrending: true,
    avgBudgetPerDay: { budget: 2000, midRange: 4500, luxury: 12000 },
    location: { type: 'Point', coordinates: [76.2711, 10.8505] },
  },
  {
    name: 'Maldives', country: 'Maldives', type: 'Luxury',
    description: 'Crystal-clear lagoons, pristine beaches and luxurious overwater bungalows.',
    shortDesc: 'Overwater villas & coral reefs',
    highlights: ['Overwater Bungalows','Snorkelling','Sunset Cruises','Reef Diving'],
    bestTimeToVisit: ['November','December','January','February'],
    isFeatured: true,
    avgBudgetPerDay: { budget: 8000, midRange: 20000, luxury: 60000 },
    location: { type: 'Point', coordinates: [73.2207, 3.2028] },
  },
  {
    name: 'Bali', country: 'Indonesia', type: 'Adventure',
    description: 'Sacred temples, terraced rice paddies, world-class surf and thriving arts scene.',
    shortDesc: 'Sacred temples & surf culture',
    highlights: ['Ubud Rice Terraces','Tanah Lot Temple','Seminyak Beach','Mount Batur Trek'],
    bestTimeToVisit: ['April','May','June','July'],
    isTrending: true,
    avgBudgetPerDay: { budget: 3000, midRange: 8000, luxury: 25000 },
    location: { type: 'Point', coordinates: [115.1889, -8.4095] },
  },
];

const seedDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Promise.all([User.deleteMany({}), Destination.deleteMany({}), Hotel.deleteMany({})]);
  console.log('Cleared existing data');

  await User.create({ name: 'Admin User', email: 'admin@explorex.com', password: 'Admin@123', role: 'admin' });
  await User.create({ name: 'Priya Sharma', email: 'priya@example.com', password: 'User@123' });

  const dests = await Destination.insertMany(destinations);
  console.log(`Created ${dests.length} destinations`);

  const hotels = [
    { name: 'The Taj Mahal Palace', destination: dests[1]._id, address: 'Apollo Bunder, Mumbai', category: 'Luxury', starRating: 5, description: 'Iconic luxury hotel since 1903 overlooking the Gateway of India.', shortDesc: 'Icon of Indian hospitality', pricePerNight: { min: 24500, max: 85000 }, roomTypes: [{ name: 'Deluxe Room', price: 24500, maxGuests: 2, available: true }, { name: 'Harbour Suite', price: 55000, maxGuests: 2, available: true }], amenities: ['Pool','Spa','Fine Dining','Butler Service','Valet'], isFeatured: true, location: { type: 'Point', coordinates: [72.8347, 18.9220] } },
    { name: 'Oberoi Rajvilas', destination: dests[1]._id, address: 'Goner Road, Jaipur', category: 'Heritage', starRating: 5, description: 'Luxury heritage hotel set in 32 acres of landscaped gardens.', shortDesc: 'Heritage palace in Jaipur gardens', pricePerNight: { min: 32000, max: 95000 }, roomTypes: [{ name: 'Luxury Tent', price: 32000, maxGuests: 2, available: true }], amenities: ['Private Pool','Spa','Yoga','Horse Riding','Desert Safari'], isFeatured: true, location: { type: 'Point', coordinates: [75.8577, 26.9124] } },
    { name: 'Kumarakom Lake Resort', destination: dests[3]._id, address: 'Kumarakom, Kerala', category: 'Resort', starRating: 5, description: 'Heritage resort on Vembanad Lake with traditional Kerala architecture and Ayurveda.', shortDesc: 'Backwater heritage with Ayurveda', pricePerNight: { min: 14000, max: 45000 }, roomTypes: [{ name: 'Heritage Bungalow', price: 14000, maxGuests: 2, available: true }], amenities: ['Infinity Pool','Ayurveda Spa','Backwater Cruise','Yoga','Fishing'], location: { type: 'Point', coordinates: [76.4335, 9.6199] } },
  ];

  const createdHotels = await Hotel.insertMany(hotels);
  console.log(`Created ${createdHotels.length} hotels`);

  console.log('\nDatabase seeded!');
  console.log('Admin:  admin@explorex.com / Admin@123');
  console.log('User:   priya@example.com  / User@123');
  process.exit(0);
};

seedDB().catch((err) => { console.error(err); process.exit(1); });
