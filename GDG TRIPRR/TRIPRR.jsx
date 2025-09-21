import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, _getDoc, setDoc, onSnapshot, collection, _query, _where, addDoc, _getDocs, _Timestamp, setLogLevel } from 'firebase/firestore';

// ---
// Global Firebase variables provided by the environment
// DO NOT MODIFY
const firebaseConfig = JSON.parse(typeof __firebase_config !== 'undefined' ? __firebase_config : '{}');
const __app_id = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const __initial_auth_token = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
// ---

const App = () => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [preferences, setPreferences] = useState({
    culturalHeritage: false,
    festivals: false,
    adventure: false,
    food: false,
    shopping: false
  });
  const [budget, setBudget] = useState('moderate');
  const [language, setLanguage] = useState('en');
  const [itinerary, setItinerary] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [offlineMode, setOfflineMode] = useState(false);
  const [weatherAlert, setWeatherAlert] = useState(null);
  const [crowdPrediction, setCrowdPrediction] = useState(null);
  const [loading, setLoading] = useState({ preferences: true, itinerary: true, group: true });
  const chatEndRef = useRef(null);
  const db = useRef(null);
  const auth = useRef(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ja', name: '日本語' }
  ];

  const budgetOptions = [
    { value: 'cheap', label: 'Budget Traveler', icon: '💰' },
    { value: 'moderate', label: 'Comfortable', icon: '💵' },
    { value: 'luxury', label: 'Luxury Experience', icon: '💎' }
  ];

  const preferenceOptions = [
    { key: 'culturalHeritage', label: 'Cultural Heritage', icon: '🏛️', color: 'bg-amber-500' },
    { key: 'festivals', label: 'Festivals & Events', icon: '🎪', color: 'bg-pink-500' },
    { key: 'adventure', label: 'Adventure & Outdoors', icon: '⛰️', color: 'bg-green-500' },
    { key: 'food', label: 'Food & Cuisine', icon: '🍜', color: 'bg-orange-500' },
    { key: 'shopping', label: 'Shopping', icon: '🛍️', color: 'bg-purple-500' }
  ];

  // Initialize Firebase and set up listeners
  useEffect(() => {
    try {
      if (Object.keys(firebaseConfig).length > 0) {
        const app = initializeApp(firebaseConfig);
        db.current = getFirestore(app);
        auth.current = getAuth(app);
        setLogLevel('debug');

        onAuthStateChanged(auth.current, async (currentUser) => {
          if (currentUser) {
            setUser(currentUser);
            if (__initial_auth_token) {
              await signInWithCustomToken(auth.current, __initial_auth_token);
            }
          } else {
            await signInAnonymously(auth.current);
          }
          setAuthReady(true);
        });
      } else {
        console.error("Firebase config is missing.");
      }
    } catch (error) {
      console.error("Firebase initialization failed:", error);
    }
  }, []);

  // Set up Firestore listeners after authentication is ready
  useEffect(() => {
    if (!authReady || !db.current || !user) return;
    
    // Listen to user preferences
    const preferencesDocRef = doc(db.current, `artifacts/${__app_id}/users/${user.uid}/data/preferences`);
    const preferencesUnsub = onSnapshot(preferencesDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPreferences(data.preferences || preferences);
        setBudget(data.budget || budget);
      }
      setLoading(prev => ({ ...prev, preferences: false }));
    });

    // Listen to itineraries
    const itineraryCollectionRef = collection(db.current, `artifacts/${__app_id}/users/${user.uid}/data/itineraries`);
    const itineraryUnsub = onSnapshot(itineraryCollectionRef, (snapshot) => {
        const itineraries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        if (itineraries.length > 0) {
            setItinerary(itineraries[itineraries.length - 1].itinerary);
        }
        setLoading(prev => ({ ...prev, itinerary: false }));
    });

    // Listen to group members
    const groupCollectionRef = collection(db.current, `artifacts/${__app_id}/public/data/group-members`);
    const groupUnsub = onSnapshot(groupCollectionRef, (snapshot) => {
      const members = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setGroupMembers(members);
      setLoading(prev => ({ ...prev, group: false }));
    });

    return () => {
      preferencesUnsub();
      itineraryUnsub();
      groupUnsub();
    };
  }, [authReady, user]);

  useEffect(() => {
    // Scroll chat to bottom when messages change
    if (chatEndRef.current) {
        chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  const handlePreferenceChange = async (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key]
    };
    setPreferences(newPreferences);

    if (user && db.current) {
      const userDocRef = doc(db.current, `artifacts/${__app_id}/users/${user.uid}/data/preferences`);
      await setDoc(userDocRef, { preferences: newPreferences, budget });
    }
  };

  const handleBudgetChange = async (newBudget) => {
    setBudget(newBudget);
    if (user && db.current) {
      const userDocRef = doc(db.current, `artifacts/${__app_id}/users/${user.uid}/data/preferences`);
      await setDoc(userDocRef, { preferences, budget: newBudget });
    }
  };

  const handleGenerateItinerary = async () => {
    if (!user || !db.current) {
      console.error("User not authenticated or database not ready.");
      return;
    }
    setActiveTab('itinerary');
    console.log("Generating itinerary for user:", user.uid);

    try {
      const response = await fetch(`/api/itinerary/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences, budget }),
      });
      const data = await response.json();
      if (data.success) {
        console.log("Itinerary generated:", data.data);
      } else {
        console.error("Failed to generate itinerary:", data.message);
      }
    } catch (error) {
      console.error("API call failed:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !user) return;
    
    const userMessage = { id: Date.now(), text: chatInput, sender: 'user' };
    setChatMessages(prev => [...prev, userMessage]);
    const messageToSend = chatInput;
    setChatInput('');

    try {
        const response = await fetch(`/api/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: messageToSend })
        });
        const data = await response.json();

        if (data.success) {
            const aiMessage = {
                id: Date.now() + 1,
                text: data.data.text,
                sender: 'ai'
            };
            setChatMessages(prev => [...prev, aiMessage]);
        } else {
            console.error("AI chat response failed:", data.message);
            const errorMessage = { id: Date.now() + 1, text: "Sorry, I couldn't get a response. Please try again.", sender: 'ai' };
            setChatMessages(prev => [...prev, errorMessage]);
        }
    } catch (error) {
        console.error("API call failed:", error);
        const errorMessage = { id: Date.now() + 1, text: "Sorry, I couldn't connect to the server. Please try again.", sender: 'ai' };
        setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const addGroupMember = async () => {
    if (!user || !db.current) return;
    const newMember = {
        name: `Traveler ${groupMembers.length + 1}`,
        preferences: preferences,
    };
    try {
        const groupCollectionRef = collection(db.current, `artifacts/${__app_id}/public/data/group-members`);
        await addDoc(groupCollectionRef, newMember);
        console.log("Group member added successfully.");
    } catch (error) {
        console.error("Failed to add group member:", error);
    }
  };
  
  const downloadItinerary = () => {
    // In a real app, this would generate and download a PDF/JSON file
    console.log('Downloading itinerary...');
  };
  
  const toggleOfflineMode = () => {
    setOfflineMode(!offlineMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-800">TripAI Planner</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>{lang.name}</option>
                ))}
              </select>
              
              <button
                onClick={toggleOfflineMode}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  offlineMode 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {offlineMode ? 'Offline Mode' : 'Go Offline'}
              </button>
              
              {user ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                    {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="font-medium text-gray-700">Signed In</span>
                </div>
              ) : (
                <div className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg">
                  Signing In...
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'home', label: 'Home', icon: '🏠' },
              { id: 'preferences', label: 'Preferences', icon: '🎯' },
              { id: 'itinerary', label: 'Itinerary', icon: '📅' },
              { id: 'map', label: 'Map', icon: '🗺️' },
              { id: 'chat', label: 'AI Companion', icon: '🤖' },
              { id: 'group', label: 'Group Trip', icon: '👥' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Weather Alert Banner */}
        {weatherAlert && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
            <div className="text-yellow-600 mr-3">🌧️</div>
            <div>
              <h3 className="font-semibold text-yellow-800">Weather Alert</h3>
              <p className="text-yellow-700">{weatherAlert.message}</p>
            </div>
          </div>
        )}

        {/* Crowd Prediction Banner */}
        {crowdPrediction && (
          <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-lg flex items-center">
            <div className="text-purple-600 mr-3">👥</div>
            <div>
              <h3 className="font-semibold text-purple-800">Crowd Prediction</h3>
              <p className="text-purple-700">
                {crowdPrediction.location}: {crowdPrediction.level} - {crowdPrediction.suggestion}
              </p>
            </div>
          </div>
        )}

        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Your AI-Powered Trip Planner</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Let our intelligent system create the perfect personalized itinerary based on your preferences, 
                budget, and real-time conditions.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold mb-2">Personalized Recommendations</h3>
                <p className="text-gray-600">Tell us your interests and we'll craft the perfect trip just for you.</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold mb-2">Multi-Lingual Support</h3>
                <p className="text-gray-600">Get recommendations and navigate in your preferred language.</p>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-semibold mb-2">AI Travel Companion</h3>
                <p className="text-gray-600">Ask questions anytime and get real-time recommendations.</p>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={() => setActiveTab('preferences')}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105"
              >
                Start Planning Your Trip
              </button>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Set Your Travel Preferences</h2>
              <p className="text-gray-600 mb-8">Select what interests you most for a personalized experience</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {preferenceOptions.map(pref => (
                <div
                  key={pref.key}
                  onClick={() => handlePreferenceChange(pref.key)}
                  className={`p-6 rounded-xl cursor-pointer transition-all transform hover:scale-105 ${
                    preferences[pref.key]
                      ? `${pref.color} text-white shadow-lg`
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-3">{pref.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{pref.label}</h3>
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    preferences[pref.key] ? 'bg-white border-white' : 'border-gray-400'
                  }`}>
                    {preferences[pref.key] && <div className="w-full h-full rounded-full bg-white"></div>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Budget Preference</h3>
              <div className="grid md:grid-cols-3 gap-4">
                {budgetOptions.map(option => (
                  <div
                    key={option.value}
                    onClick={() => handleBudgetChange(option.value)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                      budget === option.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{option.icon}</div>
                    <h4 className="font-semibold">{option.label}</h4>
                    {budget === option.value && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full mt-2"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-8">
              <button
                onClick={handleGenerateItinerary}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold text-lg hover:from-green-600 hover:to-blue-600 transition-all transform hover:scale-105"
              >
                Generate My Personalized Itinerary
              </button>
            </div>
          </div>
        )}

        {/* Itinerary Tab */}
        {activeTab === 'itinerary' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-800">Your Personalized Itinerary</h2>
              <button
                onClick={downloadItinerary}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors flex items-center space-x-2"
              >
                <span>📥</span>
                <span>Download for Offline</span>
              </button>
            </div>

            {loading.itinerary ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-r-transparent mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">Generating Itinerary...</h3>
                    <p className="text-gray-500">This may take a moment. We're crafting the perfect plan for you!</p>
                </div>
            ) : itinerary.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No itinerary yet</h3>
                <p className="text-gray-500">Set your preferences and generate your personalized trip plan.</p>
                <button
                  onClick={() => setActiveTab('preferences')}
                  className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Set Preferences
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {itinerary.map((dayPlan, index) => (
                    <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Day {dayPlan.day}</h3>
                        <div className="space-y-4">
                            {dayPlan.activities.map((item, activityIndex) => (
                                <div key={activityIndex} className="bg-white rounded-xl p-4 border border-gray-200">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <div className="flex items-center space-x-3 mb-1">
                                                <span className="text-lg font-bold text-blue-600">{item.time}</span>
                                                <h4 className="text-lg font-semibold text-gray-800">{item.activity}</h4>
                                            </div>
                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                <span>🕒 {item.duration}</span>
                                                <span>💰 {item.cost}</span>
                                                <span>👥 Crowd: {item.crowdLevel}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
              </div>
            )}

            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Eco-Friendly Travel Stats</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">85%</div>
                  <div className="text-sm text-gray-600">Public Transport</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">12kg</div>
                  <div className="text-sm text-gray-600">CO2 Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">3</div>
                  <div className="text-sm text-gray-600">Eco Hotels</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Tab */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Interactive Map</h2>
            
            <div className="bg-gray-200 rounded-xl h-96 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">Interactive Map Integration</h3>
                <p className="text-gray-500">This would display OpenStreetMap/Mapbox with your itinerary locations</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">📍 Current Location</h3>
                <p className="text-gray-600">Paris, France</p>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Latitude:</span>
                    <span className="font-mono">48.8566° N</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Longitude:</span>
                    <span className="font-mono">2.3522° E</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">🧭 Nearby Points of Interest</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="mr-2">🏛️</span>
                      <span>Louvre Museum</span>
                    </span>
                    <span className="text-sm text-gray-500">0.8 km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="mr-2">🗼</span>
                      <span>Eiffel Tower</span>
                    </span>
                    <span className="text-sm text-gray-500">3.2 km</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="mr-2">🍽️</span>
                      <span>Le Marais District</span>
                    </span>
                    <span className="text-sm text-gray-500">1.1 km</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">公共交通路线 Public Transport Routes</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <div className="font-medium">Metro Line 1</div>
                    <div className="text-sm text-gray-600">Louvre → Champs-Élysées (15 min)</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <div className="font-medium">Bus 69</div>
                    <div className="text-sm text-gray-600">Eiffel Tower → Musée d'Orsay (25 min)</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <div className="font-medium">RER C</div>
                    <div className="text-sm text-gray-600">Saint-Michel → Versailles (45 min)</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Chat Companion Tab */}
        {activeTab === 'chat' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">AI Travel Companion</h2>
            
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
                <h3 className="font-semibold flex items-center">
                  <span className="mr-2">🤖</span>
                  Ask me anything about your trip!
                </h3>
              </div>
              
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {chatMessages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              
              <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me anything... e.g., 'Where should I eat now?'"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </form>
            </div>
            
            <div className="grid md:grid-cols-3 gap-4">
              <button
                onClick={() => setChatInput("What's the nearest pharmacy?")}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
              >
                <div className="font-medium">💊 What's the nearest pharmacy?</div>
                <div className="text-sm text-gray-600 mt-1">Find medical services nearby</div>
              </button>
              
              <button
                onClick={() => setChatInput("Where should I eat now?")}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
              >
                <div className="font-medium">🍽️ Where should I eat now?</div>
                <div className="text-sm text-gray-600 mt-1">Get restaurant recommendations</div>
              </button>
              
              <button
                onClick={() => setChatInput("What's happening today?")}
                className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all text-left"
              >
                <div className="font-medium">🎉 What's happening today?</div>
                <div className="text-sm text-gray-600 mt-1">Discover local events & festivals</div>
              </button>
            </div>
          </div>
        )}

        {/* Group Trip Tab */}
        {activeTab === 'group' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Group Trip Optimization</h2>
              <p className="text-gray-600">Plan the perfect trip that satisfies everyone in your group</p>
            </div>
            
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">Group Members</h3>
                <button
                  onClick={addGroupMember}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
                >
                  <span>➕</span>
                  <span>Add Member</span>
                </button>
              </div>
              
              {loading.group ? (
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-r-transparent mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading group members...</p>
                </div>
              ) : groupMembers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">👥</div>
                  <p className="text-gray-500">No group members added yet. Add members to start planning your group trip.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupMembers.map(member => (
                    <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold text-lg">{member.name}</h4>
                        <div className="flex space-x-2">
                          <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors">
                            Edit
                          </button>
                          <button className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors">
                            Remove
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500">User ID: {member.addedBy}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {Object.entries(member.preferences).filter(([_, value]) => value).map(([key]) => {
                          const pref = preferenceOptions.find(p => p.key === key);
                          return pref ? (
                            <span key={key} className={`${pref.color} text-white px-2 py-1 rounded-full text-xs`}>
                              {pref.icon} {pref.label}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {groupMembers.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Group Consensus Recommendations</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4 shadow">
                    <h4 className="font-medium mb-2">🏛️ Cultural Heritage + 🍜 Food</h4>
                    <p className="text-sm text-gray-600">Visit Montmartre with guided tour and enjoy authentic French cuisine at local bistros</p>
                  </div>
                  <div className="bg-white rounded-lg p-4 shadow">
                    <h4 className="font-medium mb-2">⛰️ Adventure + 🛍️ Shopping</h4>
                    <p className="text-sm text-gray-600">Seine River cruise followed by shopping at Champs-Élysées boutiques</p>
                  </div>
                </div>
                <button className="mt-6 w-full px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium">
                  Generate Group Itinerary
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">AI</span>
                </div>
                <h3 className="text-xl font-bold">TripAI Planner</h3>
              </div>
              <p className="text-gray-400">Your intelligent companion for personalized travel experiences.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Personalized Itineraries</li>
                <li>AI Travel Companion</li>
                <li>Multi-Lingual Support</li>
                <li>Eco-Friendly Planning</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <div className="flex space-x-4">
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  🐦
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  📘
                </div>
                <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center hover:bg-gray-600 transition-colors cursor-pointer">
                  📸
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 TripAI Planner. All rights reserved. Powered by AI for unforgettable travel experiences.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
