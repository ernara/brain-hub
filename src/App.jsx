import { useState, useEffect } from 'react'

const LOCAL_KEY = 'brain-hub'

function App() {
  const [tabs, setTabs] = useState([])
  const [activeTab, setActiveTab] = useState(null)
  const [newTab, setNewTab] = useState('')
  const [newEntry, setNewEntry] = useState('')
  const [loading, setLoading] = useState(true) // new state

  // Load saved tabs from localStorage
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(LOCAL_KEY))
    if (stored) {
      setTabs(stored)
      setActiveTab(stored[0]?.name || null)
    }
    setLoading(false)
  }, [])

  // Save tabs to localStorage when they change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(tabs))
    }
  }, [tabs, loading])

  const addTab = () => {
    if (!newTab.trim()) return
    const tab = { name: newTab.trim(), entries: [] }
    setTabs([...tabs, tab])
    setActiveTab(tab.name)
    setNewTab('')
  }

  const addEntry = () => {
    if (!newEntry.trim()) return
    setTabs(tabs.map(tab =>
      tab.name === activeTab
        ? { ...tab, entries: [...tab.entries, newEntry.trim()] }
        : tab
    ))
    setNewEntry('')
  }

  // Show loading screen until tabs are ready
  if (loading) return <div className="text-white p-4">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 flex flex-col gap-4">
      <h1 className="text-3xl font-bold">🧠 My Brain Hub</h1>

      <div className="flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`px-4 py-1 rounded-full ${activeTab === tab.name ? 'bg-blue-600' : 'bg-gray-700'}`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="text-black px-2 py-1 rounded"
          value={newTab}
          onChange={e => setNewTab(e.target.value)}
          placeholder="New tab name"
        />
        <button onClick={addTab} className="bg-green-600 px-3 py-1 rounded">Add Tab</button>
      </div>

      {activeTab && (
        <>
          <div className="mt-4">
            <input
              className="text-black px-2 py-1 rounded w-full"
              value={newEntry}
              onChange={e => setNewEntry(e.target.value)}
              placeholder={`Add to "${activeTab}"`}
            />
            <button onClick={addEntry} className="bg-blue-600 mt-2 px-3 py-1 rounded">Add Entry</button>
          </div>

          <ul className="mt-4 list-disc list-inside">
            {tabs.find(t => t.name === activeTab)?.entries.map((entry, i) => (
              <li key={i}>{entry}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}

export default App
