import React, { useState, useEffect, useRef } from 'react';
import { BACKEND_URL } from './config';

const App = () => {
  const [userId] = useState(`user-${Date.now()}`); // simple user ID
  const [activeTab, setActiveTab] = useState('home');
  const [preferences, setPreferences] = useState({
    culturalHeritage: false,
    festivals: false,
    adventure: false,
    food: false,
    shopping: false,
  });
  const [budget, setBudget] = useState('moderate');
  const [itinerary, setItinerary] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [groupMembers, setGroupMembers] = useState([]);
  const [loading, setLoading] = useState({ itinerary: false, group: false, preferences: false });
  const chatEndRef = useRef(null);

  const preferenceOptions = [
    { key: 'culturalHeritage', label: 'Cultural Heritage', icon: '🏛️', color: 'bg-amber-500' },
    { key: 'festivals', label: 'Festivals & Events', icon: '🎪', color: 'bg-pink-500' },
    { key: 'adventure', label: 'Adventure & Outdoors', icon: '⛰️', color: 'bg-green-500' },
    { key: 'food', label: 'Food & Cuisine', icon: '🍜', color: 'bg-orange-500' },
    { key: 'shopping', label: 'Shopping', icon: '🛍️', color: 'bg-purple-500' }
  ];

  const budgetOptions = [
    { value: 'cheap', label: 'Budget Traveler', icon: '💰' },
    { value: 'moderate', label: 'Comfortable', icon: '💵' },
    { value: 'luxury', label: 'Luxury Experience', icon: '💎' }
  ];

  // Load preferences and group members on mount
  useEffect(() => {
    fetchPreferences();
    fetchGroupMembers();
  }, []);

  const fetchPreferences = async () => {
    setLoading(prev => ({ ...prev, preferences: true }));
    try {
      const res = await fetch(`${BACKEND_URL}/api/preferences/${userId}`);
      const data = await res.json();
      setPreferences(data.preferences || preferences);
      setBudget(data.budget || budget);
    } catch (err) {
      console.error("Failed to fetch preferences:", err);
    } finally {
      setLoading(prev => ({ ...prev, preferences: false }));
    }
  };

  const fetchGroupMembers = async () => {
    setLoading(prev => ({ ...prev, group: true }));
    try {
      const res = await fetch(`${BACKEND_URL}/api/group`);
      const data = await res.json();
      setGroupMembers(data);
    } catch (err) {
      console.error("Failed to fetch group members:", err);
    } finally {
      setLoading(prev => ({ ...prev, group: false }));
    }
  };

  const handlePreferenceChange = async (key) => {
    const newPrefs = { ...preferences, [key]: !preferences[key] };
    setPreferences(newPrefs);

    try {
      await fetch(`${BACKEND_URL}/api/preferences/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences: newPrefs, budget })
      });
    } catch (err) {
      console.error("Failed to save preferences:", err);
    }
  };

  const handleBudgetChange = async (newBudget) => {
    setBudget(newBudget);

    try {
      await fetch(`${BACKEND_URL}/api/preferences/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences, budget: newBudget })
      });
    } catch (err) {
      console.error("Failed to save budget:", err);
    }
  };

  const handleGenerateItinerary = async () => {
    setLoading(prev => ({ ...prev, itinerary: true }));
    try {
      const res = await fetch(`${BACKEND_URL}/api/itinerary/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ preferences, budget })
      });
      const data = await res.json();
      if (data.success) setItinerary(data.data.itinerary);
    } catch (err) {
      console.error("Failed to generate itinerary:", err);
    } finally {
      setLoading(prev => ({ ...prev, itinerary: false }));
      setActiveTab('itinerary');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: Date.now(), text: chatInput, sender: 'user' };
    setChatMessages(prev => [...prev, userMsg]);
    const messageToSend = chatInput;
    setChatInput('');

    try {
      const res = await fetch(`${BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend })
      });
      const data = await res.json();
      if (data.success) {
        const aiMsg = { id: Date.now() + 1, text: data.data.text, sender: 'ai' };
        setChatMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error("Chat failed:", err);
    }
  };

  const addGroupMember = async () => {
    const newMember = { name: `Traveler ${groupMembers.length + 1}`, preferences };
    try {
      const res = await fetch(`${BACKEND_URL}/api/group/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMember)
      });
      const data = await res.json();
      setGroupMembers(data.members || []);
    } catch (err) {
      console.error("Failed to add member:", err);
    }
  };

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-sans p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">TripAI Planner (React + FastAPI)</h1>
      
      {/* Tabs */}
      <div className="flex space-x-4 mb-6">
        {['home','preferences','itinerary','chat','group'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="bg-white rounded p-6 shadow">
        {activeTab === 'home' && (
          <div>
            <h2 className="text-2xl font-semibold mb-4">Welcome!</h2>
            <button onClick={() => setActiveTab('preferences')} className="px-4 py-2 bg-green-500 text-white rounded">
              Start Planning
            </button>
          </div>
        )}

        {activeTab === 'preferences' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Preferences</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {preferenceOptions.map(pref => (
                <div key={pref.key} onClick={() => handlePreferenceChange(pref.key)}
                     className={`p-4 rounded cursor-pointer border ${preferences[pref.key] ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                  {pref.icon} {pref.label}
                </div>
              ))}
            </div>

            <h3 className="font-semibold mb-2">Budget</h3>
            <div className="flex space-x-4 mb-4">
              {budgetOptions.map(opt => (
                <button key={opt.value} onClick={() => handleBudgetChange(opt.value)}
                        className={`px-3 py-1 rounded border ${budget === opt.value ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>

            <button onClick={handleGenerateItinerary} className="px-4 py-2 bg-green-500 text-white rounded">
              Generate Itinerary
            </button>
          </div>
        )}

        {activeTab === 'itinerary' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Itinerary</h2>
            {loading.itinerary ? <p>Loading...</p> :
              itinerary.map(day => (
                <div key={day.day} className="mb-4 p-4 border rounded">
                  <h3 className="font-bold">Day {day.day}</h3>
                  {day.activities.map((act, idx) => (
                    <div key={idx} className="ml-4">
                      <p>{act.time} - {act.activity} ({act.duration})</p>
                    </div>
                  ))}
                </div>
              ))
            }
          </div>
        )}

        {activeTab === 'chat' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">AI Chat</h2>
            <div className="h-64 overflow-y-auto p-2 border mb-2">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`${msg.sender === 'user' ? 'text-right' : 'text-left'} mb-2`}>
                  <span className={`inline-block px-2 py-1 rounded ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                    {msg.text}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)}
                     className="flex-1 p-2 border rounded" placeholder="Ask something..." />
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Send</button>
            </form>
          </div>
        )}

        {activeTab === 'group' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Group Members</h2>
            <button onClick={addGroupMember} className="mb-4 px-4 py-2 bg-green-500 text-white rounded">Add Member</button>
            {loading.group ? <p>Loading...</p> :
              groupMembers.map((member, idx) => (
                <div key={idx} className="p-2 border mb-2 rounded">
                  <p className="font-bold">{member.name}</p>
                  <p>Preferences: {Object.keys(member.preferences).filter(k => member.preferences[k]).join(', ') || 'None'}</p>
                </div>
              ))
            }
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
